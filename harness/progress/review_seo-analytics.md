# Review — feature seo-analytics (F3)

**Verdict:** APPROVED

Branch `feat/front-phase-0-1` @ `96c96f0` (8 commits, `5fcce67..96c96f0`, T1–T10).
Reviewer re-ran the full battery and independently re-executed the per-R
verification commands against a fresh `dist/`: `npx vitest run` 57/57 ·
`npx astro check` 0 errors / 0 warnings (1 pre-existing hint, see nits) ·
`npm run build` 52 pages · `python3 harness/tools/check-traceability.py --all`
PASS 21/21 + 28/28 + 21/21 (exit 0) · `bash harness/init.sh` all [OK].
No required changes. Two non-blocking notes recorded at the end.

## Requirement traceability ↔ tests

Reviewer probe targeted the requested sample plus a full sweep of the cheap
greps; all re-executed against the reviewer's own builds:

- R1: [x] 51-page title+description loop, 0 failures; es spot `Experiencia — Jordi Marçal Poy` on `dist/es/experience/index.html`
- R2: [x] canonical ×3 spots (en home, ca about, es project detail) — all exact
- R3: [x] 4 hreflang alternates on `dist/en/about/` incl. `x-default` → en and cross-locale es link
- R4: [x] og:title/og:url/og:type/og:site_name spots ×locales
- R5: [x] og:locale es_ES + exactly 2 `og:locale:alternate` (es_ES + ca_ES on en)
- R6: [x] og:image set (url/1200/630/alt) incl. ca/cv alt spot
- R7: [x] `file public/og.png` → PNG image data, 1200 x 630; 34566 bytes (>5000); `dist/og.png` emitted
- R8: [x] twitter:card/title/image spots
- R9: [x] reviewer node parser: exactly 1 `Person` block per locale home ×3, all five fields pinned incl. exact sameAs set; pinned by `src/lib/seo.spec.ts` (full-object `toEqual` — regression-catching)
- R10: [x] reviewer parser over **all** interior dist pages (51 checked incl. double-covered projects index; 48 unique): exactly 1 BreadcrumbList each, first item = locale home, last item = page canonical, positions contiguous 1..n — 0 failures
- R11: [x] 3-item chain on `dist/es/projects/kafka-adapter-telemetry/`: home → `Proyectos` → `https://jordimp.net/es/projects/` → project (`kafka-adapter-telemetry` = `name` from `src/content/projects/kafka-adapter-telemetry.json`) → canonical; positions 1..3. **Deviation ruled justified** — see dedicated section below
- R12: [x] `BreadcrumbList` count 0 on all three locale homes
- R13: [x] robots.txt three directives (literal `grep -qF`)
- R14: [x] `dist/sitemap-index.xml` references `sitemap-0.xml`
- R15: [x] sitemap-0.xml: 51 `<loc>` · 153 `xhtml:link` en/es/ca alternates · 0 non-locale URLs · root `https://jordimp.net/` absent
- R16: [x] `^# Jordi Marçal Poy` + role + tagline; 11 unique en project links; 4 Pages links; `file` → UTF-8 text; reviewer `curl -sI` on preview → `Content-Type: text/plain` for both `.txt` endpoints
- R17: [x] `### ` count = 20 (11+4+5); `## Projects/Experience/Skills/Contact` present; spot strings Telefónica/Attendre/Spring Boot 4/email/slug all present
- R18: [x] reviewer rebuild with `PUBLIC_GOATCOUNTER=test`: exactly **52** pages carry `data-goatcounter="https://test.goatcounter.com/count"` + `src="https://gc.zgo.at/count.js"`; root redirect stub correctly excluded (0 refs); mapping pinned by `src/lib/analytics.spec.ts`
- R19: [x] reviewer plain rebuild after the R18 variant: 0 `goatcounter` / 0 `gc.zgo.at` refs in `dist/`; spec pins unset/empty/whitespace → `undefined`
- R20: [x] `name="robots" content="noindex"` on `dist/404.html`
- R21: [x] 404 absence greps: canonical / hreflang / `og:` / `twitter:` / `ld+json` all 0

## Task completion

