import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { LOCALES, PAGES } from '../src/data/content.ts';
import { dirRoute } from '../src/lib/paths.ts';

const DIST = new URL('../dist', import.meta.url).pathname;
const SITE_HOSTS = new Set(['jordimp.net', 'www.jordimp.net']);
const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const ATTEMPTS = 3;
const BACKOFF_MS = 2000;

const PHONE_PATTERNS = [
  { name: 'known-contact-literal', pattern: /609[ .-]?940[ .-]?649/ },
  { name: 'spanish-mobile-groups', pattern: /(\+34[ .-]?)?\b[67]\d{2}([ .-]\d{2,3}){2,3}\b/ },
];

const ADDRESS_PATTERNS = [
  // em/en dashes stay out of the window: the copy's own street metaphors
  // ("ONE-WAY STREET — DEPLOYS ONLY") must not read as a leaked address
  { name: 'street-address', pattern: /\b(?:c\/|carrer|calle|avinguda|passeig|plaza|plaça|street|road|avenue|avenida)\b[^.<\d—–]{0,60}\b\d{1,4}\b/i },
  { name: 'barcelona-postal-code', pattern: /\b080\d{2}\b/ },
];

const CONTACT_PATTERNS = [...PHONE_PATTERNS, ...ADDRESS_PATTERNS];

const LEGACY_EMAIL_PATTERNS = [{ name: 'legacy-gmail', pattern: /gmail\.com/i }];

const SRC = new URL('../src', import.meta.url).pathname;
const TESTS = new URL('../tests', import.meta.url).pathname;

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'" };

function pageRoutes() {
  return Object.values(PAGES).map((page) => ({
    dir: dirRoute(page.route),
    title: page.title,
    description: page.description,
  }));
}

function listHtmlFiles(dir) {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return listHtmlFiles(full);
    return entry.endsWith('.html') ? [full] : [];
  });
}

function textContent(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

function decodeEntities(text) {
  return text.replace(/&(?:amp|lt|gt|quot|apos|#39);/g, (match) => ENTITIES[match]);
}

function htmlLang(html) {
  const match = html.match(/<html[^>]*\blang="([a-zA-Z-]+)"/i);
  return match ? match[1].toLowerCase() : null;
}

function pageTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1].trim()) : null;
}

function metaDescription(html) {
  const tag = html.match(/<meta[^>]*\bname="description"[^>]*>/i);
  if (!tag) return null;
  const match = tag[0].match(/\bcontent="([^"]*)"/i);
  return match ? decodeEntities(match[1]) : null;
}

function scanForPatterns(files, patterns, label) {
  const violations = [];
  for (const file of files) {
    const text = textContent(readFileSync(file, 'utf8'));
    for (const { name, pattern } of patterns) {
      if (pattern.test(text)) violations.push(`${label} pattern "${name}" matched in ${file}`);
    }
  }
  return violations;
}

function listTextFiles(dir, extensions) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return listTextFiles(full, extensions);
    return extensions.some((extension) => entry.endsWith(extension)) ? [full] : [];
  });
}

function scanForbiddenStrings(files, patterns) {
  const violations = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const { name, pattern } of patterns) {
      if (pattern.test(text)) violations.push(`forbidden pattern "${name}" matched in ${file}`);
    }
  }
  return violations;
}

function isOffHost(href) {
  let resolved;
  try {
    resolved = new URL(href, 'https://jordimp.net');
  } catch {
    return false;
  }
  const webScheme = resolved.protocol === 'http:' || resolved.protocol === 'https:';
  return webScheme && !SITE_HOSTS.has(resolved.hostname.toLowerCase());
}

function extractOffHostUrls(files) {
  const urls = new Set();
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    for (const match of html.matchAll(/href="(https?:\/\/[^"]*)"/g)) {
      if (isOffHost(match[1])) urls.add(match[1]);
    }
  }
  return [...urls].sort();
}

async function checkUrl(url) {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, { method: 'GET', headers: { 'User-Agent': USER_AGENT }, redirect: 'follow' });
      if (response.status < 400) return { url, ok: true, status: response.status };
      if (attempt === ATTEMPTS) return { url, ok: false, status: response.status };
    } catch {
      if (attempt === ATTEMPTS) return { url, ok: false, status: 'transport-error' };
    }
    await new Promise((resolve) => setTimeout(resolve, BACKOFF_MS));
  }
  return { url, ok: false, status: 'unreachable' };
}

