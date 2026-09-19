const SPLASH_URLS: readonly string[] = ['https://jordimp.net/', 'https://jordimp.net/demo/'];

export function sitemapFilter(page: string): boolean {
  return !SPLASH_URLS.includes(page);
}
