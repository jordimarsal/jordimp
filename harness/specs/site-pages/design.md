# Design: site-pages (F2)

Implements plan Tasks 8–10 of
`docs/superpowers/plans/2026-09-16-portfolio-phase0-1-front.md` (home, content
pages + footer/404, CV page) under the project design spec
`docs/superpowers/specs/2026-09-16-portfolio-web-design.md`, `docs/architecture.md`
(static-first, typed content, I/O at the edges) and `docs/conventions.md`.

Visual language: **Direction A · Terminal**, the human-validated mockup at
`.superpowers/brainstorm/2592977-1789577129/content/style-A-pages.html` (bound
as ADR-1). F1 foundation is reused untouched where possible: `tokens.css`
palette, `global.css` utilities (`.container/.prose/.card/.chip/.mono/.muted`),
`BaseLayout` props contract, `L()`/`ui`/`SITE`, content schemas, `ProjectCard`,
`LocaleSwitcher`, `Monogram`, `ThemeToggle`.

Conditional modules: `docs/architecture-options.md` and
`harness/decisions/_template.md` do not exist in this repo, so no architecture
catalog is consulted and no ADR copies are stored under `harness/decisions/`.

---

## Files to create

**Components**
- `src/components/HeaderNav.astro` — the five nav links (`nav.*` keys) with build-time `aria-current="page"` for the link matching the `path` prop (ADR-3).
- `src/components/Footer.astro` — `footer.contact` links (pre-filled mailto, GitHub, LinkedIn), `footer.builtWith`, `© {year} {SITE.name}`; scoped styles (ADR-4).

**Content (fills the existing F1 schemas — no schema change, ADR-5)**
- `src/content/experience/telefonica-open-gateway.json` — `order: 1`, `current: true`, period `2022–present`; role "Backend Engineer — Microservicios & Automatización" (localized); points = plan Task 9 facts (REST microservice adapters for Open Gateway; 12+ tool Python CLI suite operating ~90 adapters across 4 countries; automatic OpenAPI Swagger v2/v3 code generation + CI-integrated docs & diagrams); stack `Java, Spring Boot, Python, Kafka, CI/CD`.
- `src/content/experience/axpe-mapfre.json` — `order: 2`, period `Jan–May 2026`; tech-modernization of 39 corporate APIs to Node.js 24; stack `Node.js 24, TypeScript, REST`.
- `src/content/experience/zitro.json` — `order: 3`, period `2020–2022`; betting-engine Java server, Backoffice, online-casino integrations; S2S sign-in, AWS Snowflake + Cassandra historicals, OneSignal; stack `Java, Spring, AWS, Cassandra, Snowflake`.
- `src/content/experience/attendre.json` — `order: 4`, period `2017–2020`; Attend® (tickets/inventory/projects) + License Manager (Spring Boot 2.3 + REST); stack `Java, Spring Boot, REST`.
- `src/content/skills/backend-apis.json` — `order: 1`; items: Java 11/21/25, Spring Boot 4, Python, FastAPI, Node.js, TypeScript, REST, OpenAPI, Kafka, RabbitMQ.
- `src/content/skills/data.json` — `order: 2`; items: SQL (Oracle/MySQL/SQLServer), MongoDB, Redis, Cassandra, Snowflake, Machine Learning, pandas/scikit-learn.
- `src/content/skills/ai-llms.json` — `order: 3`; items: RAG & vector search, MCP, llama.cpp local inference, agents & evals, prompt engineering.
- `src/content/skills/devops-quality.json` — `order: 4`; items: Docker, Kubernetes, AWS Lambda/CDK/CloudFormation, GitHub Actions, Jenkins, SonarQube, SonarLint, Testcontainers, pytest, JUnit/Mockito.
- `src/content/skills/leadership.json` — `order: 5`; items: team coordination, code review culture, mentoring, conflict resolution.

Group titles localized (en/es/ca); item names stay technical English.

**Pages**
- `src/pages/[lang]/experience.astro` — timeline: left-border list, `●` node per entry (accent, emphasized + label on the `current` one), mono period, company h2, points ul, stack chips.
- `src/pages/[lang]/skills.astro` — grid of 5 `.card.skill-group` cards ordered by `order`.
- `src/pages/[lang]/about.astro` — `prose` bio (3 paragraphs from `about.bio.p1–p3`), values card (`about.values.title` + `about.value.1–4`), contact block styled as shell commands (`mail -s "Portfolio contact" …`, `curl`-style GitHub/LinkedIn lines) with the exact three links.
- `src/pages/[lang]/cv.astro` — h1 `./CV`, download buttons (`download` attr) + print button (`window.print()`, class `no-print`), on-page summary (compact experience + skill groups), `getStaticPaths` over `LOCALES`.
- `src/pages/404.astro` — root-level, EN, through `BaseLayout`: `notfound.title`, `notfound.body`, `./404` h1, link to `/en/` (ADR-7).
- `public/cv/Jordi-Marcal-Poy-CV-EN.pdf`, `public/cv/Jordi-Marcal-Poy-CV-ES.pdf` — copied verbatim from `~/Documents/CV/CV Jordi Marçal 2026-09 Senior {EN,ES}.pdf` (both verified present).

