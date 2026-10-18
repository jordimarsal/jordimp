#!/usr/bin/env bash
# Public verification of https://api.jordimp.net: DNS, round-trips, external proof.
# Needs only curl, dig, python3 — runnable from anywhere (Cloudflare edge, so home works).
set -euo pipefail

HOST="${1:-api.jordimp.net}"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

echo "== 1. DNS (A records for ${HOST}) =="
ips="$(dig +short A "$HOST" | sort -u)"
if [[ -z "$ips" ]]; then
  fail "no A records for ${HOST}"
fi
echo "$ips"

echo "== 2. Health round-trip (via Cloudflare edge) =="
health="$(curl -fsS --max-time 15 "https://${HOST}/api/health")" || fail "health endpoint unreachable"
echo "${health}"

echo "== 3. Real ask round-trip =="
answer="$(curl -fsS --max-time 60 -X POST "https://${HOST}/api/ask" \
  -H 'Content-Type: application/json' \
  -d '{"question":"How many years of experience does Jordi have?","lang":"en"}')" \
  || fail "ask endpoint failed"
echo "${answer}"

echo "== 4. External proof (check-host.net, 3 nodes) =="
request_id="$(
  curl -fsS -H 'Accept: application/json' \
    "https://check-host.net/check-http?host=https%3A%2F%2F${HOST}%2Fapi%2Fhealth&max_nodes=3" \
    | python3 -c 'import json, sys; print(json.load(sys.stdin)["request_id"])'
)"
sleep 15
curl -fsS -H 'Accept: application/json' "https://check-host.net/check-result/${request_id}" \
  | python3 -c '
import json
import sys

result = json.load(sys.stdin)
ok = 0
for payload in result.values():
    if not payload:
        continue
    first = payload[0]
    if isinstance(first, list):  # check-http nests results: [[1, time, "OK", "200", ip]]
        first = first[0]
    if first == 1:
        ok += 1
print(f"external nodes ok: {ok}/{len(result)}")
sys.exit(0 if ok >= 2 else 1)
' || fail "external nodes could not reach https://${HOST}"

echo "PASS: https://${HOST} is live and answering"
