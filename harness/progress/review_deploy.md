# Review — feature deploy (F4, LOCAL part T1–T4)

**Verdict:** APPROVED

Branch `feat/front-phase-0-1` @ `1cdd141` (5 commits, `5a7ae66..1cdd141`, T1–T4
local scope). Reviewer re-executed every R1–R12 verification independently
(own PyYAML battery, own greps, own build — not the implementer's output):
`npx vitest run` 57/57 · `npx astro check` 0 errors / 0 warnings (1
pre-existing F1 hint) · `npm run build` 52 pages, `dist/CNAME` = `jordimp.net`
single line, R12 dist canonical/sitemap greps green · `harness/init.sh` exit 0
"Environment ready" · `check-traceability.py --feature deploy` 18/18 PASS and
`--all` PASS (exit 0, F1–F4) · all five `uses:` SHAs re-resolved via
`git ls-remote` against the upstream tags — **5/5 exact match** (table below).
No required changes. Four non-blocking notes recorded at the end.

## Requirement traceability ↔ tests

All re-executed by the reviewer against the working tree and a fresh `dist/`:

- R1: [x] file present; `yaml.safe_load` parses clean (PyYAML, no errors)
- R2: [x] parsed trigger `push.branches == ['main']` (PyYAML `on:`→`True` caveat handled)
- R3: [x] `workflow_dispatch` key present in parsed trigger block
- R4: [x] `^ *node-version: *22$` in `deploy.yml:27`; `grep -qF '">=22.12.0"' package.json` PASS (exact prescribed commands)
- R5: [x] parsed step order `npm ci`(29) < `npm run build`(30) < upload-pages-artifact(34) < deploy-pages(38) — design §Verification-strategy script re-run, prints "step order OK" semantics (0 ≤ 3 < 4 < 6 < 8)
- R6: [x] exactly one `actions/upload-pages-artifact` line; parsed `with.path == 'dist'`
- R7: [x] one `configure-pages` + one `deploy-pages`; parsed `environment.name == 'github-pages'`, `url` refs `steps.deployment.outputs.page_url`; deploy step `id: deployment`
- R8: [x] 5 `uses:` lines / 5 with 40-hex SHA / 0 unpinned / 5 version-tag comments (prescribed grep pair: 5 and 0)
- R9: [x] parsed `permissions == {contents: read, pages: write, id-token: write}` exactly; zero per-step permission overrides
- R10: [x] parsed `concurrency == {group: pages, cancel-in-progress: False}` exactly
- R11: [x] `public/CNAME` = `jordimp.net\n` exactly 1 line; build emits `dist/CNAME` verbatim; guard step live at `deploy.yml:31-32` (`test -f dist/CNAME && grep -qx 'jordimp.net' dist/CNAME`) — both guard greps PASS
- R12: [x] `astro.config.mjs` `site: 'https://jordimp.net'`, no `base:`; fresh build: `dist/en/index.html` carries `rel="canonical" href="https://jordimp.net/en/"`, `dist/sitemap-0.xml` carries `<loc>https://jordimp.net/en/</loc>`
- R13: [x] checklist §1 contains all 4 apex A IPs, `www` CNAME → `jordimarsal.github.io`, `_github-pages-challenge-jordimarsal` TXT form, `dig +short jordimp.net A` and `dig +short www.jordimp.net CNAME` with expected outputs — **accuracy verified against GitHub's official docs** (ruling below)
- R14: [x] checklist §2 sequences Source "GitHub Actions" → custom domain → DNS check → Enforce HTTPS after certificate issuance; §3 contains all prescribed `curl` commands with expected outputs
- R15: [ ] blocked-human — commands + expected outputs pinned in checklist §3; execution requires push + DNS + live site (outside agent reach by spec §Scope). Legitimate (ruling below)
- R16: [ ] blocked-human — `curl -sI http://jordimp.net/en/` pinned in checklist §3; requires Enforce HTTPS toggle (human, post-certificate)
- R17: [ ] blocked-human — `curl -sI https://www.jordimp.net/en/` pinned in checklist §3; requires live DNS
- R18: [ ] blocked-human — robots/sitemap/llms/canonical live checks pinned in checklist §3; local counterparts verified green (`dist/robots.txt` sitemap line re-checked by reviewer)

## Task completion

- T1: [x] T2: [x] T3: [x] T4: [x] — all `[x]` in `harness/specs/deploy/tasks.md`;
  in-range diff is checkbox flips only (verified). T5–T6 remain `[ ]` **with
  justification**: tasks.md header + `impl_deploy.md` note 4 + spec §Scope
  document the human gate (no remote, no push from agent session, registrar
  and Pages settings are human-only). Protocol-compliant. Each task backed by
  a conventional commit (`62f3957`, `77f4b86`, `993a0bf`, `1cdd141`).
  `feature_list.json` and `history.md` untouched by the implementer (the
  working-tree modifications to those files plus the deleted `opencode.json`
  are the pre-existing leader-owned items, F3-review precedent).

## SHA verification (supply-chain, re-resolved by reviewer)

`git ls-remote https://github.com/<action>.git refs/tags/<tag>` vs
`deploy.yml` — all five tags are lightweight (no `^{}` peel line), so the
listed SHA **is** the commit SHA:

| Action | Tag | ls-remote SHA | File SHA (`deploy.yml`) | Match | Latest upstream? |
|---|---|---|---|---|---|
| actions/checkout | v7.0.1 | `3d3c42e5aac5…ba90b1` | `3d3c42e5aac5…ba90b1` | ✅ | yes (v7.0.1 = newest tag) |
| actions/setup-node | v7.0.0 | `820762786026…fe5020` | `820762786026…fe5020` | ✅ | yes (v7.0.0 = newest) |
| actions/configure-pages | v6.0.0 | `45bfe0192ca1…254a0d` | `45bfe0192ca1…254a0d` | ✅ | yes (v6.0.0 = newest) |
| actions/upload-pages-artifact | v5.0.0 | `fc324d354710…cc49c9` | `fc324d354710…cc49c9` | ✅ | yes (v5.0.0 = newest) |
| actions/deploy-pages | v5.0.1 | `368f82528645…3f51346` | `368f82528645…3f51346` | ✅ | yes (v5.0.1 = newest) |

The implementer's "(or current major at implementation)" reading of the design
sketch is **authorized**: ADR-3 mandates resolving SHAs from the releases at
implementation time, and the sketch's own comments were explicitly marked as
an "authoritative sketch" with versions to be resolved. Every pinned tag is
the current newest release of its repo — not merely a valid SHA. Claim VERIFIED.

## R13 record accuracy — VERIFIED against official GitHub docs

Checked against docs.github.com "Managing a custom domain for your GitHub
Pages site" and "Verifying your custom domain for GitHub Pages" (fetched
during this review):

