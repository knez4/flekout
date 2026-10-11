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
  motion.js        hero — maska logotipa preko videa, dugme za pauzu; aktivni link u navigaciji
  service-rail.js  sekcija "Naše usluge" — traka podtipova, sadržaj i mehanika
  pricing.css      sekcija "Cenovnik"
  why.css          sekcija "Zašto Flekout"
  why.js           sekcija "Zašto Flekout" — otkrivanje redova brisanjem
  process.css/.js  sekcija "Kako radimo"
  contact.css/.js  sekcija "Kontakt" — forma (slanje još nije povezano)
  icons/           Viber i WhatsApp (simple-icons, CC0)
  favicon-32.png, apple-touch-icon.png, robots.txt
  services.js      detaljan katalog usluga (postupak, površine, oprema)
                   NIJE učitan u trenutnoj verziji, čuva se za sledeću fazu
  *.jpg / *.mp4    fotografije i video (privremeni, vidi "Otvoreno");
                   video je 720p bez zvuka, ~1.1 MB
  logo-*.png       logotip u upotrebi na sajtu

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
```

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
| 01 | Naše usluge | urađeno |
| 02 | Cenovnik | urađeno |
| 03 | Zašto Flekout | urađeno |
| 04 | Kako radimo | urađeno |
| 05 | Kontakt | urađeno, slanje nije povezano |

Sekcija **Pre / Posle** dolazi kasnije, kad klijent obezbedi fotografije, i ide
posle Usluga. Brojevi u `eyebrow` natpisima ne broje hero.

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

## Sekcija "Zašto Flekout" — brojevi za podešavanje

`--wipe` na vrhu `dist/why.css` je trajanje brisanja (1300ms). Okidač je u
`dist/why.js`: proverava se pozicija svakog neotkrivenog reda i red se pali kad
mu vrh pređe liniju na dve trećine visine ekrana. Skriveno stanje se pali tek
kad JS doda klasu `is-ready` — ako skripta zakaže, sekcija ostaje čitljiva.

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

Cela sekcija traje oko četiri ekrana. Na telefonu se usluge listaju i
prevlačenjem u stranu. Prve četiri kartice (Kuća / stan) su ispisane u HTML-u,
pa se vide i bez JavaScripta; JS ih na učitavanju zameni istim sadržajem.

Sekcija se sama meri i, ako sadržaj ne staje u ekran, prvo stisne tipografiju
(`.is-tight`), a tek onda odustaje od zakačenog režima i pada na običnu
horizontalnu listu sa snap-om.

---

## Sekcija "Cenovnik"

Cene se menjaju na **dva mesta** u `dist/index.html`: u sekciji `#cenovnik` i u
`application/ld+json` bloku u `<head>` (podaci za pretraživače). Ako se doda
stavka bez potvrđene cene, red dobija atribut `data-todo-price` i prikazuje
"— din" (stil je spreman u `pricing.css`).

---

## Otvoreno

- **Cene** su od klijenta: garnitura 1.000 po sedećem mestu, fotelja 500,
  stolica 250, mono dušek 1.000, bračni dušek 1.500 / 2.500. Ostaje pitanje
  da li su sa PDV-om.
- **Fotografije su privremene.** Četiri kadra rotiraju kroz dvanaest podtipova.
  Svaki podtip treba svoj pravi snimak sa terena.
- **Slanje forme nije povezano.** Svi izbori su već u `FormData` (`space`,
  `contact_method`, `app`); treba servis ili backend koji prima upit i
  fotografije.
- **Podaci o firmi:** telefon u headeru, adresa, radno vreme, politika
  privatnosti (forma prima lične podatke), ime "Flekout" ili "Flekout Clean".
- **Domen.** Bez njega nema `og:image`, `og:url`, `canonical` ni `sitemap.xml`.
- **Sadržaj za proveru sa klijentom:** "48 h", "garancija", "ista ekipa".
