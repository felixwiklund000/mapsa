// "Drönarflygning" till en vald utövare:
//   1. Svep in lågt mellan byggnaderna, kameran vänd i färdriktningen, med
//      lätt rörelseoskärpa när det går som fortast.
//   2. Stig sedan mjukt upp till en drönarvy ovanför platsen.
// Avbryts direkt om användaren själv drar/zoomar i kartan.

import type { Map as MapLibreMap, PaddingOptions } from "maplibre-gl";

const SWOOP = { zoom: 17.2, pitch: 68 }; // lågt mellan husen
const DRONE = { zoom: 15.8, pitch: 50 }; // uppe i luften efteråt
const MAX_BLUR_PX = 3;
const MAX_TURN = 70; // grader – mer än så blir snurrigt

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Kompassriktning (grader) från a till b – kameran tittar åt det håll den flyger. */
function heading(a: [number, number], b: [number, number]): number {
  const toRad = Math.PI / 180;
  const [lng1, lat1] = [a[0] * toRad, a[1] * toRad];
  const [lng2, lat2] = [b[0] * toRad, b[1] * toRad];
  const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
  return (Math.atan2(y, x) / toRad + 360) % 360;
}

/** Ungefärligt avstånd i km. */
function distanceKm(a: [number, number], b: [number, number]): number {
  const dLat = (a[1] - b[1]) * 111;
  const dLng = (a[0] - b[0]) * 111 * Math.cos((a[1] * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

/** Startar flygningen. Returnerar en funktion som avbryter den. */
export function droneFlight(map: MapLibreMap, target: [number, number], padding: PaddingOptions): () => void {
  const canvas = map.getCanvas();
  const from = map.getCenter().toArray() as [number, number];
  const km = distanceKm(from, target);
  // Vänd kameran mot färdriktningen, men högst MAX_TURN grader åt gången.
  const current = map.getBearing();
  const turn = km < 0.05 ? 0 : ((heading(from, target) - current + 540) % 360) - 180;
  const bearing = current + Math.max(-MAX_TURN, Math.min(MAX_TURN, turn));
  const duration = Math.min(2600, 1300 + km * 220);

  let cancelled = false;
  let blur = 0;

  // Rörelseoskärpa: proportionell mot hur snabbt bilden rör sig. Följer två
  // punkter nere i bilden (där husen syns) och mäter hur många pixlar de
  // flyttats sedan förra bildrutan – fångar panorering, zoom och rotation.
  const probes = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    return [map.unproject([w * 0.2, h * 0.8]), map.unproject([w * 0.8, h * 0.8])];
  };
  let last = probes();
  let lastTime = performance.now();
  const onMove = () => {
    const now = performance.now();
    const dt = Math.max(8, now - lastTime);
    const { clientWidth: w, clientHeight: h } = canvas;
    const expected = [[w * 0.2, h * 0.8], [w * 0.8, h * 0.8]];
    const px = Math.max(
      ...last.map((ll, i) => {
        const p = map.project(ll);
        return Math.hypot(p.x - expected[i][0], p.y - expected[i][1]);
      }),
    );
    last = probes();
    lastTime = now;
    const speed = (px * 16) / dt; // px per bildruta vid 60 fps
    const target = Math.min(MAX_BLUR_PX, Math.max(0, speed - 4) / 12);
    blur = blur * 0.5 + target * 0.5;
    canvas.style.filter = blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : "";
  };
  const clearBlur = () => {
    canvas.style.filter = "";
    blur = 0;
  };
  // Användaren tar över (drar, zoomar, nyper) → avbryt.
  const onUserMove = (e: { originalEvent?: unknown }) => {
    if (e.originalEvent) cancel();
  };

  const cancel = () => {
    if (cancelled) return;
    cancelled = true;
    map.off("move", onMove);
    map.off("movestart", onUserMove);
    clearBlur();
  };

  map.on("move", onMove);
  map.on("movestart", onUserMove);

  // 1. Svep in lågt mellan husen.
  map.flyTo({
    center: target,
    zoom: SWOOP.zoom,
    pitch: SWOOP.pitch,
    bearing,
    padding,
    duration,
    curve: 1.2,
    easing: easeInOutCubic,
  });
  map.once("moveend", () => {
    // moveend kommer även när svepet avbryts (före användarens egen movestart),
    // så stig bara upp om kameran faktiskt kom fram.
    const arrived =
      Math.abs(map.getZoom() - SWOOP.zoom) < 0.05 && distanceKm(map.getCenter().toArray() as [number, number], target) < 0.01;
    if (cancelled || !arrived) return cancel();
    clearBlur();
    // 2. Stig upp till drönarvy och vrid tillbaka mot norr.
    map.easeTo({
      center: target,
      zoom: DRONE.zoom,
      pitch: DRONE.pitch,
      bearing: 0,
      padding,
      duration: 1800,
      easing: easeOutCubic,
    });
    map.once("moveend", cancel);
  });

  return cancel;
}
