import { expect, test, type Page } from '@playwright/test';
import { PAGES, project } from '../src/data/content';
import type { Locale } from '../src/data/types';

interface HeadSnapshot {
  readonly title: string;
  readonly description: string;
  readonly canonical: string;
  readonly hreflang: ReadonlyArray<{ readonly hreflang: string; readonly href: string }>;
  readonly og: Readonly<Record<string, string>>;
  readonly twitter: Readonly<Record<string, string>>;
  readonly noindex: boolean;
  readonly jsonLdTypes: readonly string[];
}

async function readHead(page: Page): Promise<HeadSnapshot> {
  return page.evaluate(() => {
    const meta = (selector: string): string =>
      document.querySelector(selector)?.getAttribute('content') ?? '';
    const og: Record<string, string> = {};
    for (const node of Array.from(document.querySelectorAll('meta[property^="og:"], meta[property^="article:"]'))) {
      const property = node.getAttribute('property') ?? '';
      og[property] = node.getAttribute('content') ?? '';
    }
    const twitter: Record<string, string> = {};
    for (const node of Array.from(document.querySelectorAll('meta[name^="twitter:"]'))) {
      twitter[node.getAttribute('name') ?? ''] = node.getAttribute('content') ?? '';
    }
    const jsonLdTypes = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    ).map((script) => String(JSON.parse(script.textContent ?? '{}')['@type']));
    return {
      title: document.title,
      description: meta('meta[name="description"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
      hreflang: Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map(
        (link) => ({
          hreflang: link.getAttribute('hreflang') ?? '',
          href: link.getAttribute('href') ?? '',
        }),
      ),
      og,
      twitter,
      noindex: Boolean(document.querySelector('meta[name="robots"][content*="noindex"]')),
      jsonLdTypes,
    };
  });
}

const prod = (lang: Locale, route: string): string => `https://jordimp.net/${lang}/${route}`;

const OG_LOCALE: Record<Locale, string> = { en: 'en_US', es: 'es_ES', ca: 'ca_ES' };

const REPRESENTATIVE_ROUTES: ReadonlyArray<{ readonly lang: Locale; readonly route: string }> = [
  { lang: 'en', route: '' },
  { lang: 'es', route: '' },
  { lang: 'ca', route: '' },
  { lang: 'en', route: `projects/${project('codebaserag').slug}/` },
  { lang: 'es', route: `projects/${project('codebaserag').slug}/` },
  { lang: 'en', route: 'departments/telemetry/' },
  { lang: 'en', route: 'cv/' },
  { lang: 'en', route: 'blog/' },
  { lang: 'en', route: 'blog/which-local-model-for-coding-agents/' },
  { lang: 'es', route: 'blog/which-local-model-for-coding-agents/' },
  { lang: 'en', route: 'blog/rag-eval-gate/' },
  { lang: 'es', route: 'blog/rag-eval-gate/' },
  { lang: 'ca', route: 'blog/rag-eval-gate/' },
];

