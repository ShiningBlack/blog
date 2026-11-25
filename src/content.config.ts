import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const optionalDate = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : val),
  z.coerce.date().optional(),
);

const optionalString = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : val),
  z.string().optional(),
);

const stringArray = z.preprocess(
  (val) => (Array.isArray(val) ? val.filter(Boolean) : []),
  z.array(z.string()),
);

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.preprocess(
      (val) => (val === null || val === undefined ? '' : val),
      z.string(),
    ),
    pubDate: z.coerce.date(),
    updatedDate: optionalDate,
    category: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? '技术笔记' : val),
      z.string(),
    ),
    tags: stringArray,
    cover: optionalString,
    pinned: z.preprocess((val) => Boolean(val), z.boolean()).default(false),
    draft: z.preprocess((val) => Boolean(val), z.boolean()).default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    url: optionalString,
    repo: optionalString,
    tech: stringArray,
    featured: z.preprocess((val) => (val === undefined ? true : Boolean(val)), z.boolean()),
    order: z.coerce.number().int().default(10),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: optionalString,
  }),
});

export const collections = { blog, projects, pages };
