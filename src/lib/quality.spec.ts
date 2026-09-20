import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { INSPECTIONS_PAGE } from '../data/content';
import type { QualityHistoryEntry, QualityReport } from '../data/types';
import qualityJson from '../data/quality.json';
import lighthouserc from '../../lighthouserc.json';
import {
  formatScore,
  gaugeBadgeHtml,
  inspectionVerdict,
  itePlaqueLabel,
  mergeHistory,
  parseQuality,
  plaqueText,
  sparklinePath,
  sparklineSvgHtml,
  VERDICT_THRESHOLDS,
} from './quality';
import { LOCALES } from './i18n';

const AUDIT: QualityReport = {
  generatedAt: '2026-09-20T08:00:00+02:00',
  commit: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
  lighthouse: { performance: 0.98, accessibility: 1, bestPractices: 0.96, seo: 1 },
  history: [
    { date: '2026-09-20', scores: { performance: 0.98, accessibility: 1, bestPractices: 0.96, seo: 1 } },
  ],
  tests: { unit: { total: 185, passed: 185 }, e2e: { total: 130, passed: 130 } },
  repo: { pagesGenerated: 65, bundleKb: 12, deps: { prod: 2, dev: 5 } },
};

function without(report: QualityReport, key: keyof QualityReport): Record<string, unknown> {
  const clone: Record<string, unknown> = { ...report };
  delete clone[key];
  return clone;
}

describe('parseQuality', () => {
  it('accepts a fully valid report', () => {
    expect(parseQuality(AUDIT)).toEqual({ ok: true, value: AUDIT });
  });

  it('rejects a non-object root as bad-shape', () => {
    expect(parseQuality(null)).toEqual({ ok: false, error: { kind: 'bad-shape', field: 'root' } });
    expect(parseQuality('nope')).toEqual({ ok: false, error: { kind: 'bad-shape', field: 'root' } });
    expect(parseQuality([AUDIT])).toEqual({ ok: false, error: { kind: 'bad-shape', field: 'root' } });
  });

  it('names a missing top-level field', () => {
    expect(parseQuality(without(AUDIT, 'generatedAt'))).toEqual({
      ok: false,
      error: { kind: 'missing-field', field: 'generatedAt' },
    });
    expect(parseQuality(without(AUDIT, 'lighthouse'))).toEqual({
      ok: false,
      error: { kind: 'missing-field', field: 'lighthouse' },
    });
    expect(parseQuality(without(AUDIT, 'history'))).toEqual({
      ok: false,
      error: { kind: 'missing-field', field: 'history' },
    });
    expect(parseQuality(without(AUDIT, 'tests'))).toEqual({
      ok: false,
      error: { kind: 'missing-field', field: 'tests' },
    });
    expect(parseQuality(without(AUDIT, 'repo'))).toEqual({
      ok: false,
      error: { kind: 'missing-field', field: 'repo' },
    });
    expect(parseQuality({ ...AUDIT, commit: '' })).toEqual({
      ok: false,
      error: { kind: 'missing-field', field: 'commit' },
    });
  });

  it('names a wrong-typed field as bad-shape', () => {
    expect(parseQuality({ ...AUDIT, generatedAt: 42 })).toEqual({
      ok: false,
      error: { kind: 'bad-shape', field: 'generatedAt' },
    });
    expect(parseQuality({ ...AUDIT, generatedAt: 'last tuesday' })).toEqual({
      ok: false,
      error: { kind: 'bad-shape', field: 'generatedAt' },
    });
    expect(parseQuality({ ...AUDIT, lighthouse: { ...AUDIT.lighthouse, seo: '1' } })).toEqual({
      ok: false,
      error: { kind: 'bad-shape', field: 'lighthouse.seo' },
    });
    expect(parseQuality({ ...AUDIT, history: 'none' })).toEqual({
      ok: false,
      error: { kind: 'bad-shape', field: 'history' },
    });
    expect(parseQuality({ ...AUDIT, tests: { ...AUDIT.tests, unit: { ...AUDIT.tests.unit, total: 'x' } } })).toEqual({
      ok: false,
      error: { kind: 'bad-shape', field: 'tests.unit.total' },
    });
  });

  it('rejects scores outside 0–1 and negative counts as bad-range', () => {
    expect(parseQuality({ ...AUDIT, lighthouse: { ...AUDIT.lighthouse, performance: 1.2 } })).toEqual({
      ok: false,
      error: { kind: 'bad-range', field: 'lighthouse.performance' },
    });
    expect(parseQuality({ ...AUDIT, repo: { ...AUDIT.repo, pagesGenerated: -1 } })).toEqual({
      ok: false,
      error: { kind: 'bad-range', field: 'repo.pagesGenerated' },
    });
    expect(
      parseQuality({ ...AUDIT, tests: { ...AUDIT.tests, e2e: { total: 10, passed: 11 } } }),
    ).toEqual({
      ok: false,
      error: { kind: 'bad-range', field: 'tests.e2e.passed' },
    });
  });

  it('rejects more than 30 history entries, keeping 30 valid', () => {
    const dates = (n: number): QualityHistoryEntry[] =>
      Array.from({ length: n }, (_, i) => ({
        date: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10),
        scores: AUDIT.lighthouse,
      }));
    expect(parseQuality({ ...AUDIT, history: dates(31) })).toEqual({
      ok: false,
      error: { kind: 'bad-history', reason: 'exceeds-cap' },
    });
    expect(parseQuality({ ...AUDIT, history: dates(30) })).toEqual({ ok: true, value: { ...AUDIT, history: dates(30) } });
  });

  it('rejects non-ascending history dates as bad-history', () => {
    const history: QualityHistoryEntry[] = [
      { date: '2026-09-21', scores: AUDIT.lighthouse },
      { date: '2026-09-20', scores: AUDIT.lighthouse },
    ];
    expect(parseQuality({ ...AUDIT, history })).toEqual({
      ok: false,
      error: { kind: 'bad-history', reason: 'dates-not-ascending' },
    });
  });
});

