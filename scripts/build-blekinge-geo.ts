// Räknar fram Blekinge-området för kartan och sparar src/lib/blekinge-geo.json.
//
// Indata: Natural Earth 10m admin-1 (fri data), t.ex.
//   https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson
// Kör: node --no-warnings scripts/build-blekinge-geo.ts <sökväg-till-filen>
//
// Området = Blekinge län + havet närmast kusten (12 km ut, så att skärgården
// kommer med), men aldrig grannlänens land (Skåne, Kronoberg, Kalmar).
// Masken = en stor rektangel runt Sverige med Blekinge-området som hål.

import { readFileSync, writeFileSync } from "node:fs";
import * as turf from "@turf/turf";
import type { Feature, MultiPolygon, Polygon } from "geojson";

type Area = Feature<Polygon | MultiPolygon>;

const file = process.argv[2];
if (!file) {
  console.error("Ange sökvägen till ne_10m_admin_1_states_provinces.geojson");
  process.exit(1);
}

const all = JSON.parse(readFileSync(file, "utf8")) as { features: (Area & { properties: Record<string, string> })[] };
const swedish = (name: string) => {
  const f = all.features.find((x) => x.properties.admin === "Sweden" && x.properties.name === name);
  if (!f) throw new Error(`Hittade inte ${name}`);
  return turf.feature(f.geometry) as Area;
};

const blekinge = swedish("Blekinge");
const neighbours = turf.union(turf.featureCollection([swedish("Skåne"), swedish("Kronoberg"), swedish("Kalmar")])) as Area;

// Havet närmast kusten – men inte upp längs Kalmar läns kust i öster.
const notNorthEast = turf.bboxPolygon([15.98, 56.18, 18, 58]) as Area;
const coastalSea = turf.difference(
  turf.featureCollection([turf.buffer(blekinge, 12, { units: "kilometers" }) as Area, neighbours, notNorthEast]),
) as Area;
const unioned = turf.union(turf.featureCollection([blekinge, coastalSea])) as Area;
// Mjuk kontur ute till havs: fyll hack (buffra ut 4 km och sedan in igen).
const smooth = turf.buffer(turf.buffer(unioned, 4, { units: "kilometers" }) as Area, -4, { units: "kilometers" }) as Area;
// Land som inte är Blekinge ska aldrig räknas in.
const clipped = turf.difference(turf.featureCollection([smooth, neighbours])) as Area;
const region = turf.simplify(clipped, { tolerance: 0.0015, highQuality: true }) as Area;

const outer = turf.bboxPolygon([2, 50, 35, 72]) as Area;
const mask = turf.difference(turf.featureCollection([outer, region])) as Area;

const [w, s, e, n] = turf.bbox(region);
const round = (v: number) => Math.round(v * 1e5) / 1e5;
const roundCoords = (g: Area): Area => JSON.parse(JSON.stringify(g, (_k, v) => (typeof v === "number" ? round(v) : v)));

writeFileSync(
  "src/lib/blekinge-geo.json",
  JSON.stringify({
    // Kartan får inte panoreras längre än så här utanför Blekinge.
    bounds: [round(w - 0.35), round(s - 0.2), round(e + 0.35), round(n + 0.2)],
    region: roundCoords(region),
    mask: roundCoords(mask),
  }),
);
const points = JSON.stringify(region.geometry.coordinates).split("],[").length;
console.log(`Skrev src/lib/blekinge-geo.json (${points} punkter i konturen, bbox ${[w, s, e, n].map((v) => v.toFixed(3)).join(", ")})`);
