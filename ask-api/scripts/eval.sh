#!/usr/bin/env bash
# Retrieval eval gate. `--real` runs against the GPU llama-servers (uses env/config);
# default mode is deterministic (hash/echo) for CI-reproducible results.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [[ "${1:-}" == "--real" ]]; then
  uv run ask-api eval
else
  ASK_EMBED_BACKEND=hash ASK_GEN_BACKEND=echo uv run ask-api eval
fi
