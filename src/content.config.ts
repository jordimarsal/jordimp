import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const localeEnum = z.enum(['en', 'es', 'ca']);
const localized = <T extends z.ZodTypeAny>(inner: T) => z.object({ en: inner, es: inner, ca: inner });

const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    year: z.number().int().gte(2017),
    featured: z.boolean(),
    summary: localized(z.string()),
    problem: localized(z.string()),
    highlights: localized(z.array(z.string())),
    stack: z.array(z.string()),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })),
    links: z.object({ github: z.string().url(), ci: z.string().url().optional() }),
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/experience' }),
  schema: z.object({
    company: z.string(), role: localized(z.string()), period: z.string(),
    current: z.boolean().default(false),
    points: localized(z.array(z.string())),
    stack: z.array(z.string()),
    order: z.number().int(),
  }),
});

const skills = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/skills' }),
  schema: z.object({
    group: localized(z.string()),
    items: z.array(z.string()),
    order: z.number().int(),
  }),
});

export const collections = { projects, experience, skills };
