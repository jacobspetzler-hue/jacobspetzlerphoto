// The small amount of behaviour the pages need:
// full-screen photo viewer, the homepage frame, looping clips,
// the book page-through, video players, phone menu, copy-link button.
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import PhotoSwipe from 'photoswipe';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lightbox;
let clipObserver;

function setupLightbox() {
  if (lightbox) lightbox.destroy();
  lightbox = new PhotoSwipeLightbox({
    gallery: '[data-gallery]',
    children: 'a.zoom',
    pswpModule: PhotoSwipe,
    bgOpacity: 0.97,
    padding: { top: 24, bottom: 48, left: 16, right: 16 },
    // Click or pinch zooms in to actual size, so newspaper pages can be read.
    initialZoomLevel: 'fit',
    secondaryZoomLevel: 1,
    maxZoomLevel: 2,
    wheelToZoom: true,
  });
  lightbox.on('uiRegister', () => {
    lightbox.pswp.ui.registerElement({
      name: 'caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      onInit: (el, pswp) => {
        el.className = 'pswp__caption';
        pswp.on('change', () => {
          el.textContent = pswp.currSlide?.data?.element?.dataset?.caption || '';
        });
      },
    });
  });
  lightbox.init();
}

function play(video) {
  if (!video) return;
  const p = video.play();
  if (p && p.catch) p.catch(() => {});
}

// Silent clips play only while they are on screen.
function setupClips() {
  if (clipObserver) clipObserver.disconnect();
  const clips = document.querySelectorAll('video[data-loop]');
  if (!clips.length) return;
  if (reducedMotion) {
    clips.forEach((v) => (v.controls = true));
    return;
  }
  clipObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const layer = e.target.closest('.layer');
        const hidden = layer && !layer.classList.contains('is-active');
        if (e.isIntersecting && !hidden) play(e.target);
        else e.target.pause();
      });
    },
    { threshold: 0.2 },
  );
  clips.forEach((v) => clipObserver.observe(v));
}

// Homepage: pointing at a button swaps the big frame to that section's preview.
function setupFrame() {
  const frame = document.querySelector('.frame');
  const doors = document.querySelector('.doors');
  if (!frame || !doors) return;
  const hoverable = window.matchMedia('(hover: hover)').matches;
  const show = (name) => {
    frame.querySelectorAll('.layer').forEach((l) => {
      const on = l.dataset.layer === name;
      l.classList.toggle('is-active', on);
      const v = l.querySelector('video');
      if (v) {
        if (on && !reducedMotion) play(v);
        else v.pause();
      }
    });
    doors.querySelectorAll('.door').forEach((d) => d.classList.toggle('is-active', d.dataset.preview === name));
  };
  if (hoverable) {
    doors.querySelectorAll('.door').forEach((d) => {
      d.addEventListener('mouseenter', () => show(d.dataset.preview));
      d.addEventListener('focus', () => show(d.dataset.preview));
      d.addEventListener('blur', () => show('reel'));
    });
    doors.addEventListener('mouseleave', () => show('reel'));
  }
  const toggle = frame.querySelector('.frame-play');
  const reel = frame.querySelector('.layer[data-layer="reel"] video');
  if (toggle && reel) {
    const label = () => (toggle.textContent = reel.paused ? 'Play' : 'Pause');
    toggle.addEventListener('click', () => {
      if (reel.paused) play(reel);
      else reel.pause();
    });
    reel.addEventListener('play', label);
    reel.addEventListener('pause', label);
    label();
  }
}

// Book: one spread at a time.
function setupBooks() {
  document.querySelectorAll('[data-book]').forEach((book) => {
    const img = book.querySelector('.book-stage img');
    const count = book.querySelector('.count');
    const thumbs = [...book.querySelectorAll('.book-thumbs button')];
    if (!img || !thumbs.length) return;
    let i = 0;
    const go = (n) => {
      i = (n + thumbs.length) % thumbs.length;
      const t = thumbs[i];
      img.srcset = t.dataset.srcset;
      img.src = t.dataset.src;
      img.alt = t.dataset.alt;
      if (count) count.textContent = `${i + 1} / ${thumbs.length}`;
      thumbs.forEach((b, k) => b.setAttribute('aria-current', k === i ? 'true' : 'false'));
      // Warm up the next spread so turning the page feels instant.
      const next = thumbs[(i + 1) % thumbs.length];
      const pre = new Image();
      pre.srcset = next.dataset.srcset;
      pre.sizes = img.sizes;
    };
    thumbs.forEach((b, k) => b.addEventListener('click', () => go(k)));
    book.querySelector('[data-next]')?.addEventListener('click', () => go(i + 1));
    book.querySelector('[data-prev]')?.addEventListener('click', () => go(i - 1));
    img.addEventListener('click', () => go(i + 1));
    book.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
    });
    go(0);
  });
}

// Films: show the poster first; load YouTube or Vimeo only after Play is pressed.
function setupPlayers() {
  document.querySelectorAll('.player [data-embed]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.src = btn.dataset.embed;
      frame.title = btn.dataset.title || 'Film';
      frame.allow = 'autoplay; fullscreen; picture-in-picture';
      frame.allowFullscreen = true;
      btn.closest('.player').appendChild(frame);
      btn.remove();
    });
  });
}

function setupMenu() {
  const button = document.querySelector('.menu-button');
  const nav = document.querySelector('.site-nav');
  if (!button || !nav) return;
  button.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
  });
}

function setupCopy() {
  document.querySelectorAll('[data-copy-link]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const url = btn.dataset.copyLink || window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        btn.textContent = 'Link copied';
      } catch {
        btn.textContent = url;
      }
      setTimeout(() => (btn.textContent = 'Copy link'), 2500);
    });
  });
}

function init() {
  setupLightbox();
  setupFrame();
  setupClips();
  setupBooks();
  setupPlayers();
  setupMenu();
  setupCopy();
}

init();
// The shareable preview swaps pages without reloading and asks us to set up again.
document.addEventListener('page:swap', init);
