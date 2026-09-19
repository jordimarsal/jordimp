import { expect, test, type Page } from '@playwright/test';

const DAY_BG = 'rgb(246, 245, 242)';
const NIGHT_BG = 'rgb(22, 19, 13)';

async function collectPageErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  return errors;
}

test.describe('404 page (T10 — R14, R16, R22)', () => {
  test('serves the custom 404 with bricked-wall art for any unknown path', async ({ request }) => {
    const response = await request.get('/nope/');
    expect(response.status()).toBe(404);
    const html = await response.text();
    expect(html).toContain('nf-art');
    expect(html).toContain('404 — DEPARTMENT NOT FOUND');
    expect(html).toContain('<h1>Department not found</h1>');
    expect(html).toContain('<meta name="robots" content="noindex"');
  });

  test('keeps every asset and link root-absolute so it resolves at any depth', async ({ request }) => {
    const response = await request.get('/a/b/c/');
    expect(response.status()).toBe(404);
    const html = await response.text();
    const urls = [...html.matchAll(/\b(?:src|href)="([^"]*)"/g)].map((match) => match[1]);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      const safe =
        url.startsWith('/') ||
        url.startsWith('#') ||
        /^(https?:|mailto:|data:)/.test(url);
      expect(safe, `URL is depth-relative: ${url}`).toBe(true);
    }
    const stylesheet = urls.find((url) => url.includes('.css'));
    expect(stylesheet).toBeDefined();
    expect((await request.get(stylesheet as string)).status()).toBe(200);
  });

  test('renders the styled page when served at nested depth', async ({ page }) => {
    const errors = await collectPageErrors(page);
    await page.goto('/a/b/c/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('svg.nf-art')).toBeVisible();
    await expect(page.locator('body')).toHaveCSS('background-color', DAY_BG);
    expect(errors).toEqual([]);
  });

  test('the night toggle flips, persists and keeps aria-pressed truthful', async ({ page }) => {
    await page.goto('/nope/');
    const html = page.locator('html');
    const toggle = page.locator('[data-night-toggle]');
    await expect(html).not.toHaveAttribute('data-night');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await toggle.click();
    await expect(html).toHaveAttribute('data-night', '1');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('body')).toHaveCSS('background-color', NIGHT_BG);
    expect(await page.evaluate(() => localStorage.getItem('jordimp-night'))).toBe('1');

    await toggle.click();
    await expect(html).not.toHaveAttribute('data-night');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(await page.evaluate(() => localStorage.getItem('jordimp-night'))).toBe('0');
  });

  test('carries no false aria-current in the navbar links', async ({ page }) => {
    await page.goto('/nope/');
    await expect(page.locator('.navbar__links a[aria-current="page"]')).toHaveCount(0);
  });

  test('offers one language pill per locale with localized labels', async ({ page }) => {
    await page.goto('/nope/');
    const pills = page.locator('.hero .pills a.case');
    await expect(pills).toHaveCount(3);
    const expected = [
      ['en', '/en/', 'EN — Back to the building'],
      ['es', '/es/', 'ES — Volver al edificio'],
      ['ca', '/ca/', 'CA — Torna a l’edifici'],
    ] as const;
    for (const [locale, href, label] of expected) {
      const pill = page.locator(`.hero .pills a.case[hreflang="${locale}"]`);
      await expect(pill).toHaveCount(1);
      await expect(pill).toHaveAttribute('href', href);
      await expect(pill).toHaveAttribute('hreflang', locale);
      await expect(pill).toHaveText(label);
    }
  });

  test('stays reachable and error-free with reduced motion', async ({ page }) => {
    const errors = await collectPageErrors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/nope/');
    await expect(page.locator('svg.nf-art')).toBeVisible();
    await page.locator('[data-night-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-night', '1');
    expect(errors).toEqual([]);
  });
});
