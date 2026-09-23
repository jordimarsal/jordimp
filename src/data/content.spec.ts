import { describe, expect, it } from 'vitest';
import {
  ARTICLE,
  CASE_BUILD,
  CASE_NOTES,
  DEPTS,
  EXPERIENCE,
  FEATURED,
  FLOOR_LABELS,
  FLOOR_ORDER,
  FOOTER,
  FRONTDESK_PAGE,
  HOME,
  INSPECTIONS_PAGE,
  LOCALES,
  OPERATIONS_PAGE,
  PAGES,
  PEOPLE_PAGE,
  PROJECTS,
  RESEARCH_PAGE,
  SITE,
  SKILLS,
  TICKER,
  TIER_LABELS,
  TIER_ORDER,
  TOOLING_PAGE,
  UI,
  WORK,
  project,
  tierProjects,
} from './content';
import { SITE as CONFIG_SITE } from '../config';
import type { Tier } from './types';

const PROJECT_COUNT = 11;
const FEATURED_COUNT = 3;
const DEPT_COUNT = 7;
const EXPERIENCE_COUNT = 4;

describe('projects data', () => {
  it('ships exactly 11 projects with unique slugs', () => {
    expect(PROJECTS).toHaveLength(PROJECT_COUNT);
    expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(PROJECT_COUNT);
  });

  it('gives every project trilingual blurb, summary, problem, highlights and metrics', () => {
    for (const p of PROJECTS) {
      for (const lang of LOCALES) {
        expect(p.blurb[lang].trim(), `${p.slug}:blurb.${lang}`).not.toBe('');
        expect(p.summary[lang].trim(), `${p.slug}:summary.${lang}`).not.toBe('');
        expect(p.problem[lang].trim(), `${p.slug}:problem.${lang}`).not.toBe('');
        expect(p.highlights[lang].length, `${p.slug}:highlights.${lang}`).toBeGreaterThan(0);
      }
      expect(p.stack.length, p.slug).toBeGreaterThan(0);
      expect(Array.isArray(p.metrics), `${p.slug}:metrics`).toBe(true);
      for (const metric of p.metrics) {
        expect(metric.value.trim(), `${p.slug}:metric.value`).not.toBe('');
        for (const lang of LOCALES) {
          expect(metric.label[lang].trim(), `${p.slug}:metric.label.${lang}`).not.toBe('');
        }
      }
    }
  });

  it('keeps every project inside a known department', () => {
    for (const p of PROJECTS) {
      expect(FLOOR_ORDER, p.slug).toContain(p.dept);
    }
  });
});

describe('departments data', () => {
  it('exposes exactly the seven floor keys in the fixed floor order', () => {
    expect(FLOOR_ORDER).toHaveLength(DEPT_COUNT);
    expect(Object.keys(DEPTS).sort()).toEqual([...FLOOR_ORDER].sort());
  });

  it('pins the fixed floor order itself, inspections between tooling and people', () => {
    expect([...FLOOR_ORDER]).toEqual([
      'research',
      'telemetry',
      'tooling',
      'inspections',
      'people',
      'operations',
      'frontdesk',
    ]);
  });

  it('resolves every department project to a real project of that floor', () => {
    for (const key of FLOOR_ORDER) {
      for (const slug of DEPTS[key].projects) {
        expect(project(slug).dept, slug).toBe(key);
      }
    }
  });

  it('curates the three card floors to their strong pieces', () => {
    expect(DEPTS.research.projects).toEqual(['codebaserag', 'interview-simulator']);
    expect(DEPTS.telemetry.projects).toEqual(['kafka-adapter-telemetry', 'redis-toolkit']);
    expect(DEPTS.tooling.projects).toEqual(['harness-standard', 'md-mermaid-pdf', 'mcp-transparent-png']);
  });

  it('covers all seven departments in FLOOR_LABELS with trilingual labels', () => {
    expect(Object.keys(FLOOR_LABELS).sort()).toEqual([...FLOOR_ORDER].sort());
    for (const key of FLOOR_ORDER) {
      for (const lang of LOCALES) {
        expect(FLOOR_LABELS[key][lang].trim(), `${key}:${lang}`).not.toBe('');
      }
    }
  });
});

