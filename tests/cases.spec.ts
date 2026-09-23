import { expect, test, type Page } from '@playwright/test';
import {
  ARTICLE,
  BREADCRUMB_DEPTS,
  BREADCRUMB_HOME,
  CASE_BUILD,
  CASE_NOTES,
  CASE_UI,
  DEPTS,
  LOCALES,
  PAGES,
  PROJECTS,
  project,
  tierProjects,
} from '../src/data/content';
import type { Locale } from '../src/data/types';

const caseRoute = (lang: Locale, slug: string): string => `/${lang}/projects/${slug}/`;

async function readBreadcrumbJsonLd(page: Page): Promise<{
  itemListElement: Array<{ position: number; item: string; name: string }>;
}> {
  const scripts = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) =>
      JSON.parse(s.textContent ?? '{}'),
    ),
  );
  return scripts.find((entry) => entry['@type'] === 'BreadcrumbList');
}

test.describe('case pages (T7)', () => {
  for (const lang of LOCALES) {
    const p = project('codebaserag');
    const dept = DEPTS[p.dept];
    const route = caseRoute(lang, p.slug);

    test(`renders the spike case structure at ${route}`, async ({ page }) => {
      await page.goto(route);

      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      expect(await page.title()).toBe(PAGES[`project-${p.slug}`].title[lang]);

      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
      await expect(page.locator('meta[property="article:section"]')).toHaveAttribute(
        'content',
        dept.name[lang],
      );

      await expect(page.locator('.navbar__links a[aria-current="page"]')).toHaveAttribute(
        'href',
        `/${lang}/#building`,
      );
      await expect(page.locator('.navbar__lang a[aria-current="true"]')).toHaveAttribute(
        'href',
        route,
      );

      const breadcrumb = page.locator('nav.breadcrumb[aria-label="Breadcrumb"]');
      const crumbs = breadcrumb.locator('a');
      await expect(crumbs).toHaveCount(3);
      await expect(crumbs.nth(0)).toHaveText(BREADCRUMB_HOME[lang]);
      await expect(crumbs.nth(0)).toHaveAttribute('href', `/${lang}/`);
      await expect(crumbs.nth(1)).toHaveText(BREADCRUMB_DEPTS[lang]);
      await expect(crumbs.nth(1)).toHaveAttribute('href', `/${lang}/#building`);
      await expect(crumbs.nth(2)).toHaveText(dept.name[lang]);
      await expect(crumbs.nth(2)).toHaveAttribute('href', `/${lang}/departments/research/`);
      await expect(breadcrumb.locator('span[aria-current="page"]')).toHaveText(p.name);

      await expect(page.locator('.case-hero__floor span').first()).toHaveText(
        `DEPT·${dept.code} — ${dept.name[lang].toUpperCase()}`,
      );
      await expect(page.locator('.case-hero__year')).toHaveText(String(p.year));
      await expect(page.locator('h1#page-title')).toHaveText(p.name);
      await expect(page.locator('.case-hero .stand')).toHaveText(p.summary[lang]);
      await expect(page.locator('.case-hero__motif svg.b-svg')).toHaveAttribute(
        'viewBox',
        '0 0 132 96',
      );

      await expect(page.locator('h2#cs-brief')).toHaveText(CASE_UI.brief[lang]);
      await expect(page.locator('.case-brief')).toHaveText(p.problem[lang]);

      await expect(page.locator('h2#cs-built')).toHaveText(CASE_UI.built[lang]);
      const buildSteps = (CASE_BUILD[p.slug] ?? p.highlights)[lang];
      const buildLog = page.locator('ol.buildlog > li');
      await expect(buildLog).toHaveCount(buildSteps.length);
      await expect(buildLog.nth(0).locator('.n')).toHaveText('01');
      await expect(buildLog.nth(1).locator('.n')).toHaveText('02');
      await expect(buildLog.nth(2).locator('.n')).toHaveText('03');
      await expect(buildLog.nth(0).locator('p')).toHaveText(buildSteps[0]);

      await expect(page.locator('h2#cs-metrics')).toHaveText(CASE_UI.metrics[lang]);
      const stats = page.locator('.stats .stat');
      await expect(stats).toHaveCount(p.metrics.length);
      await expect(stats.nth(0).locator('b')).toHaveText(p.metrics[0].value);
      await expect(stats.nth(0).locator('span')).toHaveText(p.metrics[0].label[lang]);

      await expect(page.locator('h2#cs-stack')).toHaveText(CASE_UI.stack[lang]);
      const chips = page.locator('.chiprow .chip3');
      await expect(chips).toHaveCount(p.stack.length);
      await expect(chips.nth(0)).toHaveText(p.stack[0]);

      const essay = page.locator('aside.article-callout a.case');
      await expect(essay).toHaveAttribute('href', `/${lang}/writing/rag-eval-gate/`);
      await expect(page.locator('aside.article-callout h3')).toHaveText(ARTICLE.title[lang]);

      const cta = page.locator('.case-cta a.btn--y');
      await expect(cta).toHaveAttribute('href', p.github);
      await expect(cta).toHaveAttribute('target', '_blank');
      await expect(cta).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(cta.locator('.btn__label')).toHaveText(CASE_UI.visitRepo[lang]);
      await expect(cta.locator('span[aria-hidden="true"]')).toHaveText('↗');

      const pager = page.locator('nav.pager');
      await expect(pager).toHaveAttribute('aria-label', CASE_UI.pagerLabel[lang]);
      const prevLink = pager.locator('a.pager__link').first();
      const nextLink = pager.locator('a.pager__link--end');
      await expect(prevLink).toHaveAttribute('href', caseRoute(lang, 'harness-standard'));
      await expect(prevLink.locator('.pager__k')).toHaveText(CASE_UI.prev[lang]);
      await expect(prevLink.locator('.pager__name')).toHaveText(project('harness-standard').name);
      await expect(nextLink).toHaveAttribute('href', caseRoute(lang, 'kafka-adapter-telemetry'));
      await expect(nextLink.locator('.pager__k')).toHaveText(CASE_UI.next[lang]);
      await expect(nextLink.locator('.pager__name')).toHaveText(project('kafka-adapter-telemetry').name);

      await expect(page.locator('.pager-back a.case')).toHaveAttribute(
        'href',
        `/${lang}/departments/research/`,
      );
      await expect(page.locator('.pager-back a.case')).toHaveText(
        `${CASE_UI.backDept[lang].replace('{dept}', dept.name[lang])} ↑`,
      );

      const breadcrumbLd = await readBreadcrumbJsonLd(page);
      expect(breadcrumbLd?.itemListElement).toHaveLength(4);
      expect(breadcrumbLd?.itemListElement[1]).toMatchObject({
        position: 2,
        name: BREADCRUMB_DEPTS[lang],
        item: `https://jordimp.net/${lang}/#building`,
      });
      expect(breadcrumbLd?.itemListElement[3]).toMatchObject({
        position: 4,
        name: p.name,
        item: `https://jordimp.net${route}`,
      });
    });
  }

  test('navigates to the next project through the pager (en)', async ({ page }) => {
    await page.goto(caseRoute('en', 'codebaserag'));
    await page.locator('nav.pager a.pager__link--end').click();
    await expect(page).toHaveURL(new RegExp('/en/projects/kafka-adapter-telemetry/$'));
    await expect(page.locator('h1#page-title')).toHaveText('Kafka Adapter Telemetry');
  });

  test('pages each case within its tier cohort without self-links', async ({ page }) => {
    for (const lang of LOCALES) {
      for (const p of PROJECTS) {
        await page.goto(caseRoute(lang, p.slug));
        const pager = page.locator('nav.pager');
        const prevLink = pager.locator('a.pager__link').first();
        const nextLink = pager.locator('a.pager__link--end');
        const cohort = tierProjects(p.tier).map((c) => c.slug);
        const idx = cohort.indexOf(p.slug);
        const prev = cohort[(idx - 1 + cohort.length) % cohort.length];
        const next = cohort[(idx + 1) % cohort.length];
        await expect(prevLink).toHaveAttribute('href', caseRoute(lang, prev));
        await expect(nextLink).toHaveAttribute('href', caseRoute(lang, next));
        expect(prev).not.toBe(p.slug);
        expect(next).not.toBe(p.slug);
      }
    }
  });

  test('shows field notes instead of metrics for projects without metrics', async ({ page }) => {
    for (const lang of LOCALES) {
      await page.goto(caseRoute(lang, 'bible-text-analysis'));
      await expect(page.locator('h2#cs-notes')).toHaveText(CASE_UI.fieldNotes[lang]);
      const notes = page.locator('ul.fieldnotes > li');
      await expect(notes).toHaveCount(CASE_NOTES['bible-text-analysis'][lang].length);
      await expect(notes.nth(0).locator('.fn-k')).toHaveText(
        CASE_NOTES['bible-text-analysis'][lang][0].k,
      );
      await expect(page.locator('.stats')).toHaveCount(0);
      await expect(page.locator('h2#cs-metrics')).toHaveCount(0);
    }
  });

  test('every case page responds 200 and opens its repo in a new tab', async ({ request }) => {
    for (const lang of LOCALES) {
      for (const p of PROJECTS) {
        const response = await request.get(caseRoute(lang, p.slug));
        expect(response.ok(), `${lang}/${p.slug} → ${response.status()}`).toBe(true);
        if (lang === 'en') {
          const body = await response.text();
          expect(body).toContain(
            `href="${p.github}" target="_blank" rel="noopener noreferrer"`,
          );
          expect(body).toContain(`class="btn__label">${CASE_UI.visitRepo[lang]}`);
        }
      }
    }
  });

  test('keeps the trilingual titles distinct across locales', async ({ page }) => {
    const titles: string[] = [];
    for (const lang of LOCALES) {
      await page.goto(caseRoute(lang, 'codebaserag'));
      titles.push(await page.title());
    }
    expect(new Set(titles).size).toBe(3);
    expect(titles[0]).toBe(PAGES['project-codebaserag'].title.en);
    expect(titles[1]).toBe(PAGES['project-codebaserag'].title.es);
    expect(titles[2]).toBe(PAGES['project-codebaserag'].title.ca);
  });
});
