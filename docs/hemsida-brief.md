# Mapsa – brief för nya hemsidan

Lägg filen i repot som `docs/hemsida-brief.md`. Claude Code ska läsa den innan varje steg.

> **Kartan är platt 2D – inga 3D-effekter eller kamerafärder.** Det ersätter allt som tidigare stod här om 3D, drönarflygning, pitch, kamerarotation och kamera-animationer (se avsnitt 4). 3D finns bara som illustration: ön på startsidan `/` (avsnitt 4a) och staden på `/foretag`.

---

## 1. Mål

1. En företagare ska förstå vad Mapsa gör **inom 5 sekunder** och kunna anmäla sig **inom 2 minuter**, i mobilen.
2. En kund ska kunna hitta en utövare och se priset **utan att läsa någonting**.
3. Sidan ska funka på julmarknaden: någon scannar en QR-kod, har 10 sekunder av uppmärksamhet och dåligt nät.

## 2. Tre principer (allt annat följer av dessa)

1. **Visa, förklara inte.** Den riktiga kartan är illustrationen. Inga mockups, inga flikar med funktioner, inga listor med "features".
2. **Anmälan *är* demon.** Företagaren bygger sin egen prislapp på kartan, live, medan hen fyller i. När den är klar trycker hen på "Skicka in". Säljsidan och anmälan är samma sak.
3. **En sak per skärm, en knapp på hela sidan.** Varje sektion har ett enda budskap. Den enda primära knappen på /foretag är **"Lägg upp ditt företag"**.

## 3. Sidkarta

| Sida | För vem | Syfte |
|---|---|---|
| `/` | Kunder | Startsidan: hero och ön i 3D med berättelsen (sök → se priser → boka), sedan "Öppna kartan". |
| `/karta` | Kunder | Kartan. Sök, se priser, boka. |
| `/foretag` | Företagare | Berättelsen + anmälan i ett flöde |
| `/foretag/tack` | Företagare | Bekräftelse och vad som händer nu |
| `/utovare/[slug]` | Kunder | Profil (finns redan) |
| `/integritet` | Alla | Integritetspolicy (krävs eftersom vi samlar in uppgifter) |
| `/karta?visning=1` | Julmarknaden | Visningsläge för skärmen i montern |

Kartan låg tidigare på `/`. Gamla länkar med `?vald=`, `?kategori=`, `?q=` eller `?visning=` på `/` skickas vidare till `/karta` (querysträngen följer med).

Ta bort: nuvarande flikar (Kartan/Profilen/Statistik/Bokning), statistikraden (6 kategorier / 5 kommuner…), fyra prisnivåer, mockup-kortet i heron.

---

## 4a. `/` – startsidan med ön

- **Hero:** rubrik *"Se vad det kostar innan du bokar."*, underrubrik *"Frisörer, massörer, PT och fler i Blekinge – på en karta, med priset."*, sökrutan (söker på `/karta`) och **Öppna kartan**. Ön syns redan här.
- **Ön:** stiliserad low-poly-version av Trossö (@react-three/fiber + drei): rundad markplatta, 20 hus med sadeltak (krämvitt, terrakotta), granar, klippor och vatten som rör sig mjukt. Matt "lera"-känsla, mjukt ljus, en kontaktskugga, inga realtidsskuggor.
- **Berättelsen** (sticky – ön ligger kvar medan texten scrollar förbi):
  1. *"Sök det du letar efter."* Ön roterar långsamt, ett sökfält svävar ovanför och "frisör" skrivs in.
  2. *"Se alla priser direkt."* 4–5 prislappar (3 på mobil) poppar upp ovanför husen, en i taget. Det är samma `PricePill` som på kartan, med riktiga utövare och priser.
  3. *"Boka där de redan tar bokningar."* Kameran glider in mot en prislapp, som blir vald (mörk), och kortet fälls ut med "fr. X kr" och Boka. Sist kommer **Öppna kartan** → `/karta`.
