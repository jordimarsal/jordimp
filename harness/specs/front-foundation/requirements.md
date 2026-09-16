# Requirements: front-foundation (F1)

**Scope.** "The system" means the jordimp static front-end (Astro site + build
pipeline) as shipped by `npm run build` into `dist/`, on branch
`feat/front-phase-0-1` (commits `cf3f29b..8aa20ef`). This feature was implemented
before the harness was installed; these requirements document the behavior the
existing foundation guarantees. Each requirement lists the concrete command or
check that verifies it.

---

## R1
The system shall type-check under the strict TypeScript configuration (`tsconfig.json` extends `astro/tsconfigs/strict`) with `npm run check` reporting 0 errors and 0 warnings.

Verification: `grep -q 'astro/tsconfigs/strict' tsconfig.json && npm run check`

## R2
When `npm run build` runs, the system shall exit 0 and validate every content-collection entry against its Zod schema before emitting pages.

Verification: `npm run build && test -d dist/en` — negative check: removing a required field from any `src/content/projects/*.json` makes the build fail with a Zod error naming the file.

## R3
When the build completes, the system shall emit `dist/en/index.html`, `dist/es/index.html`, `dist/ca/index.html`, and a `dist/index.html` that redirects to `/en/` (meta refresh, `noindex`).

Verification: `npm run build && ls dist/en/index.html dist/es/index.html dist/ca/index.html && grep -q 'url=/en/' dist/index.html`

## R4
The system shall not emit any HTML page outside the locale-prefixed routes, except the root redirect page.

Verification: `find dist -name '*.html' ! -path 'dist/en/*' ! -path 'dist/es/*' ! -path 'dist/ca/*'` → exactly `dist/index.html`.

## R5
The system shall define its design tokens in `src/styles/tokens.css` with the locked values: fonts Inter Variable / JetBrains Mono, the spacing/radius/container/prose scale, and the exact dark and light palette hex values (dark `--bg #0b1220`, `--accent #2dd4bf`; light `--accent #0d9488`).

Verification: `grep -q '#0b1220' src/styles/tokens.css && grep -q '#2dd4bf' src/styles/tokens.css && grep -q '#0d9488' src/styles/tokens.css && grep -q "'Inter Variable'" src/styles/tokens.css`

## R6
The system shall render every foundation page through `BaseLayout`, with `html[lang]` equal to the page locale and slots for logo, nav, actions, default content, and footer.

Verification: `for l in en es ca; do grep -o "<html lang=\"$l\"" dist/$l/projects/index.html; done` → one match per locale. (The root `dist/{lang}/index.html` placeholder from T1 is a scaffold artifact scheduled for replacement in F2; it does not go through `BaseLayout`.)

## R7
Before first paint, the system shall set `data-theme` on `<html>` from `localStorage['theme']`, falling back to the `prefers-color-scheme` preference, via an inline head script that ships as-is (no bundled framework code) on every page rendered through `BaseLayout`.

Verification: `grep -F "localStorage.getItem('theme')" dist/en/projects/index.html` — the inline script sits in `<head>` before any bundled script. (Vite inlines page scripts into the built HTML — `dist/_astro/` holds only fonts + CSS.)

## R8
While `localStorage['theme']` holds a stored value, the system shall apply that stored value as the initial theme instead of the system preference on every page rendered through `BaseLayout`.

Verification: `grep -F "matchMedia('(prefers-color-scheme: light)')" dist/en/projects/index.html` — the inlined head script implements `stored ?? (matchMedia(...))`.

## R9
When the theme toggle is clicked, the system shall switch `data-theme` between `dark` and `light` and persist the new value to `localStorage['theme']`.