- T1: [x] T2: [x] T3: [x] T4: [x] T5: [x] T6: [x] T7: [x] T8: [x] T9: [x] T10: [x] — all `[x]` in `harness/specs/seo-analytics/tasks.md`; each backed by a conventional commit (`5fcce67`…`96c96f0`); commit history shows only tasks.md checkbox flips inside `harness/` — no state files touched by the implementer.

## Modified files vs architecture / conventions

- `src/lib/seo.ts`, `src/lib/analytics.ts`, `src/lib/llms.ts` — pure cores at the edges (architecture Principle 7), named exports, no `any`, no `!`, exact design.md signatures. `jsonLdScript` `<`→`\u003c` + U+2028/2029 escaping (ADR-6), test-pinned (`seo.spec.ts:120-130`). ✓
- `src/lib/seo.spec.ts` (14), `src/lib/analytics.spec.ts` (5), `src/lib/llms.spec.ts` (12) — colocated, one behavior per test, full-object assertions (not no-throw). ✓
- `src/components/SEO.astro` — single head owner extended in place (ADR-1); noindex mode is the single switch that suppresses canonical/alternates/OG/Twitter/JSON-LD and emits robots meta (R20/R21 verified). Fixed attribute order as designed. ✓
- `src/components/Analytics.astro` — pure-decision gate (ADR-5); `BaseLayout` includes it unconditionally, component decides. ✓
- `src/layouts/BaseLayout.astro` — Props extended with `noindex`/`breadcrumbs`, forwarded; nothing else changed. ✓
- `src/pages/[lang]/{experience,skills,about,cv,projects/index}.astro`, `projects/[slug].astro` — breadcrumbs from `ui` dictionary + content `name`, no decision logic beyond prop assembly; `getStaticPaths` untouched. ✓ (6/6 interior routes verified carrying breadcrumbs)
- `src/pages/404.astro` — `noindex` passed (R20/R21). ✓
- `src/pages/llms.txt.ts`, `llms-full.txt.ts` — prerendered GET endpoints, `text/plain; charset=utf-8`, collections via `getCollection` + `SITE`/`ui.en` (ADR-4); en-only per approved discarded-alternatives. ✓
- `public/robots.txt` (ADR-8), `public/og.png` (ADR-7, committed asset verified by magic bytes) ✓
- `astro.config.mjs` — sitemap `filter` dropping the root redirect (ADR-3); i18n config untouched. ✓
- C3 sweep: no `console.`/`debugger`/TODO/FIXME anywhere in `src/`; `set:html` only in SEO.astro's two JSON-LD injections of escaped builder output. ✓

## R11 deviation ruling — ACCEPTED

Declared in impl report note 1. The reviewer verified empirically:

1. `design.md` (human-approved, authoritative for shapes per ADR-6) types
   `breadcrumbJsonLd` items as `item: string` (absolute URL) with `name` a
   **sibling** field; `src/lib/seo.ts:60-65` implements exactly that.
2. `requirements.md` R11's verification script is **internally inconsistent**:
   it asserts both `itemListElement[1].item.name === 'Proyectos'` and
   `itemListElement[1].item === 'https://jordimp.net/es/projects/'`. Under the
   approved `item: string` shape the first expression evaluates to `undefined`
   (confirmed against the emitted JSON) — the script as literally written is
   unsatisfiable, so it cannot be the acceptance contract.
3. The executed assertion set (`name` sibling + `item` URL) preserves every
   semantic element of R11: exactly 3 items, locale home first, middle item =
   projects index named per `ui.nav.projects` (`Proyectos`) pointing at
   `https://jordimp.net/es/projects/`, last item = project named from the
   content `name` field pointing at its canonical URL.
4. The sibling shape is Google's current recommended BreadcrumbList format
   (`position` + `name` + `item` on each ListItem).
5. Testability is unchanged: `src/lib/seo.spec.ts:86-103` pins the shape with
   full-object `toEqual` and contiguous positions; the reviewer's dist parser
   would catch any regression of the R11 chain.

Accepted as a correction of the verification command, not a requirement
change. Spec note for the record: if `requirements.md` is ever revised, fix the
R11 script to read `itemListElement[1].name` (and `[2].name`).

