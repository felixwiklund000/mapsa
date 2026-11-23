// Anmälan (/foretag, "Lägg upp ditt företag"): fälten, stegen och reglerna.
// Samma regler används i formuläret (direkt när man trycker "Nästa") och på
// servern (actions.ts) – servern litar aldrig på webbläsaren.

import blekinge from "./blekinge-geo.json";
import { CATEGORIES, type CategorySlug } from "./categories.ts";

export type SignupFields = {
  foretagsnamn: string;
  kategori: CategorySlug | "";
  adress: string;
  lat: string; // text i formuläret, tal på servern
  lng: string;
  tjanst: string;
  pris: string;
  bokningslank: string;
  kontaktnamn: string;
  mejl: string;
  telefon: string;
};

export const EMPTY_SIGNUP: SignupFields = {
  foretagsnamn: "",
  kategori: "",
  adress: "",
  lat: "",
  lng: "",
  tjanst: "",
  pris: "",
  bokningslank: "",
  kontaktnamn: "",
  mejl: "",
  telefon: "",
};

export type SignupErrors = Partial<Record<keyof SignupFields | "samtycke" | "form", string>>;

/** Stegen i formuläret och vilka fält som hör till vart och ett. */
export const SIGNUP_STEPS: { title: string; fields: (keyof SignupFields)[] }[] = [
  { title: "Företaget", fields: ["foretagsnamn", "kategori"] },
  { title: "Adress", fields: ["adress", "lat", "lng"] },
  { title: "Pris", fields: ["tjanst", "pris"] },
  { title: "Bokning", fields: ["bokningslank"] },
  { title: "Kontakt", fields: ["kontaktnamn", "mejl", "telefon"] },
];

const [minLng, minLat, maxLng, maxLat] = blekinge.bounds as [number, number, number, number];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9 ()-]{6,20}$/;

/** Bokningslänk: en webbadress (http/https) eller ett telefonnummer. */
export function normalizeBooking(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (PHONE.test(v)) return v;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Kontrollerar de fält som anges (eller alla). Returnerar fel per fält. */
export function validateSignup(f: SignupFields, only?: (keyof SignupFields)[]): SignupErrors {
  const e: SignupErrors = {};
  const check = (k: keyof SignupFields) => !only || only.includes(k);
  const len = (s: string) => s.trim().length;

  if (check("foretagsnamn") && (len(f.foretagsnamn) < 2 || len(f.foretagsnamn) > 80))
    e.foretagsnamn = "Skriv företagets namn.";
  if (check("kategori") && !CATEGORIES.some((c) => c.slug === f.kategori)) e.kategori = "Välj en kategori.";
  if (check("adress") || check("lat") || check("lng")) {
    const lat = Number(f.lat);
    const lng = Number(f.lng);
    const placed = f.lat !== "" && f.lng !== "" && Number.isFinite(lat) && Number.isFinite(lng);
    if (len(f.adress) < 2 || len(f.adress) > 160 || !placed) e.adress = "Välj adressen i listan som dyker upp.";
    else if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) e.adress = "Mapsa finns bara i Blekinge än så länge.";
  }
  if (check("tjanst") && (len(f.tjanst) < 2 || len(f.tjanst) > 80)) e.tjanst = "Skriv vad tjänsten heter.";
  if (check("pris")) {
    const n = Number(f.pris.replace(/\s/g, ""));
    if (!/^\d{1,6}$/.test(f.pris.replace(/\s/g, "")) || n < 1 || n > 100000) e.pris = "Skriv priset i hela kronor.";
  }
  if (check("bokningslank") && (!normalizeBooking(f.bokningslank) || len(f.bokningslank) > 300))
    e.bokningslank = "Klistra in länken till din bokning, eller skriv ett telefonnummer.";
  if (check("kontaktnamn") && (len(f.kontaktnamn) < 2 || len(f.kontaktnamn) > 80)) e.kontaktnamn = "Skriv ditt namn.";
  if (check("mejl") && (!EMAIL.test(f.mejl.trim()) || len(f.mejl) > 160)) e.mejl = "Skriv en mejladress vi kan nå dig på.";
  if (check("telefon") && f.telefon.trim() && !PHONE.test(f.telefon.trim())) e.telefon = "Kontrollera telefonnumret.";
  return e;
}

/** Varifrån besökaren kom (?ref=julmarknad). Bara enkla ord, max 40 tecken. */
export function cleanRef(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase().slice(0, 40);
  return /^[a-z0-9_-]+$/.test(v) ? v : null;
}