Verification: `grep -rlF 'document.getElementById("theme-toggle")' dist/ | wc -l` → 36 and `grep -rlF 'localStorage.setItem(t,e)' dist/ | wc -l` → 36 (the toggle script is inlined into each BaseLayout page's HTML — `dist/_astro/` holds only fonts + CSS — and esbuild hoisted the `'theme'` key into a variable). Toggle rendered via `BaseLayout` since commit `531ed92`.

## R10
When the requested locale has no value for a localized field, the system shall return the `en` value (`L()` fallback).

Verification: `npx vitest run` — `src/lib/i18n.spec.ts` › "falls back to en for a missing locale".

## R11
The `ui` dictionary shall declare exactly the same key set (`UiKey`) for `en`, `es`, and `ca`, with no empty string values.

Verification: `npm run check` (compile-time `Record<UiKey, string>` on `es`/`ca`) plus `npx vitest run` (runtime key-parity and non-empty tests).

## R12
Every foundation page that includes `LocaleSwitcher` shall render one link per locale to the same page path under `/{locale}/`, each carrying `hreflang`, with `aria-current="true"` on the active locale.

Verification: `grep -o 'hreflang="' dist/en/projects/index.html | wc -l` → 3 (minified single-line HTML — use `grep -o … | wc -l`, not `grep -c`), and `grep -q 'aria-current="true"' dist/en/projects/index.html`.

## R13
The system shall declare typed Astro content collections (`projects`, `experience`, `skills`) whose Zod schemas validate at build time, with a `localized()` helper requiring an `en`, `es`, and `ca` value for every localized field.

Verification: `npm run build` green — negative check: deleting the `es` key of a localized field in any content JSON fails the build.

## R14
The system shall ship exactly 11 project entries: 5 with `featured: true` and 6 with `featured: false`.

Verification: `ls src/content/projects/*.json | wc -l` → 11; `grep -l '"featured": true' src/content/projects/*.json | wc -l` → 5.

## R15
For each locale, the system shall emit a projects index (`dist/{lang}/projects/index.html`) rendering all 11 projects in a featured section followed by a secondary section, sorted featured first, then year descending, then name ascending.

Verification: `grep -o 'href="/en/projects/[a-z0-9-]*/"' dist/en/projects/index.html | wc -l` → 11 cards (minified single-line HTML — `grep -o … | wc -l`, not `grep -c`; the plain prefix `href="/en/projects/` also matches the index's own nav link, giving 12); ordering checked with `grep -o 'href="/en/projects/[a-z0-9-]*/"' dist/en/projects/index.html` (featured slugs appear before secondary ones).

## R16
The projects index shall render one filter button per distinct stack tag (sorted alphabetically) plus an `All` reset button, each with an `aria-pressed` state.

Verification: `jq -r '.stack[]' src/content/projects/*.json | sort -u | wc -l` → 42 distinct stacks; `grep -o 'data-stack=' dist/en/projects/index.html | wc -l` → 53 = 42 filter buttons + 11 cards, one `data-stack=` each (minified single-line HTML — `grep -o … | wc -l`, not `grep -c`), and `grep -q 'data-reset' dist/en/projects/index.html`.

## R17
When a stack filter button is toggled, the system shall update the visibility of every project card and the `aria-pressed` state of every filter button to reflect the set of active tags.

Verification: extract the module script inlined into `dist/en/projects/index.html` (Vite inlines page scripts into the HTML — `dist/_astro/` holds only fonts + CSS — and esbuild minifies identifiers): the apply function sets card visibility and button `aria-pressed` together, e.g. `grep -oF 'e.hidden=t.size>0&&!s.some(d=>t.has(d))' dist/en/projects/index.html` and `grep -oF 'setAttribute("aria-pressed",String(t.has(e.dataset.stack??"")))' dist/en/projects/index.html`, each → 1 match.

## R18
When the reset (`All`) button is clicked, the system shall show every project card and mark the reset as the only pressed filter.

Verification: `grep -oF 't.clear(),o()' dist/en/projects/index.html` → 1 match — the reset handler inlined in the page clears the active tag set and reapplies (identifiers as minified by esbuild).

## R19
For every project and locale, the system shall emit `dist/{lang}/projects/{id}/index.html` (id = JSON filename slug) rendering the project name, year, localized summary, problem, highlights, stack chips, metrics, and a repository link whose text is the `links.github` URL path.

Verification: `ls dist/en/projects | wc -l` → 12 (11 dirs + `index.html`); `grep -q 'github.com/jordimarsal/kafka-adapter-telemetry' dist/en/projects/kafka-adapter-telemetry/index.html` and `grep -q '>Problem<' dist/en/projects/kafka-adapter-telemetry/index.html`.

## R20
Every foundation page shall render `<title>`, `<meta name="description">`, and `<link rel="canonical">` pointing at `https://jordimp.net/{lang}/{path}`.

Verification: `grep -q 'rel="canonical" href="https://jordimp.net/en/projects/"' dist/en/projects/index.html`.

## R21
The system shall not ship any built page containing the owner's phone number.

Verification: `! grep -rq '609 940 649' dist/` — plus `npx vitest run` bans any 9-digit run inside `ui` dictionary strings.
