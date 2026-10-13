import { describe, expect, it } from 'vitest';
import { renderPostBlock, renderPostBlocks } from './post-blocks';
import type { PostBlock } from '../data/types';

const paragraph: PostBlock = {
  kind: 'paragraph',
  html: { en: 'Runs with <code>--jinja</code> enabled.', es: 'Corre con <code>--jinja</code> activado.', ca: 'Corre amb <code>--jinja</code> activat.' },
};

const list: PostBlock = {
  kind: 'list',
  items: {
    en: ['Pin the samplings', 'Read the exclusions'],
    es: ['Fija el muestreo', 'Lee las exclusiones'],
    ca: ['Fixa el mostreig', 'Llegeix les exclusions'],
  },
};

const subheading: PostBlock = {
  kind: 'subheading',
  anchor: 'ties',
  text: { en: 'The top rows are ties', es: 'Las primeras filas son empates', ca: 'Les primeres files són empats' },
};

const table: PostBlock = {
  kind: 'table',
  head: ['model', 'tools', 'global'],
  rows: [
    ['gemma-4-26b-a4b-it q5_k_xl', '92%', '0.84'],
    ['strata iq3_xxs', '86%', '0.80'],
  ],
};

describe('renderPostBlock()', () => {
  it('renders a paragraph with its authored inline HTML in the page locale', () => {
    expect(renderPostBlock(paragraph, 'en')).toBe('<p>Runs with <code>--jinja</code> enabled.</p>');
    expect(renderPostBlock(paragraph, 'es')).toBe('<p>Corre con <code>--jinja</code> activado.</p>');
    expect(renderPostBlock(paragraph, 'ca')).toBe('<p>Corre amb <code>--jinja</code> activat.</p>');
  });

  it('renders a list as one ul with an li per item in the page locale', () => {
    expect(renderPostBlock(list, 'en')).toBe(
      '<ul><li>Pin the samplings</li><li>Read the exclusions</li></ul>',
    );
    expect(renderPostBlock(list, 'ca')).toBe(
      '<ul><li>Fixa el mostreig</li><li>Llegeix les exclusions</li></ul>',
    );
  });

  it('renders a subheading as an h3 whose id is the block anchor', () => {
    expect(renderPostBlock(subheading, 'es')).toBe(
      '<h3 id="ties">Las primeras filas son empates</h3>',
    );
  });

  it('renders a table as a scrolling table with thead and one tr per row', () => {
    expect(renderPostBlock(table, 'en')).toBe(
      '<div class="table-scroll"><table>'
        + '<thead><tr><th>model</th><th>tools</th><th>global</th></tr></thead>'
        + '<tbody><tr><td>gemma-4-26b-a4b-it q5_k_xl</td><td>92%</td><td>0.84</td></tr>'
        + '<tr><td>strata iq3_xxs</td><td>86%</td><td>0.80</td></tr></tbody>'
        + '</table></div>',
    );
  });

  it('escapes markup-significant characters in table cells only', () => {
    const hostile: PostBlock = {
      kind: 'table',
      head: ['<script>alert("x")</script>', 'a & b'],
      rows: [['<img src=x onerror=alert(1)>', '"quoted"']],
    };
    const html = renderPostBlock(hostile, 'en');
    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(html).toContain('<th>a &amp; b</th>');
    expect(html).toContain('<td>&lt;img src=x onerror=alert(1)&gt;</td>');
    expect(html).toContain('<td>&quot;quoted&quot;</td>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
  });

  it('passes authored inline HTML through in paragraphs and lists (same trust model as HOME.h1)', () => {
    const linked: PostBlock = {
      kind: 'paragraph',
      html: {
        en: 'Built <a href="https://github.com/jordimarsal/ggufbench">ggufbench</a>.',
        es: 'Construí <a href="https://github.com/jordimarsal/ggufbench">ggufbench</a>.',
        ca: 'Vaig construir <a href="https://github.com/jordimarsal/ggufbench">ggufbench</a>.',
      },
    };
    expect(renderPostBlock(linked, 'en')).toBe(
      '<p>Built <a href="https://github.com/jordimarsal/ggufbench">ggufbench</a>.</p>',
    );
  });
});

describe('renderPostBlocks()', () => {
  it('concatenates every block in order', () => {
    expect(renderPostBlocks([paragraph, subheading, table], 'en')).toBe(
      renderPostBlock(paragraph, 'en')
        + renderPostBlock(subheading, 'en')
        + renderPostBlock(table, 'en'),
    );
  });

  it('returns an empty string for an empty block list', () => {
    expect(renderPostBlocks([], 'es')).toBe('');
  });
});
