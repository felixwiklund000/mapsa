// Databasfrågor för utövare. Appen hämtar data härifrån och skriver aldrig
// SQL direkt i sidor eller komponenter.

import { getDb } from "./client.ts";
import type { CategorySlug } from "../categories.ts";

export type Level = "grundlistning" | "bas" | "mellan" | "vip";
export type Status = "vantar_granskning" | "publicerad" | "inaktiv";

export type Service = {
  id: number;
  name: string;
  priceSek: number;
  durationMin: number | null;
};

export type PractitionerImage = {
  id: number;
  path: string;
};

export type Practitioner = {
  id: number;
  slug: string;
  name: string;
  category: CategorySlug;
  area: string;
  address: string | null;
  lat: number;
  lng: number;
  openingHours: string | null;
  description: string | null;
  bookingUrl: string;
  email: string;
  phone: string | null;
  campaign: string | null;
  videoUrl: string | null;
  level: Level;
  status: Status;
  registeredAt: string;
  bookingClicks: number;
  isTestData: boolean;
  services: Service[];
  images: PractitionerImage[];
};

type PractitionerRow = {
  id: number;
  slug: string;
  name: string;
  category: CategorySlug;
  area: string;
  address: string | null;
  lat: number;
  lng: number;
  opening_hours: string | null;
  description: string | null;
  booking_url: string;
  email: string;
  phone: string | null;
  campaign: string | null;
  video_url: string | null;
  level: Level;
  status: Status;
  registered_at: string;
  booking_clicks: number;
  is_test_data: number;
};

type ServiceRow = {
  id: number;
  practitioner_id: number;
  name: string;
  price_sek: number;
  duration_min: number | null;
};

type ImageRow = {
  id: number;
  practitioner_id: number;
  path: string;
};

function groupBy<T extends { practitioner_id: number }, U>(
  rows: T[],
  map: (row: T) => U,
): Map<number, U[]> {
  const result = new Map<number, U[]>();
  for (const row of rows) {
    const list = result.get(row.practitioner_id) ?? [];
    list.push(map(row));
    result.set(row.practitioner_id, list);
  }
  return result;
}

/** Hämtar tjänster och bilder för en uppsättning utövarrader och sätter ihop allt. */
function withRelations(rows: PractitionerRow[]): Practitioner[] {
  if (rows.length === 0) return [];
  const db = getDb();
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map(() => "?").join(",");

  const services = groupBy(
    db
      .prepare(
        `SELECT id, practitioner_id, name, price_sek, duration_min FROM services
         WHERE practitioner_id IN (${placeholders}) ORDER BY sort_order, id`,
      )
      .all(...ids) as unknown as ServiceRow[],
    (s): Service => ({ id: s.id, name: s.name, priceSek: s.price_sek, durationMin: s.duration_min }),
  );

  const images = groupBy(
    db
      .prepare(
        `SELECT id, practitioner_id, path FROM images
         WHERE practitioner_id IN (${placeholders}) ORDER BY sort_order, id`,
      )
      .all(...ids) as unknown as ImageRow[],
    (i): PractitionerImage => ({ id: i.id, path: i.path }),
  );

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    area: row.area,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    openingHours: row.opening_hours,
    description: row.description,
    bookingUrl: row.booking_url,
    email: row.email,
    phone: row.phone,
    campaign: row.campaign,
    videoUrl: row.video_url,
    level: row.level,
    status: row.status,
    registeredAt: row.registered_at,
    bookingClicks: row.booking_clicks,
    isTestData: row.is_test_data === 1,
    services: services.get(row.id) ?? [],
    images: images.get(row.id) ?? [],
  }));
}

/** Alla publicerade utövare. Mellan och VIP först (topplacering), sedan i namnordning. */
export function listPublishedPractitioners(): Practitioner[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM practitioners
       WHERE status = 'publicerad'
       ORDER BY CASE WHEN level IN ('mellan', 'vip') THEN 0 ELSE 1 END, name COLLATE NOCASE`,
    )
    .all() as unknown as PractitionerRow[];
  return withRelations(rows);
}

/** En publicerad utövare, eller undefined om den inte finns eller inte är publicerad. */
export function getPublishedPractitionerBySlug(slug: string): Practitioner | undefined {
  const row = getDb()
    .prepare(`SELECT * FROM practitioners WHERE slug = ? AND status = 'publicerad'`)
    .get(slug) as unknown as PractitionerRow | undefined;
  return row ? withRelations([row])[0] : undefined;
}

/** Räknar upp klick till bokning. Returnerar true om en publicerad utövare uppdaterades. */
export function incrementBookingClicks(slug: string): boolean {
  const result = getDb()
    .prepare(
      `UPDATE practitioners SET booking_clicks = booking_clicks + 1
       WHERE slug = ? AND status = 'publicerad'`,
    )
    .run(slug);
  return result.changes > 0;
}