## Checkpoints

- C1: [x] base files + 3 docs present; `harness/init.sh` exit 0 (re-ran, 57/57)
- C2: [x] exactly one `in_progress` (F3); F1/F2 done with passing tests; `current.md` describes the active session with real-time log
- C3: [x] `src/` only planned modules; no debug prints / context-free TODOs
- C4: [x] colocated `*.spec.ts` per lib module (F1/F2 precedent); 57/57 pass
- C5: [x] no suspicious untracked files — `git status` shows only the pre-existing leader-owned items (uncommitted `feature_list.json` F2-done/F3-in_progress flip, untracked spec md files, deleted `opencode.json`, uncommitted `history.md` F2-closure entry; none are implementer artifacts — leader should commit them); `history.md` has F1+F2 entries; F3 `in_progress` is the correct state pending this review
- C6: [x] F3 spec folder has the 3 files; requirements use strict EARS-style shall/WHERE forms; T1–T10 all `[x]`; every R1–R21 covered by a concrete test or prescribed command (checker: 21/21 PASS)
- C7: [x] strict audit executed and recorded below; the only above-threshold finding is the known waived astro CRITICAL (disposition of record: `impl_front-foundation.md` §Security audit disposition, F5 re-gate); no NEW high/critical findings

## Module audits (`audit_level: strict`)

### audit-security.sh — known waived astro CRITICAL persists; no NEW HIGH

Exit 1 with exactly **1 critical** vulnerability (`astro <=7.2.7`, the same 10
GHSA advisories as the F1/F2 runs; suggested forced fix drifted 7.3.2 → 7.3.3,
advisory-list drift only). Zero sharp/esbuild findings — the F1 `overrides`
hold. Per the F1 waiver of record (static-only output; no server surface; astro
upgrade deferred to the F5 re-gate) this does not block, matching the F2
precedent.

**Waiver-scope note (recorded, non-blocking):** the F1 waiver's grounds state
"no `set:html` anywhere in `src/`". F3 introduces exactly two `set:html`
usages (`SEO.astro:61-62`) injecting `jsonLdScript()` output — a
`JSON.stringify` product with `<`→`\u003c` escaping pinned by
`seo.spec.ts:120-125`. None of the 10 listed advisories targets `set:html`
(they cover define:vars, server islands, spread attribute names,
renderHTMLElement, transition:*, view-transition props, host-header SSRF,
slot names, AVIF, base-path) — no new exposure is created, and ADR-6 (approved
in this spec) is precisely the designed mitigation. The **F5 re-gate must
re-examine the set:html + escaping usage** when it upgrades astro or renews the
waiver. Raw output: identical in shape to the F2 appendix (10 astro advisories,
"1 critical severity vulnerability", SAST eslint SKIPPED) — not repeated here.

### check-traceability.py --all — PASS (exit 0)

`front-foundation: 21/21 · seo-analytics: 21/21 · site-pages: 28/28 —
VERDICT: PASS`. The impl report's Tests column follows the parser-safe F1/F2
style (bare commands, no backticks/brace sets/ellipses). No per-feature ID
collision (the F2-round tool fix holds).

### bench.sh — SKIPPED

`harness/tools/bench.sh` and `harness/baselines.json` do not exist → no
benchmark gate to run (noted per protocol).

## Non-blocking notes

1. `src/lib/llms.ts:28` — `import { SITE }` sits mid-file (after the
   `LlmsData` interface); every other module imports at the top (conventions
   homogeneity). Move it to the top next time the file is touched.
2. Pre-existing (F1, not F3): `npx astro check` reports 1 hint —
   `src/content.config.ts:4` `ts(6133)` unused `localeEnum`. File last touched
   in F1 (`5007226`); schedule cleanup, no F3 action.

## Verdict

All 21 requirements traced to concrete tests/commands and re-verified by the
reviewer against fresh builds; all 10 tasks complete; checkpoints C1–C7 met;
strict audit disposed per the standing waiver; the single declared deviation
ruled justified. **APPROVED** — feature eligible for the completion gate
(leader/implementer flip F3 → `done`, archive to `history.md`).
