# Mapsa – designspec

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
| `canvas` (bakgrund) | `#FFFFFF` | `#000000` |
| `ink` (text, primärknapp, nålar) | `#000000` | `#FFFFFF` |
| `fill` (chips, sekundärknappar, ytor) | `#F3F3F3` | `#1C1C1C` |
| `line` (linjer) | `#E8E8E8` | `#2A2A2A` |
| `muted` (sekundärtext) | `#6B6B6B` | `#949494` (inverterad `#6B6B6B`) |

Inga kategorifärger, inga färgprickar, ingen accentfärg.

## Mått

- Sidmarginal mobil: 16 px. Alla avstånd i steg om 4/8 px.
- Hörnradie: 8 px på knappar, fält, chips och bilder. 16 px bara på bottenarkets överkant.
  Undantag från skärmdump: sökfältet är helt runt. Tillbakaknappen är en cirkel. Bilden överst
  på profilen går kant i kant på mobil och har därför ingen radie där.
- Skugga, en enda: `0 4px 16px rgba(0,0,0,0.12)` – bara på flytande sökfält och bottenark
  (arket: samma skugga riktad uppåt).

## Startsidan, mobil

- Ingen header. Kartan fyller hela skärmen.
- Sökfält överst, flytande (se uppmätta värden). Ikon + "Vad letar du efter?".
- Områdesväljaren ligger bland filtren (som ett chip), inte i sökfältet.
- Bottenark: dras mellan **25 % / 50 % / 90 %** av skärmhöjden med fjäder (motion).
- Rubrik i arket: "7 utövare", 18 px / 600. Ingen underrubrik.
- Chips: höjd 36 px, `fill`, svart text 14 px / 600, radie 8 px. Vald = svart bakgrund, vit text.
  Ingen ikon, ingen prick (undantag: områdeschipet har en pil, eftersom det öppnar en lista).
- Listrader: höjd 80 px, bild 64×64 med 8 px radie, titel 16 px / 600, "Massage · Trossö"
  14 px `muted`, pris till höger på en rad: "fr. 395 kr" 16 px / 600. Inga linjer, 8 px luft.

## Startsidan, desktop

- Panel till vänster (logga, sök, rubrik, chips, lista), karta till höger.

## Kartan

- MapLibre GL med kartdata från OpenFreeMap (gratis, ingen API-nyckel) och egen stil i
  `src/lib/map-style.ts`: ljusgrå mark, vita vägar med tunn grå kant, mjukt blått vatten,
  dämpat grönt, grå byggnader. Mörkt läge har en egen mörk variant.
- Låga byggnader i 3D från zoom 14 (verklig höjd, max 24 m, skalad till 60 %), kartan lutar 45°.
  Ingen rotation.
- Få etiketter: stadsdelar i versaler 12 px, gatunamn 12 px från zoom 14.
- Prislappar som Airbnb (ändrat på önskemål): vit, helt rund, 28 px hög, 14 px / 600 svart text,
  mjuk skugga. Vald: svart med vit text, lite större. Lappar som krockar blir små tomma lappar.
  Kartans färger och lapparnas skugga är undantag från färg- och skuggreglerna ovan.
- Klick på en rad i listan → kartan glider mjukt till lappen (`flyTo`) och lappen blir vald.

## Profilsidan

- Bild överst i full bredd: 4:3 på mobil, 16:9 på desktop. Tillbakaknapp: vit cirkel 40 px uppe till vänster.
- Namn 24 px / 700 (32 px desktop). Under: "Massage · Trossö" 16 px `muted`.
- Beskrivning 16 px, max 65 tecken per rad.
- Inforader (adress, öppettider, kontakt): ikon 20 px + text 16 px, höjd 56 px.
- Tjänster: namn till vänster, "50 min" grå under, pris till höger.
- Boka-knapp: svart, höjd 56 px, radie 8 px, 18 px / 600 vit text, full bredd, sticky längst ner på mobil.
  Desktop: i en kolumn till höger, ingen ruta runt.

## Bilder

- Riktiga foton på alla testprofiler, rätt kategori, samma beskärning (4:3, 1200×900).
  Se `docs/testdata-bilder.md`. Ingen bokstav eller ikon i stället för bild – saknas filen syns en tom `fill`-yta.

## Rörelse

- 200 ms ease-out på hover/tryck. Tryck = `scale(0.98)`.
- Skelett när listan laddar.
- `prefers-reduced-motion`: inga övergångar, arket och kartan hoppar direkt i stället för att glida.

## Städat bort

- "Testdata"-text i vyerna (bara på `/testdata`).
- Next.js dev-indikatorn (`devIndicators: false`).
- Dekor: onödiga ikoner, badges, guld, prickar, gradienter, glas.
