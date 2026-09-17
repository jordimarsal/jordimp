# Design: seo-analytics (F3)

Implements the F3 feature (full SEO component, JSON-LD, robots.txt, sitemap,
llms.txt endpoints, optional GoatCounter) on top of the F1 foundation
(`BaseLayout` + `SEO.astro` stub, `@astrojs/sitemap` integration with
`site: 'https://jordimp.net'`) and the F2 page set, under `docs/architecture.md`
(static-first, pure cores at the edges, I/O at the edges) and
`docs/conventions.md` (named exports, no `any`, locales as the `Locale` literal
union, `PUBLIC_` env prefix — `PUBLIC_GOATCOUNTER` is already the planned name
in the conventions table).

Current state (verified in the repo): `SEO.astro` renders only
title/description/canonical; the built `sitemap-0.xml` has 52 `<loc>` entries —
it wrongly includes `https://jordimp.net/` (the F1 noindex meta-refresh stub);
no OG/Twitter/JSON-LD/hreflang-head/robots.txt/llms.txt exists; `dist/404.html`
canonicalizes to `https://jordimp.net/en/` (a defect F3 fixes via noindex mode).

Conditional modules: `docs/architecture-options.md` and
`harness/decisions/_template.md` do not exist in this repo, so no architecture
catalog is consulted and no ADR copies are stored under `harness/decisions/`.

---

## Files to create

**Pure cores (unit-testable without a build)**
- `src/lib/seo.ts` — canonical URL helper, `og:locale` mapping, `Person` and `BreadcrumbList` JSON-LD builders, `<`-safe JSON-LD serializer (ADR-6).
- `src/lib/seo.spec.ts` — colocated vitest for the seo builders (locales, sameAs set, breadcrumb positions, escaping).
- `src/lib/analytics.ts` — `goatCounterEndpoint()`: code → data-goatcounter URL or `undefined` (ADR-5).
- `src/lib/analytics.spec.ts` — accept (trimmed code) / reject (unset, empty, whitespace) cases.
- `src/lib/llms.ts` — `LlmsData` type + `buildLlmsTxt()` / `buildLlmsFullTxt()` pure text builders (ADR-4).
- `src/lib/llms.spec.ts` — builder output pinned with fixture data (counts, links, structure).

**Endpoints (prerendered at build → static files)**
- `src/pages/llms.txt.ts` — `prerender` GET endpoint emitting `dist/llms.txt` as `text/plain; charset=utf-8` from `getCollection` data (ADR-4).
- `src/pages/llms-full.txt.ts` — same for `dist/llms-full.txt` with the full English content dump (ADR-4).

**Static assets**
- `public/robots.txt` — `User-agent: *` / `Allow: /` / `Sitemap: https://jordimp.net/sitemap-index.xml` (ADR-8).
- `public/og.png` — committed 1200×630 PNG social card, Terminal-style dark (`--bg #0b1220` + mono identity), generated once (ADR-7).

**Components**
- `src/components/Analytics.astro` — renders the GoatCounter `<script>` only when `goatCounterEndpoint(import.meta.env.PUBLIC_GOATCOUNTER)` returns a URL; renders nothing otherwise (ADR-5).

## Files to modify

- `src/components/SEO.astro` — from 3-tag stub to the full head owner: canonical (R2), hreflang alternates + `x-default` (R3), OG core/locale/image (R4–R6), Twitter set (R8), Person + optional BreadcrumbList JSON-LD (R9–R12), `noindex` mode that renders only title/description + robots meta (R20–R21). New optional props `noindex`, `breadcrumbs` forwarded from pages through `BaseLayout`.
- `src/layouts/BaseLayout.astro` — `Props` gains `noindex?: boolean` and `breadcrumbs?: readonly BreadcrumbItem[]`, forwarded to `SEO`; `<Analytics />` added at the end of `<head>` (ADR-5).
- `src/pages/404.astro` — passes `noindex` to `BaseLayout` (R20, R21).
- `src/pages/[lang]/experience.astro`, `skills.astro`, `about.astro`, `cv.astro`, `projects/index.astro` — pass `breadcrumbs={[{ name: t['nav.<route>'], path: '<route>/' }]}` (R10).
- `src/pages/[lang]/projects/[slug].astro` — passes `breadcrumbs={[{ name: t['nav.projects'], path: 'projects/' }, { name: d.name, path: `projects/${project.id}/` }]}` (R11).
- `astro.config.mjs` — `sitemap()` gains `filter: (page) => page !== 'https://jordimp.net/'` so the noindex root redirect drops out of the sitemap (ADR-3); the existing `i18n` alternates config stays untouched.

