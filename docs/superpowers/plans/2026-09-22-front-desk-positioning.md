# Front Desk Positioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Construction is wrapped by `harness-standard` roles (Leader / Implementer / Reviewer).

**Goal:** Reposition the site copy around the MILLORES §0 decision — primary offer = senior/staff backend role, secondary offer = short spec-first engagement, "Jordimp & Co." = craft brand, not a staffing firm — and add the Front Desk commercial block, without any visual redesign.

**Architecture:** Copy lives exclusively in the typed trilingual module `src/data/content.ts` (typed by `src/data/types.ts`); pages render it, `scripts/qa-content.mjs`, the llms endpoints and `scripts/distill-parity.mjs` derive from it. One new typed sub-record (`FrontdeskOffer`) plus one server-rendered section in `src/pages/[lang]/departments/[dept].astro`, composed from existing CSS classes.

**Tech Stack:** Astro 5 static output, strict TypeScript, Vitest (unit/colocated `*.spec.ts`), Playwright (e2e), zero client frameworks.

**Spec:** `harness/specs/front-desk-positioning/{requirements,design,tasks}.md` — this plan implements requirements R1–R17.

**Global Constraints**

- Node.js ≥ 22 LTS, npm, TypeScript `strict: true`; no `any`, no non-null `!`.
- Locales `en` (default), `es`, `ca`. **Every** string exists in all three; technical terms stay English. No invented facts or numbers.
- All copy goes in `src/data/content.ts` — never inline in a page or test fixture.
- The committed golden oracle is `tests/fixtures/parity.json` (ADR-6), distilled from `dist/` by `npm run build && node scripts/distill-parity.mjs`. **Never hand-edit it.** The retired `spike/front` generator has no `departments/` tree and is not part of this feature.
- `harness/init.sh` is the final gate (Vitest green); additionally `npm run check`, `npm run build`, `npx playwright test`, `npm run qa:content`, `npm run qa:links`, `npm run qa:lighthouse` must pass with unchanged thresholds.
- TDD: red test → green implementation → verify → conventional commit. One logical change per commit.
- Do **not** change `src/styles/site.css`, `src/config.ts`, `tests/fixtures/parity.json` by hand, or `harness/feature_list.json` (status is managed by the leader).

## File Structure (files touched by this plan)

```
├── src/
│   ├── data/
│   │   ├── types.ts                              # + FrontdeskOffer, + offer/cta on FrontdeskPageContent
│   │   ├── content.ts                            # HOME, DEPTS.frontdesk, DEPTS.telemetry, FRONTDESK_PAGE, FOOTER, PAGES
│   │   └── content.spec.ts                       # + describe('front-desk positioning (F11)')
│   ├── pages/[lang]/departments/[dept].astro     # + frontdesk offer <section>
│   └── lib/
│       ├── llms-endpoint.spec.ts                 # updated Front Desk line + telemetry intro assertion
│       └── __snapshots__/llms-endpoint.spec.ts.snap  # regenerated
└── tests/
    ├── home.spec.ts                              # hero copy assertions
    ├── departments.spec.ts                       # offer block + telemetry COI
    └── fixtures/parity.json                      # regenerated (never hand-edited)
```

Not modified: `src/lib/llms.ts`, `src/config.ts`, `src/styles/site.css`, all route counts (63 locale routes / 65 pages).

---

### Task 1: Reposition the home hero copy

**Files:**
- Modify: `src/data/content.ts` (`HOME.kicker`, `HOME.h1`, `HOME.stand`)
- Test: `src/data/content.spec.ts`, `tests/home.spec.ts`

**Interfaces:**
- Produces: `HOME.kicker` / `HOME.h1` / `HOME.stand` with the new trilingual copy (R1–R3).

- [ ] **Step 1: Write the failing data test**

Add to `src/data/content.spec.ts` (extend the import from `./content` with `HOME`):

