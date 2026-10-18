#!/usr/bin/env bash
# Sync the vendored ask-api corpus from workspace sources (sources stay read-only).
#
# The corpus mirrors the PUBLIC portfolio: CV documents + READMEs/ADRs of showcased
# repos. Private material (apply/, APUNTS.md, drafts, skillworks) is never copied,
# and contact data (email/phone) is redacted from the vendored copies.
set -euo pipefail

CV_ROOT="${CV_ROOT:-$HOME/Documents/CV}"
PROJECTS="$CV_ROOT/projects"
ASK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ASK_DIR/corpus/files"

copy() { # copy <source-path> <relative-dest>
  local src="$1" rel="$2"
  if [[ ! -f "$src" ]]; then
    echo "missing source: $src" >&2
    exit 1
  fi
  mkdir -p "$(dirname "$DEST/$rel")"
  cp "$src" "$DEST/$rel"
  sed -i -E \
    -e 's/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/[contact: jordimp.net]/g' \
    -e 's/(\+?34[ ]?)?[67][0-9]{2}[ ]?[0-9]{3}[ ]?[0-9]{3}/[contact: jordimp.net]/g' \
    "$DEST/$rel"
  echo "  $rel"
}

rm -rf "$DEST"
echo "Syncing ask-api corpus (with contact redaction):"
copy "$CV_ROOT/docs/CV_26.md"                       cv/CV_26.md
copy "$CV_ROOT/docs/CV_26_ATS.md"                   cv/CV_26_ATS.md
copy "$CV_ROOT/docs/CV_python_2026.md"              cv/CV_python_2026.md
copy "$PROJECTS/codebaserag/README.md"              repos/codebaserag.md
copy "$PROJECTS/codebaserag/docs/architecture.md"   repos/codebaserag-architecture.md
copy "$PROJECTS/kafka-adapter-telemetry/README.md"  repos/kafka-adapter-telemetry.md
for adr in "$PROJECTS/kafka-adapter-telemetry/docs/adr/"*.md; do
  copy "$adr" "repos/kafka-adr-$(basename "$adr")"
done
copy "$PROJECTS/redis-toolkit/README.md"            repos/redis-toolkit.md
copy "$PROJECTS/harness/README.md"                  repos/harness.md
copy "$PROJECTS/interview-simulator/README.md"      repos/interview-simulator.md
echo "Corpus synced to corpus/files"
