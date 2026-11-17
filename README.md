# jacobspetzler.com

This folder is the whole website. Three services work together:

- **GitHub** (here) stores every file. You own it.
- **Pages CMS** (app.pagescms.org) gives you forms for adding and changing work. Each time you press Save, it updates the files here.
- **Cloudflare** notices the change, rebuilds the site, and puts it online. This takes a few minutes.

You never need to touch code to keep the site up to date.

## Adding or changing work

1. Go to **app.pagescms.org** and sign in with GitHub.
2. Open **jacobspetzlerphoto**.
3. Pick a form from the menu on the left, fill it in, press **Save**.
4. Wait about three minutes, then refresh the site.

Anything you leave blank simply doesn't appear on the page.

| Form | What it's for |
| --- | --- |
| Editorial stories | Every published story. Add a front page scan and it joins the Front Pages wall; leave that empty and it appears under Stories. |
| Editorial singles | Stand-alone pictures. |
| Projects | Bodies of work. The book and exhibitions for a project are filled in on the same form. |
| Curated shows | Shows you curated. Each gets a short address you can send to people. |
| Films | Paste a YouTube or Vimeo link, add a poster frame. Tick "Feature" to put one at the top. |
| Homepage | Your tagline, short bio, contact details, the looping clip and the three previews. |
| About page | Full bio, CV, client list. |
| Commercial page | Intro line and a set of images. |

To take something down without deleting it, tick **Hide this … for now**.

## Photos

- Use the JPEGs you already have. The site makes the phone and desktop sizes itself.
- Very large photos are shrunk automatically a minute or two after you upload them (longest side 3,000 pixels; newspaper pages 5,000 so they stay readable).
- Please keep each upload **under about 20 MB**. Bigger files still work, but GitHub keeps the original forever in its history, which slowly fills your storage.
- Photos are never cropped by the site.

## Video

- **Films** live on YouTube or Vimeo. Paste the link into the film's form.
- **Short silent clips** (the homepage frame, clips inside stories) are stored here. Keep each one short (5–20 seconds), without sound, and under 20 MB. Export them as .mp4.

## If something goes wrong

- **A change doesn't show up after ten minutes.** Sign in to Cloudflare, open the *jacobspetzlerphoto* project, and look at the latest build. If it says "Failed", open it and read the last few lines; they usually name the entry that caused it (often a required box left empty). Fix the entry in Pages CMS and save again.
- **You saved something by mistake.** Every save is kept. On GitHub, open this repository, click **Commits**, find the change, and choose **Revert**. Or simply edit the entry again.
- **You need help.** Any developer, or any AI assistant, can work on this. Point them at this README.

## For a developer

- Built with [Astro](https://astro.build). Pages are in `src/pages`, the look is in `src/styles/global.css`, behaviour is in `src/scripts/site.js`.
- Content is Markdown with front matter in `src/content`; the shapes are defined in `src/content.config.ts` and the editing forms in `.pages.yml`. Keep those two in step.
- Photos live in `src/media` and are resized at build time (`src/lib/media.ts`). Entries store paths like `/photos/projects/paradise/paradise-01.jpg`, which map to `src/media/…`.
- Clips and PDFs live in `public/media` and are served as-is.
- `npm install`, then `npm run dev` to work locally, `npm run build` to build into `dist/`.
- Deployed to Cloudflare Workers static assets (`wrangler.jsonc`). Build command `npx astro build`, deploy command `npx wrangler deploy`.
- `.github/workflows/shrink-images.yml` shrinks oversized uploads in place.
