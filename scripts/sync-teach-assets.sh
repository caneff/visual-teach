#!/bin/sh
# Syncs ./assets/ (canonical source) into .claude/skills/teach/assets/ (bundled
# distributable). Run this after any change to the component library so the
# bundled skill stays in lockstep with the source.
#
# The library is Base + per-component files (no aggregate bundle — see ADR 0009),
# so a plain copy is the whole sync.
#
# Usage: scripts/sync-teach-assets.sh

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$REPO_ROOT/assets"
DEST="$REPO_ROOT/.claude/skills/teach/assets"

cp -r "$SRC/." "$DEST/"

echo "Synced $SRC -> $DEST"
