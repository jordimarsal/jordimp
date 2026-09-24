import { chromium } from '@playwright/test';

// Regenerates public/og-building.png (1200x630): night elevation of the
// building section, scaled and centered. Run: node scripts/og-building.mjs
// (requires `npm run preview` serving dist/ on :4321, or edit BASE).
const BASE = process.env.OG_BASE ?? 'http://localhost:4321/en/';
const OUT = new URL('../public/og-building.png', import.meta.url).pathname;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
});
await page.goto(BASE);
await page.waitForTimeout(400);
await page.evaluate(() => document.documentElement.setAttribute('data-night', '1'));
await page.waitForTimeout(800);
await page.evaluate(() => {
  const sky = document.querySelector('.sky');
  if (!sky) throw new Error('.sky not found');
  document.querySelectorAll('body > *').forEach((n) => {
    if (!n.contains(sky)) n.style.display = 'none';
  });
  sky.style.position = 'fixed';
  sky.style.inset = '0';
  sky.style.zIndex = '9999';
  sky.style.border = 'none';
  sky.style.boxShadow = 'none';
  const stack = sky.querySelector('.building-stack');
  if (!stack) throw new Error('.building-stack not found');
  const box = stack.getBoundingClientRect();
  const scale = Math.min(1140 / box.width, 575 / box.height);
  stack.style.transformOrigin = 'top left';
  const left = (1200 - box.width * scale) / 2;
  const top = (630 - box.height * scale) / 2;
  stack.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
});
await page.waitForTimeout(300);
await page.screenshot({ path: OUT });
await browser.close();
console.log('saved', OUT);
