/* ============================================================================
   FLEKOUT — "Naše usluge": nadtip (prostor) + traka podtipova

   Kako radi
   ---------
   Sadržaj je `position:sticky`, a sekcija je visoka koliko treba da se prođe kroz
   sve podtipove. Dok je zakačena, vertikalni skrol se 1:1 preslikava u horizontalni
   pomeraj trake — korisnik doslovno vuče traku. Nadtip se NIKAD ne menja skrolom,
   samo klikom.

   Kad skrol stane, sekcija se "smiri" na najbliži podtip, pa se nikad ne zaustavlja
   na pola prelaza. Prag je 15% u smeru kretanja (ne 50%), da jedan mali cimak točka
   pomeri tačno jedan podtip umesto da se vrati nazad. Smirivanje važi u oba smera.

   Nema otimanja skrola (nigde preventDefault): sve je transform nad stvarnom
   pozicijom skrola, pa inercija, touch i traka za skrol rade normalno, a prvi novi
   pokret prekida smirivanje. Ako je uključeno `prefers-reduced-motion` ili sadržaj
   ne staje u ekran, sekcija se degradira u običnu horizontalnu listu sa snap-om.

   NAPOMENA ZA PRODUKCIJU: fotografije su privremene — svaki podtip treba svoj
   pravi kadar sa terena. Puni katalog usluga (postupak, površine, oprema) stoji
   u services.js i ne učitava se u ovoj verziji.
============================================================================ */
(() => {
  const section = document.querySelector('.services-rail');
  if (!section) return;

  const intro    = section.querySelector('.rail-intro');
  const sticky   = section.querySelector('.rail-sticky');
  const viewport = section.querySelector('.rail-window');
  const track    = section.querySelector('.rail-track');
  const scopeOut = section.querySelector('#rail-scope');
  const counter  = section.querySelector('.rail-position');
  const stepsBox = section.querySelector('.rail-steps');
  const buttons  = [...section.querySelectorAll('.space-option')];
  const reduced  = matchMedia('(prefers-reduced-motion: reduce)');

  /* Četiri odobrena podtipa po nadtipu. Svaki ima svoju fotografiju. */
  const GROUPS = [
    {
      name: 'Kuća / stan',
      items: [
        {
          title: 'Dubinsko pranje',
          text: 'Nameštaj, dušeci, tepisi i druge meke podloge.',
          surfaces: 'Nameštaj / Dušeci / Tepisi',
          image: 'service-furniture.jpg',
          alt: 'Dubinsko pranje tapaciranog nameštaja'
        },
        {
          title: 'Mašinsko pranje podova',
          text: 'Čišćenje tvrdih podnih površina, uz postupak prilagođen materijalu.',
          surfaces: 'Tvrde podne površine',
          image: 'service-floors.jpg',
          alt: 'Mašinsko pranje tvrdog poda'
        },
        {
          title: 'Pranje prozora i stakla',
          text: 'Pranje prozora, staklenih pregrada i drugih staklenih površina u domu.',
          surfaces: 'Prozori / Pregrade / Staklo',
          image: 'service-glass.jpg',
          alt: 'Pranje staklene površine'
        },
        {
          title: 'Generalno čišćenje',
          text: 'Kompletno čišćenje doma, prema dogovorenom obimu.',
          surfaces: 'Kuhinja / Kupatilo / Prostorije',
          image: 'service-space.jpg',
          alt: 'Uredan prostor posle generalnog čišćenja'
        }
      ]
    },
    {
      name: 'Zgrada',
      items: [
        {
          title: 'Čišćenje ulaza i stepeništa',
          text: 'Čišćenje hodnika, stepenica, rukohvata i zajedničkih prostora.',
          surfaces: 'Ulazi / Hodnici / Stepeništa',
          image: 'service-space.jpg',
          alt: 'Čist zajednički prostor u zgradi'
        },
        {
          title: 'Mašinsko pranje podova i garaža',
          text: 'Mašinsko čišćenje većih tvrdih površina u objektu.',
          surfaces: 'Podovi / Garaže',
          image: 'service-floors.jpg',
          alt: 'Mašinsko pranje velike podne površine'
        },
        {
          title: 'Pranje staklenih površina',
          text: 'Pranje staklenih ulaznih vrata, prozora i pregrada.',
          surfaces: 'Ulazna vrata / Prozori / Pregrade',
          image: 'service-glass.jpg',
          alt: 'Pranje staklenih ulaznih vrata'
        },
        {
          title: 'Održavanje zajedničkih prostora',
          text: 'Redovno čišćenje po dogovorenom rasporedu i obimu rada.',
          surfaces: 'Zajednički prostori / Redovno održavanje',
          image: 'service-furniture.jpg',
          alt: 'Održavanje zajedničkog prostora'
        }
      ]
    },
    {
      name: 'Kancelarijski prostor',
      items: [
        {
          title: 'Čišćenje kancelarija',
          text: 'Čišćenje radnih i zajedničkih prostorija poslovnog prostora.',
          surfaces: 'Kancelarije / Zajedničke prostorije',
          image: 'service-space.jpg',
          alt: 'Uredna kancelarija'
        },
        {
          title: 'Dubinsko pranje nameštaja i tepiha',
          text: 'Dubinsko pranje kancelarijskih stolica, garnitura, tepiha i itisona.',
          surfaces: 'Stolice / Garniture / Tepisi / Itisoni',
          image: 'service-furniture.jpg',
          alt: 'Dubinsko pranje kancelarijskog nameštaja'
        },
        {
          title: 'Mašinsko pranje podova',
          text: 'Mašinsko čišćenje tvrdih podnih površina poslovnog prostora.',
          surfaces: 'Tvrde podne površine',
          image: 'service-floors.jpg',
          alt: 'Mašinsko pranje poda u poslovnom prostoru'
        },
        {
          title: 'Pranje staklenih površina',
          text: 'Pranje prozora, staklenih pregrada i vrata.',
          surfaces: 'Prozori / Pregrade / Vrata',
          image: 'service-glass.jpg',
          alt: 'Pranje staklene pregrade'
        }
      ]
    }
  ];

  const LAST = 3;                 /* indeks poslednjeg podtipa */
  const TAIL = 0.5;               /* koliko koraka poslednji podtip stoji pre otpuštanja */
  /* JASTUK NA ULAZU: koliko piksela sekcija stoji zakačena pre nego što traka
     uopšte krene. Bez njega horizontalni pomeraj počinje u istom pikselu u kojem
     se završi vertikalno otkrivanje, pa zamah dolaska odnese prvi podtip.
     Mera je u pikselima, a ne u delu koraka, jer zamah dolaska je fizička
     razdaljina i ne zavisi od toga koliko je PER_CARD podešen. */
  const LEAD = 450;
  /* Izmereno: jedan zavrtaj točka je 100px, korak je ~0.9 ekrana (630px na 700px
     visine) = 15.9%. Prag od 25% znači: jedan usamljen zavrtaj se vrati nazad
     (sekcija pruža otpor), dva ga nose na sledeći podtip. Ovo je JEDINI broj koji
     se dira ako osećaj treba da bude tvrđi (više) ili mekši (manje). */
  const SETTLE = 0.25;
  const GLIDE = 0.10;             /* koliko traka po kadru sustiže skrol — manje = više klizi */
  /* SENZIBILITET horizontalnog skrola: koliko ekrana vertikalnog skrola vredi
     jedan podtip. Veće = traka se sporije pomera i treba više zavrtaja točka.
     Pošto je prag smirivanja procenat od koraka, veći broj ujedno pojačava i
     otpor. GLIDE je samo zaglađivanje pokreta i ne utiče na senzibilitet. */
  const PER_CARD = 1.7;
  const CUT = 0.3014;             /* nagib nav-a: 22px na 73px visine = 16.8° */
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const pad = n => String(n).padStart(2, '0');

  let active = 0, cinematic = false, raf = 0, lastFrame = 0, shown = 0, target = 0;
  let step = 600, total = 2400, offsetTop = 110, introH = 0;
  let cards = [], steps = [];
  let lastY = scrollY, dir = 0, settling = false, endTimer = 0, settleGuard = 0;

  /* ---- render jedne grupe -------------------------------------------- */
  function build(groupIndex) {
    active = groupIndex;
    const group = GROUPS[groupIndex];

    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === groupIndex)));
    scopeOut.textContent = group.name.toUpperCase();

    cards = group.items.map((item, i) => {
      const card = document.createElement('article');
      card.className = 'rail-card';
      card.setAttribute('aria-label', `${pad(i + 1)} od ${pad(group.items.length)} — ${item.title}`);

      const body = document.createElement('div');
      body.className = 'rail-card-body';
      body.innerHTML =
        `<span class="rail-card-number">${pad(i + 1)}</span>` +
        `<h3></h3><p class="rail-card-text"></p><p class="rail-surfaces"></p>`;
      body.querySelector('h3').textContent = item.title;
      body.querySelector('.rail-card-text').textContent = item.text;
      body.querySelector('.rail-surfaces').textContent = item.surfaces;

      const figure = document.createElement('figure');
      figure.className = 'rail-card-figure';
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.alt;
      img.width = 1400;
      img.height = 1050;
      /* prvi kadar odmah, ostali kad zatrebaju */
      img.loading = i === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';
      figure.appendChild(img);

      card.append(body, figure);
      return card;
    });

    /* Četiri segmenta u podnožju: i pokazuju dokle se stiglo i vode na uslugu —
       zbog njih naslov "Biraš uslugu." nije prazno obećanje. */
    steps = group.items.map((item, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'rail-step';
      button.dataset.step = String(i);
      button.setAttribute('aria-label', `${pad(i + 1)} — ${item.title}`);
      button.innerHTML = '<span class="track"><i></i></span>';
      return button;
    });
    stepsBox.replaceChildren(...steps);

    track.replaceChildren(...cards);
    viewport.scrollLeft = 0;
    paint(0);
  }

  /* ---- pozicija trake ------------------------------------------------- */
  function paint(slide) {
    const index = clamp(Math.round(slide), 0, LAST);
    counter.textContent = `${pad(index + 1)} / ${pad(LAST + 1)}`;
    /* segment se puni neprekidno, zajedno sa prstom */
    steps.forEach((button, i) => {
      button.querySelector('i').style.setProperty('--f', clamp(slide - i + 1).toFixed(3));
      button.setAttribute('aria-current', String(i === index));
    });

    /* --o: slika kasni za tekstom — otud osećaj dubine dok podtip prolazi.
       --edge: koliko je kartica odmakla od mirovanja (0 u miru, 1 u prelazu).
       Time se desna ivica kadra zatamni samo dok se traka pomera, pa mirni
       prikaz ostaje netaknut — kadar i dalje ide punom širinom do ivice ekrana. */
    cards.forEach((card, i) => {
      const o = slide - i;
      card.style.setProperty('--o', o.toFixed(3));
      card.style.setProperty('--edge', clamp(Math.abs(o) * 2.5).toFixed(3));
    });
  }

  /* Gde traka TREBA da bude: pređeni vertikalni skrol 1:1 u horizontalni pomeraj.
     Jedan `step` skrola = jedan podtip. Posle četvrtog traka staje (clamp), a
     preostali `TAIL` zadržava sekciju da se poslednji podtip pročita pre nego što
     se otkači i skrol nastavi naniže. */
  function targetSlide() {
    const travelled = clamp(offsetTop - section.getBoundingClientRect().top - introH, 0, total);
    return clamp((travelled - LEAD) / step, 0, LAST);
  }

  function draw(slide) {
    /* Zaokruženje na pun piksel: širina kartice je necelobrojna, pa je na levoj
       ivici ostajala dlaka prethodnog kadra. Uzgred i oštriji tekst. */
    track.style.transform = `translate3d(${Math.round(-slide * viewport.clientWidth)}px,0,0)`;
    paint(slide);
  }

  /* Traka ne stoji na skrolu nego ga sustiže. Zato klizi umesto da se zaledi čim
     točak stane, i zato se smirivanje ne vidi kao „kočenje pa kretanje" — pomeraj
     je uvek u toku. Korak je nezavisan od broja kadrova u sekundi. */
  function frame(now) {
    raf = 0;
    if (!cinematic) { track.style.transform = 'none'; shown = target = 0; return; }

    target = targetSlide();
    const dt = lastFrame ? Math.min(64, now - lastFrame) : 16.7;
    lastFrame = now;

    const k = reduced.matches ? 1 : 1 - Math.pow(1 - GLIDE, dt / 16.7);
    shown += (target - shown) * k;
    if (Math.abs(target - shown) < 0.0008) shown = target;

    draw(shown);
    if (shown !== target) raf = requestAnimationFrame(frame);
    else lastFrame = 0;
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function render() { schedule(); }

  /* ---- merenja -------------------------------------------------------- */
  const fits = () => sticky.offsetHeight <= innerHeight - offsetTop;

  /* Kartica dobija tačno onoliko visine koliko je u traci preostalo, a kadar se
     rasteže s njom. Umesto da modelujemo svaki padding, merimo razliku i
     korigujemo — konvergira iz drugog prolaza. */
  let cardH = 300;
  function grow() {
    cardH = 300;
    for (let pass = 0; pass < 4; pass++) {
      section.style.setProperty('--card-h', cardH + 'px');
      const slack = (innerHeight - offsetTop - 12) - sticky.offsetHeight;
      if (Math.abs(slack) < 3) break;
      const next = clamp(cardH + slack, 170, 470);
      if (next === cardH) break;
      cardH = next;
    }
  }

  /* Rez se meri iz stvarne visine kadra: visina je promenljiva, ugao nije. */
  function measureCut() {
    const figure = track.querySelector('.rail-card-figure');
    if (figure) section.style.setProperty('--fig-cut', Math.round(figure.offsetHeight * CUT) + 'px');
  }

  function layout() {
    offsetTop = innerWidth <= 800 ? 96 : 110;
    section.style.setProperty('--rail-top', offsetTop + 'px');

    /* Zakačena varijanta mora da stane u ekran, inače skrol "zaglavi" na sadržaju
       koji se ne vidi. Zato ne nagađamo visinu kadra nego je izračunamo iz onoga
       što preostane, pa tek ako ni to nije dovoljno stisnemo tipografiju. */
    section.classList.add('is-cinematic');
    section.classList.remove('is-tight');
    section.style.removeProperty('--card-h');

    grow();
    if (!fits()) { section.classList.add('is-tight'); grow(); }

    cinematic = !reduced.matches && fits();
    section.classList.toggle('is-cinematic', cinematic);
    if (!cinematic) {
      section.classList.remove('is-tight');
      section.style.removeProperty('--card-h');
    }

    introH = intro.offsetHeight;
    step = Math.max(520, innerHeight * PER_CARD);
    total = LEAD + step * LAST + step * TAIL;
    section.style.height = cinematic ? (introH + total + sticky.offsetHeight) + 'px' : 'auto';

    measureCut();
    viewport.scrollLeft = 0;
    shown = target = cinematic ? targetSlide() : 0;
    if (cinematic) draw(shown); else track.style.transform = 'none';
    paint(shown);
  }

  /* ---- interakcija ---------------------------------------------------- */
  /* Apsolutna pozicija skrola na kojoj traka počinje da se pomera. */
  /* railStart = gde se sekcija zakači (početak jastuka).
     slideStart = gde traka počinje da se pomera, tj. kraj jastuka. */
  const railStart = () => scrollY + section.getBoundingClientRect().top - offsetTop + introH;
  const slideStart = () => railStart() + LEAD;

  /* ---- smirivanje ------------------------------------------------------ */
  function stopSettle() {
    clearTimeout(settleGuard);
    settling = false;
  }

  /* Pozicija skrola se namesti odmah. Dok je sekcija zakačena, promena skrola ne
     pomera ništa osim trake — a ona do cilja klizi. Zato nema animacije skrola
     koja bi se borila sa korisnikom, a prelaz se i dalje vidi kao potez. */
  function goTo(index) {
    if (!cinematic) {
      viewport.scrollTo({ left: index * viewport.clientWidth, behavior: reduced.matches ? 'instant' : 'smooth' });
      return;
    }
    const to = slideStart() + index * step;
    if (Math.abs(to - scrollY) < 1) return;
    settling = true;
    clearTimeout(settleGuard);
    settleGuard = setTimeout(() => { settling = false; }, 120);
    scrollTo({ top: to, behavior: 'instant' });
    schedule();
  }

  /* Prag je 35% u smeru kretanja: jedan usamljen zavrtaj točka (~17% koraka) se
     vrati nazad — sekcija pruža otpor — a dva ga nose na sledeći podtip. Ulaz,
     rep i izlaz ostaju slobodni da korisnik može da prođe kroz sekciju. */
  function settle() {
    if (!cinematic || settling) return;
    const travelled = offsetTop - section.getBoundingClientRect().top - introH;
    /* Jastuk, rep i izlaz ostaju slobodni — tu korisnik ili tek stiže ili odlazi. */
    if (travelled <= LEAD + 2 || travelled >= LEAD + LAST * step - 2) return;

    const exact = (travelled - LEAD) / step;
    const base = Math.floor(exact);
    const frac = exact - base;
    let next;
    if (dir > 0) next = frac >= SETTLE ? base + 1 : base;
    else if (dir < 0) next = frac <= 1 - SETTLE ? base : base + 1;
    else next = Math.round(exact);

    next = clamp(next, 0, LAST);
    if (Math.abs(next - exact) < 0.004) return;
    goTo(next);
  }

  function onScroll() {
    const delta = scrollY - lastY;
    if (delta) dir = Math.sign(delta);
    lastY = scrollY;
    schedule();
    if (settling) return;
    clearTimeout(endTimer);
    endTimer = setTimeout(settle, 90);
  }

  /* Prvi novi pokret prekida smirivanje — korisnik uvek ima prednost. */
  const interrupt = () => { if (settling) stopSettle(); };

  /* ---- interakcija ---------------------------------------------------- */
  buttons.forEach((button, i) => button.addEventListener('click', () => {
    const pinned = section.getBoundingClientRect().top + introH <= offsetTop;
    build(i);
    /* Kartice u drugoj grupi nisu iste visine — sve se meri iznova. */
    layout();
    if (cinematic && pinned) { stopSettle(); scrollTo({ top: railStart(), behavior: 'instant' }); }
    render();
  }));

  stepsBox.addEventListener('click', event => {
    const button = event.target.closest('.rail-step');
    if (button) goTo(Number(button.dataset.step));
  });

  viewport.addEventListener('scroll', () => {
    if (!cinematic) paint(viewport.scrollLeft / Math.max(1, viewport.clientWidth));
  }, { passive: true });

  viewport.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const now = cinematic
      ? clamp(Math.round((scrollY - slideStart()) / step), 0, LAST)
      : Math.round(viewport.scrollLeft / viewport.clientWidth);
    const next = event.key === 'Home' ? 0
      : event.key === 'End' ? LAST
      : clamp(now + (event.key === 'ArrowRight' ? 1 : -1), 0, LAST);
    goTo(next);
  });

  build(active);
  layout();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('wheel', interrupt, { passive: true });
  addEventListener('touchstart', interrupt, { passive: true });
  addEventListener('pointerdown', interrupt, { passive: true });
  /* dok je kartica u pozadini rAF stoji — poravnaj traku čim se vrati u prvi plan */
  document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });
  addEventListener('resize', layout);
  reduced.addEventListener('change', layout);
  document.fonts.ready.then(layout);
})();
