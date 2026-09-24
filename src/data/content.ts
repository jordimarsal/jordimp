import type {
  ArticleContent,
  CaseBuildStep,
  CaseUiStrings,
  CvContent,
  Dept,
  DeptKey,
  ExperienceEntry,
  FooterContent,
  FrontdeskPageContent,
  HomeContent,
  InspectionsPageContent,
  L10n,
  Locale,
  LocaleInfo,
  NotFoundContent,
  OperationsPageContent,
  PageLabels,
  PageMeta,
  PeoplePageContent,
  PrinciplesContent,
  Project,
  ProjectL10n,
  ResearchPageContent,
  SkillGroup,
  SiteInfo,
  TelemetryPageContent,
  Tier,
  ToolingPageContent,
  UiStrings,
  WorkContent,
  KVEntry,
} from './types';

import { CONTACT_EMAIL } from '../config.ts';

export const SITE: SiteInfo = {
  brand: 'JORDIMP & CO.',
  person: 'Jordi Marçal Poy',
  role: { en: 'Senior Backend Engineer', es: 'Ingeniero Backend Senior', ca: 'Enginyer Backend Sènior' },
  tagline: { en: 'Java · Python · AI/LLM', es: 'Java · Python · IA/LLM', ca: 'Java · Python · IA/LLM' },
  url: 'https://jordimp.net',
  email: CONTACT_EMAIL,
  github: 'https://github.com/jordimarsal',
  linkedin: 'https://www.linkedin.com/in/jordi-marsal-poy',
  est: '2017',
  city: { en: 'Barcelona', es: 'Barcelona', ca: 'Barcelona' },
  year: '2026',
};

export const LOCALES: readonly Locale[] = ['en', 'es', 'ca'];
export const DEFAULT_LOCALE: Locale = 'en';

export const L: Record<Locale, LocaleInfo> = {
  en: { name: 'English', short: 'EN', htmlLang: 'en', og: 'en_US' },
  es: { name: 'Español', short: 'ES', htmlLang: 'es', og: 'es_ES' },
  ca: { name: 'Català', short: 'CA', htmlLang: 'ca', og: 'ca_ES' },
};

export const UI: UiStrings = {
  skip: {
    en: 'Skip to content',
    es: 'Saltar al contenido',
    ca: 'Salta al contingut',
  },
  nav: {
    home: { en: 'Home', es: 'Inicio', ca: 'Inici' },
    departments: { en: 'Departments', es: 'Departamentos', ca: 'Departaments' },
    work: { en: 'Projects', es: 'Proyectos', ca: 'Projectes' },
    cv: { en: 'CV', es: 'CV', ca: 'CV' },
    contact: { en: 'Contact', es: 'Contacto', ca: 'Contacte' },
  },
  themeToggle: {
    en: 'Toggle night shift', es: 'Cambiar al turno de noche', ca: 'Canvia al torn de nit',
  },
  buildingHint: {
    en: 'CLICK A FLOOR — THE DOORS OPEN IN PLACE',
    es: 'PULSA UNA PLANTA — LAS PUERTAS SE ABREN EN SITIO',
    ca: 'PITJA UNA PLANTA — LES PORTES S’OBREN AL SEU LLOC',
  },
  enterDept: {
    en: 'Enter the department', es: 'Entrar al departamento', ca: 'Entra al departament',
  },
  enterDeptArrow: '→',
  close: { en: 'Close', es: 'Cerrar', ca: 'Tanca' },
  viewGithub: { en: 'View on GitHub', es: 'Ver en GitHub', ca: 'Veure a GitHub' },
  openPanel: { en: 'Open', es: 'Abrir', ca: 'Obre' },
  estLabel: { en: 'EST. 2017', es: 'DESDE 2017', ca: 'DES DE 2017' },
  scrollHint: {
    en: 'SCROLL SIDEWAYS TO WALK THE STREET',
    es: 'DESLIZA LATERALMENTE PARA RECORRER LA CALLE',
    ca: 'LLISCA LATERALMENT PER RECORRER EL CARRER',
  },
};

export const TICKER: L10n<readonly string[]> = {
  en: ['BACKEND SYSTEMS', 'EVENT PIPELINES', 'APPLIED AI', 'JAVA', 'PYTHON', 'LLM TOOLING', 'SPECS BEFORE CODE', 'EST. 2017', 'BARCELONA'],
  es: ['SISTEMAS BACKEND', 'PIPELINES DE EVENTOS', 'IA APLICADA', 'JAVA', 'PYTHON', 'HERRAMIENTAS LLM', 'SPECS ANTES QUE CÓDIGO', 'DESDE 2017', 'BARCELONA'],
  ca: ['SISTEMES BACKEND', 'PIPELINES D’ESDEVENIMENTS', 'IA APLICADA', 'JAVA', 'PYTHON', 'EINES LLM', 'SPECS ABANS QUE CODI', 'DES DE 2017', 'BARCELONA'],
};

export const HOME: HomeContent = {
  kicker: {
    en: 'SENIOR BACKEND ENGINEER — SYSTEMS YOU CAN AUDIT',
    es: 'INGENIERO BACKEND SENIOR — SISTEMAS QUE SE PUEDEN AUDITAR',
    ca: 'ENGINYER BACKEND SÈNIOR — SISTEMES QUE ES PODEN AUDITAR',
  },
  h1: {
    en: 'One company. One engineer. <mark>Specs before code.</mark>',
    es: 'Una empresa. Un ingeniero. <mark>Specs antes que código.</mark>',
    ca: 'Una empresa. Un enginyer. <mark>Specs abans de codi.</mark>',
  },
  stand: {
    en: 'Jordimp & Co. is the working name of one engineer: backend systems, event pipelines and applied AI, designed, built and audited by the same pair of hands since <b>2017</b>. Currently inside a telco platform team. Walk-ins: roles, repos, or a short spec-first engagement.',
    es: 'Jordimp & Co. es el nombre de trabajo de un solo ingeniero: sistemas backend, pipelines de eventos e IA aplicada, diseñados, construidos y auditados por el mismo par de manos desde <b>2017</b>. Ahora, dentro de un equipo de plataforma telco. Entrada libre: roles, repos o un encargo corto con spec primero.',
    ca: 'Jordimp & Co. és el nom de feina d’un sol enginyer: sistemes backend, pipelines d’esdeveniments i IA aplicada, dissenyats, construïts i auditats pel mateix parell de mans des del <b>2017</b>. Ara, dins d’un equip de plataforma telco. Entrada lliure: rols, repos, o un encàrrec curt amb spec primer.',
  },
  metaChips: {
    en: ['EST. 2017', 'BARCELONA', 'EN / ES / CA', '11 OPEN REPOS', '1 ENGINEER'],
    es: ['DESDE 2017', 'BARCELONA', 'EN / ES / CA', '11 REPOS ABIERTOS', '1 INGENIERO'],
    ca: ['DES DE 2017', 'BARCELONA', 'EN / ES / CA', '11 REPOS OBERTS', '1 ENGINYER'],
  },
  featuredHead: {
    num: '02',
    title: { en: 'Featured work', es: 'Trabajo destacado', ca: 'Treball destacat' },
    sub: { en: '3 OF 11 — THE REST IS DOWNSTAIRS', es: '3 DE 11 — EL RESTO ABAJO', ca: '3 DE 11 — LA RESTA A BAIX' },
  },
  deptsHead: {
    num: '03',
    title: { en: 'Departments', es: 'Departamentos', ca: 'Departaments' },
    sub: { en: '7 FLOORS · 1 PAIR OF HANDS', es: '7 PLANTAS · 1 PAR DE MANOS', ca: '7 PLANTES · 1 PARELL DE MANS' },
  },
};

export const DEPTS: Record<DeptKey, Dept> = {
  research: {
    code: 'F3',
    icon: 'flask',
    tag: {
      en: 'RETRIEVAL WITH RECEIPTS', es: 'RECUPERACIÓN CON RECIBOS', ca: 'RECUPERACIÓ AMB REBUTS',
    },
    name: {
      en: 'Research & Retrieval', es: 'Investigación y Recuperación', ca: 'Recerca i Recuperació',
    },
    line: {
      en: 'APPLIED AI YOU CAN EVALUATE — RETRIEVAL WITH RECEIPTS.',
      es: 'IA APLICADA QUE SE PUEDE EVALUAR — RECUPERACIÓN CON RECIBOS.',
      ca: 'IA APLICADA QUE ES POT AVALUAR — RECUPERACIÓ AMB REBUTS.',
    },
    intro: {
      en: 'The top floor ships AI like infrastructure: deterministic cores, golden Q/A sets, evals gated in CI. If a model can’t be measured, it doesn’t ship.',
      es: 'La planta más alta entrega IA como infraestructura: núcleos deterministas, sets golden de Q/A y evals con gate en CI. Si un modelo no se puede medir, no se entrega.',
      ca: 'La planta de dalt lliura IA com a infraestructura: nuclis deterministes, sets golden de Q/A i evals amb gate a CI. Si un model no es pot mesurar, no es lliura.',
    },
    projects: ['codebaserag', 'interview-simulator'],
    page: 'research',
  },
  telemetry: {
    code: 'F2',
    icon: 'antenna',
    tag: {
      en: 'HONEST FAILURE MODES', es: 'FALLOS HONESTOS', ca: 'FALLADES HONESTES',
    },
    name: {
      en: 'Transport & Telemetry', es: 'Transporte y Telemetría', ca: 'Transport i Telemetria',
    },
    line: {
      en: 'THE PLUMBING THAT MUST NOT LIE — TELEMETRY WITH HONEST FAILURE MODES.',
      es: 'LA TUBERÍA QUE NO PUEDE MENTIR — TELEMETRÍA CON FALLOS HONESTOS.',
      ca: 'LA TUBERIA QUE NO POT MENTIR — TELEMETRIA AMB FALLADES HONESTES.',
    },
    intro: {
      en: 'Event pipelines, rate limits and health tracking with honest failure modes. When a dependency goes down, callers know exactly where they stand. Personal study of the Open Gateway telemetry problem. Not Telefónica code. Not production traffic.',
      es: 'Pipelines de eventos, rate limits y salud de servicios con modos de fallo honestos. Cuando una dependencia se cae, el que llama sabe exactamente dónde está. Estudio personal del problema de telemetría de Open Gateway. No es código de Telefónica. No es tráfico de producción.',
      ca: 'Pipelines d’esdeveniments, rate limits i salut de serveis amb modes de fallada honests. Quan una dependència cau, qui crida sap exactament on és. Estudi personal del problema de telemetria d’Open Gateway. No és codi de Telefónica. No és trànsit de producció.',
    },
    projects: ['kafka-adapter-telemetry', 'redis-toolkit'],
    page: 'telemetry',
  },
  tooling: {
    code: 'F1',
    icon: 'wrench',
    tag: {
      en: 'DELIBERATELY SMALL TOOLS', es: 'HERRAMIENTAS DELIBERADAMENTE PEQUEÑAS', ca: 'EINES DELIBERADAMENT PETITES',
    },
    name: {
      en: 'Tooling & Platform', es: 'Herramientas y Plataforma', ca: 'Eines i Plataforma',
    },
    line: {
      en: 'THE WORKSHOP FLOOR — HARNESSES, CLIS AND DELIBERATELY SMALL TOOLS.',
      es: 'EL TALLER — HARNESSES, CLIS Y HERRAMIENTAS DELIBERADAMENT PEQUEÑAS.',
      ca: 'EL TALLER — HARNESSES, CLIS I EINES DELIBERADAMENT PETITES.',
    },
    intro: {
      en: 'The workshop floor: a multi-agent SDD harness, CLIs that do one thing well, and tooling kept intentionally small. Everything it needs, nothing it doesn’t.',
      es: 'El taller: un harness multi-agente SDD, CLIs que hacen una cosa bien y herramientas deliberadamente pequeñas. Lo que necesita, nada más.',
      ca: 'El taller: un harness multi-agent SDD, CLIs que fan una cosa bé i eines deliberadament petites. El que necessita, res més.',
    },
    projects: ['harness-standard', 'md-mermaid-pdf', 'mcp-transparent-png'],
    page: 'tooling',
  },
  inspections: {
    code: 'Q',
    icon: 'seal',
    tag: {
      en: 'THE QUALITY WALL', es: 'EL MURO DE CALIDAD', ca: 'EL MUR DE QUALITAT',
    },
    name: {
      en: 'Inspections', es: 'Inspección', ca: 'Inspecció',
    },
    line: {
      en: 'THE ITE CERTIFICATE — EVERY SCORE ON THE WALL, DATED AND SIGNED.',
      es: 'EL CERTIFICADO ITE — CADA PUNTUACIÓN EN LA PARED, FECHADA Y FIRMADA.',
      ca: 'EL CERTIFICAT ITE — CADA PUNTUACIÓ AL MUR, DATADA I SIGNADA.',
    },
    intro: {
      en: 'The inspection floor keeps the quality wall: Lighthouse gauges, test counters, bundle weight and dependency census — audited on a schedule, dated, and hung at the entrance as the ITE plaque. Static-first: the certificate shows the last audit, never a broken promise.',
      es: 'La planta de inspección guarda el muro de calidad: indicadores Lighthouse, contadores de tests, peso del bundle y censo de dependencias — auditados por calendario, fechados y colgados en la entrada como la placa ITE. Static-first: el certificado muestra la última auditoría, nunca una promesa rota.',
      ca: 'La planta d’inspecció guarda el mur de qualitat: indicadors Lighthouse, comptadors de tests, pes del bundle i cens de dependències — auditats per calendari, datats i penjats a l’entrada com la placa ITE. Static-first: el certificat mostra l’última auditoria, mai una promesa trencada.',
    },
    projects: [],
    page: 'inspections',
  },
  people: {
    code: 'M',
    icon: 'people',
    tag: {
      en: 'STACK · STANDARDS · RULES', es: 'STACK · ESTÁNDARES · REGLAS', ca: 'STACK · ESTÀNDARDS · REGLES',
    },
    name: {
      en: 'People & Principles', es: 'Personas y Principios', ca: 'Persones i Principis',
    },
    line: {
      en: 'HOW THE WORK GETS DONE — STACK, STANDARDS AND THE WORKING RULES.',
      es: 'CÓMO SE HACE EL TRABAJO — STACK, ESTÁNDARES Y REGLAS DE TRABAJO.',
      ca: 'COM ES FA LA FEINA — STACK, ESTÀNDARDS I REGLES DE TREBALL.',
    },
    intro: {
      en: 'The mezzanine keeps the house rules: SOLID, Clean Code and TDD as daily practice, I/O at the edges, and knowledge that flows across the team.',
      es: 'El entresuelo guarda las reglas de la casa: SOLID, Clean Code y TDD como práctica diaria, I/O en los bordes y conocimiento que fluye por el equipo.',
      ca: 'L’entresòl guarda les regles de la casa: SOLID, Clean Code i TDD com a pràctica diària, I/O a les vores i coneixement que flueix per l’equip.',
    },
    projects: [],
    page: 'people',
  },
  operations: {
    code: 'F0',
    icon: 'ledger',
    tag: {
      en: 'ONE LEDGER, NO REWRITES', es: 'UN HISTORIAL, SIN REESCRITURAS', ca: 'UN HISTORIAL, SENSE REESCRIPTURES',
    },
    name: {
      en: 'Operations', es: 'Operaciones', ca: 'Operacions',
    },
    line: {
      en: 'THE CAREER LEDGER — 2017 TO PRESENT, SAME PAIR OF HANDS.',
      es: 'EL HISTORIAL PROFESIONAL — 2017 HASTA HOY, EL MISMO PAR DE MANOS.',
      ca: 'L’HISTORIAL PROFESSIONAL — 2017 FINS AVUI, EL MATEIX PARELL DE MANS.',
    },
    intro: {
      en: 'The ground floor keeps the record: every engagement since 2017, what shipped, and what it was built with. One ledger, four chapters, zero rewrites.',
      es: 'La planta baja guarda el registro: cada proyecto desde 2017, qué se entregó y con qué se construyó. Un historial, cuatro capítulos, cero reescrituras.',
      ca: 'La planta baixa guarda el registre: cada projecte des del 2017, què es va lliurar i amb què es va construir. Un historial, quatre capítols, zero reescriptures.',
    },
    projects: [],
    page: 'operations',
  },
  frontdesk: {
    code: 'B',
    icon: 'bell',
    tag: {
      en: 'WALK-INS WELCOME', es: 'ENTRADA LIBRE', ca: 'ENTRADA LLIURE',
    },
    name: {
      en: 'Front Desk', es: 'Recepción', ca: 'Recepció',
    },
    line: {
      en: 'WALK-INS WELCOME — ROLES, REPOS OR A SPEC-FIRST ENGAGEMENT.',
      es: 'ENTRADA LIBRE — ROLES, REPOS O UN ENCARGO CON SPEC PRIMERO.',
      ca: 'ENTRADA LLIURE — ROLS, REPOS O UN ENCÀRREC AMB SPEC PRIMER.',
    },
    intro: {
      en: 'The desk takes three things: senior or staff backend roles, short spec-first engagements, and questions about a floor or a repo. Bring the problem in your own words — if it can’t be written down, it doesn’t start.',
      es: 'El mostrador acepta tres cosas: roles backend senior o staff, encargos cortos con spec primero y preguntas sobre una planta o un repo. Trae el problema con tus palabras — si no se puede escribir, no se empieza.',
      ca: 'El mostrador accepta tres coses: rols backend sènior o staff, encàrrecs curts amb spec primer i preguntes sobre una planta o un repo. Porta el problema amb les teves paraules — si no es pot escriure, no comença.',
    },
    projects: [],
    page: 'frontdesk',
  },
};

