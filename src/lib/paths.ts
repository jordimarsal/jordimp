import type { Locale } from './i18n';

function trimTrailingSlashes(value: string): string {
  let trimmed = value;
  while (trimmed.endsWith('/')) trimmed = trimmed.slice(0, -1);
  return trimmed;
}

function prefixed(path: string): string {
  const base = import.meta.env.BASE_URL;
  if (base === '/' || base === '') return `/${path}`;
  return `${trimTrailingSlashes(base)}/${path}`;
}

export function srcPath(lang: Locale, route: string): string {
  return prefixed(`${lang}/${route}`);
}

export function assetPath(path: string): string {
  return prefixed(path);
}

export function prodUrl(lang: Locale, route: string): string {
  return `https://jordimp.net/${lang}/${route}`;
}

const FILE_TO_DIR: Record<string, string> = { 'work.html': 'projects/' };

export function dirRoute(route: string): string {
  if (route === 'index.html') return '';
  const renamed = FILE_TO_DIR[route];
  if (renamed) return renamed;
  return route.replace(/\.html$/, '/');
}
