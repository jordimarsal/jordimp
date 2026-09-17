# Deploy DNS & GitHub Pages checklist — jordimp.net

Human-executed activation and verification for the F4 deploy feature. The
GitHub Actions pipeline (`.github/workflows/deploy.yml`) and the committed
`public/CNAME` are already in place — everything below happens outside the
repository. Record the output of every command in
`harness/progress/impl_deploy.md`.

---

## 0. Prerequisite: first deploy trigger

```sh
git checkout main
git merge feat/front-phase-0-1
git push origin main
```

- **Expected:** the workflow run appears under the repository's **Actions**
  tab for the merge commit and completes green (observation R2). The deploy
  itself succeeds even before DNS is set — the site is then already served at
  the fallback `https://jordimarsal.github.io`.
- A "Run workflow" button is offered on the Actions page
  (`workflow_dispatch`); one manual run must also complete green
  (observation R3, re-checkable after every step below).

## 1. Registrar DNS records

Create these records at the jordimp.net registrar (Name `@` = apex
`jordimp.net`; TTL = registrar default):

| Name                                        | Type  | Value                 | TTL              |
|---------------------------------------------|-------|-----------------------|------------------|
| `@`                                         | A     | `185.199.108.153`     | registrar default |
| `@`                                         | A     | `185.199.109.153`     | registrar default |
| `@`                                         | A     | `185.199.110.153`     | registrar default |
| `@`                                         | A     | `185.199.111.153`     | registrar default |
| `www`                                       | CNAME | `jordimarsal.github.io.` | registrar default |
| `_github-pages-challenge-jordimarsal.jordimp.net` | TXT | `<code from Settings → Pages → custom domain>` | registrar default |

The TXT record is optional — only needed to use the **Verify** button for the
domain (its value is displayed when you add the custom domain in step 2).

Per-record verification (run after creating each record; DNS may take minutes
to propagate — re-run until the expected output appears):

```sh
dig +short jordimp.net A
```

- **Expected:** all four addresses `185.199.108.153`, `185.199.109.153`,
  `185.199.110.153`, `185.199.111.153` (order may vary).

```sh
dig +short www.jordimp.net CNAME
```

- **Expected:** `jordimarsal.github.io.` (trailing dot included).

```sh
dig +short _github-pages-challenge-jordimarsal.jordimp.net TXT
```

- **Expected:** the verification code string, quoted (only if the TXT record
  was created).

## 2. Repository settings sequence (github.com → jordimp repo)

1. **Settings → Pages → Build and deployment → Source**: select **GitHub Actions**.
2. **Settings → Pages → Custom domain**: enter `jordimp.net` and save.
3. Wait for the **DNS check successful** banner. If it reports
   "DNS check unsuccessful", re-run the `dig` commands in step 1 and fix the
   registrar records before continuing — Enforce HTTPS stays unavailable
   until this check passes.
4. (Optional) **Verify** the domain using the TXT record from step 1.
5. After the DNS check succeeds and the TLS certificate is issued (the
   "Enforce HTTPS" toggle becomes enabled), enable **Enforce HTTPS**.

## 3. Post-deploy verification suite

Run after the Actions run for the `main` merge commit is green.

### Reachability (R15)

```sh
curl -sI https://jordimp.net/en/
```

- **Expected:** `HTTP/2 200` with `server: GitHub.com`.

```sh
curl -sI https://jordimp.net/es/about/
curl -sI https://jordimp.net/ca/skills/
```

- **Expected:** `HTTP/2 200` for both.

```sh
curl -s https://jordimp.net/
```

- **Expected:** HTTP 200 body = the F1 meta-refresh redirect stub pointing to
  `./en/`.

### HTTP → HTTPS redirect (R16, after Enforce HTTPS)

```sh
curl -sI http://jordimp.net/en/
```

- **Expected:** `301` with `location: https://jordimp.net/en/`.

### www → apex redirect (R17)

```sh
curl -sI https://www.jordimp.net/en/
```

- **Expected:** `301` with `location: https://jordimp.net/en/`.

### SEO endpoints (R18)

```sh
curl -s https://jordimp.net/robots.txt | grep -F 'Sitemap: https://jordimp.net/sitemap-index.xml'
```

- **Expected:** the line `Sitemap: https://jordimp.net/sitemap-index.xml`.

```sh
curl -sI https://jordimp.net/sitemap-index.xml
```

- **Expected:** `HTTP/2 200`.

```sh
curl -sI https://jordimp.net/llms.txt
```

- **Expected:** `HTTP/2 200` with `content-type: text/plain`.

```sh
curl -s https://jordimp.net/en/ | grep -F 'rel="canonical" href="https://jordimp.net/en/"'
```

- **Expected:** the canonical link tag in the served HTML.

## 4. Recording

Paste every command output above into `harness/progress/impl_deploy.md`
(sections R2/R3 trigger observations and R15–R18 suite). That file is the
traceability evidence for the completion gate.
