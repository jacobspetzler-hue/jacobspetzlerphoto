// This file describes the kinds of entries the site knows about and which
// fields each one has. The editing forms (.pages.yml) write files that match it.
// Almost every field is optional: anything left blank simply doesn't appear.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const text = z.string().nullish();
const flag = z.boolean().nullish();
const num = z.number().nullish();

const imageItem = z.object({
  image: text,
  caption: text,
  alt: text,
  pair: flag,
});
const images = z.array(imageItem).nullish();

const stories = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    publication: text,
    date: z.coerce.date().nullish(),
    role: text,
    placement: text,
    link: text,
    summary: text,
    front_page: text,
    tearsheets: z.array(z.object({ image: text, label: text })).nullish(),
    photos: images,
    clips: z.array(z.object({ video: text, poster: text })).nullish(),
    draft: flag,
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    year: z.coerce.string().nullish(),
    forms: z.array(z.string()).nullish(),
    note: text,
    summary: text,
    cover: text,
    background: z.enum(['light', 'dark']).nullish(),
    arrangement: z.enum(['wall', 'grid']).nullish(),
    images: images,
    book: z
      .object({
        details: text,
        video: text,
        spreads: z.array(z.object({ image: text })).nullish(),
      })
      .nullish(),
    exhibitions: z
      .array(
        z.object({
          title: text,
          venue: text,
          city: text,
          dates: text,
          year: z.coerce.string().nullish(),
          images: images,
        }),
      )
      .nullish(),
    order: num,
    draft: flag,
  }),
});

const curation = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/curation' }),
  schema: z.object({
    title: z.string(),
    subtitle: text,
    venue: text,
    city: text,
    dates: text,
    year: z.coerce.string().nullish(),
    hero: text,
    artists: z
      .array(
        z.object({
          name: z.string(),
          work: text,
          bio: text,
          portrait: text,
          website: text,
          instagram: text,
          images: images,
        }),
      )
      .nullish(),
    installation: images,
    onesheet: text,
    draft: flag,
  }),
});

const films = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/films' }),
  schema: z.object({
    title: z.string(),
    client: text,
    year: z.coerce.string().nullish(),
    runtime: text,
    role: text,
    video: text,
    poster: text,
    loop: text,
    description: text,
    stills: images,
    credits: text,
    featured: flag,
    order: num,
    draft: flag,
  }),
});

// One-off pages: homepage, about, commercial, singles.
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({}).passthrough(),
});

export const collections = { stories, projects, curation, films, pages };
