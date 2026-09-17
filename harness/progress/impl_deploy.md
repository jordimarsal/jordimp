# Implementation report — deploy (F4)

Branch `feat/front-phase-0-1` · spec `harness/specs/deploy/` (R1–R18, T1–T6,
ADR-1–5). Agent tasks T1–T4 executed in order and green; T5–T6 are human-gated
activation tasks (merge → push → DNS → Pages settings → live suite) and remain
open by design — the repo has no `main` branch/remote yet and nothing may be
pushed from the agent session (spec §Scope).

## Traceability

| Requirement | Test(s)/Verification | Implementation file(s) | Status |
|---|---|---|---|
| R1 | test -f .github/workflows/deploy.yml, python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))" → exit 0 no parse errors | `.github/workflows/deploy.yml` | done |
| R2 | python3 -c "import yaml; w=yaml.safe_load(open('.github/workflows/deploy.yml')); assert (w.get(True) or w.get('on'))['push']['branches'] == ['main']" (PyYAML `on:`→`True` caveat handled) | `.github/workflows/deploy.yml` | done |
| R3 | python3 -c "import yaml; w=yaml.safe_load(open('.github/workflows/deploy.yml')); assert 'workflow_dispatch' in (w.get(True) or w.get('on'))" | `.github/workflows/deploy.yml` | done |
| R4 | grep -qE '^ *node-version: *22$' .github/workflows/deploy.yml, grep -qF '">=22.12.0"' package.json | `.github/workflows/deploy.yml`, `package.json` | done |
| R5 | python3 parsed-YAML step-order script over jobs.deploy.steps per design.md §Verification strategy (order npm ci < npm run build < upload-pages-artifact < deploy-pages) | `.github/workflows/deploy.yml` | done |
| R6 | grep -nE 'uses: actions/upload-pages-artifact@' .github/workflows/deploy.yml → exactly 1 line, python3 parsed-YAML assert that step's with.path == 'dist' | `.github/workflows/deploy.yml` | done |
| R7 | grep -c 'uses: actions/configure-pages@' .github/workflows/deploy.yml → 1, grep -c 'uses: actions/deploy-pages@' .github/workflows/deploy.yml → 1, python3 parsed-YAML assert jobs.deploy.environment.name == 'github-pages' and environment url references steps.deployment.outputs.page_url | `.github/workflows/deploy.yml` | done |
| R8 | grep -nE '^\s*(- )?uses:' .github/workflows/deploy.yml matched against '@[0-9a-f]{40}' → 5 of 5 with zero unpinned uses lines (grep -vE variant → wc -l 0) | `.github/workflows/deploy.yml` | done |
| R9 | python3 parsed-YAML assertion w['permissions'] == {contents: read · pages: write · id-token: write} with no other permission keys | `.github/workflows/deploy.yml` | done |
| R10 | python3 parsed-YAML assertion w['concurrency'] == {group: pages · cancel-in-progress: False} | `.github/workflows/deploy.yml` | done |
| R11 | grep -qx 'jordimp.net' public/CNAME, test "$(wc -l < public/CNAME)" -eq 1, npm run build then grep -qx 'jordimp.net' dist/CNAME, grep -qE 'test -f dist/CNAME' .github/workflows/deploy.yml, grep -qE "grep -qx '?jordimp.net'? dist/CNAME" .github/workflows/deploy.yml | `public/CNAME`, `.github/workflows/deploy.yml` (guard step) | done |
| R12 | grep -qF "site: 'https://jordimp.net'" astro.config.mjs, grep -qE '^\s*base:' astro.config.mjs inverted → no match, npm run build then grep -qF 'rel="canonical" href="https://jordimp.net/en/"' dist/en/index.html, grep -qF '<loc>https://jordimp.net/en/</loc>' dist/sitemap-0.xml | `astro.config.mjs` (pre-existing deploy-aligned state — design: modify nothing), `src/lib/seo.ts` (same origin) | done |
| R13 | grep -qF each of 185.199.108.153 · 185.199.109.153 · 185.199.110.153 · 185.199.111.153 · www.jordimp.net · jordimarsal.github.io · _github-pages-challenge-jordimarsal · dig +short jordimp.net A · dig +short www.jordimp.net CNAME in docs/deploy-dns-checklist.md (all → 0 exit) | `docs/deploy-dns-checklist.md` §1 | done |
| R14 | grep -qi 'Source.*GitHub Actions' docs/deploy-dns-checklist.md, grep -qi 'custom domain', grep -qi 'Enforce HTTPS', grep -qF curl -sI https://jordimp.net/en/ and curl -sI http://jordimp.net/en/ and curl -sI https://www.jordimp.net/en/ in docs/deploy-dns-checklist.md | `docs/deploy-dns-checklist.md` §2–§3 | done |
| R15 | curl -sI https://jordimp.net/en/ → HTTP/2 200 + server: GitHub.com (expected) plus /es/about/ · /ca/skills/ → 200 and / → meta-refresh stub ./en/ — commands + expected outputs in docs/deploy-dns-checklist.md §3; human executes post-push and records outputs here | `docs/deploy-dns-checklist.md` §0 + §3, `.github/workflows/deploy.yml` | blocked-human |
| R16 | curl -sI http://jordimp.net/en/ → 301 location: https://jordimp.net/en/ (expected) — checklist §2 step 5 (Enforce HTTPS) + §3; human executes post-push | `docs/deploy-dns-checklist.md` §2 + §3 | blocked-human |
| R17 | curl -sI https://www.jordimp.net/en/ → 301 location: https://jordimp.net/en/ (expected) — checklist §3; human executes post-push | `docs/deploy-dns-checklist.md` §1 + §3 | blocked-human |
| R18 | curl -s https://jordimp.net/robots.txt grep -F 'Sitemap: https://jordimp.net/sitemap-index.xml' · sitemap-index.xml → 200 · llms.txt → 200 text/plain · live /en/ canonical tag (expected) — checklist §3; human executes post-push | `docs/deploy-dns-checklist.md` §3, `public/robots.txt`, `astro.config.mjs` | blocked-human |