describe('inspections department data (F10)', () => {
  it('registers the Q floor with the seal icon, no projects and its own page', () => {
    const d = DEPTS.inspections;
    expect(d.code).toBe('Q');
    expect(d.icon).toBe('seal');
    expect(d.projects).toEqual([]);
    expect(d.page).toBe('inspections');
  });

  it('gives the inspections floor trilingual tag, name, line and intro', () => {
    const d = DEPTS.inspections;
    for (const lang of LOCALES) {
      expect(d.tag[lang].trim(), `inspections:tag.${lang}`).not.toBe('');
      expect(d.name[lang].trim(), `inspections:name.${lang}`).not.toBe('');
      expect(d.line[lang].trim(), `inspections:line.${lang}`).not.toBe('');
      expect(d.intro[lang].trim(), `inspections:intro.${lang}`).not.toBe('');
    }
    expect(d.name.en).toBe('Inspections');
    expect(d.name.es).toBe('Inspección');
    expect(d.name.ca).toBe('Inspecció');
  });

  it('labels the inspections floor plate with the audits suffix in three locales', () => {
    expect(FLOOR_LABELS.inspections).toEqual({
      en: '- AUDITS',
      es: '- AUDITORÍAS',
      ca: '- AUDITORIES',
    });
  });
});

describe('inspections page copy (F10)', () => {
  const L10N_KEYS = [
    'plaqueTitle',
    'verdictPass',
    'verdictFail',
    'noAudit',
    'gaugesTitle',
    'historyTitle',
    'historyNote',
    'countersTitle',
  ] as const;

  it('localizes every plaque, gauge and state string in en, es and ca', () => {
    for (const key of L10N_KEYS) {
      for (const lang of LOCALES) {
        expect(INSPECTIONS_PAGE[key][lang].trim(), `${key}.${lang}`).not.toBe('');
      }
    }
    expect(INSPECTIONS_PAGE.kbUnit.trim()).not.toBe('');
  });

  it('names the four Lighthouse categories in every locale', () => {
    for (const lang of LOCALES) {
      expect(INSPECTIONS_PAGE.categories[lang]).toHaveLength(4);
      for (const cat of INSPECTIONS_PAGE.categories[lang]) {
        expect(cat.trim(), `categories.${lang}`).not.toBe('');
      }
    }
  });

  it('localizes all counter labels in en, es and ca', () => {
    for (const [key, label] of Object.entries(INSPECTIONS_PAGE.labels)) {
      for (const lang of LOCALES) {
        expect(label[lang].trim(), `labels.${key}.${lang}`).not.toBe('');
      }
    }
  });

  it('registers the inspections page with route and trilingual title and description', () => {
    expect(PAGES.inspections.route).toBe('departments/inspections.html');
    for (const lang of LOCALES) {
      expect(PAGES.inspections.title[lang].trim(), `pages.inspections.title.${lang}`).not.toBe('');
      expect(PAGES.inspections.description[lang].trim(), `pages.inspections.description.${lang}`).not.toBe('');
    }
  });
});

describe('home positioning (F11)', () => {
  it('repositions the home kicker (R1)', () => {
    expect(HOME.kicker).toEqual({
      en: 'SENIOR BACKEND ENGINEER — SYSTEMS YOU CAN AUDIT',
      es: 'INGENIERO BACKEND SENIOR — SISTEMAS QUE SE PUEDEN AUDITAR',
      ca: 'ENGINYER BACKEND SÈNIOR — SISTEMES QUE ES PODEN AUDITAR',
    });
  });

  it('repositions the home h1 keeping exactly one highlight mark (R2)', () => {
    expect(HOME.h1).toEqual({
      en: 'One company. One engineer. <mark>Specs before code.</mark>',
      es: 'Una empresa. Un ingeniero. <mark>Specs antes que código.</mark>',
      ca: 'Una empresa. Un enginyer. <mark>Specs abans de codi.</mark>',
    });
    for (const lang of LOCALES) {
      expect(HOME.h1[lang].match(/<mark>/g), lang).toHaveLength(1);
    }
  });

  it('repositions the home standfirst keeping the est. mark (R3)', () => {
    expect(HOME.stand).toEqual({
      en: 'Jordimp & Co. is the working name of one engineer: backend systems, event pipelines and applied AI, designed, built and audited by the same pair of hands since <b>2017</b>. Currently inside a telco platform team. Walk-ins: roles, repos, or a short spec-first engagement.',
      es: 'Jordimp & Co. es el nombre de trabajo de un solo ingeniero: sistemas backend, pipelines de eventos e IA aplicada, diseñados, construidos y auditados por el mismo par de manos desde <b>2017</b>. Ahora, dentro de un equipo de plataforma telco. Entrada libre: roles, repos o un encargo corto con spec primero.',
      ca: 'Jordimp & Co. és el nom de feina d’un sol enginyer: sistemes backend, pipelines d’esdeveniments i IA aplicada, dissenyats, construïts i auditats pel mateix parell de mans des del <b>2017</b>. Ara, dins d’un equip de plataforma telco. Entrada lliure: rols, repos, o un encàrrec curt amb spec primer.',
    });
    for (const lang of LOCALES) {
      expect(HOME.stand[lang], lang).toContain('<b>2017</b>');
    }
  });
});

