# Requirements: deploy (F4)

**Scope.** "The system" means the jordimp repository's deployment surface: the
GitHub Actions workflow `.github/workflows/deploy.yml`, the `public/CNAME`
custom-domain asset, the Astro publish configuration (`astro.config.mjs`),
the DNS/settings checklist document `docs/deploy-dns-checklist.md`, and the
published site served at `https://jordimp.net` by GitHub Pages. It builds on
F1–F3 (the site is already complete in `dist/` with canonical origin
`https://jordimp.net`; the workflow only publishes it). Work currently lives on
branch `feat/front-phase-0-1`; the workflow targets `main`, and the repo has no
`main` branch or git remote yet — creating the remote and merging to `main`
are human-gated activation steps (T5).

**Verifiability split.** R1–R12 are locally verifiable: the agent can run the
listed commands against the repository without pushing anything. R13–R14 are
verifiable as *document content* (the checklist must exist and contain the
exact records and commands). R15–R18 describe live published-site behavior:
DNS, TLS and URL reachability cannot be verified from the repository — their
verification is the human executing the documented `dig`/`curl` commands after
push, recording the outputs (each command has a concrete expected result).

---

## R1
The system shall define the Pages deploy pipeline in `.github/workflows/deploy.yml`, and the file shall parse as valid YAML.

Verification: `test -f .github/workflows/deploy.yml && python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))"` → exit 0, no parse errors.

## R2
WHEN a commit is pushed to the `main` branch, the system shall trigger the deploy workflow.

Verification (local, declaration): `python3 -c "import yaml; w=yaml.safe_load(open('.github/workflows/deploy.yml')); trig=w.get(True) or w.get('on') or w.get('push', {}).get('branches') and w; assert trig['push']['branches'] == ['main']"` (note: PyYAML resolves the bare key `on:` as boolean `True`). Post-push (human, per checklist): the run appears under the repo's Actions tab for the merge commit that lands on `main`.

## R3
WHERE a maintainer invokes the workflow manually via `workflow_dispatch`, the system shall run the same deploy workflow.

Verification (local, declaration): `python3 -c "import yaml; w=yaml.safe_load(open('.github/workflows/deploy.yml')); trig=w.get(True) or w.get('on'); assert 'workflow_dispatch' in trig"` — PyYAML yields the key `workflow_dispatch` with value `None`. Post-push (human, per checklist): the "Run workflow" button is offered on the Actions page and a manual run completes green.

## R4
The workflow shall run the build on Node.js 22 (`actions/setup-node` with `node-version: 22`), consistent with `package.json` `engines.node` `>=22.12.0`.

Verification: `grep -qE '^ *node-version: *22$' .github/workflows/deploy.yml && grep -qF '">=22.12.0"' package.json`.

## R5
The workflow shall install exact dependencies (`npm ci`) and build (`npm run build`) in that order, before any artifact upload or deploy step.

Verification: `python3` script over the parsed YAML asserting, within `jobs.deploy.steps`: index of the `run` step containing `npm ci` < index of the `run` step containing `npm run build` < index of the `uses: actions/upload-pages-artifact` step < index of the `uses: actions/deploy-pages` step (full command in design.md §Verification strategy).

## R6
The workflow shall upload the Astro build output directory `dist/` as the GitHub Pages artifact via `actions/upload-pages-artifact` with `path: dist`.

Verification: `grep -nE 'uses: actions/upload-pages-artifact@' .github/workflows/deploy.yml` matches exactly one line, and the `path: dist` input appears within that step's `with:` block (parsed-YAML assertion in the R5 script).

## R7
The workflow shall publish the artifact to GitHub Pages via the official actions `actions/configure-pages` and `actions/deploy-pages` (the latter as the step whose `page_url` output feeds the `github-pages` environment URL).

Verification: `grep -cE 'uses: actions/(configure-pages|deploy-pages)@' .github/workflows/deploy.yml` → 2; parsed-YAML assertion that `jobs.deploy.environment.name == 'github-pages'` and the environment `url` references `steps.deployment.outputs.page_url`.

## R8
Every `uses:` reference in the workflow shall be pinned to a full 40-character commit SHA, with the upstream release tag recorded as a trailing comment (no mutable tag pins).

Verification: `grep -nE '^\s*(- )?uses:' .github/workflows/deploy.yml | grep -cE '@[0-9a-f]{40}'` → 5 (checkout, setup-node, configure-pages, upload-pages-artifact, deploy-pages) and `grep -nE '^\s*(- )?uses:' .github/workflows/deploy.yml | grep -vE '@[0-9a-f]{40}' | wc -l` → 0.

## R9
The workflow shall declare exactly these top-level permissions — `contents: read`, `pages: write`, `id-token: write` — and no other permission keys.

Verification: `python3 -c "import yaml; w=yaml.safe_load(open('.github/workflows/deploy.yml')); assert w['permissions'] == {'contents': 'read', 'pages': 'write', 'id-token': 'write'}"`.

## R10
The workflow shall declare `concurrency` group `pages` with `cancel-in-progress: false`, so concurrent pushes to `main` queue deploys instead of interleaving or cancelling them.

Verification: `python3 -c "import yaml; w=yaml.safe_load(open('.github/workflows/deploy.yml')); assert w['concurrency'] == {'group': 'pages', 'cancel-in-progress': False}"`.

## R11
The system shall ship `public/CNAME` containing exactly the single line `jordimp.net`, emitted verbatim to `dist/CNAME` by the build, and the workflow shall carry a guard step failing the deploy if that file is missing from the build output.

