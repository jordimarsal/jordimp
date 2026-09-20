import type { Locale } from './i18n';
import type { QualityReport } from '../data/types';
import { INSPECTIONS_PAGE } from '../data/content';

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
