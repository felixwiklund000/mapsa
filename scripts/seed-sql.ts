// Bygger SQL som skapar tabellerna och lägger in testprofilerna.
// Används av både seed.ts (kör mot databasen) och export-seed-sql.ts
// (skriver supabase/setup.sql). Värdena kommer bara från vår egen
// testdata i seed-data.ts, aldrig från användare.

import { SCHEMA_SQL } from "../src/lib/db/schema.ts";
import { findArea } from "../src/lib/areas.ts";
import { PROFILES } from "./seed-data.ts";

const TEST_BOOKING_URL = "/testdata";

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

  for (const p of PROFILES) {
    const area = findArea(p.area);
    if (!area) throw new Error(`Okänt område: ${p.area}`);
    const registered = `now() - interval '${Math.trunc(p.registeredDaysAgo)} days'`;

    statements.push(`INSERT INTO practitioners
  (slug, name, category, area, lat, lng, opening_hours, description, booking_url,
   email, campaign, level, status, registered_at, consent_at, is_test_data)
VALUES
  (${lit(p.slug)}, ${lit(p.name)}, ${lit(p.category)}, ${lit(area.name)},
   ${lit(area.lat + p.offset[0])}, ${lit(area.lng + p.offset[1])},
   ${lit(p.openingHours)}, ${lit(p.description)}, ${lit(TEST_BOOKING_URL)},
   ${lit(`${p.slug}@example.com`)}, ${lit(p.campaign)}, ${lit(p.level)}, ${lit(p.status)},
   ${registered}, ${registered}, true);`);

    if (p.services.length > 0) {
      const rows = p.services
        .map((s, i) => `(${lit(s.name)}, ${lit(s.price)}, ${lit(s.minutes)}, ${i})`)
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

  return `-- Mapsa: skapar tabellerna (om de saknas) och lägger in påhittade testprofiler.
-- Går att köra flera gånger: gammal testdata tas bort först, riktiga
-- utövare (is_test_data = false) rörs aldrig.

${SCHEMA_SQL.trim()}

BEGIN;

DELETE FROM practitioners WHERE is_test_data = true;

${statements.join("\n\n")}

COMMIT;
`;
}

export const PROFILE_COUNT = PROFILES.length;