```ts
describe('home positioning (F11)', () => {
  it('repositions the home kicker (R1)', () => {
    expect(HOME.kicker).toEqual({
      en: 'SENIOR BACKEND ENGINEER — SYSTEMS YOU CAN AUDIT',
      es: 'INGENIERO BACKEND SENIOR — SISTEMAS QUE SE PUEDEN AUDITAR',
      ca: 'ENGINYER BACKEND SÈNIOR — SISTEMES QUE ES PODEN AUDITAR',
    });
  });

  it('repositions the home h1 keeping exactly one highlight mark (R2)', () => {
    expect(HOME.h1).toEqual({
      en: 'One company. One engineer. <mark>Specs before code.</mark>',
      es: 'Una empresa. Un ingeniero. <mark>Specs antes que código.</mark>',
      ca: 'Una empresa. Un enginyer. <mark>Specs abans de codi.</mark>',
    });
    for (const lang of LOCALES) {
      expect(HOME.h1[lang].match(/<mark>/g), lang).toHaveLength(1);
    }
  });

  it('repositions the home standfirst keeping the est. mark (R3)', () => {
    expect(HOME.stand).toEqual({
      en: 'Jordimp & Co. is the working name of one engineer: backend systems, event pipelines and applied AI, designed, built and audited by the same pair of hands since <b>2017</b>. Currently inside a telco platform team. Walk-ins: roles, repos, or a short spec-first engagement.',
      es: 'Jordimp & Co. es el nombre de trabajo de un solo ingeniero: sistemas backend, pipelines de eventos e IA aplicada, diseñados, construidos y auditados por el mismo par de manos desde <b>2017</b>. Ahora, dentro de un equipo de plataforma telco. Entrada libre: roles, repos o un encargo corto con spec primero.',
      ca: 'Jordimp & Co. és el nom de feina d’un sol enginyer: sistemes backend, pipelines d’esdeveniments i IA aplicada, dissenyats, construïts i auditats pel mateix parell de mans des del <b>2017</b>. Ara, dins d’un equip de plataforma telco. Entrada lliure: rols, repos, o un encàrrec curt amb spec primer.',
    });
    for (const lang of LOCALES) {
      expect(HOME.stand[lang], lang).toContain('<b>2017</b>');
    }
  });
});
```

- [ ] **Step 2: Write the failing e2e test**

In `tests/home.spec.ts`, add `HOME` to the import from `../src/data/content`, add a `MARK_TEXT` map, and add a test inside the existing `for (const home of HOMES)` loop:

```ts
const MARK_TEXT = { en: 'Specs before code.', es: 'Specs antes que código.', ca: 'Specs abans de codi.' } as const;

test(`positions the hero copy at ${home}`, async ({ page }) => {
  await page.goto(home);
  const lang = home.replace(/\//g, '') as 'en' | 'es' | 'ca';
  await expect(page.locator('.hero .kicker')).toHaveText(HOME.kicker[lang]);
  await expect(page.locator('h1 mark')).toHaveText(MARK_TEXT[lang]);
  await expect(page.locator('.stand')).toHaveText(HOME.stand[lang].replace(/<[^>]+>/g, ''));
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/data/content.spec.ts`
Expected: FAIL on the three new assertions (old strings).

- [ ] **Step 4: Replace the three values**

In `src/data/content.ts`, replace the `HOME.kicker`, `HOME.h1` and `HOME.stand` objects with the exact strings from Step 1 (keep the object shape; preserve the literal `<mark>`/`<b>2017</b>` markup — these fields render with `set:html`).

- [ ] **Step 5: Run unit + home e2e**

Run: `npx vitest run src/data/content.spec.ts && npx playwright test tests/home.spec.ts`
Expected: green for the new hero tests. (The `tests/smoke.spec.ts` parity suite stays red until Task 6 — do not run it in this task.)

- [ ] **Step 6: Commit**

```bash
git add src/data/content.ts src/data/content.spec.ts tests/home.spec.ts
git commit -m "feat(content): reposition home hero copy (specs before code)"
```

---

### Task 2: Add the Front Desk commercial block and rewrite the floor line/intro

**Files:**
- Modify: `src/data/types.ts`, `src/data/content.ts`, `src/pages/[lang]/departments/[dept].astro`
- Test: `src/data/content.spec.ts`, `tests/departments.spec.ts`, `src/lib/llms-endpoint.spec.ts`, `src/lib/__snapshots__/llms-endpoint.spec.ts.snap`

**Interfaces:**
- Consumes: nothing new.
- Produces: `FrontdeskOffer`; `FrontdeskPageContent.offer` / `.cta`; new `DEPTS.frontdesk.line` / `.intro`; offer `<section>` at `#fd-offer` (R4–R7, R14, R16).

- [ ] **Step 1: Add the types (interface first)**

In `src/data/types.ts`, add before `FrontdeskPageContent`:

```ts
export interface FrontdeskOffer {
  readonly openTitle: L10n<string>;
  readonly openItems: L10n<readonly string[]>;
  readonly notOpenTitle: L10n<string>;
  readonly notOpenItems: L10n<readonly string[]>;
  readonly firmLine: L10n<string>;
  readonly howLine: L10n<string>;
  readonly deskLine: L10n<string>;
}
```

and add two fields to `FrontdeskPageContent` (keep the existing fields):

```ts
  readonly offer: FrontdeskOffer;
  readonly cta: L10n<string>;
```

- [ ] **Step 2: Write the failing data test**

In `src/data/content.spec.ts`, extend the `./content` import with `DEPTS`, `FRONTDESK_PAGE`, and add:

```ts
describe('front-desk positioning (F11)', () => {
  it('defines the offer block with the exact English copy in three locales (R4)', () => {
    expect(FRONTDESK_PAGE.offer.openTitle.en).toBe('Open for');
    expect(FRONTDESK_PAGE.offer.openItems.en).toEqual([
      'Senior / staff backend roles — platform, events, or applied AI with measurable retrieval.',
      'Short spec-first engagements (4–8 weeks). If it can’t be written down, it doesn’t start.',
      'Questions about a floor or a repo. No tracking, no funnel.',
    ]);
    expect(FRONTDESK_PAGE.offer.notOpenTitle.en).toBe('Not open for');
    expect(FRONTDESK_PAGE.offer.notOpenItems.en).toEqual([
      'Vibe-coded MVPs, “add ChatGPT to our app”, or unbounded retainers.',
    ]);
    expect(FRONTDESK_PAGE.offer.firmLine.en).toBe(
      'Jordimp & Co. is how the work is done — currently inside a telco platform team, not a staffing firm.',
    );
    expect(FRONTDESK_PAGE.offer.howLine.en).toBe(
      'How it works — 01 Brief · 02 Spec · 03 Build (tests first) · 04 Audit.',
    );
    expect(FRONTDESK_PAGE.offer.deskLine.en).toBe('Desk attended in English, Español or Català.');

    for (const lang of LOCALES) {
      expect(FRONTDESK_PAGE.offer.openTitle[lang].trim(), lang).not.toBe('');
      expect(FRONTDESK_PAGE.offer.notOpenTitle[lang].trim(), lang).not.toBe('');
      expect(FRONTDESK_PAGE.offer.firmLine[lang].trim(), lang).not.toBe('');
      expect(FRONTDESK_PAGE.offer.howLine[lang].trim(), lang).not.toBe('');
      expect(FRONTDESK_PAGE.offer.deskLine[lang].trim(), lang).not.toBe('');
      expect(FRONTDESK_PAGE.offer.openItems[lang]).toHaveLength(3);
      expect(FRONTDESK_PAGE.offer.notOpenItems[lang]).toHaveLength(1);
      for (const item of [
        ...FRONTDESK_PAGE.offer.openItems[lang],
        ...FRONTDESK_PAGE.offer.notOpenItems[lang],
      ]) {
        expect(item.trim(), lang).not.toBe('');
      }
    }
  });

  it('sets the hall CTA tagline in three locales (R5)', () => {
    expect(FRONTDESK_PAGE.cta).toEqual({
      en: 'WALK-INS WELCOME — ROLE, REPO OR A SPEC-FIRST ENGAGEMENT.',
      es: 'ENTRADA LIBRE — ROL, REPO O ENCARGO CON SPEC.',
      ca: 'ENTRADA LLIURE — ROL, REPO O ENCÀRREC AMB SPEC.',
    });
  });

  it('repoints the front-desk floor line and intro at the offer (R6, R7)', () => {
    expect(DEPTS.frontdesk.line).toEqual({
      en: 'WALK-INS WELCOME — ROLES, REPOS OR A SPEC-FIRST ENGAGEMENT.',
      es: 'ENTRADA LIBRE — ROLES, REPOS O UN ENCARGO CON SPEC PRIMERO.',
      ca: 'ENTRADA LLIURE — ROLS, REPOS O UN ENCÀRREC AMB SPEC PRIMER.',
    });
    expect(DEPTS.frontdesk.intro).toEqual({
      en: 'The desk takes three things: senior or staff backend roles, short spec-first engagements, and questions about a floor or a repo. Bring the problem in your own words — if it can’t be written down, it doesn’t start.',
      es: 'El mostrador acepta tres cosas: roles backend senior o staff, encargos cortos con spec primero y preguntas sobre una planta o un repo. Trae el problema con tus palabras — si no se puede escribir, no se empieza.',
      ca: 'El mostrador accepta tres coses: rols backend sènior o staff, encàrrecs curts amb spec primer i preguntes sobre una planta o un repo. Porta el problema amb les teves paraules — si no es pot escriure, no comença.',
    });
  });
});
```

