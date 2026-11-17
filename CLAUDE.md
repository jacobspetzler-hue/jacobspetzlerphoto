# Guide for the next AI assistant (or developer) working on jacobspetzler.com

You are picking up a finished, working website for Jacob Spetzler, a photographer and filmmaker in Gunnison, Colorado. It was designed with Claude Opus and built by Claude Fable in November 2026. Read this whole file before changing anything.

## How to work with Jacob

- Jacob is a photographer, not a developer. Explain every step in plain, everyday language. No jargon without a one-line explanation. He is capable; he is simply new to this.
- He keeps the site up to date himself through web forms (Pages CMS). **Most requests should be solved by telling him which form to use, not by changing code.** Check the forms list in `README.md` first.
- When code must change, make the smallest change that does the job, build it, and tell him in one or two sentences what changed and what he should look at.
- Never ask him to run terminal commands. If you cannot push to GitHub yourself, give him a file to paste into GitHub's web editor, one file at a time, with exact click-by-click steps.
- His real domain and his Squarespace site are still live (see "Unfinished business"). Do not tell him to cancel anything until the new site is confirmed on the domain.

## The 60-second picture

```
Jacob fills in a form            Pages CMS saves a text file       Cloudflare rebuilds and
at app.pagescms.org        ->    into this GitHub repository   ->  publishes the site (~2 min)
```

- **Repository:** `github.com/jacobspetzler-hue/jacobspetzlerphoto`, branch `main`. Every push to `main` goes live. There is no staging branch.
- **Site generator:** Astro 7. Static output only. No server code, no database, no login.
- **Hosting:** Cloudflare Workers static assets, project name `jacobspetzlerphoto`, connected through Workers Builds. Build command `npx astro build`, deploy command `npx wrangler deploy`. Settings in `wrangler.jsonc`.
- **Temporary address:** `https://jacobspetzlerphoto.jacobspetzler.workers.dev/`. Final address will be `https://www.jacobspetzler.com/` (already set as `site` in `astro.config.mjs`).
- **Editing forms:** Pages CMS, configured by `.pages.yml`.
- **Video:** films are YouTube or Vimeo links. Short silent loops are small `.mp4` files stored in the repository.

## Map of the repository

| Path | What it is |
| --- | --- |
| `src/content/` | All the words and settings, as Markdown files with front matter. This is what the forms edit. |
| `src/content.config.ts` | The definition of every field each kind of entry may have (the "schema"). |
| `.pages.yml` | The editing forms. Must describe the same fields as `content.config.ts`. |
| `src/media/` | Photos. Resized automatically at build time. Never served directly. |
| `public/media/` | Clips (`video/`) and PDFs (`files/`). Served exactly as they are. |
| `src/pages/` | One file per page or page type. The folder layout is the URL layout. |
| `src/layouts/Base.astro` | The frame around every page: top navigation, section sub-navigation, footer, meta tags. |
| `src/components/` | `Img` (one photo), `Rows` (even rows of photos), `Wall` (gallery-wall layout), `Player` (film player). |
| `src/lib/media.ts` | Finds photos and makes the different sizes. Also YouTube/Vimeo link handling and date formatting. |
| `src/lib/content.ts` | Fetches and sorts entries; hides drafts. |
| `src/styles/global.css` | The entire look of the site, in one file. |
| `src/scripts/site.js` | All browser behaviour: full-screen viewer, homepage frame, looping clips, book page-through, film players, phone menu. |
| `public/_redirects` | Old Squarespace addresses pointing to the matching new pages. |
| `.github/workflows/shrink-images.yml` + `scripts/shrink-images.mjs` | Shrinks oversized uploaded photos in place after each upload. |
| `scripts/make-preview.mjs` | Only used once to make a single-file preview. Safe to ignore or delete. |
| `README.md` | Plain-language instructions for Jacob. Keep it accurate when you change how something works. |

## Site structure

| Address | Page file | Content it reads |
| --- | --- | --- |
| `/` | `pages/index.astro` | `content/pages/home.md` |
| `/editorial/` (Front Pages wall) | `pages/editorial/index.astro` | stories that have a `front_page` |
| `/editorial/stories/` | `pages/editorial/stories/index.astro` | stories without a `front_page` |
| `/editorial/singles/` | `pages/editorial/singles/index.astro` | `content/pages/singles.md` |
| `/editorial/<story>/` | `pages/editorial/[slug].astro` | one file in `content/stories/` |
| `/projects/` | `pages/projects/index.astro` | all of `content/projects/` |
| `/projects/<project>/` | `pages/projects/[slug].astro` | one project (images, book, exhibitions) |
| `/projects/exhibitions/`, `/projects/books/` | same folder | gathered from projects (and curated shows) |
| `/curation/`, `/curation/<show>/` | `pages/curation/` | `content/curation/` |
| `/film/`, `/film/<film>/`, `/film/reel/` | `pages/film/` | `content/films/`, plus `home.md` for the reel |
| `/commercial/`, `/about/` | `pages/commercial.astro`, `pages/about.astro` | `content/pages/commercial.md`, `about.md` |

