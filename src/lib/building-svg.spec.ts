import { describe, expect, it } from 'vitest';
import { esc, floorPlateLabel, roofSvg, svgEntrance, svgFloor, svgRoof } from './building-svg';
import { FLOOR_ORDER } from '../data/content';
import { LOCALES } from './i18n';

const EXPECTED_FLOOR_LABELS: Record<string, Record<string, string>> = {
  research: {
    en: 'F3 — RETRIEVAL WITH RECEIPTS — Research & Retrieval — PROJECTS',
    es: 'F3 — RECUPERACIÓN CON RECIBOS — Investigación y Recuperación — PROYECTOS',
    ca: 'F3 — RECUPERACIÓ AMB REBUTS — Recerca i Recuperació — PROJECTES',
  },
  telemetry: {
    en: 'F2 — HONEST FAILURE MODES — Transport & Telemetry — PROJECTS',
    es: 'F2 — FALLOS HONESTOS — Transporte y Telemetría — PROYECTOS',
    ca: 'F2 — FALLADES HONESTES — Transport i Telemetria — PROJECTES',
  },
  tooling: {
    en: 'F1 — DELIBERATELY SMALL TOOLS — Tooling & Platform — PROJECTS',
    es: 'F1 — HERRAMIENTAS DELIBERADAMENTE PEQUEÑAS — Herramientas y Plataforma — PROYECTOS',
    ca: 'F1 — EINES DELIBERADAMENT PETITES — Eines i Plataforma — PROJECTES',
  },
  people: {
    en: 'M — STACK · STANDARDS · RULES — People & Principles — VALUES',
    es: 'M — STACK · ESTÁNDARES · REGLAS — Personas y Principios — VALORES',
    ca: 'M — STACK · ESTÀNDARDS · REGLES — Persones i Principis — VALORS',
  },
  operations: {
    en: 'F0 — ONE LEDGER, NO REWRITES — Operations — CV WORK',
    es: 'F0 — UN HISTORIAL, SIN REESCRITURAS — Operaciones — TRAYECTORIA CV',
    ca: 'F0 — UN HISTORIAL, SENSE REESCRIPTURES — Operacions — TRAJECTÒRIA CV',
  },
  frontdesk: {
    en: 'B — WALK-INS WELCOME — Front Desk — CONTACT',
    es: 'B — ENTRADA LIBRE — Recepción — CONTACTO',
    ca: 'B — ENTRADA LLIURE — Recepció — CONTACTE',
  },
};

describe('floorPlateLabel', () => {
  it.each([...FLOOR_ORDER])('composes the plate strings for %s in every locale', (key) => {
    for (const lang of LOCALES) {
      expect(floorPlateLabel(lang, key)).toBe(EXPECTED_FLOOR_LABELS[key][lang]);
    }
  });

  it('strips the leading dash from the localized floor suffix', () => {
    expect(floorPlateLabel('en', 'research').endsWith(' PROJECTS')).toBe(true);
    expect(floorPlateLabel('en', 'research')).not.toContain(' — -');
    expect(floorPlateLabel('es', 'operations').endsWith(' TRAYECTORIA CV')).toBe(true);
  });

  it('joins the four plate strings with em dashes only', () => {
    const label = floorPlateLabel('en', 'telemetry');
    expect(label.match(/ — /g)).toHaveLength(3);
    expect(label.split(' — ')).toHaveLength(4);
  });
});

describe('esc', () => {
  it('escapes markup-significant characters', () => {
    expect(esc('Research & "Retrieval" <F3>')).toBe('Research &amp; &quot;Retrieval&quot; &lt;F3&gt;');
  });
});

