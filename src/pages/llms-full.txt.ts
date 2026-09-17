import { getCollection } from 'astro:content';
import { buildLlmsFullTxt, type LlmsData } from '../lib/llms';
import { SITE } from '../config';
import { ui } from '../i18n/ui';

export const prerender = true;

export async function GET(): Promise<Response> {
  const [projects, experience, skills] = await Promise.all([
    getCollection('projects'),
    getCollection('experience'),
    getCollection('skills'),
  ]);
  const data: LlmsData = {
    name: SITE.name,
    role: SITE.role,
    tagline: SITE.tagline,
    email: SITE.email,
    github: SITE.github,
    linkedin: SITE.linkedin,
    bio: [ui.en['about.bio.p1'], ui.en['about.bio.p2'], ui.en['about.bio.p3']],
    projects: projects
      .sort((a, b) => b.data.year - a.data.year || a.data.name.localeCompare(b.data.name))
      .map((project) => ({
        id: project.id,
        name: project.data.name,
        year: project.data.year,
        summary: project.data.summary.en,
        problem: project.data.problem.en,
        highlights: project.data.highlights.en,
        stack: project.data.stack,
        github: project.data.links.github,
      })),
    experience: experience
      .sort((a, b) => a.data.order - b.data.order)
      .map((entry) => ({
        company: entry.data.company,
        role: entry.data.role.en,
        period: entry.data.period,
        points: entry.data.points.en,
      })),
    skills: skills
      .sort((a, b) => a.data.order - b.data.order)
      .map((group) => ({ group: group.data.group.en, items: group.data.items })),
  };
  return new Response(buildLlmsFullTxt(data), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
