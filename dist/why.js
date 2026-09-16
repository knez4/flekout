/* ============================================================================
   FLEKOUT — sekcija 02 "Zašto Flekout"

   Okidač nije ulazak reda u ekran nego ulazak u DONJU TREĆINU:
   proverava se stvarna pozicija svakog neotkrivenog reda, pa se red pali kad mu vrh
   pređe liniju na dve trećine visine. Dovoljno rano da se ceo potez vidi, a
   ne dok red tek proviruje ispod ivice.

   Jednosmerno: obrisano ostaje obrisano i pri povratku naviše. Red koji je
   liniju već prešao otkriva se odmah, bez animacije u redu čekanja.
============================================================================ */
(() => {
  const section = document.querySelector('.why');
  if (!section) return;

  const rows = [...section.querySelectorAll('.fact')];
  if (!rows.length) return;

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

  const pending = new Set(rows);
  let frame = 0;
  function revealPassed() {
    frame = 0;
    const line = innerHeight * 2 / 3;
    pending.forEach(row => {
      // Includes rows jumped completely past between two browser frames.
      if (row.getBoundingClientRect().top > line) return;
      row.classList.add('is-clean');
      pending.delete(row);
    });
    if (!pending.size) {
      removeEventListener('scroll', schedule);
      removeEventListener('pageshow', schedule);
      document.removeEventListener('visibilitychange', schedule);
    }
  }
  function schedule() {
    if (pending.size && !frame) frame = requestAnimationFrame(revealPassed);
  }

  /* Klasa pali skriveno stanje. Do tog trenutka sekcija stoji otkrivena, pa
     ako skripta zakaže tekst ostaje čitljiv. */
  measure();
  // Mark restored/past rows before enabling masks; no delayed initial reveal.
  revealPassed();
  section.classList.add('is-ready');
  if (pending.size) {
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('pageshow', schedule);
    document.addEventListener('visibilitychange', schedule);
  }

  addEventListener('resize', () => { measure(); schedule(); });
  document.fonts.ready.then(() => { measure(); schedule(); });
})();
