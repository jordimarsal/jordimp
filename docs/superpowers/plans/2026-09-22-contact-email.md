# Contact Email (hello@jordimp.net) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Construction is wrapped by the `harness-standard` roles (Leader / Implementer / Reviewer).

**Goal:** Swap the site's public contact address from `jordi.marsal@gmail.com` to `hello@jordimp.net`, from a single source of truth, only after the mailbox is proven to receive mail.

**Architecture:** `src/config.ts` gains one `CONTACT_EMAIL` literal and both `SITE` objects (`src/config.ts`, `src/data/content.ts`) reference it. Every consumer (`FooterDesk`, `DeptPanel`, the front-desk department page, Person JSON-LD, `llms.txt`/`llms-full.txt`) already derives from those objects, so no renderer code changes. A blocking human task provisions and verifies the mailbox; a `qa:content` scan proves no `gmail.com` survives in sources or built HTML; the parity fixture is regenerated and diff-reviewed.

**Tech Stack:** Astro 7 static output, TypeScript (strict, `allowImportingTsExtensions`), Vitest (units, `include: ['src/**/*.spec.ts']`), Playwright (e2e), zero-dependency Node scripts for QA/oracle distillation.

**Spec:** `harness/specs/contact-email/design.md` (requirements: `harness/specs/contact-email/requirements.md`, tasks: `harness/specs/contact-email/tasks.md`). Read all three; this plan implements them task by task.

## Global Constraints

- Node.js ≥ 22.18, npm, TypeScript `strict: true`; no `any`, no `!`, no casts beyond validated boundaries.
- Canonical address verbatim: `hello@jordimp.net` (language-neutral; `en`/`es`/`ca` publish the same string, localized labels unchanged).
- The swap **must not ship** before the mailbox gate (Task 0) passes — R6 fails closed. If the mailbox is not deliverable, the feature stays `blocked` and the old address remains.
- No `gmail.com` literal may be introduced under `src/` or `tests/`. Detection lives in `scripts/qa-content.mjs` only (so `rg -n "gmail" src dist` stays meaningful).
- `src/data/content.ts` imports the config value with the explicit `.ts` specifier (`'../config.ts'`) — Node type-stripping via `scripts/*.mjs` cannot resolve extensionless specifiers (precedent: `src/lib/quality.ts:11`).
- Never hand-edit `tests/fixtures/parity.json`; regenerate it only via `npm run build && node scripts/distill-parity.mjs`.
- Do not modify `harness/feature_list.json` (spec status is managed by the Leader).
- No comments in code (default policy, `docs/conventions.md`); named exports only.
- Tests mirror the source tree: units `src/**/*.spec.ts` (Vitest), behaviors `tests/*.spec.ts` (Playwright).

## File Structure

| File | Responsibility after this plan |
|---|---|
| `src/config.ts` | Owns the single `CONTACT_EMAIL` literal; `SITE.email` references it. |
| `src/data/content.ts` | Typed content module; `SITE.email` imports and references `CONTACT_EMAIL`. |
| `src/config.spec.ts` | **New** unit spec: canonical value + both `SITE.email`s (R1/R7). |
| `src/lib/seo.spec.ts` | Person JSON-LD literal (R4). |
| `src/lib/llms.spec.ts`, `src/lib/llms-endpoint.spec.ts` | llms builder literals (R5). |
| `src/lib/__snapshots__/llms-endpoint.spec.ts.snap` | Refreshed committed oracle (R5). |
| `src/lib/links.spec.ts` | Mailto fixtures only; classification assertions unchanged. |
| `tests/home.spec.ts` | Footer mailto `href` literal per locale (R2). |
| `tests/departments.spec.ts` | Front-desk contact row + copy button per locale (R3). |
| `scripts/qa-content.mjs` | Legacy-address scan over `src/`+`tests/` sources and `dist/` visible text (R1). |
| `tests/fixtures/parity.json` | Regenerated oracle; 3 address-only `mainText` changes. |

No renderer/`lib` files change: they all read the two `SITE` objects.

---

### Task 0: Mailbox gate (blocking human prerequisite)

**Files:** none in the repo except the evidence note `harness/progress/impl_contact-email.md` (created by the human/implementer).

**Interfaces:**
- Produces: verified deliverability evidence for `hello@jordimp.net`, consumed by the completion gate (R6).

