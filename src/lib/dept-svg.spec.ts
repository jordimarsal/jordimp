import { describe, expect, it } from 'vitest';
import { coverageMap, orgChart, telemetryDiagrams } from './dept-svg';
import { PEOPLE_PAGE, TELEMETRY_PAGE } from '../data/content';
import { LOCALES } from './i18n';
import { esc } from './building-svg';

describe('telemetryDiagrams', () => {
  it('emits the diagram strip with two captioned figures per locale', () => {
    for (const lang of LOCALES) {
      const html = telemetryDiagrams(lang);
      expect(html).toContain('<div class="diagram-strip">');
      expect(html.match(/<figure class="diagram">/g)).toHaveLength(2);
      expect(html.match(/<figcaption>/g)).toHaveLength(2);
      expect(html).toContain(`>${esc(TELEMETRY_PAGE.kafkaCaption[lang])}</figcaption>`);
      expect(html).toContain(`>${esc(TELEMETRY_PAGE.redisCaption[lang])}</figcaption>`);
    }
  });

  it('emits the kafka and redis diagrams with their oracle viewBoxes', () => {
    const html = telemetryDiagrams('en');
    expect(html).toContain('<svg class="b-svg" viewBox="0 0 560 170" aria-hidden="true">');
    expect(html).toContain('<svg class="b-svg" viewBox="0 0 340 170" aria-hidden="true">');
    expect(html).toContain('>KAFKA</text>');
    expect(html).toContain('>REDIS</text>');
    expect(html).toContain('<polygon class="dg-accent" points="152,26 244,26 234,96 162,96"/>');
    expect(html).toContain('<rect class="dg-token" x="174" y="38" width="14" height="10"/>');
  });

  it('carries the flow-box and arrow vocabulary of the diagram grammar', () => {
    const html = telemetryDiagrams('en');
    expect(html.match(/class="dg-box"/g)).toHaveLength(9);
    expect(html.match(/class="dg-accent"/g)).toHaveLength(2);
    expect(html.match(/class="dg-line"/g)).toHaveLength(10);
    expect(html.match(/class="dg-line dg-line--dash"/g)).toHaveLength(2);
    expect(html.match(/class="dg-head"/g)).toHaveLength(9);
    expect(html.match(/class="dg-txt dg-txt--sm"/g)).toHaveLength(7);
  });
});

describe('coverageMap', () => {
  it('emits the open-gateway board with one filled ES port and three empty ports', () => {
    const html = coverageMap();
    expect(html).toContain('<svg class="b-svg" viewBox="0 0 980 120" aria-hidden="true">');
    expect(html).toContain('<rect class="b-wall" x="16" y="8" width="948" height="104"/>');
    expect(html).toContain('>OPEN GATEWAY</text>');
    expect(html.match(/<circle class="dg-accent" cx="\d+" cy="76" r="15"\/>/g)).toHaveLength(1);
    expect(html).toContain('>ES</text>');
    expect(html.match(/<circle class="dg-box" cx="\d+" cy="76" r="15"\/>/g)).toHaveLength(3);
    expect(html.match(/<circle class="dg-token" cx="\d+" cy="76" r="3.5"\/>/g)).toHaveLength(3);
    expect(html).toContain('~90 ADAPTERS REPORTING');
    expect(html).toContain('4 COUNTRIES ON THE BOARD');
    expect(html).toContain('<polygon class="dg-head" points="458,76 451.0,80.0 451.0,72.0"/>');
  });
});

describe('orgChart', () => {
  it('emits the flat org chart with the four localized role boxes', () => {
    for (const lang of LOCALES) {
      const html = orgChart(lang);
      expect(html).toContain('<svg class="b-svg" viewBox="0 0 980 210" aria-hidden="true">');
      expect(html.match(/<rect class="dg-box" x="\d+" y="10" width="180" height="32"\/>/g)).toHaveLength(4);
      for (const role of PEOPLE_PAGE.orgRoles[lang]) {
        expect(html).toContain(`>${esc(role)}</text>`);
      }
    }
  });

  it('anchors the tree on the JORDI plate', () => {
    const html = orgChart('en');
    expect(html).toContain('<rect class="b-plate" x="522" y="124" width="76" height="20"/>');
    expect(html).toContain('>JORDI</text>');
    expect(html).toContain('<circle class="dg-accent" cx="490" cy="106" r="12"/>');
  });
});

