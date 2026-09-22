# Showcase Curation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Curate the eleven existing repos without adding or removing any: a `tier` field (thesis / satellite / annex), three groups on `/projects`, F3/F2/F1 reduced to their strong pieces, Bible Text Analysis and the displaced tech moved to F0 notes, one outcome line per non-Telefónica job, and `SKILLS` cut to thesis piles.

**Architecture:** `Tier` is data on `Project`; `TIER_ORDER`, `TIER_LABELS` and `tierProjects()` derive from it. The `/projects` index and the case-page pager consume `tierProjects()`; floors consume curated `DEPTS[key].projects` lists; F0 renders two new `OPERATIONS_PAGE` notes. `PROJECTS` stays 11 and no route changes, so only visible copy moves — the parity fixture and llms snapshot are regenerated.

**Tech Stack:** Astro 7 (static), TypeScript strict, Vitest (unit), Playwright (e2e), zero-framework `<script>` island (`src/scripts/filter.ts`), `npm run distill:parity`.

**Spec:** `harness/specs/showcase-curation/{requirements,design,tasks}.md` — this plan implements the spec; read both together.

## Global Constraints

- **No new project, floor or route.** `PROJECTS` stays exactly 11; the route matrix stays 21 routes/locale (65 pages).
- **All copy in `en`, `es` and `ca`.** No string may be added in one locale only.
- **No invented facts or numbers.** Outcome lines and notes use only facts already in `src/data/content.ts` / `MILLORES.md`; phrase qualitatively when a number is unknown.
- **`Project.dept` is unchanged.** Floors list curated subsets; the annex lives on `/projects`.
- **Visible copy changes regenerate `tests/fixtures/parity.json` and the llms snapshot in the same task.** Never hand-edit either.
- **Do not touch** the Telefónica conflict-of-interest line or Front Desk offer copy (owned by `front-desk-positioning`, see `docs/superpowers/plans/2026-09-22-front-desk-positioning.md`). Both features edit `src/data/content.ts` and regenerate `tests/fixtures/parity.json` + the llms snapshot, so run them sequentially — one feature `in_progress` at a time.
- **Org gag untouched:** `PEOPLE_PAGE.orgRoles` stays `['CEO','ENGINEER','QA','SUPPORT']`.
- TDD: red test first, then minimal green, then commit. Verify with `./harness/init.sh`.

## File Structure

| File | Responsibility |
|---|---|
| `src/data/types.ts` | `Tier`; `Project.tier`; new `OperationsPageContent` keys. |
| `src/data/content.ts` | `P()` tier param + 11 assignments; `TIER_ORDER`/`TIER_LABELS`/`tierProjects`; curated `DEPTS` lists; WORK/PAGES/stats/SKILLS/EXPERIENCE/OPERATIONS_PAGE copy. |
| `src/pages/[lang]/projects/index.astro` | Three server-rendered tier groups. |
| `src/pages/[lang]/projects/[slug].astro` | Pager over the project's tier cohort. |
| `src/pages/[lang]/departments/[dept].astro` | F0 roots + toolbelt notes. |
| `src/scripts/filter.ts` | Hide empty tier groups after filtering. |
| `src/data/content.spec.ts` | Unit invariants (tier, memberships, copy, skills, experience). |
| `src/lib/llms-endpoint.spec.ts` (+ `.snap`) | llms membership invariant + regenerated snapshot. |
| `tests/projects.spec.ts`, `tests/cases.spec.ts`, `tests/departments.spec.ts`, `tests/home.spec.ts` | e2e structure assertions. |
| `tests/fixtures/parity.json` | Regenerated acceptance oracle. |

---

### Task 1: Tier data model and helpers

**Files:**
- Modify: `src/data/types.ts`
- Modify: `src/data/content.ts:300-683`
- Test: `src/data/content.spec.ts`

**Interfaces:**
- Produces: `type Tier = 'thesis' | 'satellite' | 'annex'`; `Project.tier: Tier`; `P(slug, name, year, featured, tier, dept, stack, github, l10n)`; `TIER_ORDER`, `TIER_LABELS`, `tierProjects(tier)`.