describe('committed quality.json oracle (R5)', () => {
  it('parses the committed audit file', () => {
    const result = parseQuality(qualityJson);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.commit).toMatch(/^[0-9a-f]{7,40}$/);
      expect(Object.keys(result.value.lighthouse)).toHaveLength(4);
      expect(result.value.history.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('formatScore', () => {
  it('scales 0–1 scores to rounded 0–100 strings', () => {
    expect(formatScore(0.98)).toBe('98');
    expect(formatScore(1)).toBe('100');
    expect(formatScore(0.9)).toBe('90');
    expect(formatScore(0.5)).toBe('50');
  });
});

describe('sparklinePath', () => {
  it('emits the exact two-point path across the full box', () => {
    expect(sparklinePath([0.9, 0.95], 100, 24)).toBe('M 0 24 L 100 0');
  });

  it('honors custom min and max ranges', () => {
    expect(sparklinePath([0.9, 0.95], 100, 24, 0, 1)).toBe('M 0 2.4 L 100 1.2');
  });

  it('emits the exact five-point path', () => {
    expect(sparklinePath([0.5, 0.6, 0.55, 0.7, 0.65], 100, 20)).toBe(
      'M 0 20 L 25 10 L 50 15 L 75 0 L 100 5',
    );
  });

  it('levels flat series to the middle of the box', () => {
    expect(sparklinePath([0.9, 0.9], 100, 24)).toBe('M 0 12 L 100 12');
  });

  it('returns an empty path for fewer than two points', () => {
    expect(sparklinePath([0.9], 100, 24)).toBe('');
  });
});

describe('mergeHistory', () => {
  const e1: QualityHistoryEntry = { date: '2026-09-06', scores: AUDIT.lighthouse };
  const e2: QualityHistoryEntry = { date: '2026-09-13', scores: AUDIT.lighthouse };
  const e3: QualityHistoryEntry = { date: '2026-09-20', scores: AUDIT.lighthouse };

  it('appends an entry to an empty ring', () => {
    expect(mergeHistory([], e3)).toEqual([e3]);
  });

  it('keeps the ring sorted ascending by date', () => {
    expect(mergeHistory([e3, e1], e2)).toEqual([e1, e2, e3]);
  });

  it('replaces an entry with the same date', () => {
    const updated: QualityHistoryEntry = { date: e3.date, scores: { performance: 0.5, accessibility: 0.5, bestPractices: 0.5, seo: 0.5 } };
    const merged = mergeHistory([e2, e3], updated);
    expect(merged).toHaveLength(2);
    expect(merged[merged.length - 1]).toEqual(updated);
  });

  it('caps the ring at 30 entries dropping the oldest first', () => {
    const thirty = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10),
      scores: AUDIT.lighthouse,
    }));
    const merged = mergeHistory(thirty, { date: '2026-12-31', scores: AUDIT.lighthouse });
    expect(merged).toHaveLength(30);
    expect(merged[0].date).toBe(thirty[1].date);
    expect(merged[merged.length - 1].date).toBe('2026-12-31');
  });

  it('honors a custom cap', () => {
    const merged = mergeHistory([e1, e2, e3], { date: '2026-09-27', scores: AUDIT.lighthouse }, 2);
    expect(merged.map((e) => e.date)).toEqual([e3.date, '2026-09-27']);
  });
});

