-- Mapsa: skapar tabellerna (om de saknas) och lägger in riktiga företag i Karlskrona
-- (scripts/real-data.ts). Går att köra flera gånger. Tar bort gamla påhittade
-- testprofiler. Utövare som anmält sig själva rörs aldrig.

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

-- Anmälningar från /foretag ("Lägg upp ditt företag"). Granskas av oss
-- innan något publiceras. Skrivs bara av servern (server action).
CREATE TABLE IF NOT EXISTS ansokningar (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  skapad           timestamptz NOT NULL DEFAULT now(),
  foretagsnamn     text        NOT NULL,
  kategori         text        NOT NULL CHECK (kategori IN
                     ('massage','pt','frisor','kiropraktor','naprapat','skonhet')),
  adress           text        NOT NULL,
  lat              double precision NOT NULL,
  lng              double precision NOT NULL,
  tjanst           text        NOT NULL,
  pris             integer     NOT NULL CHECK (pris >= 0),
  bokningslank     text        NOT NULL,
  kontaktnamn      text        NOT NULL,
  mejl             text        NOT NULL,
  telefon          text,
  kalla            text,                                 -- ?ref= (t.ex. 'julmarknad')
  status           text        NOT NULL DEFAULT 'ny' CHECK (status IN ('ny','godkand','nekad')),
  samtycke_at      timestamptz NOT NULL                  -- när kryssrutan godkändes
);

CREATE INDEX IF NOT EXISTS idx_ansokningar_status ON ansokningar (status, skapad DESC);

ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
-- RLS utan regler: Supabases publika API kan varken läsa eller skriva.
-- Servern skriver direkt via DATABASE_URL.
ALTER TABLE ansokningar ENABLE ROW LEVEL SECURITY;

BEGIN;

DELETE FROM practitioners WHERE is_test_data = true;
-- Företag som lagts in utan egen anmälan (consent_at tomt) och som inte
-- längre finns i real-data.ts tas bort. Ersätt sedan de som finns.
DELETE FROM practitioners WHERE consent_at IS NULL AND is_test_data = false AND slug NOT IN ('naprapat-orjan-bergstrom', 'ferdoss-salong', 'grease-and-peace-barbershop', 'cxi-barbershop');
DELETE FROM practitioners WHERE slug IN ('naprapat-orjan-bergstrom', 'ferdoss-salong', 'grease-and-peace-barbershop', 'cxi-barbershop');

INSERT INTO practitioners
  (slug, name, category, area, address, lat, lng, opening_hours, description, booking_url,
   email, phone, level, status, is_test_data)
VALUES
  ('naprapat-orjan-bergstrom', 'Naprapat Örjan Bergström', 'naprapat', 'Karlskrona', 'Valhallavägen 16',
   56.1745, 15.5905, 'Vardagar, stängt helger', 'Naprapat på Valhallavägen. Erbjuder naprapatbehandling och medicinsk massage.', 'https://www.bokadirekt.se/places/naprapat-orjan-bergstrom-45443',
   '', NULL, 'grundlistning', 'publicerad', false);

INSERT INTO services (practitioner_id, name, price_sek, duration_min, sort_order)
SELECT p.id, v.name, v.price_sek, v.duration_min, v.sort_order
FROM practitioners p,
(VALUES
  ('Naprapatbehandling', 800, 45::integer, 0),
  ('Medicinsk massage', 650, 45::integer, 1)
) AS v(name, price_sek, duration_min, sort_order)
WHERE p.slug = 'naprapat-orjan-bergstrom';

INSERT INTO practitioners
  (slug, name, category, area, address, lat, lng, opening_hours, description, booking_url,
   email, phone, level, status, is_test_data)
VALUES
  ('ferdoss-salong', 'Ferdoss salong', 'frisor', 'Trossö', 'Styrmansgatan 38',
   56.1617, 15.5893, NULL, 'Salong för hår och skönhet – klippning, färgning, hudvård och makeup.', 'https://www.bokadirekt.se/places/ferdoss-salong-132939',
   '', NULL, 'grundlistning', 'publicerad', false);

INSERT INTO services (practitioner_id, name, price_sek, duration_min, sort_order)
SELECT p.id, v.name, v.price_sek, v.duration_min, v.sort_order
FROM practitioners p,
(VALUES
  ('Klippning med fön', 400, NULL::integer, 0),
  ('Barnklippning', 250, NULL::integer, 1)
) AS v(name, price_sek, duration_min, sort_order)
WHERE p.slug = 'ferdoss-salong';

INSERT INTO practitioners
  (slug, name, category, area, address, lat, lng, opening_hours, description, booking_url,
   email, phone, level, status, is_test_data)
VALUES
  ('grease-and-peace-barbershop', 'Grease & Peace Barbershop', 'frisor', 'Trossö', 'Drottninggatan 10',
   56.1604, 15.5852, 'Tis–lör 10.30–18, lördagar endast drop-in', 'Barbershop på Drottninggatan med klippning och skäggvård.', 'https://www.bokadirekt.se/places/grease-peace-barbershop-35394',
   '', NULL, 'grundlistning', 'publicerad', false);

INSERT INTO services (practitioner_id, name, price_sek, duration_min, sort_order)
SELECT p.id, v.name, v.price_sek, v.duration_min, v.sort_order
FROM practitioners p,
(VALUES
  ('Klippning', 600, 45::integer, 0),
  ('Royal Treatment (klippning, skägg, tvätt, styling)', 950, 90::integer, 1)
) AS v(name, price_sek, duration_min, sort_order)
WHERE p.slug = 'grease-and-peace-barbershop';

INSERT INTO practitioners
  (slug, name, category, area, address, lat, lng, opening_hours, description, booking_url,
   email, phone, level, status, is_test_data)
VALUES
  ('cxi-barbershop', 'CXI Barbershop', 'frisor', 'Trossö', 'Ronnebygatan 19',
   56.1627, 15.5859, 'Mån–fre 10–18.30, lör 10–15', 'Barbershop med certifierade barberare. Boka via Bokadirekt eller kom in utan bokning (CutQ).', 'https://www.bokadirekt.se/places/cxi-barbershop-40863',
   '', NULL, 'grundlistning', 'publicerad', false);

INSERT INTO services (practitioner_id, name, price_sek, duration_min, sort_order)
SELECT p.id, v.name, v.price_sek, v.duration_min, v.sort_order
FROM practitioners p,
(VALUES
  ('Klippning', 300, 30::integer, 0),
  ('Hår och skägg', 500, 60::integer, 1),
  ('Barnklippning', 250, 30::integer, 2)
) AS v(name, price_sek, duration_min, sort_order)
WHERE p.slug = 'cxi-barbershop';

COMMIT;
