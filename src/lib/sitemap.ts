import { LOCALES, PAGES } from '../data/content';
import { dirRoute } from './paths';

const SPLASH_URLS: ReadonlySet<string> = new Set(['https://jordimp.net/', 'https://jordimp.net/demo/']);

const STUB_URLS: ReadonlySet<string> = new Set(
  LOCALES.flatMap((lang) =>
    Object.values(PAGES)
      .filter((page) => page.redirect !== undefined)
      .map((page) => `https://jordimp.net/${lang}/${dirRoute(page.route)}`),
  ),
);

export function sitemapFilter(page: string): boolean {
  return !SPLASH_URLS.has(page) && !STUB_URLS.has(page);
}
