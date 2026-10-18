# Google Search Console checklist — jordimp.net

Human-executed activation and monitoring for the F20 `lang-seo-visibility`
feature. The code-side lever (the optional `google-site-verification` meta
tag emitted by `src/components/SEO.astro` from `SITE.googleSiteVerification`
in `src/config.ts`) is already in place and ships blank — the built site is
unchanged until the token is pasted. Everything below happens **outside the
repository**: console and registrar actions are human-executed; the only code
step is the one-line config commit in §2. Record the output of every command
and console observation in `harness/progress/impl_lang-seo-visibility.md`.

---

## 1. Property creation (GSC console — human)

1. Open <https://search.google.com/search-console> and sign in with the
   Google account that manages jordimp.net.
2. Choose the property type:
   - **URL-prefix property** (`https://jordimp.net/`) — verify with the meta
     tag this site emits; continue with §2 + §3.
   - **Domain property** (`jordimp.net`) — covers every subdomain and both
     http/https; verify with a DNS TXT record at the registrar (the registrar
     access was already proven in F4, see `docs/deploy-dns-checklist.md`);
     skip §2–§3 and continue with §1.1 → §4.
3. Name the property so the trilingual scope is visible
   (e.g. `jordimp.net (EN/ES/CA)`).

### 1.1 Domain-property alternative: DNS TXT verification (human, registrar)

Create at the registrar (TTL = registrar default):

| Name  | Type | Value                                  |
|-------|------|----------------------------------------|
| `@`   | TXT  | `google-site-verification=<token from GSC>` |

Verify propagation:

```sh
dig +short jordimp.net TXT | grep -F 'google-site-verification='
```

- **Expected:** the quoted `google-site-verification=<token>` string.
- Back in GSC, press **Verify**. Expected: success banner. If it fails,
  re-run the `dig` command — DNS can take minutes to propagate.

> The domain-property path needs **no code change**: the DNS record is the
> only proof of ownership. The meta-tag path below is the one this codebase
> owns.

## 2. Paste the verification token (the only code step)

For the **URL-prefix** property, select the **HTML tag** verification method
in GSC and copy the `content` value of the offered
`<meta name="google-site-verification" content="…">` snippet.

1. Paste it into `SITE.googleSiteVerification` in `src/config.ts`
   (the field ships as `''`):

   ```diff
   -  googleSiteVerification: '',
   +  googleSiteVerification: '<token from GSC>',
   ```

2. Commit and push — deploy is push-to-`main`:

   ```sh
   git add src/config.ts
   git commit -m "config: add Google Search Console verification token"
   git push origin main
   ```

3. Wait for the Actions run on `main` to finish green
   (github.com → jordimarsal/jordimp → **Actions**).

## 3. Verify the emitted meta tag (after deploy)

```sh
curl -s https://jordimp.net/en/ | grep -F 'google-site-verification'
```

- **Expected:** exactly one line per page head:
  `<meta name="google-site-verification" content="<token>" />`.
- Repeat for `https://jordimp.net/es/` and `https://jordimp.net/ca/` — the
  tag is property-wide (every page rendered through `SEO.astro`), so all
  three must carry it.
- While the committed field is blank, the same command must return **no
  output** (the meta is absent by design). If the tag shows up with an empty
  `content`, stop and file a bug against `src/components/SEO.astro`.
- Back in GSC, press **Verify** on the URL-prefix property. Expected:
  ownership confirmed.

## 4. Submit the sitemap (GSC console — human)

1. GSC → **Sitemaps** → enter `https://jordimp.net/sitemap-index.xml` →
   **Submit**. Expected: status **Success** with type **Sitemap index**.
2. Confirm the endpoint serves before/while submitting:

   ```sh
   curl -sI https://jordimp.net/sitemap-index.xml
   ```

   - **Expected:** `HTTP/2 200`.
3. Coverage re-check (after Google has crawled, ≥ a few days later):
   **Sitemaps** → open the submitted entry → compare **Discovered pages**
   against the 80-page site matrix (63 locale routes + roots; the route
   census lives in `npm run qa:content`). Expected: no unexpected exclusions;
   `Pages` → **Why pages aren't indexed** shows only intentional
   `noindex`-adjacent reasons (none expected on canonical routes).

## 5. hreflang / international targeting monitoring (GSC console — human)

1. GSC → **International Targeting** report (under *Index* → *Pages* →
   alternate-language grouping, or the legacy **Legacy tools → International
   Targeting** panel, depending on the console version at the time of the
   visit).
   - **Expected:** no hreflang errors. The site ships `en`/`es`/`ca`
     alternates plus `x-default` on every canonical route since F3 — any
     "no returned tags" or "mismatched links" error means a regression to
     investigate in `src/components/SEO.astro`.
2. Spot-check a representative URL: **URL Inspection** → inspect
   `https://jordimp.net/es/cv/` → **Page index report** → alternate language
   section.
   - **Expected:** the `en` and `ca` alternates listed with
     `https://jordimp.net/{en,ca}/cv/`.
3. Re-check after every release that touches head emission (cadence:
   monthly, and after any `SEO.astro` change).

## 6. Recording

Paste into `harness/progress/impl_lang-seo-visibility.md`:

- the property type chosen and the verification method (§1),
- the `config.ts` commit hash and the Actions run link (§2),
- the `curl` outputs from §3 (one per locale home),
- the sitemap submission status and the coverage numbers (§4),
- the hreflang report verdict and the URL-inspection screenshot/output (§5).

That file is the traceability evidence for the completion gate; the console
actions themselves stay human-executed — nothing in this checklist is
automated.
