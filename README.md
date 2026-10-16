# FLEKOUT

Sajt za Flekout — mašinsko pranje i čišćenje, Beograd.

Statičan sajt, bez build koraka. Nema `npm install`, nema bundlera — `dist/` se
servira kakav jeste.

---

## Struktura

```
dist/            sajt koji se servira
  index.html       jedan dokument, sve sekcije
  style.css        osnova: tokeni boja, header, hero
  service-rail.css stilovi sekcije "Naše usluge"
  motion.js        hero (video kroz slova, brisanje pri učitavanju, pauza), header, aktivni link, "Pozovi"
  service-rail.js  sekcija "Naše usluge" — traka podtipova, sadržaj i mehanika
  why.css          sekcija "Zašto Flekout"
  why.js           sekcija "Zašto Flekout" — otkrivanje redova brisanjem
  process.css/.js  sekcija "Kako radimo"
  contact.css/.js  sekcija "Kontakt" — forma (slanje još nije povezano)
  footer.css       futer — kontakt podaci, Phosphor ikonice, znak, potpis
  icons/           Viber i WhatsApp (simple-icons, CC0); ostale ikonice su
                   Phosphor "light" (MIT), ubačene direktno u index.html
  favicon-32.png, apple-touch-icon.png, robots.txt
  services.js      detaljan katalog usluga (postupak, površine, oprema)
                   NIJE učitan u trenutnoj verziji, čuva se za sledeću fazu
  *.jpg / *.mp4    fotografije i video (privremeni, vidi "Izvori fotografija i videa");
                   hero-1080.mp4 (računar, 2560×1440, ~5.5 MB, H.264 High 5.0)
                   i hero-mobile.mp4 (telefon, uspravni isečak 1080×1620 iz 4K
                   izvora, ~2.3 MB, H.264 High 4.0); petlja od 7,1 s, ključni
                   kadar na 2 s, ograničen protok, faststart, bez zvuka;
                   pregledač bira preko <source media>. Poster
                   cleaning-poster.webp/.jpg je prvi kadar.
                   Video i poster imaju ?v= oznaku u index.html (keš).
  logo-*.svg       logotip (vektor, trasiran iz PNG-a; original za štampu tražiti od dizajnera)
  fonts/           Manrope, varijabilni, lokalno (SIL OFL)
  service-*.jpg    po jedna fotografija za svaku od 12 usluga (4:3, 1400×1050),
  *-800/1400.webp  plus WebP za srcset (telefon / računar)
  politika-privatnosti.html  NACRT, čeka pravnika i podatke firme

brand/           identitet
  logos/           finalni logotipi (wordmark i simbol, crno/belo/plavo)
  logos/png-v1/    izvozi po veličinama + manifest
  drafts/          radne verzije, ne koristiti
  service-photos/  izvorne fotografije usluga
  export_logos.py  skripta kojom su pravljeni izvozi
  README.md        napomene o identitetu

.claude/skills/  dizajn skillovi (taste-skill), pravila upotrebe u CLAUDE.md

mockups/         privremeni fajlovi za dogovor o dizajnu, ne deo sajta
  zasto-mi.html    sekcija 02 "Zašto Flekout" — izgled i mehanika brisanja
  proces.html      sekcija 03 "Proces" — linija, markeri i paneli koraka
  forma.html       sekcija 04 "Kontakt" — forma, brz kontakt i potvrda
  cene-u-uslugama.html  cene unutar "Naše usluge" — varijante A i B
```

## Keš: verzija fajlova

Svi CSS i JS fajlovi se u `index.html` učitavaju sa `?v=...` (npr.
`style.css?v=20261011c`). **Posle svake izmene CSS-a ili JS-a podigni tu
oznaku** na svim linkovima, inače pregledač pokaže novi HTML sa starim
stilovima (tako su ikonice u futeru jednom ispale ogromne).

Fotografije usluga imaju svoju oznaku: `IMG_V` na vrhu `dist/service-rail.js`
i `?v=` na četiri statične kartice u `index.html`. Podigni je kad zameniš
sliku pod istim imenom. Video i poster imaju `?v=` u `index.html`.

## Pokretanje

Bilo koji statični server iz korena `dist/`:

```bash
npx serve dist
```

Otvaranje `dist/index.html` direktno kroz `file://` radi delimično — video i
fontovi umeju da zakažu, pa je server pouzdaniji.

Mokapi se otvaraju direktno, samostalni su.

---

## Raspored sekcija

Dogovoreni redosled celog sajta:

| | sekcija | status |
|---|---|---|
| — | Hero | urađeno |
| 01 | Naše usluge (sa cenama) | urađeno |
| 02 | Zašto Flekout | urađeno |
| 03 | Kako radimo | urađeno |
| 04 | Kontakt + futer | urađeno, slanje nije povezano |