describe('front-desk positioning (F11)', () => {
  it('defines the offer block with the exact English copy in three locales (R4)', () => {
    expect(FRONTDESK_PAGE.offer.openTitle.en).toBe('Open for');
    expect(FRONTDESK_PAGE.offer.openItems.en).toEqual([
      'Senior / staff backend roles — platform, events, or applied AI with measurable retrieval.',
      'Short spec-first engagements (4–8 weeks). If it can’t be written down, it doesn’t start.',
      'Questions about a floor or a repo. No tracking, no funnel.',
    ]);
    expect(FRONTDESK_PAGE.offer.notOpenTitle.en).toBe('Not open for');
    expect(FRONTDESK_PAGE.offer.notOpenItems.en).toEqual([
      'Vibe-coded MVPs, “add ChatGPT to our app”, or unbounded retainers.',
    ]);
    expect(FRONTDESK_PAGE.offer.firmLine.en).toBe(
      'Jordimp & Co. is how the work is done — currently inside a telco platform team, not a staffing firm.',
    );
    expect(FRONTDESK_PAGE.offer.howLine.en).toBe(
      'How it works — 01 Brief · 02 Spec · 03 Build (tests first) · 04 Audit.',
    );
    expect(FRONTDESK_PAGE.offer.deskLine.en).toBe('Desk attended in English, Español or Català.');

    for (const lang of LOCALES) {
      expect(FRONTDESK_PAGE.offer.openTitle[lang].trim(), lang).not.toBe('');
      expect(FRONTDESK_PAGE.offer.notOpenTitle[lang].trim(), lang).not.toBe('');
      expect(FRONTDESK_PAGE.offer.firmLine[lang].trim(), lang).not.toBe('');
      expect(FRONTDESK_PAGE.offer.howLine[lang].trim(), lang).not.toBe('');
      expect(FRONTDESK_PAGE.offer.deskLine[lang].trim(), lang).not.toBe('');
      expect(FRONTDESK_PAGE.offer.openItems[lang]).toHaveLength(3);
      expect(FRONTDESK_PAGE.offer.notOpenItems[lang]).toHaveLength(1);
      for (const item of [
        ...FRONTDESK_PAGE.offer.openItems[lang],
        ...FRONTDESK_PAGE.offer.notOpenItems[lang],
      ]) {
        expect(item.trim(), lang).not.toBe('');
      }
    }
  });

  it('sets the hall CTA tagline in three locales (R5)', () => {
    expect(FRONTDESK_PAGE.cta).toEqual({
      en: 'WALK-INS WELCOME — ROLE, REPO OR A SPEC-FIRST ENGAGEMENT.',
      es: 'ENTRADA LIBRE — ROL, REPO O ENCARGO CON SPEC.',
      ca: 'ENTRADA LLIURE — ROL, REPO O ENCÀRREC AMB SPEC.',
    });
  });

  it('repoints the front-desk floor line and intro at the offer (R6, R7)', () => {
    expect(DEPTS.frontdesk.line).toEqual({
      en: 'WALK-INS WELCOME — ROLES, REPOS OR A SPEC-FIRST ENGAGEMENT.',
      es: 'ENTRADA LIBRE — ROLES, REPOS O UN ENCARGO CON SPEC PRIMERO.',
      ca: 'ENTRADA LLIURE — ROLS, REPOS O UN ENCÀRREC AMB SPEC PRIMER.',
    });
    expect(DEPTS.frontdesk.intro).toEqual({
      en: 'The desk takes three things: senior or staff backend roles, short spec-first engagements, and questions about a floor or a repo. Bring the problem in your own words — if it can’t be written down, it doesn’t start.',
      es: 'El mostrador acepta tres cosas: roles backend senior o staff, encargos cortos con spec primero y preguntas sobre una planta o un repo. Trae el problema con tus palabras — si no se puede escribir, no se empieza.',
      ca: 'El mostrador accepta tres coses: rols backend sènior o staff, encàrrecs curts amb spec primer i preguntes sobre una planta o un repo. Porta el problema amb les teves paraules — si no es pot escriure, no comença.',
    });
  });

  it('aligns the footer line and page descriptions with the positioning (R8, R9, R10)', () => {
    expect(FOOTER.line).toEqual({
      en: 'Jordimp & Co. is the working name of one engineer — currently inside a telco platform team. Walk-ins: roles, repos, or a short spec-first engagement.',
      es: 'Jordimp & Co. es el nombre de trabajo de un solo ingeniero — ahora dentro de un equipo de plataforma telco. Entrada libre: roles, repos o un encargo corto con spec primero.',
      ca: 'Jordimp & Co. és el nom de feina d’un sol enginyer — ara dins d’un equip de plataforma telco. Entrada lliure: rols, repos o un encàrrec curt amb spec primer.',
    });
    expect(PAGES.home.description).toEqual({
      en: 'Jordimp & Co. is the working name of one engineer: backend systems, event pipelines and applied AI, designed, built and audited by the same pair of hands since 2017. Currently inside a telco platform team. Walk-ins: roles, repos, or a short spec-first engagement.',
      es: 'Jordimp & Co. es el nombre de trabajo de un solo ingeniero: sistemas backend, pipelines de eventos e IA aplicada, diseñados, construidos y auditados por el mismo par de manos desde 2017. Ahora, dentro de un equipo de plataforma telco. Entrada libre: roles, repos o un encargo corto con spec primero.',
      ca: 'Jordimp & Co. és el nom de feina d’un sol enginyer: sistemes backend, pipelines d’esdeveniments i IA aplicada, dissenyats, construïts i auditats pel mateix parell de mans des del 2017. Ara, dins d’un equip de plataforma telco. Entrada lliure: rols, repos o un encàrrec curt amb spec primer.',
    });
    expect(PAGES.frontdesk.description).toEqual({
      en: 'Walk-ins welcome: senior or staff backend roles, short spec-first engagements, and questions about a floor or a repo — no tracking, no funnel. Jordimp & Co. is how the work is done, not a staffing firm.',
      es: 'Entrada libre: roles backend senior o staff, encargos cortos con spec primero y preguntas sobre una planta o un repo — sin tracking, sin funnel. Jordimp & Co. es como se hace el trabajo, no una consultora de personal.',
      ca: 'Entrada lliure: rols backend sènior o staff, encàrrecs curts amb spec primer i preguntes sobre una planta o un repo — sense tracking, sense funnel. Jordimp & Co. és com es fa la feina, no una consultora de personal.',
    });
    for (const lang of LOCALES) {
      expect(PAGES.home.description[lang], lang).not.toMatch(/[<>]/);
      expect(PAGES.frontdesk.description[lang], lang).not.toMatch(/[<>]/);
    }
  });

  it('adds the Open Gateway conflict-of-interest line to F2 (R11)', () => {
    const coi = {
      en: 'Personal study of the Open Gateway telemetry problem. Not Telefónica code. Not production traffic.',
      es: 'Estudio personal del problema de telemetría de Open Gateway. No es código de Telefónica. No es tráfico de producción.',
      ca: 'Estudi personal del problema de telemetria d’Open Gateway. No és codi de Telefónica. No és trànsit de producció.',
    } as const;
    for (const lang of LOCALES) {
      expect(DEPTS.telemetry.intro[lang].endsWith(coi[lang]), lang).toBe(true);
    }
  });

  it('keeps the four how-it-works steps verbatim (R12)', () => {
    const expected = {
      en: [
        { k: '01 — BRIEF', v: 'You bring the problem, in your own words.' },
        { k: '02 — SPEC', v: 'We pin it down in writing, before any code.' },
        { k: '03 — BUILD', v: 'Tests first, I/O at the edges, demos as it grows.' },
        { k: '04 — AUDIT', v: 'You get answers you can check, not vibes you can hope for.' },
      ],
      es: [
        { k: '01 — BRIEF', v: 'Traes el problema, con tus palabras.' },
        { k: '02 — SPEC', v: 'Lo fijamos por escrito, antes de cualquier código.' },
        { k: '03 — BUILD', v: 'Tests primero, I/O en los bordes, demos mientras crece.' },
        { k: '04 — AUDIT', v: 'Recibes respuestas que puedes verificar, no promesas que tienes que creer.' },
      ],
      ca: [
        { k: '01 — BRIEF', v: 'Portes el problema, amb les teves paraules.' },
        { k: '02 — SPEC', v: 'El fixem per escrit, abans de qualsevol codi.' },
        { k: '03 — BUILD', v: 'Proves primer, I/O a les vores, demos mentre creix.' },
        { k: '04 — AUDIT', v: 'Reps respostes que pots verificar, no promeses que has de creure.' },
      ],
    } as const;
    for (const lang of LOCALES) {
      expect(FRONTDESK_PAGE.how[lang], lang).toEqual(expected[lang]);
    }
  });

  it('keeps the contact email unchanged in content and config (R13)', () => {
    expect(SITE.email).toBe('jordi.marsal@gmail.com');
    expect(CONFIG_SITE.email).toBe(SITE.email);
    expect(CONFIG_SITE.email).toBe('jordi.marsal@gmail.com');
  });
});

