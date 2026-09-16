# Review — feature site-pages (F2)

**Verdict:** CHANGES_REQUESTED

Branch `feat/front-phase-0-1` @ `2f3da86`. Reviewer re-ran the full battery:
`bash harness/init.sh` green · `npx vitest run` 26/26 · `npm run check` 0 errors /
0 warnings · `npm run build` complete (dist rebuilt 20:13). One blocking item —
a traceability-table formatting defect that makes `check-traceability.py --all`
exit 1 (and regresses front-foundation to 0/21). The fix is documentation-only
in `harness/progress/impl_site-pages.md`; no code, tests or specs need changes.

## Requirement traceability ↔ tests

Semantic coverage is **complete**: every R1–R28 row in
`harness/progress/impl_site-pages.md` cites a concrete test or prescribed
verification command, and the reviewer independently re-executed the cheap
verifications against the fresh `dist/` — all pass:

- R1: [x] `>Jordi Marçal Poy</h1>` + `class="hero-prompt mono">$ <role> · <tagline>` in dist/{en,es,ca}/index.html (ca shows `Enginyer de Software Backend Sènior` — R25 fix visible)
- R2: [x] projects+cv CTAs present ×3 locales
- R3: [x] `/en/ask/` + `aria-disabled="true"` + `title="phase 3"` ×3 locales
- R4: [x] `card pillar` count = 3; chips `llama.cpp`, `CI/CD` present
- R5: [x] 3 project cards; order codebaserag → harness-standard → kafka-adapter-telemetry (featured → year desc → name asc)
- R6: [x] nav on interior pages (`href="/en/cv/"` on skills page)
- R7: [x] `aria-current="page"`: experience → 1, home → 0 (build-time, `HeaderNav.astro:25`)
- R8: [x] Monogram `aria-label="JM"` + footer + hreflang on the **unedited** F1 projects pages (slot fallbacks verified: `git diff 886c6a5..HEAD` touches no F1 page)
- R9: [x] `src/content/experience.spec.ts` (6 tests, green) + Zod build; facts match plan Task 9 verbatim (telefonica order 1/current, axpe 39 APIs Node.js 24, zitro, attendre)
- R10: [x] timeline renders Telefónica → Axpe → Zitro → Attendre newest-first, `class="timeline` present
- R11: [x] `data-current="true"` count = 1 ×3 locales
- R12: [x] `src/content/skills.spec.ts` (5 tests, green)
- R13: [x] `card skill-group` = 5; `>Spring Boot 4<` present
- R14: [x] `Cómo trabajo` + `prose` on dist/es/about
- R15: [x] about contact block = exactly the 3 prescribed links in shell-command form (`mail -s "Portfolio contact" …`, `curl github/…`, `curl in/…`). Note: the page contains 2 `mailto:` occurrences — the second is the **required** Footer mailto (R17/ADR-2/ADR-4); the prescribed `grep -c` passes as written (1 line, minified HTML)
- R16: [x] canaries in both content specs (`/\d{9}/`) + F1 ui canary; `grep -rq '609 940 649' dist/` no match (spaced and digit-run forms checked). Negative check recorded in impl report (not re-executed — repo is read-only for reviewer)
- R17: [x] pre-filled mailto ×1 on experience page + GitHub + LinkedIn
- R18: [x] `Built with Astro, Java 25 &amp; a local LLM` (HTML-escaped `&` — matches impl-report caveat ¹, F1 precedent), `© 2026 Jordi Marçal Poy`
- R19: [x] dist/404.html exists, `Page not found`, links `/en/`
- R20: [x] non-locale HTML set is exactly `dist/index.html` + `dist/404.html`
- R21: [x] both `download` links + `window.print` on cv page
- R22: [x] `%PDF` magic ×2; 53711 / 54457 bytes (>10KB) in `public/cv/` and `dist/cv/`
- R23: [x] `@media print` + `.no-print` + `display:none` in dist/_astro/*.css (`global.css:140-155`)
- R24: [x] `Telefónica` + `>Spring Boot 4<` in cv on-page summary
- R25: [x] `npm run check` 0/0 (`Record<UiKey, string>` parity); `i18n.spec.ts` "ui dictionary — F2 strings" (4 tests) pins hero.role + all new keys ×3 locales
- R26: [x] `aria-hidden="true">./</span>Experience|CV|404` on interior pages + 404; home h1 stays plain `SITE.name`
- R27: [x] `content:"## "` in built CSS; `section-h2` on cv page
- R28: [x] `prompt-cursor` + animation in CSS; `prefers-reduced-motion:reduce` (minified form — impl-report caveat ², F1 precedent)

**However** the scripted gate fails on format (see Module audits): the Tests
column of the F2 table is not parseable by `harness/tools/check-traceability.py`
— commands are wrapped in backticks, brace sets `{en,es,ca}` are comma-split by
the parser, and `…`/`(×es,ca)` annotations become unmatchable identifiers.

## Task completion

- T1: [x] T2: [x] T3: [x] T4: [x] T5: [x] T6: [x] T7: [x] T8: [x] T9: [x] T10: [x] — all `[x]` in `harness/specs/site-pages/tasks.md`, each backed by a conventional commit (`76ceea8`…`2f3da86`).

## Modified files vs architecture / conventions

- `src/layouts/BaseLayout.astro` — slot fallbacks (ADR-2), Props contract unchanged; F1 pages untouched and gain chrome (R8 verified in dist). ✓
- `src/components/HeaderNav.astro`, `Footer.astro`, `HeroPrompt.astro`, `PageTitle.astro` — named-export-free `.astro`, `interface Props`, `as Props` once (allowed at Astro props boundary), scoped styles, no comments, contact data only from `SITE` (no phone/address). ✓
- `src/i18n/ui.ts` — strict trilingual `UiKey` parity; hero.role fix + 9 new keys; UI strings never inline in pages. ✓
- `src/content/{experience,skills}/*.json` — existing Zod schemas unchanged (ADR-5), kebab-case slugs = collection ids, facts verbatim. ✓
- `src/pages/[lang]/{index,experience,skills,about,cv}.astro`, `src/pages/404.astro` — `getStaticPaths` over `LOCALES`; decision logic stays out of templates; cv `<script>` is one zero-framework behavior. ✓
- `src/styles/global.css` — `@media print` + `.section-h2::before` + cursor blink shared here; page-specific styles stay scoped. ✓
- `astro.config.mjs` — `build.inlineStylesheets: 'never'` (impl-report caveat 4): justified, required for the prescribed R23/R28 evidence greps. Accepted.
- Conventions nit (non-blocking): BaseLayout wraps HeaderNav so built pages contain `<nav><nav aria-label="Site">` — nested landmarks are valid HTML5 and the inner nav is labeled; consider flattening at a later feature.
- C3 sweep: no TODO/FIXME/console/debugger in `src/`. ✓

## Checkpoints

- C1: [x] base files + 3 docs present; `harness/init.sh` exit 0 (re-ran)
- C2: [x] exactly one `in_progress` (F2); F1 done with passing tests (26/26 suite includes F1 specs); `current.md` describes the active session
- C3: [x] `src/` only contains planned modules; no debug prints / context-free TODOs
- C4: [x] colocated `*.spec.ts` convention (F1 precedent) + build-time Zod; all tests pass
- C5: [x] no suspicious untracked files (`git status` clean); `history.md` has the F1 entry; F2 state = `in_progress` pending this review (correct)
- C6: [x] F2 spec folder has the 3 files; requirements use EARS forms; T1–T10 all `[x]`; every R has a concrete verifying test/command
- C7: [x]/[ ] audit report recorded below (strict); the only above-threshold finding is the **known waived astro CRITICAL** (waiver of record in `impl_front-foundation.md` §Security audit disposition, re-gate at F5). The F2 progress entry does not reference the waiver — add the one-line reference requested below.

## Module audits (`audit_level: strict`)

### audit-security.sh — known waived finding persists; no NEW HIGH

Exit 1 with exactly **1 critical** vulnerability (`astro <=7.2.7`, 10 GHSA
advisories). Zero references to sharp/esbuild remain — their F1 `overrides`
hold. No HIGH findings, new or old. Per the explicit F1 waiver of record
(static-only output; `define:vars`/server islands/`astro:assets` unused;
astro@7 upgrade deferred to the F5 re-gate), this does not block approval.
Raw output appended below.

### check-traceability.py --all — FAIL (exit 1) → **blocking**

Reports `front-foundation: 0/21` and `site-pages: 0/28`. Reviewer diagnosis
(probe-verified in `/tmp/opencode/trace-probe`, repo untouched):

1. **Global R-ID collision (script design):** `collect_tables()` merges every
   `impl_*.md` into one map keyed by bare `R<n>`, so F2's rows R1–R21 pollute
   F1's. Removing `impl_site-pages.md` from the probe restores
   `front-foundation: 21/21` — F1 itself is healthy; the regression is caused
   solely by F2's table.
2. **F2 Tests-column format (the actual defect):** the script accepts an
   identifier only if it matches `^​(npm|npx|grep|…|test|wc|head|…)\b` (bare
   command), names a file under `tests/`, or appears in a colocated
   `*.spec.ts`. F2's cells use backticked commands (`` `npm run build && …` `` —
   leading backtick kills the prefix match), brace sets (`dist/{en,es,ca}/…` —
   the parser splits cells on commas, producing fragments like `es`),
   ellipses (`…`), and annotation text (`(6 tests)`, `(×es,ca)`).

**Probe result:** rewriting only the Tests column in F1's table style (bare
commands, no backticks, no brace sets, no ellipses, spec files cited as bare
filenames like `experience.spec.ts`, multiple evidence items comma-separated)
yields `front-foundation: 21/21, site-pages: 28/28, VERDICT: PASS, exit 0`.
The exact probe table that passed is preserved at
`/tmp/opencode/trace-probe/harness/progress/impl_site-pages.md` for reference.

### bench.sh — SKIPPED

`harness/tools/bench.sh` and `harness/baselines.json` do not exist → no
benchmark gate to run (noted per protocol).

## Required changes

1. **(blocking)** Reformat the Tests column of the traceability table in
   `harness/progress/impl_site-pages.md` to the parser-safe F1 style so
   `python3 harness/tools/check-traceability.py --all` exits 0:
   remove backticks around command identifiers; expand `{en,es,ca}` brace sets
   (use `&&` chains or one command per locale, never a comma inside a command);
   replace `…` ellipses and `(×es,ca)`/`(6 tests)` annotations with concrete
   comma-separated identifiers; cite colocated specs as bare filenames
   (`experience.spec.ts`, `skills.spec.ts`, `i18n.spec.ts`). Verification
   semantics must stay identical (same commands; move ×locale notes to the
   Notes section or the Implementation column). Do not modify
   `harness/tools/check-traceability.py` in this feature (the global-ID merge
   is a tool observation for the leader to schedule, not an F2 code change).
2. **(requested)** Add one line to `impl_site-pages.md` referencing the F1
   security waiver (impl_front-foundation.md §Security audit disposition, re-gate
   at F5) so the audit disposition for the persistent astro CRITICAL is
   discoverable from the current feature's progress entry (C7 hygiene).

After (1) [+ (2)], re-run `python3 harness/tools/check-traceability.py --all`
(must print PASS / exit 0 — no other gate is affected) and this feature is
APPROVED without re-review of code.

---

## Appendix — audit-security.sh raw output (2026-09-16, reviewer run)

```
Astro: XSS in define:vars via incomplete </script> tag sanitization - https://github.com/advisories/GHSA-j687-52p2-xcff
Astro: Server island encrypted parameters vulnerable to cross-component replay - https://github.com/advisories/GHSA-xr5h-phrj-8vxv
Astro: XSS via Unescaped Attribute Names in Spread Props - https://github.com/advisories/GHSA-jrpj-wcv7-9fh9
Astro: XSS via unescaped spread attribute names in renderHTMLElement (incomplete fix for CVE-2026-54298) - https://github.com/advisories/GHSA-f48w-9m4c-m7f5
Astro: Cross-site scripting via unescaped transition:* directive values on hydrated islands - https://github.com/advisories/GHSA-7pw4-f3q4-r2p2
Astro: Reflected XSS via unescaped View Transition animation properties - https://github.com/advisories/GHSA-4g3v-8h47-v7g6
Astro: Host header SSRF in prerendered error page fetch - https://github.com/advisories/GHSA-2pvr-wf23-7pc7
Astro: Reflected XSS via unescaped slot name - https://github.com/advisories/GHSA-8hv8-536x-4wqp
Astro: Remote code execution through AVIF image optimization - https://github.com/advisories/GHSA-26w7-cxv4-gfx2
Astro: Authorization bypass from missing path-segment boundary check when stripping the configured base - https://github.com/advisories/GHSA-376h-93r7-7g6f
fix available via `npm audit fix --force`
Will install astro@7.3.2, which is a breaking change
node_modules/astro

1 critical severity vulnerability

## SAST: eslint — SKIPPED (not configured)

VERDICT: HIGH severity findings — approval must be rejected (audit_level standard/strict).
```

All 10 advisories target `astro` (the waived package; static-only usage per the
F1 waiver scope). sharp/esbuild: 0 findings. VERDICT line disposition: waived —
see `harness/progress/impl_front-foundation.md` §Security audit disposition.

## Re-review (leader-recorded, conditional approval satisfied)

Both required changes landed in commit `08b9fc2` (parser-safe Tests column per
the reviewer's own probe table; F1 waiver reference added). Leader re-ran:
`python3 harness/tools/check-traceability.py --all` → front-foundation 21/21,
site-pages 28/28, VERDICT: PASS, exit 0; `bash harness/init.sh` green; vitest
26/26 unchanged. Per this review's own pre-authorization ("After (1) [+ (2)],
re-run ... and this feature is APPROVED without re-review of code"), F2 stands
**APPROVED**. Feature remains `in_progress` pending the human completion gate.
