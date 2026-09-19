import { expect, test, type Page } from '@playwright/test';

const NIGHT_BG = 'rgb(22, 19, 13)';

async function collectPageErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  return errors;
}

test.describe('building interactions (T5 — R4, R22)', () => {
  test('clicking a floor opens its panel in place and focuses the panel title', async ({ page }) => {
    await page.goto('/en/');
    await page.locator('#dept-research').click();

    await expect(page.locator('#dept-panel-research')).toHaveClass(/open/);
    await expect(page.locator('#dept-research')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#dept-panel-research')).toBeVisible();
    await expect(page.locator('#dept-panel-title-research')).toBeFocused();
  });

  test('panels are single-open: opening another floor closes the first', async ({ page }) => {
    await page.goto('/en/');
    await page.locator('#dept-research').click();
    await expect(page.locator('#dept-panel-research')).toHaveClass(/open/);

    await page.locator('#dept-telemetry').click();
    await expect(page.locator('#dept-panel-telemetry')).toHaveClass(/open/);
    await expect(page.locator('#dept-panel-research')).not.toHaveClass(/open/);
    await expect(page.locator('#dept-research')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#dept-telemetry')).toHaveAttribute('aria-expanded', 'true');
  });

  test('clicking the open floor closes it and refocuses the floor button', async ({ page }) => {
    await page.goto('/en/');
    await page.locator('#dept-operations').click();
    await expect(page.locator('#dept-panel-operations')).toHaveClass(/open/);

    await page.locator('#dept-operations').click();
    await expect(page.locator('#dept-panel-operations')).not.toHaveClass(/open/);
    await expect(page.locator('#dept-operations')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#dept-operations')).toBeFocused();
  });

  test('the panel close button closes it and returns focus to the floor button', async ({ page }) => {
    await page.goto('/en/');
    await page.locator('#dept-tooling').click();
    await expect(page.locator('#dept-panel-tooling')).toHaveClass(/open/);

    await page.locator('#dept-panel-tooling [data-close-panel]').click();
    await expect(page.locator('#dept-panel-tooling')).not.toHaveClass(/open/);
    await expect(page.locator('#dept-tooling')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#dept-tooling')).toBeFocused();
  });

  test('Escape closes the open panel and refocuses the floor button', async ({ page }) => {
    await page.goto('/en/');
    await page.locator('#dept-people').click();
    await expect(page.locator('#dept-panel-title-people')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.locator('#dept-panel-people')).not.toHaveClass(/open/);
    await expect(page.locator('#dept-people')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#dept-people')).toBeFocused();
  });

  test('hashchange opens the encoded panel and focuses its title', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('#dept-panel-operations')).not.toHaveClass(/open/);

    await page.evaluate(() => {
      window.location.hash = '#dept-operations';
    });
    await expect(page.locator('#dept-panel-operations')).toHaveClass(/open/);
    await expect(page.locator('#dept-operations')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#dept-panel-title-operations')).toBeFocused();
  });

  test('an initial #dept- hash opens the panel without the script stealing focus', async ({ page }) => {
    await page.goto('/en/#dept-operations');
    await expect(page.locator('#dept-panel-operations')).toHaveClass(/open/);
    await expect(page.locator('#dept-operations')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#dept-panel-title-operations')).not.toBeFocused();
    expect(await page.evaluate(() => document.activeElement?.id)).toBe('dept-operations');
  });

  test('an unknown #dept- hash is a no-op without errors', async ({ page }) => {
    const errors = await collectPageErrors(page);
    await page.goto('/en/#dept-nope');

    await expect(page.locator('.dept-panel.open')).toHaveCount(0);
    for (const key of ['research', 'telemetry', 'tooling', 'people', 'operations', 'frontdesk']) {
      await expect(page.locator(`#dept-${key}`)).toHaveAttribute('aria-expanded', 'false');
    }
    expect(errors).toEqual([]);
  });

  test('reduced motion: panels still open and close without errors', async ({ page }) => {
    const errors = await collectPageErrors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/');

    await page.locator('#dept-research').click();
    await expect(page.locator('#dept-panel-research')).toHaveClass(/open/);
    await expect(page.locator('#dept-panel-title-research')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.locator('#dept-panel-research')).not.toHaveClass(/open/);
    expect(errors).toEqual([]);
  });
});

test.describe('night mode (T5 — R16)', () => {
  test('the toggle flips the attribute, persists the choice and keeps aria-pressed truthful', async ({ page }) => {
    await page.goto('/en/');
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

  test('the stored preference survives reload and the splash navigation', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('jordimp-night', '1'));
    await page.goto('/en/');
    await expect(page.locator('html')).toHaveAttribute('data-night', '1');
    await expect(page.locator('[data-night-toggle]')).toHaveAttribute('aria-pressed', 'true');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-night', '1');

    await page.goto('/');
    await page.waitForURL(/\/en\/$/);
    await expect(page.locator('html')).toHaveAttribute('data-night', '1');
    await expect(page.locator('[data-night-toggle]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('system dark applies when nothing is stored', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/en/');
    await expect(page.locator('html')).toHaveAttribute('data-night', '1');
    await expect(page.locator('[data-night-toggle]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('body')).toHaveCSS('background-color', NIGHT_BG);
  });

  test('a stored preference wins over the system scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addInitScript(() => localStorage.setItem('jordimp-night', '0'));
    await page.goto('/en/');
    await expect(page.locator('html')).not.toHaveAttribute('data-night');
    await expect(page.locator('[data-night-toggle]')).toHaveAttribute('aria-pressed', 'false');
  });

  test('a live system scheme change is followed while nothing is stored', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('html')).not.toHaveAttribute('data-night');

    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveAttribute('data-night', '1');
    await expect(page.locator('[data-night-toggle]')).toHaveAttribute('aria-pressed', 'true');

    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).not.toHaveAttribute('data-night');
    await expect(page.locator('[data-night-toggle]')).toHaveAttribute('aria-pressed', 'false');
  });
});
