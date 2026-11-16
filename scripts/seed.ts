// Skapar tabellerna och lägger in testprofilerna i databasen som
// DATABASE_URL pekar på. Kör med: npm run db:seed
//
// DATABASE_URL läses från .env.local om filen finns, annars från miljön.

import { existsSync } from "node:fs";
import { buildSeedSql, PROFILE_COUNT } from "./seed-sql.ts";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const { getSql } = await import("../src/lib/db/client.ts");
const sql = getSql();

try {
  // Flera satser i en sträng skickas med det "enkla" protokollet.
  await sql.unsafe(buildSeedSql());
  const [{ count }] = await sql<{ count: string }[]>`
    SELECT count(*) FROM practitioners WHERE is_test_data = true`;
  console.log(`Klart: tabellerna finns och ${count} av ${PROFILE_COUNT} testprofiler är inlagda.`);
} catch (err) {
  console.error("Seed misslyckades:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