describe('inspectionVerdict (R11)', () => {
  const assertMinScore = (rules: readonly (string | { minScore: number })[]): number => {
    for (const rule of rules) {
      if (typeof rule === 'object' && rule !== null && 'minScore' in rule) return rule.minScore;
    }
    throw new Error(`lighthouserc assertion carries no minScore: ${JSON.stringify(rules)}`);
  };

  it('mirrors the lighthouserc.json thresholds', () => {
    const assertions = lighthouserc.ci.assert.assertions;
    expect(assertMinScore(assertions['categories:performance'])).toBe(VERDICT_THRESHOLDS.performance);
    expect(assertMinScore(assertions['categories:accessibility'])).toBe(VERDICT_THRESHOLDS.accessibility);
    expect(assertMinScore(assertions['categories:best-practices'])).toBe(VERDICT_THRESHOLDS.bestPractices);
    expect(assertMinScore(assertions['categories:seo'])).toBe(VERDICT_THRESHOLDS.seo);
  });

  it('passes when every score meets its threshold and both suites are green', () => {
    expect(inspectionVerdict(AUDIT)).toBe('pass');
  });

  it('fails on any score below threshold', () => {
    const lowPerf = { ...AUDIT, lighthouse: { ...AUDIT.lighthouse, performance: 0.89 } };
    expect(inspectionVerdict(lowPerf)).toBe('fail');
    const lowSeo = { ...AUDIT, lighthouse: { ...AUDIT.lighthouse, seo: 0.9499 } };
    expect(inspectionVerdict(lowSeo)).toBe('fail');
  });

  it('fails when either suite has a failing test', () => {
    const failingUnit = { ...AUDIT, tests: { ...AUDIT.tests, unit: { total: 10, passed: 9 } } };
    expect(inspectionVerdict(failingUnit)).toBe('fail');
    const failingE2e = { ...AUDIT, tests: { ...AUDIT.tests, e2e: { total: 10, passed: 9 } } };
    expect(inspectionVerdict(failingE2e)).toBe('fail');
  });
});

describe('plaque composition (R10, R11)', () => {
  it('composes title, date and verdict in reading order for every locale', () => {
    expect(plaqueText('en', AUDIT)).toBe('TECHNICAL INSPECTION · 2026-09-20 · PASS');
    expect(plaqueText('es', AUDIT)).toBe('INSPECCIÓN TÉCNICA · 2026-09-20 · APTO');
    expect(plaqueText('ca', AUDIT)).toBe('INSPECCIÓ TÈCNICA · 2026-09-20 · APTE');
  });

  it('composes the failing verdict for a below-threshold audit', () => {
    const failing = { ...AUDIT, lighthouse: { ...AUDIT.lighthouse, performance: 0.5 } };
    expect(plaqueText('es', failing)).toBe('INSPECCIÓN TÉCNICA · 2026-09-20 · NO APTO');
  });

  it('falls back to the no-audit state without data', () => {
    expect(plaqueText('en', null)).toBe(
      'TECHNICAL INSPECTION · NO AUDIT ON FILE — THE INSPECTOR HAS YET TO SIGN',
    );
    expect(plaqueText('ca', null)).toContain('SENSE AUDITORIA A L’EXPEDIENT');
  });

  it('keeps the aria-label equal to the composed visible strings', () => {
    for (const lang of LOCALES) {
      expect(itePlaqueLabel(lang, AUDIT)).toBe(plaqueText(lang, AUDIT));
      expect(itePlaqueLabel(lang, null)).toBe(plaqueText(lang, null));
    }
  });
});

describe('gauge and sparkline emitters (R7, R8)', () => {
  it('renders a themed gauge with the scaled score and its category label', () => {
    const html = gaugeBadgeHtml('PERFORMANCE', 0.98);
    expect(html).toContain('class="q-gauge"');
    expect(html).toContain('stroke-dasharray="188.5"');
    expect(html).toContain('>98</text>');
    expect(html).toContain('<span class="q-gauge__label">PERFORMANCE</span>');
    expect(html).toContain('aria-hidden="true"');
  });

  it('renders an accessible sparkline wrapping the exact path', () => {
    const html = sparklineSvgHtml([0.9, 0.95], 'PERFORMANCE — 2026-09-13 → 2026-09-20');
    expect(html).toContain('class="q-spark" viewBox="0 0 100 24" role="img"');
    expect(html).toContain('aria-label="PERFORMANCE — 2026-09-13 → 2026-09-20"');
    expect(html).toContain('d="M 0 24 L 100 0"');
  });
});

describe('quality.yml workflow contract (R13)', () => {
  const workflow = (): string =>
    readFileSync(new URL('../../.github/workflows/quality.yml', import.meta.url), 'utf8');

  it('triggers on schedule and manual dispatch only — never on push or PR', () => {
    const text = workflow();
    expect(text).toContain('schedule:');
    expect(text).toContain('cron:');
    expect(text).toContain('workflow_dispatch:');
    expect(text).not.toMatch(/^\s*push:/m);
    expect(text).not.toMatch(/^\s*pull_request:/m);
  });

  it('declares minimal contents: write permissions', () => {
    expect(workflow()).toMatch(/permissions:\s*\n\s*contents:\s*write/);
  });

  it('pins every action by its full 40-hex commit SHA', () => {
    const uses = [...workflow().matchAll(/uses:\s*(\S+)@(\S+)/g)];
    expect(uses.length).toBeGreaterThanOrEqual(3);
    for (const [, action, pin] of uses) {
      expect(pin, action).toMatch(/^[0-9a-f]{40}$/);
    }
  });
});
