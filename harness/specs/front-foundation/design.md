# Design: front-foundation (F1)

Implements plan Tasks 1–7 of
`docs/superpowers/plans/2026-09-16-portfolio-phase0-1-front.md` (plus the
verification-harness env fix), under the project design spec
`docs/superpowers/specs/2026-09-16-portfolio-web-design.md` and
`docs/architecture.md` (static-first, typed content, I/O at the edges).

**Status note:** the code described here already exists on
`feat/front-phase-0-1` (commits `cf3f29b..8aa20ef`, each pre-harness task
reviewed and approved). This document records the design as built.

Conditional modules: `docs/architecture-options.md` and
`harness/decisions/_template.md` do not exist in this repo, so no architecture
catalog was consulted and no ADR copies are stored under `harness/decisions/`.

---

## Files (as they exist on the branch)

**Build / config**
- `package.json` — scripts `dev/build/preview/check/test`; deps `astro ^5.18.2`, `@astrojs/sitemap ^3.7.4`, `@fontsource-variable/inter`, `@fontsource/jetbrains-mono`; devDeps `@astrojs/check`, `typescript ^5.9.3`, `vitest ^5.0.1`.
- `astro.config.mjs` — `site: https://jordimp.net`, i18n (`en` default, `prefixDefaultLocale: true`, `redirectToDefaultLocale: true`), sitemap integration.
- `tsconfig.json` — extends `astro/tsconfigs/strict`.
- `vitest.config.ts` — unit runner: `include: ['src/**/*.spec.ts']`, node environment.
- `src/env.d.ts` — Astro client types reference.

**Lib / config**
- `src/config.ts` — `SITE` constants (name, url, role, tagline, email, github, linkedin).
- `src/lib/i18n.ts` — `Locale`/`LOCALES`, `L()` selector with `en` fallback, `localeNames`.
- `src/lib/i18n.spec.ts` — 5 Vitest unit tests: `L()` selection + fallback, ui key parity, non-empty values, no 9-digit runs (phone canary).
- `src/i18n/ui.ts` — trilingual UI dictionary; `en as const` defines `UiKey`; `es`/`ca` typed `Record<UiKey, string>`.

**Content**
- `src/content.config.ts` — collections `projects`/`experience`/`skills` (glob loaders) + `localized()` schema helper.
- `src/content/projects/*.json` — 11 entries: 5 featured (kafka-adapter-telemetry, codebaserag, redis-toolkit, harness-standard, mcp-transparent-png) + 6 secondary (interview-simulator, md-mermaid-pdf, rustcut, spring-boot-casino, product-offers, bible-text-analysis). Route slug = filename id; `name` holds the literal repo name (`bible_text_analysis`).

**Styles**
- `src/styles/tokens.css` — locked design tokens (fonts, radii, spacing, container/prose, dark/light palettes).
- `src/styles/global.css` — font imports, reset, `.container`/`.prose`/`.card`/`.chips`/`.chip`/`.mono`/`.muted` utilities, `[hidden]`, locale-switch styles, `:focus-visible`, `prefers-reduced-motion`.

**Components / layout**
- `src/layouts/BaseLayout.astro` — page shell: inline no-flash theme script in `<head>`, SEO include, header slots (`logo`/`nav`/`actions`), `<main>`, `footer` slot.
- `src/components/SEO.astro` — stub: `<title>`, description, canonical (type contract kept stable; replaced by F3).
- `src/components/ThemeToggle.astro` — `◐` button + module script: apply initial theme, toggle `data-theme`, persist to `localStorage['theme']`.
- `src/components/LocaleSwitcher.astro` — EN/ES/CA links for the same path, `hreflang` + `aria-current`.
- `src/components/Monogram.astro` — inline SVG "JM", `var(--accent)`/`var(--text)`, no JS.
- `src/components/ProjectCard.astro` — card (`.card.project-card[.featured]`) with `data-stack="a|b"`, link to `/{lang}/projects/{id}/`, name · year, localized summary, stack chips.

**Pages**
- `src/pages/index.astro` — source fallback link page; in `dist/`, Astro's `redirectToDefaultLocale` emits the `/` → `/en/` meta-refresh redirect (`noindex`).
- `src/pages/[lang]/index.astro` — placeholder home per locale (replaced by F2).
- `src/pages/[lang]/projects/index.astro` — projects index: featured + secondary sections, stack filter buttons (`data-stack` / `data-reset`, multi-select set), bundled filter script.
- `src/pages/[lang]/projects/[slug].astro` — project detail: year, derived repo link, name, localized summary/problem/highlights, stack chips, metrics grid.

---

## Public signatures

