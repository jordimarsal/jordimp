import { readdirSync, readFileSync, statSync } from 'node:fs';
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
  const urls = extractOffHostUrls(listHtmlFiles(DIST));
  console.log(`checking ${urls.length} off-host URLs from dist HTML:`);
  const results = [];
  for (const url of urls) {
    const result = await checkUrl(url);
    results.push(result);
    console.log(`  ${result.ok ? 'OK ' : 'FAIL'} ${result.status} ${url}`);
  }
  const failures = results.filter((r) => !r.ok);
  if (failures.length > 0) {
    console.error(`link check FAILED: ${failures.length}/${urls.length} URLs unreachable after ${ATTEMPTS} attempts`);
    process.exit(1);
  }
  console.log(`link check OK: ${urls.length}/${urls.length} URLs responded < 400`);
}

main();