**Tests (implementer-authored, colocated)**
- `src/content/experience.spec.ts` — 4 entries, order 1–4, exactly one `current`, trilingual role/points, phone canary (R9, R16).
- `src/content/skills.spec.ts` — 5 groups in fixed order, trilingual group titles, non-empty items, phone canary (R12, R16).
- Exact-value assertions for the fixed `hero.role` strings and new keys extend the colocated ui/i18n specs (R25).

## Files to modify

- `src/layouts/BaseLayout.astro` — render **slot fallbacks**: `<slot name="logo"><Monogram /></slot>`, `<slot name="nav"><HeaderNav {lang} {path} /></slot>`, `<slot name="actions"><LocaleSwitcher {lang} {path} /></slot>`, `<slot name="footer"><Footer {lang} /></slot>`. `Props` contract unchanged (ADR-2).
- `src/i18n/ui.ts` — fix `hero.role` es/ca (controller ruling); add `projects.featured`, `notfound.back`, `about.bio.p1`–`p3`, `about.value.1`–`4` (trilingual; `en as const` defines the extended `UiKey`) (ADR-6).
- `src/pages/[lang]/index.astro` — replace the F1 placeholder with the home: hero (h1 `SITE.name`, `$` prompt line + block cursor, tagline), 3 CTAs, pillars grid, featured strip (3 `ProjectCard`s + see-all link). Header chrome and footer come from the BaseLayout fallbacks.
- `src/styles/global.css` — add `@media print` block (hide `header`, `footer`, `.no-print`; black-on-white body) and the shared `.section-h2::before { content: '## '; }` Terminal chrome. All other new styles stay scoped in their components/pages (conventions: file + styles together).

No F1 page (`projects/index`, `projects/[slug]`) is edited: the slot fallbacks
give them the new chrome automatically (R8).

---

## Public signatures

```ts
// src/components/HeaderNav.astro
interface Props { lang: Locale; path?: string }
// renders: nav > a ×5 (projects, experience, skills, about, cv)
// active: aria-current="page" where `/{lang}/{route}/` === `/{lang}/{path}` (prefix match on the first segment)

// src/components/Footer.astro
interface Props { lang: Locale }
// renders: footer > contact links (mailto?subject=Portfolio%20contact, GitHub, LinkedIn) + builtWith + © {year} {SITE.name}

// src/layouts/BaseLayout.astro — Props unchanged:
interface Props { lang: 'en' | 'es' | 'ca'; title: string; description: string; path?: string }
```

New `ui` keys (strict `UiKey`, trilingual):

```ts
'projects.featured'  // en "Featured work" / es "Trabajo destacado" / ca "Treball destacat"
'notfound.back'      // en "Back to home" / es "Volver al inicio" / ca "Tornar a l'inici"
'about.bio.p1' | 'about.bio.p2' | 'about.bio.p3'   // bio paragraphs (professional profile)
'about.value.1' | 'about.value.2' | 'about.value.3' | 'about.value.4'
// values: SOLID/Clean Code/TDD daily practice · Tell Don't Ask + immutability +
// semantic types · I/O at the edges, pure deterministic logic · knowledge sharing & mentoring
'hero.role'          // es fixed to "Ingeniero Backend Senior"; ca to "Enginyer de Software Backend Sènior"
```

Routing (Astro static, `getStaticPaths` over `LOCALES` unless noted):

| Source | Route |
|---|---|
| `[lang]/index.astro` | `/{lang}/` (replaces placeholder) |
| `[lang]/experience.astro` | `/{lang}/experience/` |
| `[lang]/skills.astro` | `/{lang}/skills/` |
| `[lang]/about.astro` | `/{lang}/about/` |
| `[lang]/cv.astro` | `/{lang}/cv/` |
| `404.astro` | `/404.html` (GitHub Pages unknown-path fallback) |
| `public/cv/*.pdf` | `/cv/*.pdf` (verbatim copy) |

Featured-strip sort (deterministic): `featured && year desc, then name asc` →
`codebaserag, harness-standard, kafka-adapter-telemetry` (all 2026).

