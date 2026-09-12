/* ============================================================================
   FLEKOUT — sekcija "Naše usluge"

   Struktura: prostor (Dom / Poslovni prostor / Zgrade) -> indeks usluga -> detalj.
   Potpisna mehanika: "pre / posle" otkrivanje, isto kao maska na heroju —
   nešto prljavo se skloni i ispod je čisto. To je i značenje imena Flekout.

   NAPOMENA ZA PRODUKCIJU
   ---------------------
   Sva polja `meta` (trajanje, minimum, procena) i tekstovi `tools` su
   PLACEHOLDER vrednosti postavljene da bi se video oblik sekcije.
   Pre nego što sajt ide uživo, proveriti svaku sa klijentom.
   Fotografije "pre" su trenutno filtrirane verzije iste slike — zamenjuju se
   pravim snimcima sa terena (isti kadar, pre i posle).
============================================================================ */
(() => {
  const motionOff = matchMedia('(prefers-reduced-motion: reduce)');

  const SERVICES = [
    {
      id: 'podovi',
      name: 'Podovi',
      sub: 'Mašinsko pranje tvrdih podloga',
      title: 'Čistoća od poda.',
      description: 'Mašinsko pranje tvrdih podloga, sa postupkom i preparatom prilagođenim vrsti površine i stepenu zaprljanosti.',
      scopes: ['dom', 'posao', 'zgrade'],
      surfaces: ['teraco', 'granit', 'keramika', 'epoxy', 'beton', 'laminat', 'mermer'],
      steps: [
        'Pregled podloge i proba preparata na skrivenom delu.',
        'Mašinsko pranje rotacionom četkom uz istovremeno usisavanje vode.',
        'Neutralizacija i sušenje — prostor je odmah prohodan.'
      ],
      tools: 'Podoperač sa rotacionom četkom i usisom vode · pH‑neutralni preparati',
      meta: { trajanje: 'od 2 h', minimum: 'od 30 m²', procena: 'besplatna' },
      image: 'service-floors.jpg',
      alt: 'Mašinsko čišćenje poda u svetloj kancelariji'
    },
    {
      id: 'nametaj',
      name: 'Nameštaj i tepisi',
      sub: 'Dubinsko pranje mekih površina',
      title: 'Svežina koja se oseća.',
      description: 'Dubinsko pranje tapaciranog nameštaja i tepiha ekstrakcijom — prljavština izlazi iz vlakana, a materijal ostaje netaknut.',
      scopes: ['dom', 'posao'],
      surfaces: ['sofe', 'fotelje', 'stolice', 'tepisi', 'staze', 'itisoni'],
      steps: [
        'Suvo usisavanje i uklanjanje krupne prljavštine.',
        'Nanošenje preparata i razlaganje fleka po vlaknima.',
        'Ekstrakcija pod pritiskom i izvlačenje vode iz dubine.'
      ],
      tools: 'Mašina za dubinsku ekstrakciju · preparati bezbedni za tekstil i decu',
      meta: { trajanje: 'od 1.5 h', minimum: 'od 1 komada', procena: 'besplatna' },
      image: 'service-furniture.jpg',
      alt: 'Dubinsko pranje tapaciranog nameštaja'
    },
    {
      id: 'duseci',
      name: 'Dušeci',
      sub: 'Dubinsko pranje i dezinfekcija',
      title: 'Čist san.',
      description: 'Dubinsko pranje dušeka sa obe strane — uklanjanje grinja, prašine, mrlja i mirisa iz slojeva do kojih usisivač ne stiže.',
      scopes: ['dom'],
      surfaces: ['dušeci', 'jastuci', 'uzglavlja', 'dečji kreveci'],
      steps: [
        'Suvo usisavanje obe strane i ivica dušeka.',
        'Tretman preparatom protiv grinja i neprijatnih mirisa.',
        'Ekstrakcija i ubrzano sušenje do upotrebljivog stanja.'
      ],
      tools: 'Ekstrakciona mašina · antibakterijski tretman po dogovoru',
      meta: { trajanje: 'od 1 h', minimum: 'od 1 komada', procena: 'besplatna' },
      image: 'service-furniture.jpg',
      alt: 'Dubinsko pranje dušeka'
    },
    {
      id: 'staklo',
      name: 'Staklene površine',
      sub: 'Prozori, izlozi i pregrade',
      title: 'Više svetla. Manje tragova.',
      description: 'Pranje prozora, izloga i staklenih pregrada — bez kapi, bez linija i bez tragova na ramovima.',
      scopes: ['dom', 'posao', 'zgrade'],
      surfaces: ['prozori', 'izlozi', 'pregrade', 'ograde', 'ogledala'],
      steps: [
        'Uklanjanje prašine i naslaga sa rama i okvira.',
        'Pranje profesionalnim brisačem i demineralizovanom vodom.',
        'Poliranje ivica, uglova i profila.'
      ],
      tools: 'Teleskopski sistem sa demineralizovanom vodom · profesionalni brisači',
      meta: { trajanje: 'od 1 h', minimum: 'od 5 prozora', procena: 'besplatna' },
      image: 'service-glass.jpg',
      alt: 'Čišćenje staklene pregrade'
    },
    {
      id: 'gradnja',
      name: 'Posle gradnje',
      sub: 'Građevinsko čišćenje i renoviranje',
      title: 'Iz gradilišta u prostor.',
      description: 'Uklanjanje građevinske prašine, ostataka maltera, lepka, silikona i boje — od primopredaje do useljivog stanja.',
      scopes: ['dom', 'posao', 'zgrade'],
      surfaces: ['podovi', 'stolarija', 'staklo', 'sanitarije', 'radijatori'],
      steps: [
        'Grubo uklanjanje otpada i slojeva prašine.',
        'Skidanje naslaga sa stolarije, stakla i sanitarija.',
        'Fino čišćenje i mašinsko pranje podova.'
      ],
      tools: 'Industrijski usisivači · podoperač · rastvarači za građevinske naslage',
      meta: { trajanje: 'od 4 h', minimum: 'po prostoru', procena: 'besplatna' },
      image: 'service-space.jpg',
      alt: 'Prostor posle građevinskog čišćenja'
    },
    {
      id: 'auto',
      name: 'Auto enterijer',
      sub: 'Dubinsko pranje vozila',
      title: 'Kabina kao nova.',
      description: 'Dubinsko pranje sedišta, tepiha i tapacirunga, uz uklanjanje mirisa iz enterijera vozila.',
      scopes: ['dom'],
      surfaces: ['sedišta', 'tepisi', 'tapacirung', 'plafon', 'gepek'],
      steps: [
        'Usisavanje enterijera i vađenje patosnica.',
        'Ekstrakcija sedišta i tepiha preparatom za tekstil.',
        'Tretman mirisa i sušenje kabine.'
      ],
      tools: 'Ekstrakciona mašina · tretman ozonom po dogovoru',
      meta: { trajanje: 'od 2 h', minimum: 'po vozilu', procena: 'besplatna' },
      image: 'service-furniture.jpg',
      alt: 'Dubinsko pranje enterijera vozila'
    },
    {
      id: 'stanovi',
      name: 'Stanovi i kuće',
      sub: 'Generalno čišćenje prostora',
      title: 'Prostor spreman za svaki dan.',
      description: 'Generalno čišćenje stanova i kuća — od kuhinje i kupatila do prozora i podova. Obim dogovaramo prema tvojim potrebama.',
      scopes: ['dom'],
      surfaces: ['kuhinja', 'kupatilo', 'podovi', 'staklo', 'stolarija'],
      steps: [
        'Obilazak prostora i dogovor o obimu.',
        'Čišćenje po prostorijama, odozgo nadole.',
        'Mašinsko pranje podova i završna kontrola.'
      ],
      tools: 'Profesionalna hemija · mikrofiber sistem · podoperač po potrebi',
      meta: { trajanje: 'od 3 h', minimum: 'po prostoru', procena: 'besplatna' },
      image: 'service-space.jpg',
      alt: 'Uredan stan u neutralnim tonovima'
    },
    {
      id: 'zajednicke',
      name: 'Zajedničke prostorije',
      sub: 'Hodnici, stepeništa i garaže',
      title: 'Zgrada koja se vidi.',
      description: 'Mašinsko pranje stepeništa, hodnika, ulaza i garaža — jednokratno ili po mesečnom planu održavanja.',
      scopes: ['zgrade'],
      surfaces: ['stepeništa', 'hodnici', 'ulazi', 'garaže', 'liftovi'],
      steps: [
        'Obilazak objekta sa upravnikom i plan obilaska.',
        'Mašinsko pranje podova i vlažno brisanje rukohvata.',
        'Izveštaj o urađenom posle svakog izlaska.'
      ],
      tools: 'Podoperač · mašina za pranje stepeništa · industrijski usisivači',
      meta: { trajanje: 'od 3 h', minimum: 'po objektu', procena: 'besplatna' },
      image: 'service-floors.jpg',
      alt: 'Čišćenje zajedničkog hodnika u zgradi'
    },
    {
      id: 'fasade',
      name: 'Fasade i spoljne površine',
      sub: 'Pranje pod pritiskom',
      title: 'Prvi utisak spolja.',
      description: 'Pranje pod pritiskom za fasade, terase, staze i ograde — uklanjanje naslaga, mahovine i gradskog zagađenja.',
      scopes: ['posao', 'zgrade'],
      surfaces: ['fasade', 'terase', 'staze', 'ograde', 'dvorišta'],
      steps: [
        'Procena podloge i izbor pritiska koji je ne oštećuje.',
        'Pranje pod pritiskom odozgo nadole.',
        'Ispiranje i uklanjanje sprane prljavštine sa terena.'
      ],
      tools: 'Profesionalni perač pod pritiskom · rotacione dizne',
      meta: { trajanje: 'od 4 h', minimum: 'po objektu', procena: 'besplatna' },
      image: 'service-glass.jpg',
      alt: 'Pranje spoljne površine pod pritiskom'
    },
    {
      id: 'odrzavanje',
      name: 'Redovno održavanje',
      sub: 'Po ugovoru, na duže staze',
      title: 'Čisto, bez podsećanja.',
      description: 'Održavanje prostora po dogovorenom planu i dinamici — dnevno, nedeljno ili mesečno, sa istom ekipom.',
      scopes: ['posao', 'zgrade'],
      surfaces: ['kancelarije', 'lokali', 'ordinacije', 'magacini', 'zgrade'],
      steps: [
        'Obilazak prostora i izrada plana održavanja.',
        'Dolasci po dogovorenoj dinamici, uvek ista ekipa.',
        'Periodično dubinsko čišćenje uključeno u plan.'
      ],
      tools: 'Oprema ostaje na lokaciji po dogovoru · mesečni izveštaj',
      meta: { trajanje: 'po planu', minimum: 'ugovor od 1 meseca', procena: 'besplatna' },
      image: 'service-space.jpg',
      alt: 'Održavana kancelarija u neutralnim tonovima'
    }
  ];

  // New presentation consumes the existing service content without changing it.
  if (window.initializeServiceRail) {
    window.initializeServiceRail(SERVICES);
    return;
  }
  const SCOPE_LABELS = { dom: 'dom', posao: 'poslovni prostor', zgrade: 'zgrade i objekte' };

  /* 1 usluga · 2–4 usluge · 5+ usluga */
  const plural = n => {
    const last = n % 10, hundred = n % 100;
    if (last === 1 && hundred !== 11) return 'usluga';
    if (last >= 2 && last <= 4 && (hundred < 12 || hundred > 14)) return 'usluge';
    return 'usluga';
  };

  const section       = document.querySelector('#usluge');
  if (!section) return;
  const scopeButtons  = [...section.querySelectorAll('.scope-btn')];
  const index         = section.querySelector('.index');
  const explorer      = section.querySelector('.explorer');
  const panel         = section.querySelector('#service-panel');
  const clean         = section.querySelector('#shot-clean');
  const dirty         = section.querySelector('#shot-dirty');
  const reveal        = section.querySelector('#reveal');
  const range         = section.querySelector('#reveal-range');
  const compact       = matchMedia('(max-width: 700px)');

  let scope = 'dom';
  let list = [];
  let current = 0;
  let taught = false;

  /* ---- pre / posle ---------------------------------------------------- */
  const setWipe = value => reveal.style.setProperty('--pos', (100 - value) + '%');

  range.addEventListener('input', () => setWipe(+range.value));
  ['pointerdown', 'pointerup', 'pointercancel'].forEach(type =>
    range.addEventListener(type, e => reveal.classList.toggle('dragging', e.type === 'pointerdown'))
  );

  /* Prvi put kad sekcija uđe u vidno polje, prevučemo sami — da se nauči
     da je fotografija interaktivna. Bez toga niko ne dodirne klizač. */
  function teach() {
    if (taught) return;
    taught = true;
    if (motionOff.matches) { range.value = 55; setWipe(55); return; }
    let start;
    const step = now => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / 1100);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = eased * 55;
      range.value = value;
      setWipe(value);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  new IntersectionObserver((entries, observer) => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    setTimeout(teach, 450);
  }, { threshold: 0.35 }).observe(reveal);

  /* ---- render --------------------------------------------------------- */
  function fill(service, position) {
    section.querySelector('#service-title').textContent = service.title;
    section.querySelector('#service-description').textContent = service.description;
    section.querySelector('#service-tools').textContent = service.tools;
    section.querySelector('#photo-count').textContent =
      `${String(position + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;

    section.querySelector('#service-surfaces').innerHTML =
      service.surfaces.map(s => `<li>${s}</li>`).join('');

    section.querySelector('#service-steps').innerHTML = service.steps
      .map((s, i) => `<li><i>${String(i + 1).padStart(2, '0')}</i><span>${s}</span></li>`).join('');

    section.querySelector('#service-meta').innerHTML = `
      <div><dt>Trajanje</dt><dd>${service.meta.trajanje}</dd></div>
      <div><dt>Minimum</dt><dd>${service.meta.minimum}</dd></div>
      <div><dt>Procena</dt><dd>${service.meta.procena}</dd></div>`;

    const cta = section.querySelector('#service-cta');
    cta.setAttribute('aria-label', `Zatraži procenu — ${service.name.toLowerCase()}`);
  }

  async function swapPhoto(service, token) {
    /* Sačekamo da se fotografija dekodira da wipe ne krene preko praznog polja,
       ali ne duže od 350 ms: decode() ume da visi kad kartica nije u prvom planu. */
    const next = new Image();
    next.src = service.image;
    await Promise.race([
      next.decode().catch(() => {}),
      new Promise(resolve => setTimeout(resolve, 350))
    ]);
    if (token !== current) return;
    clean.src = service.image;
    clean.alt = service.alt;
    dirty.src = service.image;
    if (!motionOff.matches) {
      reveal.animate(
        [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
        { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' }
      );
    }
  }

  function select(position, { focusPanel = false } = {}) {
    const service = list[position];
    if (!service) return;
    current = position;

    list.forEach((item, i) => {
      const button = item.button;
      if (compact.matches) button.setAttribute('aria-expanded', String(i === position));
      else {
        button.setAttribute('aria-selected', String(i === position));
        button.tabIndex = i === position ? 0 : -1;
      }
    });

    panel.setAttribute('aria-labelledby', service.button.id);
    fill(service, position);
    swapPhoto(service, position);
    place();
    if (focusPanel && !compact.matches) panel.focus({ preventScroll: true });
  }

  /* Na uskim ekranima detalj živi u redu koji je otvoren (harmonika),
     na širokim je to desna kolona. Isti DOM, samo premešten. */
  function place() {
    const host = compact.matches ? list[current]?.li : explorer;
    if (host && panel.parentElement !== host) host.appendChild(panel);
  }

  function applySemantics() {
    const mobile = compact.matches;
    index.setAttribute('role', mobile ? 'list' : 'tablist');
    if (mobile) index.removeAttribute('aria-orientation');
    else index.setAttribute('aria-orientation', 'vertical');
    panel.setAttribute('role', mobile ? 'region' : 'tabpanel');

    list.forEach((item, i) => {
      const button = item.button;
      item.li.setAttribute('role', mobile ? 'listitem' : 'presentation');
      if (mobile) {
        button.setAttribute('role', 'button');
        button.setAttribute('aria-expanded', String(i === current));
        button.removeAttribute('aria-selected');
        button.tabIndex = 0;
      } else {
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', String(i === current));
        button.removeAttribute('aria-expanded');
        button.tabIndex = i === current ? 0 : -1;
      }
    });
    place();
  }

  /* ---- prostor (Dom / Poslovni prostor / Zgrade) ----------------------- */
  function applyScope(next) {
    scope = next;
    scopeButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.scope === scope)));

    list = [];
    [...index.children].forEach(li => {
      const button = li.querySelector('.row');
      const fits = button.dataset.scopes.split(' ').includes(scope);
      li.hidden = !fits;
      if (!fits) return;
      const service = SERVICES.find(s => s.id === button.dataset.service);
      list.push({ ...service, li, button });
      li.querySelector('.row-num').textContent = String(list.length).padStart(2, '0');
    });

    section.querySelector('#scope-summary').textContent =
      `${list.length} ${plural(list.length)} za ${SCOPE_LABELS[scope]}.`;

    current = 0;
    applySemantics();
    select(0);
  }

  scopeButtons.forEach(button => {
    const count = SERVICES.filter(s => s.scopes.includes(button.dataset.scope)).length;
    button.querySelector('em').textContent = String(count).padStart(2, '0');
    button.addEventListener('click', () => applyScope(button.dataset.scope));
  });

  /* ---- interakcija sa listom ------------------------------------------ */
  index.addEventListener('click', event => {
    const button = event.target.closest('.row');
    if (!button) return;
    const position = list.findIndex(item => item.button === button);
    if (position < 0) return;
    if (compact.matches && position === current && panel.parentElement === list[position].li) {
      // već otvoren — samo skrolujemo do fotografije
      panel.scrollIntoView({ behavior: motionOff.matches ? 'auto' : 'smooth', block: 'nearest' });
      return;
    }
    select(position);
  });

  index.addEventListener('keydown', event => {
    if (compact.matches) return;
    const button = event.target.closest('.row');
    if (!button) return;
    const position = list.findIndex(item => item.button === button);
    let next = position;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (position + 1) % list.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (position - 1 + list.length) % list.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = list.length - 1;
    else return;
    event.preventDefault();
    list[next].button.focus();
    select(next);
  });

  compact.addEventListener('change', applySemantics);

  setWipe(0);          /* krećemo od "pre" — čisto se otkriva tek pokretom */
  applyScope('dom');
})();
