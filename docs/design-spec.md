# Mapsa – designspec

> **Ny riktning:** `docs/hemsida-brief.md` (avsnitt 7) går före den här specen. Landningssidans
> tokens (sand, nära-svart, orange `flame`, Instrument Serif i rubriker) ska användas även i
> kartan och appen. Delarna nedan om "inga accentfärger" och svarta nålar ersätts steg för steg
> (se planen: steg 3 gör prislapparna orange).

Inspirerad av Ubers app. Koden får bara använda värdena i det här dokumentet.
Alla tokens finns i `src/app/design-system.css`.

## Uppmätt från Uber-skärmdumpar (går före specen nedan)

Skärmdumparna är från en iPhone (1179 px bred = 393 pt, 3 px per pt).

| Element | Uppmätt i Uber | Vad vi använder |
| --- | --- | --- |
| Sidmarginal | 16 pt | 16 px (samma som specen) |
| Sökfält, höjd | 60 pt (kant till kant) | **60 px** (specen sa 48) |
| Sökfält, form | helt rund (pill), 1 pt grå kant + mjuk skugga | **helt rund**, 1 px kant `#E8E8E8` + skuggan nedan (specen sa 8 px radie) |
| Sökfält, text | ≈ 18 pt | **18 px** (specen sa 16) |
| Stor rubrik (namn på kontosidan) | ≈ 36 pt, fet | 32 px / 700 (största tillåtna storleken) |
| Sektionsrubrik ("Butiker nära dig") | ≈ 19–20 pt, fet | 18 px / 600 |
| Titel i lista ("Familj", "ICA Nära …") | ≈ 16 pt | 16 px / 600 |
| Undertext i lista | ≈ 12–14 pt, grå | 14 px / 400, `#6B6B6B` |

## Typsnitt

- Inter (via `next/font`). Inget annat typsnitt.
- Storlekar, inga andra: **32 / 24 / 18 / 16 / 14 / 12 px**
  (Tailwind: `text-4xl` 32, `text-2xl` 24, `text-lg` 18, `text-base` 16, `text-sm` 14, `text-xs` 12).
- Vikter: **700** sidrubriker, **600** titlar i listor och knappar, **400** allt annat.
- Letter-spacing: **-0.01em** på 24 px och större, 0 på resten.
- Line-height: **1.2** på rubriker (18 px och större), **1.5** på brödtext.

## Färger (bara dessa)

| Token | Ljust | Mörkt |
| --- | --- | --- |
| `canvas` (bakgrund) | `#FFFFFF` | (mörkt läge avstängt) |
| `ink` (text, primärknapp, nålar) | `#000000` | `#FFFFFF` |
| `fill` (chips, sekundärknappar, ytor) | `#F3F3F3` | `#1C1C1C` |
| `line` (linjer) | `#E8E8E8` | `#2A2A2A` |
| `muted` (sekundärtext) | `#6B6B6B` | `#949494` (inverterad `#6B6B6B`) |

Accentfärgen (`#ff5a1f`) används bara på prislapparna på kartan. Kategorifärger bara som ljus bakgrund
bakom kategori-ikonen när foto saknas. Inga färgprickar. Appen är alltid ljus – mörkt läge är avstängt
tills vidare (önskemål: färgerna var för mörka).

## Mått

- Sidmarginal mobil: 16 px. Alla avstånd i steg om 4/8 px.
- Hörnradie: 8 px på knappar, fält, chips och bilder. 16 px bara på bottenarkets överkant.
  Undantag från skärmdump: sökfältet är helt runt. Tillbakaknappen är en cirkel. Bilden överst
  på profilen går kant i kant på mobil och har därför ingen radie där.
- Skugga, en enda: `0 4px 16px rgba(0,0,0,0.12)` – bara på flytande sökfält och bottenark
  (arket: samma skugga riktad uppåt).

## Startsidan `/`

- Varumärkets färger och typsnitt som `/foretag`: `sand`-bakgrund, `panel`-text, serif i rubrikerna.
- Hero och berättelsen i en sektion. **Desktop:** texten till vänster (5/12) och jordklotet sticky till höger (7/12, `100dvh`). **Mobil:** klotet sticky överst (56 dvh) och texten under.
- Jordklotet (`src/components/story/globe-scene.tsx`): radie 3, low-poly (ikosaeder) med land och hav som färg per triangel, en krans av butiker längs överkanten (lat 52–64°) med framsidan mot kameran. Färger från tokens, MeshStandardMaterial med roughness 0,85–0,95, kameran höjdvinkel 10° och fov 30. Avståndet räknas ur bildformatet så att hela klotet ryms i bild. Klotet är en knapp ("Öppna kartan"): tryck → kameran dyker in (0,75 s) → `/karta`.
- Prislappar: `PricePill` (`src/components/price-pill.tsx`), samma markup och CSS (`.mapsa-pin`) som på kartan.
- Stillbilder: `public/scen/poster-desktop.webp` och `poster-mobil.webp`, med prislapparnas lägen i `src/components/story/poster.ts`. Ta fram nya om klotet ändras (dev-servern plus `window.__mapsaPosterMode`).

## Kartan `/karta`, mobil

