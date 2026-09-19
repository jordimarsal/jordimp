import { describe, expect, it } from 'vitest';
import { NIGHT_BOOTSTRAP } from './night-boot';

describe('NIGHT_BOOTSTRAP', () => {
  it('reads the persisted night preference', () => {
    expect(NIGHT_BOOTSTRAP).toContain('localStorage.getItem("jordimp-night")');
    expect(NIGHT_BOOTSTRAP).toContain('s==="1"');
  });

  it('falls back to the system preference only when nothing is stored', () => {
    expect(NIGHT_BOOTSTRAP).toContain('s===null&&window.matchMedia');
    expect(NIGHT_BOOTSTRAP).toContain('matchMedia("(prefers-color-scheme: dark)").matches');
  });

  it('sets the night attribute on the document element', () => {
    expect(NIGHT_BOOTSTRAP).toContain('document.documentElement.setAttribute("data-night","1")');
  });

  it('survives an unavailable localStorage (privacy mode)', () => {
    expect(NIGHT_BOOTSTRAP.startsWith('try{')).toBe(true);
    expect(NIGHT_BOOTSTRAP.endsWith('catch(e){}')).toBe(true);
  });
});
