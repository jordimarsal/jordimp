import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const robotsTxt = (): string =>
  readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');

describe('public/robots.txt (transition)', () => {
  it('allows everything except the transition demo path', () => {
    const text = robotsTxt();
    expect(text).toContain('User-agent: *');
    expect(text).toContain('Allow: /');
    expect(text).toContain('Disallow: /demo/');
  });

  it('points at the sitemap index of the production host', () => {
    expect(robotsTxt()).toContain('Sitemap: https://jordimp.net/sitemap-index.xml');
  });
});