export const FLOOR_ORDER: readonly DeptKey[] = ['research', 'telemetry', 'tooling', 'inspections', 'people', 'operations', 'frontdesk'];

export const FLOOR_LABELS: Record<DeptKey, L10n<string>> = {
  research: { en: '- PROJECTS', es: '- PROYECTOS', ca: '- PROJECTES' },
  telemetry: { en: '- PROJECTS', es: '- PROYECTOS', ca: '- PROJECTES' },
  tooling: { en: '- PROJECTS', es: '- PROYECTOS', ca: '- PROJECTES' },
  inspections: { en: '- AUDITS', es: '- AUDITORÍAS', ca: '- AUDITORIES' },
  people: { en: '- VALUES', es: '- VALORES', ca: '- VALORS' },
  operations: { en: '- CV WORK', es: '- TRAYECTORIA CV', ca: '- TRAJECTÒRIA CV' },
  frontdesk: { en: '- CONTACT', es: '- CONTACTO', ca: '- CONTACTE' },
};

const P = (slug: string, name: string, year: string, featured: boolean, tier: Tier, dept: DeptKey, stack: readonly string[], github: string, l10n: ProjectL10n): Project =>
  ({ slug, name, year, featured, tier, dept, stack, github, ...l10n });

export const PROJECTS: readonly Project[] = [
  P('codebaserag', 'CodebaseRAG', '2026', true, 'thesis', 'research',
    ['Python 3.13', 'FastAPI', 'pgvector', 'Qdrant', 'Ollama', 'Langfuse', 'mypy strict'],
    'https://github.com/jordimarsal/codebaserag',
    {
      blurb: {
        en: 'Hexagonal RAG over your own codebase — eval-gated in CI.',
        es: 'RAG hexagonal sobre tu propio código — con gate de evals en CI.',
        ca: 'RAG hexagonal sobre el teu codi — amb gate d’evals a CI.',
      },
      summary: {
        en: 'Hexagonal RAG over your own codebase, with a deterministic, eval-first core: ingest, query, and CI-gated retrieval evals.',
        es: 'RAG hexagonal sobre tu propio código, con un núcleo determinista y eval-first: ingest, query y evals de retrieval con gate en CI.',
        ca: 'RAG hexagonal sobre el teu codi, amb un nucli determinista i eval-first: ingest, query i evals de retrieval amb gate a CI.',
      },
      problem: {
        en: 'RAG demos are easy; trustworthy RAG is not. This one pins retrieval quality with a golden Q/A set (≥40 pairs) and fails CI if mean recall@5 drops below its committed baseline.',
        es: 'Las demos de RAG son fáciles; un RAG de confianza, no. Este fija la calidad del retrieval con un set golden de Q/A (≥40 pares) y hace fallar CI si el recall@5 medio cae por debajo de su baseline comprometida.',
        ca: 'Les demos de RAG són fàcils; un RAG de confiança, no. Aquest fixa la qualitat del retrieval amb un set golden de Q/A (≥40 parells) i fa fallar CI si el recall@5 mitjà cau per sota de la seva baseline compromesa.',
      },
      highlights: {
        en: [
          'Eval baseline gate in CI: recall@5 0.409 · MRR 0.231 · nDCG@5 0.277 (committed baseline, ADR-gated overrides).',
          'Ports & adapters: pgvector (default) or Qdrant; Ollama or Anthropic embeddings & LLM; Langfuse observability.',
          'Python 3.13 · Pydantic v2 · typer · FastAPI · ruff · black · mypy --strict.',
        ],
        es: [
          'Gate de baseline de eval en CI: recall@5 0.409 · MRR 0.231 · nDCG@5 0.277 (baseline comprometida, overrides con gate por ADR).',
          'Ports & adapters: pgvector (por defecto) o Qdrant; embeddings y LLM de Ollama o Anthropic; observabilidad con Langfuse.',
          'Python 3.13 · Pydantic v2 · typer · FastAPI · ruff · black · mypy --strict.',
        ],
        ca: [
          'Gate de baseline d’eval a CI: recall@5 0.409 · MRR 0.231 · nDCG@5 0.277 (baseline compromesa, overrides amb gate per ADR).',
          'Ports & adapters: pgvector (per defecte) o Qdrant; embeddings i LLM d’Ollama o Anthropic; observabilitat amb Langfuse.',
          'Python 3.13 · Pydantic v2 · typer · FastAPI · ruff · black · mypy --strict.',
        ],
      },
      metrics: [
        { value: '0.409', label: { en: 'mean recall@5', es: 'recall@5 medio', ca: 'recall@5 mitjà' } },
        { value: '≥40', label: { en: 'golden Q/A pairs', es: 'pares Q/A golden', ca: 'parells Q/A golden' } },
        { value: 'strict', label: { en: 'mypy', es: 'mypy', ca: 'mypy' } },
      ],
    }),
  P('interview-simulator', 'Interview Simulator', '2026', false, 'satellite', 'research',
    ['Whisper', 'Local LLM'],
    'https://github.com/jordimarsal/interview-simulator',
    {
      blurb: {
        en: 'A local LLM interviews you by voice; Whisper takes notes.',
        es: 'Un LLM local te entrevista por voz; Whisper toma notas.',
        ca: 'Un LLM local t’entrevista per veu; Whisper pren notes.',
      },
      summary: {
        en: 'Voice interview simulator: a local LLM plays the interviewer and Whisper handles transcription, so you can rehearse technical interviews fully offline.',
        es: 'Simulador de entrevistas por voz: un LLM local hace de entrevistador y Whisper se encarga de la transcripción, para ensayar entrevistas técnicas completamente offline.',
        ca: 'Simulador d’entrevistes per veu: un LLM local fa d’entrevistador i Whisper se n’encarrega de la transcripció, per assajar entrevistes tècniques completament offline.',
      },
      problem: {
        en: 'Interview practice is awkward with an audience. This one runs fully offline: voice questions, spoken answers and transcription with zero cloud dependency — your awkward answers never leave the premises.',
        es: 'Ensayar con público da vergüenza. Este funciona completamente offline: preguntas por voz, respuestas habladas y transcripción sin ninguna dependencia de la nube — tus respuestas torpes nunca salen del edificio.',
        ca: 'Assajar amb públic fa vergonya. Aquest funciona completament offline: preguntes per veu, respostes parlades i transcripció sense cap dependència del núvol — les teves respostes torpes no surten mai de l’edifici.',
      },
      highlights: {
        en: ['Runs fully offline: voice questions, spoken answers and transcription with zero cloud dependency.'],
        es: ['Funciona completamente offline: preguntas por voz, respuestas habladas y transcripción sin ninguna dependencia de la nube.'],
        ca: ['Funciona completament offline: preguntes per veu, respostes parlades i transcripció sense cap dependència del núvol.'],
      },
      metrics: [
        { value: '0', label: { en: 'cloud calls', es: 'llamadas a la nube', ca: 'crides al núvol' } },
        { value: '100%', label: { en: 'offline', es: 'offline', ca: 'offline' } },
      ],
    }),
  P('bible-text-analysis', 'Bible Text Analysis', '2019', false, 'annex', 'research',
    ['Python', 'NLTK', 'LDA', 'Jupyter'],
    'https://github.com/jordimarsal/bible_text_analysis',
    {
      blurb: {
        en: 'NLP over the Bible: LDA topics and sentiment — my Data Science roots.',
        es: 'NLP sobre la Biblia: temas LDA y sentimiento — mis raíces en Data Science.',
        ca: 'NLP sobre la Bíblia: temes LDA i sentiment — les meves arrels en Data Science.',
      },
      summary: {
        en: 'NLP study on the Bible: web scraping, NLTK processing, LDA topic modeling and sentiment analysis — my Data Science roots.',
        es: 'Estudio de NLP sobre la Biblia: web scraping, procesamiento con NLTK, modelado de temas con LDA y análisis de sentimiento — mis raíces en Data Science.',
        ca: 'Estudi de NLP sobre la Bíblia: web scraping, processament amb NLTK, modelatge de temes amb LDA i anàlisi de sentiment — les meves arrels en Data Science.',
      },
      problem: {
        en: 'A raw corpus of historical text, no labels and no ground truth: an end-to-end exercise in turning unstructured text into defensible topics and sentiment signals.',
        es: 'Un corpus crudo de texto histórico, sin etiquetas ni ground truth: un ejercicio de punta a punta para convertir texto no estructurado en temas defendibles y señales de sentimiento.',
        ca: 'Un corpus cru de text històric, sense etiquetes ni ground truth: un exercici de punta a punta per convertir text no estructurat en temes defensables i senyals de sentiment.',
      },
      highlights: {
        en: ['An end-to-end NLP pipeline over raw text: scraping, NLTK, LDA topics and sentiment analysis in notebooks.'],
        es: ['Un pipeline NLP de punta a punta sobre texto crudo: scraping, NLTK, temas LDA y análisis de sentimiento en notebooks.'],
        ca: ['Un pipeline NLP de punta a punta sobre text cru: scraping, NLTK, temes LDA i anàlisi de sentiment en notebooks.'],
      },
      metrics: [],
    }),
  P('kafka-adapter-telemetry', 'Kafka Adapter Telemetry', '2026', true, 'thesis', 'telemetry',
    ['Java 25', 'Spring Boot 4.1', 'Kafka', 'Oracle', 'Flyway', 'Testcontainers', 'SSE'],
    'https://github.com/jordimarsal/kafka-adapter-telemetry',
    {
      blurb: {
        en: 'Event telemetry for ~90 adapters in 4 countries — live over SSE.',
        es: 'Telemetría por eventos para ~90 adaptadores en 4 países — en vivo vía SSE.',
        ca: 'Telemetria per esdeveniments per a ~90 adaptadors a 4 països — en viu via SSE.',
      },
      summary: {
        en: 'Event-driven adapter telemetry: a Kafka gateway + hub pipeline with idempotent Oracle persistence, per-adapter health tracking, alerting, and a live SSE mission-control dashboard.',
        es: 'Telemetría de adaptadores dirigida por eventos: pipeline Kafka gateway + hub con persistencia idempotente en Oracle, salud por adaptador, alertas y dashboard de misión en vivo vía SSE.',
        ca: 'Telemetria d’adaptadors dirigida per esdeveniments: pipeline Kafka gateway + hub amb persistència idempotent a Oracle, salut per adaptador, alertes i dashboard de missió en viu via SSE.',
      },
      problem: {
        en: 'Fleets of ~90 API adapters across 4 countries need operational visibility: who is DOWN, when did it start, and what already alerted. Built as a personal study of the Open Gateway telemetry problem, end to end.',
        es: 'Una flota de ~90 adaptadores de API en 4 países necesita visibilidad operativa: quién está DOWN, desde cuándo y qué ha alertado ya. Construido como estudio personal del problema de telemetría de Open Gateway, de punta a punta.',
        ca: 'Una flota de ~90 adaptadors d’API a 4 països necessita visibilitat operativa: qui està DOWN, des de quan i què ha alertat ja. Construït com a estudi personal del problema de telemetria d’Open Gateway, de punta a punta.',
      },
      highlights: {
        en: [
          'Hexagonal per service: gateway publishes transit profiles (low/moderate/high/overload), hub persists idempotently by event id.',
          'Alert rule pinned by tests: 3 consecutive DOWN → exactly 1 alert per episode.',
          'DLT with retries absorbs duplicate and corrupted JSON without blocking the lane.',
          'demo.sh proves the whole loop from zero: idempotent counts, single alert, DLT routing.',
          '10/10 tasks delivered with Spec-Driven Development; 3 ADRs; diagrams auto-published to GitHub Pages in CI.',
        ],
        es: [
          'Hexagonal por servicio: el gateway publica perfiles de tránsito (low/moderate/high/overload), el hub persiste de forma idempotente por event id.',
          'Regla de alerta fijada por tests: 3 DOWN consecutivos → exactamente 1 alerta por episodio.',
          'DLT con reintentos absorbe duplicados y JSON corrupto sin bloquear el carril.',
          'demo.sh demuestra el ciclo completo desde cero: recuentos idempotentes, una alerta, enrutado a DLT.',
          '10/10 tareas entregadas con Spec-Driven Development; 3 ADRs; diagramas publicados automáticamente en GitHub Pages por CI.',
        ],
        ca: [
          'Hexagonal per servei: el gateway publica perfils de trànsit (low/moderate/high/overload), el hub persisteix idempotentment per event id.',
          'Regla d’alerta fixada per tests: 3 DOWN consecutius → exactament 1 alerta per episodi.',
          'DLT amb reintents absorbeix duplicats i JSON corrupte sense bloquejar el carril.',
          'demo.sh demostra el cicle complet des de zero: recomptes idempotents, una alerta, encaminament a DLT.',
          '10/10 tasques lliurades amb Spec-Driven Development; 3 ADRs; diagrames publicats automàticament a GitHub Pages per CI.',
        ],
      },
      metrics: [
        { value: '3×DOWN → 1', label: { en: 'alert per episode', es: 'alerta por episodio', ca: 'alerta per episodi' } },
        { value: '100%', label: { en: 'idempotent inserts', es: 'inserciones idempotentes', ca: 'insercions idempotents' } },
        { value: '10/10', label: { en: 'SDD tasks done', es: 'tareas SDD hechas', ca: 'tasques SDD fetes' } },
      ],
    }),
  P('redis-toolkit', 'Redis Toolkit', '2026', true, 'satellite', 'telemetry',
    ['Java', 'Javalin', 'Redis', 'Testcontainers'],
    'https://github.com/jordimarsal/redis-toolkit',
    {
      blurb: {
        en: 'Atomic rate-limiting for LLM gateways, honest failure modes.',
        es: 'Rate-limiting atómico para gateways de LLM, fallos honestos.',
        ca: 'Rate-limiting atòmic per a gateways de LLM, fallades honestes.',
      },
      summary: {
        en: 'Rate-limiting toolkit for LLM gateways: atomic token-bucket quotas, pluggable stores, honest failure modes — with a Javalin gateway demo exposing an OpenAI-style endpoint.',
        es: 'Toolkit de rate-limiting para gateways de LLM: cuotas token-bucket atómicas, stores conectables y modos de fallo honestos — con una demo de gateway en Javalin que expone un endpoint estilo OpenAI.',
        ca: 'Toolkit de rate-limiting per a gateways de LLM: quotes token-bucket atòmiques, stores connectables i modes de fallada honests — amb una demo de gateway en Javalin que exposa un endpoint estil OpenAI.',
      },
      problem: {
        en: 'LLM inference is expensive: unbounded traffic is a DoS on your own wallet. Most limiters race under concurrency or hard-fail when Redis does.',
        es: 'La inferencia de LLM es cara: tráfico sin límites es un DoS a tu propia cartera. La mayoría de limitadores sufren race conditions con concurrencia o fallan en seco cuando lo hace Redis.',
        ca: 'La inferència de LLM és cara: trànsit sense límits és un DoS a la teva cartera. La majoria de limitadors pateixen race conditions amb concurrència o fallen en sec quan ho fa Redis.',
      },
      highlights: {
        en: [
          'Every quota decision computed atomically — never a read-modify-write that slips a token past the limit.',
          'On Redis failure: graceful local fallback + loud metrics, not mass 5xx.',
          'Contract test suite shared by in-memory and Redis implementations, plus concurrency and parity tests.',
          'Standard X-RateLimit-* headers and correct 429 + Retry-After.',
        ],
        es: [
          'Cada decisión de cuota se calcula de forma atómica — nunca un read-modify-write que cuele un token por encima del límite.',
          'Ante fallo de Redis: fallback local elegante + métricas ruidosas, no 5xx masivos.',
          'Suite de tests de contrato compartida por las implementaciones in-memory y Redis, más tests de concurrencia y de paridad.',
          'Cabeceras X-RateLimit-* estándar y 429 + Retry-After correctos.',
        ],
        ca: [
          'Cada decisió de quota es calcula de forma atòmica — mai un read-modify-write que deixi passar un token per sobre del límit.',
          'En cas de fallada de Redis: fallback local elegant + mètriques sorolloses, no 5xx massius.',
          'Suite de tests de contracte compartida per les implementacions in-memory i Redis, a més de tests de concurrència i de paritat.',
          'Capçaleres X-RateLimit-* estàndard i 429 + Retry-After correctes.',
        ],
      },
      metrics: [
        { value: '429', label: { en: '+ Retry-After, always', es: '+ Retry-After, siempre', ca: '+ Retry-After, sempre' } },
        { value: '2', label: { en: 'stores, one contract suite', es: 'stores, una suite de contrato', ca: 'stores, una suite de contracte' } },
      ],
    }),
  P('product-offers', 'Product Offers API', '2023 - 2026', false, 'annex', 'telemetry',
    ['Java 17', 'Spring Boot 3.2', 'H2', 'JUnit 5', 'Mockito'],
    'https://github.com/jordimarsal/product-offers',
    {
      blurb: {
        en: 'Product offers REST API, done the professional way.',
        es: 'API REST de ofertas de producto, hecha de forma profesional.',
        ca: 'API REST d’ofertes de producte, feta de forma professional.',
      },
      summary: {
        en: 'Technical assessment: a product offers REST API — price inquiries by date, product and brand, served with Spring Boot.',
        es: 'Prueba técnica: una API REST de ofertas de producto — consultas de precio por fecha, producto y marca, servida con Spring Boot.',
        ca: 'Prova tècnica: una API REST d’ofertes de producte — consultes de preu per data, producte i marca, servida amb Spring Boot.',
      },
      problem: {
        en: 'Price lookup sounds trivial until the date ranges overlap and two rates apply. The assessment: resolve the applicable offer deterministically, and prove it with tests.',
        es: 'Consultar un precio parece trivial hasta que los rangos de fechas se solapan y aplican dos tarifas. La prueba: resolver la oferta aplicable de forma determinista y demostrarlo con tests.',
        ca: 'Consultar un preu sembla trivial fins que els rangs de dates se solapen i s’apliquen dues tarifes. La prova: resoldre l’oferta aplicable de forma determinista i demostrar-ho amb tests.',
      },
      highlights: {
        en: ['Assessment done the professional way: JUnit 5 + Mockito test suite, JaCoCo coverage and Spotless checks wired into CI.'],
        es: ['La prueba técnica hecha de forma profesional: suite de tests con JUnit 5 + Mockito, cobertura con JaCoCo y comprobaciones Spotless integradas en CI.'],
        ca: ['La prova tècnica feta de forma professional: suite de tests amb JUnit 5 + Mockito, cobertura amb JaCoCo i comprovacions Spotless integrades a CI.'],
      },
      metrics: [],
    }),
  P('harness-standard', 'Harness Standard', '2026', true, 'thesis', 'tooling',
    ['Agents', 'SDD', 'CLI', 'Conventions'],
    'https://github.com/jordimarsal/harness-standard',
    {
      blurb: {
        en: 'Multi-agent SDD harness: specs, roles and gates in one command.',
        es: 'Harness multi-agente SDD: specs, roles y gates en un comando.',
        ca: 'Harness multi-agent SDD: specs, rols i gates en una comanda.',
      },
      summary: {
        en: 'A standardized multi-agent harness for Claude Code and OpenCode: Spec-Driven Development roles (Leader, Spec Author, Implementer, Reviewer) installed into any project with a single command.',
        es: 'Un harness multi-agente estandarizado para Claude Code y OpenCode: roles de Spec-Driven Development (Leader, Spec Author, Implementer, Reviewer) instalados en cualquier proyecto con un solo comando.',
        ca: 'Un harness multi-agent estandarditzat per a Claude Code i OpenCode: rols de Spec-Driven Development (Leader, Spec Author, Implementer, Reviewer) instal·lats a qualsevol projecte amb una sola comanda.',
      },
      problem: {
        en: 'Coding agents work well in the small and drift in the large. Teams need one repeatable process — specs, roles, gates — independent of stack.',
        es: 'Los agentes de código funcionan bien en lo pequeño y se descarrilan en lo grande. Los equipos necesitan un proceso repetible — specs, roles, gates — independiente del stack.',
        ca: 'Els agents de codi funcionen bé en el petit i descarrilen en el gran. Els equips necessiten un procés repetible — specs, rols, gates — independent del stack.',
      },
      highlights: {
        en: [
          '7 stacks covered (Java/Spring, Python, Node/TS, Rust, and more) with per-stack conventions.',
          'Single-command install; conventions template includes SonarQube/code-quality rules.',
          'Born from daily use across personal projects — this portfolio is built with it.',
        ],
        es: [
          '7 stacks cubiertos (Java/Spring, Python, Node/TS, Rust y más) con convenciones por stack.',
          'Instalación con un solo comando; la plantilla de convenciones incluye reglas de SonarQube/calidad de código.',
          'Nacido del uso diario en proyectos personales — este portfolio está construido con él.',
        ],
        ca: [
          '7 stacks coberts (Java/Spring, Python, Node/TS, Rust i més) amb convencions per stack.',
          'Instal·lació amb una sola comanda; la plantilla de convencions inclou regles de SonarQube/qualitat de codi.',
          'Nascut de l’ús diari en projectes personals — aquest portfolio està construït amb ell.',
        ],
      },
      metrics: [
        { value: '7', label: { en: 'stacks', es: 'stacks', ca: 'stacks' } },
        { value: '1 cmd', label: { en: 'install', es: 'instalación', ca: 'instal·lació' } },
      ],
    }),
  P('rustcut', 'Rustcut', '2024 - 2026', false, 'annex', 'tooling',
    ['Rust', 'Actix-web', 'SQLite'],
    'https://github.com/jordimarsal/rustcut',
    {
      blurb: {
        en: 'A URL shortener in Rust, deliberately minimal.',
        es: 'Un acortador de URLs en Rust, deliberadamente mínimo.',
        ca: 'Un escurçador d’URLs en Rust, deliberadament mínim.',
      },
      summary: {
        en: 'Tiny URL shortener in Rust: a deliberately minimalist REST API on Actix-web with SQLite storage.',
        es: 'Acortador de URLs minimalista en Rust: una API REST deliberadamente reducida sobre Actix-web con almacenamiento en SQLite.',
        ca: 'Escurçador d’URLs minimalista en Rust: una API REST deliberadament reduida sobre Actix-web amb emmagatzematge a SQLite.',
      },
      problem: {
        en: 'A complete REST service as a size exercise: one language, one SQLite file, nothing else. The point is what deliberate restraint looks like.',
        es: 'Un servicio REST completo como ejercicio de tamaño: un lenguaje, un fichero SQLite, nada más. La gracia es ver cómo es la contención deliberada.',
        ca: 'Un servei REST complet com a exercici de mida: un llenguatge, un fitxer SQLite, res més. La gràcia és veure com és la contenció deliberada.',
      },
      highlights: {
        en: ['A complete REST service in Rust, kept intentionally small: Actix-web over SQLite, nothing else.'],
        es: ['Un servicio REST completo en Rust, mantenido intencionadamente pequeño: Actix-web sobre SQLite, nada más.'],
        ca: ['Un servei REST complet en Rust, mantingut intencionadament petit: Actix-web sobre SQLite, res més.'],
      },
      metrics: [
        { value: '1', label: { en: 'language', es: 'lenguaje', ca: 'llenguatge' } },
        { value: '1', label: { en: 'SQLite file', es: 'fichero SQLite', ca: 'fitxer SQLite' } },
      ],
    }),
  P('md-mermaid-pdf', 'MD Mermaid PDF', '2025 - 2026', false, 'satellite', 'tooling',
    ['Python', 'Markdown', 'Mermaid', 'GitHub Actions'],
    'https://github.com/jordimarsal/md-mermaid-pdf',
    {
      blurb: {
        en: 'Markdown + Mermaid straight to PDF, TDD all the way.',
        es: 'Markdown + Mermaid directo a PDF, TDD de principio a fin.',
        ca: 'Markdown + Mermaid directe a PDF, TDD de principi a fi.',
      },
      summary: {
        en: 'CLI that renders Markdown with Mermaid diagrams straight to PDF, engineered with TDD, mypy strict and CI.',
        es: 'CLI que renderiza Markdown con diagramas Mermaid directamente a PDF, construida con TDD, mypy strict e integración continua.',
        ca: 'CLI que renderitza Markdown amb diagrames Mermaid directament a PDF, construïda amb TDD, mypy strict i integració contínua.',
      },
      problem: {
        en: 'Docs with diagrams rot when the toolchain is manual. This CLI makes the Markdown→PDF step a one-command, reproducible build — diagrams included.',
        es: 'La documentación con diagramas se pudre cuando la cadena es manual. Este CLI convierte el paso Markdown→PDF en una build de un comando y reproducible — diagramas incluidos.',
        ca: 'La documentació amb diagrames es podre quan la cadena és manual. Aquest CLI converteix el pas Markdown→PDF en una build d’una comanda i reproducible — diagrames inclosos.',
      },
      highlights: {
        en: ['Quality as a feature: full TDD suite, mypy strict typing and CI on every push.'],
        es: ['La calidad como característica: suite completa en TDD, tipado mypy strict e integración continua en cada push.'],
        ca: ['La qualitat com a característica: suite completa amb TDD, tipatge mypy strict i integració contínua a cada push.'],
      },
      metrics: [],
    }),
  P('mcp-transparent-png', 'MCP Transparent PNG', '2026', true, 'satellite', 'tooling',
    ['Python 3.13', 'MCP', 'Pillow', 'GitHub Actions'],
    'https://github.com/jordimarsal/mcp-transparent-png',
    {
      blurb: {
        en: 'MCP server that makes PNG colors transparent.',
        es: 'Servidor MCP que hace transparentes los colores de un PNG.',
        ca: 'Servidor MCP que fa transparents els colors d’un PNG.',
      },
      summary: {
        en: 'MCP (Model Context Protocol) server that makes PNG colors transparent (alpha channel) with rgb/auto/greenscreen modes.',
        es: 'Servidor MCP (Model Context Protocol) que hace transparentes los colores de un PNG (canal alfa) con modos rgb/auto/greenscreen.',
        ca: 'Servidor MCP (Model Context Protocol) que fa transparents els colors d’un PNG (canal alfa) amb modes rgb/auto/greenscreen.',
      },
      problem: {
        en: 'Agents increasingly need real file operations; MCP is the protocol, and small focused tools are the best way to learn it for real.',
        es: 'Los agentes necesitan cada vez más operaciones reales con ficheros; MCP es el protocolo, y las herramientas pequeñas y enfocadas son la mejor manera de aprenderlo de verdad.',
        ca: 'Els agents necessiten cada cop més operacions reals amb fitxers; MCP és el protocol, i les eines petites i enfocades són la millor manera d’aprendre’l de debò.',
      },
      highlights: {
        en: [
          'Implements MCP over stdio in Python 3.13+.',
          'Three transparency modes: exact rgb match, auto dominant-color detection, greenscreen.',
          'GitHub Actions smoke checks on every push.',
        ],
        es: [
          'Implementa MCP sobre stdio en Python 3.13+.',
          'Tres modos de transparencia: coincidencia rgb exacta, detección automática del color dominante, greenscreen.',
          'Smoke checks en GitHub Actions en cada push.',
        ],
        ca: [
          'Implementa MCP sobre stdio en Python 3.13+.',
          'Tres modes de transparència: coincidència rgb exacta, detecció automàtica del color dominant, greenscreen.',
          'Smoke checks a GitHub Actions en cada push.',
        ],
      },
      metrics: [
        { value: '3', label: { en: 'transparency modes', es: 'modos de transparencia', ca: 'modes de transparència' } },
      ],
    }),
  P('spring-boot-casino', 'Spring Boot Casino', '2020 - 2026', false, 'annex', 'tooling',
    ['Java', 'Spring Boot', 'Hexagonal Architecture'],
    'https://github.com/jordimarsal/spring-boot-casino',
    {
      blurb: {
        en: 'Casino betting domain, hexagonal in Spring Boot.',
        es: 'Dominio de apuestas de casino, hexagonal en Spring Boot.',
        ca: 'Domini d’apostes de casino, hexagonal a Spring Boot.',
      },
      summary: {
        en: 'Technical assessment: a casino betting domain modeled in Spring Boot following a hexagonal architecture.',
        es: 'Prueba técnica: un dominio de apuestas de casino modelado en Spring Boot siguiendo una arquitectura hexagonal.',
        ca: 'Prova tècnica: un domini d’apostes de casino modelat en Spring Boot seguint una arquitectura hexagonal.',
      },
      problem: {
        en: 'Betting rules are money-adjacent logic where ambiguity costs real money: the domain had to stay framework-independent and every rule pinned by tests.',
        es: 'Las reglas de apuestas son lógica que toca dinero donde la ambigüedad cuesta dinero real: el dominio tenía que ser independiente del framework y cada regla fijada por tests.',
        ca: 'Les regles d’apostes són lògica que toca diners on l’ambigüitat costa diners reals: el domini havia de ser independent del framework i cada regla fixada per tests.',
      },
      highlights: {
        en: ['Hexagonal by design: the betting domain stays independent of the framework through ports and adapters.'],
        es: ['Hexagonal por diseño: el dominio de apuestas se mantiene independiente del framework mediante puertos y adaptadores.'],
        ca: ['Hexagonal per disseny: el domini d’apostes es manté independent del framework mitjançant ports i adaptadors.'],
      },
      metrics: [],
    }),
];

