export interface LlmsProjectRef {
  readonly slug: string;
  readonly name: string;
  readonly year: string;
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

export interface LlmsArticleRef {
  readonly title: string;
  readonly summary: string;
  readonly route: string;
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
  readonly article: LlmsArticleRef;
}

import { SITE } from '../config';

const SITE_URL = SITE.url;

const EN_HOME = `${SITE_URL}/en/`;
const ES_HOME = `${SITE_URL}/es/`;
const CA_HOME = `${SITE_URL}/ca/`;
const PROJECTS_URL = `${SITE_URL}/en/projects/`;
const CV_URL = `${SITE_URL}/en/cv/`;
const CASE_SLUG_URL = `${SITE_URL}/en/projects/<slug>/`;

const enUrl = (path: string): string => `${SITE_URL}/en/${path}`;

function mdLink(label: string, url: string): string {
  return `[${label}](${url})`;
}

function departmentsList(data: LlmsData): string {
  return data.departments
    .map((dept) => `- ${dept.code} ${dept.name} — ${dept.line}`)
    .join('\n');
}

function departmentKeyPages(data: LlmsData): string {
  return data.departments
    .map((dept) => {
      const label = `${dept.code} ${dept.name}`;
      return `- ${mdLink(label, enUrl(dept.route))}`;
    })
    .join('\n');
}

function casePagesLine(data: LlmsData): string {
  return `- ${mdLink('Project case pages', CASE_SLUG_URL)} — one per project, ${data.projects.length} total`;
}

function articleLink(data: LlmsData, label: string): string {
  return mdLink(label, enUrl(data.article.route));
}

function articleLine(data: LlmsData): string {
  const label = `Writing: ${data.article.title}`;
  return `- ${articleLink(data, label)} — ${data.article.summary}`;
}

function articleSectionLine(data: LlmsData): string {
  return `- ${articleLink(data, data.article.title)} — ${data.article.summary}`;
}

export function buildLlmsTxt(data: LlmsData): string {
  return `# Jordimp & Co.

> ${data.person} — ${data.role} (${data.tagline}). A one-person engineering firm: backend systems, event pipelines and applied AI, designed, built and audited by the same pair of hands since ${data.est}. ${data.city}. Business in English, Español or Català.

## Departments

${departmentsList(data)}

## Key pages

- ${mdLink('Home', EN_HOME)} (also ${mdLink('Español', ES_HOME)}, ${mdLink('Català', CA_HOME)})
- ${mdLink('Projects', PROJECTS_URL)}
- ${mdLink('CV', CV_URL)}
${articleLine(data)}
${departmentKeyPages(data)}
${casePagesLine(data)}

## Contact

- Email: ${data.email}
- ${mdLink('GitHub', data.github)}
- ${mdLink('LinkedIn', data.linkedin)}

Full details in llms-full.txt.
`;
}

function deptPageSuffix(dept: LlmsDept): string {
  if (dept.code === 'M') return 'Mezzanine department page';
  if (dept.code === 'B') return 'Front Desk page';
  return `${dept.code} department page`;
}

function deptBlock(dept: LlmsDept): string {
  const projectLines = dept.projects.map((project) => {
    const stack = project.stack.join(', ');
    return `  - ${project.name} (${project.year}): ${project.summary} Stack: ${stack}. ${mdLink('repo', project.github)}`;
  });
  const projects = dept.projects.length === 0 ? '' : `\nProjects:\n${projectLines.join('\n')}`;
  return `## ${dept.code} — ${dept.name}\n\n${dept.intro}\n${projects}`;
}

function building(data: LlmsData): string {
  return data.departments.map(deptBlock).join('\n\n');
}

function repos(data: LlmsData): string {
  return data.projects
    .map((project) => `- ${project.name} (${project.year}): ${project.summary} ${mdLink('repo', project.github)}`)
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

function caseExampleLink(data: LlmsData): string {
  const example = data.projects.find((project) => project.slug === 'codebaserag');
  const label = example ? example.name : 'codebaserag';
  return mdLink(label, enUrl('projects/codebaserag/'));
}

function pagesSection(data: LlmsData): string {
  return [
    `- ${mdLink('Home', EN_HOME)} · ${mdLink('Español', ES_HOME)} · ${mdLink('Català', CA_HOME)} (home, trilingual)`,
    `- ${mdLink('Projects', PROJECTS_URL)} — all projects with stack filter`,
    `- ${mdLink('CV', CV_URL)} — CV summary with PDF downloads`,
    ...data.departments.map((dept) => {
      const url = enUrl(dept.route);
      return `- ${mdLink(deptPageSuffix(dept), url)}`;
    }),
    `- ${mdLink('Case pages', CASE_SLUG_URL)} — one case page per project (${data.projects.length}), e.g. ${caseExampleLink(data)}`,
  ].join('\n');
}

export function buildLlmsFullTxt(data: LlmsData): string {
  return `# Jordimp & Co. — full reference

${data.person} — ${data.role} (${data.tagline}).
One-person engineering firm, est. ${data.est}, ${data.city}. Languages: English, Español, Català.
Contact: ${data.email} · ${mdLink('GitHub', data.github)} · ${mdLink('LinkedIn', data.linkedin)}

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

## Writing

${articleSectionLine(data)}

## Pages

${pagesSection(data)}

This site is static HTML, zero trackers, zero external dependencies beyond linked fonts.
`;
}