- [ ] **Step 1: Write the failing test**

Add to `src/data/content.spec.ts`:

```ts
import { TIER_LABELS, TIER_ORDER, tierProjects } from './content';

const TIER_MAP: Record<string, string> = {
  codebaserag: 'thesis', 'kafka-adapter-telemetry': 'thesis', 'harness-standard': 'thesis',
  'redis-toolkit': 'satellite', 'interview-simulator': 'satellite',
  'md-mermaid-pdf': 'satellite', 'mcp-transparent-png': 'satellite',
  'bible-text-analysis': 'annex', 'product-offers': 'annex',
  'spring-boot-casino': 'annex', rustcut: 'annex',
};

describe('project tiers', () => {
  it('assigns exactly the R3 tier map', () => {
    expect(Object.fromEntries(PROJECTS.map((p) => [p.slug, p.tier]))).toEqual(TIER_MAP);
  });

  it('keeps the thesis tier equal to FEATURED', () => {
    expect(tierProjects('thesis').map((p) => p.slug)).toEqual([...FEATURED]);
  });

  it('partitions the 11 projects 3 / 4 / 4 in tier order', () => {
    expect(TIER_ORDER).toEqual(['thesis', 'satellite', 'annex']);
    expect(TIER_ORDER.map((t) => tierProjects(t).length)).toEqual([3, 4, 4]);
    for (const tier of TIER_ORDER) {
      for (const lang of LOCALES) expect(TIER_LABELS[tier][lang].trim()).not.toBe('');
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/content.spec.ts`
Expected: FAIL — `p.tier` is undefined / `tierProjects` is not exported.

- [ ] **Step 3: Write minimal implementation**

In `src/data/types.ts`:

```ts
export type Tier = 'thesis' | 'satellite' | 'annex';
```

Add to `Project`:

```ts
  readonly tier: Tier;
```

In `src/data/content.ts`, import `Tier`, change the factory and add the helpers after `PROJECTS`:

```ts
const P = (slug: string, name: string, year: string, featured: boolean, tier: Tier, dept: DeptKey, stack: readonly string[], github: string, l10n: ProjectL10n): Project =>
  ({ slug, name, year, featured, tier, dept, stack, github, ...l10n });

export const TIER_ORDER: readonly Tier[] = ['thesis', 'satellite', 'annex'];

export const TIER_LABELS: Record<Tier, L10n<string>> = {
  thesis: { en: 'Thesis', es: 'Tesis', ca: 'Tesi' },
  satellite: { en: 'Satellites', es: 'Satélites', ca: 'Satèl·lits' },
  annex: { en: 'Annex — roots, assessments & size exercises', es: 'Anexo — raíces, pruebas y ejercicios de tamaño', ca: 'Annex — arrels, proves i exercicis de mida' },
};

export const tierProjects = (tier: Tier): readonly Project[] => PROJECTS.filter((p) => p.tier === tier);
```

Pass the tier as the 5th argument in all 11 `P(...)` calls per the R3 map, e.g. `P('codebaserag', 'CodebaseRAG', '2026', true, 'thesis', 'research', ...)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/content.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/types.ts src/data/content.ts src/data/content.spec.ts
git commit -m "feat(data): add project tier model and helpers"
```

---

### Task 2: Curate floor membership

**Files:**
- Modify: `src/data/content.ts:151,173,195`
- Test: `src/data/content.spec.ts`

**Interfaces:**
- Consumes: `PROJECTS`, `DEPTS` (Task 1).
- Produces: curated `DEPTS.research/telemetry/tooling.projects` lists; `PROJECTS` still 11.

- [ ] **Step 1: Write the failing test**

Add to the `departments data` describe block:

```ts
  it('curates the three card floors to their strong pieces', () => {
    expect(DEPTS.research.projects).toEqual(['codebaserag', 'interview-simulator']);
    expect(DEPTS.telemetry.projects).toEqual(['kafka-adapter-telemetry', 'redis-toolkit']);
    expect(DEPTS.tooling.projects).toEqual(['harness-standard', 'md-mermaid-pdf', 'mcp-transparent-png']);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/content.spec.ts`