export const TIER_ORDER: readonly Tier[] = ['thesis', 'satellite', 'annex'];

export const TIER_LABELS: Record<Tier, L10n<string>> = {
  thesis: { en: 'Thesis', es: 'Tesis', ca: 'Tesi' },
  satellite: { en: 'Satellites', es: 'Satélites', ca: 'Satèl·lits' },
  annex: { en: 'Annex — roots, assessments & size exercises', es: 'Anexo — raíces, pruebas y ejercicios de tamaño', ca: 'Annex — arrels, proves i exercicis de mida' },
};

export const tierProjects = (tier: Tier): readonly Project[] => PROJECTS.filter((p) => p.tier === tier);

export const FEATURED: readonly string[] = ['codebaserag', 'kafka-adapter-telemetry', 'harness-standard'];

export const EXPERIENCE: readonly ExperienceEntry[] = [
  {
    period: '2022—NOW',
    company: 'Telefónica Kernel · Open Gateway',
    current: true,
    role: {
      en: 'Backend Engineer — Microservices & Automation',
      es: 'Ingeniero Backend — Microservicios y Automatización',
      ca: 'Enginyer Backend — Microserveis i Automatització',
    },
    points: {
      en: [
        'Design and evolution of REST microservice adapters for Open Gateway.',
        'Author of a 12+ tool Python CLI suite operating ~90 adapters across 4 countries.',
        'Automatic OpenAPI (Swagger v2/v3) code generation and CI-integrated docs & diagrams.',
      ],
      es: [
        'Diseño y evolución de microservicios adaptadores REST para Open Gateway.',
        'Autor de una suite de 12+ herramientas CLI en Python que opera ~90 adaptadores en 4 países.',
        'Generación automática de código OpenAPI (Swagger v2/v3) y documentación y diagramas integrados en CI.',
      ],
      ca: [
        'Disseny i evolució de microserveis adaptadors REST per a Open Gateway.',
        'Autor d’una suite de 12+ eines CLI en Python que opera ~90 adaptadors a 4 països.',
        'Generació automàtica de codi OpenAPI (Swagger v2/v3) i documentació i diagrames integrats a CI.',
      ],
    },
    stack: ['Java', 'Spring Boot', 'Python', 'Kafka', 'CI/CD'],
  },
  {
    period: '2026',
    company: 'Axpe Consulting / Mapfre',
    current: false,
    role: {
      en: 'Software Engineer — API Modernization',
      es: 'Ingeniero de Software — Modernización de APIs',
      ca: 'Enginyer de Software — Modernització d’APIs',
    },
    points: {
      en: [
        'Drove the tech-modernization analysis of 39 corporate APIs to Node.js 24.',
        'Homogenized the stack and reduced technical debt across the API estate.',
        '39 APIs onto one Node.js 24 stack and one pattern — less drift for every team that owns one.',
      ],
      es: [
        'Impulsé el análisis de modernización tecnológica de 39 APIs corporativas a Node.js 24.',
        'Homogeneicé el stack y reduje la deuda técnica del parque de APIs.',
        '39 APIs sobre un único stack Node.js 24 y un solo patrón — menos deriva para cada equipo que posee una.',
      ],
      ca: [
        'Vaig impulsar l’anàlisi de modernització tecnològica de 39 APIs corporatives a Node.js 24.',
        'Vaig homogeneïtzar el stack i reduir el deute tècnic del parc d’APIs.',
        '39 APIs sobre un únic stack Node.js 24 i un sol patró — menys deriva per a cada equip que en posseeix una.',
      ],
    },
    stack: ['Node.js 24', 'TypeScript', 'REST'],
  },
  {
    period: '2020—2022',
    company: 'Zitro Laboratory',
    current: false,
    role: {
      en: 'Java Backend Engineer',
      es: 'Ingeniero Backend Java',
      ca: 'Enginyer Backend Java',
    },
    points: {
      en: [
        'Maintenance and evolution of the Java server of the betting engine, Backoffice and online-casino integrations.',
        'Server-to-server sign-in, AWS Snowflake + Cassandra historicals, OneSignal integration.',
        'Kept the Java betting server live while historicals moved to Snowflake + Cassandra and sign-in went server-to-server.',
      ],
      es: [
        'Mantenimiento y evolución del servidor Java del motor de apuestas, Backoffice e integraciones con casinos online.',
        'Sign-in server-to-server, históricos en AWS Snowflake + Cassandra, integración OneSignal.',
        'Mantuve en vivo el servidor Java de apuestas mientras los históricos pasaban a Snowflake + Cassandra y el sign-in pasaba a server-to-server.',
      ],
      ca: [
        'Manteniment i evolució del servidor Java del motor d’apostes, Backoffice i integracions amb casinos online.',
        'Sign-in server-to-server, històrics a AWS Snowflake + Cassandra, integració OneSignal.',
        'Vaig mantenir en viu el servidor Java d’apostes mentre els històrics passaven a Snowflake + Cassandra i el sign-in passava a server-to-server.',
      ],
    },
    stack: ['Java', 'Spring', 'AWS', 'Cassandra', 'Snowflake'],
  },
  {
    period: '2017—2020',
    company: 'Attendre S.L.',
    current: false,
    role: {
      en: 'Java Backend Developer',
      es: 'Desarrollador Backend Java',
      ca: 'Desenvolupador Backend Java',
    },
    points: {
      en: [
        'Evolution of Attend® (tickets/inventory/projects) and License Manager (Spring Boot 2.3 + REST).',
        'Attend® is still the live product — the tickets/inventory core and the License Manager remain in service.',
      ],
      es: [
        'Evolución de Attend® (tickets/inventario/proyectos) y License Manager (Spring Boot 2.3 + REST).',
        'Attend® sigue siendo el producto vivo — el núcleo de tickets/inventario y el License Manager siguen en servicio.',
      ],
      ca: [
        'Evolució d’Attend® (tickets/inventari/projectes) i License Manager (Spring Boot 2.3 + REST).',
        'Attend® continua sent el producte viu — el nucli de tickets/inventari i el License Manager continuen en servei.',
      ],
    },
    stack: ['Java', 'Spring Boot', 'REST'],
  },
];

