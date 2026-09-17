import { getCollection } from 'astro:content';
import { buildLlmsTxt, type LlmsData } from '../lib/llms';
import { SITE } from '../config';

export const prerender = true;

export async function GET(): Promise<Response> {
  const projects = await getCollection('projects');
  const data: LlmsData = {
    name: SITE.name,
    role: SITE.role,
    tagline: SITE.tagline,
    email: SITE.email,
    github: SITE.github,
    linkedin: SITE.linkedin,
    bio: [],
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
    experience: [],
    skills: [],
  };
  return new Response(buildLlmsTxt(data), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
