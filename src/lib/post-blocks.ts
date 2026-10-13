import type { Locale } from './i18n';
import type { PostBlock } from '../data/types';

const escapeCell = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

export function renderPostBlock(block: PostBlock, lang: Locale): string {
  switch (block.kind) {
    case 'paragraph':
      return `<p>${block.html[lang]}</p>`;
    case 'list':
      return `<ul>${block.items[lang].map((item) => `<li>${item}</li>`).join('')}</ul>`;
    case 'subheading':
      return `<h3 id="${block.anchor}">${block.text[lang]}</h3>`;
    case 'table':
      return [
        '<div class="table-scroll"><table>',
        `<thead><tr>${block.head.map((cell) => `<th>${escapeCell(cell)}</th>`).join('')}</tr></thead>`,
        `<tbody>${block.rows
          .map((row) => `<tr>${row.map((cell) => `<td>${escapeCell(cell)}</td>`).join('')}</tr>`)
          .join('')}</tbody>`,
        '</table></div>',
      ].join('');
  }
}

export function renderPostBlocks(blocks: readonly PostBlock[], lang: Locale): string {
  return blocks.map((block) => renderPostBlock(block, lang)).join('');
}