- [ ] **Step 3: Write the failing e2e test**

In `tests/departments.spec.ts`, inside the `renders the front desk with contact rows…` test, after the `p.avail` assertions, add:

```ts
const offer = page.locator('section:has(#fd-offer)');
await expect(page.locator('#fd-offer')).toHaveText(FRONTDESK_PAGE.offer.openTitle.en);
await expect(page.locator('#fd-not-open')).toHaveText(FRONTDESK_PAGE.offer.notOpenTitle.en);
await expect(offer.locator('p.dept-line')).toHaveText(FRONTDESK_PAGE.cta.en);
const openItems = offer.locator('.prose').nth(0).locator('li');
await expect(openItems).toHaveCount(FRONTDESK_PAGE.offer.openItems.en.length);
for (let i = 0; i < FRONTDESK_PAGE.offer.openItems.en.length; i++) {
  await expect(openItems.nth(i)).toHaveText(FRONTDESK_PAGE.offer.openItems.en[i]);
}
const notOpenItems = offer.locator('.prose').nth(1).locator('li');
await expect(notOpenItems).toHaveCount(FRONTDESK_PAGE.offer.notOpenItems.en.length);
await expect(notOpenItems.nth(0)).toHaveText(FRONTDESK_PAGE.offer.notOpenItems.en[0]);
await expect(offer.locator('aside.oncall h3')).toHaveText(FRONTDESK_PAGE.offer.firmLine.en);
const closing = offer.locator('aside.oncall p');
await expect(closing.nth(0)).toHaveText(FRONTDESK_PAGE.offer.howLine.en);
await expect(closing.nth(1)).toHaveText(FRONTDESK_PAGE.offer.deskLine.en);
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npx vitest run src/data/content.spec.ts && npx playwright test tests/departments.spec.ts --grep "front desk"`
Expected: FAIL (`FRONTDESK_PAGE.offer` is `undefined`; rendered block missing).

- [ ] **Step 5: Add the data**

In `src/data/content.ts`, replace `DEPTS.frontdesk.line` with the R6 values, replace `DEPTS.frontdesk.intro` with the R7 values, and add to `FRONTDESK_PAGE`:

```ts
  offer: {
    openTitle: { en: 'Open for', es: 'Abierto a', ca: 'Obert a' },
    openItems: {
      en: [
        'Senior / staff backend roles — platform, events, or applied AI with measurable retrieval.',
        'Short spec-first engagements (4–8 weeks). If it can’t be written down, it doesn’t start.',
        'Questions about a floor or a repo. No tracking, no funnel.',
      ],
      es: [
        'Roles backend senior / staff — plataforma, eventos o IA aplicada con retrieval medible.',
        'Encargos cortos con spec primero (4–8 semanas). Si no se puede escribir, no se empieza.',
        'Preguntas sobre una planta o un repo. Sin tracking, sin funnel.',
      ],
      ca: [
        'Rols backend sènior / staff — plataforma, esdeveniments o IA aplicada amb retrieval mesurable.',
        'Encàrrecs curts amb spec primer (4–8 setmanes). Si no es pot escriure, no comença.',
        'Preguntes sobre una planta o un repo. Sense tracking, sense funnel.',
      ],
    },
    notOpenTitle: { en: 'Not open for', es: 'No abierto a', ca: 'No obert a' },
    notOpenItems: {
      en: ['Vibe-coded MVPs, “add ChatGPT to our app”, or unbounded retainers.'],
      es: ['MVPs vibe-coded, «añádeme ChatGPT a la app» o retainers sin límite.'],
      ca: ['MVPs vibe-coded, «posa ChatGPT a la nostra app» o retainers sense límit.'],
    },
    firmLine: {
      en: 'Jordimp & Co. is how the work is done — currently inside a telco platform team, not a staffing firm.',
      es: 'Jordimp & Co. es como se hace el trabajo — ahora dentro de un equipo de plataforma telco, no una consultora de personal.',
      ca: 'Jordimp & Co. és com es fa la feina — ara dins d’un equip de plataforma telco, no una consultora de personal.',
    },
    howLine: {
      en: 'How it works — 01 Brief · 02 Spec · 03 Build (tests first) · 04 Audit.',
      es: 'Cómo funciona — 01 Brief · 02 Spec · 03 Build (tests primero) · 04 Auditoría.',
      ca: 'Com funciona — 01 Brief · 02 Spec · 03 Build (proves primer) · 04 Auditoria.',
    },
    deskLine: {
      en: 'Desk attended in English, Español or Català.',
      es: 'Mostrador atendido en English, Español o Català.',
      ca: 'Mostrador atès en English, Español o Català.',
    },
  },
  cta: {
    en: 'WALK-INS WELCOME — ROLE, REPO OR A SPEC-FIRST ENGAGEMENT.',
    es: 'ENTRADA LIBRE — ROL, REPO O ENCARGO CON SPEC.',
    ca: 'ENTRADA LLIURE — ROL, REPO O ENCÀRREC AMB SPEC.',
  },
```

