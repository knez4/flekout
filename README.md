# FLEKOUT

Sajt za Flekout — mašinsko pranje i čišćenje, Beograd.

Statičan sajt, bez build koraka. Nema `npm install`, nema bundlera — `dist/` se
servira kakav jeste.

---

## Struktura

```
dist/            sajt koji se servira
  index.html       jedan dokument, sve sekcije
  style.css        osnova: hero, header, završna sekcija, dijalog
  service-rail.css stilovi sekcije "Naše usluge"
  motion.js        hero — maska logotipa preko videa, kontrola videa, dijalog
  service-rail.js  sekcija "Naše usluge" — traka podtipova, sadržaj i mehanika
  why.css          sekcija "Zašto Flekout"
  why.js           sekcija "Zašto Flekout" — otkrivanje redova brisanjem
  services.js      detaljan katalog usluga (postupak, površine, oprema)
                   NIJE učitan u trenutnoj verziji, čuva se za sledeću fazu
  *.jpg / *.mp4    fotografije i video (privremeni, vidi "Otvoreno")
  logo-*.png       logotip u upotrebi na sajtu

brand/           identitet
  logos/           finalni logotipi (wordmark i simbol, crno/belo/plavo)
  logos/png-v1/    izvozi po veličinama + manifest
  drafts/          radne verzije, ne koristiti
  service-photos/  izvorne fotografije usluga
  export_logos.py  skripta kojom su pravljeni izvozi
  README.md        napomene o identitetu

mockups/         privremeni fajlovi za dogovor o dizajnu, ne deo sajta
  zasto-mi.html    sekcija 02 "Zašto Flekout" — izgled i mehanika brisanja
  proces.html      sekcija 03 "Proces" — linija, markeri i paneli koraka
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
| 01 | Hero | urađeno |
| 02 | Naše usluge | urađeno |
| 03 | Zašto Flekout | urađeno |
| 04 | Proces — od upita do čistog prostora | u dogovoru |
| 05 | Forma | nije rađeno |

Sekcija **Pre / Posle** dolazi kasnije, kad klijent obezbedi fotografije, i ide
između 02 i 03.

Brojevi u `eyebrow` natpisima ne broje hero: Usluge su `01`, Zašto Flekout `02`,
završna sekcija je privremeno `03`. Kad Proces dođe, on uzima `03`, a završna
prelazi na `04`.

---

## Dizajn sistem — kratko

**Rez pod 16.8°.** Header ima `clip-path` od 22px na 73px visine, što je odnos
`.3014`. Isti odnos nose i jezičci za izbor prostora i kadar u tamnoj traci.
Pomeraj se uvek računa iz visine elementa, pa ugao ostaje isti na svakom ekranu.

Rez sme da živi u dve porodice i nigde više:

- **kontejner sa tekstom** — header, jezičci, paneli procesa
- **ivica / maska** — kadar u traci, brisanje u "Zašto Flekout"

**Plava `#168ccd` znači "čisto".** Aktivna usluga, otkriveni deo, poziv na
akciju. Nigde kao ukras.

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
| `PER_CARD` | koliko ekrana skrola vredi jedan podtip (senzibilitet) |
| `LEAD` | jastuk na ulazu u pikselima — traka miruje dok se ne pređe |
| `TAIL` | koliko poslednji podtip stoji pre nego što sekcija pusti skrol |
| `SETTLE` | prag u smeru kretanja; ispod njega se vraća nazad |
| `GLIDE` | koliko traka po kadru sustiže skrol — manje znači više klizanja |
| `CUT` | nagib reza, `.3014` |

Sekcija se sama meri i, ako sadržaj ne staje u ekran, prvo stisne tipografiju
(`.is-tight`), a tek onda odustaje od zakačenog režima i pada na običnu
horizontalnu listu sa snap-om.

---

## Otvoreno

- **Fotografije su privremene.** Četiri kadra rotiraju kroz dvanaest podtipova.
  Svaki podtip treba svoj pravi snimak sa terena.
- **Kontakt nije povezan.** Dugme otvara dijalog sa porukom da je prototip.
  Treba forma, broj telefona u headeru i radno vreme.
- **Nema dugmeta za pauzu videa.** Video u hero sekciji se vrti duže od pet
  sekundi bez kontrole, što pada na WCAG 2.2.2.
- **Brojevi u sadržaju su placeholder** — trajanja, minimumi, godine iskustva.
  Proveriti svaki sa klijentom pre nego što sajt ode uživo.
- **`dist/hero.png` (2.4 MB) se nigde ne koristi** — kandidat za brisanje.
- **Kontrast**: bela na plavoj `#168ccd` daje 3.74:1. Prolazi za veliki tekst,
  ne prolazi za sitniji. `#0f7ab5` daje 4.71:1 uz praktično istu boju.
