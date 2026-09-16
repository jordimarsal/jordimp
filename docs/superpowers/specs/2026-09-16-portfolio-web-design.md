# Portfolio Web — Design Spec

**Project:** `jordimp` (new repo at `~/Documents/CV/projects/jordimp`)
**Date:** 2026-09-16
**Status:** Draft for review
**Owner:** Jordi Marçal Poy

---

## 1. Goals & audience

A personal portfolio website that serves two audiences equally:

1. **HR recruiters / ATS screening** — clean executive layer: who, what, proven impact, downloadable CV.
2. **Tech leads / engineering managers** — technical depth: architecture, ADRs, tests, metrics, live demos.

Core narrative: *senior backend engineer (Java + Python) with a Data Science foundation and demonstrated AI/LLM proficiency.*

**The site itself is the strongest proof of the narrative**: a static modern front (TypeScript), a Java 25 / Spring Boot micro-backend serving a live SSE dashboard, a Python micro-backend serving a RAG chatbot over the CV with a local mini-LLM, rate-limited by a redis-toolkit-style limiter, all built with `harness-standard`.

### Success criteria

- Lighthouse ≥ 95 (Performance / Accessibility / Best Practices / SEO) on static pages.
- Static LCP < 1 s on broadband.
- Chatbot answers with citations in < 5 s (local GPU, mini-LLM).
- SSE dashboard pushes updates < 2 s after state change.
- Full content in EN (default), ES, CA.
- Graceful degradation: if the homelab APIs are down, the site remains fully usable with a clear "live demo offline" state.

### Non-goals (YAGNI)

- No CMS, no database for the site content (content = typed content collections in the repo).
- No user accounts. Analytics limited to GoatCounter (privacy-friendly page counts, no cookies).
- No classic ML demos (the 2019 DS repos stay as links only, not featured).
- No mobile app.

---

## 2. Architecture (Approach A — hybrid)

```
GitHub Pages (jordimp.dev)            Homelab (Docker, Caddy TLS)
┌────────────────────────┐            ┌────────────────────────────────┐
│ Astro static site      │            │ status-api   Java 25 / SB 4.1  │
│  · i18n: en/es/ca      │  HTTPS     │   GET /api/status              │
│  · projects, cv, about │ ─────────► │   GET /api/status/stream (SSE) │
│  · robots.txt          │            ├────────────────────────────────┤
│  · sitemap.xml         │            │ ask-api      Python / FastAPI  │
│  · llms.txt            │            │   POST /api/ask  → RAG + cites │
│  · JSON-LD, OG tags    │            │   llama.cpp mini-LLM (local)   │
└────────────────────────┘            │   token-bucket rate limiter    │
                                      └────────────────────────────────┘
```