describe('featured data', () => {
  it('features exactly 3 valid slugs', () => {
    expect(FEATURED).toHaveLength(FEATURED_COUNT);
    expect(new Set(FEATURED).size).toBe(FEATURED_COUNT);
    for (const slug of FEATURED) {
      expect(PROJECTS.map((p) => p.slug), slug).toContain(slug);
    }
  });
});

const TIER_MAP: Record<string, Tier> = {
  codebaserag: 'thesis', 'kafka-adapter-telemetry': 'thesis', 'harness-standard': 'thesis',
  'redis-toolkit': 'satellite', 'interview-simulator': 'satellite',
  'md-mermaid-pdf': 'satellite', 'mcp-transparent-png': 'satellite',
  'bible-text-analysis': 'annex', 'product-offers': 'annex',
  'spring-boot-casino': 'annex', rustcut: 'annex',
};

describe('project tiers', () => {
  it('assigns exactly the R3 tier map', () => {
    expect(Object.fromEntries(PROJECTS.map((p) => [p.slug, p.tier]))).toEqual(TIER_MAP);
  });

  it('keeps the thesis tier equal to FEATURED', () => {
    expect(tierProjects('thesis').map((p) => p.slug)).toEqual([...FEATURED]);
  });

  it('partitions the 11 projects 3 / 4 / 4 in tier order', () => {
    expect(TIER_ORDER).toEqual(['thesis', 'satellite', 'annex']);
    expect(TIER_ORDER.map((t) => tierProjects(t).length)).toEqual([3, 4, 4]);
    expect(TIER_LABELS).toEqual({
      thesis: { en: 'Thesis', es: 'Tesis', ca: 'Tesi' },
      satellite: { en: 'Satellites', es: 'Satélites', ca: 'Satèl·lits' },
      annex: {
        en: 'Annex — roots, assessments & size exercises',
        es: 'Anexo — raíces, pruebas y ejercicios de tamaño',
        ca: 'Annex — arrels, proves i exercicis de mida',
      },
    });
  });
});

