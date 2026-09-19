import { describe, expect, it } from 'vitest';
import {
  CASE_BUILD,
  CASE_NOTES,
  DEPTS,
  EXPERIENCE,
  FEATURED,
  FLOOR_LABELS,
  FLOOR_ORDER,
  FOOTER,
  LOCALES,
  PAGES,
  PROJECTS,
  SKILLS,
  TICKER,
  UI,
  project,
} from './content';

const PROJECT_COUNT = 11;
const FEATURED_COUNT = 3;
const DEPT_COUNT = 6;
const EXPERIENCE_COUNT = 4;

describe('projects data', () => {
  it('ships exactly 11 projects with unique slugs', () => {
    expect(PROJECTS).toHaveLength(PROJECT_COUNT);
    expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(PROJECT_COUNT);
  });

  it('gives every project trilingual blurb, summary, problem, highlights and metrics', () => {
    for (const p of PROJECTS) {
      for (const lang of LOCALES) {
        expect(p.blurb[lang].trim(), `${p.slug}:blurb.${lang}`).not.toBe('');
        expect(p.summary[lang].trim(), `${p.slug}:summary.${lang}`).not.toBe('');
        expect(p.problem[lang].trim(), `${p.slug}:problem.${lang}`).not.toBe('');
        expect(p.highlights[lang].length, `${p.slug}:highlights.${lang}`).toBeGreaterThan(0);
      }
      expect(p.stack.length, p.slug).toBeGreaterThan(0);
      expect(Array.isArray(p.metrics), `${p.slug}:metrics`).toBe(true);
      for (const metric of p.metrics) {
        expect(metric.value.trim(), `${p.slug}:metric.value`).not.toBe('');
        for (const lang of LOCALES) {
          expect(metric.label[lang].trim(), `${p.slug}:metric.label.${lang}`).not.toBe('');
        }
      }
    }
  });

  it('keeps every project inside a known department', () => {
    for (const p of PROJECTS) {
      expect(FLOOR_ORDER, p.slug).toContain(p.dept);
    }
  });
});

describe('departments data', () => {
  it('exposes exactly the six floor keys in the fixed floor order', () => {
    expect(FLOOR_ORDER).toHaveLength(DEPT_COUNT);
    expect(Object.keys(DEPTS).sort()).toEqual([...FLOOR_ORDER].sort());
  });

  it('pins the fixed floor order itself', () => {
    expect([...FLOOR_ORDER]).toEqual([
      'research',
      'telemetry',
      'tooling',
      'people',
      'operations',
      'frontdesk',
    ]);
  });

  it('resolves every department project to a real project of that floor', () => {
    for (const key of FLOOR_ORDER) {
      for (const slug of DEPTS[key].projects) {
        expect(project(slug).dept, slug).toBe(key);
      }
    }
  });

  it('covers all six departments in FLOOR_LABELS with trilingual labels', () => {
    expect(Object.keys(FLOOR_LABELS).sort()).toEqual([...FLOOR_ORDER].sort());
    for (const key of FLOOR_ORDER) {
      for (const lang of LOCALES) {
        expect(FLOOR_LABELS[key][lang].trim(), `${key}:${lang}`).not.toBe('');
      }
    }
  });
});

describe('featured data', () => {
  it('features exactly 3 valid slugs', () => {
    expect(FEATURED).toHaveLength(FEATURED_COUNT);
    expect(new Set(FEATURED).size).toBe(FEATURED_COUNT);
    for (const slug of FEATURED) {
      expect(PROJECTS.map((p) => p.slug), slug).toContain(slug);
    }
  });
});

describe('pages data', () => {
  it('registers home, work, cv, the 6 departments and the 11 project pages', () => {
    const expected = [
      'home',
      'work',
      'cv',
      ...FLOOR_ORDER,
      ...PROJECTS.map((p) => `project-${p.slug}`),
    ];
    expect(Object.keys(PAGES).sort()).toEqual(expected.sort());
  });

  it('gives every page a route and trilingual title and description', () => {
    for (const [key, page] of Object.entries(PAGES)) {
      expect(page.route.trim(), key).not.toBe('');
      for (const lang of LOCALES) {
        expect(page.title[lang].trim(), `${key}:title.${lang}`).not.toBe('');
        expect(page.description[lang].trim(), `${key}:description.${lang}`).not.toBe('');
      }
    }
  });
});

describe('cv and experience data', () => {
  it('keeps exactly 4 experience entries', () => {
    expect(EXPERIENCE).toHaveLength(EXPERIENCE_COUNT);
  });

  it('groups skills with trilingual group titles', () => {
    expect(SKILLS.length).toBeGreaterThan(0);
    for (const group of SKILLS) {
      for (const lang of LOCALES) {
        expect(group.group[lang].trim()).not.toBe('');
      }
    }
  });
});

describe('shared strings', () => {
  it('localizes ticker, ui and footer strings in en, es and ca', () => {
    for (const lang of LOCALES) {
      expect(TICKER[lang].length, `ticker.${lang}`).toBeGreaterThan(0);
      expect(UI.skip[lang].trim(), `ui.skip.${lang}`).not.toBe('');
      expect(FOOTER.headline[lang].trim(), `footer.headline.${lang}`).not.toBe('');
    }
  });
});

describe('case extras', () => {
  it('keys build logs and field notes to real project slugs', () => {
    const slugs = PROJECTS.map((p) => p.slug);
    for (const slug of Object.keys(CASE_BUILD)) {
      expect(slugs, `CASE_BUILD.${slug}`).toContain(slug);
    }
    for (const slug of Object.keys(CASE_NOTES)) {
      expect(slugs, `CASE_NOTES.${slug}`).toContain(slug);
    }
  });
});

describe('project()', () => {
  it('returns the matching project by slug', () => {
    expect(project('codebaserag').name).toBe('CodebaseRAG');
  });

  it('throws on unknown slug', () => {
    expect(() => project('nope')).toThrow('unknown project: nope');
  });
});
