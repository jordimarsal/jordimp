import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LOCALES } from '../lib/i18n';

const PROJECT_COUNT = 11;
const FEATURED_COUNT = 5;
const SECONDARY_COUNT = 6;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const LOCALIZED_FIELDS = ['summary', 'problem', 'highlights'] as const;

type Localized = Record<(typeof LOCALES)[number], unknown>;

interface ProjectFile {
  slug: string;
  data: {
    name: string;
    year: number;
    featured: boolean;
    summary: Localized;
    problem: Localized;
    highlights: Localized;
    stack: string[];
    links: { github: string };
  };
}

const entries: ProjectFile[] = readdirSync(new URL('./projects/', import.meta.url))
  .filter((file) => file.endsWith('.json'))
  .map((file) => ({
    slug: file.replace(/\.json$/, ''),
    data: JSON.parse(readFileSync(new URL(`./projects/${file}`, import.meta.url), 'utf-8')),
  }));

describe('projects content collection', () => {
  it('ships exactly 11 project entries', () => {
    expect(entries).toHaveLength(PROJECT_COUNT);
  });

  it('marks exactly 5 entries featured and 6 secondary', () => {
    expect(entries.filter((entry) => entry.data.featured)).toHaveLength(FEATURED_COUNT);
    expect(entries.filter((entry) => !entry.data.featured)).toHaveLength(SECONDARY_COUNT);
  });

  it('requires en, es and ca for every localized field', () => {
    for (const { slug, data } of entries) {
      for (const field of LOCALIZED_FIELDS) {
        for (const lang of LOCALES) {
          const value = data[field][lang];
          expect(value, `${slug}:${field}.${lang}`).toBeDefined();
          expect(String(value).trim(), `${slug}:${field}.${lang}`).not.toBe('');
        }
      }
    }
  });

  it('derives a unique kebab-case route id per file', () => {
    const slugs = entries.map((entry) => entry.slug);
    for (const slug of slugs) {
      expect(slug, slug).toMatch(SLUG_PATTERN);
    }
    expect(new Set(slugs)).toHaveLength(PROJECT_COUNT);
  });

  it('links every project to a parseable GitHub repository URL', () => {
    for (const { slug, data } of entries) {
      const repo = new URL(data.links.github);
      expect(repo.protocol, slug).toBe('https:');
      expect(repo.hostname, slug).toBe('github.com');
      expect(repo.pathname.length, slug).toBeGreaterThan(1);
    }
  });

  it('gives every project at least one stack tag', () => {
    for (const { slug, data } of entries) {
      expect(data.stack.length, slug).toBeGreaterThan(0);
    }
  });
});