- [ ] **Step 6: Render the block**

In `src/pages/[lang]/departments/[dept].astro`, inside the `{deptKey === 'frontdesk' && (` fragment, insert **before** the `fd-person` `<section>`:

```astro
        <section class="section" aria-labelledby="fd-offer">
          <p class="dept-line">{FRONTDESK_PAGE.cta[lang]}</p>
          <h2 id="fd-offer" class="section-title">{FRONTDESK_PAGE.offer.openTitle[lang]}</h2>
          <div class="prose">
            <ul>
              {FRONTDESK_PAGE.offer.openItems[lang].map((item) => <li>{item}</li>)}
            </ul>
          </div>
          <h2 id="fd-not-open" class="section-title">{FRONTDESK_PAGE.offer.notOpenTitle[lang]}</h2>
          <div class="prose" aria-labelledby="fd-not-open">
            <ul>
              {FRONTDESK_PAGE.offer.notOpenItems[lang].map((item) => <li>{item}</li>)}
            </ul>
          </div>
          <aside class="oncall" aria-labelledby="fd-firm">
            <h3 id="fd-firm">{FRONTDESK_PAGE.offer.firmLine[lang]}</h3>
            <p>{FRONTDESK_PAGE.offer.howLine[lang]}</p>
            <p>{FRONTDESK_PAGE.offer.deskLine[lang]}</p>
          </aside>
        </section>
```

Only existing classes (`section`, `dept-line`, `section-title`, `prose`, `oncall`) are used — no CSS change.

- [ ] **Step 7: Update the llms assertion and snapshot**

In `src/lib/llms-endpoint.spec.ts`, change the Front Desk assertion to:

```ts
    expect(text).toContain('- B Front Desk — WALK-INS WELCOME — ROLES, REPOS OR A SPEC-FIRST ENGAGEMENT.');
```

and in the llms-full describe block add:

```ts
  it('carries the updated Front Desk offer intro', () => {
    expect(text).toContain(
      'The desk takes three things: senior or staff backend roles, short spec-first engagements, and questions about a floor or a repo.',
    );
  });
```

Regenerate the snapshot: `npx vitest run src/lib/llms-endpoint.spec.ts -u`.

- [ ] **Step 8: Run tests to verify green**

Run: `npx vitest run src/data/content.spec.ts src/lib/llms-endpoint.spec.ts`
Expected: PASS.
Run: `npx playwright test tests/departments.spec.ts`
Expected: PASS for the front-desk and the "all 21 department pages" tests.

- [ ] **Step 9: Commit**

```bash
git add src/data/types.ts src/data/content.ts src/pages/[lang]/departments/[dept].astro \
  src/data/content.spec.ts tests/departments.spec.ts \
  src/lib/llms-endpoint.spec.ts src/lib/__snapshots__/llms-endpoint.spec.ts.snap
git commit -m "feat(frontdesk): add spec-first offer block, rewrite floor line and intro"
```

---

### Task 3: Align footer line and page descriptions

**Files:**
- Modify: `src/data/content.ts` (`FOOTER.line`, `PAGES.home.description`, `PAGES.frontdesk.description`)
- Test: `src/data/content.spec.ts`

**Interfaces:**
- Produces: `FOOTER.line` and the two `PAGES.*.description` values (R8–R10); `tests/seo-head.spec.ts` keeps deriving from `PAGES.home.description`.

- [ ] **Step 1: Write the failing test**

Add to the F11 describe block in `src/data/content.spec.ts` (extend the import with `FOOTER`, `PAGES`):

