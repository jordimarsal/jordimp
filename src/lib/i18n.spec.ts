import { describe, expect, it } from 'vitest';
import { L } from './i18n';

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
