import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { LOCALES, FLOOR_ORDER } from '../src/data/content.ts';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const FIXTURE = new URL('../tests/fixtures/parity.json', import.meta.url).pathname;

const canon = (text) => text.replace(/\s+/g, ' ').trim();

function listHtmlFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return listHtmlFiles(full);
    return entry.endsWith('.html') ? [full] : [];
  });
}

function fileToRoute(file) {
  return `/${relative(DIST, file).replace(/index\.html$/, '')}`;
}

async function routeFixture(page, file) {
  await page.goto(pathToFileURL(file).href);
  return {
    title: await page.title(),
    description: canon((await page.locator('meta[name="description"]').getAttribute('content')) ?? ''),
    h1: canon((await page.locator('main h1').textContent()) ?? ''),
    mainText: canon((await page.locator('main').textContent()) ?? ''),
  };
}

async function splashFixture(page) {
  await page.goto(pathToFileURL(join(DIST, 'index.html')).href);
  return {
    title: await page.title(),
    description: (await page.locator('meta[name="description"]').getAttribute('content')) ?? '',
    sub: canon((await page.locator('.splash .sub').textContent()) ?? ''),
    metaRefresh: (await page.locator('meta[http-equiv="refresh"]').getAttribute('content')) ?? '',
    fallbackHref: (await page.locator('.splash a.fallback').getAttribute('href')) ?? '',
  };
}

async function platesFixture(page, locale) {
  await page.goto(pathToFileURL(join(DIST, locale, 'index.html')).href);
  const plates = {};
  for (const key of FLOOR_ORDER) {
    const floor = page.locator(`.floor-btn#dept-${key}`);
    plates[key] = {
      code: canon((await floor.locator('.b-plate-code').first().textContent()) ?? ''),
      name: await floor
        .locator('.b-plate-name, .b-plate-name--dark')
        .first()
        .evaluate((el) => (el.childNodes[0]?.textContent ?? '').replace(/\s+/g, ' ').trim()),
      suffix: canon((await floor.locator('.b-plate-suffix').first().textContent()) ?? ''),
    };
  }
  return plates;
}

async function flagsFixture(page, locale) {
  await page.goto(pathToFileURL(join(DIST, locale, 'index.html')).href);
  const roofs = page.locator('svg[role="img"]');
  const variants = await roofs.count();
  const fills = async (variant) =>
    roofs
      .nth(variant)
      .locator('rect[x="780"]')
      .evaluateAll((rects) =>
        rects.map((r) => r.getAttribute('fill')).filter((fill) => fill && fill !== 'none')
      );
  const first = await fills(0);
  for (let variant = 1; variant < variants; variant++) {
    const other = await fills(variant);
    if (JSON.stringify(other) !== JSON.stringify(first)) {
      throw new Error(`${locale}: roof variant ${variant} fills ${JSON.stringify(other)} differ from variant 0 ${JSON.stringify(first)}`);
    }
  }
  return first;
}

const browser = await chromium.launch();
const page = await browser.newPage();

const routeEntries = [];
for (const file of listHtmlFiles(DIST)) {
  const route = fileToRoute(file);
  if (route === '/' || route === '/404.html') continue;
  routeEntries.push([route, await routeFixture(page, file)]);
}
routeEntries.sort(([a], [b]) => (a < b ? -1 : 1));
const routes = Object.fromEntries(routeEntries);

const fixture = {
  _meta: {
    source: 'dist/ (the Astro build CI gates), distilled by scripts/distill-parity.mjs',
    adr: 'design.md ADR-6 — parity via committed golden fixtures, not byte-diff',
    regenerate: 'npm run build && node scripts/distill-parity.mjs; never hand-edit',
    conventions:
      'route keys use the production directory routes; whitespace normalized; the flags array is pinned per roof variant and variants must match',
    counts: { localeRoutes: routeEntries.length, pages: routeEntries.length + 2 },
  },
  splash: await splashFixture(page),
  notFound: await routeFixture(page, join(DIST, '404.html')),
  routes,
  plates: {},
  flags: {},
};

for (const locale of LOCALES) {
  fixture.plates[locale] = await platesFixture(page, locale);
  fixture.flags[locale] = await flagsFixture(page, locale);
}

await browser.close();
writeFileSync(FIXTURE, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`distilled ${routeEntries.length} routes into tests/fixtures/parity.json`);
