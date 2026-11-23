// Mejlnotis till oss när någon anmäler sig (Resend). Körs efter att
// anmälan sparats och får aldrig stoppa den: fel loggas bara.
//
// Miljövariabler (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY  – nyckeln från resend.com
//   NOTIFY_EMAIL    – vart notisen ska (utan egen domän i Resend: kontots mejl)
//   NOTIFY_FROM     – valfri, t.ex. "Mapsa <hej@mapsa.se>" när domänen är verifierad

import type { NewApplication } from "./db/applications.ts";

export async function notifyNewApplication(id: number, a: NewApplication): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return;

  const lines = [
    `Ny anmälan #${id} på Mapsa`,
    "",
    `Företag: ${a.foretagsnamn} (${a.kategori})`,
    `Adress: ${a.adress}`,
    `Billigaste tjänst: ${a.tjanst}, ${a.pris} kr`,
    `Bokning: ${a.bokningslank}`,
    `Kontakt: ${a.kontaktnamn}, ${a.mejl}${a.telefon ? `, ${a.telefon}` : ""}`,
    a.kalla ? `Källa: ${a.kalla}` : "",
    "",
    "Granska i Supabase → tabellen ansokningar.",
  ].filter((l, i, arr) => l !== "" || arr[i - 1] !== "");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || "Mapsa <onboarding@resend.dev>",
        to: [to],
        reply_to: a.mejl,
        subject: `Ny anmälan: ${a.foretagsnamn}`,
        text: lines.join("\n"),
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("Notisen kunde inte skickas", res.status, await res.text().catch(() => ""));
  } catch (err) {
    console.error("Notisen kunde inte skickas", err);
  }
}
