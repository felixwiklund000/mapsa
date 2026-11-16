-- Mapsa: skapar tabellerna (om de saknas) och lägger in påhittade testprofiler.
-- Går att köra flera gånger: gammal testdata tas bort först, riktiga
-- utövare (is_test_data = false) rörs aldrig.

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

INSERT INTO practitioners
  (slug, name, category, area, lat, lng, opening_hours, description, booking_url,
   email, campaign, level, status, registered_at, consent_at, is_test_data)
VALUES
  ('lugna-handen-massage', 'Lugna Handen Massage', 'massage', 'Trossö',
   56.162, 15.5857,
   'Mån–fre 9–18, lör 10–14', 'Klassisk massage och djupvävnadsmassage i en lugn lokal mitt på Trossö. Bra om du sitter mycket vid skrivbordet.', '/testdata',
   'lugna-handen-massage@example.com', NULL, 'mellan', 'publicerad',
   now() - interval '40 days', now() - interval '40 days', true);

INSERT INTO services (practitioner_id, name, price_sek, duration_min, sort_order)
SELECT p.id, v.name, v.price_sek, v.duration_min, v.sort_order
FROM practitioners p,
(VALUES
  ('Klassisk massage', 595, 50, 0),
  ('Djupvävnadsmassage', 695, 50, 1),
  ('Rygg- och nackmassage', 395, 25, 2)
) AS v(name, price_sek, duration_min, sort_order)
WHERE p.slug = 'lugna-handen-massage';

INSERT INTO practitioners
  (slug, name, category, area, lat, lng, opening_hours, description, booking_url,
   email, campaign, level, status, registered_at, consent_at, is_test_data)
VALUES
  ('kraftverket-pt', 'Kraftverket PT', 'pt', 'Kungsmarken',
   56.1852, 15.6264,
   'Mån–sön 6–21', 'Personlig träning för dig som vill komma igång eller bli starkare. Upplägg efter din nivå, inga måsten.', '/testdata',
   'kraftverket-pt@example.com', NULL, 'grundlistning', 'publicerad',
   now() - interval '12 days', now() - interval '12 days', true);

INSERT INTO services (practitioner_id, name, price_sek, duration_min, sort_order)
SELECT p.id, v.name, v.price_sek, v.duration_min, v.sort_order
FROM practitioners p,
(VALUES
  ('PT-pass', 650, 60, 0),
  ('Kostgenomgång', 450, 45, 1),
  ('Klippkort 10 pass', 5500, NULL, 2)
) AS v(name, price_sek, duration_min, sort_order)
WHERE p.slug = 'kraftverket-pt';

INSERT INTO practitioners
  (slug, name, category, area, lat, lng, opening_hours, description, booking_url,
   email, campaign, level, status, registered_at, consent_at, is_test_data)
VALUES
  ('saxen-och-spegeln', 'Saxen & Spegeln', 'frisor', 'Pottholmen',
   56.1668, 15.5802,
   'Tis–fre 10–18, lör 9–15', 'Liten frisörsalong med fokus på klippning och färg. Drop-in när det finns lediga tider.', '/testdata',
   'saxen-och-spegeln@example.com', '20 % på färg för nya kunder hela december.', 'bas', 'publicerad',
   now() - interval '25 days', now() - interval '25 days', true);

INSERT INTO services (practitioner_id, name, price_sek, duration_min, sort_order)
SELECT p.id, v.name, v.price_sek, v.duration_min, v.sort_order
FROM practitioners p,
(VALUES
  ('Klippning kort hår', 450, 30, 0),
  ('Klippning långt hår', 595, 45, 1),
  ('Färg och klipp', 1450, 120, 2),
  ('Barnklippning (under 12)', 295, 30, 3)
) AS v(name, price_sek, duration_min, sort_order)
WHERE p.slug = 'saxen-och-spegeln';

INSERT INTO practitioners
  (slug, name, category, area, lat, lng, opening_hours, description, booking_url,
   email, campaign, level, status, registered_at, consent_at, is_test_data)
VALUES
  ('ryggraden-kiropraktik', 'Ryggraden Kiropraktik', 'kiropraktor', 'Lyckeby',
   56.198499999999996, 15.6473,
   'Mån–tor 8–17, fre 8–13', 'Legitimerad kiropraktor som behandlar rygg, nacke och huvudvärk. Första besöket innehåller en grundlig undersökning.', '/testdata',
   'ryggraden-kiropraktik@example.com', NULL, 'vip', 'publicerad',
   now() - interval '60 days', now() - interval '60 days', true);

