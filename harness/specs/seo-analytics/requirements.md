# Requirements: seo-analytics (F3)

**Scope.** "The system" means the jordimp static front-end (Astro site + build
pipeline) as shipped by `npm run build` into `dist/`, building on the F1
foundation (BaseLayout, `SEO.astro` stub, `@astrojs/sitemap` integration,
`site: 'https://jordimp.net'`) and the F2 page set. The canonical origin is
`https://jordimp.net` (deploy itself is F4; all verification inspects `dist/`
artifacts, which carry the absolute production URLs). The site emits 51 locale
pages — 17 route patterns (`/`, `projects/`, `projects/{slug}/` ×11,
`experience/`, `skills/`, `about/`, `cv/`) × 3 locales — plus `dist/404.html`
and `dist/index.html` (the F1 root redirect, out of F3 scope). Each requirement
lists the concrete command or check that verifies it.

---

## R1
For every locale and every page route (all 51 locale pages), the system shall render a non-empty `<title>` and a non-empty `<meta name="description">` carrying that page's localized copy (en, es and ca titles for the same route differ).

Verification: `npm run build && find dist/en dist/es dist/ca -name 'index.html' | wc -l` → 51, then for every one of those files: `grep -q '<title>.\{1,\}</title>'` and `grep -q '<meta name="description" content=".\{1,\}"'` (loop, zero failures); spot check `grep -q '<title>Experiencia — Jordi Marçal Poy</title>' dist/es/experience/index.html`.

## R2
Every locale page shall render `<link rel="canonical">` with href exactly `https://jordimp.net/{lang}/{path}` (home `https://jordimp.net/{lang}/`, interior `https://jordimp.net/{lang}/{route}/`, project detail `https://jordimp.net/{lang}/projects/{slug}/`).

Verification: `grep -q 'rel="canonical" href="https://jordimp.net/en/"' dist/en/index.html` and `grep -q 'rel="canonical" href="https://jordimp.net/ca/about/"' dist/ca/about/index.html` and `grep -q 'rel="canonical" href="https://jordimp.net/es/projects/kafka-adapter-telemetry/"' dist/es/projects/kafka-adapter-telemetry/index.html` (repeat per locale).

## R3
Every locale page shall render head alternates — one `<link rel="alternate" hreflang>` for each of `en`, `es`, `ca` pointing at `https://jordimp.net/{locale}/{path}`, plus `hreflang="x-default"` pointing at the `en` variant.

Verification: `grep -o 'rel="alternate" hreflang="[a-z-]*" href="[^"]*"' dist/en/about/index.html | wc -l` → 4; `grep -q 'rel="alternate" hreflang="x-default" href="https://jordimp.net/en/about/"' dist/en/about/index.html`; `grep -q 'rel="alternate" hreflang="es" href="https://jordimp.net/es/about/"' dist/en/about/index.html` (repeat per locale).

## R4
Every locale page shall render the Open Graph core set — `og:title` and `og:description` equal to the page title and description, `og:url` equal to the canonical URL, `og:type` `website`, and `og:site_name` `Jordi Marçal Poy`.

Verification: `grep -q 'property="og:title" content="Jordi Marçal Poy — Senior Backend Engineer"' dist/en/index.html` and `grep -q 'property="og:url" content="https://jordimp.net/ca/about/"' dist/ca/about/index.html` and `grep -q 'property="og:type" content="website"' dist/en/index.html` and `grep -q 'property="og:site_name" content="Jordi Marçal Poy"' dist/en/index.html` (repeat per locale).

## R5
Every locale page shall render `og:locale` with its own locale code (`en_US`, `es_ES` or `ca_ES`) and exactly two `og:locale:alternate` tags carrying the other two locale codes.

Verification: `grep -q 'property="og:locale" content="es_ES"' dist/es/about/index.html` and `grep -o 'property="og:locale:alternate"' dist/en/index.html | wc -l` → 2 and `grep -q 'property="og:locale:alternate" content="es_ES"' dist/en/index.html && grep -q 'property="og:locale:alternate" content="ca_ES"' dist/en/index.html` (repeat per locale).

## R6
Every locale page shall render `og:image` `https://jordimp.net/og.png` with `og:image:width` `1200`, `og:image:height` `630`, and `og:image:alt` `Jordi Marçal Poy`.

Verification: `grep -q 'property="og:image" content="https://jordimp.net/og.png"' dist/en/index.html` and `grep -q 'property="og:image:width" content="1200"' dist/en/index.html` and `grep -q 'property="og:image:height" content="630"' dist/en/index.html` and `grep -q 'property="og:image:alt" content="Jordi Marçal Poy"' dist/ca/cv/index.html` (repeat per locale).

