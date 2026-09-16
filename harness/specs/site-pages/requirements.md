# Requirements: site-pages (F2)

**Scope.** "The system" means the jordimp static front-end (Astro site + build
pipeline) as shipped by `npm run build` into `dist/`, on branch
`feat/front-phase-0-1`, implementing plan Tasks 8–10 of
`docs/superpowers/plans/2026-09-16-portfolio-phase0-1-front.md`. F2 replaces the
placeholder home page and completes the page set: home, experience, skills,
about + contact, footer, 404, CV page. The visual language is the
human-approved **Direction A · Terminal** (see design.md ADR-1). Each
requirement lists the concrete command or check that verifies it.

---

## R1
For every locale, the system shall render the home route `/{lang}/` through `BaseLayout` with a hero containing an `<h1>` whose text is `SITE.name`, a mono prompt line prefixed `$` composed of `ui.hero.role` and `SITE.tagline`, and the `ui.hero.tagline` sentence.

Verification: `npm run build && grep -q '>Jordi Marçal Poy</h1>' dist/en/index.html && grep -o 'class="hero-prompt[^"]*">\$ [^<]*' dist/en/index.html` (repeat for `es`, `ca`).

## R2
The home hero shall render a primary CTA labeled `ui.hero.cta.projects` linking to `/{lang}/projects/` and a secondary CTA labeled `ui.hero.cta.cv` linking to `/{lang}/cv/`, for every locale.

Verification: `grep -q 'href="/en/projects/"' dist/en/index.html && grep -q 'href="/en/cv/"' dist/en/index.html` (repeat for `es`, `ca`).

## R3
The home hero shall render the third CTA (`ui.hero.cta.ask`) in every locale as a link to exactly `/en/ask/` carrying `aria-disabled="true"` and `title="phase 3"`.

Verification: `grep -q 'href="/en/ask/"' dist/es/index.html && grep -q 'aria-disabled="true"' dist/es/index.html && grep -qF 'title="phase 3"' dist/es/index.html` (repeat for `en`, `ca`).

## R4
The home page shall render exactly three pillar cards sourced from `ui.hero.pillar1..3.title/desc`, each listing its fixed mono chip set (pillar 1: `Java 25`, `Spring Boot 4`, `FastAPI`; pillar 2: `Kafka`, `RAG`, `llama.cpp`; pillar 3: `TDD`, `hexagonal`, `CI/CD`).

Verification: `grep -c 'class="card pillar' dist/en/index.html` → 3 and `grep -q '>llama.cpp<' dist/en/index.html && grep -q '>CI/CD<' dist/en/index.html`.

## R5
When the home page builds, the system shall render a featured strip of exactly 3 `ProjectCard`s — the featured projects sorted by year descending then name ascending, truncated to the first three (codebaserag, harness-standard, kafka-adapter-telemetry) — followed by a link to `/{lang}/projects/`.

Verification: `grep -c 'project-card' dist/en/index.html` → 3 and `grep -o 'href="/en/projects/[a-z0-9_-]*/"' dist/en/index.html` lists codebaserag, harness-standard, kafka-adapter-telemetry in that order.

## R6
The system shall render a `HeaderNav` component in the `BaseLayout` nav slot on every emitted page, containing exactly five links — projects, experience, skills, about, cv — labeled from `ui.nav.*` and pointing at `/{lang}/<route>/`.

Verification: `npm run build && grep -c 'href="/en/experience/"' dist/en/experience/index.html` → ≥1 (nav + any in-page occurrence) and `grep -q 'href="/en/cv/"' dist/en/skills/index.html`.

## R7
When a `HeaderNav` target equals the current page path, the system shall set `aria-current="page"` on that link and on no other nav link.

Verification: `grep -c 'aria-current="page"' dist/en/experience/index.html` → 1; `grep -c 'aria-current="page"' dist/en/index.html` → 0.

## R8
The system shall render `Monogram` in the logo slot, `HeaderNav` in the nav slot, `LocaleSwitcher` in the actions slot, and `Footer` in the footer slot of every page emitted through `BaseLayout` (slot fallbacks), so that pages which fill none of these slots themselves (projects index, project detail) gain identical chrome without page-level edits.

Verification: `grep -q 'aria-label="JM"' dist/en/projects/index.html && grep -qF 'Built with Astro' dist/en/projects/index.html && grep -q 'hreflang=' dist/en/projects/index.html`.

