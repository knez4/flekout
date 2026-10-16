/* ============================================================================
   FLEKOUT — sekcija 02 "Zašto Flekout": brisanje vezano za skrol

   Svaki red ima ploču sa plavim sečivom koja prekriva oznaku. Ploča se ne
   otvara sama posle okidača, već prati skrol: počinje kad vrh reda uđe u
   donju trećinu ekrana (START) i završava kad red stigne malo iznad
   sredine (END). Tako se brisanje dešava tamo gde pogled jeste, i korisnik
   ga "vodi" svojim skrolom.

   Glatkoća: ciljna vrednost dolazi iz skrola, a prikazana je sustiže meko
   (GLIDE po kadru, nezavisno od broja kadrova u sekundi). Zato ni točkić,
   koji skroluje u skokovima, ni nagli skok ne daju trzaj.

   Jednosmerno: očišćen red ostaje čist i pri povratku naviše. Red koji je
   već iznad zone (npr. posle osvežavanja stranice na sredini) je odmah čist.
   Bez JS-a ili uz smanjeno kretanje sekcija stoji otkrivena.
============================================================================ */
(() => {
  const section = document.querySelector('.why');
  if (!section) return;

  const rows = [...section.querySelectorAll('.fact')];
  if (!rows.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Zona brisanja, kao deo visine ekrana (vrh reda). Na telefonu je zona
     nešto niža i duža, jer je ekran uži, a palac skroluje kraće poteze. */
  const zone = () => innerWidth <= 800 ? { start: .88, end: .42 } : { start: .82, end: .45 };
  const GLIDE = 0.075;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const clamp = v => Math.max(0, Math.min(1, v));

  /* Pomeraj kosine se računa iz stvarne visine ploče, pa ugao ostaje 16.8°
     bez obzira na veličinu teksta i širinu ekrana. */
  function measure() {
    const wraps = [...section.querySelectorAll('.fact-wrap')];
    wraps.forEach(wrap => { wrap.style.minHeight = ''; });
    const height = Math.max(...wraps.map(wrap => wrap.offsetHeight));
    wraps.forEach(wrap => {
      wrap.style.minHeight = height + 'px';
      const plate = wrap.querySelector('.plate');
      if (plate) plate.style.setProperty('--wrap-h', height + 'px');
    });
  }

  const state = rows.map(row => ({ row, target: 0, shown: 0, done: false }));
  let raf = 0, last = 0;

  function targets() {
    const { start, end } = zone();
    const h = innerHeight;
    state.forEach(s => {
      if (s.done) return;
      const top = s.row.getBoundingClientRect().top;
      const t = clamp((start * h - top) / ((start - end) * h));
      s.target = Math.max(s.target, t); /* jednosmerno */
    });
  }

  function frame(now) {
    raf = 0;
    const dt = last ? Math.min(64, now - last) : 16.7;
    last = now;
    const k = 1 - Math.pow(1 - GLIDE, dt / 16.7);
    let moving = false;
    state.forEach(s => {
      if (s.done) return;
      s.shown += (s.target - s.shown) * k;
      if (Math.abs(s.target - s.shown) < .002) s.shown = s.target;
      else moving = true;
      s.row.style.setProperty('--p', ease(s.shown).toFixed(4));
      if (s.shown >= 1) { s.done = true; s.row.classList.add('is-clean'); }
    });
    if (moving) raf = requestAnimationFrame(frame);
    else last = 0;
    if (state.every(s => s.done)) stop();
  }

  function schedule() {
    targets();
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function stop() {
    removeEventListener('scroll', schedule);
    removeEventListener('resize', onResize);
  }

  function onResize() { measure(); schedule(); }

  /* Redovi koji su pri učitavanju već iznad zone su odmah čisti, bez animacije. */
  measure();
  targets();
  state.forEach(s => {
    if (s.target >= 1) { s.shown = 1; s.done = true; s.row.classList.add('is-clean'); }
    s.row.style.setProperty('--p', s.done ? '1' : '0');
  });
  section.classList.add('is-ready');

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', onResize);
  addEventListener('pageshow', schedule);
  document.fonts?.ready.then(onResize);
  schedule();
})();
