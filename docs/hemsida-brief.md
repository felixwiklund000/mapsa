# Mapsa – brief för nya hemsidan

Lägg filen i repot som `docs/hemsida-brief.md`. Claude Code ska läsa den innan varje steg.

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
| `/` | Kunder | Kartan. Sök, se priser, boka. |
| `/foretag` | Företagare | Berättelsen + anmälan i ett flöde |
| `/foretag/tack` | Företagare | Bekräftelse och vad som händer nu |
| `/utovare/[slug]` | Kunder | Profil (finns redan) |
| `/integritet` | Alla | Integritetspolicy (krävs eftersom vi samlar in uppgifter) |
| `/?visning=1` | Julmarknaden | Visningsläge för skärmen i montern |

Ta bort: nuvarande flikar (Kartan/Profilen/Statistik/Bokning), statistikraden (6 kategorier / 5 kommuner…), fyra prisnivåer, mockup-kortet i heron.

---

## 4. `/` – kundsidan

Inga marknadsföringssektioner. Bara produkten.

- **Första besöket:** helskärm med illustrationen av skärgården. Mitt i bilden: sökrutan *"Vad letar du efter?"* och knappar under: Frisör · Massage · PT · Naprapat · Skönhet.
- **När man söker eller trycker på en knapp:** illustrationen tonar bort och kameran flyger ner i den riktiga 3D-kartan (pitch ~60°). Prislapparna poppar upp en i taget.
- **Tryck på en prislapp:** ett litet kort dyker upp ovanför bottenpanelen med bild, namn, pris och **Boka**. Kameran flyger in mot platsen.
- **Bottenpanelen:** ska aldrig täcka prislapparna. Använd `fitBounds` med `padding.bottom` = panelens höjd.
- **Meny:** en liten länk "För företag".
- Återkommande besökare (localStorage, inom try/catch) hoppar över illustrationen och landar direkt i kartan.

---

## 5. `/foretag` – berättelsen i tre akter

### Akt 1 – Kroken (en skärm)

> **Din nästa kund letar efter dig just nu.**
> Mapsa visar alla utövare i Blekinge på en karta, med priset, så kunden ser direkt vad det kostar och bokar hos dig.
>
> [ Lägg upp ditt företag ]  ·  *Gratis att komma igång*

- Bakgrund: illustrationen (samma värld som på `/`).
- Under knappen, i liten text: "Ett UF-företag från Karlskrona".

### Akt 2 – Berättelsen från kundens håll (scroll-styrd, 3 scener)

Sektionen är klistrad (sticky), och kartan i bakgrunden ändras när man scrollar. En kort mening per scen.

1. **"Hon söker 'frisör' i Karlskrona."** Sökrutan skrivs i automatiskt.
2. **"Hon ser alla frisörer, med priserna."** Kameran flyger ner, prislapparna poppar upp.
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
| 2 | Adress (med förslag) | Kartan flyger dit, prislappen landar |
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

- `/?visning=1`: helskärm, inga menyer. Efter 20 sekunder utan att någon rör skärmen flyger kameran runt Karlskrona i en loop och visar prislappar. Vid beröring: vanlig karta.
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
   > Enligt avsnitt 4, 7 och 9 i briefen: laddskärm i stället för grå karta, `fitBounds` med padding så att bottenpanelen inte täcker prislapparna, orange prislappar, kortet som dyker upp vid tryck på en prislapp, och fallback i stället för grå bildrutor.

4. **Ny struktur för /foretag**
   > Bygg om /foretag enligt avsnitt 5: akt 1, akt 2 som tre stilla scener (ingen scroll-animation än), akt 3 (redan klar), och förtroendesektionerna. Ta bort det som står under "Ta bort" i avsnitt 3.

5. **Julmarknaden**
   > Bygg visningsläget och `?ref=`-spårningen enligt avsnitt 8.

6. **Grädden på moset (om tiden räcker)**
   > Gör akt 2 scroll-styrd med en klistrad karta som ändras mellan de tre scenerna, och lägg in illustrationen som hero på `/` och `/foretag`. Respektera `prefers-reduced-motion`.
