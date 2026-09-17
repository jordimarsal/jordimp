export interface LlmsData {
  readonly name: string;
  readonly role: string;
  readonly tagline: string;
  readonly email: string;
  readonly github: string;
  readonly linkedin: string;
  readonly bio: readonly string[];
  readonly projects: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly year: number;
    readonly summary: string;
    readonly problem: string;
    readonly highlights: readonly string[];
    readonly stack: readonly string[];
    readonly github: string;
  }>;
  readonly experience: ReadonlyArray<{
    readonly company: string;
    readonly role: string;
    readonly period: string;
    readonly points: readonly string[];
  }>;
  readonly skills: ReadonlyArray<{ readonly group: string; readonly items: readonly string[] }>;
}

import { SITE } from '../config';

const SITE_URL = SITE.url;

function header(data: LlmsData): string[] {
  return [`# ${data.name}`, '', `> ${data.role}. ${data.tagline}`];
}

function projectLinks(data: LlmsData): string[] {
  return ['', '## Projects', ''].concat(
    data.projects.map(
      (project) =>
        `- [${project.name}](${SITE_URL}/en/projects/${project.id}/): ${project.summary}`,
    ),
  );
}

export function buildLlmsTxt(data: LlmsData): string {
  const pages = [
    `- [About](${SITE_URL}/en/about/)`,
    `- [CV](${SITE_URL}/en/cv/)`,
    `- [Experience](${SITE_URL}/en/experience/)`,
    `- [Skills](${SITE_URL}/en/skills/)`,
  ];
  return [...header(data), ...projectLinks(data), '', '## Pages', '', ...pages, ''].join('\n');
}

function projectSection(project: LlmsData['projects'][number]): string[] {
  return [
    `### ${project.name} (${project.year})`,
    '',
    `Summary: ${project.summary}`,
    '',
    `Problem: ${project.problem}`,
    '',
    'Highlights:',
    '',
    ...project.highlights.map((highlight) => `- ${highlight}`),
    '',
    `Stack: ${project.stack.join(', ')}`,
    '',
    `Repository: ${project.github}`,
  ];
}

function experienceSection(entry: LlmsData['experience'][number]): string[] {
  return [
    `### ${entry.company} — ${entry.role} (${entry.period})`,
    '',
    ...entry.points.map((point) => `- ${point}`),
  ];
}

function skillSection(group: LlmsData['skills'][number]): string[] {
  return [`### ${group.group}`, '', ...group.items.map((item) => `- ${item}`)];
}

export function buildLlmsFullTxt(data: LlmsData): string {
  const contact = [
    '',
    '## Contact',
    '',
    `- Email: ${data.email}`,
    `- GitHub: ${data.github}`,
    `- LinkedIn: ${data.linkedin}`,
  ];
  const about = ['', '## About', '', ...data.bio];
  const projects = ['', '## Projects', ''].concat(
    data.projects.flatMap((project, index) =>
      index === 0 ? projectSection(project) : ['', ...projectSection(project)],
    ),
  );
  const experience = ['', '## Experience', ''].concat(
    data.experience.flatMap((entry, index) =>
      index === 0 ? experienceSection(entry) : ['', ...experienceSection(entry)],
    ),
  );
  const skills = ['', '## Skills', ''].concat(
    data.skills.flatMap((group, index) =>
      index === 0 ? skillSection(group) : ['', ...skillSection(group)],
    ),
  );
  return [...header(data), ...about, ...contact, ...projects, ...experience, ...skills, ''].join(
    '\n',
  );
}
