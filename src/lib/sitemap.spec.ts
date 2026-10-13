import { describe, expect, it } from 'vitest';
import { sitemapFilter } from './sitemap';

describe('sitemapFilter()', () => {
  it('excludes the production splash URL', () => {
    expect(sitemapFilter('https://jordimp.net/')).toBe(false);
  });

  it('excludes the demo-mode splash URL', () => {
    expect(sitemapFilter('https://jordimp.net/demo/')).toBe(false);
  });

  it('keeps every locale home URL', () => {
    for (const lang of ['en', 'es', 'ca'] as const) {
      expect(sitemapFilter(`https://jordimp.net/${lang}/`)).toBe(true);
    }
  });

  it('keeps interior pages of the new route map', () => {
    expect(sitemapFilter('https://jordimp.net/en/projects/codebaserag/')).toBe(true);
    expect(sitemapFilter('https://jordimp.net/ca/departments/front-desk/')).toBe(true);
    expect(sitemapFilter('https://jordimp.net/es/cv/')).toBe(true);
  });

  it('excludes only exact splash matches, not deeper paths', () => {
    expect(sitemapFilter('https://jordimp.net/en/')).toBe(true);
    expect(sitemapFilter('https://jordimp.net/demo/en/')).toBe(true);
  });

  it('excludes the redirect-stub URL in every locale (R17)', () => {
    for (const lang of ['en', 'es', 'ca'] as const) {
      expect(sitemapFilter(`https://jordimp.net/${lang}/writing/rag-eval-gate/`)).toBe(false);
    }
  });

  it('keeps the blog index and both post URLs (R17)', () => {
    expect(sitemapFilter('https://jordimp.net/en/blog/')).toBe(true);
    expect(sitemapFilter('https://jordimp.net/es/blog/which-local-model-for-coding-agents/')).toBe(true);
    expect(sitemapFilter('https://jordimp.net/ca/blog/rag-eval-gate/')).toBe(true);
  });
});