function selfTest() {
  const fixtures = [
    { name: 'phone detector', flagged: 'call me at 609 940 649 today', clean: 'no digits here, just 12345 and 12 34' },
    { name: 'address detector', flagged: 'visit the office at Carrer de la Indústria 118, 08025 Barcelona', clean: 'the roadmap 2017 lists no plaza works' },
  ];
  const problems = [];
  for (const { name, flagged, clean } of fixtures) {
    const detects = CONTACT_PATTERNS.some(({ pattern }) => pattern.test(flagged));
    if (!detects) problems.push(`${name} did not flag the fixture "${flagged}"`);
    const ignores = CONTACT_PATTERNS.every(({ pattern }) => !pattern.test(clean));
    if (!ignores) problems.push(`${name} flagged the benign fixture "${clean}"`);
  }
  if (problems.length > 0) {
    console.error('self-test FAILED:');
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log('self-test OK: contact detectors flag phone/address fixtures and ignore benign text');
}

function census(files, routes) {
  const problems = [];
  const localePrefixes = LOCALES.map((lang) => `${DIST}/${lang}/`);
  const localePages = files.filter((file) => localePrefixes.some((prefix) => file.startsWith(prefix)));
  const rootLevel = files.filter((file) => !localePrefixes.some((prefix) => file.startsWith(prefix))).sort();
  const expectedRoot = [`${DIST}/404.html`, `${DIST}/index.html`];

  const expected = new Set();
  for (const lang of LOCALES) {
    for (const route of routes) {
      expected.add(join(DIST, lang, route.dir, 'index.html'));
    }
  }
  const found = new Set(localePages);
  const missing = [...expected].filter((path) => !found.has(path));
  const extra = localePages.filter((path) => !expected.has(path));

  console.log(`page inventory: ${files.length} HTML files = ${localePages.length} locale pages + ${rootLevel.length} root-level`);
  console.log(`  locale: ${routes.length} routes from src/data (PAGES) x ${LOCALES.length} locales = ${expected.size}`);

  if (expected.size !== routes.length * LOCALES.length) {
    problems.push(`route matrix collided: ${routes.length} routes x ${LOCALES.length} locales should be ${routes.length * LOCALES.length}, set holds ${expected.size}`);
  }
  if (files.length !== expected.size + expectedRoot.length) {
    problems.push(`page count drifted: expected ${expected.size + expectedRoot.length} HTML files, found ${files.length}`);
  }
  for (const path of missing) problems.push(`missing locale page: ${path}`);
  for (const path of extra) problems.push(`unexpected locale page: ${path}`);
  if (rootLevel.length !== expectedRoot.length || rootLevel.some((file, index) => file !== expectedRoot[index])) {
    problems.push(`root-level HTML drift: expected exactly ${expectedRoot.join(' + ')}, found ${rootLevel.join(', ') || 'none'}`);
  }
  return problems;
}

function trilingualCompleteness(routes) {
  const problems = [];
  let checked = 0;
  for (const lang of LOCALES) {
    for (const route of routes) {
      const file = join(DIST, lang, route.dir, 'index.html');
      if (!existsSync(file)) continue;
      const html = readFileSync(file, 'utf8');
      checked += 1;
      if (htmlLang(html) !== lang) {
        problems.push(`/${lang}/${route.dir} html lang is "${htmlLang(html)}", expected "${lang}"`);
      }
      if (pageTitle(html) !== route.title[lang]) {
        problems.push(`/${lang}/${route.dir} title is "${pageTitle(html)}", expected "${route.title[lang]}"`);
      }
      if (metaDescription(html) !== route.description[lang]) {
        problems.push(`/${lang}/${route.dir} description is "${metaDescription(html)}", expected "${route.description[lang]}"`);
      }
    }
  }
  console.log(`trilingual completeness: ${checked} pages checked against PAGES titles/descriptions and html lang`);
  return problems;
}

async function main() {
  if (process.argv.includes('--self-test')) {
    selfTest();
    return;
  }
  if (!existsSync(DIST)) {
    console.error('content QA FAILED: dist/ not found — run "npm run build" first');
    process.exit(1);
  }
  const routes = pageRoutes();
  const files = listHtmlFiles(DIST);
  const problems = census(files, routes);
  problems.push(...trilingualCompleteness(routes));
  problems.push(...scanForPatterns(files, PHONE_PATTERNS, 'phone'));
  problems.push(...scanForPatterns(files, ADDRESS_PATTERNS, 'address'));
  console.log('phone/address scan: clean (visible text of all HTML files)');

  const sourceFiles = [
    ...listTextFiles(SRC, ['.ts', '.astro', '.json', '.snap']),
    ...listTextFiles(TESTS, ['.ts', '.json']),
  ];
  problems.push(...scanForbiddenStrings(sourceFiles, LEGACY_EMAIL_PATTERNS));
  problems.push(...scanForPatterns(files, LEGACY_EMAIL_PATTERNS, 'legacy-email'));
  console.log(`legacy-email scan: clean (${sourceFiles.length} source/test files + visible text of ${files.length} HTML files)`);

  const urls = extractOffHostUrls(files);
  console.log(`live links: checking ${urls.length} off-host URLs from dist HTML:`);
  for (const url of urls) {
    const result = await checkUrl(url);
    console.log(`  ${result.ok ? 'OK ' : 'FAIL'} ${result.status} ${url}`);
    if (!result.ok) problems.push(`external link unreachable (${result.status}): ${url}`);
  }

  if (problems.length > 0) {
    console.error('content QA FAILED:');
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log('content QA OK');
}

await main();