test.describe('SEO head emission on representative routes (T11, R17)', () => {
  for (const { lang, route } of REPRESENTATIVE_ROUTES) {
    test(`emits the full F3 head on /${lang}/${route}`, async ({ page }) => {
      await page.goto(`/${lang}/${route}`);
      const head = await readHead(page);

      expect(head.title.length).toBeGreaterThan(0);
      expect(head.description.length).toBeGreaterThan(0);
      expect(head.noindex).toBe(false);

      expect(head.canonical).toBe(prod(lang, route));
      expect(head.hreflang).toEqual(
        expect.arrayContaining([
          { hreflang: 'en', href: prod('en', route) },
          { hreflang: 'es', href: prod('es', route) },
          { hreflang: 'ca', href: prod('ca', route) },
          { hreflang: 'x-default', href: prod('en', route) },
        ]),
      );
      expect(head.hreflang).toHaveLength(4);

      expect(head.og['og:title']).toBe(head.title);
      expect(head.og['og:description']).toBe(head.description);
      expect(head.og['og:url']).toBe(prod(lang, route));
      expect(head.og['og:site_name']).toBe('JORDIMP & CO.');
      expect(head.og['og:locale']).toBe(OG_LOCALE[lang]);
      expect(head.og['og:image']).toBe('https://jordimp.net/og-building.png');

      expect(head.twitter['twitter:card']).toBe('summary_large_image');
      expect(head.twitter['twitter:title']).toBe(head.title);
      expect(head.twitter['twitter:image']).toBe('https://jordimp.net/og-building.png');

      expect(head.jsonLdTypes).toContain('Person');
      expect(head.jsonLdTypes).toContain('BreadcrumbList');
    });
  }

  test('marks case pages as article type with the department section', async ({ page }) => {
    await page.goto('/en/projects/codebaserag/');
    const head = await readHead(page);
    expect(head.og['og:type']).toBe('article');
    expect(head.og['article:section']).toBe('Research & Retrieval');
  });

  test('emits Article JSON-LD with the site person and the CodebaseRAG repo on the migrated essay (R15)', async ({
    page,
  }) => {
    await page.goto('/en/blog/rag-eval-gate/');
    const article = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((script) => JSON.parse(script.textContent ?? '{}'))
        .find((entry) => entry['@type'] === 'Article'),
    );
    expect(article.headline).toBe('RAG without an eval gate is a demo.');
    expect(article.author.name).toBe('Jordi Marçal Poy');
    expect(article.datePublished).toBe('2026-09-22');
    expect(article.about).toBe('https://github.com/jordimarsal/codebaserag');
  });

  test('emits Article JSON-LD with the ggufbench repo on the ggufbench post (R15)', async ({
    page,
  }) => {
    await page.goto('/en/blog/which-local-model-for-coding-agents/');
    const head = await readHead(page);
    expect(head.og['og:type']).toBe('article');
    expect(head.og['article:section']).toBe('Blog');
    const article = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((script) => JSON.parse(script.textContent ?? '{}'))
        .find((entry) => entry['@type'] === 'Article'),
    );
    expect(article.headline).toBe(
      'Which local model should a coding agent run? Six GGUFs and a Strata engine, one harness, receipts',
    );
    expect(article.author.name).toBe('Jordi Marçal Poy');
    expect(article.datePublished).toBe('2026-10-13');
    expect(article.about).toBe('https://github.com/jordimarsal/ggufbench');
  });

  test('renders the post h1, datestamp and scoreboard table on the ggufbench post (R10, R12, R14)', async ({
    page,
  }) => {
    await page.goto('/en/blog/which-local-model-for-coding-agents/');
    await expect(page.locator('main h1')).toHaveText(
      'Which local model should a coding agent run? Six GGUFs and a Strata engine, one harness, receipts',
    );
    await expect(page.locator('p.article__stamp.mono')).toHaveText('FILED 2026-10-13 · REV B');
    const header = page.locator('.table-scroll thead th');
    await expect(header).toHaveText([
      'model',
      'think',
      'tools',
      'code',
      'agent',
      'speed',
      'global',
    ]);
    await expect(page.locator('.table-scroll tbody tr')).toHaveCount(10);
    await expect(page.locator('.table-scroll tbody tr').first()).toContainText('minicpm-v-4.7-35b-a3b q4_k_m');
  });

  test('keeps the old essay URL alive as a noindex redirect stub (R5, R6)', async ({ page }) => {
    await page.route('/es/blog/rag-eval-gate/', (route) => route.fulfill({ status: 204 }));
    await page.goto('/es/writing/rag-eval-gate/');
    const head = await readHead(page);
    expect(head.noindex).toBe(true);
    expect(head.canonical).toBe(prod('es', 'blog/rag-eval-gate/'));
    const refresh = page.locator('meta[http-equiv="refresh"]');
    await expect(refresh).toHaveCount(1);
    await expect(refresh).toHaveAttribute('content', '0; url=/es/blog/rag-eval-gate/');
    const fallback = page.locator('main a[href="/es/blog/rag-eval-gate/"]');
    await expect(fallback).toHaveCount(1);
    await expect(fallback).toBeVisible();
    await expect(fallback).toContainText('LEE EL ENSAYO');
  });

  for (const lang of ['en', 'ca'] as const) {
    test(`keeps /${lang}/contact/ alive as a noindex redirect stub to the front desk (F16 R2, R3)`, async ({
      page,
    }) => {
      await page.route(`/${lang}/departments/front-desk/`, (route) =>
        route.fulfill({ status: 204 }),
      );
      await page.goto(`/${lang}/contact/`);
      const head = await readHead(page);
      expect(head.noindex).toBe(true);
      expect(head.canonical).toBe(prod(lang, 'departments/front-desk/'));
      const refresh = page.locator('meta[http-equiv="refresh"]');
      await expect(refresh).toHaveCount(1);
      await expect(refresh).toHaveAttribute(
        'content',
        `0; url=/${lang}/departments/front-desk/`,
      );
      expect(head.hreflang).toEqual([
        { hreflang: 'en', href: prod('en', 'departments/front-desk/') },
        { hreflang: 'es', href: prod('es', 'departments/front-desk/') },
        { hreflang: 'ca', href: prod('ca', 'departments/front-desk/') },
        { hreflang: 'x-default', href: prod('en', 'departments/front-desk/') },
      ]);
      const fallback = page.locator(`main a[href="/${lang}/departments/front-desk/"]`);
      await expect(fallback).toHaveCount(1);
      await expect(fallback).toBeVisible();
    });
  }

  test('marks non-case pages as website type without article section', async ({ page }) => {
    await page.goto('/en/departments/telemetry/');
    const head = await readHead(page);
    expect(head.og['og:type']).toBe('website');
    expect(head.og['article:section']).toBeUndefined();
  });

  test('uses the canonical content-module titles and descriptions', async ({ page }) => {
    await page.goto('/en/');
    const head = await readHead(page);
    expect(head.title).toBe(PAGES.home.title.en);
    expect(head.description).toBe(PAGES.home.description.en);

    await page.goto('/es/cv/');
    const cvHead = await readHead(page);
    expect(cvHead.title).toBe(PAGES.cv.title.es);
    expect(cvHead.description).toBe(PAGES.cv.description.es);
  });
});
