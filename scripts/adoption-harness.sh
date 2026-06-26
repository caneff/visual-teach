#!/usr/bin/env bash
# adoption-harness.sh — measure visual-teach auto-fire adoption (#180).
#
# Runs one (arm × subject) cell as a FRESH, ISOLATED headless `claude -p`
# subagent. Isolation is by custom $HOME: each arm gets its own skill root, so
# the control arm has *zero* visual-teach discoverable while teach-base is
# present for both. The Claude Code Agent tool cannot scope skills per run
# (subagents inherit the full session skill set), so a headless subprocess with
# a purpose-built HOME is the only mechanism that gives verifiable
# zero-accessibility — and every `claude -p` is inherently a fresh, stateless
# subagent (no shared conversation state across runs or arms).
#
# Verified isolation (build-homes then probe):
#   control  HOME → visual-teach: NOT FOUND, teach-base: RESOLVED
#   treatment HOME → visual-teach: RESOLVED, teach-base: RESOLVED
#
# The prompt is identical for both arms and NEVER mentions visual-teach. The
# treatment arm "adopts" only if it discovers and invokes visual-teach on its
# own. Hard gate: `grep -ril 'vt-' <control-workspace>` must be empty.
#
# Usage:
#   adoption-harness.sh build-homes              # (re)build both arm HOMEs
#   adoption-harness.sh run <control|treatment> <spec.md> <workspace>
#   adoption-harness.sh probe <workspace>        # adoption verdict for a workspace
#
# Env:
#   ADOPTION_ROOT  where arm HOMEs live (default: $REPO/.adoption-harness)
#   MODEL          model for both arms (default: sonnet); MUST match across arms
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT="${ADOPTION_ROOT:-$REPO/.adoption-harness}"
MODEL="${MODEL:-sonnet}"
CONTROL_HOME="$ROOT/home-control"
TREATMENT_HOME="$ROOT/home-treatment"

build_homes() {
  for h in "$CONTROL_HOME" "$TREATMENT_HOME"; do
    rm -rf "$h"; mkdir -p "$h/.claude/skills"
    # Headless auth + onboarding/trust config, copied from the real HOME.
    cp ~/.claude/.credentials.json "$h/.claude/"
    cp ~/.claude.json "$h/"
    # teach-base (frozen control pedagogy) — present in BOTH arms.
    cp -R "$REPO/.claude/skills/teach-base" "$h/.claude/skills/"
  done
  # Treatment only: the CURRENT repo visual-teach (SKILL.md at repo root +
  # repo assets/), NOT the stale globally-installed copy. Discoverable but the
  # workspace assets/ stays empty — the agent must seed on its own if it adopts.
  local vt="$TREATMENT_HOME/.claude/skills/visual-teach"
  mkdir -p "$vt"
  cp "$REPO/SKILL.md" "$vt/SKILL.md"
  cp -R "$REPO/assets" "$vt/assets"
  echo "built: $CONTROL_HOME (teach-base only)"
  echo "built: $TREATMENT_HOME (teach-base + visual-teach)"
}

# The shared, visual-teach-agnostic authoring prompt. Identical for both arms.
prompt_for() {
  local spec="$1"
  cat <<EOF
You are authoring a self-contained teaching course non-interactively. Treat the
current directory as the teaching workspace.

The course is fully specified in SPEC.md (already in this directory). Read it.
It pins the mission and a fixed lesson plan (titles, topics, scope). Do NOT
deviate from the plan, do NOT ask any questions, and do NOT interview anyone —
fill any gaps with sensible defaults.

Invoke the \`teach-base\` skill and follow its pedagogy and workspace
conventions. Then produce the complete course in one pass:

- Write MISSION.md from SPEC.md's mission (teach-base MISSION-FORMAT).
- Populate RESOURCES.md with real, verified high-trust sources. Never invent URLs.
- Author exactly the lessons listed in SPEC.md's plan, as beautiful self-contained
  HTML files in ./lessons/ (0001-*.html, 0002-*.html, ...), one per planned
  lesson, in order, following every teach-base lesson rule (shared stylesheet in
  ./assets/, citations, a primary source, a recall/practice feedback loop, a
  followup reminder, anchor links between lessons).
- Create at least one reference document in ./reference/.
- Write learning-records/0001-*.md noting the course was bootstrapped from SPEC.md.

Author the best course you can. Report the files you created when done.
EOF
}

run_arm() {
  local arm="$1" spec="$2" ws="$3" home
  case "$arm" in
    control)   home="$CONTROL_HOME" ;;
    treatment) home="$TREATMENT_HOME" ;;
    *) echo "error: arm must be control|treatment" >&2; return 1 ;;
  esac
  [[ -d "$home" ]] || { echo "error: run build-homes first" >&2; return 1; }
  rm -rf "$ws"; mkdir -p "$ws/lessons" "$ws/assets" "$ws/reference" "$ws/learning-records"
  cp "$spec" "$ws/SPEC.md"
  echo "=== $arm → $ws (model=$MODEL) ==="
  ( cd "$ws" && env HOME="$home" claude -p "$(prompt_for "$spec")" \
      --model "$MODEL" --dangerously-skip-permissions --output-format text )
}

probe() {
  local ws="$1"
  local hits; hits="$(grep -ril 'vt-' "$ws" 2>/dev/null || true)"
  local n; n="$({ grep -rohl 'vt-' "$ws" 2>/dev/null || true; } | wc -l)"
  if [[ -n "$hits" ]]; then
    echo "ADOPTED — vt-* found in:"; echo "$hits"
  else
    echo "NOT-ADOPTED — no vt-* anywhere in $ws"
  fi
}

cmd="${1:-}"; shift || true
case "$cmd" in
  build-homes) build_homes ;;
  run)         run_arm "$@" ;;
  probe)       probe "$@" ;;
  *) echo "usage: $0 build-homes | run <control|treatment> <spec> <ws> | probe <ws>" >&2; exit 1 ;;
esac