1. Four apex A records `@ → 185.199.108.153 / .109.153 / .110.153 / .111.153`
   — exact match with GitHub's table.
2. `www` CNAME → `<user>.github.io` (pointing at `jordimarsal.github.io`,
   no repository name) — matches GitHub's subdomain rule; the checklist's
   trailing-dot value `jordimarsal.github.io.` is a correct absolute FQDN and
   the `dig +short` expected output (trailing dot) is accurate.
3. TXT verification form `_github-pages-challenge-jordimarsal.jordimp.net TXT
   <code>` — matches GitHub's `dig _github-pages-challenge-USERNAME.example.com
   … TXT` pattern; correctly marked optional.
4. Enforce HTTPS sequencing (only after DNS check + certificate issuance) —
   matches ("It can take up to 24 hours before this option is available").
5. All `dig`/`curl` commands carry concrete expected outputs (R15–R18 suite).

Accuracy ruling: the checklist is a faithful, executable rendition of the
current official procedure. Two LOW doc nuances noted below (§1→§2 ordering
vs GitHub's takeover tip; Verify-button location now profile-level).

## Blocked-human split ruling — LEGITIMATE

The T1–T4 (agent) / T5–T6 (human) split matches `requirements.md` §Scope and
§Verifiability split verbatim: R1–R12 are repository-internal, R13–R14 are
document-content verifications, R15–R18 require push + registrar DNS + Pages
admin toggles + TLS issuance — none reachable without the GitHub remote that
does not exist (`git remote -v` empty; no merge to `main` has occurred — the
local `main` ref is a stale docs-only branch, tip `6286926`, strict ancestor
of the feature branch, last commit 2026-09-16, untouched by the implementer).
Creating the remote and pushing are exactly T5, human-gated. The tooling
treats the rows the same as F2/F3 precedent: `check-traceability.py --feature
deploy` → 18/18 PASS with the R15–R18 evidence pointers. Nothing in R1–R14 is
maskable by this status. Split ACCEPTED.

## Modified files vs architecture / conventions

- `.github/workflows/deploy.yml` — static-first publish of an immutable
  artifact (architecture Principle 1); single job, official `actions/*` only,
  5/5 SHA-pinned (conventions' digest-pinning discipline), minimal permissions,
  serializing concurrency, guard step (R11). No comments beyond the pin
  version tags (permitted why-comments). ✓
- `public/CNAME` — single line, committed asset, build-carried. ✓
- `docs/deploy-dns-checklist.md` — English, executable commands with expected
  outputs, human responsibilities explicit (ADR-5). ✓
- `astro.config.mjs`, `src/**` — untouched, as the design dictates ("Files to
  modify: None"); F1–F3 behavior re-verified green by the reviewer's own build.
  ✓
- Security lens: no `pull_request` trigger (push `main` + dispatch only — no
  untrusted-code path to secrets); no third-party actions; no
  untrusted `${{ }}` interpolation in any `run:` block (the three `run:`s are
  literal; the sole expression is the first-party `steps.deployment.outputs.page_url`
  in the environment URL); `cache: npm` is the official setup-node cache over
  the repo's own lockfile — no poisoning surface; token scoped to exactly the
  Pages OIDC publish flow. ✓

## Checkpoints

- C1: [x] AGENTS.md, `harness/init.sh`, `harness/feature_list.json`,
  `harness/progress/current.md` + the 3 docs present; `harness/init.sh` exit 0 (re-ran)
- C2: [x] exactly one `in_progress` (F4); F1–F3 done with passing tests (57/57);
  `current.md` logs the active session in real time
- C3: [x] `src/` untouched by F4; TODO/FIXME/console/debugger sweep over the
  new files: clean
- C4: [x] all tests pass under `harness/init.sh`; no new `src/` modules → no
  new unit-test obligation (workflow/checklist verified by the prescribed
  command battery per design §Verification strategy, re-executed by reviewer)
- C5: [x] no suspicious untracked files (`git status` shows only the
  pre-existing leader-owned items: modified `feature_list.json`/`history.md`,
  deleted `opencode.json` — leader should commit them, F3 precedent);
  `history.md` has F1–F3 entries; F4 `in_progress` is the correct state
  pending T5–T6 human activation
- C6: [x] spec folder has the 3 files; EARS shall/WHEN/WHERE forms; T1–T4 `[x]`,
  T5–T6 `[ ]` justified (see Task completion); every R1–R18 mapped to a
  concrete verification (checker: 18/18 PASS)
- C7: [x] strict audit executed and recorded below; the only above-threshold
  finding is the known waived astro CRITICAL (waiver of record in
  `impl_front-foundation.md` §Security audit disposition, F5 re-gate); **no
  NEW high/critical findings** — F4 adds zero astro-runtime surface

## Module audits (`audit_level: strict`)

### audit-security.sh — known waived astro CRITICAL persists; no NEW HIGH

Exit 1 with exactly **1 critical** vulnerability (`astro <=7.2.7`, the same 10
GHSA advisories as the F1/F2/F3 runs; suggested forced fix now `astro@7.3.3`).
Zero sharp/esbuild findings — the F1 `overrides` hold. SAST eslint SKIPPED
(not configured). Per the F1 waiver of record (static-only output, no server
surface, no `define:vars`/server islands/`astro:assets` usage; upgrade
deferred to the F5 re-gate) and the F2/F3 precedent, this does not block.
The F4 changes (workflow YAML, CNAME asset, docs) introduce no astro-runtime
code path — the waiver scope is unaffected. The **F5 re-gate remains
obligated** to upgrade astro or renew the waiver.

### check-traceability.py — PASS (exit 0)

`deploy: 18/18 · front-foundation: 21/21 · seo-analytics: 21/21 ·
site-pages: 28/28 — VERDICT: PASS`. Blocked-human handling consistent with the
F2/F3 tool treatment.

### bench.sh — SKIPPED

`harness/tools/bench.sh` and `harness/baselines.json` do not exist → no
benchmark gate to run (noted per protocol).

## Non-blocking notes

1. **Checklist §1/§2 ordering vs GitHub's takeover tip.** GitHub's docs
   recommend adding the custom domain in Settings → Pages *before* creating
   the registrar DNS records ("Configuring your custom domain with your DNS
   provider without adding your custom domain to GitHub could result in
   someone else being able to host a site on one of your subdomains"). The
   checklist sequences DNS (§1) before settings (§2). End state identical and
   the window is self-limited; suggest adding one sentence to §1 when the file
   is next touched. (R13/R14 do not pin cross-section order.)
2. **Verify-button location.** GitHub has moved domain verification to
   *profile*-level Settings → Pages ("Add a domain"), not repo settings; the
   checklist's optional step 4 in §2 reads repo-level. Marked optional, so
   LOW. Suggest rewording when touched.
3. **CNAME-in-artifact rationale is dated.** GitHub's current docs state that
   for Actions-source publishing the artifact CNAME file "is ignored and is
   not required" (the settings custom-domain field binds the domain). ADR-2's
   guard is therefore belt-and-suspenders rather than the binding mechanism —
   harmless, and still a valuable regression tripwire, but the design's
   consequence claim ("artifact without CNAME can remove the domain")
   describes branch-publishing behavior. Spec-accuracy note only.
4. **Spec §Scope phrasing.** "the repo has no `main` branch or git remote
   yet" — a stale docs-only local `main` (tip `6286926`, no remote) predates
   the feature branch. Substance (no merge, no push, no remote) holds;
   T5's description remains exactly right.

## Verdict

All 14 locally-verifiable requirements re-verified by the reviewer against the
working tree and a fresh build; the human-gated split (R15–R18 / T5–T6) ruled
legitimate; all five action SHAs re-resolved and matched against upstream
tags, each the current newest release; gates green (init.sh, vitest 57/57,
astro check, build, traceability 18/18); strict audit disposed per the
standing F1 waiver with no NEW findings; checkpoints C1–C7 met. **APPROVED**
for the local scope — feature proceeds to the human activation gate
(T5–T6 per `docs/deploy-dns-checklist.md`; leader flips F4 → `done` only
after the live suite outputs are recorded in `harness/progress/impl_deploy.md`).
