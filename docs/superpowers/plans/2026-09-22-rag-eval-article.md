# RAG Eval Article (writing/rag-eval-gate) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Construction is wrapped by `harness-standard` roles (Leader / Spec Author / Implementer / Reviewer).

**Goal:** Publish one dated, trilingual (EN/ES/CA) essay — “RAG without an eval gate is a demo.” — as a static page at `/en|es|ca/writing/rag-eval-gate/`, discoverable from the F3 Research page, the CodebaseRAG case page and `llms.txt`, with `Article` JSON-LD.

**Architecture:** One `PAGES`-registered route rendered by a small Astro page from a new typed `ARTICLE` record in `src/data/content.ts`. The existing `SiteLayout → SEO` pipeline handles title/description/canonical/hreflang; a new pure `articleJsonLd` emitter adds schema.org `Article`. No content collections, no blog, no new nav key. Sitemap, QA census and the parity fixture derive from `PAGES` / the built tree.

**Tech Stack:** Astro ^7, TypeScript strict, Vitest (units), Playwright (e2e, 68-page sweep), `@astrojs/sitemap`, hand-rolled JSON-LD + `llms.txt` emitters.

**Spec:** `harness/specs/rag-eval-article/{requirements,design,tasks}.md` — this plan implements R1–R17. The essay is also the external CodebaseRAG plan's 1-page ADR deliverable; the two are cross-referenced (Task 8), never duplicated.

**Fact boundary (applies to every task):** the only numeric claims allowed in the copy are the baseline metrics already in `src/data/content.ts` — mean recall@5 `0.409`, MRR `0.231`, nDCG@5 `0.277`, golden set `≥40` pairs — plus the publication date `2026-09-22`. `0.409` is always framed as a committed floor, never SOTA. No invented file paths, metrics or repository internals.

## Global Constraints

- All copy exists in `en`, `es`, `ca`; no inline content in the page — everything comes from `ARTICLE` in `src/data/content.ts` (`docs/conventions.md`).
- Every page registers in `PAGES` (`Record<string, PageMeta>`); sitemap/hreflang/SEO/`qa:content` derive from it.
- The essay route is `writing/rag-eval-gate.html` → directory URL `/<lang>/writing/rag-eval-gate/`; `PAGES` entry uses `nav: 'departments'`.
- English title, exact: `RAG without an eval gate is a demo.` English body 800–1200 words.
- `Article` JSON-LD: `author.name` = `SITE.person`; `about` = `project('codebaserag').github` (content module, not a literal).
- Body markup must not break parity: regenerate `tests/fixtures/parity.json` only via `npm run build && npm run distill:parity`, never hand-edit (ADR-6). `src/data/quality.json` is not touched (weekly `quality.yml` owns it).
- Tests first, red → green → refactor; conventional commits; every task ends green.
- Do not run `harness/init.sh` as a substitute for the e2e gate; the full gate in Task 7 is mandatory.

## File Structure (end state)

```
src/
├── data/
│   ├── types.ts                          # + ArticleSection, ArticleContent
│   ├── content.ts                        # + ARTICLE, + PAGES['article-rag-eval-gate']
│   └── content.spec.ts                   # + article data tests, page-matrix entry
├── lib/
│   ├── seo.ts                            # + ArticleInput, articleJsonLd()
│   ├── seo.spec.ts                       # + articleJsonLd tests
│   ├── llms.ts                           # + LlmsArticleRef, article field, ## Writing
│   ├── llms.spec.ts                      # + fixture field + assertions
│   ├── llms-endpoint.spec.ts             # + ## Writing section, snapshot -u
│   └── __snapshots__/llms-endpoint.spec.ts.snap   # regenerated
├── components/SEO.astro                  # + optional article prop
├── layouts/SiteLayout.astro              # + optional article prop
├── pages/[lang]/
│   ├── writing/rag-eval-gate.astro       # NEW
│   ├── departments/[dept].astro          # + research callout
│   └── projects/[slug].astro             # + codebaserag callout
├── pages/llms.txt.ts                     # + article ref
└── styles/site.css                       # + .article*, .article-callout
tests/
├── smoke.spec.ts                         # route matrix 21→22, sweep 65→68
├── seo-head.spec.ts                      # + writing route + Article JSON-LD test
├── departments.spec.ts                   # + research callout assertion
├── cases.spec.ts                         # + codebaserag callout assertion
└── fixtures/parity.json                  # regenerated (diff reviewed)
```

---

### Task 1: Types, essay copy and page registration

**Files:**
- Modify: `src/data/types.ts` (append two interfaces)
- Modify: `src/data/content.ts` (add `ARTICLE`, add `PAGES` entry)
- Test: `src/data/content.spec.ts`

**Interfaces:**
- Produces: `ArticleSection`, `ArticleContent`, `ARTICLE`, `PAGES['article-rag-eval-gate']` — consumed by Tasks 2–5.

- [ ] **Step 1: Write the failing content tests**

In `src/data/content.spec.ts`, add `ARTICLE` to the import list and append:

