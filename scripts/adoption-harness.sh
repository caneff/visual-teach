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
#   adoption-harness.sh build-homes                                    # (re)build both arm HOMEs
#   adoption-harness.sh run <control|treatment> <spec.md> <workspace>
#   adoption-harness.sh run-until-signal <control|treatment> <spec.md> <workspace>
#   adoption-harness.sh probe <workspace>                              # adoption verdict for a workspace
#
# Env:
#   ADOPTION_ROOT            where arm HOMEs live (default: $REPO/.adoption-harness)
#   MODEL                    model for both arms (default: sonnet); MUST match across arms
#   SIGNAL_TIMEOUT           hard timeout for run-until-signal, seconds (default: 600)
#   SIGNAL_POLL              poll interval for run-until-signal, seconds (default: 5)
#   SIGNAL_LESSON_MIN_BYTES  size threshold for "substantial" first lesson (default: 4096)
#   CANDIDATE                A/B the treatment's SKILL.md description: when set, the
#                            treatment arm reads scripts/adoption-candidates/$CANDIDATE.md
#                            instead of the live repo SKILL.md. Empty = live repo (default).
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT="${ADOPTION_ROOT:-$REPO/.adoption-harness}"
MODEL="${MODEL:-sonnet}"
CONTROL_HOME="$ROOT/home-control"
TREATMENT_HOME="$ROOT/home-treatment"
SIGNAL_TIMEOUT="${SIGNAL_TIMEOUT:-600}"
SIGNAL_POLL="${SIGNAL_POLL:-5}"
SIGNAL_LESSON_MIN_BYTES="${SIGNAL_LESSON_MIN_BYTES:-4096}"

build_homes() {
  for h in "$CONTROL_HOME" "$TREATMENT_HOME"; do
    rm -rf "$h"; mkdir -p "$h/.claude/skills"
    # Headless auth + onboarding/trust config, copied from the real HOME.
    cp ~/.claude/.credentials.json "$h/.claude/"
    cp ~/.claude.json "$h/"
    # teach-base — symlinked so both arms always test live repo state.
    # No need to rebuild homes after teach-base edits.
    ln -s "$REPO/.claude/skills/teach-base" "$h/.claude/skills/teach-base"
  done
  # Treatment only: visual-teach (SKILL.md + assets/) as symlinks — arm always
  # tests current repo state, no stale-copy chore. Credentials stay copies
  # (avoids creds-in-a-symlink smell). Control home omits this link; isolation preserved.
  local vt="$TREATMENT_HOME/.claude/skills/visual-teach"
  mkdir -p "$vt"
  # CANDIDATE swaps the description blob for the A/B (#211); empty = live repo SKILL.md.
  # ponytail: candidates are full-copy SKILL.md files (body duplicated). Fine while the
  # body is frozen during a run; splice candidate frontmatter onto the repo body if the
  # body starts changing mid-experiment.
  local skill_src="${CANDIDATE:+$REPO/scripts/adoption-candidates/$CANDIDATE.md}"
  skill_src="${skill_src:-$REPO/SKILL.md}"
  [[ -f "$skill_src" ]] || { echo "error: candidate not found: $skill_src" >&2; return 1; }
  ln -s "$skill_src" "$vt/SKILL.md"
  ln -s "$REPO/assets"   "$vt/assets"
  echo "built: $CONTROL_HOME (teach-base only)"
  echo "built: $TREATMENT_HOME (teach-base + visual-teach, SKILL.md=${CANDIDATE:-live-repo})"
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

_resolve_arm() {
  case "$1" in
    control)   echo "$CONTROL_HOME" ;;
    treatment) echo "$TREATMENT_HOME" ;;
    *) echo "error: arm must be control|treatment" >&2; return 1 ;;
  esac
}

run_arm() {
  local arm="$1" spec="$2" ws="$3"
  local home; home="$(_resolve_arm "$arm")" || return 1
  [[ -d "$home" ]] || { echo "error: run build-homes first" >&2; return 1; }
  rm -rf "$ws"; mkdir -p "$ws/lessons" "$ws/assets" "$ws/reference" "$ws/learning-records"
  cp "$spec" "$ws/SPEC.md"
  echo "=== $arm → $ws (model=$MODEL) ==="
  ( cd "$ws" && env HOME="$home" claude -p "$(prompt_for "$spec")" \
      --model "$MODEL" --dangerously-skip-permissions --output-format text )
}

# Recursively kill a process and all its children (depth-first, leaves first).
_kill_tree() {
  local pid="$1"
  kill -0 "$pid" 2>/dev/null || return 0
  local child
  for child in $(pgrep -P "$pid" 2>/dev/null || true); do
    _kill_tree "$child"
  done
  kill "$pid" 2>/dev/null || true
}

