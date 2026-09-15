/* ============================================================================
   FLEKOUT — sekcija 02 "Zašto Flekout"

   Okidač nije ulazak reda u ekran nego ulazak u DONJU TREĆINU: koren
   posmatranja je stisnut na gornjih 67% ekrana, pa se red pali kad mu vrh
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
    section.querySelectorAll('.fact-wrap').forEach(wrap => {
      const plate = wrap.querySelector('.plate');
      if (plate) plate.style.setProperty('--wrap-h', wrap.offsetHeight + 'px');
    });
  }

  function watch() {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-clean');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -33.333% 0px', threshold: 0 });

    const line = innerHeight * 2 / 3;
    rows.forEach(row => {
      if (row.getBoundingClientRect().top <= line) row.classList.add('is-clean');
      else observer.observe(row);
    });
  }

  /* Klasa pali skriveno stanje. Do tog trenutka sekcija stoji otkrivena, pa
     ako skripta zakaže tekst ostaje čitljiv. */
  measure();
  section.classList.add('is-ready');
  watch();

  addEventListener('resize', measure);
  document.fonts.ready.then(measure);
})();