```ts
describe('article data (rag-eval-article)', () => {
  const EN_TITLE = 'RAG without an eval gate is a demo.';
  const ANCHORS = ['problem', 'golden-set', 'ci-gate', 'hexagonal', 'baseline'];

  it('pins the exact English title and localized title/description/lead', () => {
    expect(ARTICLE.title.en).toBe(EN_TITLE);
    expect(ARTICLE.sections).toHaveLength(5);
    for (const lang of LOCALES) {
      expect(ARTICLE.title[lang].trim(), `title.${lang}`).not.toBe('');
      expect(ARTICLE.description[lang].trim(), `description.${lang}`).not.toBe('');
      expect(ARTICLE.lead[lang].trim(), `lead.${lang}`).not.toBe('');
      expect(ARTICLE.dateLabel[lang].trim(), `dateLabel.${lang}`).not.toBe('');
      expect(ARTICLE.readLabel[lang].trim(), `readLabel.${lang}`).not.toBe('');
      expect(ARTICLE.relatedBody[lang].trim(), `relatedBody.${lang}`).not.toBe('');
    }
  });

  it('defines exactly the five sections in the fixed order with trilingual copy', () => {
    expect(ARTICLE.sections.map((section) => section.anchor)).toEqual(ANCHORS);
    for (const section of ARTICLE.sections) {
      for (const lang of LOCALES) {
        expect(section.heading[lang].trim(), `${section.anchor}:heading.${lang}`).not.toBe('');
        expect(section.body[lang].length, `${section.anchor}:body.${lang}`).toBeGreaterThan(0);
        for (const paragraph of section.body[lang]) {
          expect(paragraph.trim(), `${section.anchor}:body.${lang}`).not.toBe('');
        }
      }
    }
  });

  it('keeps the English body between 800 and 1200 words', () => {
    const words = [ARTICLE.lead.en, ...ARTICLE.sections.flatMap((section) => section.body.en)]
      .join(' ')
      .split(/\s+/)
      .filter(Boolean);
    expect(words.length).toBeGreaterThanOrEqual(800);
    expect(words.length).toBeLessThanOrEqual(1200);
  });

  it('carries the committed floor facts and frames 0.409 honestly', () => {
    const en = [ARTICLE.lead.en, ...ARTICLE.sections.flatMap((section) => section.body.en)].join('\n');
    expect(en).toContain('0.409');
    expect(en).toContain('not SOTA');
    expect(en).toContain('≥40');
  });

  it('registers the essay route in PAGES under the departments nav', () => {
    expect(PAGES['article-rag-eval-gate'].route).toBe('writing/rag-eval-gate.html');
    expect(PAGES['article-rag-eval-gate'].nav).toBe('departments');
  });
});
```

Then update the existing page-matrix test:

```ts
it('registers home, work, cv, the 6 departments, the 11 project pages and the essay', () => {
  const expected = [
    'home',
    'work',
    'cv',
    'article-rag-eval-gate',
    ...FLOOR_ORDER,
    ...PROJECTS.map((p) => `project-${p.slug}`),
  ];
  expect(Object.keys(PAGES).sort()).toEqual(expected.sort());
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/data/content.spec.ts`
Expected: FAIL — `ARTICLE is not defined` / page matrix mismatch.

- [ ] **Step 3: Add the types**

Append to `src/data/types.ts`:

```ts
export interface ArticleSection {
  readonly anchor: 'problem' | 'golden-set' | 'ci-gate' | 'hexagonal' | 'baseline';
  readonly heading: L10n<string>;
  readonly body: L10n<readonly string[]>;
}

export interface ArticleContent {
  readonly floor: DeptKey;
  readonly date: string;
  readonly revision: string;
  readonly dateLabel: L10n<string>;
  readonly title: L10n<string>;
  readonly description: L10n<string>;
  readonly lead: L10n<string>;
  readonly sections: readonly ArticleSection[];
  readonly relatedBody: L10n<string>;
  readonly readLabel: L10n<string>;
}
```

Add `ArticleContent` to the type-only import list at the top of `src/data/content.ts`.

- [ ] **Step 4: Add the essay copy**

Define `ARTICLE` immediately before `export const PAGES` in `src/data/content.ts` (so the `PAGES` entry can derive from it). The English text below is the **authoritative draft for the executor to paste verbatim**; translate `es`/`ca` faithfully from it (see “Translation approach” after the draft).

**EN draft (paste as the `en` values):**

Title: `RAG without an eval gate is a demo.`

Lead: `A retrieval system is a promise. The eval gate is what turns the promise into a claim someone else can check — and break the moment it stops being true.`

`problem` — heading `The problem: recall nobody measures`
1. `Most RAG projects ship a demo. You ask a question, the retriever returns five chunks, a model writes a confident paragraph, and everyone nods. Nobody can say whether the right document was in those five chunks — because nobody wrote down what “right” means and nobody measures it. The demo works until a chunking change, a new embedding model or a different vector store quietly moves quality, and the only signal is a vague feeling that answers got worse.`
2. `That is the real failure mode: not hallucination as moral panic, but retrieval that degrades with nobody watching. A demo optimises for the happy path in front of an audience; a system optimises for a number it can regress against. The distance between the two is an eval — and CodebaseRAG exists to close it.`