## R7
The system shall ship a 1200×630 PNG social card at `public/og.png` (emitted to `dist/og.png` by the build).

Verification: `file public/og.png` → contains `PNG image data` and `1200 x 630`; `wc -c public/og.png` → > 5000 bytes; `npm run build && test -f dist/og.png`.

## R8
Every locale page shall render the Twitter card set — `twitter:card` `summary_large_image`, `twitter:title` and `twitter:description` mirroring the page title and description, and `twitter:image` `https://jordimp.net/og.png`.

Verification: `grep -q 'name="twitter:card" content="summary_large_image"' dist/en/index.html` and `grep -q 'name="twitter:title" content="Jordi Marçal Poy — Senior Backend Engineer"' dist/en/index.html` and `grep -q 'name="twitter:image" content="https://jordimp.net/og.png"' dist/es/experience/index.html` (repeat per locale).

## R9
Every locale page shall embed exactly one `application/ld+json` schema.org `Person` object with `name` `Jordi Marçal Poy`, `jobTitle` `Senior Backend Engineer`, `url` `https://jordimp.net/{lang}/`, `email` `mailto:jordi.marsal@gmail.com`, and `sameAs` exactly [`https://github.com/jordimarsal`, `https://www.linkedin.com/in/jordi-marsal-poy`].

Verification: `npx vitest run` pins the builder (`src/lib/seo.spec.ts`); dist check — `node -e` script over `dist/en/index.html` (repeat `es`, `ca`) that extracts all `application/ld+json` blocks, asserts exactly one has `@type: Person`, and asserts the five fields above.

## R10
Every interior locale page (`projects/`, `projects/{slug}/`, `experience/`, `skills/`, `about/`, `cv/` in all 3 locales) shall embed exactly one `BreadcrumbList` JSON-LD whose first item URL is the locale home `https://jordimp.net/{lang}/`, whose last item URL equals the page canonical URL, and whose `position` values run contiguously from 1.

Verification: `npx vitest run` pins the builder (`src/lib/seo.spec.ts`); dist check — `node -e` script over `dist/en/about/index.html` (and one page per remaining interior route, repeat `es`/`ca`) that extracts the `BreadcrumbList` block and asserts first/last URLs and contiguous positions 1..n.

## R11
When the page is a project detail page, its `BreadcrumbList` shall contain exactly three items: the locale home, the projects index named `Projects`/`Proyectos`/`Projectes` (per `ui.nav.projects`) pointing at `https://jordimp.net/{lang}/projects/`, and the project itself named with the project's `name` content field pointing at its canonical URL.

Verification: `node -e` script over `dist/es/projects/kafka-adapter-telemetry/index.html` that asserts `itemListElement` length 3, `itemListElement[1].item.name === 'Proyectos'`, `itemListElement[1].item === 'https://jordimp.net/es/projects/'`, `itemListElement[2].item === 'https://jordimp.net/es/projects/kafka-adapter-telemetry/'`, and `itemListElement[2].item.name === $(jq -r .name src/content/projects/kafka-adapter-telemetry.json)`; plus `src/lib/seo.spec.ts` (R11 builder shape).

## R12
Home pages (`/{lang}/`) shall not embed any `BreadcrumbList` JSON-LD.

Verification: `! grep -q 'BreadcrumbList' dist/en/index.html` (repeat `es`, `ca`).

## R13
The system shall ship `/robots.txt` allowing every user agent to crawl the whole site and declaring `Sitemap: https://jordimp.net/sitemap-index.xml`.

Verification: `npm run build && grep -qF 'User-agent: *' dist/robots.txt && grep -qF 'Allow: /' dist/robots.txt && grep -qF 'Sitemap: https://jordimp.net/sitemap-index.xml' dist/robots.txt`.

## R14
When the build runs, the system shall emit `/sitemap-index.xml` referencing the generated sitemap file (`sitemap-0.xml`).

Verification: `npm run build && test -f dist/sitemap-index.xml && grep -q 'sitemap-0.xml' dist/sitemap-index.xml`.

## R15
The generated sitemap shall contain exactly the 51 localized page URLs (17 route patterns × 3 locales), each carrying `xhtml:link` hreflang alternates for `en`, `es` and `ca` — and no other URLs (no root redirect, no 404, no non-HTML assets).

