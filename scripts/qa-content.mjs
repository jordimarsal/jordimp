import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname;
const LOCALES = ['en', 'es', 'ca'];
const STATIC_ROUTES = ['', 'about', 'cv', 'experience', 'projects', 'skills'];
const BINARY_EXTENSIONS = new Set(['.pdf', '.png', '.ico', '.jpg', '.jpeg', '.webp', '.svg', '.woff', '.woff2', '.zip']);

const PHONE_PATTERNS = [
  { name: 'known-contact-literal', pattern: /609[ .-]?940[ .-]?649/ },
  { name: 'spanish-mobile-groups', pattern: /(\+34[ .-]?)?\b[67]\d{2}([ .-]\d{2,3}){2,3}\b/ },
];

function projectSlugs() {
  const dir = new URL('../src/content/projects', import.meta.url).pathname;
  return readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
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

function scanForPhones(files) {
  const violations = [];
  for (const file of files) {
    if (BINARY_EXTENSIONS.has(extname(file))) continue;
    const text = textContent(readFileSync(file, 'utf8'));
    for (const { name, pattern } of PHONE_PATTERNS) {
      if (pattern.test(text)) violations.push({ file, pattern: name });
    }
  }
  return violations;
}

function selfTest() {
  const flagged = PHONE_PATTERNS.some(({ pattern }) => pattern.test('call me at 609 940 649 today'));
  if (!flagged) {
    console.error('self-test FAILED: detector did not flag the 609 940 649 fixture');
    process.exit(1);
  }
  const clean = PHONE_PATTERNS.every(({ pattern }) => !pattern.test('no digits here, just 12345 and 12 34'));
  if (!clean) {
    console.error('self-test FAILED: detector flagged a benign fixture');
    process.exit(1);
  }
  console.log('self-test OK: detector flags the 609 940 649 fixture and ignores benign text');
}

function structuralInventory() {
  const files = listHtmlFiles(DIST);
  const localePrefixes = LOCALES.map((l) => `${DIST}/${l}/`);
  const localePages = files.filter((f) => localePrefixes.some((p) => f.startsWith(p)));
  const rootLevel = files.filter((f) => !localePrefixes.some((p) => f.startsWith(p))).sort();
  const expectedRoot = [`${DIST}/404.html`, `${DIST}/index.html`];
  const slugs = projectSlugs();
  const expectedLocaleCount = (STATIC_ROUTES.length + slugs.length) * LOCALES.length;

  console.log(`page inventory: ${files.length} HTML files = ${localePages.length} locale pages + ${rootLevel.length} root-level`);
  console.log(`  locale: ${STATIC_ROUTES.length} static routes + ${slugs.length} project details = ${STATIC_ROUTES.length + slugs.length} routes x ${LOCALES.length} locales = ${expectedLocaleCount}`);

  const problems = [];
  if (localePages.length !== expectedLocaleCount) {
    problems.push(`expected ${expectedLocaleCount} locale pages, found ${localePages.length}`);
  }
  if (expectedLocaleCount !== 51) {
    problems.push(`route matrix drifted: expected 51 locale pages, matrix yields ${expectedLocaleCount}`);
  }
  if (rootLevel.length !== expectedRoot.length || rootLevel.some((f, i) => f !== expectedRoot[i])) {
    problems.push(`root-level HTML drift: expected exactly ${expectedRoot.join(' + ')}, found ${rootLevel.join(', ') || 'none'}`);
  }
  return problems;
}

function main() {
  if (process.argv.includes('--self-test')) {
    selfTest();
    return;
  }
  const files = listHtmlFiles(DIST);
  const problems = structuralInventory();
  const violations = scanForPhones(files);
  for (const { file, pattern } of violations) {
    problems.push(`phone pattern "${pattern}" matched in ${file}`);
  }
  if (problems.length > 0) {
    console.error('content QA FAILED:');
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log('phone scan: clean (PDFs and binaries skipped)');
  console.log('content QA OK');
}

main();