- **Mobil:** ön överst och mindre, texten under. Ingen hover, och ön går inte att vrida med fingret (scroll går rakt igenom).
- **Prestanda:**
  - En stillbild av ön (tagen ur scenen) visas direkt.
  - 3D laddas (`next/dynamic`, `ssr: false`) först när besökaren scrollar eller rör musen, och ritar bara när ön syns. `dpr` är 1–1,5, och hus och träd använder instancing.
  - Utan WebGL, på en svag enhet, med "spara data" eller vid reducerad rörelse visas stillbilden och de tre stegen som vanliga kort.
  - Mål: Lighthouse mobil Performance ≥ 75.

## 4. `/karta` – kartan

Inga marknadsföringssektioner. Bara produkten. Minimalistiskt: kunden ser prislappar, trycker på en och kan boka. Från öppnad sida till bokning: högst 2 tryck (prislapp → Boka).

- **Kartan visas direkt.** Ingen startvy med illustration. Sökrutan *"Vad letar du efter?"* ligger överst.
- **Platt 2D:** pitch 0 och bearing 0. Kartan går inte att luta eller rotera. Inga 3D-hus, ingen terräng och ingen himmel. Man kan panorera och zooma.
- **Lugn kartstil:** dämpade färger i sidans toner, inga POI-ikoner och få etiketter (orter, stadsdelar och gatunamn när man zoomat in).
- **Kameran rör sig bara när:**
  1. sidan öppnas: `fitBounds` till alla utövare som visas, utan animation.
  2. filter eller sökning ändras: `fitBounds`, cirka 400 ms.
  3. man trycker på ett kluster: zoom in tills klustret delas, cirka 400 ms.
  4. man väljer en utövare: ingen zoom och ingen flygning. Bara ett kort `panBy` (cirka 300 ms) om lappen annars hamnar bakom kortet eller sökrutan.

  Padding räknas från sökrutans och bottenpanelens verkliga höjd, så att ingen prislapp hamnar bakom dem. Vid `prefers-reduced-motion` är alla tider 0.
- **Prislappar:** en liten pill, "250 kr", i accentfärgen. Vald lapp är mörk och lite större. Överlappande lappar slås ihop till ett kluster med antalet. Tryckytan är minst 44×44 px. Inget annat ritas på kartan.
- **Tryck på en prislapp eller en rad i listan:** lappen markeras och ett kompakt kort ersätter listan.
  - Kortet visar bild (eller kategori-ikon på färgad bakgrund), namn, kategori · område och "fr. 250 kr".
  - **Boka ↗** öppnas i ny flik. "Mer info" leder till `/utovare/[slug]`.
  - Kortet stängs med tryck på kartan, ✕ eller svep nedåt.
  - Adressen blir `/?vald=<slug>`, som går att dela, men kameran rör sig inte.
- **Bottenpanelen (mobil):** ihopfälld som standard med "N utövare" och kategoriknapparna, högst cirka 40 % av höjden. Dra upp för hela listan.
- **Dator (≥ 1024 px):** en panel till vänster på cirka 380 px. Kortet visas i samma panel, och det finns ingen bottenpanel.
- **Filter:** bara kategoriknappar.
- **Laddning:** en laddvy i sidans färger tills kartan har laddat. Aldrig en grå karta.
- **Meny:** en liten länk "För företag".

---

## 5. `/foretag` – berättelsen i tre akter

### Akt 1 – Kroken (en skärm)

> **Din nästa kund letar efter dig just nu.**
> Mapsa visar alla utövare i Blekinge på en karta, med priset, så kunden ser direkt vad det kostar och bokar hos dig.
>
> [ Lägg upp ditt företag ]  ·  *Gratis att komma igång*

- Bakgrund: illustrationen (bara här – `/` visar kartan direkt).
- Under knappen, i liten text: "Ett UF-företag från Karlskrona".

### Akt 2 – Berättelsen från kundens håll (scroll-styrd, 3 scener)

Sektionen är klistrad (sticky), och kartan i bakgrunden ändras när man scrollar. En kort mening per scen.

