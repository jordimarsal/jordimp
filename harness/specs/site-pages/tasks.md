# Tasks: site-pages

> Order matters: strings and chrome first, then content, then pages, then a
> full verification pass. Every task ends green (`npx vitest run`,
> `npm run check`, `npm run build`). TDD: write the colocated spec before the
> content/pages it pins.

- [x] T1: `src/i18n/ui.ts` — fix `hero.role` (es `Ingeniero Backend Senior`, ca `Enginyer de Software Backend Sènior`); add trilingual keys `projects.featured`, `notfound.back`, `about.bio.p1`–`p3`, `about.value.1`–`4`; extend the colocated ui/i18n specs with exact-value assertions for the fixed strings (key-parity and no-empty tests pick up the new keys automatically)
      depends_on: (none)
      refs: R25

- [x] T2: Base chrome — `HeaderNav.astro` (5 localized links, build-time `aria-current="page"` from `path`), `Footer.astro` (3 contact links with `subject=Portfolio%20contact`, `builtWith`, `© {year} {SITE.name}`), and `BaseLayout` slot fallbacks (logo → `Monogram`, nav → `HeaderNav`, actions → `LocaleSwitcher`, footer → `Footer`); verify the F1 projects pages gain the chrome with zero edits
      depends_on: T1
      refs: R6, R7, R8, R17, R18

- [x] T3: Experience content — `src/content/experience/{telefonica-open-gateway,axpe-mapfre,zitro,attendre}.json` with the plan facts verbatim (roles/points trilingual, technical terms English, `order` 1–4, one `current: true`) + colocated `src/content/experience.spec.ts` (count, order, current uniqueness, trilingual completeness, phone canary)
      depends_on: T1
      refs: R9, R16

- [x] T4: Skills content — `src/content/skills/{backend-apis,data,ai-llms,devops-quality,leadership}.json` (fixed `order` 1–5, localized group titles, English technical items) + colocated `src/content/skills.spec.ts` (count, order, trilingual titles, non-empty items, phone canary)
      depends_on: T1
      refs: R12, R16

- [x] T5: Home page — replace the placeholder `src/pages/[lang]/index.astro`: hero (h1 `SITE.name`, mono `$` prompt line `hero.role · SITE.tagline` with block-cursor blink element, tagline), CTAs (projects → `/{lang}/projects/`, cv → `/{lang}/cv/`, ask → `/en/ask/` with `aria-disabled="true"` + `title="phase 3"`), three pillar cards with fixed mono chip sets, featured strip (3 `ProjectCard`s, sort featured → year desc → name asc, truncated, + see-all link)
      depends_on: T2
      refs: R1, R2, R3, R4, R5, R28

- [x] T6: Experience + skills pages — `[lang]/experience.astro` (timeline: left border, `●` nodes, mono periods, company h2, points, chips, `data-current="true"` on the single current entry) and `[lang]/skills.astro` (5 `.card.skill-group` cards ordered by `order`); interior h1s with the `aria-hidden` `./` prefix span; add the shared `.section-h2::before { content: '## '; }` rule to `global.css`
      depends_on: T2, T3, T4
      refs: R10, R11, R13, R26, R27

- [ ] T7: About page — `[lang]/about.astro`: `prose` bio from `about.bio.p1–p3`, values card (`about.values.title` + `about.value.1–4`), contact block styled as shell commands with exactly the three links (`mailto:jordi.marsal@gmail.com?subject=Portfolio%20contact`, GitHub, LinkedIn); `./` h1
      depends_on: T2
      refs: R14, R15, R26

- [ ] T8: 404 page — root `src/pages/404.astro` through `BaseLayout` (EN): `notfound.title`, `notfound.body`, `./404` h1, link to `/en/`; confirm the non-locale HTML set is exactly `dist/index.html` + `dist/404.html`
      depends_on: T2
      refs: R19, R20, R26

- [ ] T9: CV page — copy `~/Documents/CV/CV Jordi Marçal 2026-09 Senior {EN,ES}.pdf` → `public/cv/Jordi-Marcal-Poy-CV-{EN,ES}.pdf`; `[lang]/cv.astro` with download buttons (`download` attr), print button (`window.print()`, `.no-print`), on-page summary (compact experience + skill groups), `./` h1; add the `@media print` block (hide `header`/`footer`/`.no-print`, black-on-white) to `global.css`
      depends_on: T2, T3, T4
      refs: R21, R22, R23, R24, R26, R27

- [ ] T10: Verification pass — run the full sequence `npx vitest run && npm run check && npm run build`; execute every per-R verification command from `requirements.md` (dist greps per locale, `%PDF` checks, non-locale HTML whitelist, print CSS); write the traceability table in `harness/progress/impl_site-pages.md` (R↔test↔implementation)
      depends_on: T5, T6, T7, T8, T9
      refs: R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19, R20, R21, R22, R23, R24, R25, R26, R27, R28