```ts
// src/lib/i18n.ts
export const LOCALES = ['en', 'es', 'ca'] as const;
export type Locale = (typeof LOCALES)[number];
export function L<T>(field: Record<Locale, T>, lang: Locale): T;
export const localeNames: Record<Locale, string>;

// src/i18n/ui.ts
export type UiKey = keyof typeof en;                       // en declared `as const`
export const ui: Record<Locale, Record<UiKey, string>>;

// src/config.ts
export const SITE = { name, url, role, tagline, email, github, linkedin } as const;

// src/content.config.ts
const localized = <T extends z.ZodTypeAny>(inner: T) => z.object({ en: inner, es: inner, ca: inner });
export const collections: {
  projects: CollectionCfg;   // { name, year: int >= 2017, featured,
                             //   summary/problem/highlights: localized, stack[],
                             //   metrics: {value,label}[], links: { github: url, ci?: url } }
  experience: CollectionCfg; // { company, role: localized, period, current = false,
                             //   points: localized, stack[], order }   (empty until F2)
  skills: CollectionCfg;     // { group: localized, items[], order }    (empty until F2)
};
```

Astro component props (all via exported/declared `interface Props`, `Astro.props` destructured once):

```ts
// BaseLayout.astro and SEO.astro (identical contract)
{ lang: 'en' | 'es' | 'ca'; title: string; description: string; path?: string }
// ThemeToggle.astro
{ lang: Locale }
// LocaleSwitcher.astro
{ lang: Locale; path?: string }
// Monogram.astro
{ size?: number }   // default 40
// ProjectCard.astro
{ project: CollectionEntry<'projects'>; lang: Locale }
```

Routing:
- `/[lang]/projects/index` — `getStaticPaths()` over `LOCALES`.
- `/[lang]/projects/[slug]` — `getStaticPaths()` = `LOCALES × getCollection('projects')`; `slug` = collection `id` (JSON filename).
- `/` — Astro i18n redirect to `/en/` (`redirectToDefaultLocale: true`).

---

## Exceptions and error cases

| Case | Behavior | Requirement |
|---|---|---|
| Content JSON violates its Zod schema | `npm run build` fails with a Zod error naming the file | R2, R13 |
| Localized field missing a locale | Impossible by schema (`localized()` requires all three); `L()` still falls back to `en` defensively | R10, R13 |
| `localStorage` unavailable (strict privacy mode) | Inline head script may throw; page still renders with the server-rendered `data-theme="dark"` default; toggle listener simply not registered — degradation, not breakage | R7 |
| No projects match the active filter set | All cards hidden; the `All` reset restores every card | R17, R18 |
| Stack tag outside the rendered button set | Impossible by construction: buttons are generated from the union of all `stack` tags | R16 |

---

## Architectural Decisions
<!-- One entry per significant decision. Existing human approval gate at spec_ready reviews these. -->

### ADR-1 — Pin Astro ^5 (do not jump to Astro 7)

- **Context.** The scaffold predates the harness (plan approved Sept 2026). Astro 7 is
  available, but F1 uses exactly three framework capabilities: glob-loader content
  collections, i18n routing, and the sitemap integration — all stable and documented in v5.
- **Decision.** Pin `astro: ^5.18.2` (+ `@astrojs/sitemap ^3.7.4`); no major upgrade inside F1.
- **Alternatives considered.** Astro 7 — migration/breaking-change risk for zero feature gain
  on a portfolio timeline; plain Vite + vanilla — loses typed collections and i18n routing;
  other meta-frameworks — violate the static-first, zero-JS-default requirement.
- **Consequences.** Collection/i18n behavior stays as documented; a v7 migration becomes an
  isolated future task, never entangled with content work.

### ADR-2 — `prefixDefaultLocale: true`

- **Context.** Trilingual site (en default, es, ca); SEO and the locale switcher need
  predictable URLs.
- **Decision.** Every route is locale-prefixed (`/en/projects/…`); `/` redirects to `/en/`
  via `redirectToDefaultLocale: true` (meta refresh, `noindex`).
- **Alternatives considered.** Unprefixed default locale — asymmetric switcher URLs,
  duplicate-content risk, messier canonicals.
- **Consequences.** Every URL self-describes its locale; the switcher computes
  `/{locale}/{path}` mechanically; F3 hreflang alternates become trivial.

### ADR-3 — JSON data-only content collections with a `localized()` schema helper

- **Context.** F1 content is structured data (cards/sheets), no long-form Markdown; every
  text field must exist in three languages.
- **Decision.** Glob loaders over `src/content/<collection>/*.json`; Zod schemas; `localized()`
  wraps the inner type as `{ en, es, ca }`, so all three locales are mandatory per field.
