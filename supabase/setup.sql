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

ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

BEGIN;

DELETE FROM practitioners WHERE is_test_data = true;
DELETE FROM practitioners WHERE slug IN ('naprapat-orjan-bergstrom', 'access-rehab-karlskrona', 'ferdoss-salong', 'grease-and-peace-barbershop', 'cxi-barbershop', 'grand-gym-karlskrona', 'first-skin-company-karlskrona');

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
  ('access-rehab-karlskrona', 'Access Rehab Karlskrona', 'kiropraktor', 'Rosenholm', 'Arenavägen 3',
   56.1992, 15.5872, NULL, 'Klinik i testlabbet på Rosenholm med kiropraktorer och naprapat. Erbjuder även massage och personlig träning.', 'https://accessrehab.se',
   '', NULL, 'grundlistning', 'publicerad', false);

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

INSERT INTO practitioners
  (slug, name, category, area, address, lat, lng, opening_hours, description, booking_url,
   email, phone, level, status, is_test_data)
VALUES
  ('grand-gym-karlskrona', 'Grand Gym', 'pt', 'Trossö', 'Ronnebygatan 19',
   56.1629, 15.5866, 'Bemannat mån–fre 8–20', 'Gym och squash mitt på Trossö. Instruktioner, träningsprogram och personlig träning.', 'https://grandgym.se',
   '', '0708-13 44 20', 'grundlistning', 'publicerad', false);

INSERT INTO practitioners
  (slug, name, category, area, address, lat, lng, opening_hours, description, booking_url,
   email, phone, level, status, is_test_data)
VALUES
  ('first-skin-company-karlskrona', 'First Skin Company', 'skonhet', 'Trossö', 'Ronnebygatan 9 B',
   56.1625, 15.5834, NULL, 'Hudvårdsklinik med auktoriserade hudterapeuter på Ronnebygatan.', 'https://www.skincompany.se',
   'info@skincompany.se', NULL, 'grundlistning', 'publicerad', false);

COMMIT;