The file name of an entry is its address. `content/projects/paradise.md` becomes `/projects/paradise/`. Changing a title in the form does **not** rename the file, so addresses stay stable.

## Design rules that must survive every change

These came out of a long design process. Do not undo them without Jacob asking.

1. **Photographs are never cropped.** Every still keeps its own shape. Only moving image may fill a frame edge to edge. In a fixed frame (the homepage), a still that isn't 3:2 sits on a plain mat.
2. **One quiet frame, three moods.** Typography, spacing and navigation are identical everywhere. Only the background and arrangement change: Editorial is off-white with a black rule and uppercase sub-navigation ("broadsheet"); Projects is white with lots of space ("gallery"); Film is near-black ("screening room"). These are the `theme-offwhite`, `theme-white` and `theme-dark` classes on `<body>`, driven by CSS variables at the top of `global.css`.
3. **Black, white and greys only.** No accent colour. Quiet text is `#5f5f5c` on light and `#a3a39f` on dark; both pass contrast checks. Keep any new text colour at 4.5:1 contrast or better.
4. **Type:** Inter Tight for display, Inter for text, self-hosted through `@fontsource-variable`. The name is uppercase with wide letter spacing.
5. **Three main sections** (Editorial, Projects, Film) plus two quiet links (Commercial, About). Commercial must stay quiet so it doesn't dilute the other work.
6. **No phone number anywhere.** Email and Instagram only.
7. **Blank means absent.** Any field left empty simply doesn't render. Never print placeholder text from code.
8. **Accessible:** real links and buttons, visible keyboard focus, alt text, a pause control on the homepage clip, reduced-motion respected.

## How content becomes a page

1. A form in `.pages.yml` writes front matter into a Markdown file under `src/content/`.
2. `src/content.config.ts` checks the file. Almost every field is optional and tolerant of blanks (`""`, `null`, missing). **If a file fails this check, the whole build fails and nothing new goes live** (the old version stays up).
3. The page file reads the entry with helpers from `src/lib/content.ts` and renders it.

### Photos

- Stored in `src/media/...`. Entries store the path as `/photos/<folder>/<file>.jpg`. The `/photos/` prefix is only a label that Pages CMS adds; `clean()` in `src/lib/media.ts` strips it and looks the file up under `src/media/`.
- A list of photos may be either plain paths (what the multi-photo form fields save) or objects with `image`, `caption`, `alt` (what the list-with-caption fields save). Always pass lists through `items()` from `media.ts`, which accepts both.
- `picture(path)` returns the sizes for a normal photo. `picture(path, { zoom: true })` (used by `<Img page>`) keeps a very large copy so newspaper pages stay readable when zoomed.
- Newspaper pages live in `src/media/newspaper-pages/`. The shrink script allows them 5,000 px on the long side; everything else is capped at 3,000 px.
- A photo path that doesn't exist logs a `[media] Picture not found` warning during the build and is skipped. It does not break the build.

### Clips and PDFs

- Stored in `public/media/video/` and `public/media/files/`. Entries store the real address, for example `/media/video/home-loop.mp4`.
- Cloudflare refuses any single file over 25 MB. Keep clips under 20 MB, silent, a few seconds long.

### Films

- `video` holds a normal YouTube or Vimeo link. `embedUrl()` in `media.ts` converts it. The page shows the poster (or a silent loop) and only loads the player after someone presses play.

## Before you change anything: the safe routine

1. Get the code: clone the repository (or, in a chat without tools, ask Jacob to paste the specific files).
2. `npm install`, then `npm run build`. Confirm it builds **before** you touch anything, so you know you started from a working state. A full build takes about two minutes the first time because it resizes about 150 photos.
3. Make one small change.
4. `npm run build` again. Read the output for errors and `[media]` warnings.
5. Look at the result: `npm run preview`, or open the files in `dist/`. Check the page at desktop width and at phone width (390 px).
6. Commit with a plain-language message and push to `main`. One topic per commit, so any single change can be reverted on its own.
7. Check GitHub: the commit gets a "Workers Builds: jacobspetzlerphoto" check. Wait for it to pass (about two minutes).
8. Tell Jacob what changed and where to look.

