import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { floorPlateLabel } from '../src/lib/building-svg';
import { parseQuality, plaqueText } from '../src/lib/quality';
import { DEPTS, FEATURED, FLOOR_ORDER, FOOTER, HOME, SITE, UI, project } from '../src/data/content';

const qualityJson: unknown = JSON.parse(
  readFileSync(new URL('../src/data/quality.json', import.meta.url), 'utf8'),
);
const homeReport = parseQuality(qualityJson).ok ? parseQuality(qualityJson).value : null;

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

const FLOOR_KEYS = ['research', 'telemetry', 'tooling', 'inspections', 'people', 'operations', 'frontdesk'] as const;

const MARK_TEXT = { en: 'Specs before code.', es: 'Specs antes que código.', ca: 'Specs abans de codi.' } as const;

async function expectHomeChrome(page: Page, home: string): Promise<void> {
  const lang = home.replace(/\//g, '');

  await expect(page.locator('html')).toHaveAttribute('lang', lang);
  await expect(page.locator('a.skipnav')).toHaveCount(1);

  await expect(page.locator('.navbar__brand')).toHaveAttribute('href', home);
  await expect(page.locator(`.navbar__links a[href="${home}"]`)).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.navbar__lang a[aria-current="true"]')).toHaveAttribute('href', home);
  await expect(page.locator('.navbar [data-night-toggle]')).toHaveCount(1);

  await expect(page.locator('h1 mark')).toHaveCount(1);
  await expect(page.locator('.meta-row span')).toHaveCount(4);
  expect(await page.locator('.meta-row').textContent()).not.toContain('EN / ES / CA');
  await expect(page.locator('.hint')).toContainText(/CLICK A FLOOR|PULSA UNA PLANTA|PITJA UNA PLANTA/);
  await expect(page.locator('.ticker .ticker__inner span')).toHaveCount(2);

  const contactLink = page.locator(
    `.navbar__links a[href="${home}departments/front-desk/"]`,
  );
  await expect(contactLink).toHaveCount(1);
  await expect(contactLink).toHaveText(UI.nav.contact[lang]);
  await expect(contactLink).not.toHaveAttribute('aria-current');

  await expect(page.locator('.hero-cta .pill')).toHaveCount(4);
  await expect(page.locator('.hero-cta .pill[href="mailto:hello@jordimp.net"]')).toHaveText(
    FOOTER.email[lang],
  );
  await expect(page.locator('.hero-cta .pill', { hasText: FOOTER.github[lang] })).toHaveAttribute(
    'href',
    SITE.github,
  );
  await expect(page.locator('.hero-cta .pill', { hasText: FOOTER.github[lang] })).toHaveAttribute(
    'target',
    '_blank',
  );
  await expect(page.locator('.hero-cta .pill', { hasText: FOOTER.github[lang] })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );
  await expect(page.locator('.hero-cta .pill', { hasText: FOOTER.linkedin[lang] })).toHaveAttribute(
    'href',
    SITE.linkedin,
  );
  await expect(
    page.locator('.hero-cta .pill', { hasText: FOOTER.linkedin[lang] }),
  ).toHaveAttribute('target', '_blank');
  await expect(
    page.locator('.hero-cta .pill', { hasText: FOOTER.linkedin[lang] }),
  ).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.locator(`.hero-cta .pill[href="${home}cv/"]`)).toHaveText(UI.nav.cv[lang]);

  await expect(page.locator('.floor-hint')).toBeVisible();
  await expect(page.locator('.floor-hint')).toHaveText(UI.floorHint[lang]);

  await expect(page.locator('.floor-btn')).toHaveCount(7);
  await expect(page.locator('.dept-panel')).toHaveCount(7);
  for (const key of FLOOR_KEYS) {
    await expect(page.locator(`.floor-btn#dept-${key}`)).toHaveAttribute('data-floor', key);
    await expect(page.locator(`.floor-btn#dept-${key}`)).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(`.floor-btn#dept-${key}`)).toHaveAttribute('aria-controls', `dept-panel-${key}`);
    await expect(page.locator(`.floor-btn#dept-${key}`)).toHaveAttribute('aria-label', floorPlateLabel(lang, key));
    await expect(page.locator(`#dept-panel-${key}`)).not.toBeVisible();
  }

  await expect(page.locator('.building-stack svg.b-svg--m')).toHaveCount(9);
  await expect(page.locator('.deptstrip__item')).toHaveCount(7);
  await expect(page.locator('.footer-desk#desk')).toHaveCount(1);
  await expect(page.locator('.footer-desk .pill[href^="mailto:"]')).toHaveCount(1);
  await expect(page.locator('.footer-desk .pill[href^="mailto:"]')).toHaveAttribute(
    'href',
    'mailto:hello@jordimp.net',
  );
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
      for (const key of ['research', 'operations', 'inspections']) {
        const plate = page.locator(`.floor-btn#dept-${key} .b-plategroup`);
        await expect(plate.locator('.b-floorplate')).toHaveCount(2);
        await expect(plate.locator('.b-plate-code')).toHaveCount(2);
      }
      await expect(page.locator('.floor-btn#dept-research .b-plate-suffix').first()).toHaveText(SUFFIX[home].research);
      await expect(page.locator('.floor-btn#dept-operations .b-plate-suffix').first()).toHaveText(SUFFIX[home].operations);
      await expect(page.locator('.floor-btn#dept-research .b-svg--d .b-plate-name').first()).toContainText(SUFFIX[home].name);
      await expect(page.locator('.floor-btn#dept-inspections .b-plate-code').first()).toHaveText('Q');
      await expect(page.locator('.floor-btn#dept-research .icon-hit')).toHaveCount(1);
      await expect(page.locator('.floor-btn#dept-research .floor-bubble')).not.toBeEmpty();
    });

    test(`renders department panel bodies at ${home}`, async ({ page }) => {
      await page.goto(home);
      const lang = home.replace(/\//g, '');
      await expect(page.locator('#dept-panel-research .cards .card')).toHaveCount(2);
      await expect(page.locator('#dept-panel-telemetry .cards .card')).toHaveCount(2);
      await expect(page.locator('#dept-panel-tooling .cards .card')).toHaveCount(3);
      await expect(page.locator('#dept-panel-people .prose li')).toHaveCount(4);
      await expect(page.locator('#dept-panel-operations .ledger__row')).toHaveCount(4);
      await expect(page.locator('#dept-panel-operations .dept-panel__cta .btn')).toHaveCount(2);
      await expect(page.locator(`#dept-panel-operations .dept-panel__cta a[href="${home}cv/"]`)).toHaveCount(1);
      await expect(page.locator('#dept-panel-frontdesk .pills a')).toHaveCount(3);
      for (const key of FLOOR_KEYS) {
        await expect(page.locator(`#dept-panel-${key} .dept-panel__cta .btn`).first()).toHaveAttribute('href', /\/departments\//);
      }
      await expect(page.locator('#dept-panel-research .cards .card a.case[rel="noopener noreferrer"]')).toHaveCount(2);
      const plaqueCopy = page.locator('#dept-panel-inspections .q-plaque-copy');
      await expect(plaqueCopy).toHaveCount(1);
      await expect(plaqueCopy).toHaveText(plaqueText(lang, homeReport));
      await expect(page.locator('#dept-panel-inspections .dept-panel__cta .btn').first()).toHaveAttribute(
        'href',
        `${home}departments/inspections/`,
      );
    });

    test(`keeps hero and featured copy localized at ${home}`, async ({ page }) => {
      await page.goto(home);
      const lang = home.replace(/\//g, '');
      await expect(page.locator('.hero .kicker')).not.toBeEmpty();
      await expect(page.locator('.sec-head:has(#building-title) .sec-head__num')).toHaveText('01');
      await expect(page.locator('section:has(#featured-title) article.card')).toHaveCount(3);
      await expect(page.locator('section:has(#featured-title) .metrics .m').first()).toBeVisible();
      await expect(page.locator('#dept-panel-research .cards .metrics .m')).toHaveCount(2);
      const featuredLinks = page.locator('section:has(#featured-title) article.card a.case');
      for (let i = 0; i < FEATURED.length; i++) {
        const p = project(FEATURED[i]);
        await expect(featuredLinks.nth(i)).toHaveAttribute(
          'aria-label',
          `${p.name} — ${UI.viewGithub[lang]}`,
        );
      }
    });

    test(`renders the outcome line on featured cards only at ${home} (F16 R26, R27)`, async ({ page }) => {
      await page.goto(home);
      const lang = home.replace(/\//g, '') as 'en' | 'es' | 'ca';
      const outcomes = page.locator('section:has(#featured-title) article.card .card__outcome');
      await expect(outcomes).toHaveCount(3);
      for (let i = 0; i < FEATURED.length; i++) {
        const outcome = project(FEATURED[i]).outcome;
        if (!outcome) throw new Error(`missing outcome on ${FEATURED[i]}`);
        await expect(outcomes.nth(i)).toHaveText(outcome[lang]);
      }
      await expect(page.locator('.dept-panel .card__outcome')).toHaveCount(0);
    });

    test(`positions the hero copy at ${home}`, async ({ page }) => {
      await page.goto(home);
      const lang = home.replace(/\//g, '') as 'en' | 'es' | 'ca';
      await expect(page.locator('.hero .kicker')).toHaveText(HOME.kicker[lang]);
      await expect(page.locator('h1 mark')).toHaveText(MARK_TEXT[lang]);
      await expect(page.locator('.stand')).toHaveText(HOME.stand[lang].replace(/<[^>]+>/g, ''));
    });
  }
});

test.describe('home ITE plaque (F10 R10, R12)', () => {
  for (const home of HOMES) {
    test(`links the entrance plaque to the inspections floor with a composed label at ${home}`, async ({
      page,
    }) => {
      await page.goto(home);
      const lang = home.replace(/\//g, '');
      const plaque = page.locator('a.ite-plaque');
      await expect(plaque).toHaveCount(1);
      await expect(plaque).toHaveAttribute('href', `${home}departments/inspections/`);
      await expect(plaque.locator('svg.ite-plaque__svg')).toHaveAttribute('aria-hidden', 'true');
      const visible = (await plaque.locator('.ite-plaque__text').textContent()) ?? '';
      expect(visible.trim()).toBe(plaqueText(lang, homeReport));
      const ariaLabel = (await plaque.getAttribute('aria-label')) ?? '';
      expect(ariaLabel).toContain(visible.trim());
    });

    test(`keeps the roof neon sign out of any link at ${home}`, async ({ page }) => {
      await page.goto(home);
      await expect(page.locator('a:has(svg[role="img"])')).toHaveCount(0);
      await expect(page.locator('.building-stack svg[role="img"]')).toHaveCount(2);
    });
  }
});

test.describe('blog navbar entry (F15 R8)', () => {
  for (const home of HOMES) {
    test(`renders the Blog link between Projects and CV at ${home}`, async ({ page }) => {
      await page.goto(home);
      const lang = home.replace(/\//g, '');
      const labels = await page.locator('.navbar__links a').allTextContents();
      expect(labels.indexOf(UI.nav.blog[lang])).toBe(labels.indexOf(UI.nav.work[lang]) + 1);
      expect(labels.indexOf(UI.nav.cv[lang])).toBe(labels.indexOf(UI.nav.blog[lang]) + 1);
      await expect(page.locator(`.navbar__links a[href="${home}blog/"]`)).toHaveText(
        UI.nav.blog[lang],
      );
    });

    test(`marks the Blog link as the current page on blog routes at ${home}`, async ({ page }) => {
      await page.goto(`${home}blog/`);
      await expect(page.locator(`.navbar__links a[href="${home}blog/"]`)).toHaveAttribute(
        'aria-current',
        'page',
      );
      await expect(page.locator(`.navbar__links a[href="${home}"]`)).not.toHaveAttribute(
        'aria-current',
        'page',
      );
    });
  }
});

test.describe('navbar language switcher affordance (F20 R2, R4)', () => {
  for (const home of HOMES) {
    test(`presents the pointer cursor on all three locale links at ${home} (R2)`, async ({
      page,
    }) => {
      await page.goto(home);
      const cursors = await page
        .locator('.navbar__lang a')
        .evaluateAll((links) => links.map((link) => getComputedStyle(link).cursor));
      expect(cursors).toEqual(Array(3).fill('pointer'));
    });

    test(`marks only the current locale with the dot glyph at ${home} (R4)`, async ({ page }) => {
      await page.goto(home);
      const links = await page.locator('.navbar__lang a').evaluateAll((nodes) =>
        nodes.map((link) => ({
          current: link.getAttribute('aria-current') === 'true',
          marker: getComputedStyle(link, '::before').content,
        })),
      );
      expect(links).toHaveLength(3);
      const current = links.filter((link) => link.current);
      expect(current).toHaveLength(1);
      expect(current[0]?.marker.replace(/["']/g, '')).toBe('● ');
      for (const link of links.filter((candidate) => !candidate.current)) {
        expect(link.marker).toBe('none');
      }
    });
  }
});

test.describe('navbar switcher tap targets at 375×667 (F20 R5)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  for (const home of HOMES) {
    test(`renders 44px tap targets for the three locale links at ${home}`, async ({ page }) => {
      await page.goto(home);
      for (let i = 0; i < 3; i++) {
        const box = await page.locator('.navbar__lang a').nth(i).boundingBox();
        if (!box) throw new Error(`locale link ${i} not rendered`);
        expect(box.width, `locale link ${i} width`).toBeGreaterThanOrEqual(44);
        expect(box.height, `locale link ${i} height`).toBeGreaterThanOrEqual(44);
      }
    });
  }

  test('introduces no horizontal page scroll on the home (maintenance)', async ({ page }) => {
    await page.goto('/en/');
    const widths = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(widths.scrollWidth).toBe(widths.clientWidth);
  });
});

test.describe('building affordance and tap targets at 375×667 (F16 R14, R17, R18)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('presents the pointer cursor on every floor button (R14)', async ({ page }) => {
    await page.goto('/en/');
    const cursors = await page
      .locator('.floor-btn')
      .evaluateAll((buttons) => buttons.map((btn) => getComputedStyle(btn).cursor));
    expect(cursors).toEqual(Array(7).fill('pointer'));
  });

  test('renders 44px tap targets for the seven floor buttons and the ITE plaque (R17)', async ({
    page,
  }) => {
    await page.goto('/en/');
    for (let i = 0; i < 7; i++) {
      const box = await page.locator('.floor-btn').nth(i).boundingBox();
      if (!box) throw new Error(`floor button ${i} not rendered`);
      expect(box.width, `floor button ${i} width`).toBeGreaterThanOrEqual(44);
      expect(box.height, `floor button ${i} height`).toBeGreaterThanOrEqual(44);
    }
    const plaque = await page.locator('a.ite-plaque').boundingBox();
    if (!plaque) throw new Error('ITE plaque not rendered');
    expect(plaque.width).toBeGreaterThanOrEqual(44);
    expect(plaque.height).toBeGreaterThanOrEqual(44);
  });

  test('introduces no horizontal page scroll on the building (R18)', async ({ page }) => {
    await page.goto('/en/');
    const widths = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(widths.scrollWidth).toBe(widths.clientWidth);
  });

  test('balances the hero CTA as a 2×2 grid on mobile, flex row on desktop (maintenance)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/en/');
    const display = () =>
      page.locator('.hero-cta').evaluate((el) => getComputedStyle(el).display);

    expect(await display()).toBe('flex');

    await page.setViewportSize({ width: 390, height: 844 });
    expect(await display()).toBe('grid');
    const columns = await page
      .locator('.hero-cta')
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(columns.split(' ')).toHaveLength(2);
  });
});

