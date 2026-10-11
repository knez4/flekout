# Flekout — uputstvo za Claude

Sajt za Flekout (mašinsko pranje i čišćenje, Beograd). Statičan HTML/CSS/JS u
`dist/`, bez build koraka i bez frameworka. Sav tekst na sajtu je na srpskoj
latinici. Pre svakog posla pročitaj `README.md`: tamo su raspored sekcija,
dizajn sistem i lista otvorenih stavki.

## Skillovi u `.claude/skills/`

Preuzeti iz [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill)
(MIT licenca, vidi `.claude/skills/LICENSE-taste-skill`), bez izmena.

**Pravilo prednosti: dizajn sistem iz README-a uvek ima prednost nad bilo kojim
skillom.** Skillovi su pisani za opšti slučaj i često za React/Tailwind; ovde
služe kao lista za proveru, ne kao uputstvo za zamenu identiteta.

Šta se iz skillova NE primenjuje na Flekout:

- **Font se ne menja.** Manrope je deo identiteta.
- **Tamna traka `#17252e` je namerna**, nije "slučajna tamna sekcija".
- **Nema placeholder slika** (picsum i sl.) ni pozadinskih fotografija "radi
  dubine". Čekamo prave fotografije sa terena.
- **Plava nije ukras.** `#168ccd` znači "čisto"; ispod belog teksta ide `#0f7ab5`.
- **Rez od 16.8°** živi samo u dve porodice (kontejner sa tekstom, ivica/maska).
- **Bez novih biblioteka i build alata** (React, Tailwind, GSAP, Motion...).
- **Brojevi samo gde redosled nešto znači:** koraci procesa i brojač u traci
  usluga. Natpisi sekcija, jezičci i kartice su bez brojeva (odluka 12.10.).

| skill | kada ga koristiti ovde |
|---|---|
| `redesign-skill` | **glavni** — audit postojećih sekcija: stanja, pristupačnost, meta, semantika |
| `taste-skill` | samo delovi o redizajnu i pre-flight checklisti; deo o React/Tailwind preskočiti |
| `output-skill` | uvek — kompletan kod, bez skraćivanja i placeholdera |
| `brandkit` | brend materijali (vizitke, kombi, majice) iz `brand/` |
| `image-to-code-skill`, `imagegen-frontend-web` | samo za mokape u `mockups/`, nikad direktno u `dist/` |
| `minimalist-skill`, `soft-skill`, `brutalist-skill`, `gpt-tasteskill`, `taste-skill-v1`, `stitch-skill`, `imagegen-frontend-mobile` | ne koriste se za Flekout — stil se kosi sa identitetom ili je za drugu platformu |

## Kako se radi

- Mokap se prvo pravi u `mockups/`, odobri se, pa tek onda ide u `dist/`.
- Posle izmene proveriti u pregledaču na 1440, 1366, 390 i 360 px: bez grešaka
  u konzoli i bez horizontalnog prelivanja.
- Posle izmene CSS/JS podići `?v=` oznaku u `dist/index.html` (vidi README, "Keš").
- Ikonice: samo Phosphor "light" (paket `@phosphor-icons/core`), bez ručno crtanih SVG-ova.
- Bez em-crte (—) i en-crte (–) u tekstu koji korisnik vidi; koristiti zarez, tačku ili crticu.
- Ne izmišljati podatke o firmi: cene, telefon, adresu, rokove, garancije.
  Šta fali, ide u "Otvoreno" u README-u.