**To undo a bad change:** revert that commit on GitHub (Commits → the commit → Revert) or with `git revert`. Never force-push and never rewrite history; Pages CMS and Cloudflare both rely on `main`.

## Things that break the site (and how to avoid them)

- **Changing a field in only one place.** If you add, rename or remove a field, change all three together: `src/content.config.ts`, `.pages.yml`, and the page that uses it. If you rename a field, also update every existing file in `src/content/`.
- **An invalid `.pages.yml`.** Pages CMS rejects the whole file and Jacob's forms disappear. Its rules live in `lib/config-schema.ts` of `github.com/pages-cms/pages-cms`; check your edit against that file. Known requirements: a list written as an object must include `collapsible`; `view.sort` is a list; `filename` must stay `"{primary}.md"` (the default adds a date and would change addresses).
- **Making a field required in the schema.** Existing entries with that field blank will fail the build. Keep fields optional and handle blanks in the page.
- **Links without a trailing slash.** The site uses `trailingSlash: 'always'`. Internal links are written `/projects/paradise/`.
- **Renaming or moving files in `src/media/` or `public/media/`.** Entries point at them by path. If you must move one, update every reference.
- **Renaming a file in `src/content/`.** That changes its public address. Add a line to `public/_redirects` if you do.
- **Adding per-page stylesheets or scoped styles.** Not harmful, but the design depends on one shared stylesheet. Add rules to `global.css`.
- **Committing `node_modules/`, `dist/` or `.astro/`.** They are ignored on purpose.
- **Large dependencies or a framework (React, Tailwind, a database, a server adapter).** Not needed. The site is deliberately small so it can be maintained for years. Adding server code would also change how it is hosted.
- **Upgrading Astro across a major version without reading its upgrade guide.** Content collections and image handling are the parts most likely to change. Upgrade in its own commit and build before pushing.

## Recipes for common requests

**"Add a new field to a form"** (example: a `location` on stories)
1. `src/content.config.ts`: add `location: text,` to `stories`.
2. `.pages.yml`: add a matching field under the `stories` form.
3. `src/pages/editorial/[slug].astro`: show it, wrapped so nothing appears when blank.
4. Build, check, push.

**"Change wording, a label, or the footer"** Find the text in the page file or `Base.astro`. If the text is content (bio, taglines, button text on the homepage), it is in a form; point Jacob there instead.

**"Change a colour, a size or spacing"** Edit `global.css`. Colours are variables at the top; change the variable, not each use. Check all three themes.

**"Add a link to the top navigation"** Edit the `main` or `quiet` list in `Base.astro`. Keep the main list to three if at all possible.

**"Add a page inside a section"** Add the file under `src/pages/<section>/`, add it to that section's entry in `subnavs` in `Base.astro`, add it to `src/pages/sitemap.xml.ts`.

**"Add a new one-off page"** Copy `src/pages/commercial.astro`, add a content file under `src/content/pages/`, add a `type: file` form in `.pages.yml`.

**"Add another layout choice for projects"** The choices are `wall` and `grid`. Add the new value to the `arrangement` list in both `content.config.ts` and `.pages.yml`, add a component next to `Wall.astro`, and branch on it in `pages/projects/[slug].astro`.

**"Captions on project photos"** Project images are currently a plain multi-photo field (fast to upload, no captions). To allow captions, change that form field to a list of objects with `image` and `caption` (copy the `photos` field from the stories form). The pages already accept both shapes, so old entries keep working.

**"Group the Singles page"** (for example Sports, Portraits). Add a `group` text field to each single, then render one `<Rows>` per group in `pages/editorial/singles/index.astro`.

**"An old link is broken"** Add a line to `public/_redirects`: `/old-address /new-address/ 301`.

**"Photos look soft or too small full-screen"** Sizes are the constants at the top of `src/lib/media.ts` (`WIDTHS`, `FULL`, `ZOOM_LONG_EDGE`). Larger numbers mean a longer build and more files; Cloudflare allows 20,000 files per deployment (the site uses about 650).

**"Change the homepage clip"** That is the Homepage form (`Clip in the big frame`). If he sends raw footage, make a silent 3:2 `.mp4`, 1440×960, under 20 MB, plus a poster frame.

## Unfinished business (as of 16 November 2026)

