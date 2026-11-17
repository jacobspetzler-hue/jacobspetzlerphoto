// Makes any photo in src/media that is far bigger than the site needs smaller, in place.
// Photos: longest side 3000 pixels. Newspaper pages: 5000, so they stay readable when zoomed.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = 'src/media';
const limitFor = (file) => (file.includes(`${path.sep}newspaper-pages${path.sep}`) ? 5000 : 3000);
sharp.cache(false);

const files = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.(jpe?g|png)$/i.test(f.name)) files.push(p);
  }
})(ROOT);

let changed = 0;
for (const file of files) {
  const meta = await sharp(file).metadata();
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
  const limit = limitFor(file);
  if (longest <= limit * 1.05) continue; // already a sensible size
  const isPng = /\.png$/i.test(file);
  let img = sharp(file).rotate().resize({ width: limit, height: limit, fit: 'inside', withoutEnlargement: true });
  // sharp converts colours to standard sRGB so photos look the same in every browser.
  img = isPng ? img.png() : img.jpeg({ quality: 86, mozjpeg: true });
  const out = await img.toBuffer();
  fs.writeFileSync(file, out);
  changed++;
  console.log(`shrunk ${file}: ${meta.width}x${meta.height} -> longest side ${limit}`);
}
console.log(`${changed} of ${files.length} photos shrunk`);
