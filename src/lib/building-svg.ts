import type { Locale } from './i18n';
import { DEPTS, FLOOR_LABELS, SITE, UI } from '../data/content';
import type { DeptKey } from '../data/types';

export function floorPlateLabel(lang: Locale, deptKey: DeptKey): string {
  const d = DEPTS[deptKey];
  return [d.code, d.tag[lang], d.name[lang], FLOOR_LABELS[deptKey][lang].replace(/^- /, '')].join(' — ');
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function esc(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

const FLAG: Record<Locale, readonly string[]> = {
  en: ['<rect x="780" y="10" width="56" height="30" fill="#2f5aa8"/>'],
  es: ['<rect x="780" y="10" width="56" height="30" fill="#fcdd09"/>'],
  ca: [
    '<rect x="780" y="10" width="56" height="30" fill="#fcdd09"/>',
    '<rect x="780" y="10" width="56" height="4" fill="#da121a"/>',
    '<rect x="780" y="18" width="56" height="4" fill="#da121a"/>',
    '<rect x="780" y="26" width="56" height="4" fill="#da121a"/>',
    '<rect x="780" y="34" width="56" height="4" fill="#da121a"/>',
  ],
};

type Star = readonly [number, number, number];

const STARS: readonly Star[] = [
  [52, 26, 0],
  [176, 10, 300],
  [262, 58, 600],
  [898, 20, 900],
  [936, 64, 1200],
  [36, 72, 1500],
];

const MOBILE_STARS: readonly Star[] = [
  [430, 30, 0],
  [530, 70, 400],
  [660, 22, 800],
];

const GLYPHS: Record<string, string> = {
  flask: '<path class="b-glyph" d="M562 38h20M564 38v12l-8 18h32l-8-18V38"/><rect class="b-glyph-fill" x="560" y="58" width="24" height="6"/>',
  antenna:
    '<circle class="b-glyph-fill" cx="572" cy="36" r="4"/><rect class="b-glyph-fill" x="570" y="40" width="4" height="26"/><rect class="b-glyph-fill" x="558" y="46" width="28" height="3"/><rect class="b-glyph-fill" x="564" y="54" width="16" height="3"/>',
  wrench:
    '<rect class="b-glyph" x="554" y="32" width="16" height="16"/><rect class="b-notch" x="550" y="36" width="8" height="8"/><path class="b-glyph" d="M568 46l20 20" stroke-width="7"/>',
  people:
    '<circle class="b-glyph-fill" cx="561" cy="41" r="5"/><circle class="b-glyph-fill" cx="583" cy="39" r="5"/><rect class="b-glyph-fill" x="551" y="49" width="19" height="13"/><rect class="b-glyph-fill" x="573" y="47" width="20" height="15"/>',
  ledger:
    '<rect class="b-glyph" x="558" y="38" width="28" height="30"/><rect class="b-glyph-fill" x="558" y="38" width="6" height="30"/><rect class="b-glyph-fill" x="570" y="46" width="12" height="3"/><rect class="b-glyph-fill" x="570" y="54" width="12" height="3"/>',
  bell: '<polygon class="b-glyph" points="564,60 580,60 576,46 568,46"/><rect class="b-glyph-fill" x="570" y="41" width="4" height="4"/><circle class="b-glyph-fill" cx="572" cy="65" r="3"/>',
  seal: '<rect class="b-glyph-fill" x="568" y="30" width="8" height="6"/><circle class="b-glyph" cx="572" cy="54" r="16"/><circle class="b-glyph-fill" cx="572" cy="54" r="6"/>',
};

const starRect = ([x, y, d]: Star): string =>
  `<rect class="star" x="${x}" y="${y}" width="3" height="3" style="--d:${d}ms"/>`;

export function roofSvg(
  lang: Locale,
  viewBox: string,
  cls: string,
  fid: string,
  extraStars: readonly Star[] = []
): string {
  const stars = STARS.map(starRect).join('');
  const mStars = extraStars.map(starRect).join('');
  const signSub = `${UI.estLabel[lang]} · ${DEPTS.frontdesk.tag[lang]}`;
  return `<svg class="b-svg ${cls}" viewBox="${viewBox}" role="img" aria-label="${esc(SITE.brand)} — ${esc(SITE.city[lang])}">
  <defs>
    <filter id="${fid}" x="-20%" y="-40%" width="140%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#ffd54f" flood-opacity="0.9"/>
    </filter>
  </defs>
  ${stars}
  ${mStars}
  <g>
    <rect class="b-ink" x="148" y="70" width="12" height="42"/>
    <rect class="b-ink" x="214" y="70" width="12" height="42"/>
    <rect class="b-accent" x="132" y="22" width="110" height="48" stroke="var(--b-ink)" stroke-width="3"/>
    <rect class="b-ink" x="132" y="34" width="110" height="4"/>
    <rect class="b-ink" x="132" y="54" width="110" height="4"/>
    <rect class="b-y1" x="124" y="12" width="126" height="10" stroke="var(--b-ink)" stroke-width="3"/>
  </g>
  <g>
    <circle class="b-y1" cx="314" cy="24" r="6" stroke="var(--b-ink)" stroke-width="3"/>
    <rect class="b-ink" x="312" y="30" width="4" height="82"/>
    <rect class="b-ink" x="290" y="38" width="48" height="4"/>
    <rect class="b-ink" x="298" y="52" width="32" height="4"/>
    <rect class="b-ink" x="306" y="66" width="16" height="4"/>
  </g>
  <g>
    <rect class="b-ink" x="368" y="18" width="380" height="78"/>
    <rect class="b-y1" x="360" y="10" width="380" height="78" stroke="var(--b-ink)" stroke-width="3"/>
    <text class="b-sign-word sign-glow" x="550" y="50" text-anchor="middle" filter="url(#${fid})" aria-hidden="true">JORDIMP &amp; CO.</text>
    <text class="b-sign-word" x="550" y="50" text-anchor="middle">JORDIMP &amp; CO.</text>
    <text class="b-sign-sub" x="550" y="72" text-anchor="middle">${esc(signSub)}</text>
  </g>
  <g>
    <rect class="b-ink" x="776" y="6" width="4" height="106"/>
    <circle class="b-ink" cx="778" cy="6" r="4"/>
    ${FLAG[lang].join('\n    ')}
    <rect class="b-flag" x="780" y="10" width="56" height="30" fill="none"/>
  </g>
  <g>
    <rect class="b-wall" x="848" y="50" width="42" height="62"/>
    <circle class="b-glyph" cx="869" cy="68" r="9"/>
    <circle class="b-glyph-fill" cx="869" cy="68" r="3"/>
    <rect class="b-ink" x="854" y="86" width="30" height="3"/>
    <rect class="b-ink" x="854" y="94" width="30" height="3"/>
    <rect class="b-ink" x="854" y="102" width="30" height="3"/>
  </g>
  <rect class="b-ink" x="84" y="112" width="812" height="14"/>
</svg>`;
}

export function svgRoof(lang: Locale): string {
  return `${roofSvg(lang, '0 0 980 126', 'b-svg--d', 'sign-glow')}
  ${roofSvg(lang, '350 0 400 126', 'b-svg--m', 'sign-glow-m', MOBILE_STARS)}`;
}

export function svgFloor(lang: Locale, deptKey: DeptKey): string {
  const d = DEPTS[deptKey];
  const dark = deptKey === 'operations';
  const plateCls = dark ? 'b-wall' : 'b-plate';
  const nameCls = dark ? 'b-plate-name--dark' : 'b-plate-name';
  const tagCls = dark ? 'b-plate-tag--dark' : 'b-plate-tag';
  const chipFg = '#0c0b0a';
  const windows = [624, 700, 776]
    .map(
      (x, i) =>
        `<rect class="win" x="${x}" y="28" width="48" height="44" style="--d:${i * 30}ms"/><rect class="b-ink" x="${x + 22}" y="28" width="4" height="44"/>`
    )
    .join('\n  ');
  const inner = `
  <rect class="${dark ? 'b-wall-dark' : 'b-wall'}" x="90" y="0" width="800" height="100"/>
  <rect class="b-ink" x="90" y="0" width="800" height="4"/>
  <g class="b-plategroup">
    <rect class="${plateCls} b-floorplate" x="120" y="20" width="400" height="60" stroke="var(--b-ink)" stroke-width="3"/>
    <rect class="b-y1" x="134" y="30" width="44" height="17"/>
    <text class="b-plate-code" x="156" y="43" text-anchor="middle" fill="${chipFg}">${d.code}</text>
    <text class="${tagCls}" x="186" y="43">${esc(d.tag[lang])}</text>
    <text class="${nameCls}" x="134" y="70">${esc(d.name[lang]).toUpperCase()}<tspan class="b-plate-suffix"> ${esc(FLOOR_LABELS[deptKey][lang])}</tspan></text>
  </g>
  <g class="b-iconwrap">
    <rect class="b-icon" x="548" y="28" width="48" height="48"/>
    ${GLYPHS[d.icon] ?? ''}
  </g>
  ${windows}`;
  return `<svg class="b-svg b-svg--d" viewBox="0 0 980 100" aria-hidden="true">${inner}</svg>
  <svg class="b-svg b-svg--m" viewBox="86 0 448 100" aria-hidden="true">${inner}</svg>`;
}

export function svgEntrance(lang: Locale): string {  const d = DEPTS.frontdesk;
  const windows = [200, 276, 700, 776]
    .map(
      (x, i) =>
        `<rect class="win" x="${x}" y="56" width="48" height="44" style="--d:${i * 30}ms"/><rect class="b-ink" x="${x + 22}" y="56" width="4" height="44"/>`
    )
    .join('\n  ');
  const inner = `
  <rect class="b-wall" x="90" y="0" width="800" height="124"/>
  <rect class="b-ink" x="90" y="0" width="800" height="4"/>
  ${windows}
  <g>
    <rect class="b-ink" x="416" y="46" width="4" height="78"/>
    <rect class="b-ink" x="532" y="46" width="4" height="78"/>
    <rect class="b-accent" x="412" y="24" width="128" height="22" stroke="var(--b-ink)" stroke-width="3"/>
    <rect class="b-ink" x="444" y="24" width="3" height="22"/>
    <rect class="b-ink" x="476" y="24" width="3" height="22"/>
    <rect class="b-ink" x="508" y="24" width="3" height="22"/>
  </g>
  <rect class="b-y1" x="444" y="56" width="64" height="68" stroke="var(--b-ink)" stroke-width="3"/>
  <circle class="b-ink" cx="496" cy="90" r="3"/>
  <rect class="b-wall" x="450" y="106" width="52" height="10" stroke="var(--b-ink)" stroke-width="2"/>
  <g>
    <rect class="b-icon" x="384" y="56" width="36" height="36"/>
    <polygon class="b-glyph" points="392,80 412,80 407,64 397,64"/>
    <rect class="b-glyph-fill" x="400" y="59" width="4" height="4"/>
    <circle class="b-glyph-fill" cx="402" cy="85" r="3"/>
  </g>
  <g>
    <rect class="b-plate" x="556" y="56" width="136" height="22"/>
    <text class="b-plate-sub" x="624" y="71" text-anchor="middle">${esc(d.name[lang].toUpperCase())}</text>
  </g>
  <rect class="b-ink" x="0" y="124" width="980" height="24"/>`;
  return `<svg class="b-svg b-svg--d" viewBox="0 0 980 148" aria-hidden="true">${inner}</svg>
  <svg class="b-svg b-svg--m" viewBox="86 0 468 148" aria-hidden="true">${inner}</svg>`;
}

export function itePlaqueSvg(): string {
  return `<svg class="ite-plaque__svg" viewBox="0 0 200 56" aria-hidden="true">
  <rect class="b-plate" x="2" y="2" width="196" height="52" stroke="var(--b-ink)" stroke-width="3"/>
  <rect class="b-y1" x="12" y="12" width="30" height="16"/>
  <text class="b-plate-code" x="27" y="25" text-anchor="middle" fill="#0c0b0a">Q</text>
  <text class="ite-plaque__mark" x="52" y="25">ITE</text>
  <rect class="b-glyph-fill" x="164" y="10" width="8" height="6"/>
  <circle class="b-glyph" cx="168" cy="32" r="14"/>
  <circle class="b-glyph-fill" cx="168" cy="32" r="6"/>
</svg>`;
}
