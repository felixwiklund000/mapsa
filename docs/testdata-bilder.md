# Foton till testprofilerna

Unsplash går inte att nå från byggmiljön, så fotona behöver laddas ner för hand.
Alla foton från unsplash.com får användas gratis (Unsplash-licensen).

## Så gör du

1. Ladda ner ett foto per rad nedan från unsplash.com (knappen **Download free**).
2. Spara det i mappen `bilder-original/` i projektet och döp om filen till exakt namnet i
   kolumnen **Filnamn** (filändelsen får vara .jpg, .png eller .webp).
3. Kör `npm run photos`. Skriptet beskär alla till samma format (4:3, 1200×900) och sparar
   dem som `public/testdata/<slug>.jpg`.
4. Committa mappen `public/testdata/` (inte `bilder-original/`).

Databasen pekar redan på `/testdata/<slug>.jpg` (kör `npm run db:seed` eller
`supabase/setup.sql` igen om databasen skapades före den här ändringen).
Saknas en fil visas en tom grå yta.

## Vilka foton

Välj liggande foton utan text eller loggor, helst ljusa och lugna. Inga ansikten i närbild.

| Profil | Kategori | Filnamn | Sök på Unsplash |
| --- | --- | --- | --- |
| Lugna Handen Massage | Massage | `lugna-handen-massage.jpg` | [massage therapy](https://unsplash.com/s/photos/massage-therapy) |
| Kraftverket PT | PT / Träning | `kraftverket-pt.jpg` | [gym dumbbells](https://unsplash.com/s/photos/gym-dumbbells) |
| Saxen & Spegeln | Frisör | `saxen-och-spegeln.jpg` | [hair salon](https://unsplash.com/s/photos/hair-salon) |
| Ryggraden Kiropraktik | Kiropraktor | `ryggraden-kiropraktik.jpg` | [chiropractor](https://unsplash.com/s/photos/chiropractor) |
| Rörelsekliniken Naprapat | Naprapat | `rorelsekliniken-naprapat.jpg` | [physiotherapy](https://unsplash.com/s/photos/physiotherapy) |
| Hudateljén Glöd | Skönhet / Hud | `hudateljen-glod.jpg` | [facial treatment](https://unsplash.com/s/photos/facial-treatment) |
| Jämjö Sportmassage | Massage | `jamjo-sportmassage.jpg` | [sports massage](https://unsplash.com/s/photos/sports-massage) |
| Gullberna Frisyr | Frisör | `gullberna-frisyr.jpg` | [barber shop](https://unsplash.com/s/photos/barber-shop) |

Gullberna Frisyr väntar på granskning och syns inte publikt, men får gärna ett foto ändå.
