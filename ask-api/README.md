# ask-api

RAG assistant for [jordimp.net](https://jordimp.net): answers questions about
Jordi's professional profile **grounded only in a curated public corpus**, with
**local models** (llama.cpp — nomic embeddings + a small instruct GGUF) and
**mandatory citations**. If the corpus doesn't cover a question, it says so —
in English, Spanish or Catalan.

Live at `https://api.jordimp.net` (Cloudflare Tunnel → Docker on the homelab).

## Contract

| Route | What it does |
|---|---|
| `POST /api/ask` | `{ "question": "…≤500 chars", "lang": "en\|es\|ca" }` → answer + citations, or the honest not-covered reply |
| `GET /api/health` | index freshness + upstream reachability (cached 10 s) |
| `GET /` | service descriptor |

Covered answers carry `covered: true` and citations that point to real corpus
sources (`source`, `title`, `heading`) — every citation resolves to a chunk the
model actually saw. Uncovered or uncited outputs never reach the user as facts:
the API returns the fixed not-covered copy for the requested language.

Errors are RFC 9457 `application/problem+json`: `422` invalid request,
`429` rate-limited (per-IP token bucket, `Retry-After`) or busy (global
concurrency gate), `503` upstream model unavailable. Access logs record route,
status and latency — **never the question text**.

## Architecture (hexagonal)

```
                 ┌──────────────────── core (pure, deterministic) ───────────────────┐
question ──────► │ chunking · retrieval (threshold) · prompt · citation policy       │
                 │ Result[Answer, AskError] — AskError = BelowThreshold |            │
                 │                            CitationMissing | IndexStale           │
                 └───────────────▲───────────────────────────────┬───────────────────┘
                                 │ ports                         │
              ┌──────────────────┴─────────┐        ┌────────────▼───────────────┐
              │ adapters                   │        │ adapters                   │
              │ · llama.cpp (httpx)        │        │ · sqlite-vec (atomic       │
              │   /v1/embeddings + /v1/    │        │   rebuild, cosine, meta)   │
              │   chat/completions         │        │ · deterministic (hash/     │
              │ · UpstreamError → 503      │        │   echo) for tests & CI     │
              └────────────────────────────┘        └────────────────────────────┘
```

- **Core never sees transport.** Expected failures are values (`Ok`/`Err`,
  closed `AskError` union); exceptions are reserved for invariant violations
  (`UpstreamError` is translated once at the API boundary → 503).
- **Backends are selected by config** (`ASK_EMBED_BACKEND=llama|hash`,
  `ASK_GEN_BACKEND=llama|echo`): the deterministic hash/echo adapters power the
  unit suite and the CI eval gate — no GPU, no network, reproducible.

## Corpus

`corpus/manifest.yaml` is the single source of what the assistant may answer
from: the three public CV documents plus READMEs/ADRs of showcased repos
(~210 chunks at 900 chars / 150 overlap, heading-scoped).

`scripts/sync-corpus.sh` re-vendors the files from the workspace **and redacts
contact data** (email/phone → `[contact: jordimp.net]`). Private material
(`apply/`, interview notes, drafts) is never copied.

## Run it

Local (deterministic, no GPU needed):

```bash
uv sync
ASK_EMBED_BACKEND=hash ASK_GEN_BACKEND=echo uv run ask-api ingest
ASK_EMBED_BACKEND=hash ASK_GEN_BACKEND=echo uv run ask-api check
uv run pytest            # 108 tests
```

With local models (llama-server on `:8080` embeddings, `:8081` generation):

```bash
uv run ask-api ingest && uv run ask-api serve
curl -s localhost:8000/api/ask -H 'Content-Type: application/json' \
  -d '{"question":"What is CodebaseRAG?","lang":"en"}'
```

Production: `deploy/docker-compose.yml` — `ask-embed` + `ask-gen`
(llama.cpp CUDA images pinned to GPU 1), `ask-api` (non-root, ingest-then-serve
entrypoint), `cloudflared` (outbound-only tunnel; works behind CGNAT, which is
why this replaces the classic port-forward). Copy `deploy/.env.example` to
`deploy/.env` and fill it in. Verify from outside with
`scripts/verify-public.sh` (DNS + health + real ask + check-host.net proof).

## Eval gate

`evals/golden.yaml` commits a retrieval floor: golden questions in en/es/ca
must retrieve their expected source within top-k, and off-corpus questions
must stay below the threshold (honest refusals). Run it:

```bash
ASK_EMBED_BACKEND=hash ASK_GEN_BACKEND=echo uv run ask-api eval
```

- hash mode (CI): floor `0.70`, measured baseline `0.75` — the deterministic
  embedder is lexical, so this gate is for **regression detection**.
- real mode (nomic): floor `floor_real` (`0.80`, calibrated at first real run)
  — `scripts/eval.sh --real` runs the same gate against the GPU servers.

## Spec & process

Built with Spec Driven Development (harness): requirements R1–R28, design and
tasks T1–T24 in `harness/specs/ask-api/` (local, gitignored by convention).
Quality gates: `pytest` (108 tests), `ruff`, `black`, `mypy --strict`.

## Privacy

- The API serves only the vendored public corpus; contact data is redacted.
- No question text is ever logged; rate limiting keys on the client IP via
  `X-Forwarded-For` (set by the Cloudflare edge).
- Answers without citations are replaced by the honest not-covered copy.
