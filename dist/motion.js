/* ============================================================================
   FLEKOUT — hero, header, navigacija, plutajuće "Pozovi"

   Hero: video u kadru sa kosom levom ivicom (16.8°). Pri učitavanju se kadar
   otvara zdesna nalevo (klasa .is-clean); bez JS-a ili uz smanjeno kretanje
   stoji otvoren odmah.
   Video se pauzira van ekrana i u pozadinskom tabu.
============================================================================ */
(() => {
  const hero = document.querySelector('.hero');
  const media = document.querySelector('.hero-media');
  const head = document.querySelector('.site-head');
  const video = document.querySelector('#cleaning-video');
  const toggle = document.querySelector('#video-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!hero || !video) return;

  /* kosa ivica kadra: pomeraj = visina × .3014, pa je ugao uvek 16.8° */
  const text = document.querySelector('.hero-text');
  const measure = () => {
    hero.style.setProperty('--cut', Math.round(media.offsetHeight * .3014) + 'px');
    /* telefon: kosa ivica belog panela, isti ugao iz visine panela */
    if (text) hero.style.setProperty('--pcut', Math.round(text.offsetHeight * .3014) + 'px');
  };
  new ResizeObserver(measure).observe(media);
  if (text) new ResizeObserver(measure).observe(text);
  measure();

  /* --- otvaranje pri učitavanju: kadar se otvara zdesna, ništa ne klizi --- */
  if (!reduced.matches) {
    hero.classList.add('has-wipe');
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-clean')));
    };
    /* sačekaj prvi kadar videa da se ne otkrije prazno, ali najduže 1 s */
    if (video.readyState >= 2) go(); else video.addEventListener('loadeddata', go, { once: true });
    setTimeout(go, 500);
  }

  /* --- video: uvek se pušta sam. Pauzira ga samo korisnik (dugme), skrol van
     heroja i pozadinski tab. Smanjeno kretanje ukida samo animaciju otvaranja,
     ne i video (on ima dugme za pauzu, WCAG 2.2.2). Ako pregledač odbije
     automatsko puštanje (štednja baterije, ušteda podataka), pokušavamo ponovo
     čim se video učita i na prvi dodir, skrol ili klik. --- */
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  let manuallyPaused = false, visible = true;
  function label() {
    if (!toggle) return;
    toggle.classList.toggle('is-paused', video.paused);
    toggle.setAttribute('aria-label', video.paused ? 'Pokreni video' : 'Pauziraj video');
  }
  const wantsPlay = () => !manuallyPaused && visible && !document.hidden;
  function playback() {
    if (wantsPlay()) { const p = video.play(); if (p) p.catch(label); }
    else video.pause();
    label();
  }
  toggle?.addEventListener('click', () => {
    if (video.paused) { manuallyPaused = false; video.play().catch(label); }
    else { manuallyPaused = true; video.pause(); }
  });
  video.addEventListener('play', label);
  video.addEventListener('pause', label);
  ['loadeddata', 'canplay'].forEach(e => video.addEventListener(e, () => { if (wantsPlay() && video.paused) playback(); }));
  const nudge = () => { if (wantsPlay() && video.paused) playback(); };
  ['touchstart', 'pointerdown', 'scroll', 'keydown'].forEach(e => addEventListener(e, nudge, { passive: true }));
  video.addEventListener('error', () => { if (toggle) toggle.hidden = true; });
  document.addEventListener('visibilitychange', playback);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; playback(); }).observe(hero);

  /* --- header: malo gušća podloga kad se skroluje --- */
  const solid = () => head?.classList.toggle('is-solid', scrollY > 12);
  addEventListener('scroll', solid, { passive: true });
  solid();
  playback();
})();

/* Navigacija: link sekcije koja je trenutno na sredini ekrana dobija aria-current. */
(() => {
  const links = [...document.querySelectorAll('nav .nav-link[href^="#"]:not([data-open-prices])')];
  const targets = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const seen = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? seen.add(e.target) : seen.delete(e.target));
    const current = targets.find(t => seen.has(t));
    links.forEach(a => a.setAttribute('aria-current', String(!!current && a.getAttribute('href') === '#' + current.id)));
  }, { rootMargin: '-45% 0px -50% 0px' });
  targets.forEach(t => io.observe(t));
})();

/* Plutajuće "Pozovi" (samo telefon, vidi style.css): vidljivo posle heroja,
   skriveno dok su na ekranu usluge, forma ili futer. */
(() => {
  const fab = document.querySelector('.call-fab');
  if (!fab) return;
  const blockers = ['.hero', '.services-rail', '#kontakt', '.site-foot'].map(s => document.querySelector(s)).filter(Boolean);
  const seen = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? seen.add(e.target) : seen.delete(e.target));
    fab.classList.toggle('is-visible', seen.size === 0);
  }, { rootMargin: '0px 0px -12% 0px' });
  blockers.forEach(b => io.observe(b));
})();

/* Izbor prostora u heroju: otvara isti jezičak u "Naše usluge" i vodi tamo. */
document.querySelectorAll('[data-go-space]').forEach(link => link.addEventListener('click', event => {
  const tab = document.querySelector(`.space-option[data-space="${link.dataset.goSpace}"]`);
  if (!tab) return;
  event.preventDefault();
  tab.click();
  document.querySelector('#usluge').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}));