## R9
The system shall ship exactly 4 experience entries validating against the existing Zod schema — `telefonica-open-gateway` (period `2022–present`, `current: true`, `order: 1`), `axpe-mapfre` (period `Jan–May 2026`, `order: 2`), `zitro` (period `2020–2022`, `order: 3`), `attendre` (period `2017–2020`, `order: 4`) — with localized `role` and `points` in en, es and ca, carrying exactly the plan facts (no invention).

Verification: `npx vitest run` — colocated `src/content/experience.spec.ts` (count, order, trilingual completeness, `current` uniqueness) and `npm run build` (Zod validation).

## R10
When `/{lang}/experience/` builds, the system shall emit a vertical timeline rendering all 4 entries sorted by `order` ascending (newest first), each with a company heading, a mono period label, its localized points list, and stack chips.

Verification: `grep -o 'Telefónica\|Axpe\|Zitro\|Attendre' dist/en/experience/index.html` appears in that newest-first order, and `grep -q 'class="timeline' dist/en/experience/index.html`.

## R11
The system shall mark exactly one timeline entry — the entry with `current: true` (`telefonica-open-gateway`) — with `data-current="true"` and a visible current marker.

Verification: `grep -c 'data-current="true"' dist/en/experience/index.html` → 1 (repeat for `es`, `ca`).

## R12
The system shall ship exactly 5 skill-group entries validating against the existing Zod schema — `backend-apis`, `data`, `ai-llms`, `devops-quality`, `leadership` — with fixed `order` 1–5, localized `group` titles, and English technical `items`.

Verification: `npx vitest run` — colocated `src/content/skills.spec.ts` (count, fixed order, trilingual group titles, non-empty items).

## R13
When `/{lang}/skills/` builds, the system shall render five group cards ordered by `order`, each listing all of its items.

Verification: `grep -c 'class="card skill-group' dist/en/skills/index.html` → 5 and `grep -q '>Spring Boot 4<' dist/en/skills/index.html`.

