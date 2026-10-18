import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  articleJsonLd,
  breadcrumbJsonLd,
  googleSiteVerification,
  jsonLdScript,
  ogLocale,
  ogLocaleAlternates,
  personJsonLd,
  siteUrl,
} from './seo';
import { SITE } from '../config';
import { LOCALES } from './i18n';

describe('siteUrl()', () => {
  it('builds the locale home URL for an empty path', () => {
    expect(siteUrl('en')).toBe('https://jordimp.net/en/');
    expect(siteUrl('en', '')).toBe('https://jordimp.net/en/');
  });

  it('builds interior and project detail URLs per locale', () => {
    expect(siteUrl('ca', 'cv/')).toBe('https://jordimp.net/ca/cv/');
    expect(siteUrl('es', 'projects/kafka-adapter-telemetry/')).toBe(
      'https://jordimp.net/es/projects/kafka-adapter-telemetry/',
    );
  });
});

describe('ogLocale()', () => {
  it('maps every locale to its Facebook locale code', () => {
    expect(ogLocale('en')).toBe('en_US');
    expect(ogLocale('es')).toBe('es_ES');
    expect(ogLocale('ca')).toBe('ca_ES');
  });
});

describe('ogLocaleAlternates()', () => {
  it('returns the other two locales in fixed en→es→ca order', () => {
    expect(ogLocaleAlternates('en')).toEqual(['es_ES', 'ca_ES']);
    expect(ogLocaleAlternates('es')).toEqual(['en_US', 'ca_ES']);
    expect(ogLocaleAlternates('ca')).toEqual(['en_US', 'es_ES']);
  });

  it('never contains the page locale and always has two entries', () => {
    for (const lang of LOCALES) {
      const alternates = ogLocaleAlternates(lang);
      expect(alternates).toHaveLength(2);
      expect(alternates).not.toContain(ogLocale(lang));
    }
  });
});

describe('googleSiteVerification()', () => {
  it('returns undefined for an absent value (F20 R11)', () => {
    expect(googleSiteVerification(undefined)).toBeUndefined();
  });

  it('returns undefined for empty and whitespace-only values (F20 R11)', () => {
    expect(googleSiteVerification('')).toBeUndefined();
    expect(googleSiteVerification('   ')).toBeUndefined();
    expect(googleSiteVerification('\t\n')).toBeUndefined();
  });

  it('trims a padded non-blank token (F20 R12)', () => {
    expect(googleSiteVerification('  tok\n')).toBe('tok');
  });

  it('passes a real-shaped token through unchanged (F20 R12)', () => {
    expect(googleSiteVerification('9yXk3QzLmNpR7tVb2wGsD1fHjE0aUoCi')).toBe(
      '9yXk3QzLmNpR7tVb2wGsD1fHjE0aUoCi',
    );
  });
});

describe('SEO.astro GSC emission (F20 R11, R12)', () => {
  const SEO_ASTRO = readFileSync(new URL('../components/SEO.astro', import.meta.url), 'utf8');

  it('computes gsc from the SITE config field through the pure helper', () => {
    expect(SEO_ASTRO).toContain(
      'const gsc = googleSiteVerification(SITE.googleSiteVerification);',
    );
  });

  it('emits exactly one conditional meta tag next to the robots line', () => {
    expect(SEO_ASTRO).toContain('{gsc && <meta name="google-site-verification" content={gsc} />}');
    expect(SEO_ASTRO.match(/google-site-verification/g)).toHaveLength(1);
  });
});

describe('docs/gsc-checklist.md workstreams (F20 R13)', () => {
  const CHECKLIST = readFileSync(new URL('../../docs/gsc-checklist.md', import.meta.url), 'utf8');

  it('documents the meta-tag ownership mechanism and the URL-prefix property', () => {
    expect(CHECKLIST).toContain('google-site-verification');
    expect(CHECKLIST).toContain('URL-prefix');
  });

  it('documents the DNS TXT domain-property alternative', () => {
    expect(CHECKLIST).toContain('Domain property');
    expect(CHECKLIST).toContain('TXT');
  });

  it('pins the sitemap-index.xml submission endpoint', () => {
    expect(CHECKLIST).toContain('https://jordimp.net/sitemap-index.xml');
  });

  it('covers hreflang monitoring and points at the recording file', () => {
    expect(CHECKLIST).toContain('hreflang');
    expect(CHECKLIST).toContain('Recording');
    expect(CHECKLIST).toContain('harness/progress/impl_lang-seo-visibility.md');
  });
});