# Adoption signal: a vt-* reference in LESSON markup, not the seeded ./assets/.
# Firing the skill seeds vt-* into ./assets/ immediately, so a whole-workspace
# grep false-positives on the seed alone (#211). Scope to lessons/ so the signal
# means "used a vt-* block in a lesson", matching the adoption definition.
_vt_in_lessons() { grep -rIl 'vt-' "$1/lessons" 2>/dev/null || true; }

# Cheap fire/no-fire probe: launch an arm and stop it the moment adoption is
# decided — cheaper than a full `run`. Exits 0 on ADOPTED or NOT-ADOPTED;
# exits 1 on TIMEOUT.
#
# ADOPTED when:    a vt-* class reference appears in lessons/*.html.
# NOT-ADOPTED when: lessons/0001*.html exists, is substantial (> SIGNAL_LESSON_MIN_BYTES),
#                   and still no vt-* signal — arm has committed to bespoke.
run_until_signal() {
  local arm="$1" spec="$2" ws="$3"
  local home; home="$(_resolve_arm "$arm")" || return 1
  [[ -d "$home" ]] || { echo "error: run build-homes first" >&2; return 1; }
  rm -rf "$ws"; mkdir -p "$ws/lessons" "$ws/assets" "$ws/reference" "$ws/learning-records"
  cp "$spec" "$ws/SPEC.md"
  echo "=== $arm → $ws (model=$MODEL, mode=run-until-signal, timeout=${SIGNAL_TIMEOUT}s) ==="

  # Launch arm in background; suppress transcript output (only file state matters).
  ( cd "$ws" && env HOME="$home" claude -p "$(prompt_for "$spec")" \
      --model "$MODEL" --dangerously-skip-permissions --output-format text \
      > /dev/null 2>&1 ) &
  local claude_pid=$!

  local elapsed=0 verdict="" vt_hits="" first_lesson="" sz=0
  while kill -0 "$claude_pid" 2>/dev/null && [[ $elapsed -lt $SIGNAL_TIMEOUT ]]; do
    sleep "$SIGNAL_POLL"
    elapsed=$((elapsed + SIGNAL_POLL))

    # ADOPTED: a vt-* class reference written to a lesson.
    vt_hits="$(_vt_in_lessons "$ws")"
    if [[ -n "$vt_hits" ]]; then
      verdict="ADOPTED"; break
    fi

    # NOT-ADOPTED: first lesson is substantial with still no vt-* signal.
    first_lesson="$(find "$ws/lessons" -maxdepth 1 -name '0001*.html' 2>/dev/null | head -1)"
    if [[ -n "$first_lesson" ]]; then
      sz="$(stat -c%s "$first_lesson" 2>/dev/null || echo 0)"
      if [[ $sz -gt $SIGNAL_LESSON_MIN_BYTES ]]; then
        verdict="NOT-ADOPTED"; break
      fi
    fi
  done

  # Final probe if arm finished naturally before a signal was polled.
  if [[ -z "$verdict" ]] && ! kill -0 "$claude_pid" 2>/dev/null; then
    vt_hits="$(_vt_in_lessons "$ws")"
    if [[ -n "$vt_hits" ]]; then verdict="ADOPTED"; else verdict="NOT-ADOPTED"; fi
  fi

  # Terminate the arm (and its whole child tree) if still running.
  if kill -0 "$claude_pid" 2>/dev/null; then
    _kill_tree "$claude_pid"
  fi
  wait "$claude_pid" 2>/dev/null || true

  if [[ -z "$verdict" ]]; then
    echo "TIMEOUT — no signal within ${SIGNAL_TIMEOUT}s" >&2
    return 1
  fi

  case "$verdict" in
    ADOPTED)
      echo "ADOPTED"
      _vt_in_lessons "$ws" | sed 's|^|  |' || true
      ;;
    NOT-ADOPTED)
      echo "NOT-ADOPTED — first lesson substantial, no vt-* signal"
      ;;
  esac
}

probe() {
  local ws="$1"
  local hits; hits="$(_vt_in_lessons "$ws")"
  if [[ -n "$hits" ]]; then
    echo "ADOPTED — vt-* found in lessons:"; echo "$hits"
  else
    echo "NOT-ADOPTED — no vt-* in $ws/lessons"
  fi
}

cmd="${1:-}"; shift || true
case "$cmd" in
  build-homes)      build_homes ;;
  run)              run_arm "$@" ;;
  run-until-signal) run_until_signal "$@" ;;
  probe)            probe "$@" ;;
  *) echo "usage: $0 build-homes | run <control|treatment> <spec> <ws> | run-until-signal <control|treatment> <spec> <ws> | probe <ws>" >&2; exit 1 ;;
esac