- Ingen header. Kartan fyller hela skärmen.
- Sökfält överst, flytande (se uppmätta värden). Ikon + "Vad letar du efter?".
- Bottenark med två lägen: **ihopfällt** (standard: handtag, "N utövare" och kategoriknapparna,
  uppmätt, högst 40 % av höjden) och **90 %** (hela listan). Dras med fjäder (motion).
- Rubrik i arket: "7 utövare", 18 px / 600. Ingen underrubrik.
- Filter: bara kategoriknappar (inget områdesfilter). Höjd 36 px, `fill`, svart text 14 px / 600,
  radie 8 px. Vald = svart bakgrund, vit text. Ingen ikon, ingen prick.
- Vald utövare: ett kompakt kort ersätter listan i arket (bild 64 px, namn, "Frisör · Trossö",
  "fr. 250 kr", **Boka ↗** och "Mer info"). Stängs med ✕, tryck på kartan, Esc eller svep nedåt.
- Listrader: höjd 80 px, bild 64×64 med 8 px radie, titel 16 px / 600, "Massage · Trossö"
  14 px `muted`, pris till höger på en rad: "fr. 395 kr" 16 px / 600. Inga linjer, 8 px luft.

## Kartan `/karta`, desktop

- Panel till vänster, 380 px (logga, "För företag", meny, sök, rubrik, kategoriknappar, lista
  med samma rader som på mobil), karta till höger. Inget bottenark.
- Pekar man på en rad blir lappen på kartan mörk. Vald utövare: kortet visas i samma panel.

## Kartan

- MapLibre GL med kartdata från OpenFreeMap (gratis, ingen API-nyckel) och egen stil i
  `src/lib/map-style.ts`: varm ljus mark, vita vägar med tunn kant, dämpat blått vatten,
  dämpat grönt, platta ljusa hus från zoom 13. Alltid ljus.
- **Platt 2D:** pitch 0, bearing 0, `maxPitch: 0`. Går inte att luta eller rotera (mus,
  pekskärm eller tangentbord). Inga 3D-hus, ingen terräng, ingen himmel.
- Få etiketter: orter, stadsdelar i versaler 12 px, gatunamn från zoom 15. Inga POI-ikoner.
- Prislappar: liten pill "250 kr" i accentfärgen (`#ff5a1f`, vit text 13 px / 600), tryckyta minst
  44×44 px. Vald: mörk (`#141312`) och 12 % större. Lappar som överlappar på skärmen slås ihop till
  ett kluster (vit rund lapp med orange ring och antalet). Längst in (zoom 18) läggs utövare på samma
  adress bredvid varandra. Det som skulle hamna under den valda lappen flyttas precis bredvid den.
- Kameran rör sig bara (1) vid start: utzoomad medan kartan laddar, sedan zoom in med `fitBounds` (1,6 s, en gång; reducerad rörelse → direkt), (2) när filter eller sökning
  ändras: `fitBounds` 400 ms, (3) vid tryck på ett kluster: zoom in tills det delas, 400 ms,
  (4) när vald lapp annars skulle döljas av kortet eller sökfältet: `panBy` 300 ms. Aldrig zoom
  eller flygning vid val. Padding = sökfältets och arkets uppmätta höjd. Reducerad rörelse → 0 ms.
- Laddvy i kartans ljusa ton med Mapsa-symbolen och "Laddar kartan…" tills kartan har laddat
  (tonar bort på 200 ms). Utan WebGL: "Kartan kunde inte laddas" – listan fungerar ändå.

## Profilsidan

- En kolumn (max ca 720 px), även på desktop. Tillbakaknapp: `fill`-cirkel 40 px överst.
- Bild bara om den finns: 16:9 med 12 px radie. Ingen tom bildyta.
- Ordning: namn 24 px / 700 (36 px desktop), "Massage · Trossö" 16 px `muted`, "fr. 395 kr"
  18 px / 600, **Boka**, tjänster, adress och öppettider, telefon, e-post, erbjudande,
  beskrivning ("Om …", max 65 tecken per rad), video.
- Boka-knapp: svart, höjd 56 px, radie 8 px, 18 px / 600 vit text, full bredd på mobil (auto på
  större skärm). Ligger i flödet – inte fast längst ner – och tar inte emot tryck de första 600 ms
  (skydd mot dubbeltryck från kortets "Mer info").
- Inforader: ikon 20 px + text 16 px, höjd 56 px. Tjänster: namn till vänster, "50 min" grå under,
  pris till höger.

## Bilder

- Foton bara med företagets tillåtelse, samma beskärning (4:3, 1200×900, `npm run photos`).
  Saknas foto (eller går det inte att ladda) visas kategorins ikon på en ljus färgad bakgrund –
  aldrig en grå ruta.

## Rörelse

- 200 ms ease-out på hover/tryck. Tryck = `scale(0.98)`.
- Skelett när listan laddar.
- `prefers-reduced-motion`: inga övergångar, arket och kartan hoppar direkt i stället för att glida.
- Kartan har inga kamerafärder, ingen lutning och ingen rotation (se Kartan).

## Städat bort

- "Testdata"-text i vyerna (bara på `/testdata`).
- Next.js dev-indikatorn (`devIndicators: false`).
- Dekor: onödiga ikoner, badges, guld, prickar, gradienter, glas.
