import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const AA_MINIMUM = 4.5;

type Mode = 'day' | 'night';

type Tokens = Record<string, string>;

interface AuditedPair {
  readonly name: string;
  readonly mode: Mode;
  readonly fg: string;
  readonly bg: string;
  readonly expected: string;
}

interface ResolvedPair {
  readonly name: string;
  readonly fg: string;
  readonly bg: string;
}

const SITE_CSS = readFileSync(new URL('./site.css', import.meta.url), 'utf8');

function channel(n: string, i: number): number {
  const c = Number.parseInt(n.slice(i * 2, i * 2 + 2), 16) / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const n = hex.replace('#', '');
  return 0.2126 * channel(n, 0) + 0.7152 * channel(n, 1) + 0.0722 * channel(n, 2);
}

function contrast(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function tokenBlock(selector: RegExp): Tokens {
  const block = selector.exec(SITE_CSS)?.[1];
  if (block === undefined) {
    throw new Error(`site.css: token block not found for ${selector}`);
  }
  const tokens: Tokens = {};
  for (const match of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    const name = match[1];
    const value = match[2];
    if (name !== undefined && value !== undefined) {
      tokens[`--${name}`] = value.trim();
    }
  }
  return tokens;
}

function ruleColor(selector: RegExp): string {
  const color = selector.exec(SITE_CSS)?.[1];
  if (color === undefined) {
    throw new Error(`site.css: declared color not found for ${selector}`);
  }
  return color;
}

const DAY: Tokens = tokenBlock(/^:root\s*\{([^}]*)\}/m);
const NIGHT: Tokens = {
  ...DAY,
  ...tokenBlock(/^html\[data-night='1'\]\s*\{([^}]*)\}/m),
};

const REPO_CTA_INK = ruleColor(
  /html\[data-night='1'\]\s+\.btn--y\s*\{[^}]*color:\s*(#[0-9a-fA-F]{6})/,
);
const HERO_MARK_INK = ruleColor(
  /html\[data-night='1'\]\s+h1 mark\s*\{[^}]*color:\s*(#[0-9a-fA-F]{6})/,
);
const FOOTER_DESK_INK = ruleColor(/\.footer-desk\s*\{[^}]*color:\s*(#[0-9a-fA-F]{6})/);

function hexOf(tokens: Tokens, ref: string): string {
  if (!ref.startsWith('--')) {
    return ref;
  }
  const value = tokens[ref];
  if (value === undefined) {
    throw new Error(`site.css: missing custom property ${ref}`);
  }
  return value;
}

function resolvePair(pair: AuditedPair, nightTokens: Tokens = NIGHT): ResolvedPair {
  const tokens = pair.mode === 'day' ? DAY : nightTokens;
  return { name: pair.name, fg: hexOf(tokens, pair.fg), bg: hexOf(tokens, pair.bg) };
}

const failingPairNames = (pairs: readonly ResolvedPair[]): string[] =>
  pairs.filter(({ fg, bg }) => contrast(fg, bg) < AA_MINIMUM).map(({ name }) => name);

const AUDITED: readonly AuditedPair[] = [
  { name: 'light body ink on paper', mode: 'day', fg: '--ink', bg: '--paper', expected: '18.04' },
  {
    name: 'light secondary ink on paper2',
    mode: 'day',
    fg: '--ink2',
    bg: '--paper2',
    expected: '13.77',
  },
  {
    name: 'light chip yellow on ink',
    mode: 'day',
    fg: '--chip-fg',
    bg: '--chip-bg',
    expected: '13.94',
  },
  {
    name: 'light ink on yellow surfaces',
    mode: 'day',
    fg: '--ink',
    bg: '--y1',
    expected: '13.94',
  },
  {
    name: 'light secondary on yellow',
    mode: 'day',
    fg: '--ink2',
    bg: '--y1',
    expected: '9.93',
  },
  { name: 'night cream on paper', mode: 'night', fg: '--ink', bg: '--paper', expected: '15.68' },
  {
    name: 'night cream on paper2',
    mode: 'night',
    fg: '--ink',
    bg: '--paper2',
    expected: '14.37',
  },
  {
    name: 'night secondary on paper',
    mode: 'night',
    fg: '--ink2',
    bg: '--paper',
    expected: '10.99',
  },
  {
    name: 'night secondary on paper2',
    mode: 'night',
    fg: '--ink2',
    bg: '--paper2',
    expected: '10.06',
  },
  {
    name: 'night chip ink on cream',
    mode: 'night',
    fg: '--chip-fg',
    bg: '--chip-bg',
    expected: '15.68',
  },
  {
    name: 'night yellow accent on paper',
    mode: 'night',
    fg: '--y1',
    bg: '--paper',
    expected: '13.13',
  },
  {
    name: 'night repo CTA ink on y1',
    mode: 'night',
    fg: REPO_CTA_INK,
    bg: '--y1',
    expected: '13.94',
  },
  {
    name: 'night hero mark ink on y2 stripe',
    mode: 'night',
    fg: HERO_MARK_INK,
    bg: '--y2',
    expected: '15.22',
  },
  {
    name: 'building plate fg on plate',
    mode: 'day',
    fg: '--b-plate-fg',
    bg: '--b-plate',
    expected: '18.04',
  },
  {
    name: 'ticker/footer ink on yellow',
    mode: 'day',
    fg: FOOTER_DESK_INK,
    bg: '--y1',
    expected: '13.94',
  },
];

describe('WCAG contrast math (spike auditContrast port)', () => {
  it('ranks pure black on pure white at 21:1 and identical colors below AA', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(contrast('#000000', '#000000')).toBeLessThan(AA_MINIMUM);
  });

  it('is symmetric in argument order', () => {
    expect(contrast('#0c0b0a', '#ffd54f')).toBeCloseTo(contrast('#ffd54f', '#0c0b0a'), 10);
  });
});

describe('site.css token palette', () => {
  it('parses day ink and night ink from the real stylesheet blocks', () => {
    expect(hexOf(DAY, '--ink')).toBe('#0c0b0a');
    expect(hexOf(NIGHT, '--ink')).toBe('#f1ecdc');
  });

  it('resolves the audited element-rule inks that site.css hardcodes', () => {
    expect(REPO_CTA_INK).toBe('#0c0b0a');
    expect(HERO_MARK_INK).toBe('#0c0b0a');
    expect(FOOTER_DESK_INK).toBe('#0c0b0a');
  });
});

describe('contrast gate (R21, 15 audited pairs day+night)', () => {
  it.each(AUDITED)('keeps $mode $name at AA with the pinned spike ratio', (pair) => {
    const { fg, bg } = resolvePair(pair);
    const ratio = contrast(fg, bg);
    expect(ratio).toBeGreaterThanOrEqual(AA_MINIMUM);
    expect(ratio.toFixed(2)).toBe(pair.expected);
  });

  it('passes the audit over the real stylesheet palette', () => {
    expect(failingPairNames(AUDITED.map((pair) => resolvePair(pair)))).toEqual([]);
  });

  it('flags the affected pairs when a night token regresses to its day value (mutation check)', () => {
    const regressedNight: Tokens = { ...NIGHT, '--ink': hexOf(DAY, '--ink') };
    const flagged = failingPairNames(AUDITED.map((pair) => resolvePair(pair, regressedNight)));
    expect(flagged).toContain('night cream on paper');
    expect(flagged).not.toContain('light body ink on paper');
  });
});
