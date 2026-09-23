import { describe, expect, it } from 'vitest';
import { CONTACT_EMAIL, SITE as CONFIG_SITE } from './config';
import { SITE as CONTENT_SITE } from './data/content';

describe('contact email single source of truth', () => {
  it('uses hello@jordimp.net as the canonical address', () => {
    expect(CONTACT_EMAIL).toBe('hello@jordimp.net');
  });

  it('has both SITE constants reference the canonical value', () => {
    expect(CONFIG_SITE.email).toBe(CONTACT_EMAIL);
    expect(CONTENT_SITE.email).toBe(CONTACT_EMAIL);
  });
});