Sekcija **Pre / Posle** dolazi kasnije, kad klijent obezbedi fotografije, i ide
posle Usluga. Brojevi se koriste samo gde redosled nešto znači (koraci procesa, brojač u
traci usluga). Natpis ("eyebrow") imaju samo Usluge i Kontakt.

---

## Dizajn sistem — kratko

**Rez pod 16.8°.** Header ima `clip-path` od 22px na 73px visine, što je odnos
`.3014`. Isti odnos nose i jezičci za izbor prostora i kadar u tamnoj traci.
Pomeraj se uvek računa iz visine elementa, pa ugao ostaje isti na svakom ekranu.

Rez sme da živi u dve porodice i nigde više:

- **kontejner sa tekstom** — header, jezičci, paneli procesa
- **ivica / maska** — kadar u traci, brisanje u "Zašto Flekout"

**Plava `#168ccd` znači "čisto".** Aktivna usluga, otkriveni deo, poziv na
akciju. Nigde kao ukras. Ispod belog teksta (dugmad, aktivni izbori) ide
tamnija `#0f7ab5` (`--blue-ink`, 4.7:1); `#168ccd` ostaje za linije i markere.
Tokeni su na vrhu `style.css`.

**Tamna traka `#17252e`.** Tekst na njoj `#d7e1e6`, prigušeni `#91a6b4`.

Tipografija: Manrope. Veličine opadaju kroz stranicu — Usluge su najglasnija
sekcija (54px), Zašto mi tiša (46px), Proces informativan (~30px).

## Sekcija "Zašto Flekout" — brisanje vezano za skrol

Sečivo ne kreće samo posle okidača, nego prati skrol: red počinje da se
briše kad mu vrh uđe u donju trećinu ekrana i završava kad stigne malo iznad
sredine. Zona i glatkoća su na vrhu `dist/why.js`:

| konstanta | šta radi |
|---|---|
| `zone()` | početak i kraj zone kao deo visine ekrana (računar .82 → .45, telefon .88 → .42) |
| `GLIDE` | koliko prikaz po kadru sustiže skrol (manje = mekše i sporije) |

Jednosmerno je: očišćen red ostaje čist i pri povratku naviše. Bez JS-a ili
uz smanjeno kretanje sekcija stoji otkrivena.

## Sekcija "Naše usluge" — brojevi za podešavanje

Sve stoji na vrhu `dist/service-rail.js`:

| konstanta | šta radi |
|---|---|
| `PER_CARD` | koliko ekrana skrola vredi jedan podtip (senzibilitet), sada `0.85` |
| `LEAD` | jastuk na ulazu u pikselima — traka miruje dok se ne pređe |
| `TAIL` | koliko poslednji podtip stoji pre nego što sekcija pusti skrol |
| `SETTLE` | prag u smeru kretanja; ispod njega se vraća nazad |
| `GLIDE` | koliko traka po kadru sustiže skrol — manje znači više klizanja |
| `CUT` | nagib reza, `.3014` |

**Kompas** u donjoj traci (`.rail-cue`) prevodi pokret, jer skrol nadole ovde
pomera sadržaj u stranu: na prvoj usluzi "Skroluj za sledeću uslugu" ↓ (na
telefonu "Skroluj ili prevuci"), usput "Sledeće: <naziv>" →, na poslednjoj
"Nastavi nadole" ↓. Ikonica je miš ili ruka prema uređaju; klik vodi na
sledeću uslugu, a na kraju izvodi iz sekcije. Logika je u `updateCue()`.

Cela sekcija traje oko četiri ekrana. Na telefonu se usluge listaju i
prevlačenjem u stranu. Prve četiri kartice (Kuća / stan) su ispisane u HTML-u,
pa se vide i bez JavaScripta; JS ih na učitavanju zameni istim sadržajem.

Sekcija se sama meri i, ako sadržaj ne staje u ekran, prvo stisne tipografiju
(`.is-tight`), a tek onda odustaje od zakačenog režima i pada na običnu
horizontalnu listu sa snap-om.

---

## Hero

Jedna poruka, jedna akcija. Levo na belom: veliki naslov "Bez fleke.", jedan
red o usluzi, dugme "Zatražite procenu" i link "Cene od 150 din". Desno: video u
visokom kadru čija leva ivica ide pod 16.8°, sa plavim sečivom duž ivice. Pri
učitavanju kadar uđe zdesna. Nema teksta preko videa, logo je samo u headeru.
Header je uvek providan sa zamućenjem (backdrop-filter).
Dugme "Zatražite procenu" u headeru je sklonjeno dok je hero dugme na ekranu
(da se ne vide dva ista poziva); čim hero dugme ode iz kadra, uđe u header
(klasa `.is-cta-hidden`, motion.js). Bez JS-a dugme je uvek u headeru.
Aktivna sekcija se u navigaciji ne označava (odluka 14.10.).
Dugmad za akciju nemaju strelicu: znak ↗ iOS crta kao emoji.

