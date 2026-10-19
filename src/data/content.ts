import type {
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
  PostBlock,
  PostContent,
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
    blog: { en: 'Blog', es: 'Blog', ca: 'Blog' },
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
  floorHint: {
    en: 'EACH FLOOR IS A DOOR — CLICK ONE TO STEP IN',
    es: 'CADA PLANTA ES UNA PUERTA — PULSA UNA PARA ENTRAR',
    ca: 'CADA PLANTA ÉS UNA PORTA — PITJA UNA PER ENTRAR',
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
  tierNav: {
    en: 'THE THREE TIERS',
    es: 'LOS TRES NIVELES',
    ca: 'ELS TRES NIVELLS',
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
    en: ['EST. 2017', 'BARCELONA', '12 OPEN REPOS', '1 ENGINEER'],
    es: ['DESDE 2017', 'BARCELONA', '12 REPOS ABIERTOS', '1 INGENIERO'],
    ca: ['DES DE 2017', 'BARCELONA', '12 REPOS OBERTS', '1 ENGINYER'],
  },
  floorGuide: {
    label: {
      en: 'FIRST VISIT? THE BUILDING, IN PLAIN WORDS',
      es: '¿PRIMERA VISITA? EL EDIFICIO, EN PALABRAS SENCILLAS',
      ca: 'PRIMERA VISITA? L’EDIFICI, EN PARAULES SENCILLES',
    },
    line: {
      en: 'This building is one engineer’s practice: every floor is a kind of work he does. Walk in — the doors are open and everything inside can be checked.',
      es: 'Este edificio es el trabajo de un solo ingeniero: cada planta es un tipo de trabajo que hace. Entra — las puertas están abiertas y todo lo de dentro se puede comprobar.',
      ca: 'Aquest edifici és la feina d’un sol enginyer: cada planta és un tipus de treball que fa. Entra — les portes són obertes i tot el que hi ha a dins es pot comprovar.',
    },
  },
  plainHead: {
    num: '02',
    title: {
      en: 'What this means for you',
      es: 'Lo que esto significa para ti',
      ca: 'Què significa això per a tu',
    },
    sub: {
      en: 'THE SAME WORK, IN PLAIN WORDS',
      es: 'EL MISMO TRABAJO, EN PALABRAS SENCILLAS',
      ca: 'EL MATEIX TREBALL, EN PARAULES SENCILLES',
    },
  },
  plainCards: [
    {
      dept: 'research',
      title: {
        en: 'AI answers you can check',
        es: 'Respuestas de IA que puedes comprobar',
        ca: 'Respostes d’IA que pots comprovar',
      },
      body: {
        en: 'I build AI features that answer with evidence: a fixed set of questions proves the answers are right before launch — and keeps proving it after every change.',
        es: 'Construyo funciones de IA que responden con pruebas: un conjunto fijo de preguntas demuestra que las respuestas son correctas antes del lanzamiento — y sigue demostrándolo después de cada cambio.',
        ca: 'Construeixo funcions d’IA que responen amb proves: un conjunt fix de preguntes demostra que les respostes són correctes abans de l’estrena — i continua demostrant-ho després de cada canvi.',
      },
      cta: {
        en: 'Visit the Research floor',
        es: 'Visita la planta de Investigación',
        ca: 'Visita la planta de Recerca',
      },
    },
    {
      dept: 'telemetry',
      title: {
        en: 'Systems that say when they break',
        es: 'Sistemas que avisan cuando se rompen',
        ca: 'Sistemes que avisen quan es trenquen',
      },
      body: {
        en: 'I connect the systems a business runs on so information moves on its own — and when a piece goes down, the alert says which piece and since when. No silent failures.',
        es: 'Conecto los sistemas con los que funciona un negocio para que la información se mueva sola — y cuando una pieza se cae, el aviso dice qué pieza y desde cuándo. Sin fallos silenciosos.',
        ca: 'Connecto els sistemes amb què funciona un negoci perquè la informació es mogui sola — i quan una peça cau, l’avis diu quina peça i des de quan. Sense fallades silencioses.',
      },
      cta: {
        en: 'Visit the Telemetry floor',
        es: 'Visita la planta de Telemetría',
        ca: 'Visita la planta de Telemetria',
      },
    },
    {
      dept: 'tooling',
      title: {
        en: 'A written plan before the first line of code',
        es: 'Un plan por escrito antes de la primera línea de código',
        ca: 'Un pla per escrit abans de la primera línia de codi',
      },
      body: {
        en: 'Every job starts as a short document you can read and approve: what gets built, how it is proven to work, and when it is done. Then the code follows the plan.',
        es: 'Cada trabajo empieza como un documento corto que puedes leer y aprobar: qué se construye, cómo se demuestra que funciona y cuándo está terminado. Luego el código sigue el plan.',
        ca: 'Cada feina comença com un document curt que pots llegir i aprovar: què es construeix, com es demostra que funciona i quan està acabat. Després el codi segueix el pla.',
      },
      cta: {
        en: 'Visit the Tooling floor',
        es: 'Visita la planta de Herramientas',
        ca: 'Visita la planta d’Eines',
      },
    },
  ],
  featuredHead: {
    num: '03',
    title: { en: 'Featured work', es: 'Trabajo destacado', ca: 'Treball destacat' },
    sub: { en: '3 OF 12 — THE REST IS DOWNSTAIRS', es: '3 DE 12 — EL RESTO ABAJO', ca: '3 DE 12 — LA RESTA A BAIX' },
  },
  deptsHead: {
    num: '04',
    title: { en: 'Departments', es: 'Departamentos', ca: 'Departaments' },
    sub: { en: '7 FLOORS · 1 PAIR OF HANDS', es: '7 PLANTAS · 1 PAR DE MANOS', ca: '7 PLANTES · 1 PARELL DE MANS' },
  },
  porter: {
    kicker: {
      en: 'THE CONCIERGE · KNOWS EVERY FLOOR',
      es: 'EL CONSERJE · CONOCE TODAS LAS PLANTAS',
      ca: 'EL PORTER · ES SAP TOTES LES PLANTES',
    },
    title: {
      en: 'Ask <mark>the concierge</mark>',
      es: 'Pregunta <mark>al conserje</mark>',
      ca: 'Pregunta <mark>al porter</mark>',
    },
    stand: {
      en: 'Ring the bell and ask anything about Jordi’s work. The concierge answers from the public CV and repos, citations on file — and what is not on record, he says so.',
      es: 'Toca el timbre y pregunta lo que quieras sobre el trabajo de Jordi. El conserje responde desde el CV público y los repos, con citas en el registro — y lo que no consta, lo dice.',
      ca: 'Trona el timbre i pregunta el que vulguis sobre la feina d’en Jordi. El porter respon des del CV públic i els repos, amb cites a l’arxiu — i el que no consta, ho diu.',
    },
    label: { en: 'Your question', es: 'Tu pregunta', ca: 'La teva pregunta' },
    placeholder: {
      en: 'e.g. Who built the Kafka telemetry hub?',
      es: 'p. ej. ¿Quién construyó el hub de telemetría de Kafka?',
      ca: 'p. ex. Qui va construir el hub de telemetria de Kafka?',
    },
    bell: { en: 'RING THE BELL', es: 'TOCA EL TIMBRE', ca: 'TRONA EL TIMBRE' },
    thinking: {
      en: 'The concierge checks the ledger',
      es: 'El conserje consulta el registro',
      ca: 'El porter consulta el registre',
    },
    notCovered: {
      en: 'Not on record. The concierge only answers from the public CV and repos — ring again with something else.',
      es: 'No consta. El conserje solo responde desde el CV público y los repos — vuelve a tocar el timbre con otra cosa.',
      ca: 'No consta. El porter només respon des del CV públic i els repos — torna a trona el timbre amb una altra cosa.',
    },
    error: {
      en: 'The concierge is not at the desk right now — try again in a moment.',
      es: 'El conserje no está en la portería ahora mismo — prueba en un momento.',
      ca: 'El porter no és a la portería ara mateix — prova en un moment.',
    },
    sources: { en: 'ON FILE', es: 'EN EL REGISTRO', ca: 'A L’ARXIU' },
    examples: [
      { q: { en: 'What is CodebaseRAG?', es: '¿Qué es CodebaseRAG?', ca: 'Què és CodebaseRAG?' } },
      {
        q: {
          en: 'Experience at Telefónica Open Gateway?',
          es: '¿Experiencia en Open Gateway en Telefónica?',
          ca: 'Experiència a Open Gateway a Telefónica?',
        },
      },
      { q: { en: 'What is Jordi’s coffee order?', es: '¿Cuál es el café de Jordi?', ca: 'Quin cafè pren en Jordi?' } },
    ],
    footnote: {
      en: 'ASK-API · LOCAL MODELS ON THE HOMELAB · CITED OR SILENT',
      es: 'ASK-API · MODELOS LOCALES EN EL HOMELAB · CITA O CALLA',
      ca: 'ASK-API · MODELS LOCALS AL HOMELAB · CITA O CALLA',
    },
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
    plain: {
      en: 'AI features that show their work: the answers are checked against a fixed set of questions before anything reaches a customer.',
      es: 'Funciones de IA que enseñan su trabajo: las respuestas se comprueban contra un conjunto fijo de preguntas antes de llegar a un cliente.',
      ca: 'Funcions d’IA que ensenyen la seva feina: les respostes es comproven contra un conjunt fix de preguntes abans d’arribar a un client.',
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
    plain: {
      en: 'The plumbing that moves data between a company’s systems — built so that when a piece fails, you are told which piece and since when, instead of finding out from a customer.',
      es: 'La tubería que mueve datos entre los sistemas de una empresa — construida para que, cuando una pieza falla, te digan qué pieza y desde cuándo, en lugar de enterarte por un cliente.',
      ca: 'La canonada que mou dades entre els sistemes d’una empresa — construïda per tal que, quan una peça falla, et diguin quina peça i des de quan, en lloc d’enterar-te per un client.',
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
    plain: {
      en: 'Small tools and written plans: the work is agreed on paper before the first line of code, so you always know what is being built and why.',
      es: 'Herramientas pequeñas y planes por escrito: el trabajo se acuerda sobre el papel antes de la primera línea de código, así siempre sabes qué se construye y por qué.',
      ca: 'Eines petites i plans per escrit: la feina es posa d’acord sobre el paper abans de la primera línia de codi, així sempre saps què es construeix i per què.',
    },
    projects: ['harness-standard', 'ggufbench', 'md-mermaid-pdf', 'mcp-transparent-png'],
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
    plain: {
      en: 'The certificates on the wall: speed, accessibility and quality scores, dated and signed, so nothing here runs on faith.',
      es: 'Los certificados en la pared: puntuaciones de velocidad, accesibilidad y calidad, fechadas y firmadas, para que aquí nada funcione a base de fe.',
      ca: 'Els certificats al mur: puntuacions de velocitat, accessibilitat i qualitat, datades i signades, perquè aquí res funcioni a base de fe.',
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
    plain: {
      en: 'The house rules: tests before features, plain names, no hidden tricks — one engineer whose work is easy to audit.',
      es: 'Las reglas de la casa: pruebas antes que funciones, nombres claros, trucos escondidos no — un ingeniero cuyo trabajo es fácil de auditar.',
      ca: 'Les regles de la casa: proves abans que funcions, noms clars, trucs amagats no — un enginyer la feina del qual és fàcil d’auditar.',
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
    plain: {
      en: 'The career ledger: every job since 2017, what shipped and what it was built with — one history, no rewrites.',
      es: 'El historial profesional: cada trabajo desde 2017, qué se entregó y con qué se construyó — una historia, sin reescrituras.',
      ca: 'L’historial professional: cada feina des del 2017, què es va lliurar i amb què es va construir — una història, sense reescriptures.',
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
    plain: {
      en: 'Where you start: describe what you need in your own words and get a straight answer about whether we can help.',
      es: 'Donde se empieza: describe qué necesitas con tus palabras y recibe una respuesta directa sobre si podemos ayudarte.',
      ca: 'On es comença: descriu què necessites amb les teves paraules i rep una resposta directa sobre si et podem ajudar.',
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

interface ProjectSeed {
  readonly slug: string;
  readonly name: string;
  readonly year: string;
  readonly featured: boolean;
  readonly tier: Tier;
  readonly dept: DeptKey;
  readonly stack: readonly string[];
  readonly github: string;
  readonly qualityUrl?: string;
}

const P = (seed: ProjectSeed, l10n: ProjectL10n): Project => ({ ...seed, ...l10n });

export const PROJECTS: readonly Project[] = [
  P(
    {
      slug: 'codebaserag', name: 'CodebaseRAG', year: '2026', featured: true,
      tier: 'thesis', dept: 'research',
      stack: ['Python 3.13', 'FastAPI', 'pgvector', 'Qdrant', 'Ollama', 'Langfuse', 'mypy strict'],
      github: 'https://github.com/jordimarsal/codebaserag',
    },
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
      outcome: {
        en: 'The result is an eval gate that blocks retrieval regressions before merge: quality is a CI-checked claim with a committed floor, not a demo vibe.',
        es: 'El resultado es un gate de evals que bloquea las regresiones de retrieval antes del merge: la calidad es una afirmación verificada en CI con un suelo comprometido, no una demo.',
        ca: 'El resultat és un gate d’evals que bloqueja les regressions de retrieval abans del merge: la qualitat és una afirmació verificada a CI amb un sòl compromès, no una demo.',
      },
    },
  ),
  P(
    {
      slug: 'interview-simulator', name: 'Interview Simulator', year: '2026', featured: false,
      tier: 'satellite', dept: 'research',
      stack: ['Whisper', 'Local LLM'],
      github: 'https://github.com/jordimarsal/interview-simulator',
    },
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
    },
  ),
  P(
    {
      slug: 'bible-text-analysis', name: 'Bible Text Analysis', year: '2019', featured: false,
      tier: 'annex', dept: 'research',
      stack: ['Python', 'NLTK', 'LDA', 'Jupyter'],
      github: 'https://github.com/jordimarsal/bible_text_analysis',
    },
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
    },
  ),
  P(
    {
      slug: 'kafka-adapter-telemetry', name: 'Kafka Adapter Telemetry', year: '2026', featured: true,
      tier: 'thesis', dept: 'telemetry',
      stack: ['Java 25', 'Spring Boot 4.1', 'Kafka', 'Oracle', 'Flyway', 'Testcontainers', 'SSE'],
      github: 'https://github.com/jordimarsal/kafka-adapter-telemetry',
      qualityUrl: 'https://jordimarsal.github.io/kafka-adapter-telemetry/quality/',
    },
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
      outcome: {
        en: 'The result is operational visibility across ~90 adapters in 4 countries: who is DOWN, since when, and exactly one alert per episode — no pager storms, no silent gaps.',
        es: 'El resultado es visibilidad operativa sobre ~90 adaptadores en 4 países: quién está DOWN, desde cuándo y exactamente una alerta por episodio — sin tormentas de pager ni huecos silenciosos.',
        ca: 'El resultat és visibilitat operativa sobre ~90 adaptadors a 4 països: qui està DOWN, des de quan i exactament una alerta per episodi — sense tempestes de pager ni forats silenciosos.',
      },
    },
  ),
  P(
    {
      slug: 'redis-toolkit', name: 'Redis Toolkit', year: '2026', featured: true,
      tier: 'satellite', dept: 'telemetry',
      stack: ['Java', 'Javalin', 'Redis', 'Testcontainers'],
      github: 'https://github.com/jordimarsal/redis-toolkit',
    },
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
    },
  ),
  P(
    {
      slug: 'product-offers', name: 'Product Offers API', year: '2023 - 2026', featured: false,
      tier: 'annex', dept: 'telemetry',
      stack: ['Java 17', 'Spring Boot 3.2', 'H2', 'JUnit 5', 'Mockito'],
      github: 'https://github.com/jordimarsal/product-offers',
    },
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
    },
  ),
  P(
    {
      slug: 'harness-standard', name: 'Harness', year: '2026', featured: true,
      tier: 'thesis', dept: 'tooling',
      stack: ['Agents', 'SDD', 'CLI', 'Conventions'],
      github: 'https://github.com/jordimarsal/harness',
    },
    {
      blurb: {
        en: 'Multi-agent SDD harness: specs, roles and gates in one command. Ships as six standalone skills.',
        es: 'Harness multi-agente SDD: specs, roles y gates en un comando. Se distribuye como seis skills independientes.',
        ca: 'Harness multi-agent SDD: specs, rols i gates en una comanda. Es distribueix com a sis skills independents.',
      },
      summary: {
        en: 'A standardized multi-agent harness for Claude Code and OpenCode: Spec-Driven Development roles (Leader, Spec Author, Implementer, Reviewer) installed into any project with a single command. Its process also ships as six standalone skills (npx skills add jordimarsal/harness).',
        es: 'Un harness multi-agente estandarizado para Claude Code y OpenCode: roles de Spec-Driven Development (Leader, Spec Author, Implementer, Reviewer) instalados en cualquier proyecto con un solo comando. Su proceso también se distribuye como seis skills independientes (npx skills add jordimarsal/harness).',
        ca: 'Un harness multi-agent estandarditzat per a Claude Code i OpenCode: rols de Spec-Driven Development (Leader, Spec Author, Implementer, Reviewer) instal·lats a qualsevol projecte amb una sola comanda. El seu procés també es distribueix com a sis skills independents (npx skills add jordimarsal/harness).',
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
          'Its process ships as six standalone skills, installable with npx skills add jordimarsal/harness.',
        ],
        es: [
          '7 stacks cubiertos (Java/Spring, Python, Node/TS, Rust y más) con convenciones por stack.',
          'Instalación con un solo comando; la plantilla de convenciones incluye reglas de SonarQube/calidad de código.',
          'Nacido del uso diario en proyectos personales — este portfolio está construido con él.',
          'Su proceso se distribuye como seis skills independientes, instalables con npx skills add jordimarsal/harness.',
        ],
        ca: [
          '7 stacks coberts (Java/Spring, Python, Node/TS, Rust i més) amb convencions per stack.',
          'Instal·lació amb una sola comanda; la plantilla de convencions inclou regles de SonarQube/qualitat de codi.',
          'Nascut de l’ús diari en projectes personals — aquest portfolio està construït amb ell.',
          'El seu procés es distribueix com a sis skills independents, instal·lables amb npx skills add jordimarsal/harness.',
        ],
      },
      metrics: [
        { value: '7', label: { en: 'stacks', es: 'stacks', ca: 'stacks' } },
        { value: '1 cmd', label: { en: 'install', es: 'instalación', ca: 'instal·lació' } },
        { value: '6', label: { en: 'skills', es: 'skills', ca: 'skills' } },
      ],
      outcome: {
        en: 'The payoff is repeatable agent work: specs, roles and gates installed in one command, on any stack — this portfolio is built through them.',
        es: 'La recompensa es trabajo de agente repetible: specs, roles y gates instalados en un comando, en cualquier stack — este portfolio se construye con ellos.',
        ca: 'La recompensa és treball d’agent repetible: specs, rols i gates instal·lats en una comanda, en qualsevol stack — aquest portfolio es construeix amb ells.',
      },
    },
  ),
  P(
    {
      slug: 'rustcut', name: 'Rustcut', year: '2024 - 2026', featured: false,
      tier: 'annex', dept: 'tooling',
      stack: ['Rust', 'Actix-web', 'SQLite'],
      github: 'https://github.com/jordimarsal/rustcut',
    },
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
    },
  ),
  P(
    {
      slug: 'md-mermaid-pdf', name: 'MD Mermaid PDF', year: '2025 - 2026', featured: false,
      tier: 'satellite', dept: 'tooling',
      stack: ['Python', 'Markdown', 'Mermaid', 'GitHub Actions'],
      github: 'https://github.com/jordimarsal/md-mermaid-pdf',
    },
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
    },
  ),
  P(
    {
      slug: 'mcp-transparent-png', name: 'MCP Transparent PNG', year: '2026', featured: true,
      tier: 'satellite', dept: 'tooling',
      stack: ['Python 3.13', 'MCP', 'Pillow', 'GitHub Actions'],
      github: 'https://github.com/jordimarsal/mcp-transparent-png',
    },
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
    },
  ),
  P(
    {
      slug: 'spring-boot-casino', name: 'Spring Boot Casino', year: '2020 - 2026', featured: false,
      tier: 'annex', dept: 'tooling',
      stack: ['Java', 'Spring Boot', 'Hexagonal Architecture'],
      github: 'https://github.com/jordimarsal/spring-boot-casino',
    },
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
    },
  ),
  P(
    {
      slug: 'ggufbench', name: 'ggufbench', year: '2026', featured: false,
      tier: 'satellite', dept: 'tooling',
      stack: ['Python', 'GGUF', 'llama.cpp', 'GitHub Actions'],
      github: 'https://github.com/jordimarsal/ggufbench',
    },
    {
      blurb: {
        en: 'Agentic benchmark for local GGUF models — speed, tools, code, agent. One harness, receipts included.',
        es: 'Benchmark agéntico para modelos GGUF locales — velocidad, herramientas, código, agente. Un harness, recibos incluidos.',
        ca: 'Benchmark agèntic per a models GGUF locals — velocitat, eines, codi, agent. Un harness, rebuts inclosos.',
      },
      summary: {
        en: 'An agentic benchmark for local GGUF models: prompt speed, tool-calling, code generation and multi-step agent work graded under one identical harness, with the raw receipts of every call — 100% local, no cloud, no APIs.',
        es: 'Un benchmark agéntico para modelos GGUF locales: velocidad de prompt, tool-calling, generación de código y trabajo agéntico multi-paso, medidos bajo un mismo harness y con los recibos en bruto de cada llamada — 100% local, sin nube ni APIs.',
        ca: 'Un benchmark agèntic per a models GGUF locals: velocitat de prompt, tool-calling, generació de codi i treball agèntic multi-pas, mesurats sota un mateix harness i amb els rebuts en brut de cada crida — 100% local, sense núvol ni APIs.',
      },
      problem: {
        en: 'Public benchmarks are trained on, and “how smart is it” is not the question a local rig answers. ggufbench asks which GGUF to run on your own machine: every model runs the same harness, every scoreboard row states the task set it really ran, and exclusions are recorded with a reason — never silent.',
        es: 'Los benchmarks públicos se usan para entrenar, y “cuál es el modelo más listo” no es la pregunta que responde un equipo local. ggufbench pregunta qué GGUF ejecutar en tu propia máquina: cada modelo corre el mismo harness, cada fila del marcador declara el set de tareas que midió de verdad y las exclusiones quedan registradas con un motivo — nunca en silencio.',
        ca: 'Els benchmarks públics serveixen per entrenar, i “quin model és més llest” no és la pregunta que respon un equip local. ggufbench pregunta quin GGUF executar a la teva pròpia màquina: cada model corre el mateix harness, cada fila del marcador declara el set de tasques que va mesurar de debò i les exclusions queden registrades amb un motiu — mai en silenci.',
      },
      highlights: {
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
      },
      metrics: [
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
      ],
    },
  ),
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
    sub: { en: '12 PROJECTS · 3 TIERS · FILTER BY STACK', es: '12 PROYECTOS · 3 NIVELES · FILTRA POR STACK', ca: '12 PROJECTES · 3 NIVELLS · FILTRA PER STACK' },
  },
  intro: {
    en: 'Twelve projects in three tiers: the thesis, the satellites around it, and an annex for roots, take-home assessments and size exercises. Filter by the stack you care about.',
    es: 'Doce proyectos en tres niveles: la tesis, sus satélites y un anexo para raíces, pruebas técnicas y ejercicios de tamaño. Filtra por el stack que te interese.',
    ca: 'Dotze projectes en tres nivells: la tesi, els seus satèl·lits i un annex per a arrels, proves tècniques i exercicis de mida. Filtra pel stack que et vagi bé.',
  },
  filterAll: { en: 'All', es: 'Todos', ca: 'Tots' },
  filterSummary: { en: 'FILTER BY STACK ({n})', es: 'FILTRA POR STACK ({n})', ca: 'FILTRA PER STACK ({n})' },
  filterSearch: { en: 'TYPE TO FILTER…', es: 'ESCRIBE PARA FILTRAR…', ca: 'ESCRIU PER FILTRAR…' },
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

