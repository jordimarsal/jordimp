import { expect, test, type Page } from '@playwright/test';

const SPLASH_TITLE = 'JORDIMP & CO. — Jordi Marçal Poy';
const REDIRECT_TARGET = /\/en\/$/;

function holdSplash(page: Page): Promise<void> {
  return page.route(REDIRECT_TARGET, (route) => route.fulfill({ status: 204 }));
}

test('splash: renders spike markup with fallbacks and no external loads', async ({ page }) => {
  await holdSplash(page);
  await page.goto('/');

  await expect(page).toHaveTitle(SPLASH_TITLE);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.splash')).toHaveAttribute('role', 'status');
  await expect(page.locator('.tile')).toHaveText('J&Co');
  await expect(page.locator('.brand')).toHaveText('JORDIMP & CO.');
  await expect(page.locator('.sub')).toHaveText('Jordi Marçal Poy · EST. 2017 · BARCELONA');
  await expect(page.locator('.bar')).toHaveCSS('animation-name', 'slide');

  const refresh = page.locator('meta[http-equiv="refresh"]');
  await expect(refresh).toHaveCount(1);
  await expect(refresh).toHaveAttribute('content', '1; url=/en/');

  const fallback = page.locator('a.fallback');
  await expect(fallback).toHaveAttribute('href', '/en/');
  await expect(fallback).toHaveText(`${SPLASH_TITLE} →`);

  await expect(page.locator('link[rel="stylesheet"]')).toHaveCount(0);
  await expect(page.locator('script[src]')).toHaveCount(0);
});

test('splash: night bootstrap applies the stored preference', async ({ page }) => {
  await holdSplash(page);
  await page.addInitScript(() => localStorage.setItem('jordimp-night', '1'));
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('data-night', '1');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(22, 19, 13)');
});

test('splash: redirects to the default locale home', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL(REDIRECT_TARGET);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('splash: reduced motion disables the bar animation', async ({ request }) => {
  const response = await request.get('/');
  expect(response.ok(), `GET / → ${response.status()}`).toBe(true);
  expect(await response.text()).toContain(
    '@media (prefers-reduced-motion: reduce) { .bar { animation:none; } }'
  );
});

test('splash: reduced motion skips the redirect delay', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const start = Date.now();
  await page.goto('/');
  await page.waitForURL(REDIRECT_TARGET, { waitUntil: 'commit' });

  expect(Date.now() - start).toBeLessThan(700);
});

test.describe('splash without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('meta refresh fallback navigates to the default locale home', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(REDIRECT_TARGET, { timeout: 5_000 });
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
