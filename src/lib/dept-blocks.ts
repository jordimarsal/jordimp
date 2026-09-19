import type { Locale } from './i18n';
import { EXPERIENCE, OPERATIONS_PAGE, SKILLS } from '../data/content';
import { esc } from './building-svg';

export function shiftLogHTML(lang: Locale): string {
  const rows = EXPERIENCE.map((e) => {
    const now = e.current
      ? ` <span class="shiftlog__now"><span class="dot dot--live" aria-hidden="true"></span>${esc(OPERATIONS_PAGE.onShift[lang])}</span>`
      : '';
    const role = `<p class="shiftlog__role">${esc(e.role[lang])}</p>`;
    const points = `<ul class="shiftlog__points">${e.points[lang].map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>`;
    const chips = `<div class="chiprow">${e.stack.map((s) => `<span class="chip3">${esc(s)}</span>`).join('')}</div>`;
    return `<div class="ledger__row">
  <span class="ledger__per mono"><i>${esc(e.period)}</i></span>
  <div class="ledger__body">
    <div class="shiftlog__head"><b>${esc(e.company)}</b>${now}</div>
    ${role}
    ${points}
    ${chips}
  </div>
</div>`;
  }).join('\n');
  return `<div class="ledger shiftlog">${rows}</div>`;
}

export function ledgerHTML(lang: Locale): string {
  const rows = EXPERIENCE.map(
    (e) => `<div class="ledger__row">
  <span class="ledger__per mono"><i>${esc(e.period)}</i></span>
  <div class="ledger__body"><b>${esc(e.company)}</b><p>${esc(e.points[lang].join(' '))}</p></div>
</div>`
  ).join('\n');
  return `<div class="ledger">${rows}</div>`;
}

export function skillGridHTML(lang: Locale): string {
  return SKILLS.map(
    (g) => `<div class="skillcard"><h3>${esc(g.group[lang])}</h3><ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`
  ).join('\n  ');
}
