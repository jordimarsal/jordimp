# Design: deploy (F4)

Implements the F4 feature (GitHub Actions deploy to GitHub Pages with custom
domain `jordimp.net`) on top of the completed F1–F3 site (51 locale pages +
404 + root redirect, canonical origin `https://jordimp.net` already wired
through `astro.config.mjs`, `src/lib/seo.ts` and `public/robots.txt`), under
`docs/architecture.md` (static-first: the deploy publishes an immutable build
artifact; no server, no runtime I/O) and `docs/conventions.md` (no comments
unless non-obvious why; env/action pinning discipline — the Docker rule "pin
by digest" generalizes to "pin Actions by commit SHA").

Current state (verified in the repo): no `.github/` directory, no `public/CNAME`,
no git remote configured, no `main` branch (work sits on
`feat/front-phase-0-1`); `package-lock.json` exists (so `npm ci` is exact);
`package.json` engines are `>=22.12.0` (local Node is v22.22.0);
`astro.config.mjs` already sets `site: 'https://jordimp.net'` with no `base`;
GitHub account is `jordimarsal` (`src/config.ts`, README), so the Pages
fallback origin is `https://jordimarsal.github.io`.

Conditional modules: `docs/architecture-options.md` and
`harness/decisions/_template.md` do not exist in this repo, so no architecture
catalog is consulted and no ADR copies are stored under `harness/decisions/`.

**Verifiability boundary.** Everything an agent can verify without pushing is
in R1–R12 (file presence, YAML validity, step order, pins, permissions,
CNAME, config). DNS records, registrar state, Pages settings toggles and live
URLs are outside the repository — R13–R18 pin them as a checklist document
whose content the agent can verify locally, plus `dig`/`curl` commands with
concrete expected outputs that the human runs after push and records in
`harness/progress/impl_deploy.md`.

---

## Files to create

- `.github/workflows/deploy.yml` — single-job Pages pipeline: triggers on
  `push` to `main` + `workflow_dispatch`; top-level permissions
  `contents: read`, `pages: write`, `id-token: write` (ADR-4); concurrency
  group `pages`, `cancel-in-progress: false` (ADR-4); `environment:
  github-pages` with `url: ${{ steps.deployment.outputs.page_url }}`; steps:
  checkout → setup-node (Node 22, `cache: npm`) → `npm ci` → `npm run build`
  → CNAME guard → `actions/configure-pages` →
  `actions/upload-pages-artifact` (`path: dist`) → `actions/deploy-pages`
  (id `deployment`); every `uses:` pinned to a 40-hex commit SHA with the
  release tag as a trailing comment (ADR-3). Full contract in §Public
  signatures.
- `public/CNAME` — exactly one line, `jordimp.net`; copied verbatim into
  `dist/` by the Astro build and carried inside the Pages artifact, which is
  how GitHub Pages binds the custom domain (ADR-2).
- `docs/deploy-dns-checklist.md` — the human checklist (ADR-5):
  1. **Registrar records** in Name / Type / Value / TTL form: four apex A
     records `@ → 185.199.108.153 / .109.153 / .110.153 / .111.153`
     (registrar-default TTL); CNAME `www → jordimarsal.github.io.`; optional
     domain-verification TXT `_github-pages-challenge-jordimarsal TXT
     <code shown under Settings → Pages → custom domain>`; with `dig +short
     jordimp.net A` and `dig +short www.jordimp.net CNAME` as the per-record
     verification commands and their expected outputs.
  2. **Repository settings sequence**: Settings → Pages → Source "GitHub
     Actions"; custom domain `jordimp.net`; wait for the DNS check; after the
     certificate is issued, enable "Enforce HTTPS"; (optional) "Verify" the
     domain using the TXT record.
  3. **Post-deploy verification suite**: the exact `curl` commands and
     expected outputs of R15–R18, plus the two trigger observations of R2/R3
     (Actions run appears for the `main` merge commit; `workflow_dispatch`
     run button works).

## Files to modify

None. `astro.config.mjs` is already deploy-aligned (`site:
'https://jordimp.net'`, no `base`) — R12 verifies that existing state instead
of changing it. No page, layout, lib or content file is touched; F1–F3
behavior is frozen by its own specs and re-verified green by T4. README's
stale status table (F3/F4 rows still "pending") is documentation drift, not
deploy surface — updating it is left to the completion-gate flow, out of F4
scope.

---

## Public signatures

No application code, no scripts, no new exports. The deliverable "interface"
is the workflow contract itself (authoritative sketch; implementer resolves
each `<sha>` from the action's release page at implementation time — never
invented):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@<sha> # v4 (or current major at implementation)
      - uses: actions/setup-node@<sha> # v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - name: Verify CNAME in build output
        run: test -f dist/CNAME && grep -qx 'jordimp.net' dist/CNAME
      - uses: actions/configure-pages@<sha> # v5
      - uses: actions/upload-pages-artifact@<sha> # v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@<sha> # v4
```

Contract points pinned by requirements: triggers (R2, R3), Node 22 (R4),
`npm ci` → `npm run build` → upload → deploy ordering (R5), artifact `path:
dist` (R6), official Pages actions + environment URL wiring (R7), SHA pins on
all five `uses:` (R8), exact permissions (R9), concurrency (R10), CNAME guard
step (R11).

---

## Exceptions and error cases

| Case | Behavior | Requirement |
|---|---|---|
| `npm ci` fails (lockfile missing or out of sync with `package.json`) | Job fails at install; nothing is uploaded or deployed; previous deployment stays live | R5 |
| `astro build` exits non-zero (broken page, bad content, F1–F3 regression) | Job fails at build; nothing deploys; the site keeps serving the last good artifact | R5 |
| Build produces no `dist/` (or empty) | `actions/upload-pages-artifact` fails ("No files were found with the provided path") | R6 |
| `dist/CNAME` missing (file deleted, or someone breaks the public-copy chain) | Workflow's "Verify CNAME in build output" step exits non-zero before upload — the deploy cannot silently reset the domain to `jordimarsal.github.io` | R11 |
| A `uses:` is retagged (mutable tag pin) or a new action is added unpinned | R8 grep fails locally before push; the strict security audit flags it | R8 |
| Permissions drift (`write-all`, extra scopes, per-step permissions) | R9 parsed-YAML assertion fails locally before push | R9 |
| Two pushes to `main` in quick succession | Concurrency group `pages` queues the second run (`cancel-in-progress: false`); deploys never interleave and a running deploy is never cancelled mid-flight | R10 |
| Push to any branch other than `main` (e.g. `feat/front-phase-0-1`) | No workflow trigger; nothing deploys (only `main` + manual dispatch) | R2 |
| Workflow file is invalid YAML | R1 parse check fails locally; GitHub would also reject the run at push time | R1 |
| DNS not yet pointing at GitHub when the first deploy runs | Deploy itself succeeds (artifact published); `https://jordimp.net` is unreachable until the human completes the registrar records — the fallback `https://jordimarsal.github.io` serves meanwhile | R15 → resolved via R13 |
| Registrar records wrong or partially propagated | Pages shows "DNS check unsuccessful"; custom domain won't serve; Enforce HTTPS stays unavailable until records verify | R13, R14 (human fixes records, re-runs `dig`) |
| TLS certificate not yet issued after DNS check | "Enforce HTTPS" toggle is disabled; checklist sequences it strictly after the DNS check succeeds | R16 → resolved via R14 |
| Manual `workflow_dispatch` run from a stale branch | Runs only when a maintainer explicitly invokes it (accepted, documented); regular deploys remain push-to-`main` only | R3 |

---

## Discarded alternatives

- **`withastro/action` composite step** (Astro's documented shortcut:
  checkout + `withastro/action@v3` + `actions/deploy-pages@v4`). Rejected
  (ADR-1): it hides install/build inside a third-party composite, so the
  R4–R8 guarantees (Node pin, step order, artifact path, per-action SHA
  pins) become unauditable black boxes — and it still leaves
  `actions/deploy-pages` to pin manually anyway.
- **Workflow-generated CNAME** (`echo jordimp.net > dist/CNAME` before
  upload). Rejected (ADR-2): a second source of truth invisible to local
  builds — `npm run build` on a laptop would produce a domain-less `dist/`,
  and R11's local verification would have nothing to check. The committed
  `public/CNAME` travels with every artifact and is verifiable pre-push.
- **Tag-pinned actions** (`actions/checkout@v4`, the common default).
  Rejected (ADR-3): mutable tags can be re-pointed; the repo's conventions
  already pin Docker base images by digest under the strict audit level —
  Actions get the same treatment (SHA + version comment).
- **Running the vitest suite inside the deploy workflow**. Rejected: F4's
  scope is deploy, qa-gate is F5; a broken site already fails the deploy at
  `npm run build`, and duplicating the test gate in a deploy workflow
  creates two places that must agree.
- **Triggering on every branch push** (or deploying from
  `feat/front-phase-0-1` directly). Rejected: the feature targets `main`;
  branch-triggered deploys would publish WIP. The one-time merge of
  `feat/front-phase-0-1` → `main` is the activation event (T5).
- **Automating Pages settings / DNS via GitHub API or registrar API**.
  Rejected (ADR-5): Pages settings changes need an admin-scoped token in
  CI, DNS is registrar-side, and neither is verifiable from this
  repository — the human checklist with concrete commands is the honest
  boundary.
- **Non-Google-Pages hosting** (Vercel, Netlify, Cloudflare Pages). Rejected:
  README and architecture already commit to GitHub Pages at
  `https://jordimp.net`; switching vendors re-litigates a settled decision.

---

## Architectural Decisions
<!-- One entry per significant decision. Existing human approval gate at spec_ready reviews these. -->

### ADR-1 — Explicit official Actions pipeline, single job

- **Context.** GitHub Pages with an Actions source needs exactly: the
  artifact uploaded and `deploy-pages` granted `pages: write` +
  `id-token: write`. Astro documents two routes: the `withastro/action`
  composite or explicit `configure-pages` / `upload-pages-artifact` /
  `deploy-pages` steps.
- **Decision.** Explicit official `actions/*` steps in one `deploy` job on
  `ubuntu-latest`, with the `github-pages` environment URL wired from
  `steps.deployment.outputs.page_url`.
- **Alternatives considered.** `withastro/action` composite (see discarded
  alternatives); two-job build+deploy split (GitHub's older pattern) —
  pointless for a 10-second static build, doubles the artifact handoff.
- **Consequences.** Every step is individually grep-pinned and ordered
  (R4–R7); adding a test/lighthouse step later (F5) is a one-line insert
  between build and upload.

### ADR-2 — Custom domain via committed `public/CNAME`, enforced by a deploy guard

- **Context.** GitHub Pages binds a custom domain when the published
  artifact contains a `CNAME` file. Astro copies `public/` verbatim into
  `dist/`.
- **Decision.** `public/CNAME` (single line `jordimp.net`) committed to the
  repo; the workflow carries a guard step asserting `dist/CNAME` exists with
  exactly that content before upload.
- **Alternatives considered.** Workflow-generated CNAME (discarded above);
  relying on the repo Settings → Pages custom-domain field alone — the
  field can silently stop matching the artifact, and per GitHub's docs an
  artifact without `CNAME` can remove the domain from the settings.
- **Consequences.** Domain config lives in-repo, versioned and locally
  verifiable (R11); a broken build chain cannot de-domain the site without
  failing the deploy first.

### ADR-3 — Actions pinned by full commit SHA with version-tag comments

- **Context.** `actions/checkout`, `setup-node`, `configure-pages`,
  `upload-pages-artifact`, `deploy-pages` run with the workflow's token and
  the OIDC claim; the project's strict audit level and its "pin Docker base
  images by digest" convention extend naturally to CI.
- **Decision.** Every `uses:` references a 40-hex commit SHA with the
  upstream release tag as a trailing comment (`@<sha> # v4`); SHAs are
  resolved from each action's releases at implementation time, never
  invented in the spec.
- **Alternatives considered.** Tag pins (mutable); `withastro/action`
  (moves the problem into an unpinned composite).
- **Consequences.** Supply-chain drift is impossible without an explicit
  diff; upgrades become a conscious SHA-bump commit. R8 makes the pin
  machine-checkable.

### ADR-4 — Minimal top-level permissions + serializing concurrency group

- **Context.** The default GITHUB_TOKEN is broad; parallel deploys to the
  same Pages site can interleave or cancel mid-flight. GitHub's Pages
  starter ships exactly the permissions/concurrency pair this feature needs.
- **Decision.** Top-level `permissions: {contents: read, pages: write,
  id-token: write}` (read is required by `actions/checkout`; write and
  id-token are required by `deploy-pages`' OIDC flow);
  `concurrency: {group: pages, cancel-in-progress: false}`.
- **Alternatives considered.** Per-step permissions — needlessly granular
  for one job; `cancel-in-progress: true` — cancels an in-progress publish
  and can leave the deployment state mid-transition; no concurrency —
  last-writer races on the Pages backend.
- **Consequences.** The token can do exactly one thing (publish this site);
  pushes to `main` in bursts queue cleanly (R10); the exact-permissions
  assertion is a regression tripwire (R9).

### ADR-5 — DNS, Pages settings and live verification as a human checklist document

- **Context.** Registrar DNS, the Pages settings toggles and TLS issuance
  happen outside the repository and outside agent reach; but the project
  demands every requirement be verifiable by a concrete command.
- **Decision.** Ship `docs/deploy-dns-checklist.md` containing the record
  table (4 apex A records, `www` CNAME, optional verification TXT), the
  `dig` commands per record, the Settings → Pages sequence ending in
  "Enforce HTTPS", and the post-deploy `curl` suite with expected outputs;
  R13–R14 verify the document's content locally, R15–R18 are executed by
  the human and recorded in `harness/progress/impl_deploy.md`.
- **Alternatives considered.** API automation (discarded above); treating
  live behavior as unverifiable and omitting it — violates the EARS hard
  rule that every requirement is verifiable by a concrete test.
- **Consequences.** The boundary between machine and human responsibility
  is explicit and documented; nothing in CI holds registrar or admin
  credentials; the live checks are repeatable commands, not folklore.

---

## Verification strategy

Local (agent, no push): `harness/init.sh` green; `npx vitest run` (F1–F3
suites untouched); `npm run check`; `npm run build` emits `dist/CNAME`;
then every R1–R12 command from `requirements.md` — YAML parse (R1), trigger
and dispatch keys (R2, R3), Node pin (R4), step-order script over the parsed
YAML:

```python
import yaml
w = yaml.safe_load(open('.github/workflows/deploy.yml'))
steps = w['jobs']['deploy']['steps']
idx = lambda pred: next(i for i, s in enumerate(steps) if pred(s))
assert idx(lambda s: 'npm ci' in s.get('run', '')) \
     < idx(lambda s: 'npm run build' in s.get('run', '')) \
     < idx(lambda s: s.get('uses', '').startswith('actions/upload-pages-artifact')) \
     < idx(lambda s: s.get('uses', '').startswith('actions/deploy-pages'))
print('step order OK')
```

(R5, and the `path: dist` / environment wiring checks ride the same parse),
pin greps (R8), exact-permissions and concurrency assertions (R9, R10),
CNAME content + dist emission (R11), config alignment greps (R12), checklist
content greps (R13, R14).

Human (post-push, per checklist): merge `feat/front-phase-0-1` → `main`,
push; apply registrar records; complete the Pages settings sequence; then
run the R15–R18 `curl` suite and the R2/R3 trigger observations, recording
all outputs in `harness/progress/impl_deploy.md` as the traceability
evidence for the completion gate.