describe('svgRoof', () => {
  const roof = svgRoof('en');

  it('emits the dual desktop/mobile variants', () => {
    expect(roof).toContain('class="b-svg b-svg--d" viewBox="0 0 980 126"');
    expect(roof).toContain('class="b-svg b-svg--m" viewBox="350 0 400 126"');
  });

  it('keeps one glow filter id per variant', () => {
    expect(roof).toContain('<filter id="sign-glow"');
    expect(roof).toContain('<filter id="sign-glow-m"');
    expect(roof).toContain('filter="url(#sign-glow)"');
    expect(roof).toContain('filter="url(#sign-glow-m)"');
  });

  it('keeps the six animated stars and three mobile stars', () => {
    const desktop = roof.split('b-svg--m')[0];
    expect(desktop.match(/class="star"/g)).toHaveLength(6);
    expect(desktop).toContain('style="--d:1500ms"');
    const mobile = roof.split('b-svg--m')[1];
    expect(mobile.match(/class="star"/g)).toHaveLength(9);
    expect(mobile).toContain('style="--d:400ms"');
  });

  it('labels the sign for screen readers', () => {
    expect(roof).toContain('aria-label="JORDIMP &amp; CO. — Barcelona"');
    expect(roof).toContain('EST. 2017 · WALK-INS WELCOME');
  });

  it('renders the blue flag for en on both variants', () => {
    expect(roof.match(/fill="#2f5aa8"/g)).toHaveLength(2);
    expect(roof).not.toContain('#da121a');
  });

  it('renders the solid yellow flag for es on both variants', () => {
    const es = svgRoof('es');
    expect(es.match(/fill="#fcdd09"/g)).toHaveLength(2);
    expect(es).not.toContain('#da121a');
  });

  it('renders the senyera flag for ca on both variants', () => {
    const ca = svgRoof('ca');
    expect(ca.match(/fill="#da121a"/g)).toHaveLength(8);
    expect(ca).toContain('DES DE 2017 · ENTRADA LLIURE');
  });

  it('localizes the sign sub line', () => {
    expect(svgRoof('es')).toContain('DESDE 2017 · ENTRADA LIBRE');
  });
});

describe('svgFloor', () => {
  it('emits the dual desktop/mobile variants per floor', () => {
    const floor = svgFloor('en', 'research');
    expect(floor).toContain('class="b-svg b-svg--d" viewBox="0 0 980 100"');
    expect(floor).toContain('class="b-svg b-svg--m" viewBox="86 0 448 100"');
  });

  it('keeps the plate hover structure and visible code chip', () => {
    const floor = svgFloor('en', 'research');
    expect(floor).toContain('<g class="b-plategroup">');
    expect(floor).toContain('class="b-plate b-floorplate"');
    expect(floor).toContain('<g class="b-iconwrap">');
    expect(floor).toContain('class="b-plate-code" x="156" y="43" text-anchor="middle" fill="#0c0b0a"');
  });

  it('carries the i18n plate suffix', () => {
    expect(svgFloor('en', 'research')).toContain('<tspan class="b-plate-suffix"> - PROJECTS</tspan>');
    expect(svgFloor('es', 'operations')).toContain('<tspan class="b-plate-suffix"> - TRAYECTORIA CV</tspan>');
    expect(svgFloor('ca', 'frontdesk')).toContain('<tspan class="b-plate-suffix"> - CONTACTE</tspan>');
  });

  it('escapes and uppercases the department name on the plate', () => {
    expect(svgFloor('en', 'research')).toContain('>RESEARCH &AMP; RETRIEVAL<tspan');
  });

  it('renders the department glyph and three staggered windows', () => {
    const floor = svgFloor('en', 'tooling');
    expect(floor).toContain('d="M568 46l20 20"');
    expect(floor.match(/class="win"/g)).toHaveLength(6);
    expect(floor).toContain('style="--d:60ms"');
  });

  it('inverts the plate for the dark operations floor', () => {
    const floor = svgFloor('en', 'operations');
    expect(floor).toContain('class="b-wall b-floorplate"');
    expect(floor).toContain('class="b-plate-name--dark"');
    expect(floor).toContain('class="b-plate-tag--dark"');
    expect(floor).toContain('class="b-wall-dark"');
  });

  it('keeps the regular plate for non-operations floors', () => {
    const floor = svgFloor('en', 'people');
    expect(floor).toContain('class="b-plate b-floorplate"');
    expect(floor).toContain('class="b-plate-name"');
    expect(floor).not.toContain('b-plate-name--dark');
  });
});

describe('svgEntrance', () => {
  it('emits the dual desktop/mobile variants with full door', () => {
    const entrance = svgEntrance('en');
    expect(entrance).toContain('class="b-svg b-svg--d" viewBox="0 0 980 148"');
    expect(entrance).toContain('class="b-svg b-svg--m" viewBox="86 0 468 148"');
  });

  it('plates the front desk name', () => {
    expect(svgEntrance('es')).toContain('>RECEPCIÓN</text>');
    expect(svgEntrance('en')).toContain('class="b-plate-sub"');
  });
});

describe('roofSvg', () => {
  it('accepts custom extra stars', () => {
    const roof = roofSvg('en', '0 0 100 100', 'b-svg--x', 'fid', [[10, 20, 500]]);
    expect(roof).toContain('viewBox="0 0 100 100"');
    expect(roof).toContain('style="--d:500ms"');
  });
});
