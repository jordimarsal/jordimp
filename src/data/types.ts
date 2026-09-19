export type Locale = 'en' | 'es' | 'ca';

export type L10n<T> = Record<Locale, T>;

export type DeptKey = 'research' | 'telemetry' | 'tooling' | 'people' | 'operations' | 'frontdesk';

export type NavKey = 'home' | 'work' | 'cv' | 'departments';

export interface SiteInfo {
  readonly brand: string;
  readonly person: string;
  readonly role: L10n<string>;
  readonly tagline: L10n<string>;
  readonly url: string;
  readonly email: string;
  readonly github: string;
  readonly linkedin: string;
  readonly est: string;
  readonly city: L10n<string>;
  readonly year: string;
}

export interface LocaleInfo {
  readonly name: string;
  readonly short: string;
  readonly htmlLang: string;
  readonly og: string;
}

export interface NavLabels {
  readonly home: L10n<string>;
  readonly departments: L10n<string>;
  readonly work: L10n<string>;
  readonly cv: L10n<string>;
  readonly contact: L10n<string>;
}

export interface UiStrings {
  readonly skip: L10n<string>;
  readonly nav: NavLabels;
  readonly themeToggle: L10n<string>;
  readonly buildingHint: L10n<string>;
  readonly enterDept: L10n<string>;
  readonly enterDeptArrow: string;
  readonly close: L10n<string>;
  readonly viewGithub: L10n<string>;
  readonly openPanel: L10n<string>;
  readonly estLabel: L10n<string>;
  readonly scrollHint: L10n<string>;
}

export interface Dept {
  readonly code: string;
  readonly icon: string;
  readonly tag: L10n<string>;
  readonly name: L10n<string>;
  readonly line: L10n<string>;
  readonly intro: L10n<string>;
  readonly projects: readonly string[];
  readonly page: DeptKey;
}

export interface Metric {
  readonly value: string;
  readonly label: L10n<string>;
}

export interface ProjectL10n {
  readonly blurb: L10n<string>;
  readonly summary: L10n<string>;
  readonly problem: L10n<string>;
  readonly highlights: L10n<readonly string[]>;
  readonly metrics: readonly Metric[];
}

export interface Project extends ProjectL10n {
  readonly slug: string;
  readonly name: string;
  readonly year: number;
  readonly featured: boolean;
  readonly dept: DeptKey;
  readonly stack: readonly string[];
  readonly github: string;
}

export interface ExperienceEntry {
  readonly period: string;
  readonly company: string;
  readonly current: boolean;
  readonly role: L10n<string>;
  readonly points: L10n<readonly string[]>;
  readonly stack: readonly string[];
}

export interface SkillGroup {
  readonly group: L10n<string>;
  readonly items: readonly string[];
}

export interface SecHead {
  readonly num: string;
  readonly title: L10n<string>;
  readonly sub: L10n<string>;
}

export interface KVEntry {
  readonly k: string;
  readonly v: string;
}

export interface StatEntry {
  readonly value: string;
  readonly label: string;
}

export interface HomeContent {
  readonly kicker: L10n<string>;
  readonly h1: L10n<string>;
  readonly stand: L10n<string>;
  readonly metaChips: L10n<readonly string[]>;
  readonly featuredHead: SecHead;
  readonly deptsHead: SecHead;
}

export interface WorkContent {
  readonly head: SecHead;
  readonly intro: L10n<string>;
  readonly filterAll: L10n<string>;
  readonly filterSummary: L10n<string>;
  readonly countLabel: L10n<string>;
  readonly countOne: L10n<string>;
  readonly emptyLabel: L10n<string>;
}

export interface CvButtons {
  readonly enLabel: string;
  readonly esLabel: string;
  readonly note: L10n<string>;
  readonly print: L10n<string>;
}

