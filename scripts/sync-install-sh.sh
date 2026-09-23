#!/usr/bin/env bash
# Copies the canonical harness-standard install.sh into public/harness/.
# Source of truth: the harness-standard repo checkout at $HARNESS_SRC (default ../harness-standard).
set -euo pipefail
SRC="${HARNESS_SRC:-../harness-standard}/install.sh"
DST="public/harness/install.sh"
[ -f "$SRC" ] || { echo "missing $SRC — set HARNESS_SRC to the harness-standard checkout" >&2; exit 1; }
mkdir -p public/harness
cp "$SRC" "$DST"
chmod +x "$DST"
echo "synced $SRC -> $DST"
