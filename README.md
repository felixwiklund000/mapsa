# Mapsa

Hitta och jämför lokala utövare i Karlskrona: massage, PT, frisör,
kiropraktor, naprapat och skönhet. Mapsa är inte ett bokningssystem – varje
profil länkar vidare till utövarens egen bokning.

Byggt med Next.js, Tailwind, Postgres (Supabase) och Leaflet + OpenStreetMap.

## Kom igång lokalt

Kräver Node.js 22.18 eller senare (`node -v`).

```bash
npm install
cp .env.example .env.local   # fyll i DATABASE_URL från Supabase
npm run db:seed              # skapar tabeller + företagen i scripts/real-data.ts
npm run dev                  # http://localhost:3000
```

| Kommando | Vad det gör |
| --- | --- |
| `npm run db:seed` | Skapar tabellerna (om de saknas) och lägger in företagen i `scripts/real-data.ts`. Går att köra flera gånger. |
| `npm run db:export-sql` | Skriver om `supabase/setup.sql` från företagen i `scripts/real-data.ts`. |
| `npm run icons` | Ritar om app-ikonerna från loggan. |

All databaskod finns i `src/lib/db/`. Designsystemet finns i `src/app/design-system.css`.

## Publicera (Supabase + Vercel)

### 1. Skapa databasen i Supabase

1. Gå till [supabase.com](https://supabase.com) och logga in (t.ex. med GitHub).
2. Klicka **New project**.
3. Fyll i **Name**: `mapsa`. Vid **Database Password**: klicka **Generate a password**
   och spara lösenordet (t.ex. i en lösenordshanterare) – du behöver det strax.
   Välj ett lösenord med bara bokstäver och siffror, då slipper du krångel med
   specialtecken i adressen.
4. **Region**: välj en i Europa, helst **Stockholm** om den finns, annars **Frankfurt**.
5. Klicka **Create new project** och vänta en–två minuter.

### 2. Lägg in tabellerna och företagen

1. Öppna filen `supabase/setup.sql` här på GitHub, klicka **Raw** och kopiera allt.
2. I Supabase: klicka **SQL Editor** i vänstermenyn och öppna en ny fråga.
3. Klistra in och klicka **Run**. Om Supabase varnar för en "destructive operation"
   (raden som tar bort gammal testdata): bekräfta.
4. Kontrollera under **Table Editor** att tabellen `practitioners` har 8 rader.

### 3. Hämta anslutningssträngen

1. Klicka **Connect** högst upp i Supabase-projektet.
2. Under **Connection String**: välj **Transaction pooler** (port 6543) och typ **URI**.
3. Kopiera adressen och byt ut `[YOUR-PASSWORD]` mot lösenordet från steg 1.
   Det här är din `DATABASE_URL`. Dela den aldrig och lägg den aldrig i koden.

### 4. Publicera på Vercel

1. Gå till [vercel.com](https://vercel.com) och logga in med GitHub.
2. Klicka **Add New…** → **Project**.
3. Under **Import Git Repository**: välj `mapsa`. Syns det inte, klicka
   **Configure GitHub App** / **Adjust GitHub App Permissions** och ge Vercel
   tillgång till repot.
4. Klicka **Import**. Framework ska stå som **Next.js** automatiskt.
5. Fäll ut **Environment Variables**: skriv `DATABASE_URL` som **Key** och klistra
   in anslutningssträngen som **Value**. Klicka **Add**.
6. Klicka **Deploy**. Efter ett par minuter får du en adress som
   `mapsa-xxxx.vercel.app` – det är din riktiga länk.

Rekommenderat: under projektets **Settings → Functions**, sätt **Function Region**
till Stockholm (`arn1`) eller Frankfurt (`fra1`), samma område som databasen.
Annars går varje sidvisning via USA och blir långsammare. Gör om **Redeploy**
efteråt.

Vercel bygger om sidan automatiskt varje gång något pushas till GitHub.

### 5. Lägg Mapsa på hemskärmen

- **iPhone (Safari):** öppna länken → dela-knappen → **Lägg till på hemskärmen**.
- **Android (Chrome):** öppna länken → menyn ⋮ → **Installera app** (eller
  **Lägg till på startskärmen**).

Mapsa öppnas då i helskärm utan adressfält, med egen ikon.

### Köra seed från datorn i stället (valfritt)

Lägg `DATABASE_URL` i `.env.local` och kör `npm run db:seed`. Det gör samma sak
som SQL-filen i steg 2.
