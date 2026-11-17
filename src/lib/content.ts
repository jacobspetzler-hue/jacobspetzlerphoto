// Small helpers that fetch and sort the entries.
import { getCollection } from 'astro:content';

const live = (e: any) => !e.data.draft;

/** Newest first. Stories with no date yet are treated as the newest. */
export async function allStories() {
  const list = (await getCollection('stories')).filter(live);
  return list.sort((a, b) => (b.data.date?.getTime() ?? Infinity) - (a.data.date?.getTime() ?? Infinity));
}
export async function frontPages() {
  return (await allStories()).filter((s) => s.data.front_page);
}
export async function otherStories() {
  return (await allStories()).filter((s) => !s.data.front_page);
}
export async function allProjects() {
  const list = (await getCollection('projects')).filter(live);
  return list.sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999));
}
export async function allFilms() {
  const list = (await getCollection('films')).filter(live);
  return list.sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999));
}
export async function allCuration() {
  const list = (await getCollection('curation')).filter(live);
  return list.sort((a, b) => Number(b.data.year ?? 0) - Number(a.data.year ?? 0));
}
export const dot = (parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' · ');
