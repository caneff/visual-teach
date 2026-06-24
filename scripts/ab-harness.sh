#!/usr/bin/env bash
# ab-harness.sh — snapshot the installed upstream /teach into live A/B arms.
#
# Produces two ephemeral skill directories in a temp dir (or --out):
#   <out>/control/   — upstream /teach, unmodified
#   <out>/patched/   — upstream /teach + upstream-patch/teach-pointer.patch
#
# These are regenerated per campaign from whatever /teach is installed right
# now, so the control arm tracks upstream as it evolves.  Nothing is committed
# except this script; the patch already exists from #177.
#
# Usage:
#   ./scripts/ab-harness.sh [--out <dir>]
#
# Environment:
#   TEACH_SKILL_PATH   Override the upstream /teach install location.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PATCH="$REPO_ROOT/upstream-patch/teach-pointer.patch"

# ── locate installed upstream /teach ─────────────────────────────────────────

find_upstream() {
  # Explicit override wins.
  if [[ -n "${TEACH_SKILL_PATH:-}" ]]; then
    if [[ -d "$TEACH_SKILL_PATH" ]]; then
      echo "$TEACH_SKILL_PATH"
      return 0
    fi
    echo "error: TEACH_SKILL_PATH='$TEACH_SKILL_PATH' is not a directory" >&2
    return 1
  fi

  local candidates=(
    "$HOME/.agents/skills/teach"
    "$HOME/.claude/skills/teach"
  )
  for p in "${candidates[@]}"; do
    if [[ -d "$p" ]]; then
      echo "$p"
      return 0
    fi
  done
  return 1
}

if ! UPSTREAM="$(find_upstream)"; then
  echo "error: upstream /teach skill not found." >&2
  echo "       Searched: ~/.agents/skills/teach  and  ~/.claude/skills/teach" >&2
  echo "       Set TEACH_SKILL_PATH=<path> to override." >&2
  exit 1
fi

# ── parse args ────────────────────────────────────────────────────────────────

OUT=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --out)
      if [[ $# -lt 2 ]]; then
        echo "error: --out requires an argument" >&2
        exit 1
      fi
      OUT="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      echo "Usage: $0 [--out <dir>]" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$OUT" ]]; then
  OUT="$(mktemp -d -t ab-harness-XXXXXX)"
fi

CONTROL="$OUT/control"
PATCHED="$OUT/patched"

mkdir -p "$CONTROL" "$PATCHED"

# ── snapshot ──────────────────────────────────────────────────────────────────

echo "Upstream: $UPSTREAM"
echo "Snapshotting into: $OUT"

cp -R "$UPSTREAM/." "$CONTROL/"
cp -R "$UPSTREAM/." "$PATCHED/"

# Apply the pointer patch.  The patch was produced from the mattpocock/skills
# repo root (--- a/skills/productivity/teach/SKILL.md), so strip 4 leading
# components to reach SKILL.md at the skill root.
if patch -p4 --dry-run -s -d "$PATCHED" < "$PATCH" 2>/dev/null; then
  patch -p4 -s -d "$PATCHED" < "$PATCH"
else
  echo "warning: patch does not apply cleanly — upstream SKILL.md may have" >&2
  echo "         changed.  Inspect the patch and re-generate if needed." >&2
  echo "         patch: $PATCH" >&2
  patch -p4 -d "$PATCHED" < "$PATCH" || true
fi

# ── done ─────────────────────────────────────────────────────────────────────

echo ""
echo "Done."
echo "  control : $CONTROL"
echo "  patched : $PATCHED"
