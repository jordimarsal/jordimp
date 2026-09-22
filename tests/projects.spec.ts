import { expect, test } from '@playwright/test';
import { PROJECTS, TIER_ORDER, tierProjects, WORK } from '../src/data/content';
import type { Locale } from '../src/lib/i18n';

const ROUTES = ['/en/projects/', '/es/projects/', '/ca/projects/'] as const;

const EXPECTED: Record<
  (typeof ROUTES)[number],
  {
    lang: Locale;
    title: string;
    crumbHome: string;
    sub: string;
    summary: string;
    all: string;
    initialStatus: string;
    oneStatus: string;
    twoStatus: string;
    emptyStatus: string;
    github: string;
  }
> = {
  '/en/projects/': {
    lang: 'en',
    title: 'Projects — Jordimp & Co.',
    crumbHome: 'Home',
    sub: '11 PROJECTS · 3 TIERS · FILTER BY STACK',
    summary: 'FILTER BY STACK (42)',
    all: 'All',
    initialStatus: '11 PROJECTS ON SHOW',
    oneStatus: '1 PROJECT ON SHOW',
    twoStatus: '2 PROJECTS ON SHOW',
    emptyStatus: 'NO PROJECTS MATCH THAT COMBINATION — LOOSEN A FILTER',
    github: 'View on GitHub',
  },
  '/es/projects/': {
    lang: 'es',
    title: 'Proyectos — Jordimp & Co.',
    crumbHome: 'Inicio',
    sub: '11 PROYECTOS · 3 NIVELES · FILTRA POR STACK',
    summary: 'FILTRA POR STACK (42)',
    all: 'Todos',
    initialStatus: '11 PROYECTOS A LA VISTA',
    oneStatus: '1 PROYECTO A LA VISTA',
    twoStatus: '2 PROYECTOS A LA VISTA',
    emptyStatus: 'NINGÚN PROYECTO COINCIDE CON ESA COMBINACIÓN — QUITA ALGÚN FILTRO',
    github: 'Ver en GitHub',
  },
  '/ca/projects/': {
    lang: 'ca',
    title: 'Projectes — Jordimp & Co.',
    crumbHome: 'Inici',
    sub: '11 PROJECTES · 3 NIVELLS · FILTRA PER STACK',
    summary: 'FILTRA PER STACK (42)',
    all: 'Tots',
    initialStatus: '11 PROJECTES A LA VISTA',
    oneStatus: '1 PROJECTE A LA VISTA',
    twoStatus: '2 PROJECTES A LA VISTA',
    emptyStatus: 'CAP PROJECTE COINCIDEIX AMB AQUESTA COMBINACIÓ — TREU ALGUN FILTRE',
    github: 'Veure a GitHub',
  },
};

const UNIQUE_STACKS = new Set(PROJECTS.flatMap((p) => p.stack)).size;

async function readBreadcrumbJsonLd(page: import('@playwright/test').Page): Promise<{
  itemListElement: Array<{ position: number; item: string; name: string }>;
}> {
  const scripts = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) =>
      JSON.parse(s.textContent ?? '{}'),
    ),
  );
  return scripts.find((entry) => entry['@type'] === 'BreadcrumbList');
}

