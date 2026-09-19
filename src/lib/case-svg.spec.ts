import { describe, expect, it } from 'vitest';
import { PROJECTS } from '../data/content';
import { CASE_MOTIFS, caseMotif } from './case-svg';

describe('CASE_MOTIFS', () => {
  it('covers every project slug exactly', () => {
    expect(Object.keys(CASE_MOTIFS).sort()).toEqual(PROJECTS.map((p) => p.slug).sort());
  });

  it('emits theme-aware cutout SVGs with the shared motif classes', () => {
    const all = Object.values(CASE_MOTIFS).join('\n');
    expect(all.match(/class="cm-y"/g)).toHaveLength(18);
    expect(all.match(/class="cm-ink"/g)).toHaveLength(30);
    expect(all.match(/class="cm-line"/g)).toHaveLength(27);
    for (const motif of Object.values(CASE_MOTIFS)) {
      expect(motif).toMatch(/^<svg class="b-svg" viewBox="0 0 132 \d+" aria-hidden="true">/);
      expect(motif.endsWith('</svg>')).toBe(true);
    }
  });
});

describe('caseMotif', () => {
  it('returns the motif for a known slug', () => {
    expect(caseMotif('codebaserag')).toBe(CASE_MOTIFS['codebaserag']);
  });

  it('throws at build time on an unknown slug', () => {
    expect(() => caseMotif('nope')).toThrow('unknown project motif: nope');
  });
});
