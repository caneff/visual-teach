#!/bin/sh
# Syncs ./assets/ (canonical source) into .claude/skills/teach/assets/ (bundled
# distributable). Run this after any change to the component library so the
# bundled skill stays in lockstep with the source.
#
# visual-teach.css and visual-teach.js are aggregated bundles that the skill
# never seeds directly (it copies per-component files), so they are excluded.
#
# Usage: scripts/sync-teach-assets.sh

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$REPO_ROOT/assets"
DEST="$REPO_ROOT/.claude/skills/teach/assets"

cp -r "$SRC/." "$DEST/"
rm -f "$DEST/visual-teach.css" "$DEST/visual-teach.js"

echo "Synced $SRC -> $DEST"