```ts
  it('aligns the footer line and page descriptions with the positioning (R8, R9, R10)', () => {
    expect(FOOTER.line).toEqual({
      en: 'Jordimp & Co. is the working name of one engineer — currently inside a telco platform team. Walk-ins: roles, repos, or a short spec-first engagement.',
      es: 'Jordimp & Co. es el nombre de trabajo de un solo ingeniero — ahora dentro de un equipo de plataforma telco. Entrada libre: roles, repos o un encargo corto con spec primero.',
      ca: 'Jordimp & Co. és el nom de feina d’un sol enginyer — ara dins d’un equip de plataforma telco. Entrada lliure: rols, repos o un encàrrec curt amb spec primer.',
    });
    expect(PAGES.home.description).toEqual({
      en: 'Jordimp & Co. is the working name of one engineer: backend systems, event pipelines and applied AI, designed, built and audited by the same pair of hands since 2017. Currently inside a telco platform team. Walk-ins: roles, repos, or a short spec-first engagement.',
      es: 'Jordimp & Co. es el nombre de trabajo de un solo ingeniero: sistemas backend, pipelines de eventos e IA aplicada, diseñados, construidos y auditados por el mismo par de manos desde 2017. Ahora, dentro de un equipo de plataforma telco. Entrada libre: roles, repos o un encargo corto con spec primero.',
      ca: 'Jordimp & Co. és el nom de feina d’un sol enginyer: sistemes backend, pipelines d’esdeveniments i IA aplicada, dissenyats, construïts i auditats pel mateix parell de mans des del 2017. Ara, dins d’un equip de plataforma telco. Entrada lliure: rols, repos o un encàrrec curt amb spec primer.',
    });
    expect(PAGES.frontdesk.description).toEqual({
      en: 'Walk-ins welcome: senior or staff backend roles, short spec-first engagements, and questions about a floor or a repo — no tracking, no funnel. Jordimp & Co. is how the work is done, not a staffing firm.',
      es: 'Entrada libre: roles backend senior o staff, encargos cortos con spec primero y preguntas sobre una planta o un repo — sin tracking, sin funnel. Jordimp & Co. es como se hace el trabajo, no una consultora de personal.',
      ca: 'Entrada lliure: rols backend sènior o staff, encàrrecs curts amb spec primer i preguntes sobre una planta o un repo — sense tracking, sense funnel. Jordimp & Co. és com es fa la feina, no una consultora de personal.',
    });
    for (const lang of LOCALES) {
      expect(PAGES.home.description[lang], lang).not.toMatch(/[<>]/);
      expect(PAGES.frontdesk.description[lang], lang).not.toMatch(/[<>]/);
    }
  });
```

- [ ] **Step 2: Run to verify red**

Run: `npx vitest run src/data/content.spec.ts`
Expected: FAIL on the footer/description comparisons.

- [ ] **Step 3: Replace the values**

In `src/data/content.ts`, replace `FOOTER.line`, `PAGES.home.description` and `PAGES.frontdesk.description` with the Step 1 strings (plain text — no markup in meta descriptions).

- [ ] **Step 4: Verify**

Run: `npx vitest run src/data/content.spec.ts`
Expected: PASS.
Run: `npx playwright test tests/seo-head.spec.ts tests/splash.spec.ts`
Expected: PASS (both derive the home description from data).

- [ ] **Step 5: Commit**

```bash
git add src/data/content.ts src/data/content.spec.ts
git commit -m "feat(content): align footer and page descriptions with the positioning"
```

---

### Task 4: Add the F2 telemetry conflict-of-interest line

**Files:**
- Modify: `src/data/content.ts` (`DEPTS.telemetry.intro`)
- Test: `src/data/content.spec.ts`, `src/lib/llms-endpoint.spec.ts`, `src/lib/__snapshots__/llms-endpoint.spec.ts.snap`

**Interfaces:**
- Produces: `DEPTS.telemetry.intro[lang]` ending with the COI sentence (R11); llms-full carries it via `deptBlock`.

- [ ] **Step 1: Write the failing test**

Add to the F11 describe block in `src/data/content.spec.ts`:

```ts
  it('adds the Open Gateway conflict-of-interest line to F2 (R11)', () => {
    const coi = {
      en: 'Personal study of the Open Gateway telemetry problem. Not Telefónica code. Not production traffic.',
      es: 'Estudio personal del problema de telemetría de Open Gateway. No es código de Telefónica. No es tráfico de producción.',
      ca: 'Estudi personal del problema de telemetria d’Open Gateway. No és codi de Telefónica. No és trànsit de producció.',
    } as const;
    for (const lang of LOCALES) {
      expect(DEPTS.telemetry.intro[lang].endsWith(coi[lang]), lang).toBe(true);
    }
  });
```

