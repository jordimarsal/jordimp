import type { Locale } from './i18n';
import type {
  QualityError,
  QualityHistoryEntry,
  QualityReport,
  QualityResult,
  QualityScores,
} from '../data/types';
// Explicit .ts extension: the zero-dep collector adapter loads this module with
// Node type-stripping, which does not resolve extensionless specifiers.
import { INSPECTIONS_PAGE } from '../data/content.ts';

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const esc = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);

export interface VerdictThresholds {
  readonly performance: number;
  readonly accessibility: number;
  readonly bestPractices: number;
  readonly seo: number;
}

export const VERDICT_THRESHOLDS: VerdictThresholds = {
  performance: 0.9,
  accessibility: 0.95,
  bestPractices: 0.95,
  seo: 0.95,
};

export const HISTORY_CAP = 30;

export const CATEGORY_KEYS = ['performance', 'accessibility', 'bestPractices', 'seo'] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export function formatScore(score: number): string {
  return String(Math.round(score * 100));
}

export function sparklinePath(
  values: readonly number[],
  width: number,
  height: number,
  min?: number,
  max?: number,
): string {
  if (values.length < 2) return '';
  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values);
  const range = hi - lo;
  const coord = (value: number): number => Math.round(value * 100) / 100;
  return values
    .map((value, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = range === 0 ? height / 2 : height - ((value - lo) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${coord(x)} ${coord(y)}`;
    })
    .join(' ');
}

export function gaugeBadgeHtml(catLabel: string, score: number): string {
  const circumference = (2 * Math.PI * 30).toFixed(1);
  const offset = (2 * Math.PI * 30 * (1 - score)).toFixed(1);
  return `<div class="q-gauge">
  <svg viewBox="0 0 120 80" aria-hidden="true">
    <circle class="q-gauge__track" cx="60" cy="38" r="30"/>
    <circle class="q-gauge__value" cx="60" cy="38" r="30" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
    <text class="q-gauge__score" x="60" y="43" text-anchor="middle">${formatScore(score)}</text>
  </svg>
  <span class="q-gauge__label">${esc(catLabel)}</span>
</div>`;
}

export function sparklineSvgHtml(values: readonly number[], ariaLabel: string): string {
  return `<svg class="q-spark" viewBox="0 0 100 24" role="img" aria-label="${esc(ariaLabel)}" preserveAspectRatio="none"><path class="q-spark__line" d="${sparklinePath(values, 100, 24)}"/></svg>`;
}

export function mergeHistory(
  previous: readonly QualityHistoryEntry[],
  entry: QualityHistoryEntry,
  cap: number = HISTORY_CAP,
): readonly QualityHistoryEntry[] {
  const merged = previous.filter((e) => e.date !== entry.date).concat(entry);
  merged.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return merged.slice(Math.max(0, merged.length - cap));
}

export function inspectionVerdict(report: QualityReport): 'pass' | 'fail' {
  const { performance, accessibility, bestPractices, seo } = report.lighthouse;
  const scoresPass =
    performance >= VERDICT_THRESHOLDS.performance &&
    accessibility >= VERDICT_THRESHOLDS.accessibility &&
    bestPractices >= VERDICT_THRESHOLDS.bestPractices &&
    seo >= VERDICT_THRESHOLDS.seo;
  const testsPass =
    report.tests.unit.passed === report.tests.unit.total &&
    report.tests.e2e.passed === report.tests.e2e.total;
  return scoresPass && testsPass ? 'pass' : 'fail';
}

export function plaqueDate(report: QualityReport): string {
  return report.generatedAt.slice(0, 10);
}

export function plaqueText(lang: Locale, report: QualityReport | null): string {
  if (!report) {
    return `${INSPECTIONS_PAGE.plaqueTitle[lang]} · ${INSPECTIONS_PAGE.noAudit[lang]}`;
  }
  const verdict =
    inspectionVerdict(report) === 'pass'
      ? INSPECTIONS_PAGE.verdictPass[lang]
      : INSPECTIONS_PAGE.verdictFail[lang];
  return `${INSPECTIONS_PAGE.plaqueTitle[lang]} · ${plaqueDate(report)} · ${verdict}`;
}

export function itePlaqueLabel(lang: Locale, report: QualityReport | null): string {
  return plaqueText(lang, report);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const errResult = (error: QualityError): QualityResult => ({ ok: false, error });
const missing = (field: string): QualityResult => errResult({ kind: 'missing-field', field });
const badShape = (field: string): QualityResult => errResult({ kind: 'bad-shape', field });
const badRange = (field: string): QualityResult => errResult({ kind: 'bad-range', field });
const badHistory = (reason: string): QualityResult => errResult({ kind: 'bad-history', reason });

type Field<T> = { ok: true; value: T } | { ok: false; result: QualityResult };

function parseScores(raw: unknown, prefix: string): Field<QualityScores> {
  if (!isRecord(raw)) return { ok: false, result: badShape(prefix) };
  const scores: Record<CategoryKey, number> = { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 };
  for (const key of CATEGORY_KEYS) {
    if (raw[key] === undefined) return { ok: false, result: missing(`${prefix}.${key}`) };
    const value = raw[key];
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return { ok: false, result: badShape(`${prefix}.${key}`) };
    }
    if (value < 0 || value > 1) return { ok: false, result: badRange(`${prefix}.${key}`) };
    scores[key] = value;
  }
  return { ok: true, value: scores };
}

function parseCount(raw: Record<string, unknown>, key: string, field: string): Field<number> {
  if (raw[key] === undefined) return { ok: false, result: missing(field) };
  const value = raw[key];
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return { ok: false, result: badShape(field) };
  }
  if (value < 0) return { ok: false, result: badRange(field) };
  return { ok: true, value };
}

function parseIsoDate(raw: Record<string, unknown>, key: string, field: string): Field<string> {
  if (raw[key] === undefined) return { ok: false, result: missing(field) };
  const value = raw[key];
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    return { ok: false, result: badShape(field) };
  }
  return { ok: true, value };
}

function parseTests(raw: unknown): Field<QualityReport['tests']> {
  if (!isRecord(raw)) return { ok: false, result: badShape('tests') };
  const tests: Record<'unit' | 'e2e', { total: number; passed: number }> = {
    unit: { total: 0, passed: 0 },
    e2e: { total: 0, passed: 0 },
  };
  for (const suite of ['unit', 'e2e'] as const) {
    const entry = raw[suite];
    if (entry === undefined) return { ok: false, result: missing(`tests.${suite}`) };
    if (!isRecord(entry)) return { ok: false, result: badShape(`tests.${suite}`) };
    const total = parseCount(entry, 'total', `tests.${suite}.total`);
    if (!total.ok) return total;
    const passed = parseCount(entry, 'passed', `tests.${suite}.passed`);
    if (!passed.ok) return passed;
    if (passed.value > total.value) {
      return { ok: false, result: badRange(`tests.${suite}.passed`) };
    }
    tests[suite] = { total: total.value, passed: passed.value };
  }
  return { ok: true, value: tests };
}

function parseRepo(raw: unknown): Field<QualityReport['repo']> {
  if (!isRecord(raw)) return { ok: false, result: badShape('repo') };
  const pagesGenerated = parseCount(raw, 'pagesGenerated', 'repo.pagesGenerated');
  if (!pagesGenerated.ok) return pagesGenerated;
  if (raw.bundleKb === undefined) return { ok: false, result: missing('repo.bundleKb') };
  const bundleKb = raw.bundleKb;
  if (typeof bundleKb !== 'number' || Number.isNaN(bundleKb)) {
    return { ok: false, result: badShape('repo.bundleKb') };
  }
  if (bundleKb < 0) return { ok: false, result: badRange('repo.bundleKb') };
  if (raw.deps === undefined) return { ok: false, result: missing('repo.deps') };
  if (!isRecord(raw.deps)) return { ok: false, result: badShape('repo.deps') };
  const prod = parseCount(raw.deps, 'prod', 'repo.deps.prod');
  if (!prod.ok) return prod;
  const dev = parseCount(raw.deps, 'dev', 'repo.deps.dev');
  if (!dev.ok) return dev;
  return {
    ok: true,
    value: { pagesGenerated: pagesGenerated.value, bundleKb, deps: { prod: prod.value, dev: dev.value } },
  };
}

export function parseQuality(raw: unknown): QualityResult {
  if (!isRecord(raw)) return badShape('root');

  const generatedAt = parseIsoDate(raw, 'generatedAt', 'generatedAt');
  if (!generatedAt.ok) return generatedAt.result;

  if (raw.commit === undefined) return missing('commit');
  const commit = raw.commit;
  if (typeof commit !== 'string' || commit.trim() === '') return missing('commit');

  if (raw.lighthouse === undefined) return missing('lighthouse');
  const lighthouse = parseScores(raw.lighthouse, 'lighthouse');
  if (!lighthouse.ok) return lighthouse.result;

  if (raw.history === undefined) return missing('history');
  if (!Array.isArray(raw.history)) return badShape('history');
  if (raw.history.length > HISTORY_CAP) return badHistory('exceeds-cap');
  const history: QualityHistoryEntry[] = [];
  for (const entry of raw.history) {
    if (!isRecord(entry)) return badShape('history[]');
    const date = parseIsoDate(entry, 'date', 'history.date');
    if (!date.ok) return date.result;
    const scores = parseScores(entry.scores, 'history.scores');
    if (!scores.ok) return scores.result;
    history.push({ date: date.value, scores: scores.value });
  }
  for (let i = 1; i < history.length; i++) {
    if (history[i - 1].date > history[i].date) return badHistory('dates-not-ascending');
  }

  if (raw.tests === undefined) return missing('tests');
  const tests = parseTests(raw.tests);
  if (!tests.ok) return tests.result;
  if (raw.repo === undefined) return missing('repo');
  const repo = parseRepo(raw.repo);
  if (!repo.ok) return repo.result;

  return {
    ok: true,
    value: {
      generatedAt: generatedAt.value,
      commit,
      lighthouse: lighthouse.value,
      history,
      tests: tests.value,
      repo: repo.value,
    },
  };
}