export const SKILLS: readonly SkillGroup[] = [
  {
    group: { en: 'Backend', es: 'Backend', ca: 'Backend' },
    items: ['Java 21/25', 'Spring Boot', 'Python 3.13', 'FastAPI', 'Kafka'],
  },
  {
    group: { en: 'Data', es: 'Datos', ca: 'Dades' },
    items: ['Oracle', 'Redis', 'pgvector'],
  },
  {
    group: { en: 'AI', es: 'IA', ca: 'IA' },
    items: ['RAG + evals in CI', 'MCP', 'Ollama / llama.cpp'],
  },
  {
    group: { en: 'Quality', es: 'Calidad', ca: 'Qualitat' },
    items: ['Testcontainers', 'GitHub Actions', 'mypy strict', 'TDD'],
  },
  {
    group: { en: 'Leadership', es: 'Liderazgo', ca: 'Lideratge' },
    items: ['team coordination', 'code review culture', 'mentoring', 'conflict resolution'],
  },
];

export const PRINCIPLES: PrinciplesContent = {
  title: { en: 'House rules', es: 'Reglas de la casa', ca: 'Regles de la casa' },
  items: {
    en: [
      'SOLID, Clean Code and TDD as daily practice.',
      'Tell, Don’t Ask — immutability and semantic types when they model the domain.',
      'I/O at the edges; pure, deterministic logic everywhere else.',
      'Knowledge sharing and mentoring — the team improves together.',
    ],
    es: [
      'SOLID, Clean Code y TDD como práctica diaria.',
      'Tell, Don’t Ask — inmutabilidad y tipos semánticos cuando modelan el dominio.',
      'I/O en los bordes; lógica pura y determinista en el resto.',
      'Compartir conocimiento y mentorizar — el equipo mejora en conjunto.',
    ],
    ca: [
      'SOLID, Clean Code i TDD com a pràctica diària.',
      'Tell, Don’t Ask — immutabilitat i tipus semàntics quan modelen el domini.',
      'I/O a les vores; lògica pura i determinista a la resta.',
      'Compartir coneixement i mentoritzar — l’equip millora plegat.',
    ],
  },
};

export const WORK: WorkContent = {
  head: {
    num: 'P',
    title: { en: 'Projects', es: 'Proyectos', ca: 'Projectes' },
    sub: { en: '11 PROJECTS · 3 TIERS · FILTER BY STACK', es: '11 PROYECTOS · 3 NIVELES · FILTRA POR STACK', ca: '11 PROJECTES · 3 NIVELLS · FILTRA PER STACK' },
  },
  intro: {
    en: 'Eleven projects in three tiers: the thesis, the satellites around it, and an annex for roots, take-home assessments and size exercises. Filter by the stack you care about.',
    es: 'Once proyectos en tres niveles: la tesis, sus satélites y un anexo para raíces, pruebas técnicas y ejercicios de tamaño. Filtra por el stack que te interese.',
    ca: 'Onze projectes en tres nivells: la tesi, els seus satèl·lits i un annex per a arrels, proves tècniques i exercicis de mida. Filtra pel stack que et vagi bé.',
  },
  filterAll: { en: 'All', es: 'Todos', ca: 'Tots' },
  filterSummary: { en: 'FILTER BY STACK ({n})', es: 'FILTRA POR STACK ({n})', ca: 'FILTRA PER STACK ({n})' },
  countLabel: { en: '{n} PROJECTS ON SHOW', es: '{n} PROYECTOS A LA VISTA', ca: '{n} PROJECTES A LA VISTA' },
  countOne: { en: '1 PROJECT ON SHOW', es: '1 PROYECTO A LA VISTA', ca: '1 PROJECTE A LA VISTA' },
  emptyLabel: {
    en: 'NO PROJECTS MATCH THAT COMBINATION — LOOSEN A FILTER',
    es: 'NINGÚN PROYECTO COINCIDE CON ESA COMBINACIÓN — QUITA ALGÚN FILTRO',
    ca: 'CAP PROJECTE COINCIDEIX AMB AQUESTA COMBINACIÓ — TREU ALGUN FILTRE',
  },
};

export const CV: CvContent = {
  head: {
    num: 'CV',
    title: { en: 'The dossier', es: 'El dosier', ca: 'El dossier' },
    sub: { en: 'PRINTED EDITION · TWO LANGUAGES ON THE SHELF', es: 'EDICIÓN IMPRESA · DOS IDIOMAS EN LA BALDA', ca: 'EDICIÓ IMPRESA · DOS IDIOMES A LA PRESTATGERIA' },
  },
  intro: {
    en: 'The short version of the ledger: one engineer, 9+ years of backend, event pipelines and applied AI — for the full story, take the printed edition.',
    es: 'La versión corta del historial: un ingeniero, 9+ años de backend, pipelines de eventos e IA aplicada — para la historia completa, llévate la edición impresa.',
    ca: 'La versió curta de l’historial: un enginyer, 9+ anys de backend, pipelines d’esdeveniments i IA aplicada — per la història completa, emporta’t l’edició impresa.',
  },
  facts: {
    en: [
      { k: 'ROLE', v: 'Senior Backend Engineer — Java · Python · AI/LLM' },
      { k: 'BASE', v: 'Barcelona · remote-friendly' },
      { k: 'SINCE', v: '2017, shipping to production' },
      { k: 'EDUCATION', v: 'MSc Data Science · Computer Engineering' },
      { k: 'LANGUAGES', v: 'English · Español · Català — business in all three' },
    ],
    es: [
      { k: 'ROL', v: 'Ingeniero Backend Senior — Java · Python · IA/LLM' },
      { k: 'BASE', v: 'Barcelona · con opción de remoto' },
      { k: 'DESDE', v: '2017, entregando a producción' },
      { k: 'FORMACIÓN', v: 'Máster en Ciencia de Datos · Ingeniería Informática' },
      { k: 'IDIOMAS', v: 'Inglés · Español · Catalán — negocio en los tres' },
    ],
    ca: [
      { k: 'ROL', v: 'Enginyer Backend Sènior — Java · Python · IA/LLM' },
      { k: 'BASE', v: 'Barcelona · amb opció de remot' },
      { k: 'DES DE', v: '2017, lliurant a producció' },
      { k: 'FORMACIÓ', v: 'Màster en Ciència de Dades · Enginyeria Informàtica' },
      { k: 'IDIOMES', v: 'Anglès · Espanyol · Català — negoci en els tres' },
    ],
  },
  sections: {
    experience: { en: 'Experience', es: 'Experiencia', ca: 'Experiència' },
    skills: { en: 'Skills', es: 'Habilidades', ca: 'Habilitats' },
  },
  buttons: {
    enLabel: 'Download CV — English (PDF)',
    esLabel: 'Descargar CV — Español (PDF)',
    note: {
      en: 'Catalan version on request — just write.',
      es: 'Versión en catalán a petición — solo escríbeme.',
      ca: 'Versió en català a petició — només escriu-me.',
    },
    print: { en: 'Print this page', es: 'Imprimir esta página', ca: 'Imprimeix aquesta pàgina' },
  },
  files: { en: 'Jordi-Marcal-Poy-CV-EN.pdf', es: 'Jordi-Marcal-Poy-CV-ES.pdf' },
};

export const NOTFOUND: NotFoundContent = {
  code: '404',
  title: { en: 'Department not found', es: 'Departamento no encontrado', ca: 'Departament no trobat' },
  body: {
    en: 'This doorway was bricked over years ago — or the URL lost a fight with a refactor. Either way, the building is still open.',
    es: 'Esta puerta se tapió hace años — o la URL perdió una pelea contra un refactor. En cualquier caso, el edificio sigue abierto.',
    ca: 'Aquesta porta es va tapiar fa anys — o la URL va perdre una baralla contra un refactor. En qualsevol cas, l’edifici segueix obert.',
  },
  back: { en: 'Back to the building', es: 'Volver al edificio', ca: 'Torna a l’edifici' },
};

export const FOOTER: FooterContent = {
  tag: { en: 'FRONT DESK', es: 'RECEPCIÓN', ca: 'RECEPCIÓ' },
  headline: {
    en: 'The door is always open.',
    es: 'La puerta siempre está abierta.',
    ca: 'La porta sempre és oberta.',
  },
  line: {
    en: 'Jordimp & Co. is the working name of one engineer — currently inside a telco platform team. Walk-ins: roles, repos, or a short spec-first engagement.',
    es: 'Jordimp & Co. es el nombre de trabajo de un solo ingeniero — ahora dentro de un equipo de plataforma telco. Entrada libre: roles, repos o un encargo corto con spec primero.',
    ca: 'Jordimp & Co. és el nom de feina d’un sol enginyer — ara dins d’un equip de plataforma telco. Entrada lliure: rols, repos o un encàrrec curt amb spec primer.',
  },
  email: { en: 'EMAIL', es: 'EMAIL', ca: 'EMAIL' },
  github: { en: 'GITHUB', es: 'GITHUB', ca: 'GITHUB' },
  linkedin: { en: 'LINKEDIN', es: 'LINKEDIN', ca: 'LINKEDIN' },
  colo1: {
    en: 'JORDIMP & CO. — REGISTERED NOWHERE, SHIPPING EVERYWHERE. ASTRO-BUILT HTML, ZERO TRACKERS.',
    es: 'JORDIMP & CO. — REGISTRADA EN NINGUNA PARTE, ENTREGANDO EN TODAS PARTES. HTML HECHO CON ASTRO, CERO TRACKERS.',
    ca: 'JORDIMP & CO. — REGISTRADA ENLLOC, LLIURANT ARREU. HTML FET AMB ASTRO, ZERO TRACKERS.',
  },
  colo2: {
    en: 'BARCELONA · EN/ES/CA · EST. 2017 · © 2026',
    es: 'BARCELONA · EN/ES/CA · DESDE 2017 · © 2026',
    ca: 'BARCELONA · EN/ES/CA · DES DE 2017 · © 2026',
  },
};

