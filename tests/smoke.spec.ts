import { readdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const LOCALES = ['en', 'es', 'ca'] as const;
type Locale = (typeof LOCALES)[number];

const STATIC_ROUTES = ['', 'about', 'cv', 'experience', 'projects', 'skills'];
const PROJECT_SLUGS = readdirSync(new URL('../src/content/projects', import.meta.url))
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''));
const ROUTE_COUNT = STATIC_ROUTES.length * LOCALES.length + PROJECT_SLUGS.length * LOCALES.length;

const HOME_TITLE_STEMS: Record<Locale, string> = {
  en: 'Senior Backend Engineer',
  es: 'Ingeniero Backend Senior',
  ca: 'Enginyer de Software Backend Sènior',
};

const EXPERIENCE_H1: Record<Locale, string> = {
  en: 'Experience',
  es: 'Experiencia',
  ca: 'Experiència',
};

function localeRoutes(): string[] {
  const paths = [
    ...STATIC_ROUTES.map((r) => (r ? `${r}/` : '')),
    ...PROJECT_SLUGS.map((slug) => `projects/${slug}/`),
  ];
  return LOCALES.flatMap((locale) => paths.map((p) => `/${locale}/${p}`));
}

test('render: all 51 locale routes respond 200', async ({ request }) => {
  const routes = localeRoutes();
  expect(routes).toHaveLength(51);
  expect(ROUTE_COUNT).toBe(51);
  for (const route of routes) {
    const response = await request.get(route);
    expect(response.ok(), `${route} → ${response.status()}`).toBe(true);
  }
});

test('render: unknown path returns the custom 404', async ({ request }) => {
  const response = await request.get('/nonexistent/');
  expect(response.status()).toBe(404);
  expect(await response.text()).toContain('Page not found');
});

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
  await page.goto('/en/about/');
  const switcher = page.locator('nav[aria-label="Language"]');
  for (const target of ['es', 'ca'] as const) {
    const link = switcher.locator(`a[hreflang="${target}"]`);
    await expect(link).toHaveAttribute('href', `/${target}/about/`);
    const responsePromise = page.waitForResponse((r) => r.url().endsWith(`/${target}/about/`));
    await link.click();
    expect((await responsePromise).status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', target);
    await expect(page).toHaveURL(new RegExp(`/${target}/about/$`));
    await page.goBack();
  }
});

test('i18n: locale homes carry correct lang and distinct titles', async ({ page }) => {
  const titles: string[] = [];
  for (const locale of LOCALES) {
    await page.goto(`/${locale}/`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    const title = await page.title();
    expect(title).toContain(HOME_TITLE_STEMS[locale]);
    titles.push(title);
  }
  expect(new Set(titles).size).toBe(3);
});

test('i18n: localized headings differ per locale', async ({ page }) => {
  const headings: string[] = [];
  for (const locale of LOCALES) {
    await page.goto(`/${locale}/experience/`);
    const h1 = page.locator('h1.page-h1');
    await expect(h1).toHaveText(`./${EXPERIENCE_H1[locale]}`);
    headings.push(await h1.innerText());
  }
  expect(new Set(headings).size).toBe(3);
});
