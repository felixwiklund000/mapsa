import { incrementBookingClicks } from "@/lib/db/practitioners";

// Tar emot ett "klick till bokning" från profilsidans bokningsknapp.
// Best-effort: knappen väntar aldrig på svaret, så ett fel här stoppar
// aldrig själva bokningslänken.

export async function POST(_request: Request, ctx: RouteContext<"/api/bokningsklick/[slug]">) {
  const { slug } = await ctx.params;
  try {
    await incrementBookingClicks(slug);
  } catch (err) {
    console.error("Kunde inte räkna bokningsklick", err);
  }
  return new Response(null, { status: 204 });
}