const paragraphBlocks = (body: L10n<readonly string[]>): readonly PostBlock[] =>
  body.en.map((_, i): PostBlock => ({
    kind: 'paragraph',
    html: { en: body.en[i], es: body.es[i], ca: body.ca[i] },
  }));

const withBrand = (title: L10n<string>): L10n<string> => ({
  en: `${title.en} — Jordimp & Co.`,
  es: `${title.es} — Jordimp & Co.`,
  ca: `${title.ca} — Jordimp & Co.`,
});

const GGUF_SCOREBOARD = {
  head: ['model', 'think', 'tools', 'code', 'agent', 'speed', 'global'],
  rows: [
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
  ],
} as const;

export const POSTS: readonly PostContent[] = [
  {
    slug: 'sixteen-models-one-gate',
    date: '2026-10-19',
    revision: 'REV A',
    dateLabel: { en: 'FILED', es: 'REGISTRADO', ca: 'REGISTRAT' },
    title: {
      en: 'Sixteen models, one gate: how the concierge got its brain',
      es: 'Dieciséis modelos, una puerta: cómo el conserje consiguió su cerebro',
      ca: 'Setze models, una porta: com el porter va aconseguir el seu cervell',
    },
    description: {
      en: 'The concierge needed a smaller brain with the same contract. Sixteen candidates benched against the production gate, a hall of shame for fabricated citations, and one LoRA fine-tune that ships 21/21 at half the memory.',
      es: 'El conserje necesitaba un cerebro más pequeño con el mismo contrato. Dieciséis candidatos medidos contra la puerta de producción, un salón de la vergüenza para citas inventadas y un fine-tune LoRA que entrega 21/21 con la mitad de memoria.',
      ca: 'El porter necessitava un cervell més petit amb el mateix contracte. Setze candidats mesurats contra la porta de producció, un saló de la vergonya per a cites inventades i un fine-tune LoRA que entrega 21/21 amb la meitat de memòria.',
    },
    lead: {
      en: 'The concierge of jordimp.net answers with citations or not at all. Its 4B brain held that contract but also held 2.4 GB of VRAM. This is the round where sixteen models faced the production gate, fifteen were rejected for cause, and the last one got taught the difference between answering and answering with receipts.',
      es: 'El conserje de jordimp.net responde con citas o no responde. Su cerebro de 4B sostenía el contrato, pero también sostenía 2,4 GB de VRAM. Esta es la ronda donde dieciséis modelos se midieron contra la puerta de producción, quince fueron rechazados con causa y el último aprendió la diferencia entre responder y responder con recibos.',
      ca: 'El porter de jordimp.net respon amb cites o no respon. El seu cervell de 4B sostenia el contracte, però també sostenia 2,4 GB de VRAM. Aquesta és la ronda on setze models es van mesurar contra la porta de producció, quinze van ser descartats amb causa i l’últim va aprendre la diferència entre respondre i respondre amb rebuts.',
    },
    about: 'https://github.com/jordimarsal/jordimp/tree/main/ask-api/finetune',
    sections: [
      {
        anchor: 'the-constraint',
        heading: {
          en: 'The constraint: half the VRAM, same contract',
          es: 'La restricción: la mitad de VRAM, el mismo contrato',
          ca: 'La restricció: la meitat de VRAM, el mateix contracte',
        },
        blocks: paragraphBlocks({
          en: [
            'The concierge’s model is resident in VRAM around the clock, on a server that runs other jobs. A 4B-class GGUF holds 2.4 GB of a 16 GB card for a task that answers one visitor at a time in 120 words or less. It was the most expensive line of the deployment and the least exercised one.',
            'So the goal read as a constraint: same gate, half the footprint. 1.2 GB resident, answers in ~350 ms, and the freed gigabyte back to the machine. The non-negotiable part: the gate does not move. Twenty-one golden questions, three off-corpus refusals, or the model does not ship.',
            'One harness covered the whole search: the same retrieval, the same prompts production sends, the same citation policy that strips any [n] not pointing at a retrieved excerpt, prompts in the visitor’s language, and deterministic re-runs. When a re-run reproduces a score digit for digit, a 21/21 means something.',
          ],
          es: [
            'El modelo del conserje vive en VRAM día y noche, en un servidor que hace otras cosas. Un GGUF de clase 4B ocupa 2,4 GB de una tarjeta de 16 GB para una tarea que atiende a un visitante cada vez en 120 palabras o menos. Era la línea más cara del despliegue y la menos ejercida.',
            'El objetivo se escribió como una restricción: la misma puerta, la mitad de huella. 1,2 GB residentes, respuestas en ~350 ms y el gigabyte liberado de vuelta a la máquina. Lo innegociable: la puerta no se mueve. Veintiuna preguntas golden, tres rechazos fuera de corpus, o el modelo no nave.',
            'Un solo harness cubrió toda la búsqueda: el mismo retrieval, los mismos prompts que envía producción, la misma política de citas que elimina cualquier [n] que no apunte a un fragmento recuperado, prompts en el idioma del visitante y re-ejecuciones deterministas. Cuando una re-ejecución reproduce la puntuación dígito a dígito, un 21/21 significa algo.',
          ],
          ca: [
            'El model del porter viu a la VRAM dia i nit, en un servidor que fa altres feines. Un GGUF de classe 4B ocupa 2,4 GB d’una targeta de 16 GB per a una tasca que atén un visitant cada vegada en 120 paraules o menys. Era la línia més cara del desplegament i la menys exercida.',
            'Així doncs, l’objectiu es va escriure com una restricció: la mateixa porta, la meitat de petjada. 1,2 GB residents, respostes en ~350 ms i el gigabyte alliberat de tornada a la màquina. L’innegociable: la porta no es mou. Vint-i-una preguntes golden, tres refusos fora de corpus, o el model no nave.',
            'Un sol harness va cobrir tota la recerca: el mateix retrieval, els mateixos prompts que envia producció, la mateixa política de cites que elimina qualsevol [n] que no apunti a un fragment recuperat, prompts en l’idioma del visitant i re-execucions deterministes. Quan una re-execució reprodueix la puntuació xifra a xifra, un 21/21 vol dir alguna cosa.',
          ],
        }),
      },
      {
        anchor: 'the-gate',
        heading: {
          en: 'The gate: twenty-one questions and three traps',
          es: 'La puerta: veintiuna preguntas y tres trampas',
          ca: 'La porta: vint-i-una preguntes i tres trampes',
        },
        blocks: paragraphBlocks({
          en: [
            'The gate has two halves. The visible half is twenty-one golden questions in English, Spanish and Catalan, including compound questions whose answers live in two different documents. A model passes by answering with citations that point at retrieved excerpts — and the policy strips any [n] referencing something that was not retrieved, so a wrong marker is as good as none.',
            'The quiet half is three questions nobody should answer. Capitals of France, sourdough starters, housing prices in Sabadell. A concierge that responds to those was never asked to know them; it was asked to say what the portfolio says and stop. Models fail this half more often than the covered one.',
            'The gate is also boring on purpose. Same retrieval, same prompts, temperature zero. Re-runs reproduce scores byte for byte, which is what turns a benchmark table into evidence.',
          ],
          es: [
            'La puerta tiene dos mitades. La visible son veintiuna preguntas golden en inglés, español y catalán, incluidas preguntas compuestas cuya respuesta vive en dos documentos distintos. Un modelo pasa respondiendo con citas que apuntan a fragmentos recuperados — y la política elimina cualquier [n] que referencie algo no recuperado, así que un marcador erróneo vale lo mismo que ninguno.',
            'La mitad silenciosa son tres preguntas que nadie debería responder. Capitales de Francia, masas madre, precios de la vivienda en Sabadell. A un conserje que responde eso nunca le pidieron saberlo; le pidieron decir lo que dice el portafolio y parar. Los modelos fallan esta mitad más a menudo que la cubierta.',
            'La puerta también es aburrida a propósito. Mismo retrieval, mismos prompts, temperatura cero. Las re-ejecuciones reproducen las puntuaciones byte a byte, y eso convierte una tabla de benchmark en evidencia.',
          ],
          ca: [
            'La porta té dues meitats. La visible són vint-i-una preguntes golden en anglès, castellà i català, incloses preguntes compostes la resposta de les quals viu en dos documents diferents. Un model passa responent amb cites que apunten a fragments recuperats — i la política elimina qualsevol [n] que referenciï alguna cosa no recuperada, així que un marcador erroni val el mateix que cap.',
            'La meitat silenciosa són tres preguntes que ningú hauria de respondre. Capitals de França, masses mare, preus de l’habitatge a Sabadell. A un porter que respon això mai li van demanar saber-ho; li van demanar dir el que diu el portafoli i parar. Els models reproven aquesta meitat més sovint que la coberta.',
            'La porta també és avorrida a propòsit. Mateix retrieval, mateixos prompts, temperatura zero. Les re-execucions reprodueixen les puntuacions byte a byte, i això converteix una taula de benchmark en evidència.',
          ],
        }),
      },
      {
        anchor: 'the-sweep',
        heading: {
          en: 'Sixteen candidates',
          es: 'Dieciséis candidatos',
          ca: 'Setze candidats',
        },
        blocks: [
          {
            kind: 'paragraph',
            html: {
              en: 'Sixteen models, three rounds, one table. Covered = golden questions answered with surviving citations; off-corpus = the three traps refused. Everything runs at temperature zero against production retrieval.',
              es: 'Dieciséis modelos, tres rondas, una tabla. Cubiertas = preguntas golden respondidas con citas supervivientes; fuera de corpus = las tres trampas rechazadas. Todo a temperatura cero contra el retrieval de producción.',
              ca: 'Setze models, tres rondes, una taula. Cobertes = preguntes golden respostes amb cites supervivents; fora de corpus = les tres trampes refusades. Tot a temperatura zero contra el retrieval de producció.',
            },
          },
          {
            kind: 'table',
            head: ['candidate', 'GGUF', 'covered', 'off-corpus', 'verdict'],
            rows: [
              ['Qwen3-4B-Instruct-2507 (baseline)', '2.4 GB', '21/21', '3/3', 'kept, then replaced'],
              ['Qwen3.5-2B (base)', '1.2 GB', '20/21', '3/3', 'fine-tuned → this model'],
              ['Qwen3-1.7B Q4_K_M', '1.0 GB', '19/21', '3/3', 'drops [n] on compounds'],
              ['Qwen3-1.7B Q3_K_M', '0.9 GB', '17/21', '3/3', 'same, worse'],
              ['Qwen3-1.7B Q6_K', '1.4 GB', '16/21', '3/3', 'quant ≠ discipline'],
              ['Qwen3-1.7B Q8_0', '1.8 GB', '15/21', '3/3', 'quant ≠ discipline'],
              ['Ministral-3-3B-Instruct-2512', '2.0 GB', '16/21', '3/3', '4B cost, less coverage'],
              ['LFM2.5-1.2B', '0.7 GB', '15/21', '1/3', 'fabricates citations'],
              ['LFM2-1.2B', '0.7 GB', '11/21', '1/3', 'fabricates citations'],
              ['Qwen3-0.6B', '0.6 GB', '10/21', '3/3', 'floor of the size curve'],
              ['granite-4.0-1b', '1.0 GB', '8/21', '2/3', 'leaks + anglocentric'],
              ['SmolLM3-3B', '1.8 GB', '6/21', '3/3', 'cites in the wrong place'],
              ['gemma-3-1b-it', '0.8 GB', '3/21', '3/3', 'ignores [n] entirely'],
              ['Pleias-RAG-1B', '0.7 GB', '0/21', '3/3', 'native syntax, not [n]'],
              ['salamandra-2b-instruct', '1.4 GB', '0/21', '2/3', 'never cites, leaks'],
              ['LFM2.5-2.6B', '1.6 GB', '—', '—', 'thinks past the budget'],
            ],
          },
          {
            kind: 'paragraph',
            html: {
              en: 'The rounds taught the harness as much as the models. Round one ran every prompt in English; a 21/21 for Qwen3-1.7B Q3_K_M collapsed to 17/21 once the golden file carried explicit language keys — a harness bug, fixed, and a useful reminder that a benchmark can flatter a model by asking the wrong question. Round two proved determinism: identical re-runs, identical scores, down to which questions fail. Round three is the table.',
              es: 'Las rondas enseñaron al harness tanto como a los modelos. La primera ejecutó todos los prompts en inglés; un 21/21 para Qwen3-1.7B Q3_K_M se hundió a 17/21 cuando el archivo golden llevó claves de idioma explícitas — un bug del harness, corregido, y un recordatorio útil: un benchmark puede halagar a un modelo haciendo la pregunta equivocada. La segunda probó el determinismo: re-ejecuciones idénticas, puntuaciones idénticas, hasta en qué preguntas fallan. La tercera es la tabla.',
              ca: 'Les rondes van ensenyar al harness tant com als models. La primera va executar tots els prompts en anglès; un 21/21 per a Qwen3-1.7B Q3_K_M es va enfonsar a 17/21 quan el fitxer golden va dur claus d’idioma explícites — un bug del harness, corregit, i un recordatori útil: un benchmark pot afalagar un model fent la pregunta equivocada. La segona va provar el determinisme: re-execucions idèntiques, puntuacions idèntiques, fins i tot en quines preguntes fallen. La tercera és la taula.',
            },
          },
          {
            kind: 'paragraph',
            html: {
              en: 'One result deserves its own line: the quant curve is not monotonic. On Qwen3-1.7B, Q4 scored 19, Q6 scored 16, Q8 scored 15. Citation discipline at this scale is a knife-edge behavior, and more precision does not buy it.',
              es: 'Un resultado merece línea propia: la curva de cuantización no es monótona. En Qwen3-1.7B, Q4 anotó 19, Q6 anotó 16, Q8 anotó 15. La disciplina de citas a esta escala es un comportamiento al filo, y más precisión no la compra.',
              ca: 'Un resultat mereix línia pròpia: la corba de quantització no és monòtona. A Qwen3-1.7B, Q4 va anotar 19, Q6 en va anotar 16, Q8 en va anotar 15. La disciplina de cites a aquesta escala és un comportament al fil, i més precisió no la compra.',
            },
          },
        ],
      },
      {
        anchor: 'hall-of-shame',
        heading: {
          en: 'The fabrication hall of shame',
          es: 'El salón de la vergüenza de las citas inventadas',
          ca: 'El saló de la vergonya de les cites inventades',
        },
        blocks: paragraphBlocks({
          en: [
            'The disqualifying failures were not dropped citations. They were invented ones. The gate’s off-corpus half exists to catch exactly this, and four models walked straight into it.',
            'A concierge that invents a citation for a question it was never supposed to answer is worse than no concierge. These were rejected on that alone — the covered scores stopped mattering.',
          ],
          es: [
            'Los fallos descalificantes no fueron citas omitidas. Fueron citas inventadas. La mitad fuera de corpus de la puerta existe para cazar exactamente esto, y cuatro modelos cayeron de cabeza.',
            'Un conserje que inventa una cita para una pregunta que nunca debía responder es peor que ningún conserje. Estos se rechazaron solo por eso — las puntuaciones cubiertas dejaron de importar.',
          ],
          ca: [
            'Els fallos desqualificants no van ser cites omeses. Van ser cites inventades. La meitat fora de corpus de la porta existeix per caçar exactament això, i quatre models hi van caure de ple.',
            'Un porter que inventa una cita per a una pregunta que mai havia de respondre és pitjor que cap porter. Aquests es van descartar només per això — les puntuacions cobertes van deixar de importar.',
          ],
        }),
      },
      {
        anchor: 'one-question-short',
        heading: {
          en: 'The one that was one question short',
          es: 'El que estaba a una pregunta de distancia',
          ca: 'El que era a una pregunta de distància',
        },
        blocks: paragraphBlocks({
          en: [
            'Qwen3.5-2B closed the sweep at 20/21, half the latency and half the memory of the incumbent. Its single miss was an honest one: a refusal on the compound RabbitMQ-or-Kafka question, the exact class of multi-source answers where small models drop their [n] markers.',
            'By then the pattern was clear. Everything at or under 1.2 GB failed the contract — by dropping citations, by ignoring the format, or by inventing them. The discipline does not come from size, from precision, or from being a citation specialist (Pleias is one, and scored zero). So the best base got a teacher.',
          ],
          es: [
            'Qwen3.5-2B cerró la ronda en 20/21, la mitad de latencia y la mitad de memoria que el modelo anterior. Su único fallo fue honesto: un rechazo en la pregunta compuesta de RabbitMQ-o-Kafka, exactamente la clase de respuestas multi-fuente donde los modelos pequeños pierden sus marcadores [n].',
            'Para entonces el patrón era claro. Todo lo que estaba en o bajo 1,2 GB fallaba el contrato — omitiendo citas, ignorando el formato o inventándolas. La disciplina no viene del tamaño, ni de la precisión, ni de ser un especialista en citas (Pleias lo es, y anotó cero). Así que la mejor base consiguió un maestro.',
          ],
          ca: [
            'Qwen3.5-2B va tancar la ronda a 20/21, la meitat de latència i la meitat de memòria que el model anterior. El seu únic fall va ser honest: un refús a la pregunta composta de RabbitMQ-o-Kafka, exactament la classe de respostes multi-font on els models petits perden els seus marcadors [n].',
            'Aleshores el patró ja era clar. Tot el que era a 1,2 GB o per sota fallava el contracte — ometent cites, ignorant el format o inventant-les. La disciplina no ve de la mida, ni de la precisió, ni de ser un especialista en cites (Pleias ho és, i va anotar zero). Així doncs, la millor base va aconseguir un mestre.',
          ],
        }),
      },
      {
        anchor: 'the-fine-tune',
        heading: {
          en: 'Teaching the contract',
          es: 'Enseñando el contrato',
          ca: 'Ensenyant el contracte',
        },
        blocks: paragraphBlocks({
          en: [
            'The dataset came from the incumbent 4B acting as teacher over the real retrieval pipeline. It invented 174 visitor questions in three languages — 77 simple, 65 off-corpus, 32 compound — and answered them under the exact production prompts. Every completion passed through the production citation policy before entering the dataset; anything that would not survive the gate never became a lesson. The 21 golden questions were excluded from the dataset, so the final score measures how the model generalizes to questions it never trained on.',
            'The first recipe failed in a useful way. Three epochs with loss over the whole sequence scored 15/21 — worse than the base. The model had learned the shape of a cited answer so well that it started refusing answers it used to give.',
            'The second recipe changed two things: loss over the completion only, and gentler training — two epochs, learning rate 7e-5, about five minutes on one consumer GPU. Result: 21/21 covered, 3/3 honest refusals, deterministic across re-runs, at ~310-355 ms and 1.2 GB.',
          ],
          es: [
            'El dataset salió del 4B en funciones de maestro sobre el pipeline real de retrieval. Inventó 174 preguntas de visitante en tres lenguas — 77 simples, 65 fuera de corpus, 32 compuestas — y las respondió bajo los prompts exactos de producción. Cada completación pasó por la política de citas de producción antes de entrar en el dataset; nada que no sobreviviera a la puerta se convirtió en lección. Las 21 preguntas golden quedaron excluidas del dataset, así que la puntuación final mide cómo generaliza el modelo a preguntas que nunca vio en el entrenamiento.',
            'La primera receta falló de forma útil. Tres épocas con loss sobre la secuencia completa anotaron 15/21 — peor que la base. El modelo había aprendido tan bien la forma de una respuesta citada que empezó a rechazar respuestas que antes daba.',
            'La segunda receta cambió dos cosas: loss sobre la completación únicamente, y entrenamiento más suave — dos épocas, learning rate 7e-5, unos cinco minutos en una GPU de consumo. Resultado: 21/21 cubiertas, 3/3 rechazos honestos, determinista entre re-ejecuciones, a ~310-355 ms y 1,2 GB.',
          ],
          ca: [
            'El dataset va sortir del 4B fent de mestre sobre el pipeline real de retrieval. Va inventar 174 preguntes de visitant en tres llengües — 77 simples, 65 fora de corpus, 32 compostes — i les va respondre sota els prompts exactes de producció. Cada completació va passar per la política de cites de producció abans d’entrar al dataset; res que no hagués sobreviscut a la porta es va convertir en lliçó. Les 21 preguntes golden van quedar excloses del dataset, així que la puntuació final mesura com generalitza el model a preguntes que mai va veure durant l’entrenament.',
            'La primera recepta va fallar d’una manera útil. Tres èpoques amb loss sobre la seqüència sencera van anotar 15/21 — pitjor que la base. El model havia après tan bé la forma d’una resposta citada que va començar a refusar respostes que abans donava.',
            'La segona recepta va canviar dues coses: loss només sobre la completació, i entrenament més suau — dues èpoques, learning rate 7e-5, uns cinc minuts en una GPU de consum. Resultat: 21/21 cobertes, 3/3 refusos honestos, determinista entre re-execucions, a ~310-355 ms i 1,2 GB.',
          ],
        }),
      },
      {
        anchor: 'production',
        heading: {
          en: 'Production, verified',
          es: 'Producción, verificada',
          ca: 'Producció, verificada',
        },
        blocks: paragraphBlocks({
          en: [
            'The swap was one model file and one environment variable to pin the chat template to non-thinking mode. Live verification: the compound question the base refused now answers covered, citing both the CV and the Kafka repo. The eval gate runs the full battery inside the container on every deploy, and rollback is one line — the old 4B still sits in the models folder, just in case the gate and I ever disagree again.',
            'Final scorecard: 21/21 covered, 3/3 honest refusals, ~310-355 ms p50, 1.2 GB resident — half the latency and half the memory of the model it replaced. The model, the dataset and the three training scripts are public.',
          ],
          es: [
            'El cambio fue un archivo de modelo y una variable de entorno para fijar la plantilla de chat en modo no-thinking. Verificación en vivo: la pregunta compuesta que la base rechazaba ahora responde cubierta, citando tanto el CV como el repo de Kafka. La puerta de evals corre la batería completa dentro del contenedor en cada despliegue, y el rollback es una línea — el viejo 4B sigue en la carpeta de modelos, por si la puerta y yo volvemos a discrepar.',
            'Marcador final: 21/21 cubiertas, 3/3 rechazos honestos, ~310-355 ms p50, 1,2 GB residentes — la mitad de latencia y la mitad de memoria del modelo al que sustituyó. El modelo, el dataset y los tres scripts de entrenamiento son públicos.',
          ],
          ca: [
            'El canvi va ser un fitxer de model i una variable d’entorn per fixar la plantilla de xat en mode no-thinking. Verificació en viu: la pregunta composta que la base refusava ara respon coberta, citant tant el CV com el repo de Kafka. La porta d’evals corre la bateria completa dins del contenidor a cada desplegament, i el rollback és una línia — el vell 4B segueix a la carpeta de models, per si la porta i jo tornem a discrepar.',
            'Marcador final: 21/21 cobertes, 3/3 refusos honestos, ~310-355 ms p50, 1,2 GB residents — la meitat de latència i la meitat de memòria del model que va substituir. El model, el dataset i els tres scripts d’entrenament són públics.',
          ],
        }),
      },
      {
        anchor: 'receipts',
        heading: {
          en: 'Receipts',
          es: 'Recibos',
          ca: 'Rebuts',
        },
        blocks: paragraphBlocks({
          en: [
            'The fine-tuned model is on <a href="https://huggingface.co/jordimarsal/Qwen3.5-2B-porter-GGUF" target="_blank" rel="noopener noreferrer">Hugging Face</a>, with the dataset and the pipeline. The training and merge scripts live in the <a href="https://github.com/jordimarsal/jordimp/tree/main/ask-api/finetune" target="_blank" rel="noopener noreferrer">ask-api/finetune directory</a> of the jordimp repo, next to the eval gate they had to pass. And the concierge is downstairs, by the door — ring the bell and ask it anything. Now you know how its brain was chosen.',
          ],
          es: [
            'El modelo afinado está en <a href="https://huggingface.co/jordimarsal/Qwen3.5-2B-porter-GGUF" target="_blank" rel="noopener noreferrer">Hugging Face</a>, con el dataset y el pipeline. Los scripts de entrenamiento y merge viven en el <a href="https://github.com/jordimarsal/jordimp/tree/main/ask-api/finetune" target="_blank" rel="noopener noreferrer">directorio ask-api/finetune</a> del repo jordimp, al lado de la puerta de evals que tuvieron que pasar. Y el conserje está abajo, junto a la puerta — toca el timbre y pregúntale lo que quieras. Ahora sabes cómo se eligió su cerebro.',
          ],
          ca: [
            'El model afinat és a <a href="https://huggingface.co/jordimarsal/Qwen3.5-2B-porter-GGUF" target="_blank" rel="noopener noreferrer">Hugging Face</a>, amb el dataset i el pipeline. Els scripts d’entrenament i merge viuen al <a href="https://github.com/jordimarsal/jordimp/tree/main/ask-api/finetune" target="_blank" rel="noopener noreferrer">directori ask-api/finetune</a> del repo jordimp, al costat de la porta d’evals que van haver de passar. I el porter és a baix, vora la porta — trona el timbre i pregunta-li el que vulguis. Ara ja saps com es va triar el seu cervell.',
          ],
        }),
      },
    ],
  },
  {
    slug: 'which-local-model-for-coding-agents',
    date: '2026-10-13',
    revision: 'REV B',
    dateLabel: { en: 'FILED', es: 'REGISTRADO', ca: 'REGISTRAT' },
    title: {
      en: 'Which local model should a coding agent run? Six GGUFs and a Strata engine, one harness, receipts',
      es: '¿Qué modelo local debería ejecutar un agente de código? Seis GGUFs y un motor Strata, un harness, recibos',
      ca: 'Quin model local hauria d’executar un agent de codi? Sis GGUFs i un motor Strata, un harness, rebuts',
    },
    description: {
      en: 'Which GGUF should a coding agent load? Six models under llama.cpp plus one under the Strata engine, one harness, four dimensions — tools, code, agent and speed — measured on two RTX 5080s, with the receipts of every call.',
      es: '¿Qué GGUF debería cargar un agente de código? Seis modelos bajo llama.cpp y uno bajo el motor Strata, un harness, cuatro dimensiones — herramientas, código, agente y velocidad — medidas en dos RTX 5080, con los recibos de cada llamada.',
      ca: 'Quin GGUF hauria de carregar un agent de codi? Sis models sota llama.cpp i un sota el motor Strata, un harness, quatre dimensions — eines, codi, agent i velocitat — mesurades en dues RTX 5080, amb els rebuts de cada crida.',
    },
    lead: {
      en: 'One harness, same conditions, four dimensions, and the raw receipts of every call — this round, six GGUFs under llama.cpp plus one model under the Strata engine, each in both thinking modes.',
      es: 'Un harness, las mismas condiciones, cuatro dimensiones y los recibos en bruto de cada llamada — esta ronda, seis GGUFs bajo llama.cpp y un modelo bajo el motor Strata, cada uno en los dos modos de thinking.',
      ca: 'Un harness, les mateixes condicions, quatre dimensions i els rebuts en brut de cada crida — aquesta ronda, sis GGUFs sota llama.cpp i un model sota el motor Strata, cadascun en els dos modes de thinking.',
    },
    sections: [
      {
        anchor: 'the-question',
        heading: { en: 'The question', es: 'La pregunta', ca: 'La pregunta' },
        blocks: [
          {
            kind: 'paragraph',
            html: {
              en: 'I run coding agents on my own hardware. llama.cpp on two RTX 5080s, models from my <code>models</code> folder, and one question: which GGUF, at which quant, should I load before I start working?',
              es: 'Ejecuto agentes de código en mi propio hardware. llama.cpp en dos RTX 5080, modelos de mi carpeta <code>models</code>, y una pregunta: ¿qué GGUF, en qué quant, debo cargar antes de ponerme a trabajar?',
              ca: 'Executo agents de codi al meu propi maquinari. llama.cpp en dues RTX 5080, models de la meva carpeta <code>models</code>, i una pregunta: quin GGUF, en quin quant, hauria de carregar abans de posar-me a treballar?',
            },
          },
          {
            kind: 'paragraph',
            html: {
              en: 'Public leaderboards measure something else. They are mostly trained on, they score single-shot answers, and they say nothing about whether a model can call a tool with well-formed arguments, survive a multi-call loop, read a folder, edit a file, and verify its own change. That is the work an agent does all day, so I stopped reading those tables for this decision and built <a href="https://github.com/jordimarsal/ggufbench">ggufbench</a>.',
              es: 'Los leaderboards públicos miden otra cosa. En su mayoría, los modelos están entrenados sobre ellos, puntúan respuestas de un solo disparo y no dicen nada sobre si un modelo sabe llamar a una herramienta con argumentos bien formados, sobrevivir a un bucle de varias llamadas, leer una carpeta, editar un archivo y verificar su propio cambio. Esa es la faena que hace un agente todo el día, así que dejé de leer esas tablas para esta decisión y construí <a href="https://github.com/jordimarsal/ggufbench">ggufbench</a>.',
              ca: 'Els leaderboards públics mesuren una altra cosa. La majoria dels models hi estan entrenats, puntuen respostes d’un sol tret i no diuen res sobre si un model sap cridar una eina amb arguments ben formats, sobreviure a un bucle de diverses crides, llegir una carpeta, editar un fitxer i verificar el seu propi canvi. Aquesta és la feina que fa un agent tot el dia, així que vaig deixar de llegir aquestes taules per a aquesta decisió i vaig construir <a href="https://github.com/jordimarsal/ggufbench">ggufbench</a>.',
            },
          },
        ],
      },
      {
        anchor: 'the-rules',
        heading: {
          en: 'The rules that make the numbers mean something',
          es: 'Las reglas que hacen que los números signifiquen algo',
          ca: 'Les regles que fan que els números signifiquin alguna cosa',
        },
        blocks: [
          {
            kind: 'paragraph',
            html: {
              en: 'Every model runs with identical sampling: temperature 0.2, top-p 0.95, top-k 40, min-p 0.05, seed 42, KV cache q8_0, <code>--jinja</code>, one slot. Every sampler value is pinned explicitly, because a GGUF carries its own sampling metadata — this fleet alone ships three different <code>top_k</code> settings (20, 64, and none at all) — and an unpinned value is not a shared condition but a per-model one. The settings are fixed in two places, the server flags and the request body, so config drift on the server cannot leak into a comparison.',
              es: 'Cada modelo se ejecuta con el mismo muestreo: temperatura 0.2, top-p 0.95, top-k 40, min-p 0.05, semilla 42, KV cache q8_0, <code>--jinja</code>, un solo slot. Cada valor del muestreo está fijado explícitamente, porque un GGUF lleva su propia metadata de muestreo — esta flota sola embarca tres valores distintos de <code>top_k</code> (20, 64 y ninguno) — y un valor no fijado no es una condición compartida sino una por modelo. Los ajustes están fijados en dos sitios, los flags del servidor y el cuerpo de la petición, para que una deriva de configuración en el servidor no se cuele en una comparación.',
              ca: 'Cada model s’executa amb el mateix mostreig: temperatura 0.2, top-p 0.95, top-k 40, min-p 0.05, llavor 42, KV cache q8_0, <code>--jinja</code>, un sol slot. Cada valor del mostreig està fixat explícitament, perquè un GGUF porta la seva pròpia metadata de mostreig — aquesta flota sola embarca tres valors diferents de <code>top_k</code> (20, 64 i cap) — i un valor no fixat no és una condició compartida sinó una de per model. Els ajustos estan fixats en dos llocs, els flags del servidor i el cos de la petició, perquè una deriva de configuració al servidor no es coli en una comparació.',
            },
          },
          {
            kind: 'paragraph',
            html: {
              en: 'Every model keeps its own profile file. That profile applies last and can override the baseline, so models compete in their best real configuration and not in a lab rig I invented. The harness fixes the infrastructure flags, and what each model ended up running with is recorded in its result row.',
              es: 'Cada modelo conserva su archivo de perfil. Ese perfil se aplica al final y puede sobrescribir la línea base, así que los modelos compiten en su mejor configuración real y no en un montaje de laboratorio que haya inventado yo. El harness fija los flags de infraestructura, y aquello con lo que acabó corriendo cada modelo queda registrado en su fila de resultado.',
              ca: 'Cada model conserva el seu fitxer de perfil. Aquest perfil s’aplica al final i pot sobreescriure la línia base, així que els models competeixen en la seva millor configuració real i no en un muntatge de laboratori que hagi inventat jo. El harness fixa els flags d’infraestructura, i allò amb què va acabar corrent cada model queda registrat a la seva fila de resultat.',
            },
          },
          {
            kind: 'paragraph',
            html: {
              en: 'Exclusions are annotated with a reason. A model that runs out of time or answers with prose where a code block was expected does not silently vanish from the average; it shows up in the report, counted.',
              es: 'Las exclusiones se anotan con un motivo. Un modelo que agota el tiempo o responde con prosa donde se esperaba un bloque de código no desaparece en silencio de la media; aparece en el informe, contado.',
              ca: 'Les exclusions s’anoten amb un motiu. Un model que esgota el temps o respon amb prosa on s’esperava un bloc de codi no desapareix en silenci de la mitjana; surt a l’informe, comptat.',
            },
          },
          {
            kind: 'paragraph',
            html: {
              en: 'The harness uses only the Python standard library. No dependency tree to rot while the benchmark waits.',
              es: 'El harness solo usa la biblioteca estándar de Python. Ningún árbol de dependencias que se pudra mientras el benchmark espera.',
              ca: 'El harness només fa servir la biblioteca estàndard de Python. Cap arbre de dependències que es podreixi mentre el benchmark espera.',
            },
          },
          {
            kind: 'paragraph',
            html: {
              en: 'Every task stores three runs, seeds 42, 43 and 44, and the scoreboard reports mean ± standard deviation. When a row says <code>0.85 ±1</code>, that spread is part of the answer.',
              es: 'Cada tarea guarda tres ejecuciones, semillas 42, 43 y 44, y el marcador informa de media ± desviación estándar. Cuando una fila dice <code>0.85 ±1</code>, esa dispersión forma parte de la respuesta.',
              ca: 'Cada tasca guarda tres execucions, llavors 42, 43 i 44, i el marcador informa de mitjana ± desviació estàndard. Quan una fila diu <code>0.85 ±1</code>, aquesta dispersió forma part de la resposta.',
            },
          },
        ],
      },
      {
        anchor: 'the-scoreboard',
        heading: { en: 'What the scoreboard said', es: 'Lo que dijo el marcador', ca: 'Què va dir el marcador' },
        blocks: [
          {
            kind: 'paragraph',
            html: {
              en: 'The current pool runs set v5: 18 tool tasks, 72 code tasks across four languages (32 easy, 20 hard, 20 expert), 72 multi-step agent tasks (13 of them multi-file projects) and a 32K output budget for code. The rows below were measured on the night of 2026-10-14/15. The top of the table:',
              es: 'El pool actual ejecuta el conjunto v5: 18 tareas de herramientas, 72 de código en cuatro lenguajes (32 fáciles, 20 difíciles, 20 expertas), 72 tareas de agente multipaso (13 de ellas proyectos de varios archivos) y 32K de presupuesto de salida para el código. Las filas de abajo se midieron la noche del 2026-10-14/15. La parte alta de la tabla:',
              ca: 'El pool actual executa el conjunt v5: 18 tasques d’eines, 72 de codi en quatre llenguatges (32 fàcils, 20 difícils, 20 expertes), 72 tasques d’agent multipas (13 de les quals projectes de diversos fitxers) i 32K de pressupost de sortida per al codi. Les files de sota es van mesurar la nit del 2026-10-14/15. La part alta de la taula:',
            },
          },
          { kind: 'table', head: [...GGUF_SCOREBOARD.head], rows: GGUF_SCOREBOARD.rows.map((row) => [...row]) },
          {
            kind: 'paragraph',
            html: {
              en: '★ = each model’s optimal thinking mode by data: quality within ±0.02 of the other mode and no extra wall clock; exact ties go to off.',
              es: '★ = el modo thinking óptimo de cada modelo según los datos: calidad dentro de ±0.02 del otro modo y sin más tiempo de reloj; los empates exactos van a off.',
              ca: '★ = el mode thinking òptim de cada model segons les dades: qualitat dins de ±0.02 de l’altre mode i sense més temps de rellotge; els empats exactes van a off.',
            },
          },
          {
            kind: 'paragraph',
            html: {
              en: 'Three things stood out.',
              es: 'Tres cosas destacaron.',
              ca: 'Tres coses van destacar.',
            },
          },
          {
            kind: 'subheading',
            anchor: 'ties',
            text: { en: 'The top rows are ties', es: 'Las primeras filas son empates', ca: 'Les primeres files són empats' },
          },
          {
            kind: 'paragraph',
            html: {
              en: 'The top ten rows span five hundredths of a point — 0.85 down to 0.80 — and neighbouring rows sit at most one or two hundredths apart, the same size as the run-to-run spread printed beside each score. The global score ranks a fleet; it does not certify that row 1 beats row 7. Anyone ranking two close rows by their second decimal is quoting noise.',
              es: 'Las diez primeras filas abarcan cinco centésimas — de 0.85 a 0.80 — y las filas vecinas quedan como máximo a una o dos centésimas, del mismo tamaño que la dispersión entre tiradas que acompaña a cada puntuación. La puntuación global ordena una flota; no certifica que la fila 1 supere a la 7. Quien ordene dos filas cercanas por su segundo decimal está citando ruido.',
              ca: 'Les deu primeres files abasten cinc centèsimes — de 0.85 a 0.80 — i les files veïnes queden com a màxim a una o dues centèsimes, de la mateixa mida que la dispersió entre tirades que acompanya cada puntuació. La puntuació global ordena una flota; no certifica que la fila 1 superi la 7. Qui ordeni dues files properes pel segon decimal està citant soroll.',
            },
          },
          {
            kind: 'subheading',
            anchor: 'thinking',
            text: {
              en: 'Thinking mode is a tax that only pays in hard code',
              es: 'El modo thinking es un impuesto que solo paga en el código difícil',
              ca: 'El mode thinking és un impost que només paga al codi difícil',
            },
          },
          {
            kind: 'paragraph',
            html: {
              en: 'I measured it as separate rows instead of folding it into one number. Thinking ON multiplies turn latency — every ON row but MiniCPM’s runs 280–1060 ms against 19–85 ms OFF (MiniCPM’s ON lands at 23 ms) — and it costs quality in every model as well, with MiniCPM the only tie. It also concentrates the exclusions: across the fleet’s 1512 code runs per mode, OFF excludes 6 and ON excludes 101, most of them answers with no code block where one was expected (fully excluded tasks: 2 against 14).',
              es: 'Lo medí como filas separadas en lugar de fundirlo en un solo número. Thinking on multiplica la latencia por turno — cada fila on excepto la del MiniCPM corre entre 280 y 1060 ms contra los 19–85 ms de off (la on del MiniCPM aterriza en 23 ms) — y también cuesta calidad en todos los modelos, con el MiniCPM como único empate. Además, concentra las exclusiones: de las 1512 ejecuciones de código de la flota por modo, off excluye 6 y on excluye 101, la mayoría respuestas sin bloque de código donde se esperaba uno (tareas completamente excluidas: 2 contra 14).',
              ca: 'Ho vaig mesurar com a files separades en lloc de fondre’ho en un sol número. Thinking on multiplica la latència per torn — cada fila on excepte la del MiniCPM corre entre 280 i 1060 ms contra els 19–85 ms de off (la on del MiniCPM aterra als 23 ms) — i també costa qualitat a tots els models, amb el MiniCPM com a únic empat. A més, concentra les exclusions: de les 1512 execucions de codi de la flota per mode, off n’exclou 6 i on n’exclou 101, la majoria respostes sense bloc de codi on se n’esperava un (tasques completament excloses: 2 contra 14).',
            },
          },
          {
            kind: 'paragraph',
            html: {
              en: 'Where it does buy something is the hard code tier: UD-Q3 climbs from 79% to 93% on code overall (92% hard, 91% expert), Ornith +10 points over its own OFF, strata +6, Heretic +4 — and Heretic’s agent loop reaches 97%, the fleet’s best. On the tasks that need it, thinking is worth ten times the wait; everywhere else it is a tax with no visible return.',
              es: 'Donde sí compra algo es en el nivel difícil de código: el UD-Q3 sube del 79% al 93% en el código global (92% difícil, 91% experto), el Ornith +10 puntos sobre su propio off, el Strata +6, el Heretic +4 — y el bucle de agente del Heretic llega al 97%, el mejor de la flota. En las tareas que lo necesitan, el thinking vale diez veces la espera; en el resto, es un impuesto sin retorno visible.',
              ca: 'On sí que compra alguna cosa és al nivell difícil de codi: l’UD-Q3 puja del 79% al 93% en el codi global (92% difícil, 91% expert), l’Ornith +10 punts sobre el seu propi off, l’Strata +6, l’Heretic +4 — i el bucle d’agent de l’Heretic arriba al 97%, el millor de la flota. A les tasques que ho necessiten, el thinking val deu vegades l’espera; a la resta, és un impost sense retorn visible.',
            },
          },
          {
            kind: 'subheading',
            anchor: 'easy',
            text: {
              en: 'Easy code tasks don’t discriminate',
              es: 'Las tareas fáciles de código no discriminan',
              ca: 'Les tasques fàcils de codi no discriminen',
            },
          },
          {
            kind: 'paragraph',
            html: {
              en: 'With thinking off the entire fleet lands between 91% and 100% on the easy tier, while hard and expert live between 47% and 87%. Those two levels are where the separation is — especially the expert ones, built from multi-bug debugging with strict output contracts (return the full corrected file, exact rounding, defensive copies). The scoreboard folds all three levels into one code column; the per-level breakdown it records (<code>by_level</code>) is where the arguments happen.',
              es: 'Con thinking off, toda la flota aterriza entre el 91% y el 100% en el nivel fácil, mientras que difícil y experto viven entre el 47% y el 87%. La separación está en esos dos niveles — sobre todo en las expertas, construidas con depuración de varios errores y contratos de salida estrictos (devolver el archivo completo corregido, redondeo exacto, copias defensivas). El marcador funde los tres niveles en una columna de código; el desglose por nivel que registra (<code>by_level</code>) es donde vive la discusión.',
              ca: 'Amb thinking off, tota la flota aterra entre el 91% i el 100% al nivell fàcil, mentre que difícil i expert viuen entre el 47% i el 87%. La separació és en aquests dos nivells — sobretot a les expertes, construïdes amb depuració de diversos errors i contractes de sortida estrictes (tornar el fitxer complet corregit, arrodoniment exacte, còpies defensives). El marcador fon els tres nivells en una columna de codi; el desglossament per nivell que registra (<code>by_level</code>) és on viu la discussió.',
            },
          },
        ],
      },
      {
        anchor: 'advice',
        heading: { en: 'What I would tell you to do', es: 'Lo que te recomendaría hacer', ca: 'Què et recomanaria fer' },
        blocks: [
          {
            kind: 'paragraph',
            html: {
              en: 'Pick by dimension. In this table, tools belong to MiniCPM (100%), hard code to UD-Q3 with thinking (92% hard, 91% expert), the agent loop to Heretic with thinking (97%), and per-turn speed to qwen36 off (19 ms). No row wins everything.',
              es: 'Elige por dimensión. En esta tabla, las herramientas son del MiniCPM (100%), el código difícil del UD-Q3 con thinking (92% difícil, 91% experto), el bucle de agente del Heretic con thinking (97%) y la velocidad por turno del qwen36 off (19 ms). Ninguna fila lo gana todo.',
              ca: 'Tria per dimensió. En aquesta taula, les eines són del MiniCPM (100%), el codi difícil de l’UD-Q3 amb thinking (92% difícil, 91% expert), el bucle d’agent de l’Heretic amb thinking (97%) i la velocitat per torn del qwen36 off (19 ms). Cap fila ho guanya tot.',
            },
          },
          {
            kind: 'paragraph',
            html: {
              en: 'Measure on your own hardware with your own profiles. A quant that is comfortable on two 5080s is a slideshow on one, and the result changes with the KV cache configuration.',
              es: 'Mide en tu propio hardware con tus propios perfiles. Un quant que va cómodo en dos 5080 es una presentación de diapositivas en una, y el resultado cambia con la configuración del KV cache.',
              ca: 'Mesura al teu maquinari amb els teus propis perfils. Un quant que va còmode en dues 5080 és una presentació de diapositives en una, i el resultat canvia amb la configuració del KV cache.',
            },
          },
          {
            kind: 'paragraph',
            html: {
              en: 'Read the exclusions. A model that fails to format a tool call once in a while is not slightly worse than one that never misses. In an agent loop, it stops.',
              es: 'Lee las exclusiones. Un modelo que falla al formatear una llamada de herramienta de vez en cuando no es un poco peor que otro que siempre acierta. En un bucle de agente, lo detiene.',
              ca: 'Llegeix les exclusions. Un model que falla a l’hora de formatar una crida d’eina de tant en tant no és una mica pitjor que un que sempre l’encerta. En un bucle d’agent, l’atura.',
            },
          },
          {
            kind: 'paragraph',
            html: {
              en: 'Treat close rows as ties. Ten rows inside five hundredths of a point is not a ranking, it is a group. I choose inside it by latency and by how a model behaves when a call fails, not by the third decimal of a score.',
              es: 'Trata las filas cercanas como empates. Diez filas dentro de cinco centésimas no son una clasificación, son un grupo. Elijo dentro de él por latencia y por cómo se comporta un modelo cuando falla una llamada, no por el tercer decimal de una puntuación.',
              ca: 'Tracta les files properes com a empats. Deu files dins de cinc centèsimes no són una classificació, són un grup. Trio dins seu per latència i per com es comporta un model quan falla una crida, no pel tercer decimal d’una puntuació.',
            },
          },
        ],
      },
      {
        anchor: 'fine-print',
        heading: { en: 'The fine print', es: 'La letra pequeña', ca: 'La lletra petita' },
        blocks: [
          {
            kind: 'paragraph',
            html: {
              en: 'The tasks are written for this harness, the reference solutions never leave the machine, and the models under test are the consumer-GPU quants people actually run. Scores answer "which GGUF should I run for agentic work", not "how smart is this model". Two thinking-ON rows (gemma, strata) were measured under tighter tool-loop caps than the rest and are flagged in the report as owed a fair pass; the thirteen models retired along the way live in its Retired tab, record only. Full method in <code>docs/SPEC.md</code> of the repository.',
              es: 'Las tareas están escritas para este harness, las soluciones de referencia no salen nunca de la máquina y los modelos bajo prueba son los quants de GPU de consumo que la gente ejecuta. Las puntuaciones responden a "qué GGUF debería ejecutar para trabajo agéntico", no a "cuán listo es este modelo". Dos filas thinking-on (gemma, strata) se midieron con límites de llamadas más estrechos que el resto y el informe las marca como pendientes de una pasada justa; los trece modelos retirados por el camino viven en su pestaña Retired, solo registro. Método completo en <code>docs/SPEC.md</code> del repositorio.',
              ca: 'Les tasques estan escrites per a aquest harness, les solucions de referència no surten mai de la màquina i els models sota prova són els quants de GPU de consum que la gent executa. Les puntuacions responen a "quin GGUF hauria d’executar per a treball agentic", no a "com n’és de llest aquest model". Dues files thinking-on (gemma, strata) es van mesurar amb límits de cridades més estrets que la resta i l’informe les marca com a pendents d’una passada justa; els tretze models retirats pel camí viuen a la seva pestanya Retired, només registre. Mètode complet a <code>docs/SPEC.md</code> del repositori.',
            },
          },
          {
            kind: 'paragraph',
            html: {
              en: 'Scoreboard and live report: <a href="https://jordimarsal.github.io/ggufbench/">jordimarsal.github.io/ggufbench</a>. Code, tasks and receipts: <a href="https://github.com/jordimarsal/ggufbench">github.com/jordimarsal/ggufbench</a>.',
              es: 'Marcador e informe en vivo: <a href="https://jordimarsal.github.io/ggufbench/">jordimarsal.github.io/ggufbench</a>. Código, tareas y recibos: <a href="https://github.com/jordimarsal/ggufbench">github.com/jordimarsal/ggufbench</a>.',
              ca: 'Marcador i informe en directe: <a href="https://jordimarsal.github.io/ggufbench/">jordimarsal.github.io/ggufbench</a>. Codi, tasques i rebuts: <a href="https://github.com/jordimarsal/ggufbench">github.com/jordimarsal/ggufbench</a>.',
            },
          },
        ],
      },
    ],
    about: 'https://github.com/jordimarsal/ggufbench',
  },
  {
    slug: 'rag-eval-gate',
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
      blocks: paragraphBlocks({
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
      }),
    },
    {
      anchor: 'golden-set',
      heading: {
        en: 'The golden set: turning “right” into forty checkable pairs',
        es: 'El set golden: convertir lo «correcto» en cuarenta pares verificables',
        ca: 'El set golden: convertir el «correcte» en quaranta parells verificables',
      },
      blocks: paragraphBlocks({
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
      }),
    },
    {
      anchor: 'ci-gate',
      heading: {
        en: 'The CI gate: what fails, what does not',
        es: 'La puerta de CI: qué falla y qué no',
        ca: 'La porta de CI: què falla i què no',
      },
      blocks: paragraphBlocks({
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
      }),
    },
    {
      anchor: 'hexagonal',
      heading: {
        en: 'Why hexagonal: swapping Qdrant must not rewrite the core',
        es: 'Por qué hexagonal: cambiar Qdrant no debe reescribir el core',
        ca: 'Per què hexagonal: canviar Qdrant no ha de reescriure el core',
      },
      blocks: paragraphBlocks({
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
      }),
    },
    {
      anchor: 'baseline',
      heading: {
        en: 'Current baseline and what it does not claim',
        es: 'La baseline actual y lo que no afirma',
        ca: 'La baseline actual i què no afirma',
      },
      blocks: paragraphBlocks({
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
      }),
    },
  ],
  about: 'https://github.com/jordimarsal/codebaserag',
},
];

