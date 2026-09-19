import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname;
const SITE_HOSTS = new Set(['jordimp.net', 'www.jordimp.net']);
const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const ATTEMPTS = 3;
const BACKOFF_MS = 2000;

function listHtmlFiles(dir) {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return listHtmlFiles(full);
    return entry.endsWith('.html') ? [full] : [];
  });
}

function pageBasePath(file) {
  const sitePath = file.slice(DIST.length);
  return sitePath.endsWith('/index.html') ? sitePath.slice(0, -'index.html'.length) : sitePath;
}

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function resolvesInDist(pathname) {
  if (isFile(join(DIST, pathname))) return true;
  return isFile(join(DIST, pathname, 'index.html'));
}

function classifyReference(value, basePath) {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed.startsWith('#')) return { kind: 'skip' };
  let resolved;
  try {
    resolved = new URL(trimmed, `https://jordimp.net${basePath}`);
  } catch {
    return { kind: 'unparseable' };
  }
  if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') return { kind: 'skip' };
  if (!SITE_HOSTS.has(resolved.hostname.toLowerCase())) return { kind: 'external', url: trimmed };
  return { kind: 'internal', target: resolved.pathname };
}

function collectInternalReferences(files) {
  const references = [];
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    const basePath = pageBasePath(file);
    for (const match of html.matchAll(/(?:href|src)="([^"]*)"/g)) {
      const reference = classifyReference(match[1], basePath);
      if (reference.kind === 'internal') references.push({ file, href: match[1], target: reference.target });
      if (reference.kind === 'unparseable') references.push({ file, href: match[1], target: null });
    }
  }
  return references;
}

function internalResolutionProblems(references) {
  const problems = [];
  for (const { file, href, target } of references) {
    if (target === null) {
      problems.push(`unparseable link ${href} in ${file}`);
      continue;
    }
    if (!resolvesInDist(target)) {
      problems.push(`unresolved link ${href} (target ${target}) in ${file}`);
    }
  }
  return problems;
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

async function main() {
  if (!existsSync(DIST)) {
    console.error('link check FAILED: dist/ not found — run "npm run build" first');
    process.exit(1);
  }
  const files = listHtmlFiles(DIST);

  const references = collectInternalReferences(files);
  console.log(`internal links: ${references.length} same-site href/src references across ${files.length} HTML files`);
  const problems = internalResolutionProblems(references);
  if (problems.length > 0) {
    console.error('internal resolution FAILED:');
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log('internal resolution OK: every internal href/src resolves to a built file');

  const urls = extractOffHostUrls(files);
  console.log(`checking ${urls.length} off-host URLs from dist HTML:`);
  for (const url of urls) {
    const result = await checkUrl(url);
    console.log(`  ${result.ok ? 'OK ' : 'FAIL'} ${result.status} ${url}`);
    if (!result.ok) problems.push(`external link unreachable (${result.status}): ${url}`);
  }
  if (problems.length > 0) {
    console.error(`link check FAILED: ${problems.length} problem(s)`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log(`link check OK: internal resolution + ${urls.length}/${urls.length} off-host URLs responded < 400`);
}

await main();
