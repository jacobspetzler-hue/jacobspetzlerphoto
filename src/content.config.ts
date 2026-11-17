// This file describes the kinds of entries the site knows about and which
// fields each one has. The editing forms (.pages.yml) write files that match it.
// Almost every field is optional: anything left blank simply doesn't appear.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// The editing forms sometimes save an empty box as "" — treat that the same as blank.
const blank = (v: unknown) => (v === '' || v === undefined ? null : v);
const text = z.preprocess((v) => (v == null ? v : String(v)), z.string().nullish());
const flag = z.preprocess(blank, z.boolean().nullish());
const num = z.preprocess(blank, z.coerce.number().nullish());
const date = z.preprocess(blank, z.coerce.date().nullish());
const year = z.preprocess((v) => (v == null || v === '' ? null : String(v)), z.string().nullish());

const imageItem = z.object({
  image: text,
  caption: text,
  alt: text,
  pair: flag,
});
// A list of pictures: either plain paths, or entries with a caption.
const images = z.array(z.union([z.string(), imageItem])).nullish();

const stories = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    publication: text,
    date: date,
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
    year: year,
    forms: z.array(z.string()).nullish(),
    note: text,
    summary: text,
    cover: text,
    background: z.preprocess(blank, z.enum(['light', 'dark']).nullish()),
    arrangement: z.preprocess(blank, z.enum(['wall', 'grid']).nullish()),
    images: images,
    book: z
      .object({
        details: text,
        video: text,
        spreads: images,
      })
      .nullish(),
    exhibitions: z
      .array(
        z.object({
          title: text,
          venue: text,
          city: text,
          dates: text,
          year: year,
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
    year: year,
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
    year: year,
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
