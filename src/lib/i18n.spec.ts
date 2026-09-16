import { describe, expect, it } from 'vitest';
import { L, LOCALES } from './i18n';
import { ui } from '../i18n/ui';

describe('L()', () => {
  const field = { en: 'Projects', es: 'Proyectos', ca: 'Projectes' };

  it('returns the requested locale', () => {
    expect(L(field, 'es')).toBe('Proyectos');
    expect(L(field, 'ca')).toBe('Projectes');
  });

  it('falls back to en for a missing locale', () => {
    const partial = { en: 'Only', es: undefined, ca: undefined } as unknown as Record<'en' | 'es' | 'ca', string>;
    expect(L(partial, 'es')).toBe('Only');
  });
});

describe('ui dictionary', () => {
  it('declares the same keys for every locale', () => {
    const [en, es, ca] = LOCALES.map((lang) => Object.keys(ui[lang]).sort());
    expect(es).toEqual(en);
    expect(ca).toEqual(en);
  });

  it('has no empty strings in any locale', () => {
    for (const lang of LOCALES) {
      for (const [key, value] of Object.entries(ui[lang])) {
        expect(value.trim(), `${lang}:${key}`).not.toBe('');
      }
    }
  });

  it('keeps every localized string free of phone numbers', () => {
    for (const lang of LOCALES) {
      for (const [key, value] of Object.entries(ui[lang])) {
        expect(value, `${lang}:${key}`).not.toMatch(/\d{9}/);
      }
    }
  });
});