- **Front**: [Astro](https://astro.build) static output on GitHub Pages. Why Astro: content collections (typed Markdown for projects/CV), first-class i18n routing, zero-JS by default (islands only for chat/dashboard widgets), excellent Lighthouse out of the box.
- **status-api (Java 25, Spring Boot 4.1)**: read-only liveness/health of the live services (itself, ask-api, llama-server) + system stats. In-memory state, no DB. Demonstrates idiomatic modern Java, SSE, virtual threads.
- **ask-api (Python 3.13, FastAPI)**: RAG over a curated corpus (CV ES/EN, project READMEs, ADRs). Retrieval with local embeddings + vector store; generation via local `llama-server` with a small instruct model. Citations included in every answer.
- **Transport**: front calls `https://api.jordimp.dev/*` (or `/api/*` path on same domain via Caddy). CORS pinned to the site origin. All traffic HTTPS.
- **Graceful degradation**: front fetches have short timeouts; on failure, widgets render static fallbacks ("live demo offline — see the repos"). APIs return `503` with a friendly payload when llama-server is down; retrieval falls back to BM25-style keyword search when embeddings are unavailable.

---

## 3. Site structure

```
/                     Hero: name, role tagline, 3 pillars, CTAs
                      (download CV · projects · ask the AI)
/en/projects/         Featured 5 (cards) + secondary grid; filters by stack
/en/projects/<slug>/  Problem → architecture → stack → metrics → links
                      (GitHub, ADRs, CI badge, diagrams)
/en/experience/       Timeline: Telefónica · Axpe/Mapfre · Zitro · Attendre
/en/skills/           Grouped: Backend · Data · AI/LLM · DevOps · Leadership
/en/live/             SSE dashboard (status-api widget)
/en/ask/              Chatbot UI (ask-api widget) — the "wow" page
/en/about/            Bio, values, ways of working, contact (mailto + socials)
/es/…  /ca/…          Mirror routes for each locale
404, legal, RSS(optional)
```

### Featured projects (tier 1 — one full page each)

| Project | Pitch | Proof |
|---|---|---|
| kafka-adapter-telemetry | Event-driven adapter telemetry: Kafka gateway + idempotent Oracle hub + SSE mission control | Java 25, SB 4.1, hexagonal, TDD, ADRs, CI diagrams |
| codebaserag | Hexagonal RAG over your own codebase, eval-first | Python 3.13, FastAPI, pgvector/Qdrant, recall@5 baseline gate |
| redis-toolkit | Rate limiting for LLM gateways, correct under concurrency | Java, Javalin, contract + concurrency tests |
| harness-standard | Standardized multi-agent harness for coding agents | installable, 7 stacks, SDD roles |
| mcp-transparent-png | MCP server for PNG transparency | Python, MCP protocol, CI |

### Secondary grid (tier 2 — card + link only)

interview-simulator, seekandemploy, jocut, md-mermaid-pdf, rustcut, spring-boot-casino, product-offers, viatgecio. Data-Science past (DL_snake_challenge, bible_text_analysis) listed under Skills/Data as historical links.

### Pre-work (blocker)

`codebaserag` and `interview-simulator` are **local-only**. Before featuring them: clean secrets/history, add README (EN), license, CI, and publish to GitHub `jordimarsal`.

---

## 4. Components

### 4.1 status-api (Java)

- Hexagonal-lite: `StatusController (web)` → `StatusService (domain)` → `Probe` port ← `HttpProbe`/`ProcessProbe` adapters.
- `GET /api/status` → JSON snapshot: `{ service, status, uptime_s, latency_ms, version }[]` + host meta.
- `GET /api/status/stream` → SSE, heartbeat every 15 s, event push on change (debounced ≥ 2 s).
- Probes run on a virtual-thread executor; timeouts aggressive (1 s) — a slow probe must never block the stream.
- Actuator health endpoint; SLF4J parameterized logging; no generic catch.

### 4.2 ask-api (Python)

- Ports/adapters: `AskController (FastAPI)` → `AskUseCase` → `Retriever` + `Generator` + `CitationPolicy` ports; adapters for llama.cpp (generation) and for the vector store — default **sqlite-vec** (zero extra services; a pgvector adapter is a possible v2 swap behind the same port).
- Corpus ingestion CLI (`ingest`): CV MD files + project READMEs/ADRs → chunked, embedded, stored. Deterministic — re-runnable in CI.
- `POST /api/ask {question, lang}` → `{answer, citations[], latency_ms}`. Citations are mandatory; if retrieval score < threshold the answer says "I don't have that in my CV" — it never invents.
- **Model policy**: a **dedicated, permanently-resident `llama-server` instance** with a **small dense model (≤ 4B, Q4 quant, target ≤ ~4 GB VRAM)** so the site's LLM coexists with the owner's interactive models on the RTX 5080. Candidates benchmarked at Phase 3 start over ~20 golden CV questions (Qwen3-4B-Instruct, Llama-3.2-3B, and any ≤ 2B contender); criteria: answer+citations < 5 s, citation faithfulness, VRAM footprint. Embeddings: `nomic-embed-text-v1.5` (already on the homelab).
- Token-bucket rate limiter (in-process first; Redis optional) → `429 + Retry-After`.
- `/api/health` for the status-api probe.

### 4.3 Front widgets

- `LiveDashboard.astro` island: connects SSE, renders service cards; reconnect with backoff; static fallback if unreachable.
- `AskChat.astro` island: chat UI, streams nothing (simple request/response first), renders citations as links; disabled state with message when API is offline.

---

## 5. Error handling

| Failure | Behaviour |
|---|---|
| ask-api / llama-server down | Front shows "live demo offline"; REST of site unaffected |
| Embeddings backend down | Retrieval falls back to keyword search (flagged in response meta) |
| Rate limit exceeded | `429 + Retry-After`; front shows friendly quota message |
| SSE connection lost | Exponential backoff reconnect, UI badge "reconnecting…" |
| Probe timeout | Service marked `degraded`, never blocks others |

---

## 6. Testing

- **status-api**: TDD — MockMvc unit tests for controller/service; Awaitility for SSE timing; wire-level contract test for the JSON shape (shared fixture with the front).
- **ask-api**: pytest + mypy `--strict` + ruff; deterministic retrieval evals over a golden set (like codebaserag) — CI gate fails if mean recall@5 drops below baseline; contract tests for the API schema.
- **Front**: `astro check` (TS), component smoke tests where valuable, one Playwright happy-path (home loads, dashboard renders fallback offline) — keep minimal.
- **CI (GitHub Actions)**: three workflows (front / java / python), mirroring harness-standard conventions; badge in README.

---

## 7. SEO & AI discoverability

- `robots.txt`: allow all, points to sitemap.
- `sitemap.xml`: generated by Astro per locale.
- Meta: unique `title`/`description` per page; Open Graph + Twitter cards (project pages get a generated OG image later — v2).
- **JSON-LD**: `Person` (home, about), `WebSite` with `SearchAction` omitted (no search), `BreadcrumbList` on nested pages.
- **`llms.txt`** (root): structured summary — who, skills, featured projects with links, contact. **`llms-full.txt`**: expanded version (full project sheets + experience). This is the "robots.txt for AIs".
- Canonical URLs per locale; `hreflang` alternates.
- **Analytics**: GoatCounter (free, non-commercial) — one script, no cookies, no consent banner needed under GDPR legitimate-interest rules it operates under.

---

## 8. Visual style

Modern, clean, recruiter-legible, with a backend-engineer identity:

- **Dark/light theme**, follows system, manual toggle, no flash (inline script).
- **Personal identity**: monogram avatar ("JM") styled to the site palette — no photo in hero; optional small photo on about only if wanted later.
- **Typography-first**: one strong sans for headings/body (e.g., Inter or system stack) + monospace accents for stack tags, metrics, and code snippets — the "engineer" signature.
- **Single accent color** (electric teal or amber on dark neutral background); everything else grayscale discipline.
- Generous whitespace, 8-pt grid, max-width ~72ch for prose.
- Subtle motion only: fade/slide on scroll (CSS only), no parallax, no heavy animation libs.
- Cards with 1-px borders and soft elevation — consistent with the SSE dashboard cards so live widgets don't look bolted on.
- Responsive mobile-first; print stylesheet for the CV page (nice touch for recruiters).

---

## 9. Deployment & operations

- **Front**: GitHub Actions → GitHub Pages, custom domain **`jordimp.net`** (owned). Site at `jordimp.net`, APIs at `api.jordimp.net` (Caddy TLS). HTTPS enforced via GitHub Pages "Enforce HTTPS" + Caddy auto-redirect.
- **Backends**: one `docker-compose.yml` on the homelab behind Caddy (TLS, `api.<domain>`), `restart: unless-stopped`, healthchecks wired to compose.
- Secrets via `.env` (git-ignored); no secrets in repo — verified in review.
- status-api watches ask-api + llama-server; optional external uptime ping (Uptime-Kuma already in homelab) — v2.

---

## 10. Build process

Constructed with **harness-standard** (Leader / Spec Author / Implementer / Reviewer, SDD). Phasing:

| Phase | Deliverable |
|---|---|
| 0. Pre-work | Publish codebaserag + interview-simulator; buy domain; content draft (EN) |
| 1. Front core | Astro scaffold, design system, i18n EN/ES/CA, projects+experience content, SEO files, deploy to Pages |
| 2. status-api | Java service + SSE + compose + Caddy; dashboard island with fallback |
| 3. ask-api | RAG corpus, evals, chatbot island; rate limiter |
| 4. Polish | Lighthouse pass, OG images, llms.txt, print CV, 404, launch |

Each phase is independently shippable; the site is useful from Phase 1 on.

---

## 11. Resolved decisions

1. Domain: **`jordimp.net`** (owned). Site at `jordimp.net`, APIs at `api.jordimp.net`.
2. Personal identity: **monogram avatar (JM)**, no photo in hero.
3. Contact: **mailto (pre-filled subject) + LinkedIn + GitHub** in about + footer. No form.
4. Chatbot model: **benchmark small models at Phase 3 start**, with the constraint that the chosen model is **small and permanently hosted** on the homelab (≤ 4B dense, Q4, ≤ ~4 GB VRAM, dedicated `llama-server`).
5. Analytics: **GoatCounter** (no cookies, one script).