1. **"Hon söker 'frisör' i Karlskrona."** Sökrutan skrivs i automatiskt.
2. **"Hon ser alla frisörer, med priserna."** Kartan visar frisörerna och prislapparna poppar upp.
3. **"Hon bokar hos dig, i systemet du redan har."** En prislapp markeras, kortet öppnas, Boka-knappen pulserar. Under: *Bokadirekt, Fresha, egen hemsida, telefon eller Instagram. 0 % provision.*

Det här ersätter "Så funkar det", "Funktioner" och flikarna. Allt de försökte säga visas här.

På mobil och vid `prefers-reduced-motion`: visa scenerna som tre stilla bilder/kort under varandra i stället för scroll-animation.

### Akt 3 – Bygg din prislapp (anmälan)

> **Lägg upp ditt företag. Det tar två minuter.**

Delad vy: formuläret till vänster, en levande förhandsvisning på kartan till höger. På mobil: förhandsvisningen överst (kompakt), formuläret under.

Formuläret i steg, med förhandsvisningen som uppdateras direkt:

| Steg | Fält | Det som händer i förhandsvisningen |
|---|---|---|
| 1 | Företagsnamn, kategori | Kortet får namn och kategori |
| 2 | Adress (med förslag) | Kartan visar adressen och prislappen dyker upp där |
| 3 | Din billigaste tjänst + pris | Prislappen visar "fr. 250 kr" |
| 4 | Bokningslänk (eller telefon) | Boka-knappen blir aktiv |
| 5 | Ditt namn, mejl, telefon | — |

- Knapp: **Skicka in**. Under: *Gratis första månaden. Inget betalkort. Vi granskar och hör av oss inom 48 timmar.*
- Kryssruta: "Jag godkänner att Mapsa sparar uppgifterna enligt [integritetspolicyn]".
- Spara utkastet i localStorage (inom try/catch) så att inget försvinner om man lämnar sidan.

### Efter akt 3 – Förtroende (kort, i den här ordningen)

1. **Med på kartan:** de riktiga företagen med namn och bild. Visas bara när det finns minst 3.
2. **Pris (en rad, inte en tabell):** "Gratis att komma igång. Vill du synas först i din kategori: [PRIS] kr/mån." *(pris bestäms av oss)*
3. **Vi som gör Mapsa:** bild på oss två, "UF-företag i Karlskrona", mejl och telefon.
4. **Frågor (max 4):** Är Mapsa ett bokningssystem? · Vad kostar det? · Hur tar jag bort min profil? · Vilka kan vara med?
5. **Footer:** kontakt, integritetspolicy, "UF-företag · Blekinge".

**Mobil:** en klistrad knapp längst ner, "Lägg upp ditt företag", som syns överallt utom när formuläret är i bild.

---

## 6. Anmälan – data och flöde

- Spara i Supabase, tabell `ansokningar`: id, skapad, foretagsnamn, kategori, adress, lat, lng, tjanst, pris, bokningslank, kontaktnamn, mejl, telefon, kalla (från `?ref=`), status (`ny` / `godkand` / `nekad`).
- Row Level Security: anonyma får bara INSERT, aldrig läsa.
- Validera på servern (server action). Enkel spam-spärr: dolt honeypot-fält.
- Skicka en notis till oss vid varje ny anmälan.
- Skicka till `/foretag/tack`: "Tack! Vi hör av oss inom 48 timmar. Under tiden: [Se kartan]".

## 7. Design

- Använd landningssidans befintliga färger och typsnitt: krämvit bakgrund, nära-svart, orange accent, serif i rubrikerna. Samla dem som design tokens och använd dem **även i kartan och appen**.
- Kartstil: utgå från nuvarande OpenFreeMap-stil men färga land, vatten och vägar i varumärkets toner. Dölj onödiga etiketter.
- Prislappar: orange. Vald prislapp: större och mörk.
- Tomma bilder: aldrig grå rutor. Fallback = kategori-ikon på en färgad bakgrund.
- Rörelse: mjuk och långsam. Respektera `prefers-reduced-motion`.