- [ ] **Step 1: Pick a free provider and provision the address**

Options surveyed from `ripienaar/free-for-dev` (Email section, 2026-09-22) — pick the first
that fits; no paid plan is required (R8):

| Priority | Provider | Path | Notes |
|---|---|---|---|
| 1 | **ImprovMX** or **forwardemail.net** | Free custom-domain forwarding; add the MX records they print at the existing registrar | Fastest; only MX changes, GitHub Pages `A`/`CNAME` stay. Receiving only. |
| 2 | **Zoho Mail (Free)** | Real mailbox: 5 users, 5 GB/user, 25 MB attachments, one domain | Can **send as** `hello@jordimp.net` + SPF/DKIM. Slightly more setup. |
| 3 | **Cloudflare Email Routing** | Free forwarding for the domain | Great, but requires moving `jordimp.net` nameservers to Cloudflare. |
| 4 | **DNSExit** / **KaiMail** | Free mailbox (100 MB) / forwarding with DKIM | Fallbacks if `hello@` is reserved elsewhere. |

Then create `hello@jordimp.net` → forward to the owner's Gmail address; enable provider DKIM
signing if offered. Record the chosen provider + tier in the evidence note (R8).

> Free tiers change: re-check the provider's current terms before committing. If `hello@` is
> reserved, use the pre-approved fallback `jordi@jordimp.net` (design.md, Discarded
> alternatives #1).

- [ ] **Step 2: Verify DNS (MX + SPF)**

Run:
```bash
dig MX jordimp.net +short
dig TXT jordimp.net +short
```
Expected: the provider's MX host(s) and an SPF `TXT` that authorizes the provider. Paste the observed output into `harness/progress/impl_contact-email.md`.

- [ ] **Step 3: Prove a message arrives**

From an external account (not the owner's Gmail), send a test message to `hello@jordimp.net`. Confirm it appears in the Gmail inbox (not spam). Record the send time and the receipt in the evidence note.

- [ ] **Step 4: Gate decision**

If all three steps pass, record `MAILBOX VERIFIED <date>` in the evidence note and proceed. If anything fails, **stop**: report the blocker in `harness/progress/current.md`, leave `hello@jordimp.net` absent from `src/`/`dist/`, and keep the feature `blocked`.

- [ ] **Step 5: Commit the evidence note**

```bash
git add harness/progress/impl_contact-email.md
git commit -m "chore(contact-email): record hello@jordimp.net mailbox verification"
```

---

### Task 1: Canonical value + SSOT units + snapshot

**Files:**
- Modify: `src/config.ts:1-14`
- Modify: `src/data/content.ts:1-45`
- Create: `src/config.spec.ts`
- Modify: `src/lib/seo.spec.ts:58`
- Modify: `src/lib/llms.spec.ts:33,100,117`
- Modify: `src/lib/llms-endpoint.spec.ts:70`
- Modify: `src/lib/links.spec.ts:22,45`
- Modify (generated): `src/lib/__snapshots__/llms-endpoint.spec.ts.snap`

**Interfaces:**
- Produces: `CONTACT_EMAIL: 'hello@jordimp.net'` (from `src/config.ts`); `config.SITE.email` and `content.SITE.email` both equal it. All later tasks consume this value.

- [ ] **Step 1: Write the failing SSOT/value test**

Create `src/config.spec.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { CONTACT_EMAIL, SITE as CONFIG_SITE } from './config';
import { SITE as CONTENT_SITE } from './data/content';

describe('contact email single source of truth', () => {
  it('uses hello@jordimp.net as the canonical address', () => {
    expect(CONTACT_EMAIL).toBe('hello@jordimp.net');
  });

  it('has both SITE constants reference the canonical value', () => {
    expect(CONFIG_SITE.email).toBe(CONTACT_EMAIL);
    expect(CONTENT_SITE.email).toBe(CONTACT_EMAIL);
  });
});
```

- [ ] **Step 2: Update the existing hard-coded literals**

In `src/lib/seo.spec.ts:58`:
```ts
expect(person.email).toBe('mailto:hello@jordimp.net');
```
In `src/lib/llms.spec.ts:33`:
```ts
email: 'hello@jordimp.net',
```
`src/lib/llms.spec.ts:100`:
```ts
expect(text).toContain('- Email: hello@jordimp.net');
```
`src/lib/llms.spec.ts:117`:
```ts
'Contact: hello@jordimp.net · [GitHub](https://github.com/jordimarsal) · [LinkedIn](https://www.linkedin.com/in/jordi-marsal-poy)',
```
In `src/lib/llms-endpoint.spec.ts:70`:
```ts
expect(text).toContain('- Email: hello@jordimp.net');
```
In `src/lib/links.spec.ts:22` and `:45`, replace both occurrences of `mailto:jordi.marsal@gmail.com` with `mailto:hello@jordimp.net`.

- [ ] **Step 3: Run the unit tests to verify they fail**

Run: `npx vitest run`
Expected: FAIL — `CONTACT_EMAIL` is not exported / `SITE.email` is still `jordi.marsal@gmail.com`.

- [ ] **Step 4: Implement the single literal**

In `src/config.ts`, add the constant and point `SITE.email` at it:
```ts
export const CONTACT_EMAIL = 'hello@jordimp.net' as const;

export const SITE = {
  name: 'Jordi Marçal Poy',
  url: 'https://jordimp.net',
  role: 'Senior Backend Engineer',
  tagline: 'Java · Python · AI/LLM',
  email: CONTACT_EMAIL,
  github: 'https://github.com/jordimarsal',
  linkedin: 'https://www.linkedin.com/in/jordi-marsal-poy',
  actionsUrl: 'https://github.com/jordimarsal/jordimp/actions/workflows/quality.yml',
  brand: 'JORDIMP & CO.',
  est: '2017',
  city: 'Barcelona',
  ogImage: 'https://jordimp.net/og.png',
} as const;
```
In `src/data/content.ts`, add the import after the type-only import block and reference it:
```ts
import { CONTACT_EMAIL } from '../config.ts';
```
```ts
  email: CONTACT_EMAIL,
```
(leave the rest of the `SITE: SiteInfo` object unchanged).

- [ ] **Step 5: Run the units and refresh the snapshot**

Run: `npx vitest run -u`
Expected: PASS, including `src/config.spec.ts`; the snapshot file is rewritten.

Run: `git diff src/lib/__snapshots__/llms-endpoint.spec.ts.snap`
Expected: a single changed line — the `Contact:` line — with `jordi.marsal@gmail.com` → `hello@jordimp.net`; nothing else.

- [ ] **Step 6: Type-check and commit**

Run: `npm run check`
Expected: 0 errors (the `.ts` import resolves; no unused imports).

```bash
git add src/config.ts src/data/content.ts src/config.spec.ts src/lib/seo.spec.ts src/lib/llms.spec.ts src/lib/llms-endpoint.spec.ts src/lib/links.spec.ts src/lib/__snapshots__/llms-endpoint.spec.ts.snap
git commit -m "feat(contact): source hello@jordimp.net from a single CONTACT_EMAIL literal"
```

---

### Task 2: E2E — footer and front-desk surfaces in all three locales

**Files:**
- Modify: `tests/home.spec.ts:54-58` (inside `expectHomeChrome`)
- Modify: `tests/departments.spec.ts` (add a locale loop after the existing front-desk test, before the closing `});` of the describe)

**Interfaces:**
- Consumes: `CONTACT_EMAIL` value from Task 1 (rendered text).
- Produces: R2/R3 behavior coverage in `npm run test:e2e`.

- [ ] **Step 1: Add the footer assertion (R2)**

In `tests/home.spec.ts`, after line 57 (`await expect(page.locator('.footer-desk .pill[href^="mailto:"]')).toHaveCount(1);`) add:
```ts
  await expect(page.locator('.footer-desk .pill[href^="mailto:"]')).toHaveAttribute(
    'href',
    'mailto:hello@jordimp.net',
  );
```
`expectHomeChrome` already runs for `/en/`, `/es/`, `/ca/`, so this covers all three locales.

- [ ] **Step 2: Add the front-desk assertions (R3)**

In `tests/departments.spec.ts`, inside the same `test.describe('department pages (T8)')`, add:
```ts
  for (const lang of LOCALES) {
    test(`front desk publishes the domain address (${lang})`, async ({ page }) => {
      await page.goto(deptRoute(lang, 'frontdesk'));
      const emailRow = page.locator('.contact-rows .contact-row').first();
      await expect(emailRow.locator('.contact-row__v')).toHaveText('hello@jordimp.net');
      await expect(page.locator('button.copy-btn')).toHaveAttribute('data-copy', 'hello@jordimp.net');
    });
  }
```
`LOCALES` and `deptRoute` are already imported/defined in the file (lines 23 and 34).

- [ ] **Step 3: Run the focused e2e tests to verify they pass**

Run: `npm run build && npx playwright test tests/home.spec.ts tests/departments.spec.ts`
Expected: PASS (footer `href` and front-desk row/copy assertions green in en/es/ca).

- [ ] **Step 4: Commit**

```bash
git add tests/home.spec.ts tests/departments.spec.ts
git commit -m "test(contact): pin hello@jordimp.net on footer and front-desk surfaces (en/es/ca)"
```

---

### Task 3: Negative assertion — no `gmail.com` in sources or built HTML

**Files:**
- Modify: `scripts/qa-content.mjs` (add patterns + a source walk + wire into `main()`)

**Interfaces:**
- Consumes: the pattern list and the already-defined `readFileSync`, `readdirSync`, `statSync`, `join`, `DIST`.
- Produces: `npm run qa:content` becomes the R1 oracle over both sources and `dist/`.

- [ ] **Step 1: Add the forbidden-address pattern**

In `scripts/qa-content.mjs`, after the `CONTACT_PATTERNS` definition (line 24), add:
```js
const LEGACY_EMAIL_PATTERNS = [{ name: 'legacy-gmail', pattern: /gmail\.com/i }];

const SRC = new URL('../src', import.meta.url).pathname;
const TESTS = new URL('../tests', import.meta.url).pathname;
```

- [ ] **Step 2: Add the source walk and raw-text scanner**

After `scanForPatterns` (line 82), add:
```js
function listTextFiles(dir, extensions) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return listTextFiles(full, extensions);
    return extensions.some((extension) => entry.endsWith(extension)) ? [full] : [];
  });
}

function scanForbiddenStrings(files, patterns) {
  const violations = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const { name, pattern } of patterns) {
      if (pattern.test(text)) violations.push(`forbidden pattern "${name}" matched in ${file}`);
    }
  }
  return violations;
}
```

- [ ] **Step 3: Wire both scans into `main()`**

In `main()`, after `problems.push(...scanForPatterns(files, ADDRESS_PATTERNS, 'address'));` (line 212), add:
```js
  const sourceFiles = [
    ...listTextFiles(SRC, ['.ts', '.astro', '.json', '.snap']),
    ...listTextFiles(TESTS, ['.ts', '.json']),
  ];
  problems.push(...scanForbiddenStrings(sourceFiles, LEGACY_EMAIL_PATTERNS));
  problems.push(...scanForPatterns(files, LEGACY_EMAIL_PATTERNS, 'legacy-email'));
  console.log(`legacy-email scan: clean (${sourceFiles.length} source/test files + visible text of ${files.length} HTML files)`);
```

- [ ] **Step 4: Verify green, then prove the scan bites**

Run: `npm run build && npm run qa:content`
Expected: ends with `content QA OK`; the new `legacy-email scan: clean (…)` line is printed.

Temporarily add `gmail.com` to a throwaway line in `src/config.spec.ts`, then run `npm run qa:content`.
Expected: exits non-zero with `forbidden pattern "legacy-gmail" matched in …/src/config.spec.ts`. Remove the throwaway line.

- [ ] **Step 5: Verify the manual rg is empty**

Run: `rg -n "gmail" src dist`
Expected: no output (exit code 1). If it matches inside `dist/`, `npm run build` is stale — rebuild.

- [ ] **Step 6: Commit**

```bash
git add scripts/qa-content.mjs
git commit -m "test(contact): fail qa:content when gmail.com survives in sources or dist"
```

---

### Task 4: Regenerate the parity fixture and diff-review it

**Files:**
- Modify (generated): `tests/fixtures/parity.json`

**Interfaces:**
- Consumes: the built site from Task 1–3.
- Produces: updated ADR-6 oracle; the acceptance record for the address-only change.

- [ ] **Step 1: Rebuild and distill**

Run:
```bash
npm run build
node scripts/distill-parity.mjs
```
Expected: `distilled 63 routes into tests/fixtures/parity.json` (route count unchanged from the current 21 routes × 3 locales).

- [ ] **Step 2: Review the diff (address lines only)**

Run: `git diff tests/fixtures/parity.json`

Expected: exactly three changed `mainText` values — the `en`, `es` and `ca` front-desk routes — each changing only `jordi.marsal@gmail.com` → `hello@jordimp.net`. No `title`, `description`, `h1`, plate, flags or extra route changes; no `_meta` change.

If any other hunk appears, revert with `git checkout -- tests/fixtures/parity.json` and diagnose the copy/structure regression before retrying.

- [ ] **Step 3: Commit**

```bash
git add tests/fixtures/parity.json
git commit -m "test(contact): regenerate parity oracle for the domain address"
```

---

### Task 5: Full gate, traceability, closure

**Files:**
- Modify: `harness/progress/impl_contact-email.md` (already has the Task 0 evidence; append the traceability table)

**Interfaces:**
- Consumes: all prior tasks.
- Produces: the `done` state and the completion-gate evidence.

- [ ] **Step 1: Run the full harness gate**

Run: `./harness/init.sh`
Expected: all green — harness file checks, `feature_list.json` validation, and `npx vitest run` passing.

- [ ] **Step 2: Run the remaining project gates**

Run:
```bash
npm run check
npm run test:e2e
npm run qa:content
npm run qa:links
npm run qa:lighthouse
```
Expected: `astro check` 0 errors; Playwright sweep (65 pages) with zero console errors and parity green; content/link/Lighthouse gates green with untouched thresholds (`lighthouserc.json` not modified).

- [ ] **Step 3: Final forbidden-string sweep**

Run:
```bash
rg -n "gmail" src dist tests scripts
rg -n "hello@jordimp.net" src
```
Expected: the first command matches **only** `scripts/qa-content.mjs` (the scanner pattern); no match under `src/`, `dist/` or `tests/`. The second shows the literal only in `src/config.ts` and the specs that intentionally pin it.

- [ ] **Step 4: Append the traceability table**

Append to `harness/progress/impl_contact-email.md`:
```markdown
| Requirement | Test(s) | Implementation file(s) | Status |
|-------------|---------|------------------------|--------|
| R1 | scripts/qa-content.mjs legacy-email scan; `rg -n gmail src dist` | src/config.ts, src/data/content.ts | done |
| R2 | tests/home.spec.ts expectHomeChrome (en/es/ca) | src/components/site/FooterDesk.astro, src/components/site/DeptPanel.astro | done |
| R3 | tests/departments.spec.ts front-desk locale loop | src/pages/[lang]/departments/[dept].astro | done |
| R4 | src/lib/seo.spec.ts personJsonLd | src/lib/seo.ts | done |
| R5 | src/lib/llms.spec.ts, src/lib/llms-endpoint.spec.ts, snapshot | src/lib/llms.ts, src/pages/llms.txt.ts | done |
| R6 | Task 0 mailbox evidence (MX/SPF + received test message) | harness/progress/impl_contact-email.md | done |
| R7 | src/config.spec.ts | src/config.ts, src/data/content.ts | done |
```

- [ ] **Step 5: Completion gate and commit**

Run: `git diff tests/fixtures/parity.json` → restricted to the address lines. Confirm the R6 evidence line is present.
```bash
git add harness/progress/impl_contact-email.md
git commit -m "docs(contact-email): traceability + mailbox gate evidence"
```
Only after the Leader/Reviewer approval: mark `F11` `done` in `harness/feature_list.json`, move the session summary to `harness/progress/history.md`, and clear `harness/progress/current.md`.

---

## Self-Review (done at plan-writing time)

- **Spec coverage:** R1 → T1 (unit) + T3 (scan) + T4 (fixture); R2 → T2; R3 → T2; R4 → T1; R5 → T1; R6 → T0; R7 → T1. Every requirement maps to a task and a test.
- **Placeholders:** none — the literal, exact file paths/lines, code edits and commands are all concrete.
- **Type consistency:** `CONTACT_EMAIL` is the only name introduced; both `SITE.email` fields reference it; `SiteInfo.email` (already `readonly string`) is unchanged. The `../config.ts` specifier matches the `quality.ts` precedent so Astro and the Node adapters both resolve it.
- **Isolation:** only `src/config.ts` and `src/data/content.ts` hold behavior; all renderers flow automatically, which is the point of the SSOT requirement.
