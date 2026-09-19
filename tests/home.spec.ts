import { expect, test, type Page } from '@playwright/test';

const HOMES = ['/en/', '/es/', '/ca/'] as const;

const ROOF_FLAG: Record<string, { blue: number; yellow: number; red: number }> = {
  '/en/': { blue: 1, yellow: 0, red: 0 },
  '/es/': { blue: 0, yellow: 1, red: 0 },
  '/ca/': { blue: 0, yellow: 1, red: 4 },
};

const SUFFIX: Record<string, { research: string; operations: string; name: string }> = {
  '/en/': { research: '- PROJECTS', operations: '- CV WORK', name: 'RESEARCH & RETRIEVAL' },
  '/es/': { research: '- PROYECTOS', operations: '- TRAYECTORIA CV', name: 'INVESTIGACIÓN Y RECUPERACIÓN' },
  '/ca/': { research: '- PROJECTES', operations: '- TRAJECTÒRIA CV', name: 'RECERCA I RECUPERACIÓ' },
};

const FLOOR_KEYS = ['research', 'telemetry', 'tooling', 'people', 'operations', 'frontdesk'] as const;

async function expectHomeChrome(page: Page, home: string): Promise<void> {
  const lang = home.replace(/\//g, '');

  await expect(page.locator('html')).toHaveAttribute('lang', lang);
  await expect(page.locator('a.skipnav')).toHaveCount(1);

  await expect(page.locator('.navbar__brand')).toHaveAttribute('href', home);
  await expect(page.locator(`.navbar__links a[href="${home}"]`)).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.navbar__lang a[aria-current="true"]')).toHaveAttribute('href', home);
  await expect(page.locator('.navbar [data-night-toggle]')).toHaveCount(1);

  await expect(page.locator('h1 mark')).toHaveCount(1);
  await expect(page.locator('.meta-row span')).toHaveCount(5);
  await expect(page.locator('.hint')).toContainText(/CLICK A FLOOR|PULSA UNA PLANTA|PITJA UNA PLANTA/);
  await expect(page.locator('.ticker .ticker__inner span')).toHaveCount(2);

  await expect(page.locator('.floor-btn')).toHaveCount(6);
  await expect(page.locator('.dept-panel')).toHaveCount(6);
  for (const key of FLOOR_KEYS) {
    await expect(page.locator(`.floor-btn#dept-${key}`)).toHaveAttribute('data-floor', key);
    await expect(page.locator(`.floor-btn#dept-${key}`)).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(`.floor-btn#dept-${key}`)).toHaveAttribute('aria-controls', `dept-panel-${key}`);
    await expect(page.locator(`#dept-panel-${key}`)).not.toBeVisible();
  }

  await expect(page.locator('.building-stack svg.b-svg--m')).toHaveCount(8);
  await expect(page.locator('.deptstrip__item')).toHaveCount(6);
  await expect(page.locator('.footer-desk#desk')).toHaveCount(1);
  await expect(page.locator('.footer-desk .pill[href^="mailto:"]')).toHaveCount(1);
  await expect(page.locator('.footer-desk .pill[rel="noopener noreferrer"]')).toHaveCount(2);

  expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThanOrEqual(2);
}

test.describe('home building page (T4)', () => {
  for (const home of HOMES) {
    test(`renders the spike structure at ${home}`, async ({ page }) => {
      await page.goto(home);
      await expectHomeChrome(page, home);
    });

    test(`renders the locale roof flag on both variants at ${home}`, async ({ page }) => {
      await page.goto(home);
      const roofs = page.locator('svg[role="img"]');
      await expect(roofs).toHaveCount(2);
      const expected = ROOF_FLAG[home];
      for (let i = 0; i < 2; i++) {
        await expect(roofs.nth(i).locator('rect[fill="#2f5aa8"]')).toHaveCount(expected.blue);
        await expect(roofs.nth(i).locator('rect[fill="#fcdd09"]')).toHaveCount(expected.yellow);
        await expect(roofs.nth(i).locator('rect[fill="#da121a"]')).toHaveCount(expected.red);
      }
    });

    test(`renders plate suffixes and hover hooks at ${home}`, async ({ page }) => {
      await page.goto(home);
      for (const key of ['research', 'operations']) {
        const plate = page.locator(`.floor-btn#dept-${key} .b-plategroup`);
        await expect(plate.locator('.b-floorplate')).toHaveCount(2);
        await expect(plate.locator('.b-plate-code')).toHaveCount(2);
        await expect(plate.locator('.b-plate-suffix').first()).toHaveText(SUFFIX[home][key]);
      }
      await expect(page.locator('.floor-btn#dept-research .b-svg--d .b-plate-name').first()).toContainText(SUFFIX[home].name);
      await expect(page.locator('.floor-btn#dept-research .icon-hit')).toHaveCount(1);
      await expect(page.locator('.floor-btn#dept-research .floor-bubble')).not.toBeEmpty();
    });

    test(`renders department panel bodies at ${home}`, async ({ page }) => {
      await page.goto(home);
      await expect(page.locator('#dept-panel-research .cards .card')).toHaveCount(3);
      await expect(page.locator('#dept-panel-telemetry .cards .card')).toHaveCount(3);
      await expect(page.locator('#dept-panel-tooling .cards .card')).toHaveCount(5);
      await expect(page.locator('#dept-panel-people .prose li')).toHaveCount(4);
      await expect(page.locator('#dept-panel-operations .ledger__row')).toHaveCount(4);
      await expect(page.locator('#dept-panel-operations .dept-panel__cta .btn')).toHaveCount(2);
      await expect(page.locator(`#dept-panel-operations .dept-panel__cta a[href="${home}cv/"]`)).toHaveCount(1);
      await expect(page.locator('#dept-panel-frontdesk .pills a')).toHaveCount(3);
      for (const key of FLOOR_KEYS) {
        await expect(page.locator(`#dept-panel-${key} .dept-panel__cta .btn`).first()).toHaveAttribute('href', /\/departments\//);
      }
      await expect(page.locator('#dept-panel-research .cards .card a.case[rel="noopener noreferrer"]')).toHaveCount(3);
    });

    test(`keeps hero and featured copy localized at ${home}`, async ({ page }) => {
      await page.goto(home);
      await expect(page.locator('.hero .kicker')).not.toBeEmpty();
      await expect(page.locator('.sec-head:has(#building-title) .sec-head__num')).toHaveText('01');
      await expect(page.locator('section:has(#featured-title) article.card')).toHaveCount(3);
      await expect(page.locator('section:has(#featured-title) .metrics .m').first()).toBeVisible();
      await expect(page.locator('#dept-panel-research .cards .metrics .m')).toHaveCount(2);
    });
  }
});