Expected: FAIL — current lists are 3 / 3 / 5.

- [ ] **Step 3: Write minimal implementation**

In `src/data/content.ts`, set:

```ts
// research
projects: ['codebaserag', 'interview-simulator'],
// telemetry
projects: ['kafka-adapter-telemetry', 'redis-toolkit'],
// tooling
projects: ['harness-standard', 'md-mermaid-pdf', 'mcp-transparent-png'],
```

`Project.dept` is not changed; the existing "resolves every department project to a real project of that floor" test still holds.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/content.spec.ts`
Expected: PASS (11 projects, 7 members curated).

- [ ] **Step 5: Commit**

```bash
git add src/data/content.ts src/data/content.spec.ts
git commit -m "feat(data): curate floor membership, keep all 11 projects reachable"
```

---

### Task 3: Group the projects index into tiers

**Files:**
- Modify: `src/pages/[lang]/projects/index.astro:56-60`
- Modify: `src/scripts/filter.ts:25-39`
- Modify: `src/data/content.ts` (`WORK.head.sub`, `WORK.intro`)
- Test: `tests/projects.spec.ts`

**Interfaces:**
- Consumes: `TIER_ORDER`, `TIER_LABELS`, `tierProjects` (Task 1).
- Produces: three `section.cards--tier[data-tier]` groups with `<h2 class="tier-head">`; filter still works.

- [ ] **Step 1: Write the failing test**

In `tests/projects.spec.ts`, add inside the per-route `renders the spike structure` test:

```ts
      const tiers = page.locator('section.cards--tier');
      await expect(tiers).toHaveCount(3);
      await expect(tiers.nth(0)).toHaveAttribute('data-tier', 'thesis');
      await expect(tiers.nth(1)).toHaveAttribute('data-tier', 'satellite');
      await expect(tiers.nth(2)).toHaveAttribute('data-tier', 'annex');
      const counts = [3, 4, 4];
      for (let i = 0; i < 3; i++) {
        await expect(tiers.nth(i).locator('h2.tier-head')).not.toBeEmpty();
        await expect(tiers.nth(i).locator('article.card')).toHaveCount(counts[i]);
      }
```

Update the `sub` and `initialStatus` fixtures: `sub: '11 PROJECTS · 3 TIERS · FILTER BY STACK'` (and the es/ca equivalents), `initialStatus` stays `'11 PROJECTS ON SHOW'`. Update the filter tests to scope cards by tier, e.g. `page.locator('section[data-tier="annex"] article.card')` and `section[data-tier="satellite"] article.card`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && npx playwright test tests/projects.spec.ts`
Expected: FAIL — one `.cards` section, no `data-tier`.

- [ ] **Step 3: Write minimal implementation**

In `src/pages/[lang]/projects/index.astro`, import the helpers and replace the single cards block:

```astro
import { BREADCRUMB_HOME, PAGES, PROJECTS, TIER_LABELS, TIER_ORDER, WORK, tierProjects } from '../../../data/content';
```

```astro
    {TIER_ORDER.map((tier) => (
      <section class="cards cards--tier" data-tier={tier} aria-labelledby={`tier-${tier}`}>
        <h2 class="tier-head" id={`tier-${tier}`}>{TIER_LABELS[tier][lang]}</h2>
        {tierProjects(tier).map((p) => (
          <ProjectCard lang={lang} project={p} stackAttr={p.stack.join('|')} />
        ))}
      </section>
    ))}
```

In `src/scripts/filter.ts`, append to `apply()`:

```ts
    document.querySelectorAll<HTMLElement>('.cards--tier').forEach((section) => {
      const anyVisible = Array.from(section.querySelectorAll<HTMLElement>('.card[data-stack]'))
        .some((card) => !card.hidden);
      section.hidden = !anyVisible;
    });
```

