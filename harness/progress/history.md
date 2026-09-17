# Historical log (append-only)

> Each time a session closes, its summary is appended here.
> Do not edit previous entries. Only append.

## F1 front-foundation — done (2026-09-16)

- Scope: Astro 5 scaffold i18n en/es/ca, design tokens (dark/light, teal accent), BaseLayout/ThemeToggle/Monogram, LocaleSwitcher, typed trilingual content collections (11 projectes: 5 destacats), projects index amb filtre per stack + 33 pàgines de detall, CV-ready SEO stub.
- Commits: cf3f29b..531ed92 (+ 8c14322, 253057e, 380b2e5, 45b05f9 de traçabilitat/audit).
- Gates: spec aprovada (humà) · traceability 21/21 PASS · vitest 11/11 · build 39 pàgines · init.sh [OK] · audit strict amb waiver astro-crític (re-gate a F5).
- Rulings: ThemeToggle cablejat a BaseLayout (R9); check-traceability.py estès a specs col·localitzats TS; overrides sharp/esbuild; Astro^5 pin (upgrade v7 a F5/Phase 4).
- Review: APPROVED (ronda 2) — harness/progress/review_front-foundation.md.

## F2 site-pages — done (2026-09-17)

- Scope: Home (hero, pilars, strip destacats, HeaderNav), timeline d'experiència, grid de skills, about + contacte, footer, 404, pàgina CV amb descàrregues i estils print. Trilingüe (en/es/ca).
- Commits: 76ceea8..2f3da86 (+ 08b9fc2 taula traçabilitat, f0cbfc2 fix harness check-traceability.py, 06ba548 aprovació review).
- Gates: spec aprovada (humà) · vitest 26/26 · check 0/0 · build 39+ pàgines · traceability 21/21 + 28/28 PASS · audit strict (waiver astro CRITIC mantingut de F1, re-gate a F5) · init.sh [OK] · completion gate humà "Aprovat i continua" (2026-09-17).
- Review: APPROVED (condició mecànica satisfeta, ronda 2) — harness/progress/review_site-pages.md.
- Rulings: check-traceability.py amb taules R-id per-feature (collect_tables scoped a impl_<feature>.md); candidat a upstream harness-standard (tokens command-evidence, specs TS col·localitzats).
- Wekan: fitxa PZp3EKBmy2vTZHpdN moguda a llista done.

## F3 seo-analytics — done (2026-09-17)

- Scope: SEO.astro head owner complet (titles/descriptions localitzats, canonical, hreflang en/es/ca + x-default, OG amb og:locale/alternates + og.png, Twitter card), JSON-LD Person + BreadcrumbList (3 items a project detail amb nav.projects localitzat), robots.txt, sitemap 51 URLs × 3 alternates (filter treu el root redirect; corregeix defecte 52 locs), llms.txt + llms-full.txt prerenderitzats (EN) sobre builders purs, GoatCounter darrere PUBLIC_GOATCOUNTER (off per defecte, 0 analytics quan unset), 404 noindex sense canonical/hreflang/OG/JSON-LD.
- Commits: 5fcce67..96c96f0 (8: nuclis purs seo/analytics/llms, SEO.astro, breadcrumbs, robots+sitemap, og.png, endpoints llms, GoatCounter, T10 verificació) + f8c6c22 aprovació review + 877cd11 estat harness.
- Gates: spec aprovada (humà) · vitest 57/57 (des de 26) · astro check 0 errors · build 52 pàgines · traceability 21/21 (check --all: 21+28+21 PASS) · audit: només CRITIC astro conegut (waiver F1 de record, re-gate a F5) · init.sh [OK] · completion gate humà "f3 ok" (2026-09-17).
- Review: APPROVED (ronda 1, 0 canvis) — harness/progress/review_seo-analytics.md. R11 deviation ACCEPTED: assert sobre `name` sibling (design shape `item: string`, format Google actual) en lloc de `itemListElement[1].item.name`.
- Notes: nuclis purs amb vitest specs col·localitzats (seo 14, analytics 5, llms 12); GoatCounter variant provada amb grep 52 pàgines i restaurada; set:html només amb sortida JSON escapada test-pinned (nota d'abast del waiver).
- Wekan: fitxa RmGwcc5zr3NYcHt9D moguda a llista done.
