// Adressförslag till anmälan, från Photon (OpenStreetMap, photon.komoot.io).
// Begränsat till Blekinge. Vi skickar bara söktexten vidare – inga uppgifter
// om besökaren.

import blekinge from "@/lib/blekinge-geo.json";

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    district?: string;
    locality?: string;
    countrycode?: string;
  };
};

export type AddressSuggestion = { label: string; lat: number; lng: number };

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 100) ?? "";
  if (q.length < 3) return Response.json({ results: [] });

  const [minLng, minLat, maxLng, maxLat] = blekinge.bounds;
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "6");
  url.searchParams.set("bbox", `${minLng},${minLat},${maxLng},${maxLat}`);
  url.searchParams.set("lat", "56.1612");
  url.searchParams.set("lon", "15.5869");

  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mapsa (UF-foretag)" }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return Response.json({ results: [], error: "unavailable" }, { status: 200 });
    const data = (await res.json()) as { features?: PhotonFeature[] };
    const seen = new Set<string>();
    const results: AddressSuggestion[] = [];
    for (const f of data.features ?? []) {
      const p = f.properties;
      if (p.countrycode && p.countrycode !== "SE") continue;
      const street = p.street ? `${p.street}${p.housenumber ? ` ${p.housenumber}` : ""}` : p.name;
      const place = p.city || p.locality || p.district;
      const label = [street, place].filter(Boolean).join(", ");
      if (!label || seen.has(label)) continue;
      seen.add(label);
      const [lng, lat] = f.geometry.coordinates;
      results.push({ label, lat, lng });
    }
    return Response.json({ results }, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch {
    return Response.json({ results: [], error: "unavailable" }, { status: 200 });
  }
}