No page template renders head tags itself; nothing else changes. F1/F2 behavior
outside the head is untouched.

---

## Public signatures

```ts
// src/lib/seo.ts
import type { Locale } from './i18n';

export type BreadcrumbItem = { readonly name: string; readonly path: string };

export function siteUrl(lang: Locale, path?: string): string;
// 'https://jordimp.net/{lang}/{path}' — path may be '' (home) or 'about/' style

export function ogLocale(lang: Locale): 'en_US' | 'es_ES' | 'ca_ES';
export function ogLocaleAlternates(lang: Locale): Array<'en_US' | 'es_ES' | 'ca_ES'>; // the other two, fixed order en→es→ca

export function personJsonLd(lang: Locale): {
  readonly '@context': 'https://schema.org';
  readonly '@type': 'Person';
  readonly name: string;      // SITE.name
  readonly jobTitle: string;  // SITE.role
  readonly url: string;       // siteUrl(lang)
  readonly email: string;     // 'mailto:' + SITE.email
  readonly sameAs: readonly [string, string]; // [SITE.github, SITE.linkedin]
};

export function breadcrumbJsonLd(lang: Locale, items: readonly BreadcrumbItem[]): {
  readonly '@context': 'https://schema.org';
  readonly '@type': 'BreadcrumbList';
  readonly itemListElement: ReadonlyArray<{
    readonly '@type': 'ListItem';
    readonly position: number;      // 1..n, home is position 1
    readonly item: string;          // absolute URL
    readonly name: string;
  }>;
};

export function jsonLdScript(value: object): string;
// JSON.stringify with '<' → '\u003c' (and U+2028/U+2029 escaped) so content
// strings can never close the script tag
```

```ts
// src/lib/analytics.ts
export function goatCounterEndpoint(
  code: string | undefined,
): `https://${string}.goatcounter.com/count` | undefined;
// trims; undefined for unset/empty/whitespace
```

```ts
// src/lib/llms.ts
export interface LlmsData {
  readonly name: string;            // SITE.name
  readonly role: string;            // SITE.role
  readonly tagline: string;         // SITE.tagline
  readonly email: string;
  readonly github: string;
  readonly linkedin: string;
  readonly bio: readonly string[];  // en bio paragraphs (ui 'about.bio.p1'–'p3')
  readonly projects: ReadonlyArray<{
    readonly id: string; readonly name: string; readonly year: number;
    readonly summary: string; readonly problem: string;
    readonly highlights: readonly string[]; readonly stack: readonly string[];
    readonly github: string;
  }>;
  readonly experience: ReadonlyArray<{
    readonly company: string; readonly role: string;
    readonly period: string; readonly points: readonly string[];
  }>;
  readonly skills: ReadonlyArray<{ readonly group: string; readonly items: readonly string[] }>;
}

export function buildLlmsTxt(data: LlmsData): string;
// '# {name}' · '> {role}. {tagline}' · '## Projects' (11 × '- [{name}](https://jordimp.net/en/projects/{id}/): {summary}')
// · '## Pages' (about, cv, experience, skills links)