## R14
The about page shall render, for every locale, a `prose` bio sourced from the professional profile and a values card titled by `ui.about.values.title` listing the ways of working (SOLID/Clean Code/TDD, Tell Don't Ask, I/O at the edges, knowledge sharing).

Verification: `grep -q 'Cómo trabajo' dist/es/about/index.html && grep -q 'prose' dist/es/about/index.html`.

## R15
The about page shall render a contact block of exactly three links — `mailto:jordi.marsal@gmail.com?subject=Portfolio%20contact`, `https://github.com/jordimarsal`, `https://www.linkedin.com/in/jordi-marsal-poy` — presented as shell commands (e.g. `mail -s "Portfolio contact" jordi.marsal@gmail.com`).

Verification: `grep -c 'mailto:' dist/en/about/index.html` → 1 and `grep -q 'github.com/jordimarsal' dist/en/about/index.html && grep -q 'linkedin.com/in/jordi-marsal-poy' dist/en/about/index.html && grep -qF 'mail -s' dist/en/about/index.html`.

## R16
IF any shipped content entry (`src/content/experience/*.json`, `src/content/skills/*.json`) or `ui` string contains a 9-digit run (phone number), THEN the test suite shall fail (canary extended from the F1 `ui`-only canary to the new content collections).

Verification: `npx vitest run` — the canary iterates experience/skills JSONs; negative check: inserting `609940649` into any entry fails the run; plus `! grep -rq '609 940 649' dist/`.

## R17
The `Footer` component shall render the `ui.footer.contact` label with exactly three links — the pre-filled mailto (`subject=Portfolio%20contact`), GitHub, and LinkedIn.

Verification: `grep -c 'mailto:jordi.marsal@gmail.com?subject=Portfolio%20contact' dist/en/experience/index.html` → 1 and `grep -q 'github.com/jordimarsal' dist/en/experience/index.html && grep -q 'linkedin.com/in/jordi-marsal-poy' dist/en/experience/index.html`.

## R18
The `Footer` component shall render `ui.footer.builtWith` and the copyright line `© {build year} Jordi Marçal Poy`.

Verification: `grep -qF 'Built with Astro, Java 25 & a local LLM' dist/en/experience/index.html && grep -qF 'Jordi Marçal Poy' dist/en/experience/index.html && grep -q '©' dist/en/experience/index.html`.

## R19
When an unknown path is requested, the system shall serve the root `404.html` — an English page rendered through `BaseLayout` displaying `notfound.title`, `notfound.body`, and a link to `/en/`.

Verification: `npm run build && test -f dist/404.html && grep -q 'Page not found' dist/404.html && grep -q 'href="/en/"' dist/404.html`.

## R20
The system shall emit exactly two HTML pages outside the locale-prefixed routes: `dist/index.html` (the `/` → `/en/` redirect delivered by F1) and `dist/404.html`.

Verification: `find dist -name '*.html' ! -path 'dist/en/*' ! -path 'dist/es/*' ! -path 'dist/ca/*'` → exactly `dist/index.html` and `dist/404.html`.

## R21
The CV page shall render, for every locale, two download links with the `download` attribute — `cv.download.en` → `/cv/Jordi-Marcal-Poy-CV-EN.pdf`, `cv.download.es` → `/cv/Jordi-Marcal-Poy-CV-ES.pdf` — and a print button (`cv.print`) that invokes `window.print()`.

Verification: `grep -q 'href="/cv/Jordi-Marcal-Poy-CV-EN.pdf" download' dist/en/cv/index.html && grep -q 'href="/cv/Jordi-Marcal-Poy-CV-ES.pdf" download' dist/en/cv/index.html && grep -q 'window.print' dist/en/cv/index.html`.

## R22
The system shall ship the two real CV PDFs (`CV Jordi Marçal 2026-09 Senior EN/ES.pdf`, copied from `~/Documents/CV`) at `public/cv/` under clean kebab-case names, emitted to `dist/cv/` as non-empty files starting with the `%PDF` magic bytes.

Verification: `npm run build && head -c 4 dist/cv/Jordi-Marcal-Poy-CV-EN.pdf` → `%PDF` and `head -c 4 dist/cv/Jordi-Marcal-Poy-CV-ES.pdf` → `%PDF` and `wc -c dist/cv/*.pdf` → both > 10000 bytes.

## R23
While printing, the system shall hide `header`, `footer`, and `.no-print` elements and force black-on-white body colors via a `@media print` block in `src/styles/global.css`.

Verification: `grep -qF '@media print' dist/_astro/*.css && grep -qF '.no-print' dist/_astro/*.css && grep -qF 'display:none' dist/_astro/*.css` (minified single-line CSS — use `grep -o … | wc -l` when counting).

## R24
The CV page shall render an on-page HTML summary built from the same content collections — compact experience entries and the five skill groups — below the download actions, so the page is useful without downloading.

Verification: `grep -q 'Telefónica' dist/en/cv/index.html && grep -q '>Spring Boot 4<' dist/en/cv/index.html`.

## R25
The `ui` dictionary shall fix the F1 review defect on `hero.role` — es `Ingeniero Backend Senior`, ca `Enginyer de Software Backend Sènior`, en unchanged — and shall add the new keys (`projects.featured`, `notfound.back`, `about.bio.p1`–`p3`, `about.value.1`–`4`) in all three locales with strict `UiKey` parity.

Verification: `npm run check` (compile-time `Record<UiKey, string>`) and `npx vitest run` (key parity + new exact-value assertions).

## R26
The interior F2 pages (`experience`, `skills`, `about`, `cv`) and the 404 page shall render their `<h1>` with a literal `./` prefix in mono muted styling hidden from assistive technology (`aria-hidden="true"`); the home `<h1>` remains the plain `SITE.name`.

Verification: `grep -q 'aria-hidden="true">./</span>Experience' dist/en/experience/index.html && grep -q 'aria-hidden="true">./</span>CV' dist/en/cv/index.html && grep -q 'aria-hidden="true">./</span>404' dist/404.html`.

## R27
The system shall style section-level `<h2>` headings on F2 pages with a CSS-generated `##` prefix (a shared `.section-h2` class whose `::before` renders `## `), keeping heading text nodes clean for assistive technology.

Verification: `grep -oF 'content:"## "' dist/_astro/*.css` → ≥1 match and `grep -q 'section-h2' dist/en/cv/index.html`.

## R28
The home hero prompt line shall render a block-cursor element with a CSS blink animation, and while `prefers-reduced-motion: reduce` is active the system shall disable that animation (inherited from the global reduced-motion rule shipped in F1).

Verification: `grep -q 'prompt-cursor' dist/en/index.html && grep -o 'prompt-cursor[^}]*animation[^}]*}' dist/_astro/*.css` → ≥1 match and `grep -qF 'prefers-reduced-motion: reduce' dist/_astro/*.css`.
