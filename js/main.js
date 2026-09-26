/* Creation Memories Photography — site interactions */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const WHATSAPP = '919064724671';
  const CAT_LABEL = { wedding: 'Wedding', prewedding: 'Pre-Wedding', celebration: 'Haldi & Sangeet', commercial: 'Product', design: 'Edit & Design', club: 'Club & Nightlife' };

  /* ---------- nav ---------- */
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  const bar = $('#progress');
  const onScroll = () => {
    nav.classList.toggle('solid', window.scrollY > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const setMenu = open => {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', !open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- portfolio grid ---------- */
  const grid = $('#grid'), more = $('#more');
  const PAGE = 16;
  let filter = 'all', shown = PAGE, list = [];

  // interleave categories for the "All" view so it doesn't open on 30 weddings in a row
  function mixed() {
    const buckets = {};
    PHOTOS.forEach(p => (buckets[p[1]] = buckets[p[1]] || []).push(p));
    const order = ['wedding', 'prewedding', 'club', 'wedding', 'celebration', 'commercial', 'wedding', 'prewedding', 'club', 'design'];
    const out = [];
    while (out.length < PHOTOS.length) {
      for (const c of order) if (buckets[c] && buckets[c].length) out.push(buckets[c].shift());
    }
    return out;
  }
  const ALL = mixed();

  function render() {
    list = filter === 'all' ? ALL : PHOTOS.filter(p => p[1] === filter);
    grid.innerHTML = list.slice(0, shown).map((p, i) =>
      `<a class="tile" href="assets/img/full/${p[0]}.jpg" data-i="${i}" data-cat="${CAT_LABEL[p[1]]}" style="animation-delay:${(i % PAGE) * 40}ms">
         <img src="assets/img/thumb/${p[0]}.jpg" width="${p[2]}" height="${p[3]}" alt="${CAT_LABEL[p[1]]} photograph by Creation Memories" loading="lazy">
       </a>`).join('');
    more.parentElement.hidden = shown >= list.length;
  }
  function setFilter(f) {
    filter = f; shown = PAGE;
    $$('.filters button').forEach(b => b.classList.toggle('on', b.dataset.f === f));
    render();
  }
  $$('.filters button').forEach(b => b.addEventListener('click', () => setFilter(b.dataset.f)));
  more.addEventListener('click', () => { shown += PAGE; render(); });
  $$('.stamp-card').forEach(s => s.addEventListener('click', () => {
    setFilter(s.dataset.filter);
    $('#work').scrollIntoView({ behavior: 'smooth' });
  }));
  render();

  /* ---------- lightbox ---------- */
  const lb = $('#lb'), stage = $('#lbStage'), count = $('#lbCount');
  let idx = 0;
  function showImg(i) {
    idx = (i + list.length) % list.length;
    const p = list[idx];
    stage.innerHTML = `<img src="assets/img/full/${p[0]}.jpg" alt="${CAT_LABEL[p[1]]} photograph">`;
    count.textContent = `${idx + 1} / ${list.length}`;
  }
  function open(isVideo) {
    lb.classList.toggle('video', !!isVideo);
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { stage.innerHTML = ''; }, 350);
  }
  // club reel: open that photo in the lightbox, within the Club set
  $$('[data-club]').forEach(b => b.addEventListener('click', () => {
    setFilter('club');
    showImg(list.findIndex(p => p[0] === b.dataset.club));
    open(false);
  }));
  grid.addEventListener('click', e => {
    const t = e.target.closest('.tile'); if (!t) return;
    e.preventDefault(); showImg(+t.dataset.i); open(false);
  });
  lb.addEventListener('click', e => {
    const a = e.target.closest('[data-lb]');
    if (a) { a.dataset.lb === 'close' ? close() : showImg(idx + (a.dataset.lb === 'next' ? 1 : -1)); return; }
    if (e.target === lb || e.target === stage) close();
  });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) { if (e.key === 'Escape') setMenu(false); return; }
    if (e.key === 'Escape') close();
    if (lb.classList.contains('video')) return;
    if (e.key === 'ArrowRight') showImg(idx + 1);
    if (e.key === 'ArrowLeft') showImg(idx - 1);
  });
  let sx = null;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (sx === null || lb.classList.contains('video')) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) showImg(idx + (dx < 0 ? 1 : -1));
  });

  /* ---------- films: muted previews play while visible ---------- */
  const load = v => {
    const s = $('source', v);
    if (s && !s.src) { s.src = s.dataset.src; v.load(); }
  };
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting && v.offsetParent) { load(v); v.play().catch(() => {}); }
    else v.pause();
  }), { threshold: 0.35 });
  // Muted previews only on devices with a mouse; phones show posters and play on tap (saves data + battery)
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover)').matches;
  if (!reduced) $$('.clip video').forEach(v => vio.observe(v));

  $$('.film-tabs button').forEach(b => b.addEventListener('click', () => {
    $$('.film-tabs button').forEach(x => x.classList.toggle('on', x === b));
    $$('.film-set').forEach(s => {
      const on = s.dataset.set === b.dataset.ft;
      s.classList.toggle('on', on);
      $$('video', s).forEach(v => { if (on && !reduced) { vio.unobserve(v); vio.observe(v); } else v.pause(); });
    });
  }));

  $$('.clip').forEach(c => c.addEventListener('click', () => {
    $$('.clip video').forEach(v => v.pause());
    stage.innerHTML = `<video src="${c.dataset.src}" controls autoplay playsinline></video>`;
    open(true);
  }));

  /* ---------- enquiry form -> WhatsApp ---------- */
  $('#enquiry').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const lines = [
      'Hello Creation Memories! I would like to enquire about a shoot.',
      `Name: ${f.get('name')}`,
      `Phone: ${f.get('phone')}`,
      `Service: ${f.get('service')}`,
      f.get('date') ? `Date: ${f.get('date')}` : '',
      f.get('msg') ? `Details: ${f.get('msg')}` : ''
    ].filter(Boolean);
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });

  /* ---------- keep faces in frame wherever an image is cropped ---------- */
  const key = src => (src.split('/').pop() || '').replace(/\.jpg.*$/, '');
  const focus = el => {
    const f = FOCUS[key(el.currentSrc || el.getAttribute('src') || el.getAttribute('poster') || '')];
    if (f && getComputedStyle(el).objectFit === 'cover') el.style.objectPosition = f;
  };
  $$('img, video[poster]').forEach(el => {
    if (el.tagName === 'IMG' && !el.complete) el.addEventListener('load', () => focus(el), { once: true });
    focus(el);
  });

  $('#yr').textContent = new Date().getFullYear();
})();
