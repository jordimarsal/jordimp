# jordimp.net

Personal portfolio site (EN/ES/CA) for Jordi Marçal Poy — senior backend engineer
(Java · Python · AI/LLM). Built with [Astro](https://astro.build) 5, styled in the
human-validated **A · Terminal** design (mono chrome, `$` prompts, `~/path`
crumbs, `●` timeline nodes), deployed to GitHub Pages at `https://jordimp.net`.

**Process:** built with [harness-standard](https://github.com/jordimarsal/harness-standard)
(Spec-Driven Development: leader / spec-author / implementer / reviewer, human
approval gates, Wekan mirror on board `jordimp`). See `docs/specs.md` for the
workflow and `harness/feature_list.json` for current feature status.

## Status

| Feature | Scope | State |
|---|---|---|
| F1 front-foundation | Astro scaffold, i18n, design tokens, content collections, projects pages | ✅ done |
| F2 site-pages | home, experience, skills, about, footer, 404, CV + print | review approved — completion gate pending |
| F3 seo-analytics | full SEO, JSON-LD, robots/sitemap, llms.txt, GoatCounter | pending |
| F4 deploy | GitHub Pages workflow, jordimp.net custom domain | pending |
| F5 qa-gate | Playwright smoke, Lighthouse ≥95 ×4, final QA, v0.1.0 | pending |

Later plans (see `docs/superpowers/specs/`): `status-api` (Java 25 / Spring Boot
4.1, live SSE dashboard) and `ask-api` (Python / FastAPI, RAG over the CV with a
local mini-LLM via llama.cpp).

## Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Start local dev server                       |
| `npm run build`   | Build the production site                    |
| `npm run preview` | Preview the production build                 |
| `npm run check`   | Run `astro check` diagnostics                |
| `npm test`        | Run unit tests (vitest, colocated `*.spec.ts`) |
| `bash harness/init.sh` | Harness environment gate (must be green) |

## Layout

- `src/content/` — typed trilingual content collections (Zod-validated JSON)
- `src/pages/[lang]/` — locale-prefixed routes (`/en/…`, `/es/…`, `/ca/…`)
- `docs/` — architecture, conventions, SDD process, verification, specs & plans
- `harness/` — feature list, per-feature specs, progress ledger, tools

## Conventions

TypeScript strict · named exports · no comments unless non-obvious why ·
conventional commits · `Result<T, E>` for expected failures / problem+json at
HTTP boundaries (services) · contact data only from `src/config.ts` — never a
phone number or street address. Details in `docs/conventions.md`.