test.describe('projects index page (T6)', () => {
  for (const route of ROUTES) {
    const expected = EXPECTED[route];

    test(`renders the spike structure at ${route}`, async ({ page }) => {
      await page.goto(route);

      await expect(page.locator('html')).toHaveAttribute('lang', expected.lang);
      expect(await page.title()).toBe(expected.title);

      await expect(
        page.locator(`.navbar__links a[href="${route}"]`),
      ).toHaveAttribute('aria-current', 'page');
      await expect(page.locator('.navbar [data-night-toggle]')).toHaveCount(1);
      await expect(page.locator('.navbar__lang a[aria-current="true"]')).toHaveAttribute(
        'href',
        route,
      );

      const breadcrumb = page.locator('nav.breadcrumb[aria-label="Breadcrumb"]');
      await expect(breadcrumb.locator('a')).toHaveText(expected.crumbHome);
      await expect(breadcrumb.locator('a')).toHaveAttribute('href', `/${expected.lang}/`);
      await expect(breadcrumb.locator('span[aria-current="page"]')).toHaveText(
        expected.title.replace(` — Jordimp & Co.`, ''),
      );

      const head = page.locator('.sec-head');
      await expect(head.locator('.sec-head__num')).toHaveText('P');
      await expect(page.locator('h1#page-title')).toHaveText(
        expected.title.replace(` — Jordimp & Co.`, ''),
      );
      await expect(head.locator('.sec-head__sub')).toHaveText(expected.sub);

      await expect(page.locator('main > p.prose')).not.toBeEmpty();
      await expect(page.locator('main > p.prose')).toHaveText(WORK.intro[expected.lang]);

      const details = page.locator('details.filter-wrap[data-filter-wrap]');
      await expect(details).toHaveAttribute('open', '');
      await expect(details.locator('summary')).toHaveText(expected.summary);
      const chips = page.locator('.filter-chips');
      await expect(chips).toHaveAttribute('role', 'group');
      await expect(chips).toHaveAttribute('aria-label', expected.summary);
      await expect(chips.locator('button[data-stack]')).toHaveCount(UNIQUE_STACKS);
      await expect(chips.locator('button[data-stack][aria-pressed="true"]')).toHaveCount(0);
      const reset = chips.locator('button[data-reset]');
      await expect(reset).toHaveText(expected.all);
      await expect(reset).toHaveAttribute('aria-pressed', 'true');

      const status = page.locator('#filter-status');
      await expect(status).toHaveAttribute('role', 'status');
      await expect(status).toHaveAttribute('aria-live', 'polite');
      await expect(status).toHaveAttribute('data-count-label', /\{n\}/);
      await expect(status).toHaveAttribute('data-one-label', /.+/);
      await expect(status).toHaveAttribute('data-empty-label', /.+/);
      await expect(status).toHaveText(expected.initialStatus);

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

      const cards = page.locator('section.cards--tier article.card');
      const ordered = TIER_ORDER.flatMap((tier) => tierProjects(tier));
      await expect(cards).toHaveCount(ordered.length);
      for (let i = 0; i < ordered.length; i++) {
        await expect(cards.nth(i)).toHaveAttribute('data-stack', /.+/);
        await expect(cards.nth(i).locator('h3')).toHaveText(ordered[i].name);
        const repo = cards.nth(i).locator('a.case');
        await expect(repo).toHaveAttribute('target', '_blank');
        await expect(repo).toHaveAttribute('rel', 'noopener noreferrer');
        await expect(repo).toContainText(expected.github);
        await expect(repo).toHaveAttribute('aria-label', `${ordered[i].name} — ${expected.github}`);
      }

      await expect(page.locator('.footer-desk#desk')).toHaveCount(1);

      const breadcrumbLd = await readBreadcrumbJsonLd(page);
      expect(breadcrumbLd?.itemListElement).toHaveLength(2);
      expect(breadcrumbLd?.itemListElement[0]).toMatchObject({
        position: 1,
        item: `https://jordimp.net/${expected.lang}/`,
      });
      expect(breadcrumbLd?.itemListElement[1]).toMatchObject({
        position: 2,
        item: `https://jordimp.net${route}`,
      });
    });
  }

  test('auto-opens the filter above 760px and keeps it collapsed at 390px', async ({ page }) => {
    await page.goto('/en/projects/');
    await expect(page.locator('details.filter-wrap')).toHaveAttribute('open', '');

    const mobile = await page.context().browser()!.newContext({
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await mobile.newPage();
    await mobilePage.goto('/en/projects/');
    await expect(mobilePage.locator('details.filter-wrap')).not.toHaveAttribute('open');
    await expect(mobilePage.locator('details.filter-wrap summary')).toBeVisible();
    await mobile.close();
  });

  test('filters by a single stack with the one-count label (en)', async ({ page }) => {
    await page.goto('/en/projects/');
    const annexCards = page.locator('section[data-tier="annex"] article.card');
    const shown = page.locator('section.cards--tier article.card:not([hidden])');
    const status = page.locator('#filter-status');
    const reset = page.locator('.filter-chips button[data-reset]');

    await expect(shown).toHaveCount(PROJECTS.length);

    const rust = page.locator('.filter-chips button[data-stack="Rust"]');
    await rust.click();
    await expect(rust).toHaveAttribute('aria-pressed', 'true');
    await expect(reset).toHaveAttribute('aria-pressed', 'false');
    await expect(shown).toHaveCount(1);
    await expect(annexCards.nth(2).locator('h3')).toHaveText('Rustcut');
    await expect(status).toHaveText(EXPECTED['/en/projects/'].oneStatus);
  });

  test('hides tier groups whose cards all filter out (en)', async ({ page }) => {
    await page.goto('/en/projects/');
    const thesis = page.locator('section.cards--tier[data-tier="thesis"]');
    const satellite = page.locator('section.cards--tier[data-tier="satellite"]');
    const annex = page.locator('section.cards--tier[data-tier="annex"]');

    await page.locator('.filter-chips button[data-stack="Rust"]').click();

    await expect(annex).not.toHaveAttribute('hidden', '');
    await expect(satellite).toHaveAttribute('hidden', '');
    await expect(thesis).toHaveAttribute('hidden', '');
  });

  test('OR-matches a multi-select union and resets (en)', async ({ page }) => {
    await page.goto('/en/projects/');
    const satelliteCards = page.locator('section[data-tier="satellite"] article.card');
    const annexCards = page.locator('section[data-tier="annex"] article.card');
    const shown = page.locator('section.cards--tier article.card:not([hidden])');
    const status = page.locator('#filter-status');
    const reset = page.locator('.filter-chips button[data-reset]');

    await page.locator('.filter-chips button[data-stack="Rust"]').click();
    const whisper = page.locator('.filter-chips button[data-stack="Whisper"]');
    await whisper.click();
    await expect(whisper).toHaveAttribute('aria-pressed', 'true');

    await expect(shown).toHaveCount(2);
    await expect(satelliteCards.nth(0).locator('h3')).toHaveText('Interview Simulator');
    await expect(annexCards.nth(2).locator('h3')).toHaveText('Rustcut');
    await expect(status).toHaveText(EXPECTED['/en/projects/'].twoStatus);

    await whisper.click();
    await expect(whisper).toHaveAttribute('aria-pressed', 'false');
    await expect(shown).toHaveCount(1);
    await expect(status).toHaveText(EXPECTED['/en/projects/'].oneStatus);

    await page.locator('.filter-chips button[data-stack="MCP"]').click();
    await expect(shown).toHaveCount(2);
    await expect(status).toHaveText(EXPECTED['/en/projects/'].twoStatus);

    await page.locator('.filter-chips button[data-stack="Rust"]').click();
    await expect(shown).toHaveCount(1);

    // Zero-count branch: with OR matching, a chip derived from card stacks always
    // matches at least one card, so the empty state is defensive — force it by
    // stripping Rust from every card, then filter on Rust (apply() re-reads the
    // attribute on each pass, exactly like the spike).
    await page.evaluate(() => {
      document.querySelectorAll('section.cards--tier article.card').forEach((card) => {
        card.setAttribute(
          'data-stack',
          (card.getAttribute('data-stack') ?? '')
            .split('|')
            .filter((s) => s !== 'Rust')
            .join('|'),
        );
      });
    });
    await reset.click();
    await page.locator('.filter-chips button[data-stack="Rust"]').click();
    await expect(shown).toHaveCount(0);
    await expect(status).toHaveText(EXPECTED['/en/projects/'].emptyStatus);
    await expect(status).toHaveAttribute('data-empty', 'true');

    await reset.click();
    await expect(page.locator('.filter-chips button[data-stack][aria-pressed="true"]')).toHaveCount(0);
    await expect(shown).toHaveCount(PROJECTS.length);
    await expect(status).toHaveText(EXPECTED['/en/projects/'].initialStatus);
    await expect(status).not.toHaveAttribute('data-empty');
    await expect(reset).toHaveAttribute('aria-pressed', 'true');
  });

  test('announces localized counts in es', async ({ page }) => {
    await page.goto('/es/projects/');
    const shown = page.locator('section.cards--tier article.card:not([hidden])');
    const status = page.locator('#filter-status');
    const es = EXPECTED['/es/projects/'];

    await expect(status).toHaveText(es.initialStatus);
    await page.locator('.filter-chips button[data-stack="Rust"]').click();
    await expect(status).toHaveText(es.oneStatus);
    await page.locator('.filter-chips button[data-stack="Whisper"]').click();
    await expect(status).toHaveText(es.twoStatus);
    await expect(shown).toHaveCount(2);
    await page.locator('.filter-chips button[data-reset]').click();
    await expect(status).toHaveText(es.initialStatus);
    await expect(shown).toHaveCount(PROJECTS.length);
  });
});