1. **Pages CMS has not been tested end to end.** `.pages.yml` passes Pages CMS's own schema, but nobody has yet signed in and saved an entry. First test: Jacob signs in at app.pagescms.org with GitHub, grants access to this repository, opens **Homepage**, changes something small, saves, and checks the live site two minutes later. If a form misbehaves, the fix is almost always in `.pages.yml`.
2. **The photo-shrinking workflow has never run on a real upload.** The script is tested; the GitHub Action is not. After Jacob's first photo upload, check the Actions tab. If it fails, the site still works; uploads are simply not shrunk.
3. **The domain has not been moved.** jacobspetzler.com still points at Squarespace. Still unknown: where the domain is registered (Squarespace or elsewhere) and whether any email address uses the domain. Plan:
   - In Cloudflare, open the `jacobspetzlerphoto` project → Settings → Domains & Routes → add `www.jacobspetzler.com` and `jacobspetzler.com` as custom domains. Cloudflare will say the domain must first be added to the Cloudflare account.
   - Add the domain to Cloudflare (free plan). Cloudflare copies the existing DNS records. **Before switching, check for MX records** (email). If any exist, make sure they are copied, or email will stop.
   - At the registrar, change the nameservers to the two Cloudflare gives. This can take a few hours. If the domain is registered at Squarespace, this is done in Squarespace's domain settings; the domain can also be transferred out later (there is sometimes a 60-day lock).
   - Once the new site answers on the real domain, check `/sitemap.xml`, a few `_redirects` entries, and a link preview. Then, and only then, Jacob can cancel the Squarespace site plan (not the domain registration, unless it has been transferred).
4. **Content placeholders.** Text in square brackets is waiting for Jacob: venue/city/dates for the Newsroom exhibition and for Interference, the Interference curatorial statement, the Newsroom book details, both film entries (`example-film`, `example-film-2` are stand-ins), the Palisade story's headline, date and link, story links on every front page, captions everywhere.
5. **Hidden drafts ready for photos.** These entries exist with their text filled in and `draft: true`. They appear once Jacob adds photos and unticks "Hide": projects *Never Never Land*, *The Grandaddy of Rodeos*, *The Road to Golden*, *Saguache Crescent*; story *Rural Newspaper Survives Doing Things the Old Way* (The Denver Post).
6. **Not migrated from the old site, on purpose:** the photo galleries (Jacob wanted text only; copies of some old-site photos are on his computer in `Desktop/WEBSITE/_from-old-site`), the phone number and street address, the software/gear/certification lists from the CV, a password-protected Vimeo link, the long passage quoted from the Denver Post's Saguache story, the 2024 print sale page, the "Below the Fold" and "Field of Questions" pages, and Squarespace template leftovers.
7. **Link previews** (`og:image`) point at `www.jacobspetzler.com`, so they only work after the domain moves.

## Changes Jacob is likely to want later

Roughly in order of likelihood. "Form" means he can do it himself today.

| Change | How |
| --- | --- |
| Add stories, front pages, projects, films, exhibitions, CV lines | Form |
| Replace the homepage loop with a real reel; add the reel link | Form |
| Swap YouTube for Vimeo on some films | Form (paste a different link) |
| Reorder projects or films | Form ("Position in the list") |
| Captions on project photos; groups on Singles | Small code change (recipes above) |
| A new project layout, or per-photo size control | Medium code change |
| A "News" or "Recent" list on the homepage | Medium: new small collection + a block in `index.astro` |
| A print shop or selling a book | Do not build a shop. Link to an outside store (Big Cartel, Shopify, a publisher) from the project's page |
| A contact form | Needs outside help because the site has no server: a form service (Formspree, Basin) or a small Cloudflare Worker. A plain email link is the current design |
| Private client galleries with passwords | Not suited to this site. Use a delivery service (Pixieset, Pic-Time) and link to it |
| A newsletter sign-up | Embed the sign-up form from the newsletter service |
| Visitor statistics | Turn on Cloudflare Web Analytics in the dashboard (free, no code, no cookie banner) |
| A second language (Spanish) | Large change: duplicate pages under `/es/` and add fields per language |
| Moving off Pages CMS | Content is plain Markdown, so another Git-based editor (Decap, Sveltia, Keystatic, TinaCMS) can be configured over the same files |
| Moving off Cloudflare | Any static host works (Netlify, Vercel, GitHub Pages). Only `wrangler.jsonc` and `_redirects` are Cloudflare-specific |

## Limits worth knowing

- Cloudflare free plan: 20,000 files per deployment, 25 MB per file.
- GitHub keeps every uploaded file in history forever. Uploads over about 20 MB each add up; ask Jacob to export smaller copies of very large files.
- A full build resizes every photo and takes around two minutes. That is normal.
- The site has no automated tests. The build itself is the test, plus looking at the pages.
