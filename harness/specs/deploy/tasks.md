# Tasks: deploy

> Order matters: repo assets first (CNAME, workflow, checklist), then the
> local verification pass, then the human-gated activation (merge → DNS →
> Pages settings), then the live verification suite. Nothing deploys before
> T5 — the workflow targets `main` and the current work branch is
> `feat/front-phase-0-1`. Tasks T1–T4 are agent-executable and end green
> (`harness/init.sh`, `npx vitest run`, `npm run check`, `npm run build`);
> T5–T6 are human-executed per the checklist, with outputs recorded.

- [x] T1: Create `public/CNAME` containing exactly the single line `jordimp.net`; verify the build carries it: `npm run build && grep -qx 'jordimp.net' dist/CNAME`
      depends_on: (none)
      refs: R11

- [x] T2: Create `.github/workflows/deploy.yml` per design §Public signatures — triggers (`push: branches: [main]` + `workflow_dispatch`), top-level permissions (`contents: read`, `pages: write`, `id-token: write`), concurrency (`group: pages`, `cancel-in-progress: false`), `environment: github-pages` with `url: ${{ steps.deployment.outputs.page_url }}`; steps checkout → setup-node (`node-version: 22`, `cache: npm`) → `npm ci` → `npm run build` → CNAME guard (`test -f dist/CNAME && grep -qx 'jordimp.net' dist/CNAME`) → configure-pages → upload-pages-artifact (`path: dist`) → deploy-pages (id `deployment`); resolve each action's current release SHA from its releases page and pin `uses:` lines as `<action>@<40-hex> # vX`
      depends_on: (none)
      refs: R1, R2, R3, R4, R5, R6, R7, R8, R9, R10

- [x] T3: Author `docs/deploy-dns-checklist.md` per design §Files to create — registrar record table (four apex A records → 185.199.108.153/.109.153/.110.153/.111.153; `www` CNAME → `jordimarsal.github.io.`; optional `_github-pages-challenge-jordimarsal` TXT verification form) with `dig +short` verification commands and expected outputs; the Settings → Pages sequence (Source "GitHub Actions" → custom domain `jordimp.net` → DNS check → Enforce HTTPS after certificate issuance); the post-deploy `curl` suite with expected outputs (R15–R18 commands) and the two trigger observations (Actions run on the `main` merge commit; `workflow_dispatch` button)
      depends_on: (none)
      refs: R13, R14

- [x] T4: Local verification pass — run `harness/init.sh`, `npx vitest run`, `npm run check`, `npm run build`; execute every R1–R12 verification command from `requirements.md` (YAML parse, trigger/dispatch keys with the PyYAML `on:`→`True` caveat, Node pin + engines grep, parsed-YAML step-order script, artifact `path: dist` + environment URL wiring, SHA-pin greps, exact-permissions and concurrency assertions, CNAME file + dist emission + workflow guard, `astro.config.mjs` site/base greps + dist canonical/sitemap spot checks) and the checklist content greps for R13–R14; write the traceability table in `harness/progress/impl_deploy.md` (R↔verification↔artifact)
      depends_on: T1, T2, T3
      refs: R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14

- [ ] T5: Activation (human-gated, with the human in the loop): merge `feat/front-phase-0-1` → `main` and push (this is the first deploy trigger); the human applies the registrar records from the checklist and completes the Settings → Pages sequence (Source "GitHub Actions", custom domain `jordimp.net`, optional domain-verification TXT, wait for DNS check, enable "Enforce HTTPS" once the certificate is issued); confirm the workflow run for the merge commit completes green (R2 observation)
      depends_on: T3, T4
      refs: R2, R13, R14, R15

- [ ] T6: Post-deploy verification — execute the checklist's live suite and record every output in `harness/progress/impl_deploy.md`: `curl -sI https://jordimp.net/en/` → 200 (`server: GitHub.com`), `/es/about/`, `/ca/skills/` → 200, `/` → 200 meta-refresh stub (R15); `curl -sI http://jordimp.net/en/` → 301 → HTTPS (R16); `curl -sI https://www.jordimp.net/en/` → 301 → apex (R17); `robots.txt` sitemap line, `sitemap-index.xml` → 200, `llms.txt` → 200 `text/plain`, live `/en/` canonical tag (R18); plus one manual `workflow_dispatch` run completing green (R3 observation)
      depends_on: T5
      refs: R3, R15, R16, R17, R18