export const ARTICLE: ArticleContent = {
  floor: 'research',
  date: '2026-09-22',
  revision: 'REV A',
  dateLabel: { en: 'FILED', es: 'REGISTRADO', ca: 'REGISTRAT' },
  title: {
    en: 'RAG without an eval gate is a demo.',
    es: 'Un RAG sin puerta de evals es una demo.',
    ca: 'Un RAG sense porta d’evals és una demo.',
  },
  description: {
    en: 'Why CodebaseRAG gates retrieval quality in CI: a public golden set, a committed mean recall@5 floor of 0.409, and honest limits — a floor, not SOTA.',
    es: 'Por qué CodebaseRAG pone un gate de calidad del retrieval en CI: un set golden público, un suelo de recall@5 medio comprometido de 0.409 y límites honestos — un suelo, no SOTA.',
    ca: 'Per què CodebaseRAG posa un gate de qualitat del retrieval a CI: un set golden públic, un sòl de recall@5 mitjà compromès de 0.409 i límits honests — un sòl, no SOTA.',
  },
  lead: {
    en: 'A retrieval system is a promise. The eval gate is what turns the promise into a claim someone else can check — and break the moment it stops being true.',
    es: 'Un sistema de retrieval es una promesa. La puerta de evals es lo que convierte esa promesa en una afirmación que otro puede comprobar — y romper en cuanto deja de ser cierta.',
    ca: 'Un sistema de retrieval és una promesa. La porta d’evals és el que converteix la promesa en una afirmació que algú altre pot comprovar — i trencar tan bon punt deixa de ser certa.',
  },
  relatedBody: {
    en: 'The essay behind CodebaseRAG: why a public golden set and a CI floor of 0.409 matter more than another chatbot demo.',
    es: 'El ensayo detrás de CodebaseRAG: por qué un set golden público y un suelo de 0.409 en CI importan más que otra demo de chatbot.',
    ca: 'L’assaig darrere de CodebaseRAG: per què un set golden públic i un sòl de 0.409 a CI importen més que una altra demo de chatbot.',
  },
  readLabel: { en: 'READ THE ESSAY', es: 'LEE EL ENSAYO', ca: 'LLEGEIX L’ASSAIG' },
  sections: [
    {
      anchor: 'problem',
      heading: {
        en: 'The problem: recall nobody measures',
        es: 'El problema: un recall que nadie mide',
        ca: 'El problema: un recall que ningú mesura',
      },
      body: {
        en: [
          'Most RAG projects ship a demo. You ask a question, the retriever returns five chunks, a model writes a confident paragraph, and everyone nods. Nobody can say whether the right document was in those five chunks — because nobody wrote down what “right” means and nobody measures it. The demo works until a chunking change, a new embedding model or a different vector store quietly moves quality, and the only signal is a vague feeling that answers got worse.',
          'That is the real failure mode: not hallucination as moral panic, but retrieval that degrades with nobody watching. A demo optimises for the happy path in front of an audience; a system optimises for a number it can regress against. The distance between the two is an eval — and CodebaseRAG exists to close it.',
        ],
        es: [
          'La mayoría de proyectos RAG entregan una demo. Preguntas algo, el retriever devuelve cinco fragmentos, un modelo escribe un párrafo con seguridad y todo el mundo asiente. Nadie puede decir si el documento correcto estaba entre esos cinco fragmentos — porque nadie escribió qué significa «correcto» y nadie lo mide. La demo funciona hasta que un cambio de chunking, un nuevo embedding model u otro vector store mueve la calidad en silencio, y la única señal es una vaga sensación de que las respuestas empeoraron.',
          'Ese es el verdadero modo de fallo: no la alucinación como pánico moral, sino un retrieval que se degrada sin que nadie mire. Una demo optimiza el camino feliz delante de una audiencia; un sistema optimiza un número contra el que puede regresar. La distancia entre ambos es una eval — y CodebaseRAG existe para cerrarla.',
        ],
        ca: [
          'La majoria de projectes RAG entreguen una demo. Preguntes una cosa, el retriever retorna cinc fragments, un model escriu un paràgraf amb seguretat i tothom hi està d’acord. Ningú pot dir si el document correcte era entre aquests cinc fragments — perquè ningú va escriure què vol dir «correcte» i ningú ho mesura. La demo funciona fins que un canvi de chunking, un nou embedding model o un altre vector store mou la qualitat en silenci, i l’únic senyal és una vaga sensació que les respostes han empitjorat.',
          'Aquest és el veritable mode de fallada: no l’al·lucinació com a pànic moral, sinó un retrieval que es degrada sense que ningú hi miri. Una demo optimitza el camí feliç davant d’una audiència; un sistema optimitza un número contra el qual pot regressar. La distància entre tots dos és una eval — i CodebaseRAG existeix per tancar-la.',
        ],
      },
    },
    {
      anchor: 'golden-set',
      heading: {
        en: 'The golden set: turning “right” into forty checkable pairs',
        es: 'El set golden: convertir lo «correcto» en cuarenta pares verificables',
        ca: 'El set golden: convertir el «correcte» en quaranta parells verificables',
      },
      body: {
        en: [
          'An eval is only as honest as its questions. The golden set is a public list of question/answer pairs drawn from the repository itself: a question a developer would actually ask, paired with the answer and where it lives. It holds ≥40 pairs — enough to catch a real regression, small enough that every pair can be reviewed by hand and kept honest.',
          'You do not need a labelling platform. You need somewhere to write questions down and the discipline to keep them. They live next to the code, so a retriever change and its updated expectations travel in the same review.',
          'Three entries, paraphrased from the public set, show the shape:',
          'Which abstraction does the query use case depend on, and why is it not a vector-store type? It depends on a retriever port; adapters implement it, so the core never imports a pgvector or Qdrant class.',
          'What should CI do when mean recall@5 drops below the committed floor? Fail the build. The floor is a committed number, and moving it is an explicit, ADR-gated decision — not an edit that makes CI green.',
          'Can the eval run with no network? Yes. Embeddings arrive through a port with two adapters — Ollama locally, Anthropic when hosted — so the same golden set runs offline.',
          'The examples are not meant to be hard. They are meant to have defensible answers, so a wrong one is a failing test rather than a disagreement.',
        ],
        es: [
          'Una eval es tan honesta como sus preguntas. El set golden es una lista pública de pares pregunta/respuesta extraídos del propio repositorio: una pregunta que un desarrollador haría de verdad, emparejada con la respuesta y con dónde vive. Contiene ≥40 pares — suficientes para detectar una regresión real, lo bastante pocos para revisar cada uno a mano y mantenerlos honestos.',
          'No necesitas una plataforma de etiquetado. Necesitas un sitio donde escribir las preguntas y la disciplina de mantenerlas. Viven junto al código, así que un cambio en el retriever y sus expectativas actualizadas viajan en la misma revisión.',
          'Tres entradas, parafraseadas del set público, muestran la forma:',
          '¿De qué abstracción depende el query use case y por qué no es un tipo del vector store? Depende de un port de retriever; los adapters lo implementan, así que el core nunca importa una clase de pgvector o Qdrant.',
          '¿Qué debería hacer CI cuando el recall@5 medio cae por debajo del suelo comprometido? Hacer fallar el build. El suelo es un número comprometido, y moverlo es una decisión explícita con gate por ADR — no una edición que pone CI en verde.',
          '¿Puede la eval ejecutarse sin red? Sí. Los embeddings llegan a través de un port con dos adapters — Ollama en local, Anthropic cuando está alojado — así que el mismo set golden se ejecuta offline.',
          'Los ejemplos no pretenden ser difíciles. Pretenden tener respuestas defendibles, para que una equivocada sea un test que falla y no una discusión.',
        ],
        ca: [
          'Una eval és tan honesta com les seves preguntes. El set golden és una llista pública de parells pregunta/resposta extrets del mateix repositori: una pregunta que un desenvolupador faria de debò, aparellada amb la resposta i amb on viu. Conté ≥40 parells — prou per detectar una regressió real, i prou pocs per revisar-los tots a mà i mantenir-los honests.',
          'No necessites una plataforma d’etiquetatge. Necessites un lloc on escriure les preguntes i la disciplina de mantenir-les. Viuen al costat del codi, així que un canvi al retriever i les seves expectatives actualitzades viatgen a la mateixa revisió.',
          'Tres entrades, parafrasejades del set públic, mostren la forma:',
          'De quina abstracció depèn el query use case i per què no és un tipus del vector store? Depèn d’un port de retriever; els adapters l’implementen, així que el core no importa mai una classe de pgvector o Qdrant.',
          'Què hauria de fer CI quan el recall@5 mitjà cau per sota del sòl compromès? Fer fallar el build. El sòl és un número compromès, i moure’l és una decisió explícita amb gate per ADR — no una edició que posa CI en verd.',
          'Pot l’eval executar-se sense xarxa? Sí. Els embeddings arriben a través d’un port amb dos adapters — Ollama en local, Anthropic quan està allotjat — així que el mateix set golden s’executa offline.',
          'Els exemples no pretenen ser difícils. Pretenen tenir respostes defensables, perquè una d’equivocada sigui un test que falla i no una discussió.',
        ],
      },
    },
    {
      anchor: 'ci-gate',
      heading: {
        en: 'The CI gate: what fails, what does not',
        es: 'La puerta de CI: qué falla y qué no',
        ca: 'La porta de CI: què falla i què no',
      },
      body: {
        en: [
          'A gate is only useful if it fails loudly and predictably. This one measures mean recall@5, mean reciprocal rank and nDCG@5 over the golden set, and fails the build when mean recall@5 drops below the committed baseline of 0.409.',
          'What fails: any change that pushes mean recall@5 under 0.409. That is the entire rule. CI runs the same deterministic eval as a laptop, so a red build points at a retrieval change, not a flaky environment.',
          'What does not fail matters too. A model change that keeps recall@5 at or above the floor passes even when MRR and nDCG@5 move — the gate guards the metric that was committed to, not every number on the dashboard. A refactor that moves code without moving retrieval passes. And the gate does not judge answer fluency: this is a retrieval eval, and pretending it measures generation quality would be the same dishonesty as having no eval at all.',
        ],
        es: [
          'Una puerta solo es útil si falla alto y de forma predecible. Esta mide el recall@5 medio, la mean reciprocal rank y el nDCG@5 sobre el set golden, y hace fallar el build cuando el recall@5 medio cae por debajo de la baseline comprometida de 0.409.',
          'Qué falla: cualquier cambio que empuje el recall@5 medio por debajo de 0.409. Esa es toda la regla. CI ejecuta la misma eval determinista que un portátil, así que un build en rojo apunta a un cambio en el retrieval, no a un entorno inestable.',
          'Qué no falla también importa. Un cambio de modelo que mantiene el recall@5 en el suelo o por encima pasa aunque MRR y nDCG@5 se muevan — la puerta protege la métrica comprometida, no todos los números del panel. Un refactor que mueve código sin mover el retrieval pasa. Y la puerta no juzga la fluidez de las respuestas: esto es una eval de retrieval, y fingir que mide la calidad de generación sería la misma deshonestidad que no tener ninguna eval.',
        ],
        ca: [
          'Una porta només és útil si falla fort i de manera previsible. Aquesta mesura el recall@5 mitjà, la mean reciprocal rank i el nDCG@5 sobre el set golden, i fa fallar el build quan el recall@5 mitjà cau per sota de la baseline compromesa de 0.409.',
          'Què falla: qualsevol canvi que empenyi el recall@5 mitjà per sota de 0.409. Aquesta és tota la regla. CI executa la mateixa eval determinista que un portàtil, així que un build en vermell apunta a un canvi en el retrieval, no a un entorn inestable.',
          'Què no falla també importa. Un canvi de model que manté el recall@5 al sòl o per sobre passa encara que MRR i nDCG@5 es moguin — la porta protegeix la mètrica compromesa, no tots els números del tauler. Un refactor que mou codi sense moure el retrieval passa. I la porta no jutja la fluïdesa de les respostes: això és una eval de retrieval, i fer veure que mesura la qualitat de generació seria la mateixa deshonestedat que no tenir cap eval.',
        ],
      },
    },
    {
      anchor: 'hexagonal',
      heading: {
        en: 'Why hexagonal: swapping Qdrant must not rewrite the core',
        es: 'Por qué hexagonal: cambiar Qdrant no debe reescribir el core',
        ca: 'Per què hexagonal: canviar Qdrant no ha de reescriure el core',
      },
      body: {
        en: [
          'You measure retrieval, so what you measure must not be welded to what you deploy. CodebaseRAG is hexagonal: the query use case depends on ports, and pgvector, Qdrant, Ollama and Anthropic sit behind them as adapters.',
          'The test is concrete. Swapping Qdrant for pgvector — or running fully local on Ollama — must not rewrite the core. If changing a vector store forces edits across the use cases, the eval is measuring an accident of the storage layer, and every future swap re-opens whether the metrics still mean anything.',
          'Keeping the core free of frameworks and transports buys more than tidiness: it keeps the eval deterministic, exercised against in-memory or container-backed adapters with no network required. A committed floor is only trustworthy when the code beneath it does not change shape every time the infrastructure does.',
        ],
        es: [
          'Mides el retrieval, así que lo que mides no puede estar soldado a lo que despliegas. CodebaseRAG es hexagonal: el query use case depende de ports, y pgvector, Qdrant, Ollama y Anthropic se sientan detrás como adapters.',
          'El test es concreto. Cambiar Qdrant por pgvector — o ejecutar totalmente en local con Ollama — no debe reescribir el core. Si cambiar un vector store obliga a editar los use cases, la eval está midiendo un accidente de la capa de almacenamiento, y cada cambio futuro reabre si las métricas siguen significando algo.',
          'Mantener el core libre de frameworks y transportes aporta más que orden: mantiene la eval determinista, ejercitada contra adapters en memoria o respaldados por contenedores sin necesidad de red. Un suelo comprometido solo es fiable cuando el código que hay debajo no cambia de forma cada vez que cambia la infraestructura.',
        ],
        ca: [
          'Mesures el retrieval, així que allò que mesures no pot estar soldat a allò que desplegues. CodebaseRAG és hexagonal: el query use case depèn de ports, i pgvector, Qdrant, Ollama i Anthropic seuen darrere com a adapters.',
          'El test és concret. Canviar Qdrant per pgvector — o executar-ho tot en local amb Ollama — no ha de reescriure el core. Si canviar un vector store obliga a editar els use cases, l’eval està mesurant un accident de la capa d’emmagatzematge, i cada canvi futur reobre si les mètriques encara volen dir alguna cosa.',
          'Mantenir el core lliure de frameworks i transports aporta més que ordre: manté l’eval determinista, exercitada contra adapters en memòria o recolzats per contenidors sense necessitat de xarxa. Un sòl compromès només és fiable quan el codi que hi ha sota no canvia de forma cada vegada que canvia la infraestructura.',
        ],
      },
    },
    {
      anchor: 'baseline',
      heading: {
        en: 'Current baseline and what it does not claim',
        es: 'La baseline actual y lo que no afirma',
        ca: 'La baseline actual i què no afirma',
      },
      body: {
        en: [
          'The committed baseline is a mean recall@5 of 0.409 (MRR 0.231, nDCG@5 0.277) over a golden set of at least forty pairs. Read it as a floor, not a result. 0.409 is not SOTA and this is not a claim that retrieval is solved. It is the number the project committed to defend, chosen low enough to stay stable and high enough to catch a real drop.',
          'What the number does not claim: that the golden set is exhaustive, that a green build means good answers, or that the embedding model is the best available. Raising the floor is a recorded decision with a justification, never a vanity metric pasted into a README.',
          'What it does claim is smaller and more useful: on every change, the repository can tell you whether retrieval got worse, and prove it from a public golden set. That is the line between a RAG demo and a RAG system. A demo shows you an answer; a system lets you disagree with it.',
        ],
        es: [
          'La baseline comprometida es un recall@5 medio de 0.409 (MRR 0.231, nDCG@5 0.277) sobre un set golden de al menos cuarenta pares. Léelo como un suelo, no como un resultado. 0.409 no es SOTA y esto no es una afirmación de que el retrieval esté resuelto. Es el número que el proyecto se comprometió a defender, elegido lo bastante bajo para mantenerse estable y lo bastante alto para detectar una caída real.',
          'Lo que el número no afirma: que el set golden sea exhaustivo, que un build en verde signifique buenas respuestas, o que el embedding model sea el mejor disponible. Subir el suelo es una decisión registrada con una justificación, nunca una métrica de vanidad pegada en un README.',
          'Lo que sí afirma es más pequeño y más útil: en cada cambio, el repositorio puede decirte si el retrieval empeoró, y demostrarlo con un set golden público. Esa es la línea entre una demo RAG y un sistema RAG. Una demo te muestra una respuesta; un sistema te deja discrepar de ella.',
        ],
        ca: [
          'La baseline compromesa és un recall@5 mitjà de 0.409 (MRR 0.231, nDCG@5 0.277) sobre un set golden d’almenys quaranta parells. Llegeix-ho com un sòl, no com un resultat. 0.409 no és SOTA i això no és cap afirmació que el retrieval estigui resolt. És el número que el projecte es va comprometre a defensar, triat prou baix per mantenir-se estable i prou alt per detectar una caiguda real.',
          'Què no afirma el número: que el set golden sigui exhaustiu, que un build en verd signifiqui bones respostes, o que l’embedding model sigui el millor disponible. Apujar el sòl és una decisió registrada amb una justificació, mai una mètrica de vanitat enganxada en un README.',
          'Què afirma, en canvi, és més petit i més útil: a cada canvi, el repositori et pot dir si el retrieval ha empitjorat, i demostrar-ho amb un set golden públic. Aquesta és la línia entre una demo RAG i un sistema RAG. Una demo et mostra una resposta; un sistema et deixa discrepar-ne.',
        ],
      },
    },
  ],
};

