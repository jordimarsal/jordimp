const SPLASH_URLS: ReadonlySet<string> = new Set(['https://jordimp.net/', 'https://jordimp.net/demo/']);

export function sitemapFilter(page: string): boolean {
  return !SPLASH_URLS.has(page);
}
