// Anmälningar (tabellen ansokningar). Skrivs bara från servern.

import { getSql } from "./client.ts";
import type { CategorySlug } from "../categories.ts";

export type NewApplication = {
  foretagsnamn: string;
  kategori: CategorySlug;
  adress: string;
  lat: number;
  lng: number;
  tjanst: string;
  pris: number;
  bokningslank: string;
  kontaktnamn: string;
  mejl: string;
  telefon: string | null;
  kalla: string | null;
};

export async function insertApplication(a: NewApplication): Promise<number> {
  const sql = getSql();
  const [row] = await sql<{ id: number }[]>`
    INSERT INTO ansokningar
      (foretagsnamn, kategori, adress, lat, lng, tjanst, pris, bokningslank,
       kontaktnamn, mejl, telefon, kalla, samtycke_at)
    VALUES
      (${a.foretagsnamn}, ${a.kategori}, ${a.adress}, ${a.lat}, ${a.lng}, ${a.tjanst}, ${a.pris},
       ${a.bokningslank}, ${a.kontaktnamn}, ${a.mejl}, ${a.telefon}, ${a.kalla}, now())
    RETURNING id`;
  return row.id;
}