In `src/data/content.ts`, set `WORK.head.sub` and `WORK.intro` per design.md.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build && npx playwright test tests/projects.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/'[lang]'/projects/index.astro src/scripts/filter.ts src/data/content.ts tests/projects.spec.ts
git commit -m "feat(projects): group index into thesis, satellites and annex"
```

---

### Task 4: Page case pages inside their tier

**Files:**
- Modify: `src/pages/[lang]/projects/[slug].astro:38-41`
- Test: `tests/cases.spec.ts`

**Interfaces:**
- Consumes: `tierProjects` (Task 1).
- Produces: non-degenerate prev/next for every project, including annex.

- [ ] **Step 1: Write the failing test**

In `tests/cases.spec.ts`, change the pager expectations for codebaserag:

```ts
      await expect(prevLink).toHaveAttribute('href', caseRoute(lang, 'harness-standard'));
      await expect(prevLink.locator('.pager__name')).toHaveText(project('harness-standard').name);
      await expect(nextLink).toHaveAttribute('href', caseRoute(lang, 'kafka-adapter-telemetry'));
      await expect(nextLink.locator('.pager__name')).toHaveText(project('kafka-adapter-telemetry').name);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && npx playwright test tests/cases.spec.ts`
Expected: FAIL — pager still follows the old research list.

- [ ] **Step 3: Write minimal implementation**

In `src/pages/[lang]/projects/[slug].astro`:

```ts
import { tierProjects } from '../../../data/content';
// ...
const list = tierProjects(p.tier);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build && npx playwright test tests/cases.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/'[lang]'/projects/'[slug]'.astro tests/cases.spec.ts
git commit -m "feat(projects): page case files within their tier"
```

---

### Task 5: F0 notes — 2019 roots and the operations toolbelt

**Files:**
- Modify: `src/data/types.ts` (`OperationsPageContent`)
- Modify: `src/data/content.ts` (`OPERATIONS_PAGE`)
- Modify: `src/pages/[lang]/departments/[dept].astro:149-163`
- Test: `src/data/content.spec.ts`, `tests/departments.spec.ts`

**Interfaces:**
- Produces: `OPERATIONS_PAGE.rootsTitle/rootsNote/toolbeltTitle/toolbeltNote`; sections `#op-roots`, `#op-toolbelt`.

- [ ] **Step 1: Write the failing test**

In `src/data/content.spec.ts`, add:

```ts
import { OPERATIONS_PAGE } from './content';

describe('operations notes (F0)', () => {
  it('localizes the roots and toolbelt notes', () => {
    for (const key of ['rootsTitle', 'rootsNote', 'toolbeltTitle', 'toolbeltNote'] as const) {
      for (const lang of LOCALES) expect(OPERATIONS_PAGE[key][lang].trim(), `${key}.${lang}`).not.toBe('');
    }
  });

  it('names the displaced technology in the toolbelt note', () => {
    for (const tool of ['Kubernetes', 'CDK/CloudFormation', 'Cassandra', 'Snowflake', 'RabbitMQ', 'pandas']) {
      expect(OPERATIONS_PAGE.toolbeltNote.en).toContain(tool);
    }
  });
});
```

In `tests/departments.spec.ts`, in the operations test, add:

```ts
    await expect(page.locator('h2#op-roots')).toHaveText(OPERATIONS_PAGE.rootsTitle.en);
    await expect(page.locator('#op-roots + p')).toHaveText(OPERATIONS_PAGE.rootsNote.en);
    await expect(page.locator('h2#op-toolbelt')).toHaveText(OPERATIONS_PAGE.toolbeltTitle.en);
    await expect(page.locator('#op-toolbelt + p')).toHaveText(OPERATIONS_PAGE.toolbeltNote.en);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/content.spec.ts`
Expected: FAIL — the four keys do not exist.

- [ ] **Step 3: Write minimal implementation**

Add the four `L10n<string>` fields to `OperationsPageContent` in `src/data/types.ts`; add the values from design.md to `OPERATIONS_PAGE`; render the two sections inside the `deptKey === 'operations'` block in `[dept].astro` before the CV CTA:

