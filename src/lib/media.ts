// Finds a picture in src/media and makes the smaller versions the site needs.
// Entries only store a plain path such as "projects/paradise/paradise-01.jpg".
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/media/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}',
  { eager: true },
);

// A lighter set of sizes is used for the shareable preview build.
const PREVIEW = process.env.PREVIEW === '1';
const WIDTHS = PREVIEW ? [800, 1600] : [640, 1280, 1920];
const FULL = PREVIEW ? 1800 : 2600;
const ZOOM_LONG_EDGE = PREVIEW ? 3200 : 5000;

export function clean(path?: string | null) {
  if (!path) return '';
  return path
    .trim()
    .replace(/^\/+/, '')
    .replace(/^src\//, '')
    .replace(/^media\//, '');
}

export function find(path?: string | null): ImageMetadata | undefined {
  const p = clean(path);
  if (!p) return undefined;
  return files[`/src/media/${p}`]?.default;
}

export interface Pic {
  src: string;
  srcset: string;
  width: number;
  height: number;
  ratio: number;
  full: { src: string; width: number; height: number };
}

const cache = new Map<string, Promise<Pic | undefined>>();

/** Build the set of sizes for one picture. `zoom` keeps a much larger copy (for newspaper pages). */
export function picture(path?: string | null, opts: { zoom?: boolean } = {}): Promise<Pic | undefined> {
  const key = clean(path) + (opts.zoom ? '#zoom' : '');
  if (!cache.has(key)) cache.set(key, build(path, opts));
  return cache.get(key)!;
}

async function build(path: string | null | undefined, opts: { zoom?: boolean }): Promise<Pic | undefined> {
  const meta = find(path);
  if (!meta) {
    if (path) console.warn(`[media] Picture not found: ${path}`);
    return undefined;
  }
  const ratio = meta.width / meta.height;
  const widths = WIDTHS.filter((w) => w < meta.width);
  if (!widths.length || meta.width <= WIDTHS[WIDTHS.length - 1]) widths.push(Math.min(meta.width, WIDTHS[WIDTHS.length - 1]));
  const uniq = [...new Set(widths)].sort((a, b) => a - b);
  const made = await Promise.all(
    uniq.map((w) => getImage({ src: meta, width: w, format: 'webp', quality: 80 })),
  );
  const srcset = made.map((m, i) => `${m.src} ${uniq[i]}w`).join(', ');

  let fullW: number;
  if (opts.zoom) {
    const longEdge = Math.max(meta.width, meta.height);
    const scale = Math.min(1, ZOOM_LONG_EDGE / longEdge);
    fullW = Math.round(meta.width * scale);
  } else {
    fullW = Math.min(meta.width, ratio >= 1 ? FULL : Math.round(FULL * ratio));
  }
  // In the preview build the full-screen view reuses the largest size above (fewer files).
  if (PREVIEW && !opts.zoom) fullW = uniq[uniq.length - 1];
  const full = PREVIEW && !opts.zoom ? made[made.length - 1] : await getImage({ src: meta, width: fullW, format: 'webp', quality: opts.zoom ? 78 : 84 });

  return {
    src: made[Math.min(1, made.length - 1)].src,
    srcset,
    width: meta.width,
    height: meta.height,
    ratio,
    full: { src: full.src, width: fullW, height: Math.round(fullW / ratio) },
  };
}

/** Turns a YouTube or Vimeo link into the address used to play it inside the page. */
export function embedUrl(link?: string | null): string | undefined {
  if (!link) return undefined;
  const yt = link.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&playsinline=1`;
  const vm = link.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1&title=0&byline=0&portrait=0`;
  return undefined;
}

export function fmtDate(d?: Date | null) {
  if (!d) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
export function yearOf(d?: Date | null) {
  return d ? String(d.getUTCFullYear()) : '';
}