export function buildLlmsFullTxt(data: LlmsData): string;
// header + '## About' (bio) + '## Contact' + '## Projects' ('### {name} ({year})' + Summary/Problem/Highlights/Stack/Repository)
// + '## Experience' ('### {company} — {role} ({period})' + points) + '## Skills' ('### {group}' + items)
```

```ts
// src/pages/llms.txt.ts and src/pages/llms-full.txt.ts
export const prerender = true;
export async function GET(): Promise<Response>; // text/plain; charset=utf-8, body = builder(getCollection(...))
```

```astro
---
// src/components/SEO.astro — Props
interface Props {
  lang: 'en' | 'es' | 'ca';
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;                        // 404: robots noindex, minimal head
  breadcrumbs?: readonly BreadcrumbItem[];  // interior pages
}
// Emits (noindex mode → only the first two + robots meta):
//   <title>, <meta name="description">
//   <link rel="canonical">, <link rel="alternate" hreflang ×3> + x-default
//   <meta property="og:*"> ×10 (title, description, url, type, site_name, locale, locale:alternate ×2, image, image:width, image:height, image:alt)
//   <meta name="twitter:*"> ×4 (card, title, description, image)
//   <script type="application/ld+json"> Person (+ BreadcrumbList when breadcrumbs non-empty)
---
```

```astro
---
// src/layouts/BaseLayout.astro — Props extended, otherwise unchanged
export interface Props {
  lang: 'en' | 'es' | 'ca';
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  breadcrumbs?: readonly BreadcrumbItem[];
}
---
```

Attribute order/format is fixed by the component source (greppable per the R
verification commands): OG tags `<meta property="…" content="…">`, Twitter tags
`<meta name="…" content="…">`, canonical/alternates `<link rel="…" hreflang="…"
href="…">`.

---

## Exceptions and error cases

| Case | Behavior | Requirement |
|---|---|---|
| `PUBLIC_GOATCOUNTER` unset, empty or whitespace-only (the default) | `goatCounterEndpoint` returns `undefined`; `Analytics.astro` renders nothing — zero analytics in `dist/` | R19 |
| `PUBLIC_GOATCOUNTER` set (e.g. `jordimp`) | Script rendered on all 52 BaseLayout pages with `data-goatcounter="https://jordimp.goatcounter.com/count"` | R18 |
| Root redirect page reaches the sitemap (regression) | `filter` drops `https://jordimp.net/`; R15 count check fails loudly if it ever returns | R15 |
| 404 page rendered without `noindex` | R20/R21 greps fail; `SEO.astro` noindex mode is the single switch that drops canonical/alternates/OG/Twitter/JSON-LD and adds robots noindex | R20, R21 |
| Content string containing `<` (or `</script>`) reaches JSON-LD | `jsonLdScript` escapes `<` as `\u003c` — the script block can never be closed early | R9, R10 |
| Interior page forgets its `breadcrumbs` prop | `SEO` renders no BreadcrumbList; the per-route R10 dist check fails, naming the page | R10 |
| Empty content collection (e.g. all projects deleted) | Endpoints still build; R17's `^### ` count (20) fails, surfacing the content loss | R17 |
| `og.png` missing, not 1200×630, or trivially small | R7 verification fails (`file` + `wc -c`); task order generates the asset before the component greps | R7, R6 |
| Project `name` contains characters legal in JSON but unsafe in HTML | Same `jsonLdScript` escaping as content strings | R11 |

---

## Architectural Decisions
<!-- One entry per significant decision. Existing human approval gate at spec_ready reviews these. -->

### ADR-1 — `SEO.astro` stays the single head owner, extended in place

- **Context.** F1's stub already renders title/description/canonical through
  `BaseLayout` on every page; F3 must add OG, Twitter, hreflang and JSON-LD to
  53 emitted HTML pages without any page rendering head tags itself.
- **Decision.** Extend `SEO.astro` props with `noindex` and `breadcrumbs`;
  `BaseLayout` forwards them. All head artifacts derive from the same three
  inputs (`lang`, `path`, title/description) plus the `SITE` config.
- **Alternatives considered.** `astro-seo` package — an extra dependency to
  render plain static meta tags; per-page head tags — 53 chances to drift and
  the exact defect class R2/R4 forbid.
