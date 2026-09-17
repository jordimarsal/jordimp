import { describe, expect, it } from 'vitest';
import { externalLinkAttrs, isExternalUrl } from './links';

const ORIGIN = 'https://jordimp.net';
const EXTERNAL_ATTRS = { target: '_blank', rel: 'noopener noreferrer' } as const;

describe('isExternalUrl()', () => {
  const externalCases = [
    { name: 'github profile', href: 'https://github.com/jordimarsal' },
    { name: 'linkedin profile', href: 'https://www.linkedin.com/in/jordi-marsal-poy' },
    { name: 'plain http host', href: 'http://example.com/page' },
    { name: 'uppercase host', href: 'HTTPS://GITHUB.COM/jordimarsal' },
    { name: 'lookalike domain suffix', href: 'https://jordimp.net.evil.com/' },
    { name: 'protocol-relative off-site', href: '//github.com/jordimarsal' },
  ];

  it.each(externalCases)('classifies $name as external', ({ href }) => {
    expect(isExternalUrl(href, ORIGIN)).toBe(true);
  });

  const internalCases = [
    { name: 'mailto scheme', href: 'mailto:jordi.marsal@gmail.com' },
    { name: 'tel scheme', href: 'tel:+34600000000' },
    { name: 'root-relative path', href: '/en/cv/' },
    { name: 'bare fragment', href: '#top' },
    { name: 'ftp scheme', href: 'ftp://example.com/file' },
    { name: 'same-host absolute url', href: 'https://jordimp.net/en/projects/' },
    { name: 'protocol-relative same host', href: '//jordimp.net/en/' },
    { name: 'www host', href: 'HTTPS://WWW.JORDIMP.NET/' },
    { name: 'empty href', href: '' },
    { name: 'unparseable host', href: 'https://exa mple.com/' },
  ];

  it.each(internalCases)('classifies $name as internal', ({ href }) => {
    expect(isExternalUrl(href, ORIGIN)).toBe(false);
  });
});

describe('externalLinkAttrs()', () => {
  it('decorates an external href with target and rel', () => {
    expect(externalLinkAttrs('https://github.com/jordimarsal', ORIGIN)).toEqual(EXTERNAL_ATTRS);
  });

  it('leaves an internal href without attributes', () => {
    expect(externalLinkAttrs('mailto:jordi.marsal@gmail.com', ORIGIN)).toEqual({});
  });

  it('never renders target without the exact rel value or vice versa', () => {
    for (const href of ['https://github.com/jordimarsal', '/en/cv/', 'ftp://x', '']) {
      const attrs = externalLinkAttrs(href, ORIGIN);
      const hasTarget = 'target' in attrs;
      const hasRel = 'rel' in attrs;
      expect(hasTarget).toBe(hasRel);
      if (hasTarget) {
        expect(attrs).toEqual(EXTERNAL_ATTRS);
      }
    }
  });
});
