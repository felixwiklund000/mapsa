// Hälsokoll: når sajten databasen? Öppna /api/status i webbläsaren.
// Visar aldrig lösenordet – bara vilken server och vilket Supabase-projekt
// DATABASE_URL pekar på, och felet om anslutningen misslyckas.

import { connection } from "next/server";
import { getSql } from "@/lib/db/client";

export async function GET() {
  await connection();
  const raw = process.env.DATABASE_URL;
  if (!raw) return Response.json({ ok: false, problem: "DATABASE_URL saknas i Vercel" }, { status: 500 });

  let target: Record<string, string> = {};
  try {
    const u = new URL(raw);
    // Användarnamnet hos Supabase-poolern är "postgres.<projekt-id>".
    const project = u.username.includes(".") ? u.username.split(".").slice(1).join(".") : "(inget projekt-id i användarnamnet)";
    target = { server: u.hostname, port: u.port || "5432", projekt: project };
  } catch {
    return Response.json({ ok: false, problem: "DATABASE_URL är inte en giltig adress" }, { status: 500 });
  }

  try {
    const sql = getSql();
    const [row] = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM practitioners WHERE status = 'publicerad'`;
    return Response.json({ ok: true, ...target, publicerade: row.n }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const e = err as { code?: string; message?: string };
    return Response.json(
      { ok: false, ...target, felkod: e.code ?? null, fel: String(e.message ?? err).slice(0, 300) },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
