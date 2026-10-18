#!/usr/bin/env bash
# Container entrypoint: wait for the model servers, ingest if stale, then serve.
set -euo pipefail

wait_for() { # wait_for <name> <url>
  local name="$1" url="$2" attempt
  for attempt in "$(seq 1 120)"; do
    if python - "$url" <<'PY'
import sys
import urllib.request

try:
    with urllib.request.urlopen(sys.argv[1], timeout=2) as response:
        sys.exit(0 if response.status == 200 else 1)
except Exception:
    sys.exit(1)
PY
    then
      echo "[entrypoint] ${name} is up"
      return 0
    fi
    sleep 2
  done
  echo "[entrypoint] ${name} did not become healthy in time" >&2
  return 1
}

wait_for "embedder" "${ASK_EMBED_URL}/health"
wait_for "generator" "${ASK_GEN_URL}/health"

ask-api ingest

exec ask-api serve --host 0.0.0.0 --port 8000
