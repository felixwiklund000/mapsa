// Bygger SQL som skapar tabellerna och lägger in de riktiga företagen från
// real-data.ts. Används av både seed.ts (kör mot databasen) och
// export-seed-sql.ts (skriver supabase/setup.sql).
//
// - Tar bort gamla påhittade testprofiler (is_test_data = true).
// - Lägger in företagen i real-data.ts. Finns ett företag redan (samma slug)
//   ersätts det. Inlagda företag (utan egen anmälan) som inte längre finns i
//   filen tas bort – filen är alltid facit.
// - Rör aldrig utövare som anmält sig själva.
//
// Värdena kommer bara från real-data.ts, aldrig från användare.

import { SCHEMA_SQL } from "../src/lib/db/schema.ts";
import { REAL_PLACES } from "./real-data.ts";

function lit(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Ogiltigt tal: ${value}`);
    return String(value);
  }
  return `'${value.replace(/'/g, "''")}'`;
}

export function buildSeedSql(): string {
  const statements: string[] = [];

  for (const p of REAL_PLACES) {
    statements.push(`INSERT INTO practitioners
  (slug, name, category, area, address, lat, lng, opening_hours, description, booking_url,
   email, phone, level, status, is_test_data)
VALUES
  (${lit(p.slug)}, ${lit(p.name)}, ${lit(p.category)}, ${lit(p.area)}, ${lit(p.address)},
   ${lit(p.lat)}, ${lit(p.lng)}, ${lit(p.openingHours)}, ${lit(p.description)}, ${lit(p.bookingUrl)},
   ${lit(p.email ?? "")}, ${lit(p.phone)}, 'grundlistning', 'publicerad', false);`);

    if (p.services.length > 0) {
      const rows = p.services
        .map((s, i) => `(${lit(s.name)}, ${lit(s.price)}, ${lit(s.minutes)}::integer, ${i})`)
        .join(",\n  ");
      statements.push(`INSERT INTO services (practitioner_id, name, price_sek, duration_min, sort_order)
SELECT p.id, v.name, v.price_sek, v.duration_min, v.sort_order
FROM practitioners p,
(VALUES
  ${rows}
) AS v(name, price_sek, duration_min, sort_order)
WHERE p.slug = ${lit(p.slug)};`);
    }
  }

  const slugs = REAL_PLACES.map((p) => lit(p.slug)).join(", ");

  return `-- Mapsa: skapar tabellerna (om de saknas) och lägger in riktiga företag i Karlskrona
-- (scripts/real-data.ts). Går att köra flera gånger. Tar bort gamla påhittade
-- testprofiler. Utövare som anmält sig själva rörs aldrig.

${SCHEMA_SQL.trim()}

BEGIN;

DELETE FROM practitioners WHERE is_test_data = true;
-- Företag som lagts in utan egen anmälan (consent_at tomt) och som inte
-- längre finns i real-data.ts tas bort. Ersätt sedan de som finns.
DELETE FROM practitioners WHERE consent_at IS NULL AND is_test_data = false AND slug NOT IN (${slugs});
DELETE FROM practitioners WHERE slug IN (${slugs});

${statements.join("\n\n")}

COMMIT;
`;
}

export const PROFILE_COUNT = REAL_PLACES.length;
