import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { CATEGORY_KEYS, mergeHistory } from '../src/lib/quality.ts';

const LHCI_DIR = process.env.QUALITY_LHCI_DIR ?? '.lighthouseci';
const VITEST_JSON = process.env.QUALITY_VITEST_JSON ?? 'reports/vitest.json';
const PLAYWRIGHT_JSON = process.env.QUALITY_PLAYWRIGHT_JSON ?? 'reports/playwright.json';
const DIST = process.env.QUALITY_DIST ?? 'dist';
const OUT = process.env.QUALITY_OUT ?? 'src/data/quality.json';
const PACKAGE_JSON = process.env.QUALITY_PACKAGE_JSON ?? 'package.json';

const LH_CATEGORIES = {
  performance: 'performance',
  accessibility: 'accessibility',
  'best-practices': 'bestPractices',
  seo: 'seo',
};

const fail = (message) => {
  console.error(`collect-quality FAILED: ${message}`);
  process.exit(1);
};

function lighthouseMinAcrossUrls() {
  if (!existsSync(LHCI_DIR)) fail(`Lighthouse reports dir not found: ${LHCI_DIR}`);
  const files = readdirSync(LHCI_DIR).filter((f) => /^lhr-.*\.json$/.test(f));
  if (files.length === 0) fail(`no lhr-*.json reports inside ${LHCI_DIR}`);
  const lastByUrl = new Map();
  for (const file of files) {
    const report = JSON.parse(readFileSync(join(LHCI_DIR, file), 'utf8'));
    const url = report.requestedUrl ?? report.finalUrl;
    if (!url) fail(`lighthouse report ${file} carries no requestedUrl/finalUrl`);
    const fetchTime = report.fetchTime ?? '';
    const previous = lastByUrl.get(url);
    if (!previous || fetchTime > previous.fetchTime) lastByUrl.set(url, { fetchTime, report });
  }
  const mins = {};
  for (const key of CATEGORY_KEYS) mins[key] = 1;
  for (const { report } of lastByUrl.values()) {
    for (const [lhKey, ourKey] of Object.entries(LH_CATEGORIES)) {
      const score = report.categories?.[lhKey]?.score;
      if (typeof score !== 'number') fail(`lighthouse report for ${url} misses a numeric score for ${lhKey}`);
      mins[ourKey] = Math.min(mins[ourKey], score);
    }
  }
  return mins;
}

function vitestTotals() {
  if (!existsSync(VITEST_JSON)) fail(`vitest JSON report not found: ${VITEST_JSON}`);
  const report = JSON.parse(readFileSync(VITEST_JSON, 'utf8'));
  const total = report.numTotalTests;
  const passed = report.numPassedTests;
  if (typeof total !== 'number' || typeof passed !== 'number') {
    fail(`vitest JSON report ${VITEST_JSON} carries no numTotalTests/numPassedTests`);
  }
  return { total, passed };
}

function countPlaywrightTests(suite, counter) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      counter.total += 1;
      const status = test.results?.[test.results.length - 1]?.status;
      if (status === 'passed') counter.passed += 1;
    }
  }
  for (const child of suite.suites ?? []) countPlaywrightTests(child, counter);
}

function playwrightTotals() {
  if (!existsSync(PLAYWRIGHT_JSON)) fail(`playwright JSON report not found: ${PLAYWRIGHT_JSON}`);
  const report = JSON.parse(readFileSync(PLAYWRIGHT_JSON, 'utf8'));
  const counter = { total: 0, passed: 0 };
  for (const suite of report.suites ?? []) countPlaywrightTests(suite, counter);
  if (counter.total === 0) fail(`playwright JSON report ${PLAYWRIGHT_JSON} contains no tests`);
  return counter;
}

function walkFiles(dir, predicate, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (statSync(full).isDirectory()) walkFiles(full, predicate, acc);
    else if (predicate(entry.name)) acc.push(full);
  }
  return acc;
}

function repoStats() {
  const pagesGenerated = walkFiles(DIST, (name) => name.endsWith('.html')).length;
  if (pagesGenerated === 0) fail(`no HTML files found under ${DIST} — run the build first`);
  const assets = walkFiles(DIST, (name) => /\.(js|css)$/.test(name) && !name.endsWith('.map'));
  const bytes = assets.reduce((sum, file) => sum + statSync(file).size, 0);
  const bundleKb = Math.round(bytes / 1024);
  const pkg = JSON.parse(readFileSync(PACKAGE_JSON, 'utf8'));
  return {
    pagesGenerated,
    bundleKb,
    deps: { prod: Object.keys(pkg.dependencies ?? {}).length, dev: Object.keys(pkg.devDependencies ?? {}).length },
  };
}

const lighthouse = lighthouseMinAcrossUrls();
const unit = vitestTotals();
const e2e = playwrightTotals();
const repo = repoStats();
const generatedAt = new Date().toISOString();
const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();

let previousHistory = [];
if (existsSync(OUT)) {
  try {
    const previous = JSON.parse(readFileSync(OUT, 'utf8'));
    if (Array.isArray(previous.history)) previousHistory = previous.history;
  } catch {
    console.error(`collect-quality WARNING: existing ${OUT} is not valid JSON; starting a fresh history`);
  }
}

const audit = {
  generatedAt,
  commit,
  lighthouse,
  history: mergeHistory(previousHistory, { date: generatedAt.slice(0, 10), scores: lighthouse }),
  tests: { unit, e2e },
  repo,
};

writeFileSync(OUT, `${JSON.stringify(audit, null, 2)}\n`);
console.log(`collect-quality OK: wrote ${OUT}`);
console.log(`  lighthouse: ${JSON.stringify(lighthouse)}`);
console.log(`  tests: unit ${unit.passed}/${unit.total}, e2e ${e2e.passed}/${e2e.total}`);
console.log(`  repo: ${repo.pagesGenerated} pages, ${repo.bundleKb} KB, deps ${repo.deps.prod} prod / ${repo.deps.dev} dev`);
console.log(`  history: ${audit.history.length} entr(ies), audit ${generatedAt}`);
