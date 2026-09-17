# Implementation report — seo-analytics (F3)

Branch `feat/front-phase-0-1` · spec `harness/specs/seo-analytics/`
(R1–R21, T1–T10, ADR-1–8). All tasks T1–T10 executed in order (TDD: colocated
spec written first for every pure core); every task ended green
(`npx vitest run`, `npx astro check`, `npm run build`).

## Traceability

| R | Test(s) | Implementation file(s) | Status |
|---|---|---|---|
| R1 | bash title+description grep loop over the 51 dist locale index.html pages (loop in requirements.md R1), grep -q '<title>Experiencia — Jordi Marçal Poy</title>' dist/es/experience/index.html | `src/components/SEO.astro`, `src/layouts/BaseLayout.astro`, `src/i18n/ui.ts` | done |
| R2 | grep -q 'rel="canonical" href="https://jordimp.net/en/"' dist/en/index.html, grep -q 'rel="canonical" href="https://jordimp.net/ca/about/"' dist/ca/about/index.html, grep -q 'rel="canonical" href="https://jordimp.net/es/projects/kafka-adapter-telemetry/"' dist/es/projects/kafka-adapter-telemetry/index.html | `src/components/SEO.astro`, `src/lib/seo.ts` (siteUrl) | done |
| R3 | seo.spec.ts, bash hreflang-alternate grep loop over the 51 dist pages (4 per page · x-default → en), grep -q 'rel="alternate" hreflang="x-default" href="https://jordimp.net/en/about/"' dist/en/about/index.html | `src/lib/seo.spec.ts`, `src/components/SEO.astro`, `src/lib/seo.ts` | done |
| R4 | grep -q 'property="og:title" content="Jordi Marçal Poy — Senior Backend Engineer"' dist/en/index.html, grep -q 'property="og:url" content="https://jordimp.net/ca/about/"' dist/ca/about/index.html, grep -q 'property="og:type" content="website"' dist/en/index.html, grep -q 'property="og:site_name" content="Jordi Marçal Poy"' dist/en/index.html | `src/components/SEO.astro`, `src/lib/seo.ts`, `src/config.ts` | done |
| R5 | seo.spec.ts, grep -q 'property="og:locale" content="es_ES"' dist/es/about/index.html, bash og:locale:alternate count per locale (→ 2 · es_ES + ca_ES on en pages) | `src/lib/seo.spec.ts`, `src/components/SEO.astro`, `src/lib/seo.ts` | done |
| R6 | grep -q 'property="og:image" content="https://jordimp.net/og.png"' dist/en/index.html, grep -q 'property="og:image:width" content="1200"' dist/en/index.html, grep -q 'property="og:image:height" content="630"' dist/en/index.html, grep -q 'property="og:image:alt" content="Jordi Marçal Poy"' dist/ca/cv/index.html | `src/components/SEO.astro`, `src/config.ts` | done |
| R7 | bash file public/og.png (PNG image data 1200 x 630) && wc -c public/og.png (→ 34566 > 5000) && test -f dist/og.png | `public/og.png` (committed asset, ADR-7) | done |
| R8 | grep -q 'name="twitter:card" content="summary_large_image"' dist/en/index.html, grep -q 'name="twitter:title" content="Jordi Marçal Poy — Senior Backend Engineer"' dist/en/index.html, grep -q 'name="twitter:image" content="https://jordimp.net/og.png"' dist/es/experience/index.html | `src/components/SEO.astro` | done |
| R9 | seo.spec.ts, node -e Person JSON-LD parser over the three dist locale homes (exactly one Person · 5 fields pinned) | `src/lib/seo.ts`, `src/lib/seo.spec.ts`, `src/components/SEO.astro` | done |
| R10 | seo.spec.ts, node -e BreadcrumbList parser over the 48 interior dist pages (exactly one each · first=home · last=canonical · positions 1..n) | `src/lib/seo.ts`, `src/lib/seo.spec.ts`, `src/pages/[lang]/{experience,skills,about,cv}.astro`, `src/pages/[lang]/projects/index.astro` | done |
| R11 | seo.spec.ts, node -e project-detail parser over dist/es/projects/kafka-adapter-telemetry/index.html (3 items · middle name Proyectos → /es/projects/ · last = canonical · name from src/content/projects/kafka-adapter-telemetry.json) | `src/pages/[lang]/projects/[slug].astro`, `src/lib/seo.ts`, `src/lib/seo.spec.ts` | done |
| R12 | bash BreadcrumbList absence grep on the three dist locale homes (grep -c → 0 ×3) | `src/components/SEO.astro` (renders BreadcrumbList only when breadcrumbs non-empty) | done |
| R13 | grep -qF 'User-agent: *' dist/robots.txt, grep -qF 'Allow: /' dist/robots.txt, grep -qF 'Sitemap: https://jordimp.net/sitemap-index.xml' dist/robots.txt | `public/robots.txt` (ADR-8) | done |
| R14 | test -f dist/sitemap-index.xml, grep -q 'sitemap-0.xml' dist/sitemap-index.xml | `astro.config.mjs` (@astrojs/sitemap) | done |
| R15 | bash sitemap-0.xml counts after npm run build (51 <loc> · 153 xhtml:link en/es/ca alternates · 0 non-locale URLs · root absent) | `astro.config.mjs` (sitemap filter, ADR-3) | done |
| R16 | llms.spec.ts, bash llms.txt dist greps (^# Jordi Marçal Poy · role · tagline · 11 unique project URLs · 4 page links), curl -sI http://localhost:4321/llms.txt → text/plain | `src/lib/llms.ts`, `src/lib/llms.spec.ts`, `src/pages/llms.txt.ts` | done |
| R17 | llms.spec.ts, bash llms-full.txt dist greps (### count → 20 · 4 sections · spot strings Telefónica/Attendre/Spring Boot 4/email/slug) | `src/lib/llms.ts`, `src/lib/llms.spec.ts`, `src/pages/llms-full.txt.ts` | done |
| R18 | analytics.spec.ts, bash PUBLIC_GOATCOUNTER=jordimp npm run build then grep -rl data-goatcounter dist --include='*.html' count (→ 52) + src grep + plain rebuild restores | `src/components/Analytics.astro`, `src/lib/analytics.ts`, `src/layouts/BaseLayout.astro` | done |
| R19 | analytics.spec.ts, bash default-build goatcounter absence grep over dist (0 matches) | `src/lib/analytics.ts`, `src/lib/analytics.spec.ts`, `src/components/Analytics.astro` | done |
| R20 | grep -q 'name="robots" content="noindex"' dist/404.html | `src/components/SEO.astro` (noindex mode), `src/pages/404.astro` | done |
| R21 | bash 404 absence greps over dist/404.html (rel="canonical" · hreflang alternates · og: · twitter: · application/ld+json → all 0) | `src/components/SEO.astro` (noindex mode), `src/pages/404.astro` | done |

## Final battery (T10)

- `npx vitest run` — 57/57 passed, 0 skipped (7 files; baseline before F3: 26/26
  in 4 files → +31: seo.spec.ts 14 · analytics.spec.ts 5 · llms.spec.ts 12).
- `npx astro check` — 0 errors, 0 warnings.
- `npm run build` — 52 pages built; dist verified: 51-URL sitemap with 153
  alternates, robots.txt, llms.txt, llms-full.txt (20 `### `), og.png (1200×630
  PNG, 34566 bytes), 404 noindex, zero analytics by default.
- `PUBLIC_GOATCOUNTER=jordimp npm run build` — 52/52 BaseLayout pages carry
  `data-goatcounter="https://jordimp.goatcounter.com/count"` +
  `src="https://gc.zgo.at/count.js"` (root redirect stub correctly excluded);
  plain rebuild restores the tracker-free state.
- Preview + curl: both `.txt` endpoints serve `Content-Type: text/plain`.
- `harness/init.sh` — all [OK].

## Notes (verification-path caveats, F1/F2 precedent)

1. **R11 `.item.name` vs sibling `name`.** requirements.md's node script asserts
   `itemListElement[1].item.name === 'Proyectos'` and (same bullet)
   `itemListElement[1].item === 'https://jordimp.net/es/projects/'`. design.md's
   typed shape (authoritative, ADR-6) defines `item: string` with `name` as a
   sibling field on the ListItem — Google's current BreadcrumbList format. The
   executed parser therefore asserts `items[1].name === 'Proyectos'` and
   `items[1].item === 'https://jordimp.net/es/projects/'`; semantics identical.
2. **Single-line HTML counts.** dist HTML is minified to one line, so all
   multi-occurrence counts use `grep -o … | wc -l` (same adjustment F1/F2
   recorded).
3. **Parser-safe Tests column.** Cells contain no commas/pipes and cite either a
   colocated spec file or a command-prefixed verification command, per
   `harness/tools/check-traceability.py` (F2 review round 1 precedent).
4. **`SITE` as single source.** `src/lib/seo.ts` and the llms endpoints derive
   name/role/tagline/email/github/linkedin/url from `src/config.ts`; the
   GoatCounter code comes only from `import.meta.env.PUBLIC_GOATCOUNTER`.
5. **og.png generated once** (ADR-7) via a throwaway sharp script in
   /tmp/opencode — the generator is intentionally not part of the repo; the
   committed PNG is the asset of record.

## Commits

- `5fcce67` feat(seo): pure cores for JSON-LD, GoatCounter endpoint and llms.txt builders (T1-T3)
- `638318d` feat(seo): SEO.astro full head owner (canonical, hreflang, OG, Twitter, JSON-LD, noindex mode) (T4)
- `b84e50e` feat(seo): breadcrumbs on interior pages, 3-item chain on project detail (T5)
- `8132797` feat(seo): robots.txt and sitemap filter dropping the noindex root redirect (T6)
- `7f15109` feat(seo): committed 1200x630 og.png social card in Terminal language (T7)
- `45f6afb` feat(seo): prerendered llms.txt and llms-full.txt endpoints over pure builders (T8)
- `3029975` feat(seo): GoatCounter behind PUBLIC_GOATCOUNTER, off by default (T9)
- (final) chore: T10 verification pass + traceability
