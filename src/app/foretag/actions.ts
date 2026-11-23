"use server";

// Server action för anmälan ("Lägg upp ditt företag"). Kontrollerar allt på
// nytt (webbläsaren kan inte litas på), stoppar enkel spam och sparar i
// tabellen ansokningar. Notisen till oss skickas efter svaret (after).

import { redirect } from "next/navigation";
import { after } from "next/server";
import { insertApplication, type NewApplication } from "@/lib/db/applications";
import { notifyNewApplication } from "@/lib/notify";
import { cleanRef, EMPTY_SIGNUP, normalizeBooking, validateSignup, type SignupErrors, type SignupFields } from "@/lib/signup";
import type { CategorySlug } from "@/lib/categories";

export type SignupState = { errors: SignupErrors } | null;

const MIN_FILL_MS = 3000; // snabbare än så är en robot

export async function submitSignup(_prev: SignupState, formData: FormData): Promise<SignupState> {
  // Honeypot: ett dolt fält som bara robotar fyller i. Låtsas att allt gick bra.
  if (String(formData.get("webbplats") ?? "").trim() !== "") redirect("/foretag/tack");
  const started = Number(formData.get("startad"));
  if (Number.isFinite(started) && started > 0 && Date.now() - started < MIN_FILL_MS) redirect("/foretag/tack");

  const fields = { ...EMPTY_SIGNUP } as SignupFields;
  for (const key of Object.keys(EMPTY_SIGNUP) as (keyof SignupFields)[]) {
    const v = formData.get(key);
    (fields as Record<string, string>)[key] = typeof v === "string" ? v.slice(0, 400) : "";
  }

  const errors = validateSignup(fields);
  if (formData.get("samtycke") !== "ja") errors.samtycke = "Du behöver godkänna att vi sparar uppgifterna.";
  if (Object.keys(errors).length > 0) return { errors };

  const application: NewApplication = {
    foretagsnamn: fields.foretagsnamn.trim(),
    kategori: fields.kategori as CategorySlug,
    adress: fields.adress.trim(),
    lat: Number(fields.lat),
    lng: Number(fields.lng),
    tjanst: fields.tjanst.trim(),
    pris: Number(fields.pris.replace(/\s/g, "")),
    bokningslank: normalizeBooking(fields.bokningslank) as string,
    kontaktnamn: fields.kontaktnamn.trim(),
    mejl: fields.mejl.trim().toLowerCase(),
    telefon: fields.telefon.trim() || null,
    kalla: cleanRef(formData.get("kalla")),
  };

  let id: number;
  try {
    id = await insertApplication(application);
  } catch (err) {
    console.error("Anmälan kunde inte sparas", err);
    return { errors: { form: "Något gick fel när vi skulle spara. Försök igen om en stund – inget av det du skrivit har försvunnit." } };
  }

  after(() => notifyNewApplication(id, application));
  redirect("/foretag/tack");
}