`golden-set` — heading `The golden set: turning “right” into forty checkable pairs`
1. `An eval is only as honest as its questions. The golden set is a public list of question/answer pairs drawn from the repository itself: a question a developer would actually ask, paired with the answer and where it lives. It holds at least forty pairs — enough to catch a real regression, small enough that every pair can be reviewed by hand and kept honest.`
2. `You do not need a labelling platform. You need somewhere to write questions down and the discipline to keep them. They live next to the code, so a retriever change and its updated expectations travel in the same review.`
3. `Three entries, paraphrased from the public set, show the shape:`
4. `Which abstraction does the query use case depend on, and why is it not a vector-store type? It depends on a retriever port; adapters implement it, so the core never imports a pgvector or Qdrant class.`
5. `What should CI do when mean recall@5 drops below the committed floor? Fail the build. The floor is a committed number, and moving it is an explicit, ADR-gated decision — not an edit that makes CI green.`
6. `Can the eval run with no network? Yes. Embeddings arrive through a port with two adapters — Ollama locally, Anthropic when hosted — so the same golden set runs offline.`
7. `The examples are not meant to be hard. They are meant to have defensible answers, so a wrong one is a failing test rather than a disagreement.`

`ci-gate` — heading `The CI gate: what fails, what does not`
1. `A gate is only useful if it fails loudly and predictably. This one measures mean recall@5, mean reciprocal rank and nDCG@5 over the golden set, and fails the build when mean recall@5 drops below the committed baseline of 0.409.`
2. `What fails: any change that pushes mean recall@5 under 0.409. That is the entire rule. CI runs the same deterministic eval as a laptop, so a red build points at a retrieval change, not a flaky environment.`
3. `What does not fail matters too. A model change that keeps recall@5 at or above the floor passes even when MRR and nDCG@5 move — the gate guards the metric that was committed to, not every number on the dashboard. A refactor that moves code without moving retrieval passes. And the gate does not judge answer fluency: this is a retrieval eval, and pretending it measures generation quality would be the same dishonesty as having no eval at all.`

`hexagonal` — heading `Why hexagonal: swapping Qdrant must not rewrite the core`
1. `You measure retrieval, so what you measure must not be welded to what you deploy. CodebaseRAG is hexagonal: the query use case depends on ports, and pgvector, Qdrant, Ollama and Anthropic sit behind them as adapters.`
2. `The test is concrete. Swapping Qdrant for pgvector — or running fully local on Ollama — must not rewrite the core. If changing a vector store forces edits across the use cases, the eval is measuring an accident of the storage layer, and every future swap re-opens whether the metrics still mean anything.`
3. `Keeping the core free of frameworks and transports buys more than tidiness: it keeps the eval deterministic, exercised against in-memory or container-backed adapters with no network required. A committed floor is only trustworthy when the code beneath it does not change shape every time the infrastructure does.`

`baseline` — heading `Current baseline and what it does not claim`
1. `The committed baseline is a mean recall@5 of 0.409 (MRR 0.231, nDCG@5 0.277) over a golden set of at least forty pairs. Read it as a floor, not a result. 0.409 is not SOTA and this is not a claim that retrieval is solved. It is the number the project committed to defend, chosen low enough to stay stable and high enough to catch a real drop.`
2. `What the number does not claim: that the golden set is exhaustive, that a green build means good answers, or that the embedding model is the best available. Raising the floor is a recorded decision with a justification, never a vanity metric pasted into a README.`
3. `What it does claim is smaller and more useful: on every change, the repository can tell you whether retrieval got worse, and prove it from a public golden set. That is the line between a RAG demo and a RAG system. A demo shows you an answer; a system lets you disagree with it.`

English body (lead + all paragraphs above) is ~900 words — inside the 800–1200 gate. The `example` bullets are rendered as ordinary paragraphs in the body array (the section template renders one `<p>` per array entry; the entries above are already full sentences).

**Translation approach (es/ca):**

- Translate every `en` string faithfully into Spanish and Catalan, preserving meaning, sentence order and technical terms that stay English in this repo (`recall@5`, `MRR`, `nDCG@5`, `SOTA`, `pgvector`, `Qdrant`, `Ollama`, `Anthropic`, `Ollama locally`, `ADR`, `CI`, `RAG`, `embedding model`, `vector store`, `codebase`).
- Keep the exact tokens `0.409`, `0.231`, `0.277`, `≥40`, `2026-09-22` verbatim in all locales.
- The English `not SOTA` must stay literally present in `en`; for `es`/`ca` use `no es SOTA`, keeping the acronym.
- Localize these labels exactly:

| Field | en | es | ca |
|---|---|---|---|
| `title` | `RAG without an eval gate is a demo.` | `Un RAG sin puerta de evals es una demo.` | `Un RAG sense porta d’evals és una demo.` |
| `dateLabel` | `FILED` | `REGISTRADO` | `REGISTRAT` |
| `readLabel` | `READ THE ESSAY` | `LEE EL ENSAYO` | `LLEGEIX L’ASSAIG` |
| headings | (as above) | faithful translations | faithful translations |

- `description` (meta, one sentence, localize): en `Why CodebaseRAG gates retrieval quality in CI: a public golden set, a committed mean recall@5 floor of 0.409, and honest limits — a floor, not SOTA.`
- `relatedBody` (one sentence for the callout, localize): en `The essay behind CodebaseRAG: why a public golden set and a CI floor of 0.409 matter more than another chatbot demo.`
- `revision: 'REV A'` and `date: '2026-09-22'` are not localized.

The resulting constant:

