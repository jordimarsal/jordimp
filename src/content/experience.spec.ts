import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LOCALES } from '../lib/i18n';

const ENTRY_COUNT = 4;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PHONE_PATTERN = /\d{9}/;
const EXPECTED_ORDER: Record<string, { order: number; period: string; current?: boolean }> = {
  'telefonica-open-gateway': { order: 1, period: '2022–present', current: true },
  'axpe-mapfre': { order: 2, period: 'Jan–May 2026' },
  zitro: { order: 3, period: '2020–2022' },
  attendre: { order: 4, period: '2017–2020' },
};

type Localized = Record<(typeof LOCALES)[number], unknown>;

interface ExperienceFile {
  slug: string;
  data: {
    company: string;
    role: Localized;
    period: string;
    current: boolean;
    points: Localized;
    stack: string[];
    order: number;
  };
}

const entries: ExperienceFile[] = readdirSync(new URL('./experience/', import.meta.url))
  .filter((file) => file.endsWith('.json'))
  .map((file) => ({
    slug: file.replace(/\.json$/, ''),
    data: JSON.parse(readFileSync(new URL(`./experience/${file}`, import.meta.url), 'utf-8')),
  }));

describe('experience content collection', () => {
  it('ships exactly 4 experience entries', () => {
    expect(entries).toHaveLength(ENTRY_COUNT);
  });

  it('uses the fixed plan slugs with order 1–4 and the pinned periods', () => {
    const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));
    expect([...bySlug.keys()].sort()).toEqual(Object.keys(EXPECTED_ORDER).sort());
    for (const [slug, expected] of Object.entries(EXPECTED_ORDER)) {
      const entry = bySlug.get(slug);
      expect(entry, slug).toBeDefined();
      expect(entry!.data.order, `${slug}:order`).toBe(expected.order);
      expect(entry!.data.period, `${slug}:period`).toBe(expected.period);
    }
  });

  it('marks exactly one entry as current: telefonica-open-gateway', () => {
    const current = entries.filter((entry) => entry.data.current);
    expect(current).toHaveLength(1);
    expect(current[0].slug).toBe('telefonica-open-gateway');
  });

  it('requires en, es and ca for role and every points list', () => {
    for (const { slug, data } of entries) {
      for (const lang of LOCALES) {
        expect(String(data.role[lang]).trim(), `${slug}:role.${lang}`).not.toBe('');
        const points = data.points[lang] as unknown[];
        expect(points, `${slug}:points.${lang}`).toHaveLength((data.points.en as unknown[]).length);
        for (const point of points) {
          expect(String(point).trim(), `${slug}:points.${lang}`).not.toBe('');
        }
      }
    }
  });

  it('gives every entry a company, stack and kebab-case slug', () => {
    for (const { slug, data } of entries) {
      expect(data.company.trim(), slug).not.toBe('');
      expect(data.stack.length, slug).toBeGreaterThan(0);
      expect(slug, slug).toMatch(SLUG_PATTERN);
    }
  });

  it('keeps every entry free of phone numbers', () => {
    for (const { slug, data } of entries) {
      expect(JSON.stringify(data), slug).not.toMatch(PHONE_PATTERN);
    }
  });
});