- **Consequences.** One component owns every head artifact; attribute order is
  fixed in one place, making every R-grep deterministic; the 404 noindex defect
  fixes itself once the page flips the flag.

### ADR-2 — hreflang alternates and `x-default` derived from `path` at build time

- **Context.** Every page already carries its locale-relative `path`
  (canonical, `LocaleSwitcher`); Google wants bidirectional page-level
  alternates, and `/` redirects to `/en/`.
- **Decision.** Alternates are computed per page as
  `https://jordimp.net/{locale}/{path}` for the 3 locales plus
  `hreflang="x-default"` → the `en` variant, in `SEO.astro`.
- **Alternatives considered.** Post-build dist-injection script — a second
  source of truth for URLs and a fragile parse-and-rewrite step; relying on
  sitemap alternates only — weaker signal than page-level links.
- **Consequences.** Single URL derivation shared by canonical, switcher and
  alternates; `x-default` → en mirrors `defaultLocale: 'en'` +
  `prefixDefaultLocale: true`.

### ADR-3 — Keep `@astrojs/sitemap`; add a `filter` excluding the root redirect

- **Context.** The integration is already installed and configured with i18n
  alternates, but `sitemap-0.xml` currently lists `https://jordimp.net/` — a
  noindex meta-refresh stub that must not be a crawlable entry (52 locs today).
- **Decision.** Add `filter: (page) => page !== 'https://jordimp.net/'` to the
  existing integration config. Result: exactly 51 URLs (17 routes × 3 locales),
  each with `xhtml:link` alternates for en/es/ca.
- **Alternatives considered.** Hand-rolled sitemap endpoint — duplicates a
  working dependency and loses its i18n alternates; leaving the root entry —
  search engines keep a noindex redirect page in the index.
- **Consequences.** R15 becomes a hard 51/153 count invariant; robots.txt
  points at the integration's `sitemap-index.xml`.

### ADR-4 — llms.txt / llms-full.txt as prerendered root `.txt.ts` endpoints over pure builders

- **Context.** The feature calls for build endpoints; the content lives in the
  three typed collections; the site is fully static.
- **Decision.** `src/pages/llms.txt.ts` and `src/pages/llms-full.txt.ts` are
  `prerender` GET endpoints returning `text/plain; charset=utf-8`; all text is
  produced by pure builders in `src/lib/llms.ts` fed by `getCollection` (en
  values via `L()`). Output lands as `dist/llms.txt` / `dist/llms-full.txt`.
- **Alternatives considered.** Hand-written `public/` files — drift the moment
  any collection entry changes and cannot enumerate content; on-demand server
  endpoints — there is no server in a static deployment.
- **Consequences.** Collections remain the single source of truth; builders are
  vitest-testable without a build; the files are `.txt`, so F1 R4's non-locale
  *HTML* whitelist is untouched. English only — llms.txt guidance favors a
  single language and the collections' en values are the technical register
  (a trilingual dump would triple the size with near-duplicates).

### ADR-5 — GoatCounter behind `PUBLIC_GOATCOUNTER` with a pure decision core

- **Context.** Analytics must be optional and off by default (static-first,
  privacy); conventions already reserve `PUBLIC_GOATCOUNTER` as a build-time
  browser-visible env var.
- **Decision.** `goatCounterEndpoint()` maps the env value to the
  `data-goatcounter` URL or `undefined` (pure, unit-tested);
  `Analytics.astro` renders `<script is:inline async data-goatcounter=… src="https://gc.zgo.at/count.js">` only when defined; `BaseLayout` includes
  `Analytics` unconditionally — the component decides.
- **Alternatives considered.** Always loading the script and gating it at
  runtime — ships tracker code and the site code to every visitor even when
  disabled; self-hosted analytics — out of F3 scope.
- **Consequences.** Default builds are greppably tracker-free (R19); enabling
  analytics is one env var at build time, no code change (R18).

