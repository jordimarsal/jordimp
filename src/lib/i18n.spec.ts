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

describe('ui dictionary — F2 strings', () => {
  it('pins the controller-ruled hero.role values', () => {
    expect(ui.en['hero.role']).toBe('Senior Backend Engineer');
    expect(ui.es['hero.role']).toBe('Ingeniero Backend Senior');
    expect(ui.ca['hero.role']).toBe('Enginyer de Software Backend Sènior');
  });

  it('pins projects.featured and notfound.back in the three locales', () => {
    expect(ui.en['projects.featured']).toBe('Featured work');
    expect(ui.es['projects.featured']).toBe('Trabajo destacado');
    expect(ui.ca['projects.featured']).toBe('Treball destacat');
    expect(ui.en['notfound.back']).toBe('Back to home');
    expect(ui.es['notfound.back']).toBe('Volver al inicio');
    expect(ui.ca['notfound.back']).toBe("Tornar a l'inici");
  });

  it('pins the three about bio paragraphs per locale', () => {
    expect(ui.en['about.bio.p1']).toMatch(/^I am a software engineer/);
    expect(ui.en['about.bio.p2']).toMatch(/SOLID, Clean Code and TDD/);
    expect(ui.en['about.bio.p3']).toMatch(/knowledge sharing/i);
    expect(ui.es['about.bio.p1']).toMatch(/^Ingeniero Informático/);
    expect(ui.es['about.bio.p2']).toMatch(/SOLID, Clean Code y TDD/);
    expect(ui.es['about.bio.p3']).toMatch(/conocimiento/);
    expect(ui.ca['about.bio.p1']).toMatch(/^Enginyer Informàtic/);
    expect(ui.ca['about.bio.p2']).toMatch(/SOLID, Clean Code i TDD/);
    expect(ui.ca['about.bio.p3']).toMatch(/coneixement/);
  });

  it('pins the four ways-of-working values per locale', () => {
    expect(ui.en['about.value.1']).toMatch(/SOLID, Clean Code and TDD/);
    expect(ui.en['about.value.2']).toMatch(/Tell, Don't Ask/);
    expect(ui.en['about.value.3']).toMatch(/I\/O at the edges/);
    expect(ui.en['about.value.4']).toMatch(/[Kk]nowledge sharing/);
    expect(ui.es['about.value.1']).toMatch(/SOLID, Clean Code y TDD/);
    expect(ui.es['about.value.2']).toMatch(/Tell, Don't Ask/);
    expect(ui.es['about.value.3']).toMatch(/I\/O en los bordes/);
    expect(ui.es['about.value.4']).toMatch(/[Cc]onocimiento/);
    expect(ui.ca['about.value.1']).toMatch(/SOLID, Clean Code i TDD/);
    expect(ui.ca['about.value.2']).toMatch(/Tell, Don't Ask/);
    expect(ui.ca['about.value.3']).toMatch(/I\/O a les vores/);
    expect(ui.ca['about.value.4']).toMatch(/[Cc]oneixement/);
  });
});