## Final battery (T4)

- `bash harness/init.sh` — all steps `[OK]`, ends "Environment ready".
- `npx vitest run` — **57/57 passed** (7 files; F1–F3 baseline untouched, no
  new vitest specs added — the workflow/checklist are verified by the
  prescribed command battery per design §Verification strategy).
- `npx astro check` — 0 errors, 0 warnings.
- `npm run build` — 52 pages built; `dist/CNAME` = `jordimp.net` (single
  line); `dist/robots.txt` sitemap line intact; canonical + sitemap-0 greps
  green (R12).
- R1–R10 command battery over `.github/workflows/deploy.yml` — all green
  (YAML parse with PyYAML 6.0.1; triggers incl. `on:`→`True` caveat; Node 22
  pin + engines `>=22.12.0`; parsed step order + `path: dist` + environment
  URL wiring; 5/5 `uses:` SHA-pinned with version comments, 0 unpinned;
  exact permissions; concurrency serial).
- R13–R14 checklist content greps — all green.

## Action pinning provenance (R8 / ADR-3)

| Action | Pinned | Comment |
|---|---|---|
| actions/checkout | `3d3c42e5aac5ba805825da76410c181273ba90b1` | v7.0.1 |
| actions/setup-node | `820762786026740c76f36085b0efc47a31fe5020` | v7.0.0 |
| actions/configure-pages | `45bfe0192ca1faeb007ade9deae92b16b8254a0d` | v6.0.0 |
| actions/upload-pages-artifact | `fc324d3547104276b827a68afc52ff2a11cc49c9` | v5.0.0 |
| actions/deploy-pages | `368f82528645a54fb793d4d04e342629a3f51346` | v5.0.1 |

SHAs resolved with `git ls-remote` against each upstream repo at the current
stable release tag (all five tags are lightweight, so the listed SHA **is**
the commit SHA — no annotation peel needed). The design sketch's version
comments were marked "(or current major at implementation)" and ADR-3
mandates resolving from the releases at implementation time — the current
majors (checkout v7 · setup-node v7 · configure-pages v6 ·
upload-pages-artifact v5 · deploy-pages v5) are newer than the sketch's
illustrative v4/v3/v5 comments; no invented SHAs, no mutable tags.

## Notes

1. **No new vitest specs.** Design's verification strategy verifies the
   workflow YAML and checklist document via the requirements' command
   battery, not vitest; F1–F3 suites stay frozen (57/57).
2. **`astro.config.mjs` untouched** — design §Files to modify: none; R12
   verifies the existing deploy-aligned state (`site` apex, no `base`).
3. **Traceability cells are command-prefixed and comma/pipe-free** per
   `harness/tools/check-traceability.py` parsing (F2/F3 precedent); R15–R18
   cite the checklist commands as evidence pointers with status
   `blocked-human` (Protocol §5: unresolved ≠ gap).
4. **T5–T6 remain open.** They require the human: merge to `main`, push,
   create the GitHub repo/remote, registrar DNS, Pages settings, live curl
   suite. The agent session performs none of these (spec §Scope).

## Human activation steps

Execute `docs/deploy-dns-checklist.md` top to bottom:

1. §0 — merge `feat/front-phase-0-1` → `main`, push; confirm the Actions run
   for the merge commit is green (R2) and a manual `workflow_dispatch` run is
   green (R3).
2. §1 — create the registrar records (4 apex A → 185.199.108–111.153;
   `www` CNAME → `jordimarsal.github.io.`; optional verification TXT);
   verify each with the documented `dig +short` commands.
3. §2 — Settings → Pages: Source **GitHub Actions** → custom domain
   `jordimp.net` → wait for DNS check → enable **Enforce HTTPS** after
   certificate issuance.
4. §3 — run the curl suite; **record every output below** (replacing the
   "(expected)" notes) as completion-gate evidence for R15–R18.

### Live suite results (to be filled by the human)

```
R2 (Actions run on main merge commit):
R3 (workflow_dispatch run):
R15 curl -sI https://jordimp.net/en/:
R15 curl -sI https://jordimp.net/es/about/:
R15 curl -sI https://jordimp.net/ca/skills/:
R15 curl -s https://jordimp.net/:
R16 curl -sI http://jordimp.net/en/:
R17 curl -sI https://www.jordimp.net/en/:
R18 robots.txt sitemap line:
R18 curl -sI https://jordimp.net/sitemap-index.xml:
R18 curl -sI https://jordimp.net/llms.txt:
R18 live /en/ canonical tag:
```