```ts
export const ARTICLE: ArticleContent = {
  floor: 'research',
  date: '2026-09-22',
  revision: 'REV A',
  dateLabel: { en: 'FILED', es: 'REGISTRADO', ca: 'REGISTRAT' },
  title: {
    en: 'RAG without an eval gate is a demo.',
    es: 'Un RAG sin puerta de evals es una demo.',
    ca: 'Un RAG sense porta d’evals és una demo.',
  },
  description: {
    en: 'Why CodebaseRAG gates retrieval quality in CI: a public golden set, a committed mean recall@5 floor of 0.409, and honest limits — a floor, not SOTA.',
    es: 'Por qué CodebaseRAG pone un gate de calidad del retrieval en CI: un set golden público, un suelo de recall@5 medio comprometido de 0.409 y límites honestos — un suelo, no SOTA.',
    ca: 'Per què CodebaseRAG posa un gate de qualitat del retrieval a CI: un set golden públic, un sòl de recall@5 mitjà compromès de 0.409 i límits honests — un sòl, no SOTA.',
  },
  lead: { en: /* EN draft */ '...', es: '...', ca: '...' },
  relatedBody: {
    en: 'The essay behind CodebaseRAG: why a public golden set and a CI floor of 0.409 matter more than another chatbot demo.',
    es: 'El ensayo detrás de CodebaseRAG: por qué un set golden público y un suelo de 0.409 en CI importan más que otra demo de chatbot.',
    ca: 'L’assaig darrere de CodebaseRAG: per què un set golden públic i un sòl de 0.409 a CI importen més que una altra demo de chatbot.',
  },
  readLabel: { en: 'READ THE ESSAY', es: 'LEE EL ENSAYO', ca: 'LLEGEIX L’ASSAIG' },
  sections: [
    { anchor: 'problem', heading: { en: 'The problem: recall nobody measures', es: '...', ca: '...' },
      body: { en: [/* 2 paragraphs */ '...', '...'], es: ['...', '...'], ca: ['...', '...'] } },
    { anchor: 'golden-set', heading: { en: 'The golden set: turning “right” into forty checkable pairs', es: '...', ca: '...' },
      body: { en: [/* 7 paragraphs */ '...'], es: ['...'], ca: ['...'] } },
    { anchor: 'ci-gate', heading: { en: 'The CI gate: what fails, what does not', es: '...', ca: '...' },
      body: { en: [/* 3 paragraphs */ '...'], es: ['...'], ca: ['...'] } },
    { anchor: 'hexagonal', heading: { en: 'Why hexagonal: swapping Qdrant must not rewrite the core', es: '...', ca: '...' },
      body: { en: [/* 3 paragraphs */ '...'], es: ['...'], ca: ['...'] } },
    { anchor: 'baseline', heading: { en: 'Current baseline and what it does not claim', es: '...', ca: '...' },
      body: { en: [/* 3 paragraphs */ '...'], es: ['...'], ca: ['...'] } },
  ],
};
```

- [ ] **Step 5: Register the `PAGES` entry**

Inside the `PAGES` object literal (keep it near `cv`/`research`):

```ts
'article-rag-eval-gate': {
  route: 'writing/rag-eval-gate.html',
  nav: 'departments',
  title: {
    en: `${ARTICLE.title.en} — Jordimp & Co.`,
    es: `${ARTICLE.title.es} — Jordimp & Co.`,
    ca: `${ARTICLE.title.ca} — Jordimp & Co.`,
  },
  description: ARTICLE.description,
},
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run src/data/content.spec.ts && npm run check`
Expected: PASS; `astro check` reports 0 errors.

- [ ] **Step 7: Commit**

```bash
git add src/data/types.ts src/data/content.ts src/data/content.spec.ts
git commit -m "feat(content): rag-eval essay content + page registration"
```

---

### Task 2: `Article` JSON-LD emitter and optional layout prop

**Files:**
- Modify: `src/lib/seo.ts`, `src/components/SEO.astro`, `src/layouts/SiteLayout.astro`
- Test: `src/lib/seo.spec.ts`

**Interfaces:**
- Consumes: `SITE`, `siteUrl`, `jsonLdScript` (existing).
- Produces: `ArticleInput`, `articleJsonLd(lang, input)`; `article?: ArticleInput` prop on `SEO`/`SiteLayout` — consumed by Task 3 and asserted in Task 6.

- [ ] **Step 1: Write the failing test**

Append to `src/lib/seo.spec.ts` (add `articleJsonLd` to the import):

```ts
describe('articleJsonLd()', () => {
  const input = {
    headline: 'RAG without an eval gate is a demo.',
    description: 'A description.',
    path: 'writing/rag-eval-gate/',
    datePublished: '2026-09-22',
    section: 'Research & Retrieval',
    about: 'https://github.com/jordimarsal/codebaserag',
  };

  it('emits a schema.org Article with the core fields', () => {
    const article = articleJsonLd('en', input);
    expect(article['@context']).toBe('https://schema.org');
    expect(article['@type']).toBe('Article');
    expect(article.headline).toBe(input.headline);
    expect(article.description).toBe(input.description);
    expect(article.inLanguage).toBe('en');
    expect(article.datePublished).toBe('2026-09-22');
    expect(article.dateModified).toBe('2026-09-22');
    expect(article.articleSection).toBe('Research & Retrieval');
    expect(article.about).toBe('https://github.com/jordimarsal/codebaserag');
  });

  it('names the site person as author and links the CodebaseRAG repo as about', () => {
    const article = articleJsonLd('es', input);
    expect(article.author.name).toBe('Jordi Marçal Poy');
    expect(article.author['@type']).toBe('Person');
    expect(article.author.url).toBe('https://jordimp.net/es/');
    expect(article.author.sameAs).toEqual([
      'https://github.com/jordimarsal',
      'https://www.linkedin.com/in/jordi-marsal-poy',
    ]);
  });

  it('points mainEntityOfPage and isPartOf at the locale URLs', () => {
    const article = articleJsonLd('ca', input);
    expect(article.mainEntityOfPage).toBe('https://jordimp.net/ca/writing/rag-eval-gate/');
    expect(article.isPartOf).toEqual({
      '@type': 'WebSite',
      name: 'JORDIMP & CO.',
      url: 'https://jordimp.net/',
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/seo.spec.ts`
Expected: FAIL — `articleJsonLd is not a function`.