- [ ] **Step 2: Run to verify red**

Run: `npx vitest run src/data/content.spec.ts`
Expected: FAIL (`endsWith` is false).

- [ ] **Step 3: Append the sentence**

In `src/data/content.ts`, append the localized sentence to each locale of `DEPTS.telemetry.intro` (single space before it; nothing else changes).

- [ ] **Step 4: Update the llms-full assertion and snapshot**

In `src/lib/llms-endpoint.spec.ts` add:

```ts
  it('carries the telemetry conflict-of-interest line', () => {
    expect(text).toContain(
      'Personal study of the Open Gateway telemetry problem. Not Telefónica code. Not production traffic.',
    );
  });
```

Regenerate: `npx vitest run src/lib/llms-endpoint.spec.ts -u`.

- [ ] **Step 5: Verify**

Run: `npx vitest run src/data/content.spec.ts src/lib/llms-endpoint.spec.ts`
Expected: PASS.
Run: `npx playwright test tests/departments.spec.ts --grep "telemetry"`
Expected: PASS (the telemetry test asserts the `oncall` copy, unchanged; the 21-page test reads the live intro from data).

- [ ] **Step 6: Commit**

```bash
git add src/data/content.ts src/data/content.spec.ts \
  src/lib/llms-endpoint.spec.ts src/lib/__snapshots__/llms-endpoint.spec.ts.snap
git commit -m "feat(telemetry): state the personal-study conflict of interest"
```

---

### Task 5: Pin the negative invariants

**Files:**
- Test: `src/data/content.spec.ts`

**Interfaces:**
- Produces: regression pins for `FRONTDESK_PAGE.how`, the email address and the no-restyle rule (R12, R13, R17).

- [ ] **Step 1: Add the pinning tests**

In `src/data/content.spec.ts`, extend the `./content` import with `SITE`, add `import { SITE as CONFIG_SITE } from '../config';`, and add:

```ts
  it('keeps the four how-it-works steps intact (R12)', () => {
    const keys = ['01 — BRIEF', '02 — SPEC', '03 — BUILD', '04 — AUDIT'];
    for (const lang of LOCALES) {
      expect(FRONTDESK_PAGE.how[lang].map((step) => step.k), lang).toEqual(keys);
      for (const step of FRONTDESK_PAGE.how[lang]) {
        expect(step.v.trim(), lang).not.toBe('');
      }
    }
  });

  it('keeps the contact email unchanged in content and config (R13)', () => {
    expect(SITE.email).toBe('jordi.marsal@gmail.com');
    expect(CONFIG_SITE.email).toBe(SITE.email);
    expect(CONFIG_SITE.email).toBe('jordi.marsal@gmail.com');
  });
```

- [ ] **Step 2: Run**

Run: `npx vitest run src/data/content.spec.ts`
Expected: PASS immediately — these exist to fail a future regression.

- [ ] **Step 3: Verify no stylesheet change (R17)**

Run: `git diff --name-only "$(git merge-base HEAD main)" -- src/styles`
Expected: empty output.

- [ ] **Step 4: Commit**

```bash
git add src/data/content.spec.ts
git commit -m "test(content): pin front-desk how steps, email and no-restyle invariants"
```

---

### Task 6: Regenerate the parity oracle

**Files:**
- Modify: `tests/fixtures/parity.json` (generated only)

**Interfaces:**
- Consumes: all copy edits from Tasks 1–4.
- Produces: the ADR-6 oracle that `tests/smoke.spec.ts` asserts against (R15).

- [ ] **Step 1: Build and distill**

Run: `npm run build && node scripts/distill-parity.mjs`
Expected: `distilled 63 routes into tests/fixtures/parity.json`; `_meta.counts` remains
`{ "localeRoutes": 63, "pages": 65 }`.

- [ ] **Step 2: Inspect the diff (gate, do not skip)**

Run: `git diff -- tests/fixtures/parity.json`
Expected hunks, and **only** these:
- `splash.description` → the new `PAGES.home.description.en`.
- `/en/`, `/es/`, `/ca/`: `description`, `h1`, `mainText`.
- `/en|es|ca/departments/front-desk/`: `description`, `mainText`.
- `/en|es|ca/departments/telemetry/`: `mainText`.
No changed route keys, no `plates`, no `flags`, no count change. Any other hunk → stop and diagnose.

