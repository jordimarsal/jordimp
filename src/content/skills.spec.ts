import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LOCALES } from '../lib/i18n';

const GROUP_COUNT = 5;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PHONE_PATTERN = /\d{9}/;
const FIXED_ORDER = ['backend-apis', 'data', 'ai-llms', 'devops-quality', 'leadership'];

interface SkillsFile {
  slug: string;
  data: {
    group: Record<(typeof LOCALES)[number], string>;
    items: string[];
    order: number;
  };
}

const entries: SkillsFile[] = readdirSync(new URL('./skills/', import.meta.url))
  .filter((file) => file.endsWith('.json'))
  .map((file) => ({
    slug: file.replace(/\.json$/, ''),
    data: JSON.parse(readFileSync(new URL(`./skills/${file}`, import.meta.url), 'utf-8')),
  }));

describe('skills content collection', () => {
  it('ships exactly 5 skill-group entries', () => {
    expect(entries).toHaveLength(GROUP_COUNT);
  });

  it('uses the fixed group slugs in the fixed order 1–5', () => {
    const byOrder = [...entries].sort((a, b) => a.data.order - b.data.order);
    expect(byOrder.map((entry) => entry.slug)).toEqual(FIXED_ORDER);
    expect(byOrder.map((entry) => entry.data.order)).toEqual([1, 2, 3, 4, 5]);
  });

  it('localizes every group title in en, es and ca', () => {
    for (const { slug, data } of entries) {
      for (const lang of LOCALES) {
        expect(data.group[lang], `${slug}:group.${lang}`).toBeDefined();
        expect(data.group[lang].trim(), `${slug}:group.${lang}`).not.toBe('');
      }
    }
  });

  it('gives every group non-empty English technical items', () => {
    for (const { slug, data } of entries) {
      expect(data.items.length, slug).toBeGreaterThan(0);
      for (const item of data.items) {
        expect(item.trim(), `${slug}:item`).not.toBe('');
      }
    }
    const allItems = entries.flatMap((entry) => entry.data.items);
    expect(allItems, 'skills items').toContain('Spring Boot 4');
  });

  it('uses kebab-case slugs and keeps entries free of phone numbers', () => {
    for (const { slug, data } of entries) {
      expect(slug, slug).toMatch(SLUG_PATTERN);
      expect(JSON.stringify(data), slug).not.toMatch(PHONE_PATTERN);
    }
  });
});
