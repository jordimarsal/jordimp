import type { Locale } from './i18n';
import { PEOPLE_PAGE, TELEMETRY_PAGE } from '../data/content';
import { esc } from './building-svg';

const dgArrow = (x1: number, y1: number, x2: number, y2: number, dashed?: boolean): string => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const hx = x2 - ux * 7;
  const hy = y2 - uy * 7;
  const w = 4;
  return `<line class="dg-line${dashed ? ' dg-line--dash' : ''}" x1="${x1}" y1="${y1}" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}"/><polygon class="dg-head" points="${x2},${y2} ${(hx + px * w).toFixed(1)},${(hy + py * w).toFixed(1)} ${(hx - px * w).toFixed(1)},${(hy - py * w).toFixed(1)}"/>`;
};

const dgBox = (x: number, y: number, w: number, h: number, label: string, accent?: boolean): string =>
  `<rect class="${accent ? 'dg-accent' : 'dg-box'}" x="${x}" y="${y}" width="${w}" height="${h}"/><text class="dg-txt" x="${x + w / 2}" y="${y + h / 2 + 3}" text-anchor="middle">${esc(label)}</text>`;

const dgLabel = (x: number, y: number, label: string): string => `<text class="dg-txt dg-txt--sm" x="${x}" y="${y}" text-anchor="middle">${esc(label)}</text>`;

export function telemetryDiagrams(lang: Locale): string {
  const kafka = `<svg class="b-svg" viewBox="0 0 560 170" aria-hidden="true">
  ${dgLabel(134, 20, 'EVENTS')}
  ${dgLabel(264, 20, 'CONSUME')}
  ${dgLabel(384, 20, 'IDEMPOTENT')}
  ${dgBox(16, 30, 96, 34, 'GATEWAY')}
  ${dgBox(156, 30, 86, 34, 'KAFKA', true)}
  ${dgBox(286, 30, 76, 34, 'HUB')}
  ${dgBox(406, 30, 96, 34, 'ORACLE')}
  ${dgArrow(112, 47, 156, 47)}
  ${dgArrow(242, 47, 286, 47)}
  ${dgArrow(362, 47, 406, 47)}
  ${dgLabel(338, 96, 'LIVE')}
  ${dgBox(286, 112, 76, 34, 'SSE DASH')}
  ${dgArrow(324, 64, 324, 112)}
  ${dgLabel(212, 96, 'RETRIES')}
  ${dgBox(156, 112, 86, 34, 'DLT')}
  ${dgArrow(199, 64, 199, 112, true)}
</svg>`;
  const redis = `<svg class="b-svg" viewBox="0 0 340 170" aria-hidden="true">
  ${dgLabel(121, 24, 'REQUEST')}
  ${dgBox(12, 36, 84, 34, 'CLIENT')}
  ${dgArrow(96, 53, 148, 53)}
  <polygon class="dg-accent" points="152,26 244,26 234,96 162,96"/>
  <rect class="dg-token" x="174" y="38" width="14" height="10"/>
  <rect class="dg-token" x="194" y="34" width="14" height="10"/>
  <rect class="dg-token" x="214" y="42" width="14" height="10"/>
  ${dgBox(268, 22, 62, 26, '200 OK')}
  ${dgBox(268, 62, 62, 26, '429')}
  ${dgArrow(236, 46, 268, 37)}
  ${dgArrow(236, 76, 268, 75)}
  <text class="dg-txt dg-txt--sm" x="252" y="112" text-anchor="middle">ATOMIC</text>
  <ellipse class="dg-box" cx="196" cy="120" rx="42" ry="7"/>
  <line class="dg-line" x1="154" y1="120" x2="154" y2="146"/>
  <line class="dg-line" x1="238" y1="120" x2="238" y2="146"/>
  <path class="dg-line" d="M154 146 A42 7 0 0 0 238 146"/>
  <text class="dg-txt" x="196" y="140" text-anchor="middle">REDIS</text>
  ${dgArrow(196, 98, 196, 111, true)}
</svg>`;
  return `<div class="diagram-strip">
    <figure class="diagram">
      ${kafka}
      <figcaption>${esc(TELEMETRY_PAGE.kafkaCaption[lang])}</figcaption>
    </figure>
    <figure class="diagram">
      ${redis}
      <figcaption>${esc(TELEMETRY_PAGE.redisCaption[lang])}</figcaption>
    </figure>
  </div>`;
}

export function coverageMap(): string {
  const port = (cx: number, filled: boolean, label?: string): string =>
    filled
      ? `<circle class="dg-accent" cx="${cx}" cy="76" r="15"/><text class="dg-txt" x="${cx}" y="80" text-anchor="middle">${esc(label ?? '')}</text>`
      : `<circle class="dg-box" cx="${cx}" cy="76" r="15"/><circle class="dg-token" cx="${cx}" cy="76" r="3.5"/>`;
  const ports = [70, 160, 250, 340]
    .map((cx, i) => (i === 0 ? port(cx, true, 'ES') : port(cx, false)) + `\n  <line class="dg-line" x1="${cx + 15}" y1="76" x2="430" y2="76"/>`)
    .join('\n  ');
  return `<svg class="b-svg" viewBox="0 0 980 120" aria-hidden="true">
  <rect class="b-wall" x="16" y="8" width="948" height="104"/>
  <rect class="b-plate" x="36" y="22" width="170" height="22"/>
  <text class="b-plate-sub" x="121" y="37" text-anchor="middle">OPEN GATEWAY</text>
  ${ports}
  ${dgArrow(430, 76, 458, 76)}
  <text class="dg-txt dg-txt--lg" x="478" y="66">~90 ADAPTERS REPORTING</text>
  <text class="dg-txt dg-txt--lg" x="478" y="90">4 COUNTRIES ON THE BOARD</text>
</svg>`;
}

export function orgChart(lang: Locale): string {
  const roles = PEOPLE_PAGE.orgRoles[lang];
  const xs = [52, 284, 516, 748];
  const boxes = xs.map((x, i) => `${dgBox(x, 10, 180, 32, roles[i])}
  <line class="dg-line" x1="${x + 90}" y1="42" x2="${x + 90}" y2="78"/>`).join('\n  ');
  return `<svg class="b-svg" viewBox="0 0 980 210" aria-hidden="true">
  ${boxes}
  <line class="dg-line" x1="142" y1="78" x2="838" y2="78"/>
  <line class="dg-line" x1="490" y1="78" x2="490" y2="92"/>
  <circle class="dg-accent" cx="490" cy="106" r="12"/>
  <line class="dg-line" x1="490" y1="118" x2="490" y2="156"/>
  <line class="dg-line" x1="462" y1="134" x2="518" y2="134"/>
  <line class="dg-line" x1="490" y1="156" x2="472" y2="188"/>
  <line class="dg-line" x1="490" y1="156" x2="508" y2="188"/>
  <rect class="b-plate" x="522" y="124" width="76" height="20"/>
  <text class="b-plate-sub" x="560" y="138" text-anchor="middle">JORDI</text>
</svg>`;
}
