// A list of every page, for search engines.
import type { APIRoute } from 'astro';
import { allStories, allProjects, allFilms, allCuration } from '../lib/content';

export const GET: APIRoute = async ({ site }) => {
  const paths = [
    '/', '/editorial/', '/editorial/stories/', '/editorial/singles/',
    '/projects/', '/projects/exhibitions/', '/projects/books/', '/curation/',
    '/film/', '/film/reel/', '/commercial/', '/about/',
    ...(await allStories()).map((s) => `/editorial/${s.id}/`),
    ...(await allProjects()).map((p) => `/projects/${p.id}/`),
    ...(await allCuration()).map((c) => `/curation/${c.id}/`),
    ...(await allFilms()).map((f) => `/film/${f.id}/`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
