// Databasfrågor för utövare. Appen hämtar data härifrån och skriver aldrig
// SQL direkt i sidor eller komponenter.

import { getSql } from "./client.ts";
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
  registered_at: Date;
  booking_clicks: number;
  is_test_data: boolean;
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
async function withRelations(rows: PractitionerRow[]): Promise<Practitioner[]> {
  if (rows.length === 0) return [];
  const sql = getSql();
  const ids = rows.map((r) => r.id);

  const [serviceRows, imageRows] = await Promise.all([
    sql<ServiceRow[]>`
      SELECT id, practitioner_id, name, price_sek, duration_min FROM services
      WHERE practitioner_id IN ${sql(ids)} ORDER BY sort_order, id`,
    sql<ImageRow[]>`
      SELECT id, practitioner_id, path FROM images
      WHERE practitioner_id IN ${sql(ids)} ORDER BY sort_order, id`,
  ]);

  const services = groupBy(
    serviceRows,
    (s): Service => ({ id: s.id, name: s.name, priceSek: s.price_sek, durationMin: s.duration_min }),
  );
  const images = groupBy(imageRows, (i): PractitionerImage => ({ id: i.id, path: i.path }));

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
    registeredAt: row.registered_at.toISOString(),
    bookingClicks: row.booking_clicks,
    isTestData: row.is_test_data,
    services: services.get(row.id) ?? [],
    images: images.get(row.id) ?? [],
  }));
}

/** Alla publicerade utövare. Mellan och VIP först (topplacering), sedan i namnordning. */
export async function listPublishedPractitioners(): Promise<Practitioner[]> {
  const sql = getSql();
  const rows = await sql<PractitionerRow[]>`
    SELECT * FROM practitioners
    WHERE status = 'publicerad'
    ORDER BY CASE WHEN level IN ('mellan', 'vip') THEN 0 ELSE 1 END, lower(name)`;
  return withRelations(rows);
}

/** En publicerad utövare, eller undefined om den inte finns eller inte är publicerad. */
export async function getPublishedPractitionerBySlug(slug: string): Promise<Practitioner | undefined> {
  const sql = getSql();
  const rows = await sql<PractitionerRow[]>`
    SELECT * FROM practitioners WHERE slug = ${slug} AND status = 'publicerad'`;
  return rows.length > 0 ? (await withRelations([rows[0]]))[0] : undefined;
}

/** Räknar upp klick till bokning. Returnerar true om en publicerad utövare uppdaterades. */
export async function incrementBookingClicks(slug: string): Promise<boolean> {
  const sql = getSql();
  const result = await sql`
    UPDATE practitioners SET booking_clicks = booking_clicks + 1
    WHERE slug = ${slug} AND status = 'publicerad'`;
  return result.count > 0;
}
