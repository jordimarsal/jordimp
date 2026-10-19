# jordimp.net

Personal portfolio site for Jordi Marçal Poy — senior backend engineer
(Java · Python · AI/LLM). Built with [Astro](https://astro.build) 7 and styled
in the human-validated **Jordimp & Co.** redesign: an interactive building
whose seven floors are the departments (research & retrieval, transport &
telemetry, tooling, inspections, people, operations, front desk). Night mode
included — **live at [jordimp.net](https://jordimp.net)** (GitHub Pages, custom
domain, auto TLS).

## Status

**v0.3.0 — 23/24 planned features shipped** (F1–F23; F24 spec'd and queued,
ledger in the git history): Astro scaffold + trilingual typed content, SEO /
llms.txt / analytics, GitHub Pages deploy, QA gates (Playwright · Lighthouse
CI · parity oracle), the **Jordimp & Co.** building redesign, blog, contact
desk, the harness skills highlight, and the **ask-api concierge in
production** — running its own fine-tuned 2B gen model (see Services).

## CI/CD — QA-gated deploys

Every push to `main` runs the QA pipeline in `.github/workflows/`; **deploys only
happen if all three jobs pass** (`deploy.needs: qa`):

- **e2e** — Playwright suite: 83-page sweep (splash, 404, 81 locale routes) with
  zero console errors + golden parity fixtures (titles, copy, plates, flags),
  interaction/behavior specs, < 120 s
- **content** — census + trilingual QA against `src/data`, no-phone scan,
  internal-link resolution gate, external-link check (3 attempts)
- **lighthouse** — `@lhci/cli` ×3 median per locale home: accessibility /
  best-practices / SEO ≥ **0.95**, performance ≥ **0.90** on CI runners
  (measured 1.0 locally; floor accounts for shared-runner variance)

All workflow actions are SHA-pinned; the pipeline runs with minimal
`contents:read` permissions.

## Commands

| Command                 | Action                                       |
| :---------------------- | :------------------------------------------- |
| `npm install`           | Install dependencies                         |
| `npm run dev`           | Start local dev server                       |
| `npm run build`         | Build the production site                    |
| `npm run preview`       | Preview the production build                 |
| `npm run check`         | Run `astro check` diagnostics                |
| `npm test`              | Unit tests (vitest, colocated `*.spec.ts`)   |
| `npm run test:e2e`      | Build + Playwright smoke suite               |
| `npm run qa:lighthouse` | Lighthouse CI gate (local thresholds ≥ 0.95) |
| `npm run qa:parity`     | Verify the committed parity oracle is fresh  |
| `npm run qa:guard`      | Build + verify the oracle (runs on `git push`) |
| `npm run qa:content`    | Content QA (no-phone + structure)            |
| `npm run qa:links`      | External-link check                          |

`npm install` / `npm ci` arms a tracked **pre-push hook** (`.githooks/pre-push` via
`core.hooksPath`, set by `scripts/install-hooks.mjs`) that runs `npm run qa:guard`.
Any change to markup or copy moves the distilled fixture, so a forgotten
`npm run distill:parity` blocks the push instead of turning `main` red on CI. It
skips itself when `node_modules` is absent; `git push --no-verify` bypasses it for a
single push (CI still gates the deploy).

## Layout

- `src/data/` — typed trilingual content module (`content.ts` + `types.ts`) — the single content source
- `src/pages/[lang]/` — locale-prefixed routes (`/en/…`, `/es/…`, `/ca/…`)
- `src/components/site/` — redesign components (building, navbar, footer desk, panels)
- `src/lib/` — pure cores (SEO, llms.txt, analytics, link classifier) + colocated specs
- `tests/` — Playwright suite + committed parity fixtures
- `docs/` — architecture, conventions, SDD process, verification, deploy checklist

**Process note:** built with Spec-Driven Development (leader / spec-author /
implementer / reviewer, human approval gates). The SDD harness (`harness/`,
`.opencode/`) is local-only and intentionally not tracked in this public
repository — the harness itself is public at
[github.com/jordimarsal/harness](https://github.com/jordimarsal/harness), and
its process ships as six standalone skills
(`npx skills add jordimarsal/harness`).

## Conventions

TypeScript strict · named exports · no comments unless non-obvious why ·
conventional commits · `Result<T, E>` for expected failures / problem+json at
HTTP boundaries (services) · contact data only from `src/config.ts` — never a
phone number or street address. Details in `docs/conventions.md`.

## Services

`ask-api` — **live at [api.jordimp.net](https://api.jordimp.net)** (Python 3.13 /
FastAPI, RAG over the public CV corpus with local models: nomic embeddings +
`porter-qwen3.5-2b-ft` via llama.cpp on a homelab GPU, served through a
Cloudflare Tunnel). The gen model is a LoRA fine-tune of Qwen3.5-2B trained on
the service's own citation gate — after a 16-model sweep where nothing smaller
held the contract ([post](https://jordimp.net/en/blog/sixteen-models-one-gate/) ·
[model on Hugging Face](https://huggingface.co/jordimarsal/Qwen3.5-2B-porter-GGUF)):
grounded answers with mandatory citations, honest not-covered path in EN/ES/CA,
rate limiting, problem+json. Source: [`ask-api/`](ask-api/) · fine-tune
pipeline: [`ask-api/finetune/`](ask-api/finetune/) · runbook:
[`ask-api/deploy/README.md`](ask-api/deploy/README.md). `status-api`
(Java 25 / Spring Boot 4.1, live SSE dashboard) is next.
