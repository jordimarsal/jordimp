import { afterEach, describe, expect, it, vi } from 'vitest';
import { assetPath, dirRoute, prodUrl, srcPath } from './paths';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('srcPath', () => {
  it('joins locale and route under the root base', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(srcPath('en', '')).toBe('/en/');
    expect(srcPath('es', 'projects/')).toBe('/es/projects/');
    expect(srcPath('ca', 'projects/kafka-adapter/')).toBe('/ca/projects/kafka-adapter/');
  });

  it('joins locale and route under the demo base', () => {
    vi.stubEnv('BASE_URL', '/demo');
    expect(srcPath('en', '')).toBe('/demo/en/');
    expect(srcPath('es', 'cv/')).toBe('/demo/es/cv/');
  });

  it('normalizes a trailing slash on the base', () => {
    vi.stubEnv('BASE_URL', '/demo/');
    expect(srcPath('ca', 'departments/people/')).toBe('/demo/ca/departments/people/');
  });
});

describe('assetPath', () => {
  it('prefixes public assets under the root base', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(assetPath('favicon.svg')).toBe('/favicon.svg');
    expect(assetPath('fonts/fonts.css')).toBe('/fonts/fonts.css');
  });

  it('prefixes public assets under the demo base', () => {
    vi.stubEnv('BASE_URL', '/demo');
    expect(assetPath('favicon.svg')).toBe('/demo/favicon.svg');
    expect(assetPath('fonts/fonts.css')).toBe('/demo/fonts/fonts.css');
  });
});

describe('prodUrl', () => {
  it('always returns the absolute production URL', () => {
    expect(prodUrl('en', '')).toBe('https://jordimp.net/en/');
    expect(prodUrl('es', 'projects/')).toBe('https://jordimp.net/es/projects/');
  });

  it('ignores the build base so demo canonicals stay production', () => {
    vi.stubEnv('BASE_URL', '/demo');
    expect(prodUrl('ca', 'cv/')).toBe('https://jordimp.net/ca/cv/');
  });
});

describe('dirRoute', () => {
  it('maps spike file routes to Astro directory routes', () => {
    expect(dirRoute('index.html')).toBe('');
    expect(dirRoute('cv.html')).toBe('cv/');
    expect(dirRoute('departments/research.html')).toBe('departments/research/');
    expect(dirRoute('departments/front-desk.html')).toBe('departments/front-desk/');
    expect(dirRoute('projects/kafka-adapter-telemetry.html')).toBe('projects/kafka-adapter-telemetry/');
  });

  it('renames the work route to projects', () => {
    expect(dirRoute('work.html')).toBe('projects/');
  });
});