describe('personJsonLd()', () => {
  it('pins the five required fields', () => {
    const person = personJsonLd('en');
    expect(person['@context']).toBe('https://schema.org');
    expect(person['@type']).toBe('Person');
    expect(person.name).toBe('Jordi Marçal Poy');
    expect(person.jobTitle).toBe('Senior Backend Engineer');
    expect(person.url).toBe('https://jordimp.net/en/');
    expect(person.email).toBe('mailto:hello@jordimp.net');
  });

  it('carries the exact sameAs set of GitHub and LinkedIn', () => {
    expect(personJsonLd('es').sameAs).toEqual([
      'https://github.com/jordimarsal',
      'https://www.linkedin.com/in/jordi-marsal-poy',
    ]);
  });

  it('points url at each locale home', () => {
    expect(personJsonLd('es').url).toBe('https://jordimp.net/es/');
    expect(personJsonLd('ca').url).toBe('https://jordimp.net/ca/');
  });
});

describe('breadcrumbJsonLd()', () => {
  it('prepends the locale home as position 1', () => {
    const breadcrumb = breadcrumbJsonLd('es', [{ name: 'CV', path: 'cv/' }]);
    expect(breadcrumb['@context']).toBe('https://schema.org');
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement).toHaveLength(2);
    expect(breadcrumb.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      item: 'https://jordimp.net/es/',
      name: 'Jordi Marçal Poy',
    });
    expect(breadcrumb.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      item: 'https://jordimp.net/es/cv/',
      name: 'CV',
    });
  });

  it('runs positions contiguously from 1 and ends at the page canonical', () => {
    const breadcrumb = breadcrumbJsonLd('en', [
      { name: 'Projects', path: 'projects/' },
      { name: 'kafka-adapter-telemetry', path: 'projects/kafka-adapter-telemetry/' },
    ]);
    expect(breadcrumb.itemListElement.map((element) => element.position)).toEqual([1, 2, 3]);
    expect(breadcrumb.itemListElement.at(-1)?.item).toBe(
      'https://jordimp.net/en/projects/kafka-adapter-telemetry/',
    );
  });

  it('reduces to the home item when no breadcrumb items are given', () => {
    const breadcrumb = breadcrumbJsonLd('ca', []);
    expect(breadcrumb.itemListElement).toHaveLength(1);
    expect(breadcrumb.itemListElement[0].position).toBe(1);
    expect(breadcrumb.itemListElement[0].item).toBe('https://jordimp.net/ca/');
  });
});

describe('jsonLdScript()', () => {
  it('serializes to compact JSON', () => {
    expect(jsonLdScript({ '@type': 'Person', name: 'Jordi' })).toBe(
      '{"@type":"Person","name":"Jordi"}',
    );
  });

  it('escapes < so a content string can never close the script tag', () => {
    const script = jsonLdScript({ name: '</script><script>alert(1)</script>' });
    expect(script).toContain('\\u003c');
    expect(script).not.toContain('</script>');
    expect(script).not.toMatch(/<\//);
  });

  it('escapes line separators U+2028/U+2029', () => {
    const script = jsonLdScript({ name: 'a\u2028b\u2029c' });
    expect(script).toBe('{"name":"a\\u2028b\\u2029c"}');
  });
});

describe('articleJsonLd()', () => {
  const input = {
    headline: 'RAG without an eval gate is a demo.',
    description: 'A description.',
    path: 'blog/rag-eval-gate/',
    datePublished: '2026-09-22',
    section: 'Research & Retrieval',
    about: 'https://github.com/jordimarsal/codebaserag',
  };

  it('emits a schema.org Article with the core fields', () => {
    const article = articleJsonLd('en', input);
    expect(article['@context']).toBe('https://schema.org');
    expect(article['@type']).toBe('Article');
    expect(article.headline).toBe(input.headline);
    expect(article.description).toBe(input.description);
    expect(article.inLanguage).toBe('en');
    expect(article.datePublished).toBe('2026-09-22');
    expect(article.dateModified).toBe('2026-09-22');
    expect(article.articleSection).toBe('Research & Retrieval');
    expect(article.about).toBe('https://github.com/jordimarsal/codebaserag');
  });

  it('names the site person as author and links the CodebaseRAG repo as about', () => {
    const article = articleJsonLd('es', input);
    expect(article.author.name).toBe('Jordi Marçal Poy');
    expect(article.author['@type']).toBe('Person');
    expect(article.author.url).toBe('https://jordimp.net/es/');
    expect(article.author.sameAs).toEqual([
      'https://github.com/jordimarsal',
      'https://www.linkedin.com/in/jordi-marsal-poy',
    ]);
  });

  it('points mainEntityOfPage and isPartOf at the locale URLs', () => {
    const article = articleJsonLd('ca', input);
    expect(article.mainEntityOfPage).toBe('https://jordimp.net/ca/blog/rag-eval-gate/');
    expect(article.isPartOf).toEqual({
      '@type': 'WebSite',
      name: 'JORDIMP & CO.',
      url: 'https://jordimp.net/',
    });
  });
});
