# Review — feature F1 front-foundation

**Reviewer:** reviewer (opencode subagent session, 2026-09-16)
**Scope reviewed:** pre-harness commits `cf3f29b..8aa20ef` (spec'd in `harness/specs/front-foundation/`), R9 wiring fix `531ed92`, spec-author amendments to `requirements.md` (uncommitted), impl traceability entry.
**Verdict:** **CHANGES_REQUESTED**

The engineering work is sound — I independently re-ran 17 of the 21 requirement
verifications plus `npx vitest run` (11/11), `npm run check` (0 errors / 0
warnings / 1 hint) and `harness/init.sh` (green), and every one passed. The
rejection is driven by the strict-level audit gate (HIGH/CRITICAL findings with
no recorded resolution or waiver) and by `check-traceability.py` exiting
non-zero, plus housekeeping items. All are resolvable without touching shipped
site code.

## Requirement traceability ↔ tests

Semantic judgment applied: I re-executed each check marked **(reran)** myself on
the current tree (dist is fresh: built 17:59:47, after the `BaseLayout.astro`
edit at 17:59:40, before commit `531ed92`).

- R1: [x] `tsconfig.json` extends `astro/tsconfigs/strict`; `npm run check` → 0 errors / 0 warnings (reran)
- R2: [x] `npm run build` exit 0, `dist/en` present (39 pages); negative Zod check evidenced in impl entry (`year: Required` naming file, exit 1)
- R3: [x] `dist/{en,es,ca}/index.html` + `url=/en/` meta-refresh redirect (reran)
- R4: [x] `find dist -name '*.html'` outside locale dirs → exactly `dist/index.html` (reran)
- R5: [x] tokens greps `#0b1220`, `#2dd4bf`, `#0d9488`, `'Inter Variable'` (reran)
- R6: [x] `<html lang="{l}">` ×1 per locale on `projects/index.html`; BaseLayout-page scope per amended requirement (placeholder home excluded, F2) (reran)
- R7: [x] `localStorage.getItem('theme')` inline head script in `dist/en/projects/index.html` (reran)
- R8: [x] `matchMedia('(prefers-color-scheme: light)')` fallback in same page (reran)
- R9: [x] post-fix `531ed92`: `document.getElementById("theme-toggle")` in 36 pages, `localStorage.setItem(t,e)` in 36 pages (reran); toggle rendered once per BaseLayout page (`id="theme-toggle"` ×1 via `grep -o`)
- R10: [x] `i18n.spec.ts` › "falls back to en for a missing locale" — test read and confirmed it asserts `L({en:'Only', es:undefined,…}, 'es') === 'Only'`; vitest 11/11 (reran)
- R11: [x] compile-time `Record<UiKey,string>` (`npm run check`, reran) + vitest key-parity and non-empty tests (read + reran)
- R12: [x] `hreflang="` ×3 + `aria-current="true"` in `dist/en/projects/index.html` (reran)
- R13: [x] `localized()` requires en/es/ca (Zod at build); negative build evidenced in impl entry; `projects.spec.ts` trilingual test (read + reran)
- R14: [x] 11 JSON files, 5 featured (reran); also asserted by `projects.spec.ts`
- R15: [x] 11 card links; order = 5 featured (all 2026, name-asc) → 2026 secondaries name-asc → 2019 `bible-text-analysis` last; years cross-checked via jq (reran)
- R16: [x] 42 distinct stacks (jq), 53 `data-stack=` (42 buttons + 11 cards), `data-reset` present (reran)
- R17: [x] inlined script sets `e.hidden=…` and `aria-pressed` together: both minified fragments ×1 (reran)
- R18: [x] `t.clear(),o()` reset handler ×1 (reran)
- R19: [x] `dist/en/projects` = 12 (11 dirs + index); kafka page ships GitHub link + `>Problem<` (reran); `projects.spec.ts` slug/URL tests
- R20: [x] `rel="canonical" href="https://jordimp.net/en/projects/"` (reran)
- R21: [x] `! grep -rq '609 940 649' dist/` (reran) + vitest phone canary `/\d{9}/` on `ui` (read)

**No requirement lacks coverage.** The traceability-table *format*, however,
fails the installed script (see Module audits).

## Task completion

- T1–T8: [x] all marked in `tasks.md`, each with its delivery commit; all eight
  commits verified present in `git log` (`cf3f29b`, `674428f`, `e9171db`,
  `5007226`, `9c9fdf2`, `a616252`, `037c513`, `8aa20ef`). T8 env-fix inclusion is
  justified in `tasks.md` (ADR-7). No task remains `[ ]`.

## Modified-file checks (this round)

- `src/layouts/BaseLayout.astro` (+2 lines: import + `<ThemeToggle {lang} />`
  after the actions slot): respects architecture (component composition, no
  logic in layout, zero-framework script per ADR-5) and conventions (no
  comments, `interface Props`, UI strings from `ui` dictionary in
  `ThemeToggle.astro`, one behavior per script, `as` cast only at the Astro
  props boundary). dist freshness verified (build post-edit, pre-commit).
- `src/components/ThemeToggle.astro` (pre-existing, re-checked): clean.
- `harness/specs/front-foundation/requirements.md` (spec-author amendments):
  wording matches reality — BaseLayout-page scope for R6/R7/R8 matches the
  placeholder-home exception; corrected `dist/en/projects/index.html` paths and
  `grep -o | wc -l` guidance all re-verified above; R9 greps match post-fix
  output (36/36) and cite commit `531ed92`. **Not yet committed.**

## harness/init.sh

Green (exit 0): base files OK, `feature_list.json` valid (exactly one
`in_progress`), vitest 11/11.

## Module audits (`audit_level: strict`)

### audit-security.sh — FAIL (exit 1, HIGH+CRITICAL findings)

Full output appended below. `npm audit` (via the script, `--audit-level=high`):

| Package | Severity | Nature | Exploitability in this repo |
|---|---|---|---|
| `astro` | **critical** | XSS in `define:vars` / server-island encrypted params | features unused (no `define:vars`, no server islands, no SSR — static output only) |
| `sharp` | **high** | inherited libvips/libheif CVEs | image pipeline unused (no `astro:assets`; `dist/_astro/` = fonts + CSS only) |
| `esbuild` | low | dev-server file read (Windows) | dev-only, Linux dev boxes |

All three are transitive deps of `astro ^5.18.2`; npm's only automated fix is
the breaking jump to `astro@7.3.2`, which ADR-1 explicitly defers out of F1.
Nevertheless the strict gate is mechanical: **HIGH findings reject approval
unless explicitly waived in the progress entry** (CHECKPOINTS C7). No waiver or
resolution is recorded in `harness/progress/impl_front-foundation.md`.

### bench.sh

Does not exist in `harness/tools/`; `harness/baselines.json` absent → **no
baselines — skip gate.**

### check-traceability.py — FAIL (exit 1): "0/21 requirements covered"

Diagnosis (script read, `harness/tools/check-traceability.py`):

1. `ROW_RE` (line 29) only matches rows whose **first cell is a bare `R<n>`**
   (`^\|\s*(R\d+)\s*\|`). The impl table uses `| R1 strict type-check | …` —
   zero rows parse. Fixable by reformatting the impl table's first column.
2. `test_identifier_exists` (lines 62–69) looks **only under `tests/**/*.py`**.
   This repo has no `tests/` dir; docs/conventions.md mandates colocated
   `*.spec.ts` under `src/` for units. Even with (1) fixed, the script can
   never pass for this stack — a harness-tool/repo-convention mismatch that
   needs a leader decision (extend the tool to also scan `src/**/*.spec.ts` /
   `tests/**/*.ts`, or record the harness-level deviation).

The semantic mapping itself is complete (see traceability section) — the
failure is mechanical, not a coverage gap. But per the reviewer protocol a
non-zero exit blocks approval until fixed or explicitly dispositioned.

## Checkpoints

- C1: [x] base files + 3 docs present; `init.sh` exit 0
- C2: [x] exactly one `in_progress` (F1); no `done` features yet; current.md describes the active session (but its "Next step" tail is stale — see required change 4)
- C3: [x] `src/` contains only front modules per architecture.md; grep for TODO/FIXME/console.log/debug prints: clean
- C4: [x] logic modules unit-tested (`i18n.spec.ts`, `content/projects.spec.ts` — colocated per docs/conventions.md); pages/components verified through the build-artifact checks mandated by the spec's verification strategy; all tests green. E2E (Playwright) is F5 scope by plan.
- C5: [ ] working tree not clean — `harness/specs/front-foundation/requirements.md` amendments uncommitted (session still open, but must land before closure)
- C6: [x] spec folder complete (3 files); EARS-style requirements; F1 not `done` so closure box n/a (all tasks `[x]` regardless); R1–R21 semantically covered by concrete tests/commands — script-format gap tracked above
- C7: [ ] audit report recorded only in this review file; HIGH findings neither resolved nor explicitly waived in the progress entry — **this is the substantive blocker**

## Required changes

1. **Audit gate (C7):** in `harness/progress/impl_front-foundation.md`, either
   resolve the npm-audit findings within scope (try plain `npm audit fix`
   without `--force` / dependency `overrides` pinning `sharp`/`esbuild` inside
   `astro ^5`), or record an **explicit waiver** stating scope: static-only
   output, `define:vars`/server-islands/`astro:assets` unused, esbuild issue
   Windows-dev-only — and that the astro@7 upgrade is deferred (ADR-1) with a
   follow-up tracked (e.g. F5 qa-gate or a dedicated task).
2. **Traceability gate:** leader — fix or explicitly disposition
   `check-traceability.py`'s `tests/**/*.py`-only identifier lookup for
   TS/colocated-spec repos (docs/conventions.md); implementer — reformat the
   impl table's first column to bare `R<n>` (`| R1 | … |`) so `ROW_RE` matches,
   then re-run `python3 harness/tools/check-traceability.py --all` to exit 0.
3. Commit the spec-author amendments to
   `harness/specs/front-foundation/requirements.md`.
4. Refresh `harness/progress/current.md` (log + Next step still describe R9 as
   blocked, superseded by `531ed92`).

## Appendix — audit-security.sh raw output (2026-09-16)

```
# Security Audit Report (stack: typescript)

## Dependency scan: npm audit
Astro: Cross-site scripting via unescaped transition:* directive values on hydrated islands - https://github.com/advisories/GHSA-7pw4-f3q4-r2p2
Astro: Reflected XSS via unescaped View Transition animation properties - https://github.com/advisories/GHSA-4g3v-8h47-v7g6
Astro: Host header SSRF in prerendered error page fetch - https://github.com/advisories/GHSA-2pvr-wf23-7pc7
Astro: Reflected XSS via unescaped slot name - https://github.com/advisories/GHSA-8hv8-536x-4wqp
Astro: Remote code execution through AVIF image optimization - https://github.com/advisories/GHSA-26w7-cxv4-gfx2
Astro: Authorization bypass from missing path-segment boundary check when stripping the configured base - https://github.com/advisories/GHSA-376h-93r7-7g6f
Depends on vulnerable versions of esbuild
Depends on vulnerable versions of sharp
fix available via `npm audit fix --force`
Will install astro@7.3.2, which is a breaking change
node_modules/astro

esbuild  0.27.3 - 0.28.0
esbuild allows arbitrary file read when running the development server on Windows - https://github.com/advisories/GHSA-g7r4-m6w7-qqqr
fix available via `npm audit fix --force`
Will install astro@7.3.2, which is a breaking change
node_modules/astro/node_modules/esbuild

sharp  <=0.35.4-rc.0
Severity: high
sharp inherited vulnerabilities in libvips: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591 - https://github.com/advisories/GHSA-f88m-g3jw-g9cj
sharp: Vulnerabilities in libheif: GHSA-g89c-p67h-r497 and GHSA-2jg2-4ch7-h545 - https://github.com/advisories/GHSA-rgj7-g3m4-5g8c
fix available via `npm audit fix --force`
Will install astro@7.3.2, which is a breaking change
node_modules/sharp

3 vulnerabilities (1 low, 1 high, 1 critical)

npm audit --json severity mapping (reviewer): astro=critical, sharp=high, esbuild=low

## SAST: eslint — SKIPPED (not configured)

## Checklist
Confirm every item of the Security Audit Checklist in docs/verification.md
(section 'Security Audit Checklist'). Record the outcome in the review file.

VERDICT: HIGH severity findings — approval must be rejected (audit_level standard/strict).
```

## Appendix — Security Audit Checklist manual confirmation (docs/verification.md)

- A01 Broken Access Control: N/A — fully static output, no endpoints, no auth surface.
- A02 Cryptographic Failures: [x] no hardcoded secrets — `src/config.ts` holds
  only the public contact data architecture.md permits; no crypto usage, no
  randomness, nothing at rest (no storage).
- A03 Injection: [x] no SQL, no shell, no path traversal surface; Astro
  auto-escapes interpolated expressions; grep confirms no `set:html` /
  `define:vars` anywhere in `src/`; the flagged astro XSS advisories target
  exactly those unused features.
- A04 Insecure Design: [x] external input = content JSON, validated by Zod at
  build (R2/R13); no public endpoints → no rate limiting applicable.
- A05 Security Misconfiguration: [x] static build; no debug mode or stack
  traces shipped; no default credentials.
- HTTP security headers: N/A for the artifact (static hosting); revisit at F4
  (GitHub Pages / custom domain) if headers become configurable.

---

# Re-review (round 2)

**Reviewer:** reviewer (opencode subagent session, 2026-09-16)
**Scope:** fix range `531ed92..HEAD` (`253057e`, `380b2e5`) only — verifying the
4 required changes from round 1 plus new breakage. No re-litigation of
previously approved work.

## Required changes — verdicts

### 1. Audit gate (C7) — ADDRESSED

- `package.json` `overrides` verified present: `"sharp": "^0.35.4"`,
  `"esbuild": "^0.28.0"` (lines 30–33); `package-lock.json` regenerated in
  `253057e`.
- Post-fix `bash harness/tools/audit-security.sh`: exactly **1 critical**
  finding (astro `<=7.2.7`, 10 GHSA advisories) — the round-1 **sharp HIGH and
  esbuild low are gone**. Script `exit 1` is its designed behavior with any
  ≥HIGH finding (it has no waiver mechanism); the disposition of record is the
  documented waiver, which is what C7 requires.
- Explicit waiver recorded in `impl_front-foundation.md` §
  "Security audit disposition": sharp + esbuild RESOLVED via overrides; astro
  CRITICAL WAIVED on non-exposure grounds (static-only output, no
  `define:vars`/`set:html`/server islands/View-Transition directives/AVIF
  pipeline, single-base site, Zod-validated content) with `astro@7` deferred
  per ADR-1 and a **tracked F5 qa-gate re-gate** mandated — precisely the
  scope+follow-up wording required change 1 demanded.

### 2. Traceability gate — ADDRESSED

- `python3 harness/tools/check-traceability.py --all` →
  `## front-foundation: 21/21 requirements covered` / `VERDICT: PASS`,
  **exit 0**.
- Leader-ruled harness-tool change (colocated-spec + tests/ lookups, prescribed
  commands as evidence pointers, comma-split Test(s) cell): functional — it
  parses the reformatted table and resolves every identifier; not broken, so
  out of my rejection scope.
- Impl table reformatted to bare `R<n>` rows with comma-separated bare
  test/command items (format note at impl file lines 9–14); old descriptive
  text preserved in Findings.

### 3. Spec amendments committed — ADDRESSED

- `253057e` touches `harness/specs/front-foundation/requirements.md`
  (BaseLayout-page scope for R6–R8 placeholder exception, corrected
  `dist/en/projects/index.html` paths + `grep -o | wc -l` guidance, R9 greps
  citing `531ed92`). Nothing pending in the working tree related to specs.

### 4. `current.md` refreshed — ADDRESSED

- Log lines 36–40 record review round 1 verdict, leader rulings, spec
  amendments and the round-2 battery; "Next step" = this re-review → leader
  marks `done` on approval. Accurate and current.

## Command outputs (re-run 2026-09-16, post-`380b2e5`)

| Command | Result |
|---|---|
| `python3 harness/tools/check-traceability.py --all` | 21/21 covered, VERDICT: PASS, exit 0 |
| `bash harness/tools/audit-security.sh` | exactly 1 critical (astro), 0 high — exit 1 by design (waived, see change 1) |
| `bash harness/init.sh` | all OK — env, feature_list valid, vitest 11/11, exit 0 |
| `npx vitest run` | 2 files, **11/11** passed |
| `npm run build` | **39 pages** built, no errors |

## Semantic spot-checks (impl table ↔ reality)

- R5: `#0b1220` + `'JetBrains Mono'` present in `src/styles/tokens.css` ✓
- R6: `<html lang="es">` found in `dist/es/projects/index.html` ✓
- R9: `id="theme-toggle"` ×1 per page; `grep -rl 'theme-toggle' dist/` → 36
  files ✓
- R19: `dist/en/projects` → 12 entries; kafka-adapter-telemetry GitHub link
  ships ✓
- R21: `! grep -rq '609 940 649' dist` passes — no phone leak ✓

## New breakage in fix range

None. `253057e` + `380b2e5` touch only harness docs/tooling,
`requirements.md`, `package.json`/`package-lock.json` (overrides + regenerated
lock) and the review record — no `src/` application code. Full battery green
post-change (table above).

## Checkpoint re-marks

- **C5 — Session closed properly:** [x] no suspicious untracked files
  (`git status` clean of strays); [ ] `history.md` entry — correctly **still
  pending**, moved at `done` time by the leader; [x] last worked feature
  reflects correct state (`F1 = in_progress`, awaiting leader closure).
- **C7 — Audit (conditional):** [x] latest progress entry contains the audit
  report (`audit_level` strict — raw output in Appendix + re-run above);
  [x] findings above threshold **resolved** (sharp HIGH, esbuild low via
  overrides) or **explicitly waived** (astro CRITICAL, impl §
  Security audit disposition, F5 re-gate tracked).

## Final verdict

**APPROVED.** All 4 required changes from round 1 are resolved with evidence;
no new breakage introduced in `531ed92..HEAD`; traceability 21/21, tests
11/11, build 39 pages, audit dispositioned (2 resolved + 1 explicit waiver
with tracked follow-up). F1 stays `in_progress` — marking `done`, moving the
summary to `history.md` and clearing `current.md` are the leader's/human's
closure steps per the workflow.
