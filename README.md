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
                   hero-1080.mp4 (računar, 2560×1440, ~4.4 MB, H.264 High 5.0)
                   i hero-mobile.mp4 (telefon, uspravni isečak 1080×1620 iz 4K
                   izvora, ~2.7 MB, H.264 High 4.0); petlja od 12 s, ključni
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
red o usluzi, dugme "Zatraži procenu" i link "Cene od 250 din". Desno: video u
visokom kadru čija leva ivica ide pod 16.8°, sa plavim sečivom duž ivice. Pri
učitavanju kadar uđe zdesna. Nema teksta preko videa, logo je samo u headeru.
Header je uvek providan sa zamućenjem (backdrop-filter).
Dugme "Zatraži procenu" u headeru je sklonjeno dok je hero dugme na ekranu
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
"Zatraži procenu"; zatvara se dugmetom, dodirom van panela, prevlačenjem
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
- **Persiranje "ti" ili "vi".** Sajt je na "ti"; za zgrade i firme možda bolje
  "vi". Odluka klijenta.
- **Hero video i fotografije usluga** su stock sa Pixabay-a (vidi tabelu ispod).
  Pixabay nema profesionalan snimak mašinskog pranja u 4K, pa video pokazuje
  mop i kofu (4K, boje smirene: plava kofa i crvena drška su obezbojene da ne
  bodu plavu brenda). Ni za mašinsko pranje poda u stanu nema fotografije sa
  mašinom, pa stoji ravni mop. Jedan dan snimanja na terenu rešava oba.
- **Politika privatnosti** (`dist/politika-privatnosti.html`) je nacrt: treba
  podatke firme, rok čuvanja, servis za formu i pregled pravnika.
- **"Garancija na uslugu"** treba konkretizovati (šta tačno klijent dobija).

- **Cene** su od klijenta: garnitura 1.000 po sedećem mestu, fotelja 500,
  stolica 250, mono dušek 1.000, bračni dušek 1.500 / 2.500. Ostaje pitanje
  da li su sa PDV-om.
- **Fotografije su privremene.** Svaki od dvanaest podtipova ima svoju stock
  fotografiju; treba ih zameniti pravim snimcima sa terena (isti nazivi fajlova,
  pa se kod ne menja).
- **Slanje forme nije povezano.** Svi izbori su već u `FormData` (`space`,
  `contact_method`, `app`); treba servis ili backend koji prima upit i
  fotografije.
- **Kontakt podaci su PRIVREMENI** (izmišljeni telefon, mejl, adresa, radno
  vreme). Svi stoje u `dist/index.html` sa atributom `data-placeholder`
  (`grep data-placeholder`) i u JSON-LD bloku u `<head>`. Ime je "Flekout Clean".
- **Potpis u futeru** ("Dizajn i izrada @knez4") vodi na GitHub profil;
  zameniti linkom ka portfoliju kad bude gotov.
- **Tepih / itison** su u listi cena kao "na proceni"; kancelarijske stolice
  su po istoj ceni kao obične (250). Potvrditi sa klijentom.
- **Politika privatnosti** — forma prima lične podatke, pa treba stranica i
  link u futeru.
- **Domen.** Bez njega nema `og:image`, `og:url`, `canonical` ni `sitemap.xml`.
- **Sadržaj za proveru sa klijentom:** "48 h", "garancija", "ista ekipa".

## Izvori fotografija i videa

Sve je sa Pixabay-a (besplatno za komercijalnu upotrebu, bez obaveznog
potpisa autora). Za zamenu pravim snimkom: isti naziv fajla, ista razmera
(fotografije 4:3, 1400×1050 + `-800.webp` i `-1400.webp`).

| fajl | sadržaj | Pixabay ID | stranica |
|---|---|---|---|
| `hero-1080.mp4`, `hero-mobile.mp4`, `cleaning-poster.*` | mop i kofa na pločicama, 4K; obezbojeni plavi i crveni tonovi, petlja 1,3-13,3 s sa pretapanjem | 34822 | https://pixabay.com/videos/id-34822/ |
| `service-home-deep` | usisivač na čupavom tepihu | 2116241 | https://pixabay.com/photos/vacuum-cleaner-carpet-2116241/ |
| `service-home-floors` | ravni mop na drvenom podu | 268126 | https://pixabay.com/photos/cleaning-washing-mop-268126/ |
| `service-home-windows` | pranje prozora, sprej i krpa | 5928694 | https://pixabay.com/photos/woman-window-cleaning-person-5928694/ |
| `service-home-general` | čišćenje lavaboa u kupatilu | 2799496 | https://pixabay.com/photos/cleanliness-maid-maintains-cleaning-2799496/ |
| `service-building-stairs` | betonsko stepenište sa rukohvatom | 6517488 | https://pixabay.com/photos/stairs-architecture-structure-6517488/ |
| `service-building-garage` | svetla podzemna garaža | 1271917 | https://pixabay.com/photos/multi-storey-car-park-parking-spot-1271917/ |
| `service-building-glass` | staklena vrata, kvaka | 123176 | https://pixabay.com/photos/door-lock-door-door-knob-jack-123176/ |
| `service-building-common` | kolica za čišćenje u hodniku | 1706439 | https://pixabay.com/photos/clean-dare-cleaning-1706439/ |
| `service-office-cleaning` | čistačica u kancelariji | 1909978 | https://pixabay.com/photos/cleaning-job-office-services-1909978/ |
| `service-office-deep` | usisavanje itisona | 3165015 | https://pixabay.com/photos/vacuum-cleaner-vacuuming-cleaning-3165015/ |
| `service-office-floors` | mašina za pranje poda (vozeća) | 2791153 | https://pixabay.com/photos/industrial-floor-cleaners-equipment-2791153/ |
| `service-office-glass` | kancelarija sa staklenom pregradom | 21419 | https://pixabay.com/photos/office-window-space-21419/ |
