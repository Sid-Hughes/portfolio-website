import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Mirrors keystatic.config.ts. Keep the two in sync.

// Keystatic writes empty optional fields as null (or omits them).
const optionalUrl = z.url().nullish();
const optionalText = z.string().nullish();
const optionalDate = z.coerce.date().nullish();

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      status: z.enum(['in-progress', 'completed', 'archived']),
      summary: z.string(),
      tags: z.array(z.string()).default([]),
      cover: image(),
      coverAlt: z.string().min(1),
      links: z
        .object({ github: optionalUrl, demo: optionalUrl, other: optionalUrl })
        .default({}),
      featured: z.boolean().default(false),
      startDate: optionalDate,
      endDate: optionalDate,
      order: z.number().int().nullish(),
      stats: z
        .array(z.object({ label: z.string(), value: z.number(), suffix: optionalText }))
        .default([]),
    }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/posts' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        publishedDate: z.coerce.date(),
        draft: z.boolean().default(false),
        excerpt: z.string(),
        tags: z.array(z.string()).default([]),
        cover: image().nullish(),
        coverAlt: optionalText,
        relatedProjects: z.array(reference('projects')).default([]),
      })
      .refine((post) => !post.cover || !!post.coverAlt, {
        message: 'A cover image needs a description (alt text).',
        path: ['coverAlt'],
      }),
});

const about = defineCollection({
  loader: glob({ pattern: 'index.mdoc', base: './src/content/about' }),
  schema: ({ image }) =>
    z
      .object({
        name: z.string(),
        role: optionalText,
        shortBio: z.string(),
        headshot: image().nullish(),
        headshotAlt: optionalText,
        cvLink: optionalUrl,
        skills: z.array(z.string()).default([]),
        socials: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
      })
      .refine((about) => !about.headshot || !!about.headshotAlt, {
        message: 'A headshot needs a description (alt text).',
        path: ['headshotAlt'],
      }),
});

const settings = defineCollection({
  loader: glob({ pattern: 'index.yaml', base: './src/content/settings' }),
  schema: z.object({
    siteTitle: z.string(),
    tagline: optionalText,
    description: optionalText,
    navLinks: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    footerText: optionalText,
  }),
});

export const collections = { projects, posts, about, settings };