export interface CvContent {
  readonly head: SecHead;
  readonly intro: L10n<string>;
  readonly facts: L10n<readonly KVEntry[]>;
  readonly sections: {
    readonly experience: L10n<string>;
    readonly skills: L10n<string>;
  };
  readonly buttons: CvButtons;
  readonly files: {
    readonly en: string;
    readonly es: string;
  };
}

export interface NotFoundContent {
  readonly code: string;
  readonly title: L10n<string>;
  readonly body: L10n<string>;
  readonly back: L10n<string>;
}

export interface FooterContent {
  readonly tag: L10n<string>;
  readonly headline: L10n<string>;
  readonly line: L10n<string>;
  readonly email: L10n<string>;
  readonly github: L10n<string>;
  readonly linkedin: L10n<string>;
  readonly colo1: L10n<string>;
  readonly colo2: L10n<string>;
}

export interface PrinciplesContent {
  readonly title: L10n<string>;
  readonly items: L10n<readonly string[]>;
}

export interface PageMeta {
  readonly route: string;
  readonly nav: NavKey;
  readonly title: L10n<string>;
  readonly description: L10n<string>;
}

export interface PageLabels {
  readonly problem: L10n<string>;
  readonly highlights: L10n<string>;
  readonly stack: L10n<string>;
  readonly caseFile: L10n<string>;
}

export interface CaseUiStrings {
  readonly brief: L10n<string>;
  readonly built: L10n<string>;
  readonly metrics: L10n<string>;
  readonly fieldNotes: L10n<string>;
  readonly stack: L10n<string>;
  readonly visitRepo: L10n<string>;
  readonly onRequest: L10n<string>;
  readonly backDept: L10n<string>;
  readonly prev: L10n<string>;
  readonly next: L10n<string>;
  readonly pagerLabel: L10n<string>;
}

export type CaseBuildStep = L10n<readonly string[]>;

export interface ResearchPageContent {
  readonly floor: DeptKey;
  readonly breadcrumb: L10n<readonly string[]>;
  readonly stats: L10n<readonly StatEntry[]>;
  readonly problemLabel: L10n<string>;
  readonly highlightsLabel: L10n<string>;
  readonly metricsLabel: L10n<string>;
  readonly stackLabel: L10n<string>;
}

export interface TelemetryPageContent {
  readonly stats: L10n<readonly StatEntry[]>;
  readonly diagramTitle: L10n<string>;
  readonly kafkaCaption: L10n<string>;
  readonly redisCaption: L10n<string>;
  readonly workTitle: L10n<string>;
  readonly oncallTitle: L10n<string>;
  readonly oncallBody: L10n<string>;
}

export interface ToolingPageContent {
  readonly stats: L10n<readonly StatEntry[]>;
  readonly workTitle: L10n<string>;
  readonly noteTitle: L10n<string>;
  readonly noteBody: L10n<string>;
}

export interface OperationsPageContent {
  readonly shiftLogTitle: L10n<string>;
  readonly onShift: L10n<string>;
  readonly coverageTitle: L10n<string>;
  readonly coverageCaption: L10n<string>;
  readonly stats: L10n<readonly StatEntry[]>;
}

export interface PeoplePageContent {
  readonly skillsTitle: L10n<string>;
  readonly principlesLead: L10n<string>;
  readonly orgTitle: L10n<string>;
  readonly orgCaption: L10n<string>;
  readonly orgRoles: L10n<readonly string[]>;
}

export interface FrontdeskPageContent {
  readonly personTitle: L10n<string>;
  readonly bio: L10n<readonly string[]>;
  readonly avail: L10n<string>;
  readonly contactTitle: L10n<string>;
  readonly copy: L10n<string>;
  readonly copied: L10n<string>;
  readonly copyFail: L10n<string>;
  readonly howTitle: L10n<string>;
  readonly how: L10n<readonly KVEntry[]>;
  readonly colophonTitle: L10n<string>;
  readonly colophon: L10n<string>;
}
