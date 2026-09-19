import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

const LATIN_RANGE =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN_EXT_RANGE =
  'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';

const EXPECTED_DECLARATIONS: readonly string[] = [
  `@font-face{font-family:'Bricolage Grotesque';font-style:normal;font-weight:800;font-display:swap;src:url('/fonts/bricolage-grotesque-800-latin.woff2') format('woff2');unicode-range:${LATIN_RANGE};}`,
  `@font-face{font-family:'Bricolage Grotesque';font-style:normal;font-weight:800;font-display:swap;src:url('/fonts/bricolage-grotesque-800-latin-ext.woff2') format('woff2');unicode-range:${LATIN_EXT_RANGE};}`,
  `@font-face{font-family:'Instrument Sans';font-style:normal;font-weight:400 700;font-display:swap;src:url('/fonts/instrument-sans-var-latin.woff2') format('woff2');unicode-range:${LATIN_RANGE};}`,
  `@font-face{font-family:'Instrument Sans';font-style:normal;font-weight:400 700;font-display:swap;src:url('/fonts/instrument-sans-var-latin-ext.woff2') format('woff2');unicode-range:${LATIN_EXT_RANGE};}`,
  `@font-face{font-family:'Space Mono';font-style:normal;font-weight:400;font-display:swap;src:url('/fonts/space-mono-400-latin.woff2') format('woff2');unicode-range:${LATIN_RANGE};}`,
  `@font-face{font-family:'Space Mono';font-style:normal;font-weight:400;font-display:swap;src:url('/fonts/space-mono-400-latin-ext.woff2') format('woff2');unicode-range:${LATIN_EXT_RANGE};}`,
  `@font-face{font-family:'Space Mono';font-style:normal;font-weight:700;font-display:swap;src:url('/fonts/space-mono-700-latin.woff2') format('woff2');unicode-range:${LATIN_RANGE};}`,
  `@font-face{font-family:'Space Mono';font-style:normal;font-weight:700;font-display:swap;src:url('/fonts/space-mono-700-latin-ext.woff2') format('woff2');unicode-range:${LATIN_EXT_RANGE};}`,
];

async function loadFontFaceCss(baseUrl: string): Promise<string> {
  vi.stubEnv('BASE_URL', baseUrl);
  vi.resetModules();
  const { FONT_FACE_CSS } = await import('./font-face');
  return FONT_FACE_CSS;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('FONT_FACE_CSS', () => {
  it('emits exactly the eight retired fonts.css declarations under the root base', async () => {
    const css = await loadFontFaceCss('/');
    expect(css.match(/@font-face\{/g)).toHaveLength(8);
    for (const declaration of EXPECTED_DECLARATIONS) {
      expect(css).toContain(declaration);
    }
  });

  it('emits exactly the eight retired fonts.css declarations under the demo base', async () => {
    const css = await loadFontFaceCss('/demo');
    expect(css.match(/@font-face\{/g)).toHaveLength(8);
    expect(css).toContain(`url('/demo/fonts/instrument-sans-var-latin.woff2')`);
    expect(css).not.toContain(`url('/fonts/`);
    for (const declaration of EXPECTED_DECLARATIONS) {
      expect(css).toContain(declaration.replace(`url('/fonts/`, `url('/demo/fonts/`));
    }
  });

  it('keeps font-display swap and woff2 as the only source format', async () => {
    const css = await loadFontFaceCss('/');
    expect(css.match(/font-display:swap;/g)).toHaveLength(8);
    expect(css.match(/format\('woff2'\)/g)).toHaveLength(8);
    expect(css).not.toContain('font-style:italic');
  });

  it('references only woff2 files that exist on disk under public/fonts', async () => {
    const css = await loadFontFaceCss('/');
    const urls = css.match(/url\('([^']+)'\)/g) ?? [];
    expect(urls).toHaveLength(8);
    for (const raw of urls) {
      const url = raw.slice(5, -2);
      expect(() => readFileSync(`public${url}`)).not.toThrow();
    }
  });

  it('never references the retired fonts.css stylesheet', async () => {
    const css = await loadFontFaceCss('/');
    expect(css).not.toContain('fonts.css');
  });
});
