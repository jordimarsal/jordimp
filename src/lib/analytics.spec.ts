import { describe, expect, it } from 'vitest';
import { goatCounterEndpoint } from './analytics';

describe('goatCounterEndpoint()', () => {
  it('accepts a code and returns its count endpoint', () => {
    expect(goatCounterEndpoint('jordimp')).toBe('https://jordimp.goatcounter.com/count');
  });

  it('trims surrounding whitespace off the code', () => {
    expect(goatCounterEndpoint('  jordimp\n')).toBe('https://jordimp.goatcounter.com/count');
  });

  it('rejects an unset code', () => {
    expect(goatCounterEndpoint(undefined)).toBeUndefined();
  });

  it('rejects an empty code', () => {
    expect(goatCounterEndpoint('')).toBeUndefined();
  });

  it('rejects a whitespace-only code', () => {
    expect(goatCounterEndpoint('   ')).toBeUndefined();
    expect(goatCounterEndpoint('\t\n')).toBeUndefined();
  });
});