Verification: `grep -qx 'jordimp.net' public/CNAME && test "$(wc -l < public/CNAME)" -eq 1 && npm run build && grep -qx 'jordimp.net' dist/CNAME`; workflow guard: `grep -qE "test -f dist/CNAME" .github/workflows/deploy.yml && grep -qE "grep -qx '?jordimp.net'? dist/CNAME" .github/workflows/deploy.yml`.

## R12
The Astro publish configuration shall keep `site: 'https://jordimp.net'` with no `base` override, so every built URL carries the apex origin without a path prefix.

Verification: `grep -qF "site: 'https://jordimp.net'" astro.config.mjs && ! grep -qE '^\s*base:' astro.config.mjs && npm run build && grep -qF 'rel="canonical" href="https://jordimp.net/en/"' dist/en/index.html && grep -qF '<loc>https://jordimp.net/en/</loc>' dist/sitemap-0.xml`.

## R13
The system shall ship `docs/deploy-dns-checklist.md` documenting, in record form (Name / Type / Value / TTL), the registrar entries the human must create: four apex A records `jordimp.net → 185.199.108.153`, `→ 185.199.109.153`, `→ 185.199.110.153`, `→ 185.199.111.153`; one CNAME record `www.jordimp.net → jordimarsal.github.io`; and the optional domain-verification TXT form `_github-pages-challenge-jordimarsal.jordimp.net TXT <code from Settings → Pages>`, each with its `dig` verification command.

Verification: `test -f docs/deploy-dns-checklist.md && for ip in 185.199.108.153 185.199.109.153 185.199.110.153 185.199.111.153; do grep -qF "$ip" docs/deploy-dns-checklist.md || exit 1; done && grep -qF 'www.jordimp.net' docs/deploy-dns-checklist.md && grep -qF 'jordimarsal.github.io' docs/deploy-dns-checklist.md && grep -qF '_github-pages-challenge-jordimarsal' docs/deploy-dns-checklist.md && grep -qF 'dig +short jordimp.net A' docs/deploy-dns-checklist.md && grep -qF 'dig +short www.jordimp.net CNAME' docs/deploy-dns-checklist.md`.

## R14
The checklist shall document the GitHub Pages settings sequence — set Source to "GitHub Actions", set the custom domain to `jordimp.net`, wait for the DNS check to succeed, then enable "Enforce HTTPS" — and the full post-deploy `curl` verification suite with the expected output of each command.

Verification: `grep -qi 'Source.*GitHub Actions' docs/deploy-dns-checklist.md && grep -qi 'custom domain' docs/deploy-dns-checklist.md && grep -qi 'Enforce HTTPS' docs/deploy-dns-checklist.md && grep -qF 'curl -sI https://jordimp.net/en/' docs/deploy-dns-checklist.md && grep -qF 'curl -sI http://jordimp.net/en/' docs/deploy-dns-checklist.md && grep -qF 'curl -sI https://www.jordimp.net/en/' docs/deploy-dns-checklist.md`.

## R15
WHEN the deploy workflow completes on `main`, the site shall be served at `https://jordimp.net` — `https://jordimp.net/en/` responding HTTP 200 (server header `GitHub.com`) and `/`, `/es/about/`, `/ca/skills/` reachable.

Verification (human, post-push; command + expected result documented in the checklist by R14): `curl -sI https://jordimp.net/en/` → `HTTP/2 200` with `server: GitHub.com`; `curl -sI https://jordimp.net/es/about/` → 200; `curl -sI https://jordimp.net/ca/skills/` → 200; `curl -s https://jordimp.net/` → 200 with the F1 meta-refresh redirect stub to `./en/`. The human records the outputs in `harness/progress/impl_deploy.md`.

## R16
WHEN the human has enabled "Enforce HTTPS" in Pages settings (available after the DNS check succeeds and the certificate is issued), the published site shall redirect plain-HTTP requests to HTTPS.

Verification (human, post-push): `curl -sI http://jordimp.net/en/` → `301` with `location: https://jordimp.net/en/`. Executed per the checklist; output recorded in `harness/progress/impl_deploy.md`.

## R17
The `www` subdomain shall redirect to the apex — `https://www.jordimp.net/{path}` shall respond `301` with `location: https://jordimp.net/{path}`.

Verification (human, post-push): `curl -sI https://www.jordimp.net/en/` → `301` with `location: https://jordimp.net/en/`. Executed per the checklist; output recorded in `harness/progress/impl_deploy.md`.

## R18
WHEN the site is live, the F3 SEO endpoints shall be reachable at the apex: `https://jordimp.net/robots.txt` carrying `Sitemap: https://jordimp.net/sitemap-index.xml`, `https://jordimp.net/sitemap-index.xml` responding 200, `https://jordimp.net/llms.txt` responding 200 with content type `text/plain`, and the live `https://jordimp.net/en/` document carrying `rel="canonical" href="https://jordimp.net/en/"`.

Verification (human, post-push): `curl -s https://jordimp.net/robots.txt | grep -F 'Sitemap: https://jordimp.net/sitemap-index.xml'`; `curl -sI https://jordimp.net/sitemap-index.xml` → 200; `curl -sI https://jordimp.net/llms.txt` → 200 with `content-type: text/plain`; `curl -s https://jordimp.net/en/ | grep -F 'rel="canonical" href="https://jordimp.net/en/"'`. Executed per the checklist; outputs recorded in `harness/progress/impl_deploy.md`.