export const PAGES: Record<string, PageMeta> = {
  home: {
    route: 'index.html',
    nav: 'home',
    title: {
      en: 'Jordimp & Co. — systems you can audit',
      es: 'Jordimp & Co. — Jordi Marçal Poy, Ingeniero Backend Senior',
      ca: 'Jordimp & Co. — Jordi Marçal Poy, Enginyer Backend Sènior',
    },
    description: {
      en: 'Jordimp & Co. is one engineer: backend systems, event pipelines and applied AI with evals. Specs before code. Est. 2017, Barcelona.',
      es: 'Jordimp & Co. es el nombre de trabajo de un solo ingeniero: sistemas backend, pipelines de eventos e IA aplicada, diseñados, construidos y auditados por el mismo par de manos desde 2017. Ahora, dentro de un equipo de plataforma telco. Entrada libre: roles, repos o un encargo corto con spec primero.',
      ca: 'Jordimp & Co. és el nom de feina d’un sol enginyer: sistemes backend, pipelines d’esdeveniments i IA aplicada, dissenyats, construïts i auditats pel mateix parell de mans des del 2017. Ara, dins d’un equip de plataforma telco. Entrada lliure: rols, repos o un encàrrec curt amb spec primer.',
    },
  },
  work: {
    route: 'work.html',
    nav: 'work',
    title: {
      en: 'Projects — Jordimp & Co.',
      es: 'Proyectos — Jordimp & Co.',
      ca: 'Projectes — Jordimp & Co.',
    },
    description: {
      en: 'Eleven projects in three tiers — thesis, satellites and annex — across backend systems, event pipelines, applied AI and tooling. Filter by the stack you care about.',
      es: 'Once proyectos en tres niveles — tesis, satélites y anexo — entre sistemas backend, pipelines de eventos, IA aplicada y herramientas. Filtra por el stack que te interese.',
      ca: 'Onze projectes en tres nivells — tesi, satèl·lits i annex — entre sistemes backend, pipelines d’esdeveniments, IA aplicada i eines. Filtra pel stack que et vagi bé.',
    },
  },
  cv: {
    route: 'cv.html',
    nav: 'cv',
    title: {
      en: 'CV — Jordimp & Co.',
      es: 'CV — Jordimp & Co.',
      ca: 'CV — Jordimp & Co.',
    },
    description: {
      en: 'The printed dossier: 9+ years of backend engineering, event pipelines and applied AI. Download the PDF in English or Spanish.',
      es: 'El dosier impreso: 9+ años de ingeniería backend, pipelines de eventos e IA aplicada. Descarga el PDF en inglés o español.',
      ca: 'El dossier imprès: 9+ anys d’enginyeria backend, pipelines d’esdeveniments i IA aplicada. Descarrega el PDF en anglès o espanyol.',
    },
  },
  'article-rag-eval-gate': {
    route: 'writing/rag-eval-gate.html',
    nav: 'departments',
    title: {
      en: `${ARTICLE.title.en} — Jordimp & Co.`,
      es: `${ARTICLE.title.es} — Jordimp & Co.`,
      ca: `${ARTICLE.title.ca} — Jordimp & Co.`,
    },
    description: ARTICLE.description,
  },
  research: {
    route: 'departments/research.html',
    nav: 'departments',
    title: {
      en: 'F3 · Research & Retrieval — Jordimp & Co.',
      es: 'F3 · Investigación y Recuperación — Jordimp & Co.',
      ca: 'F3 · Recerca i Recuperació — Jordimp & Co.',
    },
    description: {
      en: 'Applied AI shipped like infrastructure: CodebaseRAG, with the offline Interview Simulator as its satellite — retrieval with receipts.',
      es: 'IA aplicada entregada como infraestructura: CodebaseRAG, con el Interview Simulator offline como satélite — recuperación con recibos.',
      ca: 'IA aplicada lliurada com a infraestructura: CodebaseRAG, amb l’Interview Simulator offline com a satèl·lit — recuperació amb rebuts.',
    },
  },
  telemetry: {
    route: 'departments/telemetry.html',
    nav: 'departments',
    title: {
      en: 'F2 · Transport & Telemetry — Jordimp & Co.',
      es: 'F2 · Transporte y Telemetría — Jordimp & Co.',
      ca: 'F2 · Transport i Telemetria — Jordimp & Co.',
    },
    description: {
      en: 'The plumbing that must not lie: kafka-adapter-telemetry and redis-toolkit — event pipelines, atomic rate limits and honest failure modes.',
      es: 'La tubería que no puede mentir: kafka-adapter-telemetry y redis-toolkit — pipelines de eventos, rate limits atómicos y modos de fallo honestos.',
      ca: 'La tuberia que no pot mentir: kafka-adapter-telemetry i redis-toolkit — pipelines d’esdeveniments, rate limits atòmics i modes de fallada honests.',
    },
  },
  tooling: {
    route: 'departments/tooling.html',
    nav: 'departments',
    title: {
      en: 'F1 · Tooling & Platform — Jordimp & Co.',
      es: 'F1 · Herramientas y Plataforma — Jordimp & Co.',
      ca: 'F1 · Eines i Plataforma — Jordimp & Co.',
    },
    description: {
      en: 'The workshop floor: harness-standard, md-mermaid-pdf and mcp-transparent-png — deliberately small tools, production standards.',
      es: 'El taller: harness-standard, md-mermaid-pdf y mcp-transparent-png — herramientas deliberadamente pequeñas, estándares de producción.',
      ca: 'El taller: harness-standard, md-mermaid-pdf i mcp-transparent-png — eines deliberadament petites, estàndards de producció.',
    },
  },
  operations: {
    route: 'departments/operations.html',
    nav: 'departments',
    title: {
      en: 'F0 · Operations — Jordimp & Co.',
      es: 'F0 · Operaciones — Jordimp & Co.',
      ca: 'F0 · Operacions — Jordimp & Co.',
    },
    description: {
      en: 'The career as a shift log: every engagement since 2017, what shipped and what it was built with. One ledger, four chapters, zero rewrites.',
      es: 'La carrera como registro de turnos: cada proyecto desde 2017, qué se entregó y con qué se construyó. Un historial, cuatro capítulos, cero reescrituras.',
      ca: 'La carrera com a registre de torns: cada projecte des del 2017, què es va lliurar i amb què es va construir. Un historial, quatre capítols, zero reescriptures.',
    },
  },
  people: {
    route: 'departments/people.html',
    nav: 'departments',
    title: {
      en: 'M · People & Principles — Jordimp & Co.',
      es: 'M · Personas y Principios — Jordimp & Co.',
      ca: 'M · Persones i Principis — Jordimp & Co.',
    },
    description: {
      en: 'The mezzanine: five skill groups, the house rules as numbered statements, and a flat org chart — every role reports to the same pair of hands.',
      es: 'El entresuelo: cinco grupos de habilidades, las reglas de la casa como declaraciones numeradas y un organigrama plano — todos los roles reportan al mismo par de manos.',
      ca: 'L’entresòl: cinc grups d’habilitats, les regles de la casa com a declaracions numerades i un organigrama pla — tots els rols reporten al mateix parell de mans.',
    },
  },
  frontdesk: {
    route: 'departments/front-desk.html',
    nav: 'departments',
    title: {
      en: 'B · Front Desk — Jordimp & Co.',
      es: 'B · Recepción — Jordimp & Co.',
      ca: 'B · Recepció — Jordimp & Co.',
    },
    description: {
      en: 'Walk-ins welcome: senior or staff backend roles, short spec-first engagements, and questions about a floor or a repo — no tracking, no funnel. Jordimp & Co. is how the work is done, not a staffing firm.',
      es: 'Entrada libre: roles backend senior o staff, encargos cortos con spec primero y preguntas sobre una planta o un repo — sin tracking, sin funnel. Jordimp & Co. es como se hace el trabajo, no una consultora de personal.',
      ca: 'Entrada lliure: rols backend sènior o staff, encàrrecs curts amb spec primer i preguntes sobre una planta o un repo — sense tracking, sense funnel. Jordimp & Co. és com es fa la feina, no una consultora de personal.',
    },
  },
  inspections: {
    route: 'departments/inspections.html',
    nav: 'departments',
    title: {
      en: 'Q · Inspections — Jordimp & Co.',
      es: 'Q · Inspección — Jordimp & Co.',
      ca: 'Q · Inspecció — Jordimp & Co.',
    },
    description: {
      en: 'The quality wall: Lighthouse gauges, test counters, bundle size and dependency census from the last audit — the building’s ITE certificate, refreshed weekly.',
      es: 'El muro de calidad: indicadores Lighthouse, contadores de tests, peso del bundle y censo de dependencias de la última auditoría — el certificado ITE del edificio, renovado cada semana.',
      ca: 'El mur de qualitat: indicadors Lighthouse, comptadors de tests, pes del bundle i cens de dependències de l’última auditoria — el certificat ITE de l’edifici, renovat cada setmana.',
    },
  },
};

export const RESEARCH_PAGE: ResearchPageContent = {
  floor: 'research',
  breadcrumb: {
    en: ['Home', 'Departments', 'Research & Retrieval'],
    es: ['Inicio', 'Departamentos', 'Investigación y Recuperación'],
    ca: ['Inici', 'Departaments', 'Recerca i Recuperació'],
  },
  stats: {
    en: [
      { value: '2', label: 'PROJECTS ON THIS FLOOR' },
      { value: '≥40', label: 'GOLDEN Q/A PAIRS' },
      { value: '0.409', label: 'MEAN RECALL@5' },
    ],
    es: [
      { value: '2', label: 'PROYECTOS EN ESTA PLANTA' },
      { value: '≥40', label: 'PARES Q/A GOLDEN' },
      { value: '0.409', label: 'RECALL@5 MEDIO' },
    ],
    ca: [
      { value: '2', label: 'PROJECTES EN AQUESTA PLANTA' },
      { value: '≥40', label: 'PARELLS Q/A GOLDEN' },
      { value: '0.409', label: 'RECALL@5 MITJÀ' },
    ],
  },
  problemLabel: { en: 'The problem', es: 'El problema', ca: 'El problema' },
  highlightsLabel: { en: 'Highlights', es: 'Puntos clave', ca: 'Punts clau' },
  metricsLabel: { en: 'Metrics', es: 'Métricas', ca: 'Mètriques' },
  stackLabel: { en: 'Stack', es: 'Stack', ca: 'Stack' },
};

export const BREADCRUMB_HOME: L10n<string> = { en: 'Home', es: 'Inicio', ca: 'Inici' };
export const BREADCRUMB_DEPTS: L10n<string> = { en: 'Departments', es: 'Departamentos', ca: 'Departaments' };

export const PAGE_LABELS: PageLabels = {
  problem: { en: 'The problem', es: 'El problema', ca: 'El problema' },
  highlights: { en: 'Highlights', es: 'Puntos clave', ca: 'Punts clau' },
  stack: { en: 'Stack', es: 'Stack', ca: 'Stack' },
  caseFile: { en: 'CASE FILE →', es: 'EXPEDIENTE →', ca: 'EXPEDIENT →' },
};

export const CASE_UI: CaseUiStrings = {
  brief: { en: 'The brief', es: 'El encargo', ca: 'L’encàrrec' },
  built: { en: 'What was built', es: 'Qué se construyó', ca: 'Què es va construir' },
  metrics: { en: 'Metrics', es: 'Métricas', ca: 'Mètriques' },
  fieldNotes: { en: 'Field notes', es: 'Notas de campo', ca: 'Notes de camp' },
  stack: { en: 'STACK', es: 'STACK', ca: 'STACK' },
  visitRepo: { en: 'VISIT THE REPO', es: 'VISITA EL REPO', ca: 'VISITA EL REPO' },
  onRequest: { en: 'SOURCE AVAILABLE ON REQUEST', es: 'CÓDIGO DISPONIBLE BAJO PETICIÓN', ca: 'CODI DISPONIBLE A PETICIÓ' },
  backDept: { en: 'Back to {dept}', es: 'Volver a {dept}', ca: 'Tornar a {dept}' },
  prev: { en: '← PREV', es: '← ANT.', ca: '← ANT.' },
  next: { en: 'NEXT →', es: 'SIG. →', ca: 'SEG. →' },
  pagerLabel: { en: 'More projects on this floor', es: 'Más proyectos de esta planta', ca: 'Més projectes d’aquesta planta' },
};

