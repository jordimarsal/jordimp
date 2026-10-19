import { describe, expect, it } from 'vitest';
import {
  BLOG_UI,
  CASE_BUILD,
  CASE_NOTES,
  CASE_UI,
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
  POSTS,
  PROJECTS,
  RESEARCH_PAGE,
  SITE,
  SKILLS,
  TELEMETRY_PAGE,
  TICKER,
  TIER_LABELS,
  TIER_ORDER,
  TOOLING_PAGE,
  UI,
  WORK,
  pageForPost,
  post,
  project,
  tierProjects,
} from './content';
import { SITE as CONFIG_SITE } from '../config';
import type { DeptKey, Locale, Tier } from './types';

const PROJECT_COUNT = 12;
const FEATURED_COUNT = 3;
const DEPT_COUNT = 7;
const EXPERIENCE_COUNT = 4;

describe('projects data', () => {
  it('ships exactly 12 projects with unique slugs', () => {
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
    expect(DEPTS.tooling.projects).toEqual([
      'harness-standard',
      'ggufbench',
      'md-mermaid-pdf',
      'mcp-transparent-png',
    ]);
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
      en: 'Jordimp & Co. is one engineer: backend systems, event pipelines and applied AI with evals. Specs before code. Est. 2017, Barcelona.',
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
    expect(SITE.email).toBe('hello@jordimp.net');
    expect(CONFIG_SITE.email).toBe(SITE.email);
    expect(CONFIG_SITE.email).toBe('hello@jordimp.net');
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
  ggufbench: 'satellite',
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

  it('partitions the 12 projects 3 / 5 / 4 in tier order', () => {
    expect(TIER_ORDER).toEqual(['thesis', 'satellite', 'annex']);
    expect(TIER_ORDER.map((t) => tierProjects(t).length)).toEqual([3, 5, 4]);
    expect(tierProjects('satellite').at(-1)?.slug).toBe('ggufbench');
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

describe('ggufbench entry (F24)', () => {
  it('appends ggufbench as the 12th project in PROJECTS order (R1)', () => {
    expect(PROJECTS.map((p) => p.slug)).toEqual([
      'codebaserag',
      'interview-simulator',
      'bible-text-analysis',
      'kafka-adapter-telemetry',
      'redis-toolkit',
      'product-offers',
      'harness-standard',
      'rustcut',
      'md-mermaid-pdf',
      'mcp-transparent-png',
      'spring-boot-casino',
      'ggufbench',
    ]);
  });

  it('seeds ggufbench with the fixed repo metadata (R2)', () => {
    const p = project('ggufbench');
    expect(p.name).toBe('ggufbench');
    expect(p.year).toBe('2026');
    expect(p.featured).toBe(false);
    expect(p.tier).toBe('satellite');
    expect(p.dept).toBe('tooling');
    expect(p.github).toBe('https://github.com/jordimarsal/ggufbench');
  });

  it('ships the four-item ggufbench stack (R7)', () => {
    expect(project('ggufbench').stack).toEqual(['Python', 'GGUF', 'llama.cpp', 'GitHub Actions']);
  });

  it('carries exactly three README metrics with trilingual labels (R5)', () => {
    expect(project('ggufbench').metrics).toEqual([
      {
        value: '0.85',
        label: {
          en: 'best global score — minicpm-v-4.7-35b-a3b q4_k_m, thinking off',
          es: 'mejor puntuación global — minicpm-v-4.7-35b-a3b q4_k_m, thinking off',
          ca: 'millor puntuació global — minicpm-v-4.7-35b-a3b q4_k_m, thinking off',
        },
      },
      {
        value: '3',
        label: {
          en: 'runs per task — seeds 42/43/44',
          es: 'ejecuciones por tarea — semillas 42/43/44',
          ca: 'execucions per tasca — llavors 42/43/44',
        },
      },
      {
        value: '100%',
        label: {
          en: 'local — no cloud, no APIs',
          es: 'local — sin nube ni APIs',
          ca: 'local — sense núvol ni APIs',
        },
      },
    ]);
  });

  it('defines no outcome so ggufbench stays a satellite case (R6)', () => {
    expect(project('ggufbench').outcome).toBeUndefined();
  });
});

describe('ggufbench copy (F24)', () => {
  const ggufbench = project('ggufbench');

  const prose = (lang: Locale): string[] => [
    ggufbench.blurb[lang],
    ggufbench.summary[lang],
    ggufbench.problem[lang],
    ...ggufbench.highlights[lang],
    ...ggufbench.metrics.map((metric) => metric.label[lang]),
  ];

  it('pins the exact trilingual blurb, summary and problem (R3)', () => {
    expect(ggufbench.blurb).toEqual({
      en: 'Agentic benchmark for local GGUF models — speed, tools, code, agent. One harness, receipts included.',
      es: 'Benchmark agéntico para modelos GGUF locales — velocidad, herramientas, código, agente. Un harness, recibos incluidos.',
      ca: 'Benchmark agèntic per a models GGUF locals — velocitat, eines, codi, agent. Un harness, rebuts inclosos.',
    });
    expect(ggufbench.summary).toEqual({
      en: 'An agentic benchmark for local GGUF models: prompt speed, tool-calling, code generation and multi-step agent work graded under one identical harness, with the raw receipts of every call — 100% local, no cloud, no APIs.',
      es: 'Un benchmark agéntico para modelos GGUF locales: velocidad de prompt, tool-calling, generación de código y trabajo agéntico multi-paso, medidos bajo un mismo harness y con los recibos en bruto de cada llamada — 100% local, sin nube ni APIs.',
      ca: 'Un benchmark agèntic per a models GGUF locals: velocitat de prompt, tool-calling, generació de codi i treball agèntic multi-pas, mesurats sota un mateix harness i amb els rebuts en brut de cada crida — 100% local, sense núvol ni APIs.',
    });
    expect(ggufbench.problem).toEqual({
      en: 'Public benchmarks are trained on, and “how smart is it” is not the question a local rig answers. ggufbench asks which GGUF to run on your own machine: every model runs the same harness, every scoreboard row states the task set it really ran, and exclusions are recorded with a reason — never silent.',
      es: 'Los benchmarks públicos se usan para entrenar, y “cuál es el modelo más listo” no es la pregunta que responde un equipo local. ggufbench pregunta qué GGUF ejecutar en tu propia máquina: cada modelo corre el mismo harness, cada fila del marcador declara el set de tareas que midió de verdad y las exclusiones quedan registradas con un motivo — nunca en silencio.',
      ca: 'Els benchmarks públics serveixen per entrenar, i “quin model és més llest” no és la pregunta que respon un equip local. ggufbench pregunta quin GGUF executar a la teva pròpia màquina: cada model corre el mateix harness, cada fila del marcador declara el set de tasques que va mesurar de debò i les exclusions queden registrades amb un motiu — mai en silenci.',
    });
  });

  it('ships exactly three highlights per locale with the design copy (R4)', () => {
    expect(ggufbench.highlights).toEqual({
      en: [
        'Four dimensions under one identical harness: prompt speed, tool-calling, code generation and multi-step agent work — three runs per task (seeds 42/43/44) on the same 2× RTX 5080 rig, reported as mean ± stdev.',
        'The current task set: 18 tool, 72 code and 72 agent tasks — versioned (v1 → v5) so every scoreboard row states the set it really ran; a single 32768-token reasoning budget and thinking modes measured separately.',
        '100% local — no cloud, no APIs, no telemetry — and receipts included: every call leaves timings, tool calls and per-task traces for a live scoreboard, and 13 retired models stay as record only.',
      ],
      es: [
        'Cuatro dimensiones bajo un mismo harness: velocidad de prompt, tool-calling, generación de código y trabajo agéntico multi-paso — tres ejecuciones por tarea (semillas 42/43/44) en el mismo equipo 2× RTX 5080, reportadas como media ± desviación.',
        'El set de tareas actual: 18 tareas de herramientas, 72 de código y 72 de agente — versionado (v1 → v5) para que cada fila del marcador declare el set que midió de verdad; un único presupuesto de razonamiento de 32768 tokens y los modos de thinking medidos por separado.',
        '100% local — sin nube, sin APIs, sin telemetría — y con recibos: cada llamada deja timings, llamadas a herramientas y trazas por tarea para un marcador en vivo, y 13 modelos retirados se quedan solo como registro.',
      ],
      ca: [
        'Quatre dimensions sota un mateix harness: velocitat de prompt, tool-calling, generació de codi i treball agèntic multi-pas — tres execucions per tasca (llavors 42/43/44) al mateix equip 2× RTX 5080, reportades com a mitjana ± desviació.',
        'El set de tasques actual: 18 tasques d’eines, 72 de codi i 72 d’agent — versionat (v1 → v5) perquè cada fila del marcador declari el set que va mesurar de debò; un únic pressupost de raonament de 32768 tokens i els modes de thinking mesurats per separat.',
        '100% local — sense núvol, sense APIs, sense telemetria — i amb rebuts: cada crida deixa timings, crides a eines i traces per tasca per a un marcador en viu, i 13 models retirats es queden només com a registre.',
      ],
    });
  });

  it('keeps the prose inside the README numeral allowlist with an identical multiset (R24)', () => {
    const ALLOWED = new Set([
      '0.85', '1', '2', '3', '4', '4.7', '5', '13', '18', '35', '42', '43', '44', '72',
      '100', '5080', '32768',
    ]);
    const tokens = (lang: Locale): string[] =>
      prose(lang).flatMap((text) =>
        [...text.matchAll(/\d+(?:[.,]\d+)?/g)].map((match) => match[0]),
      );
    expect(tokens('en').length).toBeGreaterThan(0);
    for (const token of tokens('en')) {
      expect(ALLOWED, `token ${token} not in the README allowlist`).toContain(token);
    }
    expect(tokens('es')).toEqual(tokens('en'));
    expect(tokens('ca')).toEqual(tokens('en'));
  });

  it('carries no emoji and no uppercase SOTA claim in any locale (R24)', () => {
    for (const lang of LOCALES) {
      const text = prose(lang).join('\n');
      expect(text, `ggufbench:${lang}`).not.toMatch(/\p{Extended_Pictographic}/u);
      expect(text, `ggufbench:${lang}`).not.toMatch(/SOTA/);
    }
  });
});

describe('home counters after the 12th project (F24 R27)', () => {
  it('counts 12 open repos in the hero chips, leaving the other three chips untouched', () => {
    expect(HOME.metaChips.en).toEqual(['EST. 2017', 'BARCELONA', '12 OPEN REPOS', '1 ENGINEER']);
    expect(HOME.metaChips.es).toEqual(['DESDE 2017', 'BARCELONA', '12 REPOS ABIERTOS', '1 INGENIERO']);
    expect(HOME.metaChips.ca).toEqual(['DES DE 2017', 'BARCELONA', '12 REPOS OBERTS', '1 ENGINYER']);
  });

  it('states 3 of 12 in the featured heading, keeping the section number 03', () => {
    expect(HOME.featuredHead.num).toBe('03');
    expect(HOME.featuredHead.sub).toEqual({
      en: '3 OF 12 — THE REST IS DOWNSTAIRS',
      es: '3 DE 12 — EL RESTO ABAJO',
      ca: '3 DE 12 — LA RESTA A BAIX',
    });
  });
});

describe('pages data', () => {
  it('registers home, work, cv, the blog trio, contact, the 7 departments and the 12 project pages (R7, F16 R5)', () => {
    const expected = [
      'home',
      'work',
      'cv',
      'blog',
      'post-ggufbench',
      'post-porter-brain',
      'article-rag-eval-gate',
      'article-rag-eval-gate-redirect',
      'contact',
      ...FLOOR_ORDER,
      ...PROJECTS.map((p) => `project-${p.slug}`),
    ];
    expect(Object.keys(PAGES).sort()).toEqual(expected.sort());
    expect(Object.keys(PAGES)).toHaveLength(28);
  });

  it('registers the ggufbench case page on the tooling floor (R18)', () => {
    const page = PAGES['project-ggufbench'];
    expect(page.route).toBe('projects/ggufbench.html');
    expect(page.nav).toBe('departments');
    expect(page.title).toEqual({
      en: 'ggufbench — Tooling & Platform — Jordimp & Co.',
      es: 'ggufbench — Herramientas y Plataforma — Jordimp & Co.',
      ca: 'ggufbench — Eines i Plataforma — Jordimp & Co.',
    });
    expect(page.description).toEqual(project('ggufbench').summary);
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

  it('links the published quality report for the sonar-gated project', () => {
    expect(project('kafka-adapter-telemetry').qualityUrl).toBe(
      'https://jordimarsal.github.io/kafka-adapter-telemetry/quality/',
    );
  });

  it('leaves qualityUrl undefined when a project publishes no quality page', () => {
    expect(project('codebaserag').qualityUrl).toBeUndefined();
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
  it('reports 2 research projects and 4 tooling projects', () => {
    for (const lang of LOCALES) {
      expect(RESEARCH_PAGE.stats[lang], lang).toHaveLength(3);
      expect(TOOLING_PAGE.stats[lang], lang).toHaveLength(3);
    }
    const statsText = LOCALES.map((lang) => JSON.stringify(TOOLING_PAGE.stats[lang])).join(' ');
    expect(statsText).not.toMatch(/\b(?:assessment|prueba|proves)\b/i);
    expect(RESEARCH_PAGE.stats.en[0]).toEqual({ value: '2', label: 'PROJECTS ON THIS FLOOR' });
    expect(TOOLING_PAGE.stats).toEqual({
      en: [
        { value: '4', label: 'PROJECTS ON THIS FLOOR' },
        { value: '7', label: 'STACKS COVERED BY THE HARNESS' },
        { value: '1', label: 'COMMAND INSTALLS THE HARNESS' },
      ],
      es: [
        { value: '4', label: 'PROYECTOS EN ESTA PLANTA' },
        { value: '7', label: 'STACKS CUBIERTOS POR EL HARNESS' },
        { value: '1', label: 'COMANDO INSTALA EL HARNESS' },
      ],
      ca: [
        { value: '4', label: 'PROJECTES EN AQUESTA PLANTA' },
        { value: '7', label: 'STACKS COBERTS PEL HARNESS' },
        { value: '1', label: 'COMANDA INSTAL·LA EL HARNESS' },
      ],
    });
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
        positive: ['harness', 'ggufbench', 'md-mermaid-pdf', 'mcp-transparent-png'],
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

  it('states 12 projects and the three tiers', () => {
    const twelve: Record<(typeof LOCALES)[number], string> = { en: 'Twelve', es: 'Doce', ca: 'Dotze' };
    expect(WORK.head.sub).toEqual({
      en: '12 PROJECTS · 3 TIERS · FILTER BY STACK',
      es: '12 PROYECTOS · 3 NIVELES · FILTRA POR STACK',
      ca: '12 PROJECTES · 3 NIVELLS · FILTRA PER STACK',
    });
    expect(WORK.intro).toEqual({
      en: 'Twelve projects in three tiers: the thesis, the satellites around it, and an annex for roots, take-home assessments and size exercises. Filter by the stack you care about.',
      es: 'Doce proyectos en tres niveles: la tesis, sus satélites y un anexo para raíces, pruebas técnicas y ejercicios de tamaño. Filtra por el stack que te interese.',
      ca: 'Dotze projectes en tres nivells: la tesi, els seus satèl·lits i un annex per a arrels, proves tècniques i exercicis de mida. Filtra pel stack que et vagi bé.',
    });
    expect(PAGES.work.description).toEqual({
      en: 'Twelve projects in three tiers — thesis, satellites and annex — across backend systems, event pipelines, applied AI and tooling. Filter by the stack you care about.',
      es: 'Doce proyectos en tres niveles — tesis, satélites y anexo — entre sistemas backend, pipelines de eventos, IA aplicada y herramientas. Filtra por el stack que te interese.',
      ca: 'Dotze projectes en tres nivells — tesi, satèl·lits i annex — entre sistemes backend, pipelines d’esdeveniments, IA aplicada i eines. Filtra pel stack que et vagi bé.',
    });
    for (const lang of LOCALES) {
      expect(WORK.head.sub[lang], lang).toContain('12');
      expect(WORK.intro[lang], lang).toContain(twelve[lang]);
      expect(PAGES.work.description[lang], lang).toContain(twelve[lang]);
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

describe('blog posts data (F15)', () => {
  const essay = post('rag-eval-gate');
  const gguf = post('which-local-model-for-coding-agents');

  it('ships exactly three posts ordered by publication date descending (R9)', () => {
    expect(POSTS.map((entry) => entry.slug)).toEqual([
      'sixteen-models-one-gate',
      'which-local-model-for-coding-agents',
      'rag-eval-gate',
    ]);
    expect(POSTS.map((entry) => entry.date)).toEqual(
      [...POSTS.map((entry) => entry.date)].sort().reverse(),
    );
  });

  it('localizes the blog UI labels and pins the navbar Blog label (R8, R9)', () => {
    expect(UI.nav.blog).toEqual({ en: 'Blog', es: 'Blog', ca: 'Blog' });
    expect(BLOG_UI.rowLabel).toEqual({
      en: 'READ THE POST',
      es: 'LEE LA ENTRADA',
      ca: 'LLEGEIX L’ENTRADA',
    });
  });

  it('gives the ggufbench post trilingual metadata, the measured date and the repo about URL (R10, R14, R15)', () => {
    expect(gguf.date).toBe('2026-10-13');
    expect(gguf.revision).toBe('REV B');
    expect(gguf.about).toBe('https://github.com/jordimarsal/ggufbench');
    expect(essay.about).toBe('https://github.com/jordimarsal/codebaserag');
    for (const lang of LOCALES) {
      expect(gguf.title[lang].trim(), `gguf:title.${lang}`).not.toBe('');
      expect(gguf.description[lang].trim(), `gguf:description.${lang}`).not.toBe('');
      expect(gguf.lead[lang].trim(), `gguf:lead.${lang}`).not.toBe('');
      expect(gguf.dateLabel[lang].trim(), `gguf:dateLabel.${lang}`).not.toBe('');
    }
  });

  it('registers the blog index, the post and the essay in PAGES under the blog nav (R1, R2, R3, R7)', () => {
    expect(PAGES.blog.route).toBe('blog.html');
    expect(PAGES.blog.nav).toBe('blog');
    expect(PAGES['post-ggufbench'].route).toBe('blog/which-local-model-for-coding-agents.html');
    expect(PAGES['post-ggufbench'].nav).toBe('blog');
    expect(PAGES['article-rag-eval-gate'].route).toBe('blog/rag-eval-gate.html');
    expect(PAGES['article-rag-eval-gate'].nav).toBe('blog');
    expect(pageForPost(gguf).route).toBe('blog/which-local-model-for-coding-agents.html');
    expect(pageForPost(essay).route).toBe('blog/rag-eval-gate.html');
  });

  it('points every redirect stub at a registered PAGES route (R6, R7)', () => {
    for (const page of Object.values(PAGES)) {
      if (page.redirect === undefined) continue;
      expect(
        Object.values(PAGES).some((target) => target.route === page.redirect),
        `${page.route} → ${page.redirect}`,
      ).toBe(true);
    }
    expect(PAGES['article-rag-eval-gate-redirect'].route).toBe('writing/rag-eval-gate.html');
    expect(PAGES['article-rag-eval-gate-redirect'].redirect).toBe('blog/rag-eval-gate.html');
    expect(PAGES.contact.redirect).toBe('departments/front-desk.html');
  });
});

describe('contact page data (F16 R1, R2, R5)', () => {
  it('registers the trilingual contact stub redirecting to the same front-desk route', () => {
    expect(PAGES.contact.route).toBe('contact.html');
    expect(PAGES.contact.nav).toBe('departments');
    expect(PAGES.contact.redirect).toBe('departments/front-desk.html');
    expect(PAGES.frontdesk.route).toBe(PAGES.contact.redirect);
    for (const lang of LOCALES) {
      expect(PAGES.contact.title[lang]).toBe(PAGES.frontdesk.title[lang]);
      expect(PAGES.contact.description[lang]).toBe(PAGES.frontdesk.description[lang]);
      expect(PAGES.contact.title[lang].trim()).not.toBe('');
      expect(PAGES.contact.description[lang].trim()).not.toBe('');
    }
  });
});

describe('ux-review strings (F16 R13, R19, R25, R28)', () => {
  it('localizes the building affordance hint in three locales (R13)', () => {
    expect(UI.floorHint).toEqual({
      en: 'EACH FLOOR IS A DOOR — CLICK ONE TO STEP IN',
      es: 'CADA PLANTA ES UNA PUERTA — PULSA UNA PARA ENTRAR',
      ca: 'CADA PLANTA ÉS UNA PORTA — PITJA UNA PER ENTRAR',
    });
  });

  it('localizes the projects tier-nav label in three locales (R28)', () => {
    expect(UI.tierNav).toEqual({
      en: 'THE THREE TIERS',
      es: 'LOS TRES NIVELES',
      ca: 'ELS TRES NIVELLS',
    });
  });

  it('localizes the case-page Impact label in three locales (R25)', () => {
    expect(CASE_UI.impact).toEqual({ en: 'Impact', es: 'Impacto', ca: 'Impacte' });
  });

  it('localizes the front-desk shelf line and never mentions a Catalan PDF (R19, R20)', () => {
    expect(FRONTDESK_PAGE.shelfLine).toEqual({
      en: 'THE PRINTED EDITION IS ON THE SHELF — TAKE THE PDF IN ENGLISH OR SPANISH.',
      es: 'LA EDICIÓN IMPRESA ESTÁ EN LA BALDA — LLÉVATE EL PDF EN INGLÉS O ESPAÑOL.',
      ca: 'L’EDICIÓ IMPRESA ÉS A LA PRESTATGERIA — EMPORTA’T EL PDF EN ANGLÈS O ESPAÑOL.',
    });
    for (const lang of LOCALES) {
      expect(FRONTDESK_PAGE.shelfLine[lang]).toMatch(/PDF/);
      expect(FRONTDESK_PAGE.shelfLine[lang]).not.toMatch(/catal/i);
    }
  });
});

describe('project outcome copy (F16 R23, R24)', () => {
  const THESIS_SLUGS = ['codebaserag', 'kafka-adapter-telemetry', 'harness-standard'];

  const numerals = (text: string): string[] => [...text.matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);

  const ownNumerals = (slug: string, lang: 'en' | 'es' | 'ca'): string[] =>
    numerals(
      [
        project(slug).summary[lang],
        project(slug).problem[lang],
        ...project(slug).highlights[lang],
      ].join('\n'),
    );

  it('defines an outcome on exactly the three thesis projects (R23)', () => {
    const withOutcome = PROJECTS.filter((p) => p.outcome !== undefined).map((p) => p.slug);
    expect([...withOutcome].sort()).toEqual([...THESIS_SLUGS].sort());
  });

  it('keeps every outcome trilingual and non-empty (R23)', () => {
    for (const slug of THESIS_SLUGS) {
      for (const lang of LOCALES) {
        expect(project(slug).outcome?.[lang].trim(), `${slug}:${lang}`).not.toBe('');
      }
    }
  });

  it('introduces no numeral absent from the project’s own copy, per locale (R24)', () => {
    for (const slug of THESIS_SLUGS) {
      for (const lang of LOCALES) {
        const outcome = project(slug).outcome?.[lang] ?? '';
        const own = ownNumerals(slug, lang);
        for (const token of numerals(outcome)) {
          expect(own, `${slug}:${lang} introduces ${token}`).toContain(token);
        }
      }
    }
  });

  it('carries the kafka telemetry facts in its own copy before reuse (fact boundary)', () => {
    for (const lang of LOCALES) {
      expect(ownNumerals('kafka-adapter-telemetry', lang)).toContain('90');
      expect(ownNumerals('kafka-adapter-telemetry', lang)).toContain('4');
      expect(numerals(project('kafka-adapter-telemetry').outcome?.[lang] ?? '').sort()).toEqual(
        ['4', '90'],
      );
    }
  });
});

describe('essay data (F15 migration, R4)', () => {
  const essay = post('rag-eval-gate');
  const EN_TITLE = 'RAG without an eval gate is a demo.';
  const ANCHORS = ['problem', 'golden-set', 'ci-gate', 'hexagonal', 'baseline'];

  it('pins the exact English title and localized title/description/lead', () => {
    expect(essay.title.en).toBe(EN_TITLE);
    expect(essay.sections).toHaveLength(5);
    for (const lang of LOCALES) {
      expect(essay.title[lang].trim(), `title.${lang}`).not.toBe('');
      expect(essay.description[lang].trim(), `description.${lang}`).not.toBe('');
      expect(essay.lead[lang].trim(), `lead.${lang}`).not.toBe('');
      expect(essay.dateLabel[lang].trim(), `dateLabel.${lang}`).not.toBe('');
      expect(essay.readLabel?.[lang].trim(), `readLabel.${lang}`).not.toBe('');
      expect(essay.relatedBody?.[lang].trim(), `relatedBody.${lang}`).not.toBe('');
    }
  });

  it('defines exactly the five sections in the fixed order with trilingual paragraphs', () => {
    expect(essay.sections.map((section) => section.anchor)).toEqual(ANCHORS);
    for (const section of essay.sections) {
      for (const lang of LOCALES) {
        expect(section.heading[lang].trim(), `${section.anchor}:heading.${lang}`).not.toBe('');
        const paragraphs = section.blocks.filter((block) => block.kind === 'paragraph');
        expect(paragraphs.length, `${section.anchor}:blocks.${lang}`).toBeGreaterThan(0);
        for (const block of paragraphs) {
          if (block.kind !== 'paragraph') continue;
          expect(block.html[lang].trim(), `${section.anchor}:body.${lang}`).not.toBe('');
        }
      }
    }
  });

  it('keeps the English body between 800 and 1200 words', () => {
    const words = [
      essay.lead.en,
      ...essay.sections.flatMap((section) =>
        section.blocks.map((block) => (block.kind === 'paragraph' ? block.html.en : '')),
      ),
    ]
      .join(' ')
      .split(/\s+/)
      .filter(Boolean);
    expect(words.length).toBeGreaterThanOrEqual(800);
    expect(words.length).toBeLessThanOrEqual(1200);
  });

  it('carries the committed floor facts, the datestamp and frames 0.409 honestly', () => {
    const en = [
      essay.lead.en,
      ...essay.sections.flatMap((section) =>
        section.blocks.map((block) => (block.kind === 'paragraph' ? block.html.en : '')),
      ),
    ].join('\n');
    expect(en).toContain('0.409');
    expect(en).toContain('not SOTA');
    expect(en).toContain('≥40');
    expect(essay.date).toBe('2026-09-22');
    expect(essay.revision).toBe('REV A');
  });
});

describe('ggufbench post data (F15, fact boundary R13)', () => {
  const gguf = post('which-local-model-for-coding-agents');

  const proseOf = (lang: 'en' | 'es' | 'ca'): string =>
    [
      gguf.lead[lang],
      ...gguf.sections.flatMap((section) =>
        section.blocks.map((block) => (block.kind === 'paragraph' ? block.html[lang] : '')),
      ),
    ].join('\n');

  const numerals = (text: string): string[] =>
    [...text.matchAll(/\d+(?:\.\d+)?/g)].map((match) => match[0]);

  const outboundUrls = (lang: 'en' | 'es' | 'ca'): readonly string[] =>
    [...proseOf(lang).matchAll(/https?:\/\/[^\s<"']+/g)].map((match) => match[0]).sort();

  it('pins the exact English h1 (R13)', () => {
    expect(gguf.title.en).toBe(
      'Which local model should a coding agent run? Six GGUFs and a Strata engine, one harness, receipts',
    );
  });

  it('carries the scoreboard as a typed table with the source header and the ten measured rows (R12)', () => {
    const tables = gguf.sections.flatMap((section) => section.blocks).filter((block) => block.kind === 'table');
    expect(tables).toHaveLength(1);
    const table = tables[0];
    if (table.kind !== 'table') return;
    expect(table.head).toEqual(['model', 'think', 'tools', 'code', 'agent', 'speed', 'global']);
    expect(table.rows).toEqual([
      ['minicpm-v-4.7-35b-a3b q4_k_m', 'on', '100% ±0', '82% ±4 (8 excl.)', '89% ±0', '23ms', '0.85 ±1'],
      ['minicpm-v-4.7-35b-a3b q4_k_m', 'off ★', '100% ±0', '83% ±1 (2 excl.)', '90% ±2', '26ms', '0.85 ±0'],
      ['qwen36-35b-distill-mxfp4_moe', 'off ★', '94% ±0', '74% ±3', '92% ±2', '19ms', '0.84 ±1'],
      ['qwen3.8-27b-ud-q3_k_xl', 'off', '100% ±0', '79% ±4', '90% ±1', '36ms', '0.82 ±1'],
      ['ornith-1.5-35b-a3b-apex-mtp-quality', 'off ★', '100% ±0', '75% ±2', '92% ±1', '32ms', '0.82 ±1'],
      ['qwen3.8-27b-heretic-q4_k_m', 'off ★', '100% ±0', '86% ±2', '92% ±2', '85ms', '0.81 ±1'],
      ['qwen3.8-27b-ud-q3_k_xl', 'on', '94% ±0', '93% ±1 (1 excl.)', '96% ±1', '629ms', '0.80 ±0'],
      ['gemma-4-26b-a4b-it-ud-q5_k_xl', 'off ★', '89% ±0', '86% ±1', '87% ±2', '33ms', '0.80 ±0'],
      ['strata-iq3_xxs (strata engine)', 'off ★', '91% ±6', '85% ±1', '92% ±1', '45ms', '0.80 ±1'],
      ['qwen3.8-27b-heretic-q4_k_m', 'on', '94% ±0', '90% ±2', '97% ±1', '1060ms', '0.80 ±0'],
    ]);
  });

  it('keeps only source-writeup figures in the English body (fact boundary)', () => {
    const en = proseOf('en');
    for (const fact of [
      'temperature 0.2',
      'top-p 0.95',
      'top-k 40',
      'min-p 0.05',
      'seed 42',
      'q8_0',
      'seeds 42, 43 and 44',
      '0.85 ±1',
      '18 tool tasks',
      '72 code tasks',
      '72 multi-step agent tasks',
      '32K output budget',
      '2026-10-14/15',
      '1512 code runs',
      'OFF excludes 6 and ON excludes 101',
      '280–1060 ms',
      '19–85 ms',
      '79% to 93%',
      '91% and 100%',
      '47% and 87%',
    ]) {
      expect(en, fact).toContain(fact);
    }
    expect(en).not.toContain('0.48');
    expect(en).not.toContain('RTX 4090');
  });

  it('carries exactly the EN numeric multiset in the ES and CA bodies (R13)', () => {
    expect(numerals(proseOf('es'))).toEqual(numerals(proseOf('en')));
    expect(numerals(proseOf('ca'))).toEqual(numerals(proseOf('en')));
  });

  it('carries exactly the EN outbound URLs in the ES and CA bodies (R13)', () => {
    expect(outboundUrls('en')).toEqual([
      'https://github.com/jordimarsal/ggufbench',
      'https://github.com/jordimarsal/ggufbench',
      'https://jordimarsal.github.io/ggufbench/',
    ]);
    expect(outboundUrls('es')).toEqual(outboundUrls('en'));
    expect(outboundUrls('ca')).toEqual(outboundUrls('en'));
  });
});

describe('harness promo on F1/F2 (install cmd, demo, badge)', () => {
  it('ships the literal one-command install on the tooling floor', () => {
    expect(TOOLING_PAGE.installCmd).toBe(
      'curl -fsSL https://jordimp.net/harness/install.sh | bash -s -- --tool=claude',
    );
    for (const lang of LOCALES) {
      expect(TOOLING_PAGE.installTitle[lang].trim(), lang).not.toBe('');
      expect(TELEMETRY_PAGE.demoTitle[lang].trim(), lang).not.toBe('');
    }
  });
});

describe('harness entry ships standalone skills (F17)', () => {
  const SKILLS_CMD = 'npx skills add jordimarsal/harness';

  it('lists a skills highlight with the install command in every language (R1)', () => {
    for (const lang of LOCALES) {
      const withCmd = project('harness-standard').highlights[lang].filter((line) =>
        line.includes(SKILLS_CMD),
      );
      expect(withCmd.length, `highlights.${lang}`).toBeGreaterThan(0);
    }
  });

  it('keeps the claim boundary: no registry-publication claims (R4)', () => {
    for (const lang of LOCALES) {
      for (const line of project('harness-standard').highlights[lang]) {
        if (line.includes(SKILLS_CMD)) {
          expect(line, `highlights.${lang}`).not.toMatch(/anthropic/i);
          expect(line, `highlights.${lang}`).not.toMatch(/registry/i);
        }
      }
    }
  });

  it('adds a 6-skills metric with the same label word in every language (R2)', () => {
    const metric = project('harness-standard').metrics.find((m) => m.value === '6');
    expect(metric, 'metrics: 6').toBeDefined();
    for (const lang of LOCALES) {
      expect(metric?.label[lang], `metric.label.${lang}`).toBe('skills');
    }
  });
});

describe('plain-language clarity (F21)', () => {
  const BANNED_TERMS = [
    'RAG',
    'SSE',
    'eval-gated',
    'eval gate',
    'eval',
    'LLM',
    'GGUF',
    'MCP',
    'CLI',
    'API',
    'SDK',
    'MVP',
    'SDD',
    'TDD',
    'SOLID',
    'CI',
    'retrieval',
    'recall',
    'embeddings',
    'vector',
    'hexagonal',
    'golden set',
    'Q/A',
    'pipeline',
  ] as const;

  const bannedIn = (text: string): string[] =>
    BANNED_TERMS.filter((term) =>
      new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text),
    );

  const PLAIN_BLOCKS = (): readonly string[] => [
    ...LOCALES.map((lang) => HOME.floorGuide.label[lang]),
    ...LOCALES.map((lang) => HOME.floorGuide.line[lang]),
    ...HOME.plainCards.flatMap((card) =>
      LOCALES.flatMap((lang) => [card.title[lang], card.body[lang], card.cta[lang]]),
    ),
    ...FLOOR_ORDER.flatMap((key) => LOCALES.map((lang) => DEPTS[key].plain[lang])),
  ];

  it('heads the metaphor guide with the exact trilingual label and line (R4)', () => {
    expect(HOME.floorGuide.label.en).toBe('FIRST VISIT? THE BUILDING, IN PLAIN WORDS');
    expect(HOME.floorGuide.line.en).toBe(
      'This building is one engineer’s practice: every floor is a kind of work he does. Walk in — the doors are open and everything inside can be checked.',
    );
    expect(HOME.floorGuide.label.es).toBe('¿PRIMERA VISITA? EL EDIFICIO, EN PALABRAS SENCILLAS');
    expect(HOME.floorGuide.label.ca).toBe('PRIMERA VISITA? L’EDIFICI, EN PARAULES SENCILLES');
    expect(HOME.floorGuide.line.es).toBe(
      'Este edificio es el trabajo de un solo ingeniero: cada planta es un tipo de trabajo que hace. Entra — las puertas están abiertas y todo lo de dentro se puede comprobar.',
    );
    expect(HOME.floorGuide.line.ca).toBe(
      'Aquest edifici és la feina d’un sol enginyer: cada planta és un tipus de treball que fa. Entra — les portes són obertes i tot el que hi ha a dins es pot comprovar.',
    );
  });

  it('heads the outcomes section 02 with the exact trilingual head (R1, R4)', () => {
    expect(HOME.plainHead.num).toBe('02');
    expect(HOME.plainHead.title.en).toBe('What this means for you');
    expect(HOME.plainHead.sub.en).toBe('THE SAME WORK, IN PLAIN WORDS');
    expect(HOME.plainHead.title.es).toBe('Lo que esto significa para ti');
    expect(HOME.plainHead.sub.es).toBe('EL MISMO TRABAJO, EN PALABRAS SENCILLAS');
    expect(HOME.plainHead.title.ca).toBe('Què significa això per a tu');
    expect(HOME.plainHead.sub.ca).toBe('EL MATEIX TREBALL, EN PARAULES SENCILLES');
  });

  it('pins the three outcome cards in the fixed order with their floors (R2)', () => {
    expect(HOME.plainCards.map((card) => card.dept)).toEqual(['research', 'telemetry', 'tooling']);
  });

  it('pins the exact EN card copy verbatim from the design table (R4)', () => {
    expect(HOME.plainCards.map((card) => card.title.en)).toEqual([
      'AI answers you can check',
      'Systems that say when they break',
      'A written plan before the first line of code',
    ]);
    expect(HOME.plainCards.map((card) => card.body.en)).toEqual([
      'I build AI features that answer with evidence: a fixed set of questions proves the answers are right before launch — and keeps proving it after every change.',
      'I connect the systems a business runs on so information moves on its own — and when a piece goes down, the alert says which piece and since when. No silent failures.',
      'Every job starts as a short document you can read and approve: what gets built, how it is proven to work, and when it is done. Then the code follows the plan.',
    ]);
    expect(HOME.plainCards.map((card) => card.cta.en)).toEqual([
      'Visit the Research floor',
      'Visit the Telemetry floor',
      'Visit the Tooling floor',
    ]);
  });

  it('keeps every new field non-empty in es and ca (R4)', () => {
    for (const lang of ['es', 'ca'] as const) {
      expect(HOME.floorGuide.label[lang].trim(), `floorGuide.label.${lang}`).not.toBe('');
      expect(HOME.floorGuide.line[lang].trim(), `floorGuide.line.${lang}`).not.toBe('');
      expect(HOME.plainHead.title[lang].trim(), `plainHead.title.${lang}`).not.toBe('');
      expect(HOME.plainHead.sub[lang].trim(), `plainHead.sub.${lang}`).not.toBe('');
      for (const card of HOME.plainCards) {
        expect(card.title[lang].trim(), `${card.dept}:title.${lang}`).not.toBe('');
        expect(card.body[lang].trim(), `${card.dept}:body.${lang}`).not.toBe('');
        expect(card.cta[lang].trim(), `${card.dept}:cta.${lang}`).not.toBe('');
      }
    }
  });

  it('defines the plain line for all seven floors in every locale, EN verbatim (R7)', () => {
    const EN_PLAIN: Record<DeptKey, string> = {
      research:
        'AI features that show their work: the answers are checked against a fixed set of questions before anything reaches a customer.',
      telemetry:
        'The plumbing that moves data between a company’s systems — built so that when a piece fails, you are told which piece and since when, instead of finding out from a customer.',
      tooling:
        'Small tools and written plans: the work is agreed on paper before the first line of code, so you always know what is being built and why.',
      inspections:
        'The certificates on the wall: speed, accessibility and quality scores, dated and signed, so nothing here runs on faith.',
      people:
        'The house rules: tests before features, plain names, no hidden tricks — one engineer whose work is easy to audit.',
      operations:
        'The career ledger: every job since 2017, what shipped and what it was built with — one history, no rewrites.',
      frontdesk:
        'Where you start: describe what you need in your own words and get a straight answer about whether we can help.',
    };
    for (const key of FLOOR_ORDER) {
      expect(DEPTS[key].plain.en, `${key}:plain.en`).toBe(EN_PLAIN[key]);
      for (const lang of ['es', 'ca'] as const) {
        expect(DEPTS[key].plain[lang].trim(), `${key}:plain.${lang}`).not.toBe('');
      }
    }
  });

  it('renumbers the home sections 01-04 after the insert (R5)', () => {
    expect(HOME.featuredHead.num).toBe('03');
    expect(HOME.deptsHead.num).toBe('04');
  });

  it('keeps the new plain blocks free of banned jargon in all three locales (R9)', () => {
    for (const text of PLAIN_BLOCKS()) {
      expect(bannedIn(text), text).toEqual([]);
    }
  });

  it('lets the scan catch what it claims to catch (R9 sanity)', () => {
    expect(bannedIn('The RAG hexagonal eval gate')).toEqual([
      'RAG',
      'eval gate',
      'eval',
      'hexagonal',
    ]);
    expect(bannedIn('eval-gated pipeline')).toEqual(['eval-gated', 'eval', 'pipeline']);
    expect(bannedIn('EVALUATE the answers')).toEqual([]);
    expect(bannedIn('CERTIFICAT')).toEqual([]);
    expect(bannedIn('AI answers')).toEqual([]);
  });
});
