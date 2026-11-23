// Skriver supabase/setup.sql: tabellerna + företagen i real-data.ts som en SQL-fil
// att klistra in i Supabase SQL Editor. Kör med: npm run db:export-sql

import { mkdirSync, writeFileSync } from "node:fs";
import { buildSeedSql } from "./seed-sql.ts";

mkdirSync("supabase", { recursive: true });
writeFileSync("supabase/setup.sql", buildSeedSql());
console.log("Skrev supabase/setup.sql");