describe('pages data', () => {
  it('registers home, work, cv, the 7 departments, the 11 project pages and the essay', () => {
    const expected = [
      'home',
      'work',
      'cv',
      'article-rag-eval-gate',
      ...FLOOR_ORDER,
      ...PROJECTS.map((p) => `project-${p.slug}`),
    ];
    expect(Object.keys(PAGES).sort()).toEqual(expected.sort());
  });

  it('gives every page a route and trilingual title and description', () => {
    for (const [key, page] of Object.entries(PAGES)) {
      expect(page.route.trim(), key).not.toBe('');
      for (const lang of LOCALES) {
        expect(page.title[lang].trim(), `${key}:title.${lang}`).not.toBe('');
        expect(page.description[lang].trim(), `${key}:description.${lang}`).not.toBe('');
      }
    }
  });
});

describe('cv and experience data', () => {
  it('keeps exactly 4 experience entries', () => {
    expect(EXPERIENCE).toHaveLength(EXPERIENCE_COUNT);
  });

  it('keeps five thesis skill piles and drops the toolbelt technology', () => {
    expect(SKILLS.map((g) => g.group.en)).toEqual(['Backend', 'Data', 'AI', 'Quality', 'Leadership']);
    expect(SKILLS.map((g) => g.group.es)).toEqual(['Backend', 'Datos', 'IA', 'Calidad', 'Liderazgo']);
    expect(SKILLS.map((g) => g.group.ca)).toEqual(['Backend', 'Dades', 'IA', 'Qualitat', 'Lideratge']);
    expect(SKILLS.map((g) => [...g.items])).toEqual([
      ['Java 21/25', 'Spring Boot', 'Python 3.13', 'FastAPI', 'Kafka'],
      ['Oracle', 'Redis', 'pgvector'],
      ['RAG + evals in CI', 'MCP', 'Ollama / llama.cpp'],
      ['Testcontainers', 'GitHub Actions', 'mypy strict', 'TDD'],
      ['team coordination', 'code review culture', 'mentoring', 'conflict resolution'],
    ]);
    const flat = SKILLS.flatMap((g) => g.items).join(' ');
    for (const tool of ['Kubernetes', 'CDK', 'Cassandra', 'Snowflake', 'RabbitMQ', 'pandas']) {
      expect(flat).not.toContain(tool);
    }
  });

  it('adds exactly one outcome line to the three non-Telefónica jobs', () => {
    const byCompany = Object.fromEntries(EXPERIENCE.map((e) => [e.company, e]));
    const lengths: Record<string, number> = {
      'Telefónica Kernel · Open Gateway': 3,
      'Axpe Consulting / Mapfre': 3,
      'Zitro Laboratory': 3,
      'Attendre S.L.': 2,
    };
    for (const [company, count] of Object.entries(lengths)) {
      for (const lang of LOCALES) {
        expect(byCompany[company].points[lang], `${company}:${lang}`).toHaveLength(count);
      }
    }
  });
});

