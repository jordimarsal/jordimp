# jordimp.net

Personal portfolio site (EN/ES/CA) for Jordi Marçal Poy — senior backend engineer
(Java · Python · AI/LLM). Built with [Astro](https://astro.build) 7, styled in the
human-validated **Jordimp & Co.** redesign — an interactive building whose six
floors are the services (research & retrieval, transport & telemetry, tooling,
people, operations, front desk) — trilingual (EN/ES/CA), night mode included,
**live at [https://jordimp.net](https://jordimp.net)**
(GitHub Pages, custom domain, auto TLS).

## Status — v0.2.0

| Feature | Scope | State |
|---|---|---|
| F1 front-foundation | Astro scaffold, i18n, typed content, projects pages | ✅ done |
| F2 site-pages | home, experience, skills, about, footer, 404, CV + print | ✅ done |
| F3 seo-analytics | full SEO, JSON-LD, robots/sitemap, llms.txt, GoatCounter (opt-in) | ✅ done |
| F4 deploy | GitHub Pages workflow, jordimp.net custom domain | ✅ done |
| F6 site-polish | external links `target=_blank` + `noopener noreferrer`, favicon set | ✅ done |
| F5 qa-gate | Playwright suite, Lighthouse CI gate, content QA, release | ✅ done |
| F7 astro-redesign | Jordimp & Co. redesign ported 1:1 from the validated spike: building home, projects + 11 case pages, 6 department pages, CV, 404 art, splash root redirect, night mode | ✅ done (supersedes the v0.1.0 home and the `experience`/`about`/`skills` slugs, which now 404) |

## CI/CD — QA-gated deploys

Every push to `main` runs the QA pipeline in `.github/workflows/`; **deploys only
happen if all three jobs pass** (`deploy.needs: qa`):

- **e2e** — Playwright suite: 62-page sweep (splash, 404, 60 locale routes) with
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

- `src/data/` — typed trilingual content module (`content.ts` + `types.ts`) — the single content source
- `src/pages/[lang]/` — locale-prefixed routes (`/en/…`, `/es/…`, `/ca/…`)
- `src/components/site/` — redesign components (building, navbar, footer desk, panels)
- `src/lib/` — pure cores (SEO, llms.txt, analytics, link classifier) + colocated specs
- `tests/` — Playwright suite + committed parity fixtures
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
