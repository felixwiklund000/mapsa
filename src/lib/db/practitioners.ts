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
  campaign: string | null;
  videoUrl: string | null;
  level: Level;
  status: Status;
  registeredAt: string;
  bookingClicks: number;
  isTestData: boolean;
  services: Service[];
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

function toPractitioner(row: PractitionerRow, services: Service[]): Practitioner {
  return {
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
    campaign: row.campaign,
    videoUrl: row.video_url,
    level: row.level,
    status: row.status,
    registeredAt: row.registered_at,
    bookingClicks: row.booking_clicks,
    isTestData: row.is_test_data === 1,
    services,
  };
}

/** Alla publicerade utövare. Mellan och VIP först (topplacering), sedan i namnordning. */
export function listPublishedPractitioners(): Practitioner[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM practitioners
       WHERE status = 'publicerad'
       ORDER BY CASE WHEN level IN ('mellan', 'vip') THEN 0 ELSE 1 END, name COLLATE NOCASE`,
    )
    .all() as unknown as PractitionerRow[];

  if (rows.length === 0) return [];

  const serviceRows = db
    .prepare(
      `SELECT id, practitioner_id, name, price_sek, duration_min FROM services
       WHERE practitioner_id IN (SELECT id FROM practitioners WHERE status = 'publicerad')
       ORDER BY sort_order, id`,
    )
    .all() as unknown as ServiceRow[];

  const byPractitioner = new Map<number, Service[]>();
  for (const s of serviceRows) {
    const list = byPractitioner.get(s.practitioner_id) ?? [];
    list.push({ id: s.id, name: s.name, priceSek: s.price_sek, durationMin: s.duration_min });
    byPractitioner.set(s.practitioner_id, list);
  }

  return rows.map((row) => toPractitioner(row, byPractitioner.get(row.id) ?? []));
}
