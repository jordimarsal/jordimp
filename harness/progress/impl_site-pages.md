# Implementation report — site-pages (F2)

Branch `feat/front-phase-0-1` · spec `harness/specs/site-pages/` (R1–R28, T1–T10)
· plan Tasks 8–10. Style locked: **A · Terminal** (ADR-1). All tasks T1–T10
executed in order; every task ended green (`npx vitest run`, `npm run check`,
`npm run build`).

## Traceability

| R | Test(s) | Implementation file(s) | Status |
|---|---|---|---|
| R1 | npm run build && grep -q '>Jordi Marçal Poy</h1>' dist/en/index.html && grep -o 'class="hero-prompt[^"]*">\$ [^<]*' dist/es/index.html && grep -o 'class="hero-prompt[^"]*">\$ [^<]*' dist/ca/index.html | `src/pages/[lang]/index.astro`, `src/components/HeroPrompt.astro`, `src/i18n/ui.ts` | done |
| R2 | grep -q 'href="/en/projects/"' dist/en/index.html && grep -q 'href="/en/cv/"' dist/en/index.html && grep -q 'href="/es/cv/"' dist/es/index.html && grep -q 'href="/ca/cv/"' dist/ca/index.html | `src/pages/[lang]/index.astro` | done |
| R3 | grep -q 'href="/en/ask/"' dist/en/index.html && grep -q 'aria-disabled="true"' dist/es/index.html && grep -qF 'title="phase 3"' dist/ca/index.html | `src/pages/[lang]/index.astro` | done |
| R4 | grep -o 'class="card pillar' dist/en/index.html \| wc -l → 3 && grep -q '>llama.cpp<' dist/en/index.html && grep -q '>CI/CD<' dist/en/index.html | `src/pages/[lang]/index.astro` | done |
| R5 | grep -o 'class="card project-card' dist/en/index.html \| wc -l → 3 && grep -o 'href="/en/projects/[a-z0-9_-]*/"' dist/en/index.html | `src/pages/[lang]/index.astro`, `src/components/ProjectCard.astro` | done |
| R6 | grep -o 'href="/en/experience/"' dist/en/experience/index.html \| wc -l → ≥1 && grep -q 'href="/en/cv/"' dist/en/skills/index.html | `src/components/HeaderNav.astro`, `src/layouts/BaseLayout.astro` | done |
| R7 | grep -o 'aria-current="page"' dist/en/experience/index.html \| wc -l → 1 && grep -o 'aria-current="page"' dist/en/index.html \| wc -l → 0 | `src/components/HeaderNav.astro` | done |
| R8 | grep -q 'aria-label="JM"' dist/en/projects/index.html && grep -qF 'Built with Astro' dist/en/projects/index.html && grep -q 'hreflang=' dist/en/projects/index.html | `src/layouts/BaseLayout.astro`, `src/components/{Monogram,Footer,LocaleSwitcher}.astro` | done |
| R9 | experience.spec.ts, npm run build | `src/content/experience/{telefonica-open-gateway,axpe-mapfre,zitro,attendre}.json` | done |
| R10 | grep -o 'Telefónica\|Axpe\|Zitro\|Attendre' dist/en/experience/index.html && grep -q 'class="timeline' dist/en/experience/index.html | `src/pages/[lang]/experience.astro` | done |
| R11 | grep -o 'data-current="true"' dist/en/experience/index.html \| wc -l → 1 && grep -o 'data-current="true"' dist/es/experience/index.html \| wc -l → 1 && grep -o 'data-current="true"' dist/ca/experience/index.html \| wc -l → 1 | `src/pages/[lang]/experience.astro` | done |
| R12 | skills.spec.ts, npm run build | `src/content/skills/{backend-apis,data,ai-llms,devops-quality,leadership}.json` | done |
| R13 | grep -o 'class="card skill-group' dist/en/skills/index.html \| wc -l → 5 && grep -q '>Spring Boot 4<' dist/en/skills/index.html | `src/pages/[lang]/skills.astro` | done |
| R14 | grep -q 'Cómo trabajo' dist/es/about/index.html && grep -q 'prose' dist/es/about/index.html | `src/pages/[lang]/about.astro`, `src/i18n/ui.ts` | done |
| R15 | grep -o 'mailto:' dist/en/about/index.html \| wc -l → 1-line count && grep -q 'github.com/jordimarsal' dist/en/about/index.html && grep -q 'linkedin.com/in/jordi-marsal-poy' dist/en/about/index.html && grep -qF 'mail -s' dist/en/about/index.html | `src/pages/[lang]/about.astro` | done |
| R16 | experience.spec.ts, skills.spec.ts, i18n.spec.ts, grep -rq '609 940 649' dist/ (must not match) | `src/content/{experience,skills}.spec.ts`, `src/lib/i18n.spec.ts` (ui canary, F1) | done |
| R17 | grep -o 'mailto:jordi.marsal@gmail.com?subject=Portfolio%20contact' dist/en/experience/index.html \| wc -l → 1 && grep -q 'github.com/jordimarsal' dist/en/experience/index.html && grep -q 'linkedin.com/in/jordi-marsal-poy' dist/en/experience/index.html | `src/components/Footer.astro` | done |
| R18 | grep -oF 'Built with Astro' dist/en/experience/index.html \| wc -l → 1 && grep -q 'local LLM' dist/en/experience/index.html && grep -qF 'Jordi Marçal Poy' dist/en/experience/index.html && grep -q '©' dist/en/experience/index.html | `src/components/Footer.astro` | done |
| R19 | test -f dist/404.html && grep -q 'Page not found' dist/404.html && grep -q 'href="/en/"' dist/404.html | `src/pages/404.astro` | done |
| R20 | find dist -name '*.html' ! -path 'dist/en/*' ! -path 'dist/es/*' ! -path 'dist/ca/*' → dist/404.html + dist/index.html | `src/pages/404.astro` | done |
| R21 | grep -q 'href="/cv/Jordi-Marcal-Poy-CV-EN.pdf" download' dist/en/cv/index.html && grep -q 'href="/cv/Jordi-Marcal-Poy-CV-ES.pdf" download' dist/en/cv/index.html && grep -q 'window.print' dist/en/cv/index.html | `src/pages/[lang]/cv.astro` | done |
| R22 | head -c 4 dist/cv/Jordi-Marcal-Poy-CV-EN.pdf → %PDF && head -c 4 dist/cv/Jordi-Marcal-Poy-CV-ES.pdf → %PDF && wc -c dist/cv/*.pdf → 53711 / 54457 | `public/cv/*.pdf` (verbatim copies from `~/Documents/CV`) | done |
| R23 | grep -qF '@media print' dist/_astro/*.css && grep -qF '.no-print' dist/_astro/*.css && grep -qF 'display:none' dist/_astro/*.css | `src/styles/global.css` | done |
| R24 | grep -q 'Telefónica' dist/en/cv/index.html && grep -q '>Spring Boot 4<' dist/en/cv/index.html | `src/pages/[lang]/cv.astro` | done |
| R25 | i18n.spec.ts, npm run check | `src/i18n/ui.ts` | done |
| R26 | grep -q 'aria-hidden="true">./</span>Experience' dist/en/experience/index.html && grep -q 'aria-hidden="true">./</span>CV' dist/en/cv/index.html && grep -q 'aria-hidden="true">./</span>404' dist/404.html | `src/components/PageTitle.astro`, `src/styles/global.css` | done |
| R27 | grep -oF 'content:"## "' dist/_astro/*.css → ≥1 && grep -q 'section-h2' dist/en/cv/index.html | `src/styles/global.css`, `src/pages/[lang]/{index,about,cv}.astro` | done |
| R28 | grep -q 'prompt-cursor' dist/en/index.html && grep -o 'prompt-cursor[^}]*animation[^}]*}' dist/_astro/*.css → ≥1 && grep -q 'prefers-reduced-motion:reduce' dist/_astro/*.css | `src/components/HeroPrompt.astro`, `src/styles/global.css` | done |

Final battery: `npx vitest run` 26/26 · `npm run check` 0 errors / 0 warnings ·
`npm run build` 48 pages · `bash harness/init.sh` all OK.

Security audit: no new HIGH findings in F2; the persistent astro CRITICAL stays
under the F1 waiver of record —
`harness/progress/impl_front-foundation.md` §Security audit disposition
(static-only scope, re-gate at F5).

## Notes (verification-path caveats, F1 precedent ²)

1. **R18 `&` escaping.** Astro correctly HTML-escapes `&` in text nodes
   (`&amp;`), so the prescribed byte-grep for `… Java 25 & a local LLM` cannot
   match; behavior and display are correct. Corrected evidence:
   `grep -qF 'Built with Astro, Java 25 &amp; a local LLM'`.
2. **R28 minified media query.** esbuild minifies
   `prefers-reduced-motion: reduce` → `prefers-reduced-motion:reduce`
   (space stripped). Rule present and inherited by the cursor blink; verified
   with the minified form.
3. **Single-line HTML counts.** `grep -c` counts lines; dist HTML is minified
   to one line, so R4/R5/R13/R15/R17 counts use `grep -o … | wc -l` (same
   adjustment F1 recorded and R23 itself prescribes).
4. **`build.inlineStylesheets: 'never'`** added to `astro.config.mjs`: Astro's
   default inlines page CSS into HTML, which would leave `dist/_astro/*.css`
   empty and make the prescribed R23/R28 greps impossible. With the setting,
   all CSS ships in `dist/_astro/*.css` (cacheable, greppable).
5. **`PageTitle.astro` / `HeroPrompt.astro` carry no `<style>` block** — Astro
   adds `data-astro-cid-*` to every element of a component with scoped styles,
   which breaks R1/R26's literal greps (`aria-hidden="true">./</span>` and
   `class="hero-prompt…">$`). Their chrome styles live in `global.css`
   (`.page-h1`, `.hero-prompt`, `.prompt-cursor`), keeping the markup byte-
   greppable and the Terminal h1/prompt DRY across 5 pages.
6. **Parser-safe Tests column (review round 1).** Counts/annotations moved out
   of the table cells for `check-traceability.py` (semantics unchanged):
   `experience.spec.ts` = 6 tests, `skills.spec.ts` = 5 tests,
   `src/lib/i18n.spec.ts` F2 block ("ui dictionary — F2 strings") = 4 tests;
   R16 negative check executed (insert `609940649` → 2 tests failed →
   reverted) and the final `grep -rq '609 940 649' dist/` must not match;
   R26 home h1 stays plain `SITE.name`; the ×locale shorthand is expanded into
   explicit per-locale commands (R2, R11) and brace sets into `&&` chains.

## Commits (conventional increments)

- `76ceea8` feat(i18n): fix hero.role es/ca, add projects.featured, notfound.back, about.bio/value keys (T1)
- `bf77d95` feat: HeaderNav and Footer components, BaseLayout chrome via slot fallbacks (T2)
- `f28522f` feat(content): 4 experience entries with plan facts and colocated contract spec (T3)
- `da35448` feat(content): 5 skill groups with fixed order and colocated contract spec (T4)
- `dadcdac` feat: home hero, pillars and featured strip; keep built CSS in dist/_astro (T5)
- `8887c56` feat: experience timeline and skills grid pages with Terminal chrome (T6)
- `0a5746a` feat: about page with bio, values card and shell-command contact block (T7)
- `b707197` feat: root 404 page through BaseLayout with Terminal chrome (T8)
- `08ae488` feat: cv page with pdf downloads, print styles and on-page summary (T9)
- (final) chore: T10 traceability + progress log