- **Alternatives considered.** Markdown + frontmatter collections — remark pipeline and body
  rendering unused in F1 and weaker per-field typing; one file per locale — locale drift and
  duplicated ids.
- **Consequences.** Any schema violation fails the build (content is a contract, R2/R13);
  `CollectionEntry<'projects'>['data']` is fully typed; F2 reuses the same helper for
  `experience`/`skills`.

### ADR-4 — `ui` dictionary with strict `UiKey` typing

- **Context.** UI strings must never be inline (conventions.md) and the three locales must
  never drift.
- **Decision.** The `en` dictionary is declared `as const`, its keys define `UiKey`;
  `es`/`ca` are typed `Record<UiKey, string>`, so a missing or extra translation is a
  compile error; a unit test additionally asserts runtime key parity, non-empty values, and
  no 9-digit runs (phone canary).
- **Alternatives considered.** Free `Record<string, string>` per locale — no compile-time
  protection; an i18n dependency (i18next et al.) — overkill for a static site.
- **Consequences.** Adding a key without all translations breaks `npm run check` (R11);
  dictionary regressions are caught by `npx vitest run`.

### ADR-5 — Zero-framework islands

- **Context.** Theme toggle and stack filter need client JS; the design spec forbids
  client-side frameworks.
- **Decision.** Vanilla `<script>` blocks (Astro-bundled modules), one behavior per script,
  no global namespace; the no-flash guarantee lives in an `is:inline` head script in
  BaseLayout.
- **Alternatives considered.** Preact/Svelte islands — hydration cost and dependencies for
  two small behaviors; framework `prefers-color-scheme` helpers — same, with lock-in.
- **Consequences.** Minimal shipped JS; behaviors directly testable by the F5 Playwright suite.

### ADR-6 — Controller-accepted deviations from the plan

- **Context.** Pre-harness review accepted two deliberate departures from plan Tasks 3/7.
- **Decision.**
  (a) `projects.problem` (and `projects.highlights`) UI keys added to the dictionary: the
  plan's Task 3 key list omitted a label for the Problem section that the Task 4 schema and
  Task 7 detail page render.
  (b) Detail-page repository link text derived from `new URL(d.links.github).pathname`
  instead of the plan's hardcoded `github.com/jordimarsal/{d.name}` — robust when the repo
  name differs from the route slug (`bible_text_analysis` vs id `bible-text-analysis`).
- **Alternatives considered.** Strict plan conformance — would ship a hardcoded English
  "Problem" heading or a wrong link text for `bible_text_analysis`.
- **Consequences.** `ui` carries two more keys than the plan lists; the detail-page link text
  always matches the real repository path.

### ADR-7 — Vitest as the unit/harness gate (env fix)

- **Context.** `harness/init.sh` gates sessions on a green test command; the foundation had
  no test runner (units were planned only implicitly).
- **Decision.** Add `vitest ^5`, `vitest.config.ts` (`src/**/*.spec.ts`, node env), an
  `npm test` script, and 5 unit tests for `L()` + the `ui` dictionary (commit `8aa20ef`,
  current HEAD). Included in F1 as task T8 by spec-author judgment: it adds no site
  behavior — it exists to make the harness gate green and to pin R10/R11 with executable
  tests.
- **Alternatives considered.** Leave `init.sh` red until F5's Playwright — violates the
  harness hard rule "no `done` without green tests"; adopt Playwright now — e2e is F5 scope
  and much heavier.
- **Consequences.** R10/R11 have executable tests today; the F5 smoke suite arrives as planned.

---

## Discarded alternatives

- **CSS framework (Tailwind et al.).** Rejected: the design spec (§8) and conventions.md
  mandate hand-rolled design tokens and no CSS frameworks; the locked palette in
  `tokens.css` is the single source of style truth.
- **Client-side locale switching (one set of pages, JS swaps strings).** Rejected:
  static-first SEO requires one URL per locale; also breaks no-JS usability.
- **Cookie-based theme persistence.** Rejected: GitHub Pages serves no server logic;
  `localStorage` + the `is:inline` head script achieves flash-free first paint without
  cookies (no consent surface).
- **Markdown content collections.** Rejected for F1 (see ADR-3): no long-form body content
  exists yet; JSON keeps fields typed and per-locale complete at build time.

---

## Verification strategy

Every R1–R21 in `requirements.md` is verified by a command on the built site or by
`npx vitest run`: `npm run check` (R1), `npm run build` + `dist/` inspection
(R2–R9, R12–R21), Vitest units (R10, R11, R21-canary). The full check sequence:
`npx vitest run && npm run check && npm run build`.
