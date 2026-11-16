// Öppnar SQLite-databasen (Nodes inbyggda node:sqlite) och skapar tabellerna
// om de inte finns. Resten av appen ska bara prata med databasen via
// filerna i den här mappen.

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { SCHEMA_SQL } from "./schema";

const DB_PATH = resolve(process.env.DATABASE_PATH ?? "data/mapsa.db");

let db: DatabaseSync | undefined;

export function getDb(): DatabaseSync {
  if (!db) {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    db = new DatabaseSync(DB_PATH);
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec(SCHEMA_SQL);
  }
  return db;
}
