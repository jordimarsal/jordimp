# Tasks: seo-analytics

> Order matters: pure cores first (TDD — colocated spec before the code it
> pins), then the head component and pages, then build artifacts, then a full
> verification pass. Every task ends green (`npx vitest run`, `npm run check`,
> `npm run build`).

- [x] T1: `src/lib/seo.ts` — `siteUrl`, `ogLocale`, `ogLocaleAlternates`, `personJsonLd`, `breadcrumbJsonLd`, `jsonLdScript` (with `<` → `\u003c` escaping) + colocated `src/lib/seo.spec.ts` (locale mapping for the 3 locales, Person fields incl. exact sameAs set, breadcrumb positions/URLs, home → no breadcrumb items, escaping cannot close the script tag)
      depends_on: (none)
      refs: R5, R9, R10, R11

- [x] T2: `src/lib/analytics.ts` — `goatCounterEndpoint()` + colocated `src/lib/analytics.spec.ts` (accepts a trimmed code → `https://{code}.goatcounter.com/count`; rejects unset/empty/whitespace → undefined)
      depends_on: (none)
      refs: R18, R19

- [x] T3: `src/lib/llms.ts` — `LlmsData` + `buildLlmsTxt` / `buildLlmsFullTxt` + colocated `src/lib/llms.spec.ts` (fixture data: 11 links in llms.txt, Pages links, llms-full heading counts 11+4+5, sections, contact block, deterministic output)
      depends_on: (none)
      refs: R16, R17

- [x] T4: `src/components/SEO.astro` — full head owner: canonical (R2), hreflang alternates + `x-default` → en (R3), OG core + og:locale set + og:image set (R4, R5, R6), Twitter set (R8), Person JSON-LD on every page (R9), BreadcrumbList only when `breadcrumbs` non-empty (R12 via absence), `noindex` mode (robots meta only, everything else suppressed); fixed attribute order (`property=` for OG, `name=` for Twitter); `src/layouts/BaseLayout.astro` — extend `Props` with `noindex`/`breadcrumbs` and forward to `SEO`; `src/pages/404.astro` — pass `noindex`
      depends_on: T1
      refs: R1, R2, R3, R4, R5, R6, R8, R9, R12, R20, R21

- [x] T5: Interior pages pass breadcrumbs — `experience.astro`, `skills.astro`, `about.astro`, `cv.astro`, `projects/index.astro` get `breadcrumbs={[{ name: t['nav.<route>'], path: '<route>/' }]}`; `projects/[slug].astro` gets the 2-item chain (projects index + project `name`); verify each interior page embeds exactly one BreadcrumbList and home embeds none
      depends_on: T1, T4
      refs: R10, R11

- [x] T6: Build artifacts — `public/robots.txt` (`User-agent: *`, `Allow: /`, `Sitemap: https://jordimp.net/sitemap-index.xml`) and `astro.config.mjs` sitemap `filter` excluding `https://jordimp.net/`; verify `dist/robots.txt`, `dist/sitemap-index.xml` → `sitemap-0.xml`, and the sitemap's 51 `<loc>` / 153 alternates / no-root counts
      depends_on: (none)
      refs: R13, R14, R15

- [x] T7: Generate `public/og.png` — 1200×630 PNG social card in the Terminal language (dark `#0b1220`, mono identity, accent); verify `file` reports PNG 1200 x 630, size > 5000 bytes, and `npm run build` emits `dist/og.png`
      depends_on: (none)
      refs: R6, R7

- [x] T8: llms endpoints — `src/pages/llms.txt.ts` and `src/pages/llms-full.txt.ts` (`export const prerender = true`, GET assembling `getCollection` data + `ui.en` bio into `LlmsData`, returning `text/plain; charset=utf-8`); verify `dist/llms.txt` (11 project links + Pages links) and `dist/llms-full.txt` (20 `### ` headings, sections, spot strings)
      depends_on: T3
      refs: R16, R17

- [x] T9: Analytics wiring — `src/components/Analytics.astro` (renders the GoatCounter script only when `goatCounterEndpoint(import.meta.env.PUBLIC_GOATCOUNTER)` returns a URL) included at the end of `BaseLayout`'s `<head>`; verify the default build greps clean for `goatcounter` in `dist/`
      depends_on: T2, T4
      refs: R18, R19

- [x] T10: Verification pass — run `npx vitest run && npm run check && npm run build`; execute every per-R verification command from `requirements.md` (51-page title/description loop, canonical/hreflang/OG/Twitter greps per locale, JSON-LD `node -e` parsers, sitemap/robots/llms counts, 404 noindex/absence greps, the `PUBLIC_GOATCOUNTER=jordimp npm run build` → 52-page grep variant followed by a plain rebuild); write the traceability table in `harness/progress/impl_seo-analytics.md` (R↔test↔implementation)
      depends_on: T4, T5, T6, T7, T8, T9
      refs: R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19, R20, R21