Ekran za učitavanje: beli ekran sa logom koji se puni plavom. Uvek traje oko
2 s (punjenje 1,6 s, kratka pauza, bleđenje). Ako video do tada nije spreman,
punjenje stane na 60-90% i dovrši se kad video bude spreman, najkasnije posle
6 s. Ako iOS blokira automatsko puštanje (režim uštede
baterije), video se ne čeka i krene na prvi dodir; to je
ograničenje telefona i ne može se zaobići.

## Cene u sekciji "Naše usluge"

Nema posebnog cenovnika. Svaka kartica u tamnoj traci ima red "Cena" na istom
mestu: usluga sa cenom pokazuje "od X din" i dugme "Sve cene", ostale kažu
"određuje se na proceni".

"Sve cene" otvara ploču koja plavim sečivom prebriše fotografiju. Na
telefonu se cene otvaraju u donjem panelu (bottom sheet) sa dugmetom
"Zatražite procenu"; zatvara se dugmetom, dodirom van panela, prevlačenjem
nadole ili Escape-om. Visina kartice se ne menja, pa zakačeni režim ostaje u ekranu.
Ploča se zatvara na "Zatvori cene", Escape ili čim kartica ode iz kadra.
Link "Cene" u navigaciji vodi na prvu karticu i otvara ploču.

Cene se menjaju na **dva mesta**: `PRICES` na vrhu `dist/service-rail.js` i
`application/ld+json` blok u `<head>` fajla `dist/index.html`. Koja usluga ima
cene određuje polje `prices` u `GROUPS`.

---

## Otvoreno

- **Recenzije i pre / posle.** Najveća rupa u poverenju. Čim klijent pošalje
  3 do 5 pravih recenzija (ili Google profil) i fotografije, ide nova sekcija
  posle Usluga. Recenzije se NE izmišljaju.
- **Obraćanje je na "Vi"** (odluka 15.10.): Vi, Vas, Vam, Vaš velikim slovom,
  dugmad u obliku "Zatražite procenu". Novi tekst pisati isto.
- **Hero video je stock sa Pexels-a** (parno dubinsko čišćenje tepiha, 4K), a
  fotografije usluga sa Pixabay-a (vidi tabelu ispod). Probani i odbačeni: mop
  i kofa (Pixabay 34822), perač pod pritiskom na ulici (Pixabay 2333). Fotografija dubinskog pranja nameštaja
  mašinom (ekstraktor, parni čistač) na Pixabay-u nema, pa stoji ručni usisivač. Jedan dan snimanja na terenu rešava oba.
- **Politika privatnosti** (`dist/politika-privatnosti.html`) je nacrt: podaci
  firme i servis za formu (FormSubmit) su upisani, ostaje rok čuvanja i pregled pravnika.
- **"Garancija na uslugu"** treba konkretizovati (šta tačno klijent dobija).

- **Cene** su od klijenta: garnitura 1.000 po sedećem mestu, fotelja 500,
  stolica 250, tepih 350 po m², mono dušek 1.000, bračni dušek 1.500 / 2.500;
  mašinsko pranje podova u stanu od 150 (tvrde) i od 250 (meke podloge) po m²;
  prozori od 250 po m² (kuća i kancelarija). Otvoreno: da li su cene sa PDV-om.
- **Fotografije su privremene.** Svaki od dvanaest podtipova ima svoju stock
  fotografiju; treba ih zameniti pravim snimcima sa terena (isti nazivi fajlova,
  pa se kod ne menja).
- **Forma šalje upite preko FormSubmit-a** (`dist/contact.js`, `ENDPOINT`) na
  flekout.clean@gmail.com, sa fotografijama smanjenim na najviše 1600 px. Bez fotografija
  šalje AJAX-om (ostaje na stranici); sa fotografijama šalje klasičnu formu, jer
  FormSubmit priloge prima samo tako, i vraća na `?upit=poslat#kontakt`.
  Aktivacija važi po adresi sajta: novi domen traži jedan novi klik na "Activate Form".
  **Prvi upit stiže kao mejl za aktivaciju**: neko sa pristupom tom inboksu mora
  jednom da klikne "Activate form"; do tada upiti ne stižu. Posle aktivacije
  FormSubmit nudi skrivenu adresu (niz slova umesto mejla) koju vredi upisati
  u `ENDPOINT`, da se mejl ne vidi u kodu.
