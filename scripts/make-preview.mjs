// Turns the built site (dist/) into a single-page "preview" (preview/) that can be
// shared as one link before the real site is online. Not used by the live site.
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const OUT = 'preview';
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(DIST, OUT, { recursive: true });

const pages = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name === 'index.html') pages.push(p);
  }
})(OUT);

const routeId = (route) => route.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';

function relink(html) {
  // Page links become #names; file links lose their leading slash.
  html = html.replace(/(href|src|poster|data-src)="\/([^"]*)"/g, (m, attr, rest) => {
    const [p, hash] = rest.split('#');
    const isFile = /\.[a-z0-9]{2,5}$/i.test(p);
    if (attr === 'href' && !isFile) return `href="#${routeId(p)}"${hash ? ` data-jump="${hash}"` : ''}`;
    return `${attr}="${rest}"`;
  });
  html = html.replace(/(srcset|data-srcset)="([^"]*)"/g, (m, attr, v) => `${attr}="${v.replace(/(^|,\s*)\//g, '$1')}"`);
  return html;
}

let shellHead = '';
const templates = [];
for (const file of pages) {
  const raw = fs.readFileSync(file, 'utf8');
  const route = '/' + path.relative(OUT, path.dirname(file)).split(path.sep).join('/');
  const id = routeId(route);
  const title = (raw.match(/<title>([^<]*)<\/title>/) || [, ''])[1];
  const bodyClass = (raw.match(/<body[^>]*class="([^"]*)"/) || [, ''])[1];
  let body = raw.slice(raw.indexOf('>', raw.indexOf('<body')) + 1, raw.lastIndexOf('</body>'));
  body = body.replace(/<script[\s\S]*?<\/script>/g, '');
  templates.push(`<template id="page-${id}" data-title="${title}" data-class="${bodyClass}">${relink(body)}</template>`);
  if (id === 'home') {
    const head = raw.slice(raw.indexOf('<head>') + 6, raw.indexOf('</head>'));
    const script = (raw.match(/<script type="module" src="[^"]*"><\/script>/) || [''])[0];
    shellHead = relink(head) + '\n<!--script-->' + relink(script);
  }
  fs.rmSync(file);
}

const [head, moduleScript] = shellHead.split('<!--script-->');
const shell = `<!DOCTYPE html>
<html lang="en">
<head>${head}</head>
<body>
<div id="app"></div>
${templates.join('\n')}
<script>
(function () {
  var app = document.getElementById('app');
  function show(jump) {
    var id = (location.hash || '#home').slice(1);
    var t = document.getElementById('page-' + id) || document.getElementById('page-home');
    app.innerHTML = '';
    app.appendChild(t.content.cloneNode(true));
    document.body.className = t.dataset.class;
    document.title = t.dataset.title;
    var target = jump && document.getElementById(jump);
    if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
    document.dispatchEvent(new Event('page:swap'));
  }
  var pendingJump = null;
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var name = a.getAttribute('href').slice(1);
    if (!document.getElementById('page-' + name)) {
      // A jump within the current page (for example "The book").
      var el = document.getElementById(name);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
      return;
    }
    pendingJump = a.dataset.jump || null;
    if ('#' + name === (location.hash || '#home')) { e.preventDefault(); show(pendingJump); }
  });
  window.addEventListener('hashchange', function () { show(pendingJump); pendingJump = null; });
  show();
})();
</script>
${moduleScript}
</body>
</html>`;
fs.writeFileSync(path.join(OUT, 'index.html'), shell);

// Inside the stylesheet, fonts sit in the same folder; drop alphabets this site doesn't use.
for (const f of fs.readdirSync(path.join(OUT, '_astro'))) {
  const p = path.join(OUT, '_astro', f);
  if (f.endsWith('.css')) fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replaceAll('url(/_astro/', 'url('));
  if (/(cyrillic|greek|vietnamese).*\.woff2$/.test(f)) fs.rmSync(p);
}

// Give every file a short name so the preview is quick to upload.
if (process.env.SHORT === '1') {
  const map = new Map();
  let n = 0;
  const all = [];
  (function walk(dir) {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) walk(p);
      else if (p !== path.join(OUT, 'index.html')) all.push(p);
    }
  })(OUT);
  fs.mkdirSync(path.join(OUT, 'a'), { recursive: true });
  for (const p of all.sort()) {
    const rel = path.relative(OUT, p).split(path.sep).join('/');
    const short = `a/${(n++).toString(36)}${path.extname(p)}`;
    map.set(rel, short);
    fs.renameSync(p, path.join(OUT, short));
  }
  const swap = (text, prefix = '') => {
    for (const [rel, short] of [...map].sort((x, y) => y[0].length - x[0].length)) text = text.replaceAll(prefix + rel, short);
    return text;
  };
  const idx = path.join(OUT, 'index.html');
  fs.writeFileSync(idx, swap(fs.readFileSync(idx, 'utf8')));
  for (const [rel, short] of map) {
    if (!short.endsWith('.css')) continue;
    const p = path.join(OUT, short);
    let css = fs.readFileSync(p, 'utf8');
    for (const [r2, s2] of map) if (r2.startsWith('_astro/')) css = css.replaceAll(`url(${r2.slice(7)})`, `url(${s2.slice(2)})`);
    fs.writeFileSync(p, css);
  }
}

// Remove the now-empty page folders.
(function prune(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) if (f.isDirectory()) prune(path.join(dir, f.name));
  if (dir !== OUT && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
})(OUT);
console.log(`preview: ${templates.length} pages, index.html ${(shell.length / 1024).toFixed(0)} KB`);
