# Implementation — front-foundation (F1)

- **Session:** 2026-09-16 — implementer (verification + traceability of pre-harness commits `cf3f29b..8aa20ef`)
- **Verdict:** 21/21 requirements verified done (R9 resolved this session via leader ruling: ThemeToggle wired into `BaseLayout`; fix commit follows).
- Full battery executed this session: `npx vitest run` (11 tests, 2 files), `npm run check` (0 errors / 0 warnings / 1 hint), `npm run build` (39 pages), dist inspection, negative schema builds, scripted content extraction.

## Traceability

| Requirement | Test(s) | Implementation file(s) | Status |
|---|---|---|---|
| R1 strict type-check | `grep -q 'astro/tsconfigs/strict' tsconfig.json` + `npm run check` → 0 errors, 0 warnings | `tsconfig.json`, `package.json` | done |
| R2 build validates Zod schemas | `npm run build` exit 0 + `test -d dist/en`; negative: deleted `year` → `[InvalidContentEntryDataError] projects → kafka-adapter-telemetry` (`year: Required`), exit 1 | `src/content.config.ts`, `src/content/projects/*.json` | done |
| R3 locale roots + `/` → `/en/` | `ls dist/{en,es,ca}/index.html` + `grep 'url=/en/' dist/index.html` (meta refresh, `noindex`) | `astro.config.mjs`, `src/pages/index.astro` | done |
| R4 no non-locale HTML | `find dist -name '*.html' ! -path 'dist/{en,es,ca}/*'` → exactly `dist/index.html` | `astro.config.mjs` | done |
| R5 locked design tokens | greps: `#0b1220`, `#2dd4bf`, `#0d9488`, `'Inter Variable'`, `JetBrains Mono` in `src/styles/tokens.css` | `src/styles/tokens.css` | done |
| R6 BaseLayout + `html[lang]` | `grep -o '<html lang="{lang}"' dist/{lang}/projects/index.html` → 1 per locale; detail pages too | `src/layouts/BaseLayout.astro` | done ¹ |
| R7 no-flash inline script | `grep -F "localStorage.getItem('theme')"` in `dist/en/projects/index.html` (all 34 BaseLayout pages ship it in `<head>`) | `src/layouts/BaseLayout.astro` | done ¹ |
| R8 stored theme wins | `grep -F "matchMedia('(prefers-color-scheme: light)')"` — inline script does `s ?? (matchMedia(...))` | `src/layouts/BaseLayout.astro` | done ¹ |
| R9 toggle click persists | `grep -rl 'theme-toggle' dist/ \| wc -l` → 36 (all BaseLayout pages, exactly 1 button per page via `grep -o`); `grep -rlF 'localStorage.setItem(t,e)' dist/ \| wc -l` → 36 (minifier hoisted `KEY` → `t="theme"`; spec's `grep -rF "localStorage.setItem('theme'" dist/_astro/` can never match — script is inlined in HTML, not in `dist/_astro/`) | `src/components/ThemeToggle.astro`, `src/layouts/BaseLayout.astro` | done ³ |
| R10 `L()` en fallback | `npx vitest run` › `i18n.spec.ts › L() › falls back to en for a missing locale` | `src/lib/i18n.ts`, `src/lib/i18n.spec.ts` | done |
| R11 ui key parity | `npm run check` (compile-time `Record<UiKey, string>`) + vitest › key parity, non-empty | `src/i18n/ui.ts`, `src/lib/i18n.spec.ts` | done |
| R12 hreflang ×3 + aria-current | `grep -o 'hreflang="' …` → 3 (spec's `grep -c` counts minified single line — recounted with `-o`); `aria-current="true"` present | `src/components/LocaleSwitcher.astro` | done ² |
| R13 typed collections + `localized()` | negative build: deleted `summary.es` → `summary.es: Required` naming the file, exit 1; + `projects.spec.ts` trilingual test | `src/content.config.ts` | done |
| R14 exactly 11 projects (5 featured) | `ls … *.json | wc -l` → 11; `grep -l '"featured": true' | wc -l` → 5; + `projects.spec.ts` | `src/content/projects/*.json` | done |
| R15 projects index, 11 cards, sorted | `grep -o 'href="/en/projects/{slug}/"' | wc -l` → 11; order verified = featured (5) then secondary (6), year desc, name asc (all 2026 featured alphabetized; 2019 `bible-text-analysis` last) | `src/pages/[lang]/projects/index.astro` | done ² |
| R16 one button per stack + All reset | distinct stacks `jq … | sort -u | wc -l` → 42; `data-stack="…"` occurrences → 53 = 42 buttons + 11 cards; `data-reset` button present | `src/pages/[lang]/projects/index.astro` | done ² |
| R17 filter applies hidden + aria-pressed | extracted the bundled module script from the built page: apply loop sets `e.hidden` and `aria-pressed` together | `src/pages/[lang]/projects/index.astro` (script inlined in HTML by Vite) | done ² |
| R18 reset shows all | extracted script: `r.addEventListener('click', () => { t.clear(), o() })`; reset pressed iff set empty | `src/pages/[lang]/projects/index.astro` | done ² |
| R19 detail pages ×36, derived repo link | `ls dist/en/projects | wc -l` → 12 (11 dirs + index); `github.com/jordimarsal/kafka-adapter-telemetry` + `>Problem<` present; + `projects.spec.ts` (kebab slugs, parseable GitHub URLs) | `src/pages/[lang]/projects/[slug].astro` | done |
| R20 title/description/canonical | `rel="canonical" href="https://jordimp.net/{lang}/{path}/"` verified on index + detail pages, all locales spot-checked | `src/components/SEO.astro`, `src/layouts/BaseLayout.astro` | done |
| R21 no phone | `! grep -rq '609 940 649' dist/` + vitest › phone canary on `ui` | `src/i18n/ui.ts`, `src/lib/i18n.spec.ts` | done |

## Findings

### ³ R9 — resolved by leader ruling (fix applied this session)

Leader ruled the theme toggle is global chrome: `BaseLayout` renders it itself,
not the pages. Fix (2 lines in `src/layouts/BaseLayout.astro`): import
`ThemeToggle` and render `<ThemeToggle {lang} />` as a sibling directly after
`<slot name="actions" />` — LocaleSwitcher composition stays per-page, every
BaseLayout page gets exactly one toggle. Post-fix evidence (`npm run build` → 39
pages): `grep -rl 'theme-toggle' dist/ | wc -l` → 36 = 3 locales × 12 pages
(projects index + 11 detail pages; placeholder homes excluded — they don't use
BaseLayout, see ¹ — so the earlier "34 BaseLayout pages" figure undercounted by
2);
`grep -o 'id="theme-toggle"' dist/en/projects/index.html | wc -l` → 1. Vite
**inlined** the toggle script into each page's HTML (`<script type="module">const
t="theme",…localStorage.setItem(t,e)`), so the spec's prescribed
`dist/_astro/` grep still can't match and the `'theme'` literal is gone after
esbuild hoisted `KEY` into `t`. Working greps: `grep -rlF
'document.getElementById("theme-toggle")' dist/ | wc -l` → 36 and `grep -rlF
'localStorage.setItem(t,e)' dist/ | wc -l` → 36. Full battery re-run green:
vitest 11/11, `npm run check` 0/0/1, `harness/init.sh` all OK.

### R9 — pending (blocking, routes to leader) — SUPERSEDED by ³

`src/components/ThemeToggle.astro` exists, type-checks, and its script implements the
required behavior — but **no page or layout imports it**. Evidence:
`grep -rn ThemeToggle src/` → 0 uses; `grep -rl 'theme-toggle' dist/` → 0 files;
`grep -c '◐' dist/en/projects/index.html` → 0. The shipped site has no toggle, so
"when the theme toggle is clicked…" (R9) has no trigger anywhere. Minimal fix (out
of implementer mandate): render `<ThemeToggle slot="actions" {lang} />` in
`BaseLayout` or in each page's actions slot next to `LocaleSwitcher`, then re-run
the R9 grep (post-fix the script lands either inlined in HTML or in `dist/_astro/`,
so the spec's prescribed grep may need the same path correction as R7/R8).

### ¹ Placeholder home is not wired through BaseLayout (spec-consistent, noted)

`dist/{lang}/index.html` is the 68-byte placeholder `<h1>` (T1: "placeholder
… replaced by F2"; design.md Files). It has no `html[lang]`, no BaseLayout, and no
no-flash script — so R6/R7/R8 as literally worded ("every foundation page") hold
only for the 34 BaseLayout pages (projects index + 33 detail pages), and the
prescribed R7/R8 greps against `dist/en/index.html` can never pass while the
placeholder exists. Behavior verified with the corrected paths above. Options for
leader/spec-author: accept the placeholder exception in requirements.md, or wire
the placeholder through BaseLayout in F2 (already planned).

### ² Prescribed verification paths need spec-author touch-up (behavior is correct)

- R7/R8/R17/R18 greps target `dist/_astro/` — Vite inlines both shipped scripts
  into the HTML pages (only fonts + CSS live in `dist/_astro/`), and esbuild
  minification renames identifiers (`card.hidden` → `.hidden=t`,
  `active.clear()` → `t.clear(),o()`). Corrected evidence: greps against the
  built pages + extracted module script (recorded above).
- R12/R15/R16 `grep -c` counts lines; the minified HTML is a single line, so real
  counts need `grep -o | wc -l` (3 hreflang, 11 cards, 53 `data-stack=`).

### Negative checks executed (R2/R13)

Both mutations of `src/content/projects/kafka-adapter-telemetry.json` (delete
`year`; delete `summary.es`) failed `npm run build` with exit 1 and
`[InvalidContentEntryDataError] … does not match collection schema` naming the
file and field. Content restored via `git checkout --`; `git status src/` clean.

### New automated tests added this session

`src/content/projects.spec.ts` (6 tests, colocated per docs/conventions.md):
exactly 11 entries; 5 featured / 6 secondary; trilingual non-empty localized
fields; unique kebab-case slugs; parseable GitHub URLs; non-empty stack tags.
Suite now: 2 files, 11 tests, all green. No application code was modified.

## Task confirmation

T1–T8 deliverables each verified this session against the commands above and the
commits recorded in `tasks.md`; all `[x]` marks confirmed (R9 gap is a page-wiring
omission not covered by any T<n> — no task claimed "render ThemeToggle on pages").
