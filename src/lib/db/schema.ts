// Databasschema för Mapsa (SQLite).
// All SQL som beskriver tabellerna finns här, så att det är lätt att se
// helheten och byta databas senare.

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS practitioners (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT    NOT NULL UNIQUE,          -- används i URL:en, t.ex. /utovare/lugna-handen-massage
  name             TEXT    NOT NULL,                 -- namn/företagsnamn
  category         TEXT    NOT NULL CHECK (category IN
                     ('massage','pt','frisor','kiropraktor','naprapat','skonhet')),
  area             TEXT    NOT NULL,                 -- stad/område, t.ex. "Trossö"
  address          TEXT,                             -- valfri, kan fyllas i av admin
  lat              REAL    NOT NULL,                 -- sätts från områdesuppslag, admin kan justera
  lng              REAL    NOT NULL,
  opening_hours    TEXT,
  description      TEXT,
  booking_url      TEXT    NOT NULL,                 -- absolut URL eller intern sökväg som börjar med /
  email            TEXT    NOT NULL,
  phone            TEXT,
  campaign         TEXT,                             -- kampanjfält (Bas och uppåt)
  video_url        TEXT,                             -- videofält (VIP)
  level            TEXT    NOT NULL DEFAULT 'grundlistning' CHECK (level IN
                     ('grundlistning','bas','mellan','vip')),
  status           TEXT    NOT NULL DEFAULT 'vantar_granskning' CHECK (status IN
                     ('vantar_granskning','publicerad','inaktiv')),
  registered_at    TEXT    NOT NULL DEFAULT (datetime('now')),  -- anmäld datum (gratismånaden räknas härifrån)
  consent_at       TEXT,                             -- när kryssrutan för samtycke godkändes
  booking_clicks   INTEGER NOT NULL DEFAULT 0,       -- klick till bokning
  is_test_data     INTEGER NOT NULL DEFAULT 0 CHECK (is_test_data IN (0,1)),
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_practitioners_status_category
  ON practitioners (status, category);

CREATE TABLE IF NOT EXISTS services (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  practitioner_id  INTEGER NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  name             TEXT    NOT NULL,
  price_sek        INTEGER NOT NULL CHECK (price_sek >= 0),
  duration_min     INTEGER CHECK (duration_min IS NULL OR duration_min > 0),
  sort_order       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_services_practitioner ON services (practitioner_id);

CREATE TABLE IF NOT EXISTS images (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  practitioner_id  INTEGER NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  path             TEXT    NOT NULL,                 -- filväg till uppladdad bild
  sort_order       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_images_practitioner ON images (practitioner_id);
`;