---

## Exceptions and error cases

| Case | Behavior | Requirement |
|---|---|---|
| New content JSON violates its Zod schema (missing locale, bad type) | `npm run build` fails with a Zod error naming the file | R9, R12 |
| Phone number (9-digit run) in a new content entry or ui string | Colocated canary test fails the suite (extended from F1's ui-only canary) | R16 |
| Unknown URL requested | GitHub Pages serves the root `/404.html` (single EN page, links to `/en/`) | R19, R20 |
| Client JS disabled | Print button is inert (browser-native print still available); downloads and all content remain fully usable — static-first degradation | R21, R24 |
| `prefers-reduced-motion: reduce` | Block-cursor blink is disabled by the F1 global reduced-motion rule (no per-page code needed) | R28 |
| CV PDF missing or truncated in `public/cv/` | R22 verification fails (`%PDF` magic + size checks); task order copies the files before the page work | R22 |
| `© {year}` | Year is resolved at build time (`new Date().getFullYear()`); a site rebuilt each deploy keeps it current — static-site tradeoff, accepted | R18 |

---

## Architectural Decisions
<!-- One entry per significant decision. Existing human approval gate at spec_ready reviews these. -->

### ADR-1 — Lock Direction A · Terminal as the site visual language

- **Context.** Two style directions were mocked for the human
  (`.superpowers/brainstorm/2592977-1789577129/content/`); the human approved
  **A · Terminal**. The F1 token palette and utilities stay the base.
- **Decision.** Mono accents own the chrome: hero `$` prompt line with a block
  cursor (CSS blink), interior page h1s prefixed `./` (literal `aria-hidden`
  span), section h2s with a CSS-generated `## ` prefix, timeline with left
  border + `●` nodes and mono period labels, metrics/period/chips/CTA labels in
  mono, about contact block as shell commands, `~/projects/<slug>` breadcrumbs
  as part of the vocabulary. Body copy stays Inter. Dark/light both supported.
  F2 applies the vocabulary **to F2 pages only**; the project-detail crumb
  retrofit touches reviewed F1 pages and is deferred (one feature at a time).
- **Alternatives considered.** Direction B/C mockups (rejected by the human);
  per-page ad-hoc styling (drift); animated JS cursor (unneeded — CSS suffices).
- **Consequences.** The chrome is greppable in `dist/` (`./` h1 spans, `## ` in
  built CSS, `●`/timeline classes, `mail -s`), which makes R26–R28 objectively
  verifiable; reduced-motion is inherited from the F1 global rule.

### ADR-2 — BaseLayout renders chrome via slot fallbacks

- **Context.** Nine page types need the same header chrome and every
  `BaseLayout` page needs the footer; F1 pages left `logo`/`nav`/`footer` slots
  empty and only `projects/*` filled `actions`.
- **Decision.** BaseLayout wraps each named slot with a default: `Monogram`
  (logo), `HeaderNav` (nav), `LocaleSwitcher` (actions), `Footer` (footer).
  Pages may still override any slot; none of them has to.
- **Alternatives considered.** Explicit per-page composition — boilerplate ×9
  and a missed-footer risk (the exact defect class R8 forbids); a `PageShell`
  wrapper component — extra indirection over a mechanism Astro already provides.
- **Consequences.** F1 pages gain identical chrome with zero edits; removing
  chrome from one page becomes a deliberate slot fill, never an omission.

### ADR-3 — `HeaderNav` as a component with build-time active state

- **Context.** The nav must mark the current page (`aria-current="page"`) and be
  DRY across pages; the site is fully static.
- **Decision.** `HeaderNav.astro` receives `{ lang, path? }` and resolves the
  active link at build time by comparing the nav target against the page `path`
  (home → no active link).
- **Alternatives considered.** Client-JS highlight — shipped JS for a
  build-solvable problem; five hard-coded navs — DRY violation and drift risk.
- **Consequences.** Active state is greppable per page (R7); a new route edits
  one component.

### ADR-4 — Footer is a single component rendered through the footer slot

- **Context.** Controller ruling: footer (contact links, `builtWith`, ©) on
  every page; contact data only from `SITE` (email/GitHub/LinkedIn — never
  phone/address).
- **Decision.** `Footer.astro` renders exactly the three contact links (mailto
  pre-filled with `subject=Portfolio%20contact`), `footer.builtWith`, and
  `© {year} {SITE.name}`; delivered everywhere by the ADR-2 fallback.
- **Alternatives considered.** Duplicating contact markup in `about` — drift
  risk; both share the same three-link contract but about adds the
  shell-command presentation.
- **Consequences.** One source of truth for public contact data (R17–R18).

### ADR-5 — `experience`/`skills` fill the existing F1 schemas unchanged

- **Context.** `content.config.ts` already declares both collections with
  `localized()` fields, `order`, and `current`; the plan fixes the facts.
- **Decision.** Author 4 + 5 JSON entries against the untouched schemas; facts
  come verbatim from plan Task 9 (no invention), trilingual, technical terms in
  English; `order` 1–4 newest-first and 1–5 in the fixed group sequence.
- **Alternatives considered.** Schema changes/new fields — no requirement needs
  them; hardcoding data in pages — violates `docs/architecture.md` principle 8
  and conventions ("no content in pages").
- **Consequences.** Build-time Zod validation carries over (R9, R12); the F5
  smoke suite and F3 `llms-full.txt` can consume the same collections.

### ADR-6 — About-page copy lives in the `ui` dictionary

- **Context.** The about bio (3 paragraphs) and 4 working-values lines are UI
  copy that must exist in three languages; `ui` values are scalar strings.
- **Decision.** Add scalar keys `about.bio.p1–p3`, `about.value.1–4` (+ the
  `projects.featured`, `notfound.back` keys the new pages need) to the strict
  `UiKey` dictionary.
- **Alternatives considered.** A new `about` singleton collection + schema —
  heavier machinery for one page's prose; inline copy in the page — violates
  the "UI strings never inline" convention and the trilingual parity guarantee.
- **Consequences.** Compile-time trilingual parity (`Record<UiKey, string>`)
  covers the new copy; `ui` grows by 9 content keys — accepted for one page.

### ADR-7 — Root `404.astro` is the only non-locale page F2 adds

- **Context.** GitHub Pages serves a single root `/404.html` for unknown paths;
  F1's R4 restricted non-locale HTML to the root redirect.
- **Decision.** One EN `404.astro` through `BaseLayout` (title, body, `./404`
  h1, link to `/en/`); F2's own scope rule (R20) whitelists exactly
  `dist/index.html` + `dist/404.html` — no F1 requirement is amended.
- **Alternatives considered.** Per-locale 404 pages — GitHub Pages cannot serve
  them by locale; meta-refresh stub — worse UX and SEO than a real page.
- **Consequences.** Unknown-path visitors get a styled, working page; scope
  stays consistent with F1's routing contract.

### ADR-8 — CV binaries are static assets; print UX is CSS-first

- **Context.** Real, curated PDFs already exist (`~/Documents/CV`, verified:
  `CV Jordi Marçal 2026-09 Senior EN/ES.pdf`); recruiters want download +
  print.
- **Decision.** Copy the two PDFs verbatim to `public/cv/` with clean
  kebab-case names; the CV page links them with the `download` attribute, offers
  `window.print()` (button marked `.no-print`), and renders an HTML summary
  from the same collections; `global.css` gains the `@media print` block that
  hides `header`/`footer`/`.no-print` and forces black-on-white.
- **Alternatives considered.** Build-time HTML→PDF generation — out of scope
  and inferior to the curated documents; linking files outside the repo —
  fragile and not self-contained.
- **Consequences.** The page is useful as HTML, as download, and as printout;
  PDF freshness is a content-review responsibility (F5 QA re-checks).

---

## Discarded alternatives

- **Per-page header/footer composition (plan Tasks 8–9 literal reading).**
  Rejected in favor of BaseLayout slot fallbacks (ADR-2): the controller
  requires footer-on-every-page as an invariant, and explicit composition on
  nine pages is where that invariant goes to die.
- **Large hero Monogram (`<Monogram size={160} />` from plan Task 8).**
  Rejected: the human-validated mockup hero is text-first, and the controller's
  home composition places the Monogram in the logo slot only. The `$` prompt
  line carries the hero's Terminal identity.
- **Nav inside BaseLayout without a component (inline `<nav>` markup).**
  Rejected (ADR-3): active-state logic and the five labels would duplicate
  between layouts and any future override; a component keeps it testable.
- **Localizing the shell-command contact block.** Rejected: `mail -s
  "Portfolio contact" …` is a literal command — code, not prose; the surrounding
  labels (`footer.contact`) stay localized.

---

## Verification strategy

`npx vitest run` covers content contracts and the extended canaries (R9, R12,
R16, R25); `npm run check` guarantees strict typing and ui key parity (R25);
`npm run build` + `dist/` greps verify every emitted page, route set, Terminal
chrome, downloads and print CSS (R1–R8, R10–R11, R13–R15, R17–R24, R26–R28).
The full sequence: `npx vitest run && npm run check && npm run build`, then the
per-R verification commands listed in `requirements.md`.
