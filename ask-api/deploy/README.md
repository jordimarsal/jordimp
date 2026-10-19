# ask-api — deploy runbook

Operational guide for the production deployment at `https://api.jordimp.net`
(Cloudflare Tunnel → Docker on the homelab, GPU 1).

## What runs

| Service | Image (digest-pinned) | Role |
|---|---|---|
| `ask-embed` | ghcr.io/ggml-org/llama.cpp server-cuda | nomic-embed-text-v1.5 Q4_K_M, embeddings (`:8080`, GPU 1) |
| `ask-gen` | ghcr.io/ggml-org/llama.cpp server-cuda | **porter-qwen3.5-2b-ft Q4_K_M** (LoRA fine-tune of Qwen/Qwen3.5-2B — see `../finetune/README.md`), chat (`:8080`, GPU 1, thinking disabled via `LLAMA_ARG_CHAT_TEMPLATE_KWARGS`) |
| `ask-api` | built from `../Dockerfile` | FastAPI service; entrypoint waits → ingests → serves (`:8000`, host-only bind) |
| `cloudflared` | cloudflare/cloudflared | outbound tunnel connector (token in `.env`), CGNAT-safe |

Calibrated tuning is hardcoded in `docker-compose.yml`: `ASK_THRESHOLD=0.60`,
nomic task prefixes (`search_query:` / `search_document:`).

## Bring up

```bash
cd ask-api/deploy
cp .env.example .env          # then fill TUNNEL_TOKEN (+ model filenames if changed)
docker compose up -d --build  # rebuilds the image (code + vendored corpus)
docker compose logs -f ask-api   # wait for: "indexed N chunks" + "Uvicorn running"
```

The `ask-api` entrypoint waits for both model servers' `/health`, runs
`ask-api ingest` (idempotent — skips when the corpus hash matches), then serves.

## Verify

```bash
curl -s http://127.0.0.1:8000/api/health | jq
./scripts/verify-public.sh     # DNS + edge health + real ask + check-host proof
```

`verify-public.sh` is runnable from anywhere (it goes through the Cloudflare
edge — home network works despite CGNAT / no NAT loopback).

## Update the corpus

```bash
cd ask-api
./scripts/sync-corpus.sh       # re-vendor + redact contact data
docker compose -f deploy/docker-compose.yml up -d --build ask-api
```

The corpus is baked into the image, so a corpus change needs a rebuild; the
entrypoint re-ingests automatically (content hash changed).

## Swap / add models

1. Put the GGUF in `LLAMA_MODELS_DIR`
2. Update `EMBED_MODEL_FILE` / `GEN_MODEL_FILE` in `deploy/.env`
3. `docker compose up -d --build` — a different embed model label forces re-ingest
4. Re-calibrate: `ASK_THRESHOLD=0.99 docker compose exec ask-api ask-api eval`
   (prints every score), then set the real threshold and `eval` again

## Eval gate

```bash
# CI-reproducible (deterministic hash/echo, floor 0.70):
scripts/eval.sh
# Real models, full honesty pipeline (floor 0.85, measured 0.917):
docker compose exec ask-api ask-api eval
```

## Test a candidate generation model

`scripts/gen_bench_run.sh` A/B-benches a candidate GGUF **without touching
prod**: boots it on GPU 0, runs the golden + off-corpus battery through the
real pipeline (nomic + prefixes + citation policy), writes JSON with
covered / refused / honest / latency, and answers for side-by-side reading.

```bash
docker compose -f deploy/docker-compose.yml build ask-api   # once — the app image
scripts/gen_bench_run.sh qwen3-1.7b Qwen3-1.7B-Q4_K_M.gguf  # → evals/bench/*.json
```

Reference (2026-10-19, per-language prompts — the golden carries `lang:` keys):
Qwen3-4B-2507 Q4_K_M 21/21 p50 641ms (baseline, in prod) · Qwen3-1.7B Q4_K_M
19/21 · Q3_K_M 17/21 · LFM2.5-1.2B 15/21 (leaks off-corpus) · granite-4.0-1b
8/21 (leaks) · gemma-3-1b 3/21 · salamandra-2b-instruct 0/21 (never cites).
Verdict: keep the 4B; the 1.7B needs a citation-format fine-tune to qualify.
Swap for real = `GEN_MODEL_FILE` in `deploy/.env` + `docker compose up -d --build ask-gen`.

## Rotate the tunnel token

Zero Trust → Networks → Tunnels → `jordimp-homelab` → **Rotate token** → paste
the new token into `.env` → `docker compose up -d cloudflared`.

## Teardown / reboot

- `docker compose down` (add `-v` to also wipe the sqlite index volume)
- `restart: unless-stopped` everywhere: after a host reboot the whole stack
  comes back on its own (docker enabled at boot)

## Known trade-offs

- The 4B generator writes mostly-clean Catalan with occasional Spanish lexical
  leakage — accepted for this model size.
- `data/` (sqlite index) lives in the `ask_data` volume; rebuilding the image
  never loses it, the entrypoint only re-ingests when the corpus hash changes.
