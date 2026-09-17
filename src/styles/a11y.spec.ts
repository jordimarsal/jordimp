import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function read(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const tokens = read('./tokens.css');
const globalCss = read('./global.css');
const headerNav = read('../components/HeaderNav.astro');
const baseLayout = read('../layouts/BaseLayout.astro');

const MIN_TEXT_RATIO = 4.5;
const MIN_GRAPHIC_RATIO = 3;
const MIN_TARGET_SIZE = 24;

type ThemeTokens = Record<string, string>;

function themeTokens(css: string, theme: 'dark' | 'light'): ThemeTokens {
  const block = css.match(
    new RegExp(`:root\\[data-theme='${theme}'\\]\\s*\\{([^}]*)\\}`)
  );
  if (!block) throw new Error(`missing theme block: ${theme}`);
  return Object.fromEntries(
    [...block[1].matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map(
      ([, name, hex]) => [name, hex.toLowerCase()]
    )
  );
}

function relativeLuminance(hex: string): number {
  const channels = [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 1 + i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (a, b) => b - a
  );
  return (lighter + 0.05) / (darker + 0.05);
}

describe('theme tokens (WCAG 2.1 contrast)', () => {
  const themes = ['dark', 'light'] as const;

  it.each(themes)('%s: accent text on both backgrounds meets 4.5:1', (theme) => {
    const t = themeTokens(tokens, theme);
    expect(contrastRatio(t['accent-text'], t['bg'])).toBeGreaterThanOrEqual(MIN_TEXT_RATIO);
    expect(contrastRatio(t['accent-text'], t['surface'])).toBeGreaterThanOrEqual(MIN_TEXT_RATIO);
  });

  it.each(themes)('%s: accent-contrast label on accent-strong and accent-deep fills meets 4.5:1', (theme) => {
    const t = themeTokens(tokens, theme);
    expect(contrastRatio(t['accent-contrast'], t['accent-strong'])).toBeGreaterThanOrEqual(
      MIN_TEXT_RATIO
    );
    expect(contrastRatio(t['accent-contrast'], t['accent-deep'])).toBeGreaterThanOrEqual(
      MIN_TEXT_RATIO
    );
  });

  it.each(themes)('%s: body text and muted text on bg meet 4.5:1', (theme) => {
    const t = themeTokens(tokens, theme);
    expect(contrastRatio(t['text'], t['bg'])).toBeGreaterThanOrEqual(MIN_TEXT_RATIO);
    expect(contrastRatio(t['muted'], t['bg'])).toBeGreaterThanOrEqual(MIN_TEXT_RATIO);
  });

  it.each(themes)('%s: decorative accent stays a valid graphic color (>= 3:1 on bg)', (theme) => {
    const t = themeTokens(tokens, theme);
    expect(contrastRatio(t['accent'], t['bg'])).toBeGreaterThanOrEqual(MIN_GRAPHIC_RATIO);
  });
});

function declarationsFor(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

function pxValue(declarations: string, property: string): number {
  const match = declarations.match(new RegExp(`${property}:\\s*(\\d+(?:\\.\\d+)?)px`));
  if (!match) throw new Error(`property not found: ${property}`);
  return Number(match[1]);
}

describe('interactive targets (WCAG 2.5.8 minimum size)', () => {
  it('header nav links expose a hit area of at least 24px height', () => {
    const navLinkRule = declarationsFor(headerNav, '.site-nav a {');
    expect(pxValue(navLinkRule, 'min-height')).toBeGreaterThanOrEqual(MIN_TARGET_SIZE);
  });

  it('locale switcher links expose a hit area of at least 24px in both axes', () => {
    const localeLinkRule = declarationsFor(globalCss, '.locale-link {');
    expect(pxValue(localeLinkRule, 'min-height')).toBeGreaterThanOrEqual(MIN_TARGET_SIZE);
    expect(pxValue(localeLinkRule, 'min-width')).toBeGreaterThanOrEqual(MIN_TARGET_SIZE);
  });
});

describe('monogram home link (accessible name contains visible text)', () => {
  it('the header home anchor aria-label contains the visible JM monogram', () => {
    const anchor = baseLayout.match(/<a [^>]*aria-label="([^"]+)"><slot name="logo">/);
    if (!anchor) throw new Error('header home anchor not found in BaseLayout');
    expect(anchor[1]).toContain('JM');
  });
});
