import { describe, expect, it } from 'vitest';
import { ledgerHTML, shiftLogHTML, skillGridHTML } from './dept-blocks';
import { EXPERIENCE, OPERATIONS_PAGE, SKILLS } from '../data/content';
import { LOCALES } from './i18n';
import { esc } from './building-svg';

describe('ledgerHTML', () => {
  it('renders one plain ledger row per experience entry without shift-log extras', () => {
    const html = ledgerHTML('en');
    expect(html.startsWith('<div class="ledger">')).toBe(true);
    expect(html).not.toContain('shiftlog');
    expect(html.match(/<div class="ledger__row">/g)).toHaveLength(EXPERIENCE.length);
    for (let i = 0; i < EXPERIENCE.length; i++) {
      const entry = EXPERIENCE[i];
      expect(html).toContain(`<span class="ledger__per mono"><i>${esc(entry.period)}</i></span>`);
      expect(html).toContain(`<div class="ledger__body"><b>${esc(entry.company)}</b>`);
      expect(html).toContain(`<p>${esc(entry.points.en.join(' '))}</p>`);
    }
  });

  it('joins the localized points as a single paragraph in every locale', () => {
    for (const lang of LOCALES) {
      const html = ledgerHTML(lang);
      for (const entry of EXPERIENCE) {
        expect(html).toContain(`<p>${esc(entry.points[lang].join(' '))}</p>`);
      }
    }
  });
});

describe('shiftLogHTML', () => {
  it('renders one ledger row per experience entry', () => {
    const html = shiftLogHTML('en');
    expect(html.startsWith('<div class="ledger shiftlog">')).toBe(true);
    expect(html.match(/<div class="ledger__row">/g)).toHaveLength(EXPERIENCE.length);
    expect(html.match(/<span class="ledger__per mono"><i>/g)).toHaveLength(EXPERIENCE.length);
    expect(html.match(/<p class="shiftlog__role">/g)).toHaveLength(EXPERIENCE.length);
    expect(html.match(/<ul class="shiftlog__points">/g)).toHaveLength(EXPERIENCE.length);
    expect(html.match(/<div class="chiprow">/g)).toHaveLength(EXPERIENCE.length);
  });

  it('marks only the current entry with the ON SHIFT live dot', () => {
    const html = shiftLogHTML('en');
    const nowCount = EXPERIENCE.filter((e) => e.current).length;
    expect(html.match(/class="shiftlog__now"/g)).toHaveLength(nowCount);
    expect(html.match(/class="dot dot--live"/g)).toHaveLength(nowCount);
    expect(html).toContain(`>${esc(OPERATIONS_PAGE.onShift.en)}</span>`);
    const currents = EXPERIENCE.filter((e) => e.current);
    expect(currents).toHaveLength(1);
    for (const entry of currents) {
      expect(html).toContain(`<b>${esc(entry.company)}</b> <span class="shiftlog__now">`);
    }
  });

  it('localizes the on-shift chip and the bullet points', () => {
    for (const lang of LOCALES) {
      const html = shiftLogHTML(lang);
      expect(html).toContain(`>${esc(OPERATIONS_PAGE.onShift[lang])}</span>`);
      for (const entry of EXPERIENCE) {
        for (const point of entry.points[lang]) {
          expect(html).toContain(`<li>${esc(point)}</li>`);
        }
      }
    }
  });
});

describe('skillGridHTML', () => {
  it('renders one skillcard per skill group with all items', () => {
    for (const lang of LOCALES) {
      const html = skillGridHTML(lang);
      expect(html.match(/<div class="skillcard">/g)).toHaveLength(SKILLS.length);
      for (const group of SKILLS) {
        expect(html).toContain(`<h3>${esc(group.group[lang])}</h3>`);
        for (const item of group.items) {
          expect(html).toContain(`<li>${esc(item)}</li>`);
        }
      }
    }
  });

  it('localizes the group headings', () => {
    const en = skillGridHTML('en');
    const es = skillGridHTML('es');
    const ca = skillGridHTML('ca');
    for (const group of SKILLS) {
      expect(en).toContain(`<h3>${esc(group.group.en)}</h3>`);
      expect(es).toContain(`<h3>${esc(group.group.es)}</h3>`);
      expect(ca).toContain(`<h3>${esc(group.group.ca)}</h3>`);
    }
  });
});
