import {
  buildLlmsTxt,
  type LlmsData,
  type LlmsDept,
  type LlmsProjectRef,
} from '../lib/llms';
import { dirRoute } from '../lib/paths';
import { DEPTS, EXPERIENCE, FLOOR_ORDER, PAGES, PRINCIPLES, PROJECTS, SKILLS, SITE } from '../data/content';

export const prerender = true;

function projectRef(slug: string): LlmsProjectRef {
  const p = PROJECTS.find((candidate) => candidate.slug === slug);
  if (!p) throw new Error(`unknown project: ${slug}`);
  return { slug: p.slug, name: p.name, year: p.year, summary: p.summary.en, stack: p.stack, github: p.github };
}

export function llmsData(): LlmsData {
  const departments: readonly LlmsDept[] = FLOOR_ORDER.map((key) => {
    const d = DEPTS[key];
    return {
      code: d.code,
      name: d.name.en,
      line: d.line.en,
      intro: d.intro.en,
      route: dirRoute(PAGES[key].route),
      projects: d.projects.map(projectRef),
    };
  });
  return {
    person: SITE.person,
    role: SITE.role.en,
    tagline: SITE.tagline.en,
    est: SITE.est,
    city: SITE.city.en,
    email: SITE.email,
    github: SITE.github,
    linkedin: SITE.linkedin,
    departments,
    projects: PROJECTS.map((p) => projectRef(p.slug)),
    experience: EXPERIENCE.map((entry) => ({
      period: entry.period,
      company: entry.company,
      role: entry.role.en,
      points: entry.points.en,
    })),
    skills: SKILLS.map((group) => ({ group: group.group.en, items: group.items })),
    principles: PRINCIPLES.items.en,
  };
}

export function GET(): Response {
  return new Response(buildLlmsTxt(llmsData()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