Verification: `grep -o '<loc>' dist/sitemap-0.xml | wc -l` → 51; `grep -o 'xhtml:link rel="alternate" hreflang="\(en\|es\|ca\)"' dist/sitemap-0.xml | wc -l` → 153; `grep -o '<loc>[^<]*</loc>' dist/sitemap-0.xml | grep -vc '<loc>https://jordimp.net/\(en\|es\|ca\)/'` → 0; `! grep -q '<loc>https://jordimp.net/</loc>' dist/sitemap-0.xml`.

## R16
When the build runs, the system shall emit `/llms.txt` as a UTF-8 plain-text file containing an H1 with `SITE.name`, a summary line carrying `SITE.role` and `SITE.tagline`, a `## Projects` section linking all 11 projects at `https://jordimp.net/en/projects/{slug}/`, and a `## Pages` section linking `about`, `cv`, `experience` and `skills`.

Verification: `test -f dist/llms.txt && grep -q '^# Jordi Marçal Poy' dist/llms.txt && grep -q 'Senior Backend Engineer' dist/llms.txt && grep -q 'Java · Python · AI/LLM' dist/llms.txt`; `grep -o 'https://jordimp.net/en/projects/[a-z0-9-]*/' dist/llms.txt | sort -u | wc -l` → 11; `for p in about cv experience skills; do grep -q "https://jordimp.net/en/$p/" dist/llms.txt || exit 1; done`; content type via `npm run build && (npm run preview &) && sleep 2 && curl -sI http://localhost:4321/llms.txt | grep -qi 'content-type: text/plain'`. Builder behavior pinned by `npx vitest run` (`src/lib/llms.spec.ts`).

## R17
When the build runs, the system shall emit `/llms-full.txt` as a UTF-8 plain-text file containing the complete English content of every collection: all 11 projects (name, year, summary, problem, highlights, stack, repository link), all 4 experience entries (company, role, period, points), all 5 skill groups with their items, and the bio + contact block (`SITE.email`, GitHub, LinkedIn).

Verification: `test -f dist/llms-full.txt && grep -c '^### ' dist/llms-full.txt` → 20 (11 projects + 4 experience + 5 skills); `grep -q '## Projects' dist/llms-full.txt && grep -q '## Experience' dist/llms-full.txt && grep -q '## Skills' dist/llms-full.txt && grep -q '## Contact' dist/llms-full.txt`; spot strings `grep -q 'Telefónica' dist/llms-full.txt && grep -q 'Attendre' dist/llms-full.txt && grep -q 'Spring Boot 4' dist/llms-full.txt && grep -q 'jordi.marsal@gmail.com' dist/llms-full.txt && grep -q 'kafka-adapter-telemetry' dist/llms-full.txt`. Builder behavior pinned by `npx vitest run` (`src/lib/llms.spec.ts`).

## R18
WHERE `PUBLIC_GOATCOUNTER` is set to a non-empty code at build time, every page rendered through `BaseLayout` shall include the GoatCounter script with `data-goatcounter="https://{code}.goatcounter.com/count"` and `src="https://gc.zgo.at/count.js"`.

Verification: `PUBLIC_GOATCOUNTER=jordimp npm run build && grep -rlc 'data-goatcounter="https://jordimp.goatcounter.com/count"' dist --include='*.html' | wc -l` → 52 (51 locale pages + 404; the F1 root-redirect stub does not go through `BaseLayout`); `grep -q 'src="https://gc.zgo.at/count.js"' dist/en/index.html`; then a plain `npm run build` restores the clean state. Mapping logic pinned by `npx vitest run` (`src/lib/analytics.spec.ts`).

## R19
WHERE `PUBLIC_GOATCOUNTER` is unset or empty (the default), the system shall not render any analytics script or goatcounter reference on any built page.

Verification: `npm run build && ! grep -rq 'goatcounter' dist/`; plus `src/lib/analytics.spec.ts` asserts the empty/whitespace code maps to no script.

## R20
The 404 page shall render `<meta name="robots" content="noindex">`.

Verification: `npm run build && grep -q 'name="robots" content="noindex"' dist/404.html`.

## R21
The 404 page shall not render a canonical link, head hreflang alternates, Open Graph tags, Twitter card tags, or any JSON-LD.

Verification: `! grep -q 'rel="canonical"' dist/404.html && ! grep -q 'rel="alternate" hreflang' dist/404.html && ! grep -q 'property="og:' dist/404.html && ! grep -q 'name="twitter:' dist/404.html && ! grep -q 'application/ld+json' dist/404.html`.
