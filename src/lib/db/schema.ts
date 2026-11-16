// Databasschema för Mapsa (Postgres / Supabase).
// All SQL som beskriver tabellerna finns här. Schemat körs av
// `npm run db:seed` och finns också i supabase/setup.sql för den som vill
// klistra in det i Supabase SQL Editor. Allt är skrivet så att det går att
// köra flera gånger utan att något förstörs.
//
// Säkerhet: appen pratar med databasen direkt via DATABASE_URL (servern),
// inte via Supabases publika API. Row Level Security slås därför på utan
// några regler, vilket stänger det publika API:t helt för tabellerna.

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS practitioners (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug             text        NOT NULL UNIQUE,          -- används i URL:en, t.ex. /utovare/lugna-handen-massage
  name             text        NOT NULL,                 -- namn/företagsnamn
  category         text        NOT NULL CHECK (category IN
                     ('massage','pt','frisor','kiropraktor','naprapat','skonhet')),
  area             text        NOT NULL,                 -- stad/område, t.ex. 'Trossö'
  address          text,                                 -- valfri, kan fyllas i av admin
  lat              double precision NOT NULL,            -- sätts från områdesuppslag, admin kan justera
  lng              double precision NOT NULL,
  opening_hours    text,
  description      text,
  booking_url      text        NOT NULL,                 -- absolut URL eller intern sökväg som börjar med /
  email            text        NOT NULL,
  phone            text,
  campaign         text,                                 -- kampanjfält (Bas och uppåt)
  video_url        text,                                 -- videofält (VIP)
  level            text        NOT NULL DEFAULT 'grundlistning' CHECK (level IN
                     ('grundlistning','bas','mellan','vip')),
  status           text        NOT NULL DEFAULT 'vantar_granskning' CHECK (status IN
                     ('vantar_granskning','publicerad','inaktiv')),
  registered_at    timestamptz NOT NULL DEFAULT now(),   -- anmäld datum (gratismånaden räknas härifrån)
  consent_at       timestamptz,                          -- när kryssrutan för samtycke godkändes
  booking_clicks   integer     NOT NULL DEFAULT 0,       -- klick till bokning
  is_test_data     boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_practitioners_status_category
  ON practitioners (status, category);

CREATE TABLE IF NOT EXISTS services (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  practitioner_id  integer NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  name             text    NOT NULL,
  price_sek        integer NOT NULL CHECK (price_sek >= 0),
  duration_min     integer CHECK (duration_min IS NULL OR duration_min > 0),
  sort_order       integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_services_practitioner ON services (practitioner_id);

CREATE TABLE IF NOT EXISTS images (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  practitioner_id  integer NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  path             text    NOT NULL,                     -- adress till uppladdad bild
  sort_order       integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_images_practitioner ON images (practitioner_id);

ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
`;