### ADR-6 — JSON-LD built by pure functions, serialized `<`-safe

- **Context.** Person and BreadcrumbList objects must be stable, testable and
  safe to embed in inline `<script>` tags built from content strings.
- **Decision.** Builders in `src/lib/seo.ts` return typed plain objects;
  `jsonLdScript()` serializes with `JSON.stringify` and escapes `<`
  (`\u003c`, plus U+2028/U+2029) before `set:html` injection.
- **Alternatives considered.** Inline object literals inside `SEO.astro` —
  untestable without a full build; a schema.org builder library — a dependency
  for two fixed shapes.
- **Consequences.** `src/lib/seo.spec.ts` pins the shapes without building; no
  content string can terminate the script block.

### ADR-7 — The social card is a committed static asset

- **Context.** OG/Twitter cards need a raster image; the site's art is CSS
  (Terminal tokens), and crawlers ignore SVG.
- **Decision.** Ship `public/og.png` (1200×630, dark `#0b1220` card, mono
  identity, accent), committed once and verified like the F2 CV PDFs (file
  type + magic bytes + size).
- **Alternatives considered.** Build-time image generation (satori/sharp
  pipeline) — heavy machinery for one static asset; SVG og:image — poor
  crawler support.
- **Consequences.** Zero build cost; refreshing the card is replacing one
  file; R7 verification is objective.

### ADR-8 — robots.txt is a static `public/` file

- **Context.** robots.txt is two static directives + the sitemap URL; nothing
  varies per locale or per build.
- **Decision.** Hand-authored `public/robots.txt` (`User-agent: *`, `Allow: /`,
  `Sitemap: https://jordimp.net/sitemap-index.xml`), emitted verbatim.
- **Alternatives considered.** A generated endpoint — no input data to compute
  from; per-locale rules — none exist.
- **Consequences.** Trivially greppable (R13); the Sitemap URL must be updated
  only if the domain ever changes (same `SITE.url` coupling as canonicals).

---

## Discarded alternatives

- **`astro-seo` / `astro-robots-txt` third-party integrations.** Rejected:
  each wraps a handful of static tags behind a dependency; the project's
  conventions favor a deterministic in-repo core (`SEO.astro` + pure builders)
  with zero new dependencies — `@astrojs/sitemap` stays because it is already
  installed, configured, and non-trivial to reimplement (i18n alternates).
- **Trilingual llms-full.txt.** Rejected (ADR-4): the LLM-facing summary
  convention favors one language; en is the collections' source of truth and
  the technical register; es/ca duplicates would triple the file with
  near-identical text. The HTML site remains fully trilingual.
- **`twitter:site` / `twitter:creator`.** Rejected: no X/Twitter handle exists
  in `SITE` or the contact data; inventing one ships wrong metadata. The card
  set (card/title/description/image) is complete without it.
- **Visible breadcrumb UI.** Out of scope: F3 ships BreadcrumbList as
  structured data only; visible breadcrumbs would re-touch the F2-reviewed
  page templates (one feature at a time).
- **Filtering the sitemap by rewriting `dist/*.xml` post-build.** Rejected:
  the integration's `filter` hook is the supported knob; a rewrite script is
  an extra build step with its own failure modes.

---

## Verification strategy

`npx vitest run` covers the pure cores (`src/lib/seo.spec.ts`,
`src/lib/analytics.spec.ts`, `src/lib/llms.spec.ts`) plus the existing suites;
`npm run check` keeps strict typing green; `npm run build` + the per-R
verification commands from `requirements.md` verify every emitted artifact
(head greps per locale, JSON-LD `node -e` parsers, sitemap/robots/llms counts,
404 noindex). The GoatCounter-enabled variant is verified with an env-var build
(`PUBLIC_GOATCOUNTER=jordimp npm run build`) followed by a plain rebuild to
restore the default state (R18 → R19). The full sequence:
`npx vitest run && npm run check && npm run build`, then the per-R commands.