describe('shared strings', () => {
  it('localizes ticker, ui and footer strings in en, es and ca', () => {
    for (const lang of LOCALES) {
      expect(TICKER[lang].length, `ticker.${lang}`).toBeGreaterThan(0);
      expect(UI.skip[lang].trim(), `ui.skip.${lang}`).not.toBe('');
      expect(FOOTER.headline[lang].trim(), `footer.headline.${lang}`).not.toBe('');
    }
  });
});

describe('case extras', () => {
  it('keys build logs and field notes to real project slugs', () => {
    const slugs = PROJECTS.map((p) => p.slug);
    for (const slug of Object.keys(CASE_BUILD)) {
      expect(slugs, `CASE_BUILD.${slug}`).toContain(slug);
    }
    for (const slug of Object.keys(CASE_NOTES)) {
      expect(slugs, `CASE_NOTES.${slug}`).toContain(slug);
    }
  });
});

describe('project()', () => {
  it('returns the matching project by slug', () => {
    expect(project('codebaserag').name).toBe('CodebaseRAG');
  });

  it('throws on unknown slug', () => {
    expect(() => project('nope')).toThrow('unknown project: nope');
  });
});

describe('operations notes (F0)', () => {
  it('localizes the roots and toolbelt notes', () => {
    for (const key of ['rootsTitle', 'rootsNote', 'toolbeltTitle', 'toolbeltNote'] as const) {
      for (const lang of LOCALES) expect(OPERATIONS_PAGE[key][lang].trim(), `${key}.${lang}`).not.toBe('');
    }
  });

  it('names the displaced technology in the toolbelt note', () => {
    for (const tool of ['Kubernetes', 'CDK/CloudFormation', 'Cassandra', 'Snowflake', 'RabbitMQ', 'pandas']) {
      expect(OPERATIONS_PAGE.toolbeltNote.en).toContain(tool);
    }
  });
});

