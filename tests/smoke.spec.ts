import { readFileSync } from 'node:fs';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';
import { FLOOR_ORDER, PAGES, PROJECTS } from '../src/data/content';

const LOCALES = ['en', 'es', 'ca'] as const;
type Locale = (typeof LOCALES)[number];

const STATIC_ROUTES = ['', 'cv', 'projects'];
const PROJECT_SLUGS = PROJECTS.map((p) => p.slug);
const DEPT_SLUGS = FLOOR_ORDER.map((key) =>
  PAGES[key].route.replace(/^departments\//, '').replace(/\.html$/, '')
);
const OLD_SLUGS = ['about', 'experience', 'skills'];
const UNKNOWN_PATH = '/nonexistent/';
const REDIRECT_TARGET = /\/en\/$/;

interface RouteFixture {
  title: string;
  description: string;
  h1: string;
  mainText: string;
}

interface ParityFixture {
  splash: {
    title: string;
    description: string;
    sub: string;
    metaRefresh: string;
    fallbackHref: string;
  };
  notFound: RouteFixture;
  routes: Record<string, RouteFixture>;
  plates: Record<string, Record<string, { code: string; name: string; suffix: string }>>;
  flags: Record<string, string[]>;
}

// Validated boundary: the fixture is committed oracle data (ADR-6), its shape is
// enforced by the assertions below and by the one-off generator that produced it.
const parity = JSON.parse(
  readFileSync(new URL('./fixtures/parity.json', import.meta.url), 'utf8')
) as ParityFixture;

function localeRoutes(): string[] {
  const paths = [
    ...STATIC_ROUTES.map((r) => (r ? `${r}/` : '')),
    ...PROJECT_SLUGS.map((slug) => `projects/${slug}/`),
    ...DEPT_SLUGS.map((slug) => `departments/${slug}/`),
  ];
  return LOCALES.flatMap((locale) => paths.map((p) => `/${locale}/${p}`));
}

const SWEEP_TARGETS: ReadonlyArray<{ url: string; status: number }> = [
  ...localeRoutes().map((url) => ({ url, status: 200 })),
  { url: '/', status: 200 },
  { url: UNKNOWN_PATH, status: 404 },
];

// Chromium logs one inherent resource error when the document itself answers
// 404 — expected exactly once on the 404 target; any other console error fails.
const DOCUMENT_404_ERROR =
  'console.error: Failed to load resource: the server responded with a status of 404 (Not Found)';

// Whitespace between text nodes is the documented Astro-vs-spike formatting
// class (ADR-6), so copy parity compares the whitespace-stripped text.
const canon = (text: string): string => text.replace(/\s+/g, '');

function holdSplash(page: Page): Promise<void> {
  return page.route(REDIRECT_TARGET, (route) => route.fulfill({ status: 204 }));
}

async function styleOf(page: Page, selector: string, property: string): Promise<string> {
  return page
    .locator(selector)
    .first()
    .evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
}

test.describe('65-page sweep (R27, F10 R16)', () => {
  test('sweep: every built page answers with the expected status and zero console errors', async ({
    page,
  }) => {
    test.setTimeout(300_000);
    expect(SWEEP_TARGETS).toHaveLength(65);
    expect(new Set(SWEEP_TARGETS.map((t) => t.url)).size).toBe(65);
    expect(Object.keys(parity.routes).sort()).toEqual(
      localeRoutes().sort()
    );

    const problems: string[] = [];
    for (const target of SWEEP_TARGETS) {
      const errors: string[] = [];
      const onConsole = (message: ConsoleMessage): void => {
        if (message.type() === 'error') errors.push(`console.error: ${message.text()}`);
      };
      const onPageError = (error: Error): void => errors.push(`pageerror: ${error.message}`);
      page.on('console', onConsole);
      page.on('pageerror', onPageError);
      try {
        const response = await page.goto(target.url);
        if (target.url === '/') await page.waitForURL(REDIRECT_TARGET);
        const status = response?.status() ?? 0;
        if (status !== target.status) {
          problems.push(`${target.url}: status ${status} ≠ ${target.status}`);
        }
      } finally {
        page.off('console', onConsole);
        page.off('pageerror', onPageError);
      }
      if (target.url === UNKNOWN_PATH) {
        const inherent = errors.filter((message) => message === DOCUMENT_404_ERROR);
        if (inherent.length !== 1) {
          problems.push(
            `${target.url}: expected exactly one inherent document-404 console error, got ${inherent.length}`
          );
        }
        problems.push(
          ...errors
            .filter((message) => message !== DOCUMENT_404_ERROR)
            .map((message) => `${target.url}: ${message}`)
        );
      } else {
        problems.push(...errors.map((message) => `${target.url}: ${message}`));
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('render: old production slugs serve the new 404 without redirecting', async ({
    request,
  }) => {
    for (const locale of LOCALES) {
      for (const slug of OLD_SLUGS) {
        const route = `/${locale}/${slug}/`;
        const response = await request.get(route);
        expect(response.status(), `${route} → ${response.status()}`).toBe(404);
        expect(await response.text()).toContain('Department not found');
      }
    }
  });
});

test.describe('golden parity vs spike/front/final (R27, ADR-6)', () => {
  test('parity: the splash matches the oracle fixture', async ({ page }) => {
    await holdSplash(page);
    await page.goto('/');

    expect(await page.title()).toBe(parity.splash.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      parity.splash.description
    );
    await expect(page.locator('meta[http-equiv="refresh"]')).toHaveAttribute(
      'content',
      parity.splash.metaRefresh
    );
    await expect(page.locator('.splash .sub')).toHaveText(parity.splash.sub);
    await expect(page.locator('.splash a.fallback')).toHaveAttribute(
      'href',
      parity.splash.fallbackHref
    );
  });

  test('parity: the 404 page matches the oracle fixture', async ({ page }) => {
    const response = await page.goto(UNKNOWN_PATH);
    expect(response?.status()).toBe(404);

    expect(await page.title()).toBe(parity.notFound.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      parity.notFound.description
    );
    await expect(page.locator('main h1')).toHaveText(parity.notFound.h1);
    const mainText = (await page.locator('main').textContent()) ?? '';
    expect(canon(mainText)).toBe(canon(parity.notFound.mainText));
  });

  for (const locale of LOCALES) {
    test(`parity: every ${locale} page matches the oracle fixture`, async ({ page }) => {
      test.setTimeout(300_000);
      const routes = localeRoutes().filter((route) => route.startsWith(`/${locale}/`));
      expect(routes).toHaveLength(21);

      for (const route of routes) {
        const expected = parity.routes[route];
        await page.goto(route);
        await expect(page.locator('html'), `${route} lang`).toHaveAttribute('lang', locale);
        expect(await page.title(), `${route} title`).toBe(expected.title);
        await expect(
          page.locator('meta[name="description"]'),
          `${route} description`
        ).toHaveAttribute('content', expected.description);
        await expect(page.locator('main h1'), `${route} h1`).toHaveText(expected.h1);
        const mainText = (await page.locator('main').textContent()) ?? '';
        expect(canon(mainText), `${route} main copy`).toBe(canon(expected.mainText));
      }
    });
  }

  test('parity: floor plates match the oracle fixture in every locale', async ({ page }) => {
    for (const locale of LOCALES) {
      await page.goto(`/${locale}/`);
      for (const key of FLOOR_ORDER) {
        const expected = parity.plates[locale][key];
        const floor = page.locator(`.floor-btn#dept-${key}`);
        await expect(floor.locator('.b-plate-code').first(), `${locale} ${key} code`).toHaveText(
          expected.code
        );
        await expect(
          floor.locator('.b-plate-suffix').first(),
          `${locale} ${key} suffix`
        ).toHaveText(expected.suffix);
        const name = await floor
          .locator('.b-plate-name, .b-plate-name--dark')
          .first()
          .evaluate((el) =>
            (el.childNodes[0]?.textContent ?? '').replace(/\s+/g, ' ').trim()
          );
        expect(name, `${locale} ${key} plate name`).toBe(expected.name);
      }
    }
  });

  test('parity: roof flag rects match the oracle fixture on both viewBox variants', async ({
    page,
  }) => {
    for (const locale of LOCALES) {
      await page.goto(`/${locale}/`);
      const roofs = page.locator('svg[role="img"]');
      await expect(roofs).toHaveCount(2);
      for (let variant = 0; variant < 2; variant++) {
        const fills = await roofs
          .nth(variant)
          .locator('rect[x="780"]')
          .evaluateAll((rects) =>
            rects
              .map((r) => r.getAttribute('fill'))
              .filter((fill): fill is string => Boolean(fill) && fill !== 'none')
          );
        expect(fills, `${locale} roof variant ${variant}`).toEqual(parity.flags[locale]);
      }
    }
  });
});

test.describe('routing contract', () => {
  test('routing: root redirects to the default locale', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    const refresh = page.locator('meta[http-equiv="refresh"]');
    await expect(refresh).toHaveCount(1);
    await expect(refresh).toHaveAttribute('content', /url=\/en\//);
    await page.locator('a[href="/en/"]').first().click();
    await page.waitForURL('**/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('routing: locale switcher navigates between sibling locale pages', async ({ page }) => {
    await page.goto('/en/projects/');
    const switcher = page.locator('.navbar__lang');
    for (const target of ['es', 'ca'] as const) {
      const link = switcher.locator(`a[hreflang="${target}"]`);
      await expect(link).toHaveAttribute('href', `/${target}/projects/`);
      const responsePromise = page.waitForResponse((r) => r.url().endsWith(`/${target}/projects/`));
      await link.click();
      expect((await responsePromise).status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', target);
      await expect(page).toHaveURL(new RegExp(`/${target}/projects/$`));
      await page.goBack();
    }
  });
});

test.describe('night mode across the site (R16)', () => {
  test('night: the stored preference follows the visitor across every page kind', async ({
    page,
  }) => {
    await page.goto('/en/');
    await page.locator('[data-night-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-night', '1');

    const stops = [
      '/es/',
      '/es/projects/',
      '/ca/projects/codebaserag/',
      '/ca/departments/telemetry/',
      '/en/cv/',
      UNKNOWN_PATH,
    ];
    for (const stop of stops) {
      await page.goto(stop);
      await expect(page.locator('html'), `${stop} keeps night on`).toHaveAttribute(
        'data-night',
        '1'
      );
      await expect(page.locator('[data-night-toggle]'), `${stop} aria-pressed`).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    }

    await page.locator('[data-night-toggle]').click();
    await expect(page.locator('html')).not.toHaveAttribute('data-night', '1');
    await page.goto('/en/');
    await expect(page.locator('html')).not.toHaveAttribute('data-night', '1');
    await expect(page.locator('[data-night-toggle]')).toHaveAttribute('aria-pressed', 'false');
  });
});

test.describe('mobile building and compact nav (R9, ≤760px)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile: the building swaps to the mobile viewBox variants and back across the breakpoint', async ({
    page,
  }) => {
    await page.goto('/en/');

    const displays = (selector: string): Promise<string[]> =>
      page
        .locator(selector)
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).display));

    expect(await displays('.building-stack svg.b-svg--d')).toEqual(Array(9).fill('none'));
    expect(await displays('.building-stack svg.b-svg--m')).toEqual(Array(9).fill('block'));
    expect(await displays('.icon-hit')).toEqual(Array(7).fill('none'));
    expect(await displays('.floor-bubble')).toEqual(Array(7).fill('none'));
    const sky = page.locator('.sky');
    expect(await sky.evaluate((el) => getComputedStyle(el).marginLeft)).toBe('-20px');
    expect(await sky.evaluate((el) => getComputedStyle(el).marginRight)).toBe('-20px');

    await page.setViewportSize({ width: 1280, height: 720 });
    expect(await displays('.building-stack svg.b-svg--d')).toEqual(Array(9).fill('block'));
    expect(await displays('.building-stack svg.b-svg--m')).toEqual(Array(9).fill('none'));
    expect(await displays('.icon-hit')).toEqual(Array(7).fill('block'));
    expect(await displays('.floor-bubble')).not.toContain('none');
    expect(await sky.evaluate((el) => getComputedStyle(el).marginLeft)).toBe('0px');
  });

  test('mobile: panels open from the mobile building layout', async ({ page }) => {
    await page.goto('/en/');
    await page.locator('#dept-operations').click();
    await expect(page.locator('#dept-panel-operations')).toHaveClass(/open/);
    await expect(page.locator('#dept-panel-operations')).toBeVisible();
    await expect(page.locator('#dept-panel-title-operations')).toBeFocused();
    await expect(page.locator('#dept-operations')).toHaveAttribute('aria-expanded', 'true');
  });

  test('mobile: the navbar compacts and restores across the breakpoint', async ({ page }) => {
    await page.goto('/en/');

    await page.setViewportSize({ width: 375, height: 667 });
    expect(await styleOf(page, '.navbar', 'padding-top')).toBe('8px');
    expect(await styleOf(page, '.navbar', 'padding-left')).toBe('12px');
    expect(await styleOf(page, '.navbar__lang', 'order')).toBe('2');
    expect(await styleOf(page, '.navbar__lang a', 'font-size')).toBe('9.5px');
    expect(await styleOf(page, '.navbar__links', 'order')).toBe('3');
    expect(await styleOf(page, '.navbar__links', 'justify-content')).toBe('space-between');
    expect(await styleOf(page, '.navbar__links a', 'font-size')).toBe('9.5px');

    await page.setViewportSize({ width: 1280, height: 720 });
    expect(await styleOf(page, '.navbar', 'padding-top')).toBe('10px');
    expect(await styleOf(page, '.navbar__lang a', 'font-size')).toBe('10.5px');
    expect(await styleOf(page, '.navbar__links', 'order')).toBe('0');
  });
});

test.describe('reduced motion (R22)', () => {
  test('reduced motion: building, hint and ticker animations switch off while content stays reachable', async ({
    page,
  }) => {
    await page.goto('/en/');

    expect(await styleOf(page, '.hint .arr', 'animation-name')).toBe('nudge');
    expect(await styleOf(page, '.ticker__inner', 'animation-name')).toBe('ticker-slide');
    expect(await styleOf(page, '.b-plategroup', 'transition-duration')).toBe('0.25s');

    await page.emulateMedia({ reducedMotion: 'reduce' });

    expect(await styleOf(page, '.hint .arr', 'animation-name')).toBe('none');
    expect(await styleOf(page, '.ticker__inner', 'animation-name')).toBe('none');
    expect(await styleOf(page, '.b-plategroup', 'transition-duration')).toBe('0s');

    await expect(page.locator('.hint')).toBeVisible();
    await expect(page.locator('.ticker')).toBeVisible();
    await page.locator('#dept-research').click();
    await expect(page.locator('#dept-panel-research')).toHaveClass(/open/);
    await expect(page.locator('#dept-panel-title-research')).toBeFocused();
  });
});