// Case-page build logs. Rich highlight lists fall through to p.highlights;
// these entries expand the thin ones with honest architecture detail only.
export const CASE_BUILD: Record<string, CaseBuildStep> = {
  'interview-simulator': {
    en: [
      'A local LLM plays the interviewer — the questions come from a model running on your machine, not from an API.',
      'Whisper handles transcription: your spoken answers come back as text, processed locally.',
      'The whole loop is offline: voice in, transcript out, zero cloud dependency.',
    ],
    es: [
      'Un LLM local hace de entrevistador — las preguntas salen de un modelo que corre en tu máquina, no de una API.',
      'Whisper se encarga de la transcripción: tus respuestas habladas vuelven como texto, procesadas en local.',
      'El ciclo completo es offline: entra voz, sale transcripción, cero dependencia de la nube.',
    ],
    ca: [
      'Un LLM local fa d’entrevistador — les preguntes surten d’un model que corre a la teva màquina, no d’una API.',
      'Whisper se n’encarrega de la transcripció: les teves respostes parlades tornen com a text, processades en local.',
      'El cicle complet és offline: entra veu, surt transcripció, zero dependència del núvol.',
    ],
  },
  'bible-text-analysis': {
    en: [
      'Web scraping collects the raw corpus: historical text with no labels and no ground truth.',
      'NLTK processes the text; LDA models it into defensible topics.',
      'Sentiment analysis runs on top — the whole study lives in Jupyter notebooks.',
    ],
    es: [
      'El web scraping reúne el corpus crudo: texto histórico sin etiquetas ni ground truth.',
      'NLTK procesa el texto; LDA lo modela en temas defendibles.',
      'El análisis de sentimiento corre por encima — todo el estudio vive en notebooks de Jupyter.',
    ],
    ca: [
      'El web scraping reuneix el corpus cru: text històric sense etiquetes ni ground truth.',
      'NLTK processa el text; LDA el modela en temes defensables.',
      'L’anàlisi de sentiment corre per sobre — tot l’estudi viu en notebooks de Jupyter.',
    ],
  },
  'product-offers': {
    en: [
      'Price inquiries by date, product and brand — the classic assessment brief, served with Spring Boot 3.2.',
      'The hard part handled head-on: overlapping rate date-ranges, resolved deterministically.',
      'Professional guardrails: JUnit 5 + Mockito suite, JaCoCo coverage and Spotless checks in CI, H2 underneath.',
    ],
    es: [
      'Consultas de precio por fecha, producto y marca — el brief clásico de prueba técnica, servido con Spring Boot 3.2.',
      'La parte difícil, de frente: rangos de fechas de tarifas que se solapan, resueltos de forma determinista.',
      'Barandillas profesionales: suite JUnit 5 + Mockito, cobertura JaCoCo y Spotless en CI, H2 por debajo.',
    ],
    ca: [
      'Consultes de preu per data, producte i marca — el brief clàssic de prova tècnica, servit amb Spring Boot 3.2.',
      'La part delicada, de front: rangs de dates de tarifes que se solapen, resolts de forma determinista.',
      'Baranes professionals: suite JUnit 5 + Mockito, cobertura JaCoCo i Spotless a CI, H2 per sota.',
    ],
  },
  rustcut: {
    en: [
      'A REST API on Actix-web: shorten URLs, redirect, nothing else on the surface.',
      'SQLite storage — the whole service state is one file you can back up with cp.',
      'Deliberate restraint as the feature: one language (Rust), one file, no queue, no cache, no dashboard.',
    ],
    es: [
      'Una API REST sobre Actix-web: acortar URLs y redirigir; nada más en la superficie.',
      'Almacenamiento en SQLite — todo el estado del servicio es un fichero que puedes copiar con cp.',
      'La contención deliberada como característica: un lenguaje (Rust), un fichero, sin colas, sin caché, sin dashboard.',
    ],
    ca: [
      'Una API REST sobre Actix-web: escurçar URLs i redirigir; res més a la superfície.',
      'Emmagatzematge a SQLite — tot l’estat del servei és un fitxer que pots copiar amb cp.',
      'La contenció deliberada com a característica: un llenguatge (Rust), un fitxer, sense cues, sense caché, sense dashboard.',
    ],
  },
  'md-mermaid-pdf': {
    en: [
      'Markdown in, PDF out: one command renders the document and its Mermaid diagrams.',
      'Engineered with TDD: the test suite came before the renderer.',
      'mypy strict typing and GitHub Actions CI keep every push honest.',
    ],
    es: [
      'Entra Markdown, sale PDF: un comando renderiza el documento y sus diagramas Mermaid.',
      'Construido con TDD: la suite de tests llegó antes que el renderer.',
      'Tipado mypy strict y CI en GitHub Actions mantienen honesto cada push.',
    ],
    ca: [
      'Entra Markdown, surt PDF: una comanda renderitza el document i els seus diagrames Mermaid.',
      'Construït amb TDD: la suite de tests va arribar abans que el renderer.',
      'Tipatge mypy strict i CI a GitHub Actions mantenen honest cada push.',
    ],
  },
  'spring-boot-casino': {
    en: [
      'A casino betting domain modeled on its own terms: the rules of the game first, the framework second.',
      'Hexagonal by design: ports and adapters keep Spring outside the domain.',
      'Every betting rule pinned by tests — ambiguity in money-adjacent logic costs real money.',
    ],
    es: [
      'Un dominio de apuestas de casino modelado en sus propios términos: primero las reglas del juego, el framework después.',
      'Hexagonal por diseño: puertos y adaptadores mantienen Spring fuera del dominio.',
      'Cada regla de apuestas fijada por tests — la ambigüedad en lógica que toca dinero cuesta dinero real.',
    ],
    ca: [
      'Un domini d’apostes de casino modelat en els seus propis termes: primer les regles del joc, el framework després.',
      'Hexagonal per disseny: ports i adaptadors mantenen Spring fora del domini.',
      'Cada regla d’apostes fixada per tests — l’ambigüitat en lògica que toca diners costa diners reals.',
    ],
  },
};

// Honest field notes for projects that ship no metrics — facts, never invented numbers.
export const CASE_NOTES: Record<string, L10n<readonly KVEntry[]>> = {
  'bible-text-analysis': {
    en: [
      { k: 'SOURCE', v: 'Raw historical text scraped from the web — no labels, no ground truth.' },
      { k: 'METHOD', v: 'NLTK preprocessing → LDA topic modeling → sentiment analysis, in Jupyter notebooks.' },
      { k: 'PROVENANCE', v: '2019 — the earliest exhibit on this floor, and the Data Science roots.' },
    ],
    es: [
      { k: 'FUENTE', v: 'Texto histórico crudo scrapeado de la web — sin etiquetas ni ground truth.' },
      { k: 'MÉTODO', v: 'Preprocesado con NLTK → modelado de temas LDA → análisis de sentimiento, en notebooks de Jupyter.' },
      { k: 'PROCEDENCIA', v: '2019 — la pieza más antigua de esta planta, y las raíces de Data Science.' },
    ],
    ca: [
      { k: 'FONTS', v: 'Text històric cru raspellat del web — sense etiquetes ni ground truth.' },
      { k: 'MÈTODE', v: 'Preprocessat amb NLTK → modelatge de temes LDA → anàlisi de sentiment, en notebooks de Jupyter.' },
      { k: 'PROCEDÈNCIA', v: '2019 — la peça més antiga d’aquesta planta, i les arrels de Data Science.' },
    ],
  },
  'product-offers': {
    en: [
      { k: 'THE HARD PART', v: 'Overlapping rate date-ranges — the applicable offer must resolve deterministically.' },
      { k: 'PROOF', v: 'JUnit 5 + Mockito suite, JaCoCo coverage and Spotless checks wired into CI.' },
      { k: 'SCOPE', v: 'Spring Boot 3.2 over H2 — assessment-sized on purpose, production standards.' },
    ],
    es: [
      { k: 'LA PARTE DIFÍCIL', v: 'Rangos de fechas de tarifas que se solapan — la oferta aplicable debe resolverse de forma determinista.' },
      { k: 'PRUEBA', v: 'Suite con JUnit 5 + Mockito, cobertura JaCoCo y comprobaciones Spotless integradas en CI.' },
      { k: 'ALCANCE', v: 'Spring Boot 3.2 sobre H2 — del tamaño de una prueba técnica, con estándares de producción.' },
    ],
    ca: [
      { k: 'LA PART DELICADA', v: 'Rangs de dates de tarifes que se solapen — l’oferta aplicable s’ha de resoldre de forma determinista.' },
      { k: 'PROVA', v: 'Suite amb JUnit 5 + Mockito, cobertura JaCoCo i comprovacions Spotless integrades a CI.' },
      { k: 'ABAST', v: 'Spring Boot 3.2 sobre H2 — de la mida d’una prova tècnica, amb estàndards de producció.' },
    ],
  },
  'md-mermaid-pdf': {
    en: [
      { k: 'ONE COMMAND', v: 'Markdown in — PDF out, with the Mermaid diagrams rendered and embedded.' },
      { k: 'QUALITY', v: 'A feature, not an afterthought: full TDD suite and mypy strict typing.' },
      { k: 'SHIPS WITH', v: 'GitHub Actions CI on every push.' },
    ],
    es: [
      { k: 'UN COMANDO', v: 'Entra Markdown — sale PDF, con los diagramas Mermaid renderizados e incrustados.' },
      { k: 'CALIDAD', v: 'Una característica, no un extra: suite completa en TDD y tipado mypy strict.' },
      { k: 'SE ENTREGA CON', v: 'CI en GitHub Actions en cada push.' },
    ],
    ca: [
      { k: 'UNA COMANDA', v: 'Entra Markdown — surt PDF, amb els diagrames Mermaid renderitzats i incrustats.' },
      { k: 'QUALITAT', v: 'Una característica, no un extra: suite completa amb TDD i tipatge mypy strict.' },
      { k: 'ES LLIURA AMB', v: 'CI a GitHub Actions a cada push.' },
    ],
  },
  'spring-boot-casino': {
    en: [
      { k: 'THE DOMAIN', v: 'A casino betting core where ambiguous rules cost real money.' },
      { k: 'THE SHAPE', v: 'Hexagonal — the domain stays independent of Spring through ports and adapters.' },
      { k: 'THE CONTRACT', v: 'Every betting rule pinned by tests.' },
    ],
    es: [
      { k: 'EL DOMINIO', v: 'Un núcleo de apuestas de casino donde las reglas ambiguas cuestan dinero real.' },
      { k: 'LA FORMA', v: 'Hexagonal — el dominio se mantiene independiente de Spring mediante puertos y adaptadores.' },
      { k: 'EL CONTRATO', v: 'Cada regla de apuestas fijada por tests.' },
    ],
    ca: [
      { k: 'EL DOMINI', v: 'Un nucli d’apostes de casino on les regles ambigües costen diners reals.' },
      { k: 'LA FORMA', v: 'Hexagonal — el domini es manté independent de Spring mitjançant ports i adaptadors.' },
      { k: 'EL CONTRACTE', v: 'Cada regla d’apostes fixada per tests.' },
    ],
  },
};

// Register one PAGES entry per project so routes, hreflang and sitemap derive.
for (const p of PROJECTS) {
  const d = DEPTS[p.dept];
  PAGES[`project-${p.slug}`] = {
    route: `projects/${p.slug}.html`,
    nav: 'departments',
    title: {
      en: `${p.name} — ${d.name.en} — Jordimp & Co.`,
      es: `${p.name} — ${d.name.es} — Jordimp & Co.`,
      ca: `${p.name} — ${d.name.ca} — Jordimp & Co.`,
    },
    description: { en: p.summary.en, es: p.summary.es, ca: p.summary.ca },
  };
}

export const TELEMETRY_PAGE: TelemetryPageContent = {
  stats: {
    en: [
      { value: '~90', label: 'ADAPTERS ON THE WATCHLIST' },
      { value: '4', label: 'COUNTRIES REPORTING' },
      { value: '3×DOWN → 1', label: 'ALERT PER EPISODE, PINNED BY TESTS' },
      { value: '100%', label: 'IDEMPOTENT INSERTS AT THE HUB' },
    ],
    es: [
      { value: '~90', label: 'ADAPTADORES EN LA LISTA DE VIGILANCIA' },
      { value: '4', label: 'PAÍSES QUE REPORTAN' },
      { value: '3×DOWN → 1', label: 'ALERTA POR EPISODIO, FIJADA POR TESTS' },
      { value: '100%', label: 'INSERCIONES IDEMPOTENTES EN EL HUB' },
    ],
    ca: [
      { value: '~90', label: 'ADAPTADORS EN LA LLISTA DE VIGILÀNCIA' },
      { value: '4', label: 'PAÏSOS QUE REPORTEN' },
      { value: '3×DOWN → 1', label: 'ALERTA PER EPISODI, FIXADA PER TESTS' },
      { value: '100%', label: 'INSERCIONS IDEMPOTENTS AL HUB' },
    ],
  },
  diagramTitle: { en: 'System diagrams', es: 'Diagramas del sistema', ca: 'Diagrames del sistema' },
  kafkaCaption: {
    en: 'FIG. 1 — KAFKA PIPELINE: gateway → Kafka → hub → Oracle, with a live SSE dashboard tapped off the hub.',
    es: 'FIG. 1 — PIPELINE KAFKA: gateway → Kafka → hub → Oracle, con un dashboard SSE en vivo conectado al hub.',
    ca: 'FIG. 1 — PIPELINE KAFKA: gateway → Kafka → hub → Oracle, amb un dashboard SSE en viu connectat al hub.',
  },
  redisCaption: {
    en: 'FIG. 2 — TOKEN BUCKET: every quota decision is one atomic operation; if Redis falls over, the local fallback answers.',
    es: 'FIG. 2 — TOKEN BUCKET: cada decisión de cuota es una operación atómica; si Redis se cae, responde el fallback local.',
    ca: 'FIG. 2 — TOKEN BUCKET: cada decisió de quota és una operació atòmica; si Redis cau, respon el fallback local.',
  },
  workTitle: { en: 'The floor’s work', es: 'El trabajo de la planta', ca: 'La feina de la planta' },
  oncallTitle: { en: 'On-call note', es: 'Nota de guardia', ca: 'Nota de guàrdia' },
  oncallBody: {
    en: 'The alert rule is pinned by tests: three consecutive DOWN events fire exactly one alert per episode — no pager storms, no silent gaps. The DLT lane with retries absorbs duplicated or corrupted payloads, so a misbehaving producer never blocks the pipeline. And if the dashboard goes quiet, treat it as a signal: silence is telemetry too.',
    es: 'La regla de alerta está fijada por tests: tres eventos DOWN consecutivos disparan exactamente una alerta por episodio — sin tormentas de pager y sin huecos silenciosos. El carril DLT con reintentos absorbe payloads duplicados o corruptos, así que un productor descontrolado nunca bloquea el pipeline. Y si el dashboard se queda en silencio, tómalo como una señal: el silencio también es telemetría.',
    ca: 'La regla d’alerta està fixada per tests: tres esdeveniments DOWN consecutius disparen exactament una alerta per episodi — sense tempestes de pager ni forats silenciosos. El carril DLT amb reintents absorbeix payloads duplicats o corruptes, així que un productor descontrolat no bloqueja mai el pipeline. I si el dashboard es queda en silenci, pren-ho com un senyal: el silenci també és telemetria.',
  },
};

export const TOOLING_PAGE: ToolingPageContent = {
  stats: {
    en: [
      { value: '3', label: 'PROJECTS ON THIS FLOOR' },
      { value: '7', label: 'STACKS COVERED BY THE HARNESS' },
      { value: '1', label: 'COMMAND INSTALLS THE HARNESS' },
    ],
    es: [
      { value: '3', label: 'PROYECTOS EN ESTA PLANTA' },
      { value: '7', label: 'STACKS CUBIERTOS POR EL HARNESS' },
      { value: '1', label: 'COMANDO INSTALA EL HARNESS' },
    ],
    ca: [
      { value: '3', label: 'PROJECTES EN AQUESTA PLANTA' },
      { value: '7', label: 'STACKS COBERTS PEL HARNESS' },
      { value: '1', label: 'COMANDA INSTAL·LA EL HARNESS' },
    ],
  },
  workTitle: { en: 'The workshop bench', es: 'La mesa del taller', ca: 'La taula del taller' },
  noteTitle: { en: 'Workshop rule', es: 'Regla del taller', ca: 'Regla del taller' },
  noteBody: {
    en: 'Every tool on this floor does one thing and gets out of the way. The harness standardizes the process, not your code; each CLI automates exactly one boring step. Small is a feature.',
    es: 'Cada herramienta de esta planta hace una sola cosa y no se mete. El harness estandariza el proceso, no tu código; cada CLI automatiza exactamente un paso aburrido. Pequeño es una característica.',
    ca: 'Cada eina d’aquesta planta fa una sola cosa i no s’entremet. El harness estandarditza el procés, no el teu codi; cada CLI automatitza exactament un pas avorrit. Petit és una característica.',
  },
};