## 8. Julmarknaden

- `/karta?visning=1`: helskärm, inga menyer. Kartan står still, utan kameraloop. Efter 20 sekunder utan att någon rör skärmen öppnas kortet för utövarna, en i taget. Vid beröring: vanlig karta.
- QR-koder pekar på `/?ref=julmarknad` och `/foretag?ref=julmarknad`. `ref` sparas med anmälan.

## 9. Prestanda

- Kartan får aldrig visas som en grå yta. Visa en laddskärm i varumärkets färger tills kartan har laddat.
- Mål: första innehållet syns inom 2 s på 4G. Mät med Lighthouse (mobil).
- Undersök att servera en egen PMTiles-fil med bara Blekinge.

## 10. Klart när

- [ ] Någon som aldrig sett Mapsa kan säga vad det är efter 5 sekunder på `/foretag`.
- [ ] Anmälan går att göra klart på en iPhone på under 2 minuter, och raden hamnar i Supabase.
- [ ] Inga prislappar döljs bakom bottenpanelen.
- [ ] Inga grå bildrutor någonstans.
- [ ] Integritetspolicy finns och länkas från formuläret.
- [ ] Lighthouse mobil: Performance ≥ 80, Accessibility ≥ 90.
- [ ] Visningsläget funkar i 30 minuter utan att krascha.

---

## 11. Så guidar du Claude Code

**Arbetssätt**
- Börja varje steg i **plan mode** (Shift+Tab) så att Claude Code planerar innan den skriver kod. Läs planen och godkänn eller ändra.
- Ett steg i taget. Testa och committa mellan stegen.
- Dra in skärmdumparna på sidorna du gillar direkt i Claude Code och säg *vad* du gillar ("den målade bakgrunden och sökrutan som svävar i mitten"), inte bara "gör det snyggare".
- Be den alltid kolla resultatet i 375 px (mobil) och 1440 px (dator).
- Skriv texterna själv (de finns i briefen). Låt inte Claude Code hitta på innehåll.

**Ordning och färdiga prompts**

1. **Kartlägg**
   > Läs docs/hemsida-brief.md. Skriv ingen kod än. Gå igenom hur `/`, `/foretag` och kartkomponenten är byggda i dag och föreslå en plan i steg för att nå briefen. Lista det du är osäker på.

2. **Anmälan (viktigast, gör först)**
   > Bygg akt 3 i briefen: anmälningsformuläret i steg med live-förhandsvisning på kartan, Supabase-tabellen `ansokningar` med RLS, server action med validering och honeypot, och `/foretag/tack`. Återanvänd den befintliga kartkomponenten. Visa skärmdumpar i 375 px och 1440 px när du är klar.

3. **Kartan: fixa grunderna**
   > Enligt avsnitt 4, 7 och 9 i briefen: platt 2D-karta (ingen 3D, ingen lutning eller rotation), laddskärm i stället för grå karta, `fitBounds` med padding så att bottenpanelen inte täcker prislapparna, orange prislappar med kluster, kortet som ersätter listan vid tryck på en prislapp (prislapp → Boka = 2 tryck), och fallback i stället för grå bildrutor.

4. **Ny struktur för /foretag**
   > Bygg om /foretag enligt avsnitt 5: akt 1, akt 2 som tre stilla scener (ingen scroll-animation än), akt 3 (redan klar), och förtroendesektionerna. Ta bort det som står under "Ta bort" i avsnitt 3.

5. **Julmarknaden**
   > Bygg visningsläget och `?ref=`-spårningen enligt avsnitt 8.

6. **Grädden på moset (om tiden räcker)**
   > Gör akt 2 scroll-styrd med en klistrad karta som ändras mellan de tre scenerna (inga kamerafärder), och lägg in illustrationen som hero på `/foretag`. På `/` visas kartan direkt. Respektera `prefers-reduced-motion`.
