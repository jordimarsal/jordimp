import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const SITE_CSS = readFileSync(new URL('./site.css', import.meta.url), 'utf8');

function ruleBody(selector: string): string {
  const pattern = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`);
  const block = pattern.exec(SITE_CSS)?.[1];
  if (block === undefined) {
    throw new Error(`site.css: rule not found for ${selector}`);
  }
  return block;
}

function mediaBlocks(source: string): string[] {
  const blocks: string[] = [];
  const header = /@media \(max-width: 760px\)\s*\{/g;
  for (const match of source.matchAll(header)) {
    const start = match.index + match[0].length;
    let depth = 1;
    let end = start;
    while (depth > 0 && end < source.length) {
      if (source[end] === '{') depth += 1;
      if (source[end] === '}') depth -= 1;
      end += 1;
    }
    blocks.push(source.slice(start, end - 1));
  }
  if (blocks.length === 0) {
    throw new Error('site.css: no mobile media blocks found');
  }
  return blocks;
}

function mediaRuleBody(selector: string): string {
  const pattern = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`);
  for (const block of mediaBlocks(SITE_CSS)) {
    const found = pattern.exec(block)?.[1];
    if (found !== undefined) {
      return found;
    }
  }
  throw new Error(`site.css: rule not found in any mobile block for ${selector}`);
}

describe('navbar language switcher affordance (F20 R1)', () => {
  it('keeps the bordered control and adds the offset hard shadow', () => {
    const body = ruleBody('.navbar__lang');
    expect(body).toContain('border: 2.5px solid var(--line)');
    expect(body).toContain('box-shadow: 3px 3px 0 var(--shc)');
  });

  it('uses the same shadow vocabulary as the night toggle', () => {
    expect(ruleBody('.night-btn')).toContain('box-shadow: 3px 3px 0 var(--shc)');
  });
});

describe('navbar language switcher cursor (F20 R2)', () => {
  it('presents the pointer cursor on every locale link', () => {
    expect(ruleBody('.navbar__lang a')).toContain('cursor: pointer');
  });
});

describe('navbar hover and focus affordance (F20 R3)', () => {
  it('scopes the hover and focus-visible bar to non-current links only', () => {
    expect(SITE_CSS).toContain(
      ".navbar__lang a:not([aria-current='true']):hover,\n.navbar__lang a:not([aria-current='true']):focus-visible",
    );
  });

  it('renders the lite background with the inset yellow bottom bar', () => {
    const body = ruleBody(".navbar__lang a:not([aria-current='true']):hover,\n.navbar__lang a:not([aria-current='true']):focus-visible");
    expect(body).toContain('background: var(--lite)');
    expect(body).toContain('box-shadow: inset 0 -3px 0 var(--y1)');
  });
});

describe('navbar current-locale marker (F20 R4)', () => {
  it('prepends the dot glyph to the current link via ::before', () => {
    expect(ruleBody(".navbar__lang a[aria-current='true']::before")).toContain(
      "content: '● '",
    );
  });
});

describe('navbar switcher tap targets on mobile (F20 R5)', () => {
  it('sizes every locale link to at least 44×44 inside the mobile block', () => {
    const body = mediaRuleBody('.navbar__lang a');
    expect(body).toContain('min-width: 44px');
    expect(body).toContain('min-height: 44px');
    expect(body).toContain('display: inline-flex');
    expect(body).toContain('align-items: center');
    expect(body).toContain('justify-content: center');
  });
});

describe('navbar switcher night-mode safety (F20 R7)', () => {
  it('keeps hex literals out of every rule body this feature adds or modifies', () => {
    const addedBodies = [
      ruleBody('.navbar__lang'),
      ruleBody('.navbar__lang a'),
      ruleBody(".navbar__lang a[aria-current='true']::before"),
      ruleBody(
        ".navbar__lang a:not([aria-current='true']):hover,\n.navbar__lang a:not([aria-current='true']):focus-visible",
      ),
      mediaRuleBody('.navbar__lang a'),
    ];
    for (const body of addedBodies) {
      expect(body).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });

  it('drives every declared color and shadow from the custom-property tokens', () => {
    const addedBodies = [
      ruleBody('.navbar__lang'),
      ruleBody('.navbar__lang a'),
      ruleBody(
        ".navbar__lang a:not([aria-current='true']):hover,\n.navbar__lang a:not([aria-current='true']):focus-visible",
      ),
      mediaRuleBody('.navbar__lang a'),
    ];
    for (const body of addedBodies) {
      const declaresColor = /(?:border|background|box-shadow|color):/.test(body);
      if (declaresColor) {
        expect(body).toMatch(/var\(--/);
      }
    }
  });
});
