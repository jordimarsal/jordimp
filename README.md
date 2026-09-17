# jordimp.net

Personal portfolio site (EN/ES/CA) for Jordi Marçal Poy — senior backend engineer
(Java · Python · AI/LLM). Built with [Astro](https://astro.build) 7, styled in the
human-validated **A · Terminal** design (mono chrome, `$` prompts, `~/path`
crumbs, `●` timeline nodes), **live at [https://jordimp.net](https://jordimp.net)**
(GitHub Pages, custom domain, auto TLS).

## Status — v0.1.0

| Feature | Scope | State |
|---|---|---|
| F1 front-foundation | Astro scaffold, i18n, design tokens, content collections, projects pages | ✅ done |
| F2 site-pages | home, experience, skills, about, footer, 404, CV + print | ✅ done |
| F3 seo-analytics | full SEO, JSON-LD, robots/sitemap, llms.txt, GoatCounter (opt-in) | ✅ done |
| F4 deploy | GitHub Pages workflow, jordimp.net custom domain | ✅ done |
| F6 site-polish | external links `target=_blank` + `noopener noreferrer`, Terminal favicon set | ✅ done |
| F5 qa-gate | Playwright smoke, Lighthouse CI gate, content QA, release | ✅ done |

## CI/CD — QA-gated deploys

Every push to `main` runs the QA pipeline in `.github/workflows/`; **deploys only
happen if all three jobs pass** (`deploy.needs: qa`):

- **e2e** — Playwright smoke: 51 locale routes render, 404, root → `/en/`
  redirect, locale switcher, i18n (`lang`/`title`/`h1`), < 120 s
- **content** — no-phone scan over built HTML, external-link check (3 attempts),
  53-file structure inventory
- **lighthouse** — `@lhci/cli` ×3 median per locale home: accessibility /
  best-practices / SEO ≥ **0.95**, performance ≥ **0.90** on CI runners
  (measured 0.98 locally; floor accounts for shared-runner variance)

All workflow actions are SHA-pinned; the pipeline runs with minimal
`contents:read` permissions.

## Commands

| Command                 | Action                                        |
| :---------------------- | :-------------------------------------------- |
| `npm install`           | Install dependencies                          |
| `npm run dev`           | Start local dev server                        |
| `npm run build`         | Build the production site                     |
| `npm run preview`       | Preview the production build                  |
| `npm run check`         | Run `astro check` diagnostics                 |
| `npm test`              | Unit tests (vitest, colocated `*.spec.ts`)    |
| `npm run test:e2e`      | Build + Playwright smoke suite                |
| `npm run qa:lighthouse` | Lighthouse CI gate (local thresholds ≥ 0.95)  |
| `npm run qa:content`    | Content QA (no-phone + structure)             |
| `npm run qa:links`      | External-link check                           |

## Layout

- `src/content/` — typed trilingual content collections (Zod-validated JSON)
- `src/pages/[lang]/` — locale-prefixed routes (`/en/…`, `/es/…`, `/ca/…`)
- `src/lib/` — pure cores (SEO, llms.txt, analytics, link classifier) + colocated specs
- `tests/` — Playwright smoke suite
- `docs/` — architecture, conventions, SDD process, verification, deploy checklist

**Process note:** built with Spec-Driven Development (leader / spec-author /
implementer / reviewer, human approval gates). The SDD harness
(`harness/`, `.opencode/`) is local-only and intentionally not tracked in this
public repository.

## Conventions

TypeScript strict · named exports · no comments unless non-obvious why ·
conventional commits · `Result<T, E>` for expected failures / problem+json at
HTTP boundaries (services) · contact data only from `src/config.ts` — never a
phone number or street address. Details in `docs/conventions.md`.

## Later plans

`status-api` (Java 25 / Spring Boot 4.1, live SSE dashboard) and `ask-api`
(Python / FastAPI, RAG over the CV with a local mini-LLM via llama.cpp).