- [ ] **Step 3: Add the emitter**

Append to `src/lib/seo.ts`:

```ts
export interface ArticleInput {
  readonly headline: string;
  readonly description: string;
  readonly path: string;
  readonly datePublished: string;
  readonly section: string;
  readonly about: string;
}

export function articleJsonLd(
  lang: Locale,
  input: ArticleInput,
): {
  readonly '@context': 'https://schema.org';
  readonly '@type': 'Article';
  readonly headline: string;
  readonly description: string;
  readonly inLanguage: Locale;
  readonly datePublished: string;
  readonly dateModified: string;
  readonly mainEntityOfPage: string;
  readonly articleSection: string;
  readonly about: string;
  readonly author: {
    readonly '@type': 'Person';
    readonly name: string;
    readonly url: string;
    readonly sameAs: readonly [string, string];
  };
  readonly isPartOf: { readonly '@type': 'WebSite'; readonly name: string; readonly url: string };
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    inLanguage: lang,
    datePublished: input.datePublished,
    dateModified: input.datePublished,
    mainEntityOfPage: siteUrl(lang, input.path),
    articleSection: input.section,
    about: input.about,
    author: {
      '@type': 'Person',
      name: SITE.name,
      url: siteUrl(lang),
      sameAs: [SITE.github, SITE.linkedin],
    },
    isPartOf: { '@type': 'WebSite', name: SITE.brand, url: SITE.url },
  };
}
```

- [ ] **Step 4: Thread the optional prop**

In `src/components/SEO.astro`:

```astro
import {
  articleJsonLd,
  breadcrumbJsonLd,
  jsonLdScript,
  ogLocale,
  ogLocaleAlternates,
  personJsonLd,
  siteUrl,
  type ArticleInput,
  type BreadcrumbItem,
} from '../lib/seo';
```

Add to `interface Props` and destructuring:

```astro
  article?: ArticleInput;
```
```astro
const { lang, title, description, path = '', noindex = false, breadcrumbs, ogType = 'website', articleSection, article } = Astro.props;
```

After the `person`/`breadcrumb` consts:

```ts
const articleLd = article ? jsonLdScript(articleJsonLd(lang, article)) : undefined;
```

Before `</head>` (after the breadcrumb script):

```astro
{articleLd && <script is:inline type="application/ld+json" set:html={articleLd} />}
```

In `src/layouts/SiteLayout.astro`, import `type ArticleInput` from `../lib/seo` (extend the existing import), add `article?: ArticleInput;` to `Props`, destructure `article`, and pass it:

```astro
<SEO {lang} {title} {description} {path} {noindex} {breadcrumbs} {ogType} {articleSection} {article} />
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/lib/seo.spec.ts && npm run check`
Expected: PASS; 0 check errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/seo.ts src/lib/seo.spec.ts src/components/SEO.astro src/layouts/SiteLayout.astro
git commit -m "feat(seo): article JSON-LD emitter and optional layout prop"
```

---

### Task 3: The essay page and its styles

**Files:**
- Create: `src/pages/[lang]/writing/rag-eval-gate.astro`
- Modify: `src/styles/site.css`
- Test: `tests/seo-head.spec.ts`

**Interfaces:**
- Consumes: `ARTICLE` (Task 1), `articleJsonLd`/`ArticleInput` + `article` prop (Task 2), `project()`, `DEPTS`, `PAGES`, `BREADCRUMB_HOME`, `dirRoute`, `SiteLayout`, `Breadcrumb`.

- [ ] **Step 1: Write the failing e2e test**

In `tests/seo-head.spec.ts`, add to `REPRESENTATIVE_ROUTES`:

```ts
  { lang: 'en', route: 'writing/rag-eval-gate/' },
  { lang: 'es', route: 'writing/rag-eval-gate/' },
  { lang: 'ca', route: 'writing/rag-eval-gate/' },
```

Add a dedicated test:

```ts
test('emits Article JSON-LD with the site person and the CodebaseRAG repo on the essay', async ({ page }) => {
  await page.goto('/en/writing/rag-eval-gate/');
  const article = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map((script) => JSON.parse(script.textContent ?? '{}'))
      .find((entry) => entry['@type'] === 'Article'),
  );
  expect(article.headline).toBe('RAG without an eval gate is a demo.');
  expect(article.author.name).toBe('Jordi Marçal Poy');
  expect(article.about).toBe('https://github.com/jordimarsal/codebaserag');
});
```

This is red until the page exists and the route builds.

- [ ] **Step 2: Create the page**

```astro
---
import SiteLayout from '../../../layouts/SiteLayout.astro';
import Breadcrumb from '../../../components/site/Breadcrumb.astro';
import { LOCALES, type Locale } from '../../../lib/i18n';
import { ARTICLE, BREADCRUMB_HOME, DEPTS, PAGES, project } from '../../../data/content';
import { dirRoute } from '../../../lib/paths';