- [ ] **Step 3: Run the parity suite**

Run: `npx playwright test tests/smoke.spec.ts`
Expected: PASS (65-page sweep + parity + routing + night + mobile + reduced motion).

- [ ] **Step 4: Commit**

```bash
git add tests/fixtures/parity.json
git commit -m "test(parity): regenerate oracle for front-desk positioning"
```

---

### Task 7: Full gate and closure

**Files:**
- Create: `harness/progress/impl_front-desk-positioning.md` (traceability table)

- [ ] **Step 1: Unit gate**

Run: `./harness/init.sh`
Expected: final line `[OK]`; the Vitest block passes 100%.

- [ ] **Step 2: Full pipeline**

Run: `npm run check && npm run build && npx playwright test`
Expected: `astro check` 0 errors; build green; all Playwright specs green.
Run: `npm run qa:content && npm run qa:links && npm run qa:lighthouse`
Expected: all green (route census from `src/data`, trilingual titles/descriptions, live links, Lighthouse thresholds unchanged).

- [ ] **Step 3: Confirm the changed-file scope**

Run: `git diff --name-only "$(git merge-base HEAD main)"`
Expected exactly:
`src/data/types.ts`, `src/data/content.ts`,
`src/pages/[lang]/departments/[dept].astro`, `src/data/content.spec.ts`,
`src/lib/llms-endpoint.spec.ts`, `src/lib/__snapshots__/llms-endpoint.spec.ts.snap`,
`tests/home.spec.ts`, `tests/departments.spec.ts`, `tests/fixtures/parity.json`
(plus this spec/plan under `harness/specs/` and `docs/superpowers/plans/`). No `src/styles/`, no `src/config.ts`, no `harness/feature_list.json`.

- [ ] **Step 4: Write the traceability record**

Create `harness/progress/impl_front-desk-positioning.md` with:

```markdown
| Requirement | Test(s) | Implementation file(s) | Status |
|-------------|---------|------------------------|--------|
| R1–R3 | content.spec (home positioning), home.spec (positions the hero copy) | src/data/content.ts | done |
| R4–R5 | content.spec (offer block, hall CTA) | src/data/types.ts, src/data/content.ts | done |
| R6–R7 | content.spec (line/intro), llms-endpoint.spec | src/data/content.ts | done |
| R8–R10 | content.spec (footer/descriptions), seo-head.spec, qa:content | src/data/content.ts | done |
| R11 | content.spec (telemetry COI), llms-endpoint.spec | src/data/content.ts | done |
| R12–R13 | content.spec (how steps, email) | src/data/content.ts, src/config.ts (unchanged) | done |
| R14 | departments.spec (offer block) | src/pages/[lang]/departments/[dept].astro | done |
| R15 | smoke.spec (parity), distill diff | tests/fixtures/parity.json | done |
| R16 | llms-endpoint.spec + snapshot | src/data/content.ts | done |
| R17 | git diff --name-only -- src/styles (empty) | — | done |
```

- [ ] **Step 5: Commit**

```bash
git add harness/progress/impl_front-desk-positioning.md
git commit -m "docs(progress): front-desk positioning traceability"
```

Then stop at the completion gate for human review (`specs.md` — completion gate).

---

## Self-Review (done at plan-writing time)

- **Spec coverage:** R1–R3 → Task 1; R4–R7/R14 → Task 2; R8–R10 → Task 3; R11 → Task 4; R12/R13/R17 → Task 5; R15 → Task 6; R16 → Tasks 2 & 4; full gates → Task 7. Every R has a task and at least one test.
- **Placeholder scan:** none — every string is written out verbatim in the tasks; every command has an expected result; no `TODO`/`...`.
- **Type consistency:** `FrontdeskOffer` fields (`openTitle`, `openItems`, `notOpenTitle`, `notOpenItems`, `firmLine`, `howLine`, `deskLine`) match the render block and the `content.spec` assertions; `cta` is `L10n<string>`; `LOCALES`/`L10n` reused from `src/data/types.ts`.
- **Oracle discipline:** `tests/fixtures/parity.json` is only produced by `scripts/distill-parity.mjs`; its diff is explicitly gated in Task 6.
- **Regeneration note:** Task 6 runs after all copy tasks; running it earlier would capture a partial state and fail the smoke parity assertion.