INSERT INTO services (practitioner_id, name, price_sek, duration_min, sort_order)
SELECT p.id, v.name, v.price_sek, v.duration_min, v.sort_order
FROM practitioners p,
(VALUES
  ('Nybesök inkl. undersökning', 795, 45, 0),
  ('Återbesök', 595, 30, 1)
) AS v(name, price_sek, duration_min, sort_order)
WHERE p.slug = 'ryggraden-kiropraktik';

INSERT INTO practitioners
  (slug, name, category, area, lat, lng, opening_hours, description, booking_url,
   email, campaign, level, status, registered_at, consent_at, is_test_data)
VALUES
  ('rorelsekliniken-naprapat', 'Rörelsekliniken Naprapat', 'naprapat', 'Bergåsa',
   56.1792, 15.593900000000001,
   'Mån–fre 8–19', 'Naprapati för besvär i muskler och leder, med övningar du kan göra hemma mellan besöken.', '/testdata',
   'rorelsekliniken-naprapat@example.com', NULL, 'grundlistning', 'publicerad',
   now() - interval '5 days', now() - interval '5 days', true);

INSERT INTO services (practitioner_id, name, price_sek, duration_min, sort_order)
SELECT p.id, v.name, v.price_sek, v.duration_min, v.sort_order
FROM practitioners p,
(VALUES
  ('Nybesök', 750, 60, 0),
  ('Återbesök', 650, 45, 1)
) AS v(name, price_sek, duration_min, sort_order)
WHERE p.slug = 'rorelsekliniken-naprapat';

INSERT INTO practitioners
  (slug, name, category, area, lat, lng, opening_hours, description, booking_url,
   email, campaign, level, status, registered_at, consent_at, is_test_data)
VALUES
  ('hudateljen-glod', 'Hudateljén Glöd', 'skonhet', 'Rosenholm',
   56.198100000000004, 15.5858,
   'Ons–lör 10–18', 'Ansiktsbehandlingar och fransar. Vi hjälper dig hitta en hudrutin som funkar i vardagen.', '/testdata',
   'hudateljen-glod@example.com', NULL, 'bas', 'publicerad',
   now() - interval '33 days', now() - interval '33 days', true);

INSERT INTO services (practitioner_id, name, price_sek, duration_min, sort_order)
SELECT p.id, v.name, v.price_sek, v.duration_min, v.sort_order
FROM practitioners p,
(VALUES
  ('Klassisk ansiktsbehandling', 795, 60, 0),
  ('Fransförlängning, nytt set', 990, 90, 1),
  ('Bryn- och fransfärgning', 350, 30, 2)
) AS v(name, price_sek, duration_min, sort_order)
WHERE p.slug = 'hudateljen-glod';

INSERT INTO practitioners
  (slug, name, category, area, lat, lng, opening_hours, description, booking_url,
   email, campaign, level, status, registered_at, consent_at, is_test_data)
VALUES
  ('jamjo-sportmassage', 'Jämjö Sportmassage', 'massage', 'Jämjö',
   56.191100000000006, 15.8395,
   'Kvällar och helger efter bokning', 'Sportmassage för dig som tränar mycket. Kort väg från E22.', '/testdata',
   'jamjo-sportmassage@example.com', NULL, 'grundlistning', 'publicerad',
   now() - interval '18 days', now() - interval '18 days', true);

INSERT INTO services (practitioner_id, name, price_sek, duration_min, sort_order)
SELECT p.id, v.name, v.price_sek, v.duration_min, v.sort_order
FROM practitioners p,
(VALUES
  ('Sportmassage', 550, 45, 0),
  ('Sportmassage', 350, 25, 1)
) AS v(name, price_sek, duration_min, sort_order)
WHERE p.slug = 'jamjo-sportmassage';

INSERT INTO practitioners
  (slug, name, category, area, lat, lng, opening_hours, description, booking_url,
   email, campaign, level, status, registered_at, consent_at, is_test_data)
VALUES
  ('gullberna-frisyr', 'Gullberna Frisyr', 'frisor', 'Gullberna',
   56.195899999999995, 15.606599999999998,
   'Mån–fre 9–17', 'Herrfrisör med skäggtrimning. (Den här profilen väntar på granskning och ska inte synas publikt.)', '/testdata',
   'gullberna-frisyr@example.com', NULL, 'grundlistning', 'vantar_granskning',
   now() - interval '1 days', now() - interval '1 days', true);

INSERT INTO services (practitioner_id, name, price_sek, duration_min, sort_order)
SELECT p.id, v.name, v.price_sek, v.duration_min, v.sort_order
FROM practitioners p,
(VALUES
  ('Herrklippning', 395, 30, 0),
  ('Skäggtrimning', 195, 15, 1)
) AS v(name, price_sek, duration_min, sort_order)
WHERE p.slug = 'gullberna-frisyr';

COMMIT;