export async function getStaticPaths() {
  return LOCALES.map((lang) => ({ params: { lang }, props: { lang } }));
}

type Props = { lang: Locale };
const { lang } = Astro.props;

const route = dirRoute(PAGES['article-rag-eval-gate'].route);
const deptRoute = dirRoute(PAGES.research.route);
const datestamp = `${ARTICLE.dateLabel[lang]} ${ARTICLE.date} · ${ARTICLE.revision}`;
const sectionName = DEPTS.research.name[lang];
const trail = [
  { name: BREADCRUMB_HOME[lang], path: '' },
  { name: sectionName, path: deptRoute },
  { name: ARTICLE.title[lang], path: route },
] as const;
---
<SiteLayout
  lang={lang}
  title={PAGES['article-rag-eval-gate'].title[lang]}
  description={PAGES['article-rag-eval-gate'].description[lang]}
  path={route}
  navKey="departments"
  breadcrumbs={trail.slice(1)}
  ogType="article"
  articleSection={sectionName}
  article={{
    headline: ARTICLE.title[lang],
    description: ARTICLE.description[lang],
    path: route,
    datePublished: ARTICLE.date,
    section: sectionName,
    about: project('codebaserag').github,
  }}
>
  <main class="wrap" id="main">
    <Breadcrumb lang={lang} {trail} />
    <article class="prose article">
      <p class="article__stamp mono">{datestamp}</p>
      <h1 id="page-title">{ARTICLE.title[lang]}</h1>
      <p class="article__lead">{ARTICLE.lead[lang]}</p>
      {ARTICLE.sections.map((section) => (
        <section aria-labelledby={`a-${section.anchor}`}>
          <h2 id={`a-${section.anchor}`}>{section.heading[lang]}</h2>
          {section.body[lang].map((paragraph) => <p>{paragraph}</p>)}
        </section>
      ))}
    </article>
  </main>