test.describe('plain clarity (F21 plain-language section and floor guide)', () => {
  for (const home of HOMES) {
    const lang = home.replace(/\//g, '') as 'en' | 'es' | 'ca';

    test(`places the plain section between building and featured at ${home} (R1)`, async ({
      page,
    }) => {
      await page.goto(home);
      const labelled = await page
        .locator('main > section')
        .evaluateAll((sections) => sections.map((s) => s.getAttribute('aria-labelledby')));
      const building = labelled.indexOf('building-title');
      const plain = labelled.indexOf('plain-title');
      const featured = labelled.indexOf('featured-title');
      expect(plain, 'plain section directly after building').toBe(building + 1);
      expect(featured, 'featured section directly after plain').toBe(plain + 1);
      await expect(page.locator('section:has(#plain-title)')).toBeVisible();
    });

    test(`numbers the home sections 01-04 in DOM order at ${home} (R5)`, async ({ page }) => {
      await page.goto(home);
      const nums = await page.locator('main .sec-head__num').allTextContents();
      expect(nums).toEqual(['01', '02', '03', '04']);
    });

    test(`renders exactly three outcome cards with per-locale copy and floor links at ${home} (R2, R3)`, async ({
      page,
    }) => {
      await page.goto(home);
      const cards = page.locator('.plain-cards article.plain-card');
      await expect(cards).toHaveCount(HOME.plainCards.length);
      for (let i = 0; i < HOME.plainCards.length; i++) {
        const card = HOME.plainCards[i];
        const loc = cards.nth(i);
        await expect(loc.locator('h3')).toHaveCount(1);
        await expect(loc.locator('p')).toHaveCount(1);
        await expect(loc.locator('a')).toHaveCount(1);
        await expect(loc.locator('img, ul, ol, .metrics, span')).toHaveCount(0);
        await expect(loc.locator('h3')).toHaveText(card.title[lang]);
        await expect(loc.locator('a')).toHaveText(`${card.cta[lang]} →`);
        await expect(loc.locator('a')).toHaveAttribute(
          'href',
          `${home}departments/${DEPTS[card.dept].page}/`,
        );
      }
    });

    test(`renders the floor guide inside the building, after the hint, in floor order at ${home} (R6, R7)`, async ({
      page,
    }) => {
      await page.goto(home);
      const guide = page.locator('#floorguide');
      await expect(guide).toBeVisible();
      await expect(page.locator('section:has(#building-title) #floorguide')).toHaveCount(1);
      const position = await page.locator('section:has(#building-title)').evaluate((section) => {
        const hint = section.querySelector('.floor-hint');
        const guideNode = section.querySelector('#floorguide');
        const building = section.querySelector('#building');
        return Boolean(
          hint &&
            guideNode &&
            building &&
            hint.nextElementSibling === guideNode &&
            guideNode.nextElementSibling === building,
        );
      });
      expect(position, 'guide directly after .floor-hint and before <Building>').toBe(true);
      await expect(guide.locator('.floorguide__label')).toHaveText(HOME.floorGuide.label[lang]);
      await expect(guide.locator('.floorguide__line')).toHaveText(HOME.floorGuide.line[lang]);
      const rows = guide.locator('.floorguide__list li');
      await expect(rows).toHaveCount(FLOOR_ORDER.length);
      for (let i = 0; i < FLOOR_ORDER.length; i++) {
        const dept = DEPTS[FLOOR_ORDER[i]];
        await expect(rows.nth(i).locator('.floorguide__code')).toHaveText(dept.code);
        await expect(rows.nth(i).locator('.floorguide__name')).toHaveText(dept.name[lang]);
        await expect(rows.nth(i).locator('.floorguide__plain')).toHaveText(dept.plain[lang]);
      }
    });

    test(`keeps the floor guide and floor plates non-interactive as shipped at ${home} (R8)`, async ({
      page,
    }) => {
      await page.goto(home);
      await expect(page.locator('#floorguide a')).toHaveCount(0);
      await expect(page.locator('#floorguide button')).toHaveCount(0);
      await expect(page.locator('#floorguide script')).toHaveCount(0);
      await expect(page.locator('#floorguide form, #floorguide input')).toHaveCount(0);
      for (const key of FLOOR_KEYS) {
        await expect(page.locator(`.floor-btn#dept-${key}`)).toHaveAttribute(
          'aria-label',
          floorPlateLabel(lang, key),
        );
      }
    });
  }

  test('derives the guide rows from FLOOR_ORDER and DEPTS in the page source (R7)', () => {
    const source = readFileSync(new URL('../src/pages/[lang]/index.astro', import.meta.url), 'utf8');
    const start = source.indexOf('id="floorguide"');
    const end = source.indexOf('<Building', start);
    expect(start, 'floorguide block present').toBeGreaterThan(-1);
    expect(end, 'building render follows the guide').toBeGreaterThan(start);
    const guideBlock = source.slice(start, end);
    expect(guideBlock).toContain('FLOOR_ORDER.map((key)');
    expect(guideBlock).toContain('DEPTS[key].code');
    expect(guideBlock).toContain('DEPTS[key].name[lang]');
    expect(guideBlock).toContain('DEPTS[key].plain[lang]');
  });
});

test.describe('plain clarity layout guard at 375×667 (F21 R12)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  for (const home of HOMES) {
    test(`keeps the guide and cards inside the viewport at ${home} (R12)`, async ({ page }) => {
      await page.goto(home);
      for (const selector of ['#floorguide', '.plain-cards']) {
        await page.locator(selector).scrollIntoViewIfNeeded();
        const widths = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(widths.scrollWidth, `${selector} introduces no horizontal scroll`).toBe(
          widths.clientWidth,
        );
      }
    });
  }
});