export const OPERATIONS_PAGE: OperationsPageContent = {
  shiftLogTitle: { en: 'The shift log', es: 'El registro de turnos', ca: 'El registre de torns' },
  onShift: { en: 'ON SHIFT', es: 'EN TURNO', ca: 'EN TORN' },
  coverageTitle: { en: 'Open Gateway footprint', es: 'Huella de Open Gateway', ca: 'Petjada d’Open Gateway' },
  coverageCaption: {
    en: 'The ~90 Open Gateway adapters report from 4 countries — Spain plus three more on the board. The exact roster stays behind the firewall; the counters don’t lie.',
    es: 'Los ~90 adaptadores de Open Gateway reportan desde 4 países — España más tres más en el tablero. El listado exacto se queda tras el cortafuegos; los contadores no mienten.',
    ca: 'Els ~90 adaptadors d’Open Gateway reporten des de 4 països — Espanya més tres més al tauler. El llistat exacte es queda darrere el tallafocs; els comptadors no menteixen.',
  },
  stats: {
    en: [
      { value: '2017', label: 'FIRST ENTRY IN THE LEDGER' },
      { value: '4', label: 'CHAPTERS, ZERO REWRITES' },
      { value: '~90', label: 'ADAPTERS OPERATED TODAY' },
      { value: '12+', label: 'CLI TOOLS IN THE DAILY KIT' },
    ],
    es: [
      { value: '2017', label: 'PRIMERA LÍNEA DEL HISTORIAL' },
      { value: '4', label: 'CAPÍTULOS, CERO REESCRITURAS' },
      { value: '~90', label: 'ADAPTADORES OPERADOS HOY' },
      { value: '12+', label: 'HERRAMIENTAS CLI EN EL KIT DIARIO' },
    ],
    ca: [
      { value: '2017', label: 'PRIMERA LÍNIA DE L’HISTORIAL' },
      { value: '4', label: 'CAPÍTOLS, ZERO REESCRIPTURES' },
      { value: '~90', label: 'ADAPTADORS OPERATS AVUI' },
      { value: '12+', label: 'EINES CLI AL KIT DIARI' },
    ],
  },
  rootsTitle: { en: 'Data Science roots', es: 'Raíces de Data Science', ca: 'Arrels de Data Science' },
  rootsNote: {
    en: '2019 · Data Science roots — Bible Text Analysis: scraping, NLTK, LDA topics and sentiment over a raw corpus. Provenance, not a headline.',
    es: '2019 · Raíces de Data Science — Bible Text Analysis: scraping, NLTK, temas LDA y sentimiento sobre un corpus crudo. Procedencia, no un titular.',
    ca: '2019 · Arrels de Data Science — Bible Text Analysis: scraping, NLTK, temes LDA i sentiment sobre un corpus cru. Procedència, no un titular.',
  },
  toolbeltTitle: {
    en: 'Operations toolbelt',
    es: 'Caja de herramientas de operaciones',
    ca: 'Caixa d’eines d’operacions',
  },
  toolbeltNote: {
    en: 'The rest of the toolbelt, kept where it was used: Kubernetes and AWS CDK/CloudFormation from platform and deployment work; Cassandra and Snowflake at Zitro’s betting platform; RabbitMQ in event pipelines; pandas from the 2019 Data Science years. Listed by engagement, not as résumé soup.',
    es: 'El resto de la caja de herramientas, donde se usó: Kubernetes y AWS CDK/CloudFormation del trabajo de plataforma y despliegue; Cassandra y Snowflake en la plataforma de apuestas de Zitro; RabbitMQ en pipelines de eventos; pandas de los años de Data Science (2019). Listado por proyecto, no como sopa de siglas.',
    ca: 'La resta de la caixa d’eines, allà on es va fer servir: Kubernetes i AWS CDK/CloudFormation de la feina de plataforma i desplegament; Cassandra i Snowflake a la plataforma d’apostes de Zitro; RabbitMQ en pipelines d’esdeveniments; pandas dels anys de Data Science (2019). Llistat per projecte, no com a sopa de sigles.',
  },
};

export const PEOPLE_PAGE: PeoplePageContent = {
  skillsTitle: { en: 'Skill groups', es: 'Grupos de habilidades', ca: 'Grups d’habilitats' },
  principlesLead: {
    en: 'Four rules, posted on the mezzanine wall. They are short because enforcing them is the long part.',
    es: 'Cuatro reglas, colgadas en la pared del entresuelo. Son cortas porque hacerlas cumplir es lo largo.',
    ca: 'Quatre regles, penjades a la paret de l’entresòl. Són curtes perquè fer-les complir és la part llarga.',
  },
  orgTitle: { en: 'Org chart', es: 'Organigrama', ca: 'Organigrama' },
  orgCaption: {
    en: 'Flat structure since 2017 — every role reports to the same pair of hands. Meetings are short because the CEO is also the one fixing the build.',
    es: 'Estructura plana desde 2017 — todos los roles reportan al mismo par de manos. Las reuniones son cortas porque el CEO también es el que arregla la build.',
    ca: 'Estructura plana des del 2017 — tots els rols reporten al mateix parell de mans. Les reunions són curtes perquè el CEO també és qui arregla la build.',
  },
  orgRoles: { en: ['CEO', 'ENGINEER', 'QA', 'SUPPORT'], es: ['CEO', 'INGENIERO', 'QA', 'SOPORTE'], ca: ['CEO', 'ENGINYER', 'QA', 'SUPORT'] },
};

export const FRONTDESK_PAGE: FrontdeskPageContent = {
  personTitle: { en: 'The person at the desk', es: 'La persona en el mostrador', ca: 'La persona al mostrador' },
  bio: {
    en: [
      'Behind the desk: Jordi Marçal Poy. One engineer, since 2017 — backend systems, event pipelines, and applied AI you can evaluate.',
      'Open for a senior backend role, a question about a floor or a repo, or a short spec-first engagement. Not a staffing firm; currently inside a telco platform team.',
      'You bring the problem in your own words. We pin it in writing before any code. Tests first, I/O at the edges, answers you can audit.',
      'The desk is attended in English, Español or Català — pick a floor, pick a language.',
    ],
    es: [
      'Detrás del mostrador: Jordi Marçal Poy. Un ingeniero, desde 2017 — sistemas backend, pipelines de eventos e IA aplicada que puedes evaluar.',
      'Abierto a un rol backend senior, una pregunta sobre una planta o un repo, o un encargo corto con spec primero. No es una consultora; actualmente dentro de un equipo de plataforma de una telco.',
      'Traes el problema con tus propias palabras. Lo fijamos por escrito antes de cualquier código. Pruebas primero, I/O en los bordes, respuestas que puedes verificar.',
      'El mostrador se atiende en inglés, español o catalán — elige planta y elige idioma.',
    ],
    ca: [
      'Darrere el mostrador: Jordi Marçal Poy. Un enginyer, des del 2017 — sistemes backend, pipelines d’esdeveniments i IA aplicada que pots avaluar.',
      'Obert a un rol backend sènior, una pregunta sobre una planta o un repo, o un encàrrec curt amb spec primer. No és una consultora; actualment dins d’un equip de plataforma de una telco.',
      'Portes el problema amb les teves pròpies paraules. El fixem per escrit abans de qualsevol codi. Proves primer, I/O a les vores, respostes que pots verificar.',
      'El mostrador s’atén en anglès, espanyol o català — tria planta i tria idioma.',
    ],
  },
  avail: {
    en: 'OPEN FOR WALK-INS · BARCELONA · REMOTE-FRIENDLY',
    es: 'ABIERTO SIN CITA · BARCELONA · CON OPCIÓN DE REMOTO',
    ca: 'OBERT SENSE CITA · BARCELONA · AMB OPCIÓ DE REMOT',
  },
  contactTitle: { en: 'Reach the desk', es: 'Contacta con la recepción', ca: 'Contacta amb la recepció' },
  copy: { en: 'Copy', es: 'Copiar', ca: 'Copia' },
  copied: { en: 'COPIED ✓', es: 'COPIADO ✓', ca: 'COPIAT ✓' },
  copyFail: { en: 'COPY BLOCKED — SELECT THE ADDRESS BY HAND', es: 'COPIA BLOQUEADA — SELECCIONA LA DIRECCIÓN A MANO', ca: 'CÒPIA BLOQUEJADA — SELECCIONA L’ADREÇA A MÀ' },
  howTitle: { en: 'How we work with you', es: 'Cómo trabajamos contigo', ca: 'Com treballem amb tu' },
  how: {
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
  },
  colophonTitle: { en: 'Colophon', es: 'Colofón', ca: 'Colofó' },
  colophon: {
    en: 'Built with Astro — Bricolage Grotesque for display, Instrument Sans for body, Space Mono for labels. Static pages, zero trackers, zero external scripts; night shift included.',
    es: 'Hecho con Astro — Bricolage Grotesque para titulares, Instrument Sans para el cuerpo, Space Mono para etiquetas. Páginas estáticas, cero trackers, cero scripts externos; turno de noche incluido.',
    ca: 'Fet amb Astro — Bricolage Grotesque per a titulars, Instrument Sans per al cos, Space Mono per a etiquetes. Pàgines estàtiques, zero trackers, zero scripts externs; torn de nit inclòs.',
  },
  offer: {
    openTitle: { en: 'Open for', es: 'Abierto a', ca: 'Obert a' },
    openItems: {
      en: [
        'Senior / staff backend roles — platform, events, or applied AI with measurable retrieval.',
        'Short spec-first engagements (4–8 weeks). If it can’t be written down, it doesn’t start.',
        'Questions about a floor or a repo. No tracking, no funnel.',
      ],
      es: [
        'Roles backend senior / staff — plataforma, eventos o IA aplicada con retrieval medible.',
        'Encargos cortos con spec primero (4–8 semanas). Si no se puede escribir, no se empieza.',
        'Preguntas sobre una planta o un repo. Sin tracking, sin funnel.',
      ],
      ca: [
        'Rols backend sènior / staff — plataforma, esdeveniments o IA aplicada amb retrieval mesurable.',
        'Encàrrecs curts amb spec primer (4–8 setmanes). Si no es pot escriure, no comença.',
        'Preguntes sobre una planta o un repo. Sense tracking, sense funnel.',
      ],
    },
    notOpenTitle: { en: 'Not open for', es: 'No abierto a', ca: 'No obert a' },
    notOpenItems: {
      en: ['Vibe-coded MVPs, “add ChatGPT to our app”, or unbounded retainers.'],
      es: ['MVPs vibe-coded, «añádeme ChatGPT a la app» o retainers sin límite.'],
      ca: ['MVPs vibe-coded, «posa ChatGPT a la nostra app» o retainers sense límit.'],
    },
    firmLine: {
      en: 'Jordimp & Co. is how the work is done — currently inside a telco platform team, not a staffing firm.',
      es: 'Jordimp & Co. es como se hace el trabajo — ahora dentro de un equipo de plataforma telco, no una consultora de personal.',
      ca: 'Jordimp & Co. és com es fa la feina — ara dins d’un equip de plataforma telco, no una consultora de personal.',
    },
    howLine: {
      en: 'How it works — 01 Brief · 02 Spec · 03 Build (tests first) · 04 Audit.',
      es: 'Cómo funciona — 01 Brief · 02 Spec · 03 Build (tests primero) · 04 Auditoría.',
      ca: 'Com funciona — 01 Brief · 02 Spec · 03 Build (proves primer) · 04 Auditoria.',
    },
    deskLine: {
      en: 'Desk attended in English, Español or Català.',
      es: 'Mostrador atendido en English, Español o Català.',
      ca: 'Mostrador atès en English, Español o Català.',
    },
  },
  cta: {
    en: 'WALK-INS WELCOME — ROLE, REPO OR A SPEC-FIRST ENGAGEMENT.',
    es: 'ENTRADA LIBRE — ROL, REPO O ENCARGO CON SPEC.',
    ca: 'ENTRADA LLIURE — ROL, REPO O ENCÀRREC AMB SPEC.',
  },
};

export function project(slug: string): Project {
  const found = PROJECTS.find((p) => p.slug === slug);
  if (!found) {
    throw new Error(`unknown project: ${slug}`);
  }
  return found;
}

export const INSPECTIONS_PAGE: InspectionsPageContent = {
  plaqueTitle: {
    en: 'TECHNICAL INSPECTION', es: 'INSPECCIÓN TÉCNICA', ca: 'INSPECCIÓ TÈCNICA',
  },
  verdictPass: { en: 'PASS', es: 'APTO', ca: 'APTE' },
  verdictFail: { en: 'FAIL', es: 'NO APTO', ca: 'NO APTE' },
  noAudit: {
    en: 'NO AUDIT ON FILE — THE INSPECTOR HAS YET TO SIGN',
    es: 'SIN AUDITORÍA EN EL EXPEDIENTE — EL INSPECTOR AÚN NO HA FIRMADO',
    ca: 'SENSE AUDITORIA A L’EXPEDIENT — L’INSPECTOR ENCARA NO HA FIRMAT',
  },
  gaugesTitle: {
    en: 'Lighthouse gauges', es: 'Indicadores Lighthouse', ca: 'Indicadors Lighthouse',
  },
  categories: {
    en: ['PERFORMANCE', 'ACCESSIBILITY', 'BEST PRACTICES', 'SEO'],
    es: ['RENDIMIENTO', 'ACCESIBILIDAD', 'MEJORES PRÁCTICAS', 'SEO'],
    ca: ['RENDIMENT', 'ACCESSIBILITAT', 'MILLORES PRÀCTIQUES', 'SEO'],
  },
  historyTitle: {
    en: 'Score history', es: 'Historial de puntuaciones', ca: 'Historial de puntuacions',
  },
  historyNote: {
    en: 'NOT ENOUGH HISTORY YET — SPARKLINES APPEAR FROM THE SECOND AUDIT',
    es: 'AÚN NO HAY HISTORIAL SUFICIENTE — LAS SPARKLINES APARECEN DESDE LA SEGUNDA AUDITORÍA',
    ca: 'ENCARA NO HI HA HISTORIAL SUFICIENT — LES SPARKLINES APAREIXEN DES DE LA SEGONA AUDITORIA',
  },
  countersTitle: { en: 'The counters', es: 'Los contadores', ca: 'Els comptadors' },
  labels: {
    unit: { en: 'Unit tests', es: 'Tests unitarios', ca: 'Tests unitaris' },
    e2e: { en: 'End-to-end tests', es: 'Tests end-to-end', ca: 'Tests end-to-end' },
    pages: { en: 'Pages generated', es: 'Páginas generadas', ca: 'Pàgines generades' },
    bundle: { en: 'Bundle size', es: 'Peso del bundle', ca: 'Pes del bundle' },
    depsProd: { en: 'Production dependencies', es: 'Dependencias de producción', ca: 'Dependències de producció' },
    depsDev: { en: 'Development dependencies', es: 'Dependencias de desarrollo', ca: 'Dependències de desenvolupament' },
    auditDate: { en: 'Last audit', es: 'Última auditoría', ca: 'Última auditoria' },
    workflow: { en: 'Quality workflow runs', es: 'Ejecuciones del workflow de calidad', ca: 'Execucions del workflow de qualitat' },
  },
  kbUnit: 'KB',
};
