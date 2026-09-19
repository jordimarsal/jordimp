import { expect, test } from '@playwright/test';
import { BREADCRUMB_HOME, CV, PAGES, SKILLS, EXPERIENCE } from '../src/data/content';
import { LOCALES, type Locale } from '../src/lib/i18n';

const cvRoute = (lang: Locale): string => `/${lang}/cv/`;

test.describe('cv page (T9)', () => {
  test('renders the spike CV structure', async ({ page }) => {
    await page.goto(cvRoute('en'));

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await page.title()).toBe(PAGES.cv.title.en);

    const breadcrumb = page.locator('nav.breadcrumb[aria-label="Breadcrumb"]');
    await expect(breadcrumb.locator('a')).toHaveCount(1);
    await expect(breadcrumb.locator('a')).toHaveText(BREADCRUMB_HOME.en);
    await expect(breadcrumb.locator('a')).toHaveAttribute('href', '/en/');
    await expect(breadcrumb.locator('span[aria-current="page"]')).toHaveText('CV');

    await expect(page.locator('.navbar__links a[href="/en/cv/"]')).toHaveAttribute(
      'aria-current',
      'page',
    );

    await expect(page.locator('.sec-head__num')).toHaveText(CV.head.num);
    await expect(page.locator('h1#page-title')).toHaveText(CV.head.title.en);
    await expect(page.locator('.sec-head__sub')).toHaveText(CV.head.sub.en);
    await expect(page.locator('main > p.prose')).toHaveText(CV.intro.en);

    const facts = page.locator('.cv-facts > div');
    await expect(facts).toHaveCount(5);
    for (let i = 0; i < CV.facts.en.length; i++) {
      await expect(facts.nth(i).locator('.k')).toHaveText(CV.facts.en[i].k);
      await expect(facts.nth(i).locator('.v')).toHaveText(CV.facts.en[i].v);
    }

    const buttons = page.locator('.cv-actions a.btn--big');
    await expect(buttons).toHaveCount(2);
    await expect(buttons.nth(0)).toHaveAttribute('href', `/cv/${CV.files.en}`);
    await expect(buttons.nth(0)).toHaveAttribute('download');
    await expect(buttons.nth(0).locator('.btn__label')).toHaveText(CV.buttons.enLabel);
    await expect(buttons.nth(1)).toHaveAttribute('href', `/cv/${CV.files.es}`);
    await expect(buttons.nth(1)).toHaveAttribute('download');
    await expect(buttons.nth(1)).not.toHaveAttribute('target');
    await expect(buttons.nth(0)).not.toHaveAttribute('target');
    await expect(buttons.nth(1).locator('.btn__label')).toHaveText(CV.buttons.esLabel);
    for (let i = 0; i < 2; i++) {
      await expect(buttons.nth(i).locator('span[aria-hidden="true"]')).toHaveText('↓');
    }

    await expect(page.locator('p.cv-note')).toHaveText(CV.buttons.note.en);

    await expect(page.locator('h2#cv-exp')).toHaveText(CV.sections.experience.en);
    const rows = page.locator('main .ledger .ledger__row');
    await expect(rows).toHaveCount(EXPERIENCE.length);
    for (let i = 0; i < EXPERIENCE.length; i++) {
      await expect(rows.nth(i).locator('.ledger__per')).toHaveText(EXPERIENCE[i].period);
      await expect(rows.nth(i).locator('.ledger__body b')).toHaveText(EXPERIENCE[i].company);
      await expect(rows.nth(i).locator('.ledger__body p')).toHaveText(
        EXPERIENCE[i].points.en.join(' '),
      );
    }

    await expect(page.locator('h2#cv-skills')).toHaveText(CV.sections.skills.en);
    const skillcards = page.locator('.skillgrid .skillcard');
    await expect(skillcards).toHaveCount(SKILLS.length);
    for (let i = 0; i < SKILLS.length; i++) {
      await expect(skillcards.nth(i).locator('h3')).toHaveText(SKILLS[i].group.en);
      await expect(skillcards.nth(i).locator('li')).toHaveCount(SKILLS[i].items.length);
    }

    await expect(page.locator('.footer-desk#desk')).toHaveCount(1);
  });

  test('renders the CV page across the three locales', async ({ page }) => {
    for (const lang of LOCALES) {
      const response = await page.goto(cvRoute(lang));
      expect(response?.status(), lang).toBe(200);

      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      expect(await page.title()).toBe(PAGES.cv.title[lang]);
      await expect(page.locator('nav.breadcrumb a')).toHaveText(BREADCRUMB_HOME[lang]);
      await expect(page.locator('nav.breadcrumb span[aria-current="page"]')).toHaveText('CV');
      await expect(page.locator('.navbar__links a[href$="/cv/"]')).toHaveAttribute(
        'aria-current',
        'page',
      );

      await expect(page.locator('h1#page-title')).toHaveText(CV.head.title[lang]);
      await expect(page.locator('.sec-head__sub')).toHaveText(CV.head.sub[lang]);
      await expect(page.locator('main > p.prose')).toHaveText(CV.intro[lang]);

      const facts = page.locator('.cv-facts > div');
      await expect(facts, lang).toHaveCount(5);
      for (let i = 0; i < CV.facts[lang].length; i++) {
        await expect(facts.nth(i).locator('.k')).toHaveText(CV.facts[lang][i].k);
        await expect(facts.nth(i).locator('.v')).toHaveText(CV.facts[lang][i].v);
      }

      const buttons = page.locator('.cv-actions a.btn--big');
      await expect(buttons.nth(0).locator('.btn__label')).toHaveText(CV.buttons.enLabel);
      await expect(buttons.nth(1).locator('.btn__label')).toHaveText(CV.buttons.esLabel);
      await expect(buttons.nth(0)).toHaveAttribute('href', `/cv/${CV.files.en}`);
      await expect(buttons.nth(1)).toHaveAttribute('href', `/cv/${CV.files.es}`);

      await expect(page.locator('p.cv-note')).toHaveText(CV.buttons.note[lang]);

      await expect(page.locator('h2#cv-exp')).toHaveText(CV.sections.experience[lang]);
      await expect(page.locator('h2#cv-skills')).toHaveText(CV.sections.skills[lang]);

      const rows = page.locator('main .ledger .ledger__row');
      await expect(rows, lang).toHaveCount(EXPERIENCE.length);
      for (let i = 0; i < EXPERIENCE.length; i++) {
        await expect(rows.nth(i).locator('.ledger__body p')).toHaveText(
          EXPERIENCE[i].points[lang].join(' '),
        );
      }

      const skillcards = page.locator('.skillgrid .skillcard');
      await expect(skillcards, lang).toHaveCount(SKILLS.length);
      for (let i = 0; i < SKILLS.length; i++) {
        await expect(skillcards.nth(i).locator('h3')).toHaveText(SKILLS[i].group[lang]);
      }
    }
  });

  test('keeps the buttons visible with black ink under print emulation, day and night', async ({
    page,
  }) => {
    const ink = (): Promise<string> =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--ink').trim(),
      );

    await page.goto(cvRoute('en'));
    await page.emulateMedia({ media: 'print' });

    const actions = page.locator('.cv-actions');
    await expect(actions).toBeVisible();
    expect(await actions.evaluate((el) => getComputedStyle(el).display)).not.toBe('none');
    await expect(page.locator('header.navbar')).toBeHidden();
    const bodyColor = () =>
      page.evaluate(() => getComputedStyle(document.body).color);
    await expect
      .poll(bodyColor, 'body settles at black ink under print')
      .toBe('rgb(0, 0, 0)');
    expect(await ink()).toBe('#0c0b0a');

    await page.emulateMedia({ media: 'screen' });
    await page.locator('button[data-night-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-night', '1');
    expect(await ink()).toBe('#f1ecdc');

    await page.emulateMedia({ media: 'print' });
    expect(await ink()).toBe('#000');
    await expect.poll(bodyColor, 'body settles at black ink under night print').toBe('rgb(0, 0, 0)');
    await expect(actions).toBeVisible();
  });

  test('serves both CV PDFs', async ({ request }) => {
    for (const file of [CV.files.en, CV.files.es]) {
      const response = await request.get(`/cv/${file}`);
      expect(response.status(), file).toBe(200);
      expect(response.headers()['content-type'], file).toContain('application/pdf');
      expect((await response.body()).length, file).toBeGreaterThan(0);
    }
  });
});