export const BLOG_UI = {
  rowLabel: { en: 'READ THE POST', es: 'LEE LA ENTRADA', ca: 'LLEGEIX L’ENTRADA' },
  movedLine: { en: 'This essay moved to the blog.', es: 'Este ensayo se mudó al blog.', ca: 'Aquest assaig es va moure al blog.' },
} as const;

export const post = (slug: string): PostContent => {
  const found = POSTS.find((candidate) => candidate.slug === slug);
  if (!found) throw new Error(`unknown post: ${slug}`);
  return found;
};

const FRONTDESK_TITLE: L10n<string> = {
  en: 'B · Front Desk — Jordimp & Co.',
  es: 'B · Recepción — Jordimp & Co.',
  ca: 'B · Recepció — Jordimp & Co.',
};

const FRONTDESK_DESCRIPTION: L10n<string> = {
  en: 'Walk-ins welcome: senior or staff backend roles, short spec-first engagements, and questions about a floor or a repo — no tracking, no funnel. Jordimp & Co. is how the work is done, not a staffing firm.',
  es: 'Entrada libre: roles backend senior o staff, encargos cortos con spec primero y preguntas sobre una planta o un repo — sin tracking, sin funnel. Jordimp & Co. es como se hace el trabajo, no una consultora de personal.',
  ca: 'Entrada lliure: rols backend sènior o staff, encàrrecs curts amb spec primer i preguntes sobre una planta o un repo — sense tracking, sense funnel. Jordimp & Co. és com es fa la feina, no una consultora de personal.',
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
      en: 'Twelve projects in three tiers — thesis, satellites and annex — across backend systems, event pipelines, applied AI and tooling. Filter by the stack you care about.',
      es: 'Doce proyectos en tres niveles — tesis, satélites y anexo — entre sistemas backend, pipelines de eventos, IA aplicada y herramientas. Filtra por el stack que te interese.',
      ca: 'Dotze projectes en tres nivells — tesi, satèl·lits i annex — entre sistemes backend, pipelines d’esdeveniments, IA aplicada i eines. Filtra pel stack que et vagi bé.',
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
  blog: {
    route: 'blog.html',
    nav: 'blog',
    title: { en: 'Blog — Jordimp & Co.', es: 'Blog — Jordimp & Co.', ca: 'Blog — Jordimp & Co.' },
    description: {
      en: 'Long-form notes from the workshop floor: local-LLM benchmarks, retrieval evals and the receipts behind every claim.',
      es: 'Notas largas desde el taller: benchmarks de LLM locales, evals de retrieval y los recibos detrás de cada afirmación.',
      ca: 'Notes llargues des del taller: benchmarks de LLM locals, evals de retrieval i els rebuts darrere de cada afirmació.',
    },
  },
  'post-ggufbench': {
    route: 'blog/which-local-model-for-coding-agents.html',
    nav: 'blog',
    title: withBrand(post('which-local-model-for-coding-agents').title),
    description: post('which-local-model-for-coding-agents').description,
  },
  'post-porter-brain': {
    route: 'blog/sixteen-models-one-gate.html',
    nav: 'blog',
    title: withBrand(post('sixteen-models-one-gate').title),
    description: post('sixteen-models-one-gate').description,
  },
  'article-rag-eval-gate': {
    route: 'blog/rag-eval-gate.html',
    nav: 'blog',
    title: withBrand(post('rag-eval-gate').title),
    description: post('rag-eval-gate').description,
  },
  'article-rag-eval-gate-redirect': {
    route: 'writing/rag-eval-gate.html',
    nav: 'blog',
    title: withBrand(post('rag-eval-gate').title),
    description: post('rag-eval-gate').description,
    redirect: 'blog/rag-eval-gate.html',
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
      en: 'The workshop floor: harness, ggufbench, md-mermaid-pdf and mcp-transparent-png — deliberately small tools, production standards.',
      es: 'El taller: harness, ggufbench, md-mermaid-pdf y mcp-transparent-png — herramientas deliberadamente pequeñas, estándares de producción.',
      ca: 'El taller: harness, ggufbench, md-mermaid-pdf i mcp-transparent-png — eines deliberadament petites, estàndards de producció.',
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
    title: FRONTDESK_TITLE,
    description: FRONTDESK_DESCRIPTION,
  },
  contact: {
    route: 'contact.html',
    nav: 'departments',
    title: FRONTDESK_TITLE,
    description: FRONTDESK_DESCRIPTION,
    redirect: 'departments/front-desk.html',
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

export const pageForPost = (candidate: PostContent): PageMeta => {
  const route = `blog/${candidate.slug}.html`;
  const page = Object.values(PAGES).find((entry) => entry.route === route);
  if (!page) throw new Error(`unregistered post route: ${route}`);
  return page;
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
  impact: { en: 'Impact', es: 'Impacto', ca: 'Impacte' },
  fieldNotes: { en: 'Field notes', es: 'Notas de campo', ca: 'Notes de camp' },
  stack: { en: 'STACK', es: 'STACK', ca: 'STACK' },
  visitRepo: { en: 'VISIT THE REPO', es: 'VISITA EL REPO', ca: 'VISITA EL REPO' },
  qualityReport: { en: 'QUALITY REPORT — SONAR METRICS', es: 'INFORME DE CALIDAD — MÉTRICAS SONAR', ca: 'INFORME DE QUALITAT — MÈTRIQUES SONAR' },
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
  demoTitle: { en: 'The 45-second demo', es: 'La demo de 45 segundos', ca: 'La demo de 45 segons' },
};

export const TOOLING_PAGE: ToolingPageContent = {
  stats: {
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
  },
  workTitle: { en: 'The workshop bench', es: 'La mesa del taller', ca: 'La taula del taller' },
  noteTitle: { en: 'Workshop rule', es: 'Regla del taller', ca: 'Regla del taller' },
  noteBody: {
    en: 'Every tool on this floor does one thing and gets out of the way. The harness standardizes the process, not your code; each CLI automates exactly one boring step. Small is a feature.',
    es: 'Cada herramienta de esta planta hace una sola cosa y no se mete. El harness estandariza el proceso, no tu código; cada CLI automatiza exactamente un paso aburrido. Pequeño es una característica.',
    ca: 'Cada eina d’aquesta planta fa una sola cosa i no s’entremet. El harness estandarditza el procés, no el teu codi; cada CLI automatitza exactament un pas avorrit. Petit és una característica.',
  },
  installTitle: { en: '1 cmd install', es: '1 comando instala', ca: '1 comanda instal·la' },
  installCmd: 'curl -fsSL https://jordimp.net/harness/install.sh | bash -s -- --tool=claude',
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
  shelfLine: {
    en: 'THE PRINTED EDITION IS ON THE SHELF — TAKE THE PDF IN ENGLISH OR SPANISH.',
    es: 'LA EDICIÓN IMPRESA ESTÁ EN LA BALDA — LLÉVATE EL PDF EN INGLÉS O ESPAÑOL.',
    ca: 'L’EDICIÓ IMPRESA ÉS A LA PRESTATGERIA — EMPORTA’T EL PDF EN ANGLÈS O ESPAÑOL.',
  },
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