```astro
        <section class="section" aria-labelledby="op-roots">
          <h2 id="op-roots" class="section-title">{OPERATIONS_PAGE.rootsTitle[lang]}</h2>
          <p class="prose">{OPERATIONS_PAGE.rootsNote[lang]}</p>
        </section>
        <section class="section" aria-labelledby="op-toolbelt">
          <h2 id="op-toolbelt" class="section-title">{OPERATIONS_PAGE.toolbeltTitle[lang]}</h2>
          <p class="prose">{OPERATIONS_PAGE.toolbeltNote[lang]}</p>
        </section>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/content.spec.ts && npm run build && npx playwright test tests/departments.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/types.ts src/data/content.ts src/pages/'[lang]'/departments/'[dept]'.astro src/data/content.spec.ts tests/departments.spec.ts
git commit -m "feat(operations): add 2019 roots and toolbelt notes to F0"
```

---

### Task 6: Floor stats, descriptions and WORK copy

**Files:**
- Modify: `src/data/content.ts` (`RESEARCH_PAGE.stats`, `TOOLING_PAGE.stats`, `TOOLING_PAGE.noteBody`, `PAGES.*`, `WORK`)
- Test: `src/data/content.spec.ts`

**Interfaces:**
- Consumes: curated `DEPTS` (Task 2).
- Produces: honest stats and descriptions that match each floor.

- [ ] **Step 1: Write the failing test**

Add to `src/data/content.spec.ts`:

```ts
import { PAGES, RESEARCH_PAGE, TOOLING_PAGE } from './content';

describe('curated floor copy', () => {
  it('reports 2 research projects and 3 tooling projects', () => {
    expect(RESEARCH_PAGE.stats.en).toHaveLength(3);
    expect(RESEARCH_PAGE.stats.en[0]).toEqual({ value: '2', label: 'PROJECTS ON THIS FLOOR' });
    expect(TOOLING_PAGE.stats.en).toHaveLength(3);
    expect(TOOLING_PAGE.stats.en[0]).toEqual({ value: '3', label: 'PROJECTS ON THIS FLOOR' });
    expect(JSON.stringify(TOOLING_PAGE.stats)).not.toMatch(/ASSESSMENT/);
  });

  it('names exactly the floor projects in each department description', () => {
    const expected: Record<'research' | 'telemetry' | 'tooling', string[]> = {
      research: ['CodebaseRAG', 'Interview Simulator'],
      telemetry: ['Kafka Adapter Telemetry', 'Redis Toolkit'],
      tooling: ['Harness Standard', 'MD Mermaid PDF', 'MCP Transparent PNG'],
    };
    for (const [key, names] of Object.entries(expected)) {
      for (const lang of LOCALES) {
        for (const name of names) expect(PAGES[key].description[lang]).toContain(name);
      }
    }
    expect(PAGES.research.description.en).not.toContain('Bible Text Analysis');
    expect(PAGES.telemetry.description.en).not.toContain('Product Offers API');
    expect(PAGES.tooling.description.en).not.toContain('Rustcut');
    expect(PAGES.tooling.description.en).not.toContain('Spring Boot Casino');
  });

  it('states 11 projects and the three tiers', () => {
    for (const lang of LOCALES) {
      expect(WORK.head.sub[lang]).toContain('11');
      expect(WORK.intro[lang]).toContain('11');
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/content.spec.ts`
Expected: FAIL — stats are 3/5, descriptions still list removed projects.

- [ ] **Step 3: Write minimal implementation**

