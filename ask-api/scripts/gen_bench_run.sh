#!/usr/bin/env bash
# A/B bench for the ask-api generation model, without touching production.
#
# Boots a candidate llama-server on a spare GPU (default 0 — prod keeps GPU 1),
# joins the compose network, and runs the golden + off-corpus battery through
# the REAL pipeline (nomic embeddings with task prefixes + citation policy),
# mirroring the deploy env (threshold 0.55, top_k 6).
#
# Usage:
#   scripts/gen_bench_run.sh <label> <gguf-path-inside-BENCH_GGUF_DIR> [extra llama-server args...]
#   scripts/gen_bench_run.sh qwen3-1.7b Qwen3-1.7B-Q4_K_M.gguf --chat-template-kwargs '{"enable_thinking":false}'
#
# Env overrides: BENCH_GGUF_DIR (default /home/jordi/ia/llama/models),
#   BENCH_OUT_DIR (default evals/bench), BENCH_GPU (default 0),
#   BENCH_NETWORK (default ask-api_default), ASK_API_IMAGE (default ask-api:local).
#
# Output: evals/bench/<label>.json with covered_ok / refused_on_covered /
# off_corpus_honest / latency p50-p95, plus full per-question answers for
# side-by-side reading. Swap for real = GEN_MODEL_FILE in deploy/.env.
set -euo pipefail

LABEL="$1"; MODEL="$2"; shift 2

IMG="ghcr.io/ggml-org/llama.cpp:server-cuda@sha256:b4e561932a1dd460ec2f9d2875ad0d9535cbfd3d2d6a48bdb3c9d50804088bff"
GGUF_DIR="${BENCH_GGUF_DIR:-/home/jordi/ia/llama/models}"
OUT_DIR="${BENCH_OUT_DIR:-evals/bench}"
GPU="${BENCH_GPU:-0}"
NET="${BENCH_NETWORK:-ask-api_default}"
APP_IMG="${ASK_API_IMAGE:-ask-api:local}"
ASK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p "$ASK_DIR/$OUT_DIR"
docker rm -f bench-gen >/dev/null 2>&1 || true

docker run -d --name bench-gen --network "$NET" --gpus "\"device=$GPU\"" \
  -p "127.0.0.1:${BENCH_PORT:-8090}":8080 \
  -v "$GGUF_DIR":/models:ro \
  "$IMG" -m "/models/$MODEL" --ctx-size 4096 --n-gpu-layers 99 \
  --host 0.0.0.0 --port 8080 "$@" >/dev/null

cleanup() { docker rm -f bench-gen >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo ">> waiting for bench-gen ($LABEL) to load..."
loaded=0
for _ in $(seq 1 90); do
  if curl -fsS --max-time 3 "http://127.0.0.1:${BENCH_PORT:-8090}/health" >/dev/null 2>&1; then
    loaded=1; break
  fi
  sleep 2
done
if [[ "$loaded" != 1 ]]; then
  echo "bench-gen failed to start:" >&2
  docker logs bench-gen | tail -10 >&2
  exit 1
fi

docker run --rm --network "$NET" \
  -v "$ASK_DIR/scripts/gen_bench.py":/app/scripts/gen_bench.py:ro \
  -v "$ASK_DIR/$OUT_DIR":/work/out \
  -e ASK_EMBED_URL=http://ask-embed:8080 \
  -e ASK_GEN_URL=http://bench-gen:8080 \
  -e ASK_EMBED_QUERY_PREFIX='search_query: ' \
  -e ASK_EMBED_DOC_PREFIX='search_document:' \
  -e ASK_THRESHOLD=0.55 -e ASK_TOP_K=6 \
  --entrypoint python \
  "$APP_IMG" scripts/gen_bench.py --label "$LABEL" --out "/work/out/$LABEL.json"

echo ">> done: $LABEL -> $OUT_DIR/$LABEL.json"