</SiteLayout>
```

- [ ] **Step 3: Add the styles**

In `src/styles/site.css`, next to `.oncall` (≈ line 2037):

```css
.article {
  padding-block: var(--space-8, 32px);
}
.article__stamp {
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.article__lead {
  font-size: 1.2rem;
  color: var(--muted);
}
.article h2 {
  margin-top: 2rem;
}
```

(Use the design tokens already defined in the file; `--space-8` is a safe fallback only if the token is absent — prefer the real token used by nearby rules.)

- [ ] **Step 4: Verify build + copy parity**

Run: `npm run check && npm run build`
Expected: `dist/en/writing/rag-eval-gate/index.html` (and `es`/`ca`) exist.

- [ ] **Step 5: Run the e2e head tests**

Run: `npx playwright test tests/seo-head.spec.ts`
Expected: PASS — canonical/hreflang on all three locales and the `Article` JSON-LD assertions.

- [ ] **Step 6: Commit**

```bash
git add "src/pages/[lang]/writing/rag-eval-gate.astro" src/styles/site.css tests/seo-head.spec.ts
git commit -m "feat(writing): publish the rag-eval-gate essay page"
```

---

### Task 4: llms.txt / llms-full.txt discovery

**Files:**
- Modify: `src/lib/llms.ts`, `src/pages/llms.txt.ts`
- Test: `src/lib/llms.spec.ts`, `src/lib/llms-endpoint.spec.ts`, snapshot

**Interfaces:**
- Consumes: `ARTICLE`, `PAGES['article-rag-eval-gate']` via `dirRoute`.
- Produces: `LlmsArticleRef`, `LlmsData.article`; new `## Writing` section.

- [ ] **Step 1: Write the failing tests**

In `src/lib/llms.spec.ts`, add to the `base: LlmsData` fixture:

```ts
  article: {
    title: 'RAG without an eval gate is a demo.',
    summary: 'Why a public golden set and a CI floor of 0.409 matter.',
    route: 'writing/rag-eval-gate/',
  },
```

Add assertions in `describe('buildLlmsTxt()')`:

```ts
  it('links the essay from the key pages', () => {
    expect(buildLlmsTxt(base)).toContain(
      '- [Writing: RAG without an eval gate is a demo.](https://jordimp.net/en/writing/rag-eval-gate/) — Why a public golden set and a CI floor of 0.409 matter.',
    );
  });
```

Add an assertion in `describe('buildLlmsFullTxt()')`:

```ts
  it('carries the Writing section with the linked essay', () => {
    const text = buildLlmsFullTxt(base);
    expect(text).toContain('## Writing');
    expect(text).toContain(
      '- [RAG without an eval gate is a demo.](https://jordimp.net/en/writing/rag-eval-gate/) — Why a public golden set and a CI floor of 0.409 matter.',
    );
  });
```

In `src/lib/llms-endpoint.spec.ts`, add `'## Writing'` to the section list array and assert:

```ts
  it('carries the essay through the real content module', () => {
    expect(text).toContain('## Writing');
    expect(text).toContain(
      '- [RAG without an eval gate is a demo.](https://jordimp.net/en/writing/rag-eval-gate/)',
    );
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/llms.spec.ts src/lib/llms-endpoint.spec.ts`
Expected: FAIL — missing `article` property / missing `## Writing`.

- [ ] **Step 3: Extend `src/lib/llms.ts`**

Add the interface and field:

```ts
export interface LlmsArticleRef {
  readonly title: string;
  readonly summary: string;
  readonly route: string;
}

export interface LlmsData {
  // ...existing fields...
  readonly article: LlmsArticleRef;
}
```

Add a helper next to `casePagesLine`:

```ts
function articleLine(data: LlmsData): string {
  return `- [Writing: ${data.article.title}](${SITE_URL}/en/${data.article.route}) — ${data.article.summary}`;
}
```

In `buildLlmsTxt`, append `${articleLine(data)}` to the Key pages block (after the CV line). In `buildLlmsFullTxt`, insert a section before `## Pages`:

```ts
## Writing

- [${data.article.title}](${SITE_URL}/en/${data.article.route}) — ${data.article.summary}
```

- [ ] **Step 4: Build the ref from the content module**

In `src/pages/llms.txt.ts`, import `ARTICLE` and add to the returned object:

```ts
    article: {
      title: ARTICLE.title.en,
      summary: ARTICLE.description.en,
      route: dirRoute(PAGES['article-rag-eval-gate'].route),
    },
```

- [ ] **Step 5: Update the endpoint snapshot**

Run: `npx vitest run -u src/lib/llms-endpoint.spec.ts`
Then re-run without `-u` to confirm green: `npx vitest run src/lib/llms-endpoint.spec.ts`.

- [ ] **Step 6: Verify the built files**

Run: `npm run build`
Expected: `dist/llms.txt` and `dist/llms-full.txt` each contain the Markdown link to `/en/writing/rag-eval-gate/`. The link invariants tests (no raw `https://` outside Markdown links) still pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/llms.ts src/lib/llms.spec.ts src/lib/llms-endpoint.spec.ts src/pages/llms.txt.ts src/lib/__snapshots__/llms-endpoint.spec.ts.snap
git commit -m "feat(llms): list the rag-eval essay in the discovery files"
```

---

### Task 5: Cross-links from F3 Research and CodebaseRAG

**Files:**
- Modify: `src/pages/[lang]/departments/[dept].astro`, `src/pages/[lang]/projects/[slug].astro`, `src/styles/site.css`
- Test: `tests/departments.spec.ts`, `tests/cases.spec.ts`

**Interfaces:**
- Consumes: `ARTICLE`, `PAGES['article-rag-eval-gate'].route`, `dirRoute`, `srcPath`.

- [ ] **Step 1: Write the failing e2e assertions**

In `tests/departments.spec.ts` (research test), add:

```ts
      const essay = page.locator('aside.article-callout a.case');
      await expect(essay).toHaveAttribute('href', '/en/writing/rag-eval-gate/');
      await expect(page.locator('aside.article-callout h3')).toHaveText(
        'RAG without an eval gate is a demo.',
      );
```

In `tests/cases.spec.ts` (codebaserag block), add:

```ts
      const essay = page.locator('aside.article-callout a.case');
      await expect(essay).toHaveAttribute('href', `/${lang}/writing/rag-eval-gate/`);
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx playwright test tests/departments.spec.ts tests/cases.spec.ts`
Expected: FAIL — no `.article-callout` yet.

- [ ] **Step 3: Add the research callout**

In `src/pages/[lang]/departments/[dept].astro`, add `ARTICLE` to the `../../../data/content` import. Replace the `{deptKey === 'research' && (...)}` block with:

```astro
    {deptKey === 'research' && (
      <>
        <aside class="article-callout" aria-labelledby="f3-writing">
          <p class="article-callout__stamp mono">{`${ARTICLE.dateLabel[lang]} ${ARTICLE.date} · ${ARTICLE.revision}`}</p>
          <h3 id="f3-writing">{ARTICLE.title[lang]}</h3>
          <p>{ARTICLE.relatedBody[lang]}</p>
          <a class="case" href={srcPath(lang, dirRoute(PAGES['article-rag-eval-gate'].route))}>
            {ARTICLE.readLabel[lang]} <span aria-hidden="true">&rarr;</span>
          </a>
        </aside>
        <section class="section">
          <div class="cards cards--single">
            {d.projects.map((slug) => <DeptCard lang={lang} project={project(slug)} />)}
          </div>
          <BackBuilding lang={lang} />
        </section>
      </>
    )}
```

- [ ] **Step 4: Add the CodebaseRAG case callout**

In `src/pages/[lang]/projects/[slug].astro`, add `ARTICLE` to the `../../../data/content` import and render before the CTA block:

```astro
    {p.slug === 'codebaserag' && (
      <aside class="article-callout" aria-labelledby="cb-essay">
        <h3 id="cb-essay">{ARTICLE.title[lang]}</h3>
        <p>{ARTICLE.relatedBody[lang]}</p>
        <a class="case" href={srcPath(lang, dirRoute(PAGES['article-rag-eval-gate'].route))}>
          {ARTICLE.readLabel[lang]} <span aria-hidden="true">&rarr;</span>
        </a>
      </aside>
    )}
```

- [ ] **Step 5: Style the callout**

In `src/styles/site.css`, next to `.oncall`:

```css
.article-callout {
  margin-block: var(--space-8, 32px);
  padding: var(--space-6, 24px);
  border-left: 3px solid var(--accent);
  background: var(--surface);
}
.article-callout__stamp {
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.article-callout h3 {
  margin-block: var(--space-2, 8px);
}
```

- [ ] **Step 6: Verify**

Run: `npm run build && npx playwright test tests/departments.spec.ts tests/cases.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add "src/pages/[lang]/departments/[dept].astro" "src/pages/[lang]/projects/[slug].astro" src/styles/site.css tests/departments.spec.ts tests/cases.spec.ts
git commit -m "feat(writing): cross-link the essay from research and CodebaseRAG"
```

---

### Task 6: e2e route matrix and fixture regeneration

**Files:**
- Modify: `tests/smoke.spec.ts`
- Regenerate: `tests/fixtures/parity.json`

**Interfaces:**
- Consumes: the built site from Tasks 3–5.
- Produces: a green 68-page sweep.

- [ ] **Step 1: Update the smoke route matrix**

In `tests/smoke.spec.ts`:

```ts
const STATIC_ROUTES = ['', 'cv', 'projects', 'writing/rag-eval-gate'];
```

Update the hardcoded counts:

- `expect(SWEEP_TARGETS).toHaveLength(65);` → `68`
- inside the per-locale parity test: `expect(routes).toHaveLength(21);` → `22`

(`localeRoutes()` now yields 22 routes × 3 locales = 66, plus `/` and `/nonexistent/` = 68.
`qa:content` needs no edit — it derives from `PAGES`.)

- [ ] **Step 2: Build and regenerate the fixture**

```bash
npm run build
npm run distill:parity
```

- [ ] **Step 3: Review the fixture diff (mandatory)**

```bash
git diff --stat tests/fixtures/parity.json
git diff tests/fixtures/parity.json
```

Expected, nothing else:

1. `_meta.counts.localeRoutes` `63 → 66`; `_meta.counts.pages` `65 → 68`.
2. Three new `routes` entries: `/en/writing/rag-eval-gate/`,
   `/es/writing/rag-eval-gate/`, `/ca/writing/rag-eval-gate/`.
3. `mainText` changes only on `/…/departments/research/` and
   `/…/projects/codebaserag/` (new callouts), all three locales.
4. Every other route entry byte-identical.

If any other route changed, stop and fix the cause — do not accept the diff.

- [ ] **Step 4: Run the full gate**

```bash
./harness/init.sh
npm run check
npm run build
npm run test:e2e
npm run qa:content
npm run qa:links
npm run qa:lighthouse
```

Expected: unit green; check 0 errors; 68-page Playwright sweep with zero console errors;
`qa:content` census 66 locale pages + 2 root; `qa:links` green; Lighthouse thresholds
unchanged (`performance ≥ 0.90`, `accessibility/best-practices/SEO ≥ 0.95`). Confirm
`git diff src/data/quality.json` is empty.

- [ ] **Step 5: Commit**

```bash
git add tests/smoke.spec.ts tests/fixtures/parity.json
git commit -m "test(parity): regenerate oracle for the essay route"
```

---

### Task 7: Record the external CodebaseRAG ADR cross-reference

**Files:**
- Modify: `harness/progress/current.md` (session log) and/or the PR description only.

- [ ] **Step 1: Document the cross-reference**

State in the progress entry: the essay is the reader-facing twin of the CodebaseRAG
repository's 1-page ADR “Why CI-gated retrieval, not a chatbot demo”; the repo ADR links
back to `https://jordimp.net/en/writing/rag-eval-gate/`; the ADR editorial workflow is
owned by the external CodebaseRAG plan and is not duplicated here.

- [ ] **Step 2: Commit (if the wording lives in a tracked doc)**

```bash
git add harness/progress/current.md
git commit -m "docs: cross-reference the codebaserag ADR with the published essay"
```

---

## Self-Review (done at plan-writing time)

- **Spec coverage:** R1 (T3/T6), R2 (T1), R3 (T1/T3/T6), R4 (T1/T3), R5 (T1/T6), R6 (T1),
  R7 (T1/T3), R8 (T1), R9/R10/R11 (T1), R12 (T3), R13 (T2/T3/T6), R14 (T4/T6), R15/R16
  (T5/T6), R17 (T3/T6). Every requirement has at least one test and one implementation
  artifact.
- **Placeholders:** none. The full EN copy is inline; es/ca is fully specified for titles,
  labels, description and callout, with a precise translation rule for the long paragraphs
  and the exact tokens that must survive verbatim. All code steps show code.
- **Type consistency:** `ArticleSection.anchor` is the union used by the section loop and
  tests; `ArticleInput` is identical in `seo.ts`, `SEO.astro`, `SiteLayout.astro` and the
  page; `LlmsArticleRef` fields (`title`, `summary`, `route`) match `llmsData()` and the
  tests; `PAGES['article-rag-eval-gate'].route` is the single source of the route string.
- **Counts:** the two hardcoded smoke expectations (21→22, 65→68) are called out explicitly;
  everything else derives from `PAGES` or the built tree.