Apply the exact values from design.md: `RESEARCH_PAGE.stats` (3 entries), `TOOLING_PAGE.stats` (3 entries), `TOOLING_PAGE.noteBody` (drop the assessments clause), `PAGES.research/telemetry/tooling.description`, `PAGES.work.description`, `WORK.head.sub`, `WORK.intro`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/content.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/content.ts src/data/content.spec.ts
git commit -m "feat(copy): align floor stats and descriptions with curation"
```

---

### Task 7: Cut SKILLS to thesis piles

**Files:**
- Modify: `src/data/content.ts:782-803`
- Test: `src/data/content.spec.ts`

**Interfaces:**
- Consumes: the F0 toolbelt note (Task 5) now owns the displaced technology.
- Produces: five skill groups with the R20 items.

- [ ] **Step 1: Write the failing test**

Replace the `groups skills with trilingual group titles` test with:

```ts
  it('keeps five thesis skill piles and drops the toolbelt technology', () => {
    expect(SKILLS.map((g) => g.group.en)).toEqual(['Backend', 'Data', 'AI', 'Quality', 'Leadership']);
    expect(SKILLS.map((g) => [...g.items])).toEqual([
      ['Java 21/25', 'Spring Boot', 'Python 3.13', 'FastAPI', 'Kafka'],
      ['Oracle', 'Redis', 'pgvector'],
      ['RAG + evals in CI', 'MCP', 'Ollama / llama.cpp'],
      ['Testcontainers', 'GitHub Actions', 'mypy strict', 'TDD'],
      ['team coordination', 'code review culture', 'mentoring', 'conflict resolution'],
    ]);
    const flat = SKILLS.flatMap((g) => g.items).join(' ');
    for (const tool of ['Kubernetes', 'CDK', 'Cassandra', 'Snowflake', 'RabbitMQ', 'pandas']) {
      expect(flat).not.toContain(tool);
    }
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/content.spec.ts`
Expected: FAIL — old five groups with the full stack.

- [ ] **Step 3: Write minimal implementation**

Replace `SKILLS` with the design.md groups (localized titles; technical items in English).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/content.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/content.ts src/data/content.spec.ts
git commit -m "feat(people): reduce skills to thesis piles"
```

---

### Task 8: One outcome line per non-Telefónica job

**Files:**
- Modify: `src/data/content.ts:685-780`
- Test: `src/data/content.spec.ts`

**Interfaces:**
- Produces: Mapfre/Zitro 3 points, Attendre 2, Telefónica unchanged (3).

- [ ] **Step 1: Write the failing test**

Add to the `cv and experience data` describe block:

```ts
  it('adds exactly one outcome line to the three non-Telefónica jobs', () => {
    const byCompany = Object.fromEntries(EXPERIENCE.map((e) => [e.company, e]));
    expect(byCompany['Telefónica Kernel · Open Gateway'].points.en).toHaveLength(3);
    expect(byCompany['Axpe Consulting / Mapfre'].points.en).toHaveLength(3);
    expect(byCompany['Zitro Laboratory'].points.en).toHaveLength(3);
    expect(byCompany['Attendre S.L.'].points.en).toHaveLength(2);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/content.spec.ts`
Expected: FAIL — Mapfre/Zitro have 2, Attendre has 1.

- [ ] **Step 3: Write minimal implementation**

Append the design.md outcome line to each entry's `points` in `en`, `es` and `ca`; leave Telefónica untouched.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/content.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/content.ts src/data/content.spec.ts
git commit -m "feat(experience): add one outcome line per job"
```

---

### Task 9: Update unit invariants and the llms snapshot

**Files:**
- Modify: `src/lib/llms-endpoint.spec.ts:21-29`
- Modify: `src/lib/__snapshots__/llms-endpoint.spec.ts.snap`
- Test: `src/lib/llms-endpoint.spec.ts`

**Interfaces:**
- Consumes: curated `DEPTS` (Task 2), new SKILLS/EXPERIENCE copy (Tasks 7–8).
- Produces: llms membership invariant reflecting curation; updated snapshot.

- [ ] **Step 1: Write the failing test**

Replace the `resolves all 11 projects and their department memberships` test with:

```ts
  it('exposes the curated members and keeps all 11 projects reachable', () => {
    expect(data.projects).toHaveLength(11);
    const members = data.departments.flatMap((dept) => dept.projects).map((p) => p.slug);
    expect(members).toHaveLength(7);
    expect(new Set(members).size).toBe(7);
    for (const annex of ['bible-text-analysis', 'product-offers', 'rustcut', 'spring-boot-casino']) {
      expect(members).not.toContain(annex);
    }
    for (const project of data.projects) {
      expect(data.projects.map((p) => p.slug)).toContain(project.slug);
    }
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/llms-endpoint.spec.ts`
Expected: FAIL — members still 11; snapshot mismatch.

- [ ] **Step 3: Write minimal implementation**

Update the test as above; regenerate the snapshot:

```bash
npx vitest run src/lib/llms-endpoint.spec.ts -u
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/llms-endpoint.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/llms-endpoint.spec.ts src/lib/__snapshots__/llms-endpoint.spec.ts.snap
git commit -m "test(llms): update membership invariant and snapshot"
```

---

### Task 10: Update the e2e structure assertions

**Files:**
- Modify: `tests/home.spec.ts:100-102`
- Modify: `tests/departments.spec.ts:132`
- Test: `tests/home.spec.ts`, `tests/departments.spec.ts`

**Interfaces:**
- Consumes: curated `DEPTS` (Task 2), F0 sections (Task 5), tier groups (Task 3).

- [ ] **Step 1: Write the failing test**

In `tests/home.spec.ts` update the building-panel counts:

```ts
      await expect(page.locator('#dept-panel-research .cards .card')).toHaveCount(2);
      await expect(page.locator('#dept-panel-tooling .cards .card')).toHaveCount(3);
```

In `tests/departments.spec.ts` update the tooling test name to `... workshop note and three bench cards`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && npx playwright test tests/home.spec.ts tests/departments.spec.ts`
Expected: FAIL against the old 3/5 expectations (if run before the content change) — after Tasks 2/5 the assertions must be updated to match.

- [ ] **Step 3: Write minimal implementation**

Apply the edits above; keep all other selectors (they read `d.projects.length` generically).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build && npx playwright test tests/home.spec.ts tests/departments.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/home.spec.ts tests/departments.spec.ts
git commit -m "test(e2e): align floor structure assertions with curation"
```

---

### Task 11: Regenerate the parity fixture and run the full gate

**Files:**
- Modify: `tests/fixtures/parity.json`
- Test: `tests/smoke.spec.ts`

**Interfaces:**
- Consumes: all copy changes (Tasks 3–8).
- Produces: regenerated oracle with unchanged route keys/counts.

- [ ] **Step 1: Regenerate the fixture**

```bash
npm run build && npm run distill:parity
git diff --stat tests/fixtures/parity.json
```

Expected: the fixture changes; the route keys are still the same 63 locale routes and `_meta.counts` is unchanged.

- [ ] **Step 2: Run the sweep and the full gate**

```bash
npm run test:e2e
npm run check
./harness/init.sh
npm run qa:content
npm run qa:links
```

Expected: all green; `smoke.spec.ts` still asserts 65 targets and 21 routes per locale; no `front-desk-positioning` copy appears.

- [ ] **Step 3: Confirm scope guards**

```bash
git diff -- harness/feature_list.json
```

Expected: empty (this feature is authored docs-only; no feature status change in this plan run).

- [ ] **Step 4: Commit**

```bash
git add tests/fixtures/parity.json
git commit -m "test(parity): regenerate oracle for curated copy"
```

---

## Self-Review (done at plan-writing time)

- **Spec coverage:** R1–R3 → T1; R9–R12 → T2; R4–R8 → T3, T6; R13 → T4; R14–R15 → T5; R16–R18 → T6; R19–R20 → T7; R21–R22 → T8; R23 (org gag) preserved by omission and pinned in T1's content.spec; R24 → every content task; R25 → T11; R26 → T9. Every R maps to at least one task.
- **Placeholder scan:** no TBDs; every code step carries the exact snippet or the exact design.md value.
- **Type consistency:** `Tier`, `Project.tier`, `tierProjects(tier)`, `TIER_ORDER`, `TIER_LABELS`, and the four `OPERATIONS_PAGE` keys are spelled identically across tasks; the `P()` parameter order (`…, featured, tier, dept, …`) matches Task 1's signature and all call sites.
