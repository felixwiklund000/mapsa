// Anslutning till Postgres (Supabase). Adressen läses från miljövariabeln
// DATABASE_URL. Resten av appen ska bara prata med databasen via filerna i
// den här mappen.
//
// Supabase: använd anslutningssträngen för "Transaction pooler" (port 6543).
// Den poolern stöder inte förberedda frågor, därför `prepare: false`.

import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

// Sparas på globalThis så att utvecklingsservern inte öppnar nya
// anslutningar varje gång en fil laddas om.
const globalForDb = globalThis as unknown as { mapsaSql?: Sql };

export function getSql(): Sql {
  if (globalForDb.mapsaSql) return globalForDb.mapsaSql;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL saknas. Lägg in anslutningssträngen från Supabase i .env.local (lokalt) eller som miljövariabel i Vercel.",
    );
  }

  const host = new URL(url).hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";

  globalForDb.mapsaSql = postgres(url, {
    prepare: false,
    ssl: isLocal ? false : "require",
    max: 5,
    idle_timeout: 20,
    connect_timeout: 15,
    onnotice: () => {}, // t.ex. "tabellen finns redan" – inget att visa
  });
  return globalForDb.mapsaSql;
}
