import { describe, expect, it } from 'vitest';
import {
  breadcrumbJsonLd,
  jsonLdScript,
  ogLocale,
  ogLocaleAlternates,
  personJsonLd,
  siteUrl,
} from './seo';
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

describe('personJsonLd()', () => {
  it('pins the five required fields', () => {
    const person = personJsonLd('en');
    expect(person['@context']).toBe('https://schema.org');
    expect(person['@type']).toBe('Person');
    expect(person.name).toBe('Jordi Marçal Poy');
    expect(person.jobTitle).toBe('Senior Backend Engineer');
    expect(person.url).toBe('https://jordimp.net/en/');
    expect(person.email).toBe('mailto:jordi.marsal@gmail.com');
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
    const script = jsonLdScript({ name: 'a b c' });
    expect(script).toBe('{"name":"a\\u2028b\\u2029c"}');
  });
});
