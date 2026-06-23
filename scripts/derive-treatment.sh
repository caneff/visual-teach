#!/bin/sh
# Derives an invocable treatment twin from .claude/skills/teach.
# The twin is teach with disable-model-invocation stripped — byte-identical
# except that one line — so it cannot drift from the source skill.
#
# Usage: scripts/derive-treatment.sh [target-dir]
# Default target: /tmp/teach-treatment

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${1:-/tmp/teach-treatment}"

rm -rf "$TARGET"
cp -r "$REPO_ROOT/.claude/skills/teach" "$TARGET"
sed -i '/^disable-model-invocation:/d' "$TARGET/SKILL.md"
echo "Treatment twin derived at: $TARGET"