describe('curated floor copy', () => {
  it('reports 2 research projects and 3 tooling projects', () => {
    for (const lang of LOCALES) {
      expect(RESEARCH_PAGE.stats[lang], lang).toHaveLength(3);
      expect(TOOLING_PAGE.stats[lang], lang).toHaveLength(3);
    }
    const statsText = LOCALES.map((lang) => JSON.stringify(TOOLING_PAGE.stats[lang])).join(' ');
    expect(statsText).not.toMatch(/\b(?:assessment|prueba|proves)\b/i);
    expect(RESEARCH_PAGE.stats.en[0]).toEqual({ value: '2', label: 'PROJECTS ON THIS FLOOR' });
    expect(TOOLING_PAGE.stats.en[0]).toEqual({ value: '3', label: 'PROJECTS ON THIS FLOOR' });
  });

  it('names exactly the floor projects in each department description', () => {
    const expected: Record<
      'research' | 'telemetry' | 'tooling',
      { positive: string[]; negative: string[] }
    > = {
      research: {
        positive: ['CodebaseRAG', 'Interview Simulator'],
        negative: ['Bible Text Analysis'],
      },
      telemetry: {
        positive: ['kafka-adapter-telemetry', 'redis-toolkit'],
        negative: ['Product Offers API'],
      },
      tooling: {
        positive: ['harness-standard', 'md-mermaid-pdf', 'mcp-transparent-png'],
        negative: ['Rustcut', 'Spring Boot Casino'],
      },
    };
    for (const [key, { positive, negative }] of Object.entries(expected)) {
      for (const lang of LOCALES) {
        for (const name of positive) expect(PAGES[key].description[lang]).toContain(name);
        for (const name of negative) expect(PAGES[key].description[lang]).not.toContain(name);
      }
    }
  });

  it('states 11 projects and the three tiers', () => {
    const eleven: Record<(typeof LOCALES)[number], string> = { en: 'Eleven', es: 'Once', ca: 'Onze' };
    for (const lang of LOCALES) {
      expect(WORK.head.sub[lang]).toContain('11');
      expect(WORK.intro[lang]).toContain(eleven[lang]);
    }
  });
});

describe('people page org roles (R23)', () => {
  it('pins the org gag roles in three locales', () => {
    expect(PEOPLE_PAGE.orgRoles).toEqual({
      en: ['CEO', 'ENGINEER', 'QA', 'SUPPORT'],
      es: ['CEO', 'INGENIERO', 'QA', 'SOPORTE'],
      ca: ['CEO', 'ENGINYER', 'QA', 'SUPORT'],
    });
  });
});

describe('article data (rag-eval-article)', () => {
  const EN_TITLE = 'RAG without an eval gate is a demo.';
  const ANCHORS = ['problem', 'golden-set', 'ci-gate', 'hexagonal', 'baseline'];

  it('pins the exact English title and localized title/description/lead', () => {
    expect(ARTICLE.title.en).toBe(EN_TITLE);
    expect(ARTICLE.sections).toHaveLength(5);
    for (const lang of LOCALES) {
      expect(ARTICLE.title[lang].trim(), `title.${lang}`).not.toBe('');
      expect(ARTICLE.description[lang].trim(), `description.${lang}`).not.toBe('');
      expect(ARTICLE.lead[lang].trim(), `lead.${lang}`).not.toBe('');
      expect(ARTICLE.dateLabel[lang].trim(), `dateLabel.${lang}`).not.toBe('');
      expect(ARTICLE.readLabel[lang].trim(), `readLabel.${lang}`).not.toBe('');
      expect(ARTICLE.relatedBody[lang].trim(), `relatedBody.${lang}`).not.toBe('');
    }
  });

  it('defines exactly the five sections in the fixed order with trilingual copy', () => {
    expect(ARTICLE.sections.map((section) => section.anchor)).toEqual(ANCHORS);
    for (const section of ARTICLE.sections) {
      for (const lang of LOCALES) {
        expect(section.heading[lang].trim(), `${section.anchor}:heading.${lang}`).not.toBe('');
        expect(section.body[lang].length, `${section.anchor}:body.${lang}`).toBeGreaterThan(0);
        for (const paragraph of section.body[lang]) {
          expect(paragraph.trim(), `${section.anchor}:body.${lang}`).not.toBe('');
        }
      }
    }
  });

  it('keeps the English body between 800 and 1200 words', () => {
    const words = [ARTICLE.lead.en, ...ARTICLE.sections.flatMap((section) => section.body.en)]
      .join(' ')
      .split(/\s+/)
      .filter(Boolean);
    expect(words.length).toBeGreaterThanOrEqual(800);
    expect(words.length).toBeLessThanOrEqual(1200);
  });

  it('carries the committed floor facts and frames 0.409 honestly', () => {
    const en = [ARTICLE.lead.en, ...ARTICLE.sections.flatMap((section) => section.body.en)].join('\n');
    expect(en).toContain('0.409');
    expect(en).toContain('not SOTA');
    expect(en).toContain('≥40');
  });

  it('registers the essay route in PAGES under the departments nav', () => {
    expect(PAGES['article-rag-eval-gate'].route).toBe('writing/rag-eval-gate.html');
    expect(PAGES['article-rag-eval-gate'].nav).toBe('departments');
  });
});
