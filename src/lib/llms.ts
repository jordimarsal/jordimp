export interface LlmsProjectRef {
  readonly slug: string;
  readonly name: string;
  readonly year: number;
  readonly summary: string;
  readonly stack: readonly string[];
  readonly github: string;
}

export interface LlmsDept {
  readonly code: string;
  readonly name: string;
  readonly line: string;
  readonly intro: string;
  readonly route: string;
  readonly projects: readonly LlmsProjectRef[];
}

export interface LlmsExperience {
  readonly period: string;
  readonly company: string;
  readonly role: string;
  readonly points: readonly string[];
}

export interface LlmsSkill {
  readonly group: string;
  readonly items: readonly string[];
}

export interface LlmsData {
  readonly person: string;
  readonly role: string;
  readonly tagline: string;
  readonly est: string;
  readonly city: string;
  readonly email: string;
  readonly github: string;
  readonly linkedin: string;
  readonly departments: readonly LlmsDept[];
  readonly projects: readonly LlmsProjectRef[];
  readonly experience: readonly LlmsExperience[];
  readonly skills: readonly LlmsSkill[];
  readonly principles: readonly string[];
}

import { SITE } from '../config';

const SITE_URL = SITE.url;

function departmentsList(data: LlmsData): string {
  return data.departments
    .map((dept) => `- ${dept.code} ${dept.name} — ${dept.line}`)
    .join('\n');
}

function departmentKeyPages(data: LlmsData): string {
  return data.departments
    .map((dept) => `- ${dept.code} ${dept.name}: ${SITE_URL}/en/${dept.route}`)
    .join('\n');
}

export function buildLlmsTxt(data: LlmsData): string {
  return `# Jordimp & Co.

> ${data.person} — ${data.role} (${data.tagline}). A one-person engineering firm: backend systems, event pipelines and applied AI, designed, built and audited by the same pair of hands since ${data.est}. ${data.city}. Business in English, Español or Català.

## Departments

${departmentsList(data)}

## Key pages

- Home: ${SITE_URL}/en/ (also /es/, /ca/)
- Projects: ${SITE_URL}/en/projects/
- CV: ${SITE_URL}/en/cv/
${departmentKeyPages(data)}
- Project case pages: ${SITE_URL}/en/projects/<slug>/ — one per project, ${data.projects.length} total

## Contact

- Email: ${data.email}
- GitHub: ${data.github}
- LinkedIn: ${data.linkedin}

Full details in llms-full.txt.
`;
}

function deptPageSuffix(dept: LlmsDept): string {
  if (dept.code === 'M') return 'Mezzanine department page';
  if (dept.code === 'B') return 'Front Desk page';
  return `${dept.code} department page`;
}

function deptBlock(dept: LlmsDept): string {
  const projects =
    dept.projects.length === 0
      ? ''
      : `\nProjects:\n${dept.projects
          .map(
            (project) =>
              `  - ${project.name} (${project.year}): ${project.summary} Stack: ${project.stack.join(', ')}. ${project.github}`,
          )
          .join('\n')}`;
  return `## ${dept.code} — ${dept.name}\n\n${dept.intro}\n${projects}`;
}

function building(data: LlmsData): string {
  return data.departments.map(deptBlock).join('\n\n');
}

function repos(data: LlmsData): string {
  return data.projects
    .map((project) => `- ${project.name} (${project.year}): ${project.summary} ${project.github}`)
    .join('\n');
}

function careerLedger(data: LlmsData): string {
  return data.experience
    .map((entry) => `- ${entry.period} — ${entry.company}, ${entry.role}: ${entry.points.join(' ')}`)
    .join('\n');
}

function skills(data: LlmsData): string {
  return data.skills.map((group) => `- ${group.group}: ${group.items.join(', ')}`).join('\n');
}

function principles(data: LlmsData): string {
  return data.principles.map((principle) => `- ${principle}`).join('\n');
}

function pagesSection(data: LlmsData): string {
  return [
    `- ${SITE_URL}/en/ · /es/ · /ca/ (home, trilingual)`,
    `- ${SITE_URL}/en/projects/ — all projects with stack filter`,
    `- ${SITE_URL}/en/cv/ — CV summary with PDF downloads`,
    ...data.departments.map((dept) => `- ${SITE_URL}/en/${dept.route} — ${deptPageSuffix(dept)}`),
    `- ${SITE_URL}/en/projects/<slug>/ — one case page per project (${data.projects.length}), e.g. ${SITE_URL}/en/projects/codebaserag/`,
  ].join('\n');
}

export function buildLlmsFullTxt(data: LlmsData): string {
  return `# Jordimp & Co. — full reference

${data.person} — ${data.role} (${data.tagline}).
One-person engineering firm, est. ${data.est}, ${data.city}. Languages: English, Español, Català.
Contact: ${data.email} · ${data.github} · ${data.linkedin}

## The building

${building(data)}

## All repos

${repos(data)}

## Career ledger (Operations, F0)

${careerLedger(data)}

## Skills (Mezzanine)

${skills(data)}

## Working principles (Mezzanine)

${principles(data)}

## Pages

${pagesSection(data)}

This site is static HTML, zero trackers, zero external dependencies beyond linked fonts.
`;
}
