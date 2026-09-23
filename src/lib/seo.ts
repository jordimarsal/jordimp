import { SITE } from '../config';
import { LOCALES, type Locale } from './i18n';

export type BreadcrumbItem = { readonly name: string; readonly path: string };

export function siteUrl(lang: Locale, path?: string): string {
  return `${SITE.url}/${lang}/${path ?? ''}`;
}

export function ogLocale(lang: Locale): 'en_US' | 'es_ES' | 'ca_ES' {
  const ogLocales: Record<Locale, 'en_US' | 'es_ES' | 'ca_ES'> = {
    en: 'en_US',
    es: 'es_ES',
    ca: 'ca_ES',
  };
  return ogLocales[lang];
}

export function ogLocaleAlternates(lang: Locale): Array<'en_US' | 'es_ES' | 'ca_ES'> {
  return LOCALES.filter((locale) => locale !== lang).map(ogLocale);
}

export function personJsonLd(lang: Locale): {
  readonly '@context': 'https://schema.org';
  readonly '@type': 'Person';
  readonly name: string;
  readonly jobTitle: string;
  readonly url: string;
  readonly email: string;
  readonly sameAs: readonly [string, string];
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.name,
    jobTitle: SITE.role,
    url: siteUrl(lang),
    email: `mailto:${SITE.email}`,
    sameAs: [SITE.github, SITE.linkedin],
  };
}

export function breadcrumbJsonLd(
  lang: Locale,
  items: readonly BreadcrumbItem[],
): {
  readonly '@context': 'https://schema.org';
  readonly '@type': 'BreadcrumbList';
  readonly itemListElement: ReadonlyArray<{
    readonly '@type': 'ListItem';
    readonly position: number;
    readonly item: string;
    readonly name: string;
  }>;
} {
  const home = { name: SITE.name, path: '' };
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [home, ...items].map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: siteUrl(lang, item.path),
      name: item.name,
    })),
  };
}

export function jsonLdScript(value: object): string {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}

export interface ArticleInput {
  readonly headline: string;
  readonly description: string;
  readonly path: string;
  readonly datePublished: string;
  readonly section: string;
  readonly about: string;
}

export function articleJsonLd(
  lang: Locale,
  input: ArticleInput,
): {
  readonly '@context': 'https://schema.org';
  readonly '@type': 'Article';
  readonly headline: string;
  readonly description: string;
  readonly inLanguage: Locale;
  readonly datePublished: string;
  readonly dateModified: string;
  readonly mainEntityOfPage: string;
  readonly articleSection: string;
  readonly about: string;
  readonly author: {
    readonly '@type': 'Person';
    readonly name: string;
    readonly url: string;
    readonly sameAs: readonly [string, string];
  };
  readonly isPartOf: { readonly '@type': 'WebSite'; readonly name: string; readonly url: string };
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    inLanguage: lang,
    datePublished: input.datePublished,
    dateModified: input.datePublished,
    mainEntityOfPage: siteUrl(lang, input.path),
    articleSection: input.section,
    about: input.about,
    author: {
      '@type': 'Person',
      name: SITE.name,
      url: siteUrl(lang),
      sameAs: [SITE.github, SITE.linkedin],
    },
    isPartOf: { '@type': 'WebSite', name: SITE.brand, url: `${SITE.url}/` },
  };
}