- **Podaci firme** (CompanyWall, 15.10.): Vladimir Vasiljković PR Agencija za
  čišćenje Flekout Clean Barajevo, PIB 115064189, MB 68065461, Obrada Lazića 85,
  11460 Boždarevac; mejl flekout.clean@gmail.com, telefon +381 61 298 3645 (od klijenta),
  radno vreme pon - sub 08-20, nedelja neradna. Stoje u `dist/index.html`
  (kontakt, futer, dugme "Pozovite" i JSON-LD u `<head>`) i u politici privatnosti.
- **Potpis u futeru** (@knez4) vodi na portfolio https://knez4.github.io.
- **Itison** je u listi cena kao "na proceni" (tepih je 350 po m²);
  kancelarijske stolice su po istoj ceni kao obične (250). Potvrditi sa klijentom.
- **Politika privatnosti** — forma prima lične podatke, pa treba stranica i
  link u futeru.
- **Domen: flekoutclean.com** (Loopia, DNS na Cloudflare-u). Adresa stoji u
  `canonical`, `og:url`, `og:image` (`dist/og-image.jpg`, 1200×630), JSON-LD,
  `dist/robots.txt` i `dist/sitemap.xml`. Ako se domen promeni, menja se na tim
  mestima (`grep -r flekoutclean.com dist`). FormSubmit traži jedan klik na
  "Activate Form" za novu adresu.
- **Sadržaj za proveru sa klijentom:** "48 h", "garancija", "ista ekipa".

## Izvori fotografija i videa

Sve je sa Pixabay-a (besplatno za komercijalnu upotrebu, bez obaveznog
potpisa autora). Za zamenu pravim snimkom: isti naziv fajla, ista razmera
(fotografije 4:3, 1400×1050 + `-800.webp` i `-1400.webp`).

Sve fotografije usluga imaju istu blagu obradu da deluju kao serija (ImageMagick):
`-modulate 104,68,100 -level -4%,100%,1.08`, crveni kanal ×0.985, plavi ×1.015
(oko -30% zasićenja, svetlije senke, blago hladno). Mašina za pod i robot imaju
dodatno obezbojenje jer im je pozadina bila šarena. Izvori su na 1280 px, pa su
blago uvećani na 1400.

| fajl | sadržaj | Pixabay ID | stranica |
|---|---|---|---|
| `hero-1080.mp4`, `hero-mobile.mp4`, `cleaning-poster.*` | parno dubinsko čišćenje krem tepiha, 4K, Pexels (licenca Pexels: besplatno i za komercijalnu upotrebu); usporeno na 0,8x, -20% zasićenja, petlja 7,1 s sa pretapanjem | Pexels 4201960 | https://www.pexels.com/video/housework-carpet-living-room-steam-4201960/ |
| `service-home-deep` | ručni usisivač u svetloj sobi | 2537319 | https://pixabay.com/photos/the-push-rod-cleaner-wireless-2537319/ |
| `service-home-floors` | usisivač na svetlom podu | 2799464 | https://pixabay.com/photos/cleanliness-maid-maintains-cleaning-2799464/ |
| `service-home-windows` | svetla soba sa velikim prozorom | 2591358 | https://pixabay.com/photos/white-room-table-chairs-window-2591358/ |
| `service-home-general` | belo kupatilo | 6900977 | https://pixabay.com/photos/real-estate-interior-bath-room-6900977/ |
| `service-building-stairs` | betonsko stepenište sa rukohvatom | 6517488 | https://pixabay.com/photos/stairs-architecture-structure-6517488/ |
| `service-building-garage` | vozeća mašina za pranje poda (dodatno obezbojena) | 2791153 | https://pixabay.com/photos/industrial-floor-cleaners-equipment-2791153/ |
| `service-building-glass` | stakleni prolaz | 863681 | https://pixabay.com/photos/corridor-glass-tunel-direction-863681/ |
| `service-building-common` | beli hodnik u zgradi | 2684824 | https://pixabay.com/photos/apartments-passage-corridor-moon-2684824/ |
| `service-office-cleaning` | bela sala za sastanke | 2181951 | https://pixabay.com/photos/chairs-conference-room-furniture-2181951/ |
| `service-office-deep` | kancelarijska stolica | 6795420 | https://pixabay.com/photos/office-chair-conference-table-6795420/ |
| `service-office-floors` | robot za čišćenje na pločicama (dodatno obezbojen) | 4827253 | https://pixabay.com/photos/vacuum-cleaner-robot-household-4827253/ |
| `service-office-glass` | sala sa staklenom pregradom | 730679 | https://pixabay.com/photos/meeting-room-table-screen-730679/ |
