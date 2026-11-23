// "Drönarflygning" till en vald utövare – en enda sammanhängande kamerabana:
//   1. Ner: dyker till strax ovanför hustaken och vänder sig samtidigt mot
//      målet (en enda mjuk sväng, sedan ingen mer rotation).
//   2. Rakt mot målet: susar fram lågt längs en rak linje, med lätt
//      rörelseoskärpa i farten.
//   3. Upp: stiger mjukt och tittar ner på stället.
// Kameran backar aldrig. Avbryts direkt om användaren själv tar tag i kartan.
//
// Kameran räknas som en riktig punkt i luften (marklage + höjd i meter).
// Varje bildruta görs om till center/zoom/lutning/riktning och sätts med jumpTo.

import type { Map as MapLibreMap, PaddingOptions } from "maplibre-gl";

const DRONE = { zoom: 15.8, pitch: 40 }; // slutvyn: uppe i luften, tittar ner på stället
const LOW_ALTITUDE_M = 40; // flyghöjd strax ovanför hustaken (husen är upp till ~15 m)
const MIN_END_ALTITUDE_M = 300; // slutvyn stannar alltid högt – då ligger nästa ställe framför kameran (liten sväng)
const LOW_PITCH = 72; // grader – tittar framåt mot målet när den flyger lågt
const MAX_BLUR_PX = 3;

const EARTH_M = 40075016.686;
const FOV = (36.87 * Math.PI) / 180; // MapLibres vertikala synfält
const DEG = Math.PI / 180;

type V2 = [number, number]; // meter: [öster, norr]

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const smoothstep = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const dir = (bearingDeg: number): V2 => [Math.sin(bearingDeg * DEG), Math.cos(bearingDeg * DEG)];
/** Mjukt minimum (ingen knyck där de två korsar varandra). */
const softMin = (a: number, b: number, k = 20) => {
  const m = Math.min(a, b);
  return m - k * Math.log(Math.exp((m - a) / k) + Math.exp((m - b) / k));
};

/** Startar flygningen. Returnerar en funktion som avbryter den. */
export function droneFlight(map: MapLibreMap, target: [number, number], padding: PaddingOptions): () => void {
  const canvas = map.getCanvas();
  const container = map.getCanvasContainer();

  // Lokalt koordinatsystem i meter runt nuvarande kartcentrum.
  const origin = map.getCenter();
  const cosLat = Math.cos(origin.lat * DEG);
  const toM = (lng: number, lat: number): V2 => [(lng - origin.lng) * 111320 * cosLat, (lat - origin.lat) * 110540];
  const toLngLat = ([x, y]: V2): [number, number] => [origin.lng + x / (111320 * cosLat), origin.lat + y / 110540];

  // Kamerans avstånd till centrum (meter) ↔ zoom, som MapLibre räknar.
  const camDistPx = () => (0.5 / Math.tan(FOV / 2)) * canvas.clientHeight;
  const metersPerPx = (zoom: number) => (EARTH_M * cosLat) / (512 * 2 ** zoom);
  const zoomForDist = (m: number) => Math.log2((EARTH_M * cosLat * camDistPx()) / (512 * m));

  // Start: kameran där den är nu.
  const b0 = map.getBearing();
  const p0 = map.getPitch() * DEG;
  const dist0 = camDistPx() * metersPerPx(map.getZoom());
  const h0 = dist0 * Math.cos(p0);
  const look0 = dist0 * Math.sin(p0); // hur långt fram den tittar (meter längs marken)
  const back = dir(b0);
  const g0: V2 = [-back[0] * look0, -back[1] * look0];

  // Riktning: rakt från kameran mot målet.
  const B = toM(target[0], target[1]);
  const toB: V2 = [B[0] - g0[0], B[1] - g0[1]];
  const total = Math.hypot(toB[0], toB[1]);
  const heading = total > 1 ? Math.atan2(toB[0], toB[1]) / DEG : b0;
  const u = dir(heading);
  const turn = ((heading - b0 + 540) % 360) - 180; // kortaste vägen

  // Slut: uppe i luften och tittar ner på målet. Kameran ska alltid åka en
  // bit framåt (40 % av vägen, upp till 150 m) – ligger målet nära
  // stannar den därför lite lägre i stället för att backa.
  const tilt = Math.tan(DRONE.pitch * DEG);
  const hDrone = camDistPx() * metersPerPx(DRONE.zoom) * Math.cos(DRONE.pitch * DEG);
  const minTravel = Math.min(150, total * 0.4);
  const lookF = Math.max(0, Math.min(hDrone * tilt, total - minTravel));
  const hf = Math.max(MIN_END_ALTITUDE_M, lookF / tilt);
  const travel = total - lookF;

  const duration = Math.min(3400, 2300 + (travel / 1000) * 600);

  let raf = 0;
  let cancelled = false;
  let t0 = 0;
  let blur = 0;
  let lastProbes: [number, number][] | null = null;

  const probePx = (): [number, number][] => [
    [canvas.clientWidth * 0.2, canvas.clientHeight * 0.8],
    [canvas.clientWidth * 0.8, canvas.clientHeight * 0.8],
  ];

  const frame = (now: number) => {
    if (cancelled) return;
    if (!t0) t0 = now;
    const t = Math.min(1, (now - t0) / duration);
    const e = easeInOutCubic(t);

    // Marklaget: rakt mot målet, snabbast i mitten.
    const s = travel * e;
    const ground: V2 = [g0[0] + u[0] * s, g0[1] + u[1] * s];
    // Höjden: ner till hustaken i början, sedan en lång mjuk stigning.
    const low = smoothstep(0, 0.3, t) * (1 - smoothstep(0.5, 1, t));
    const height = Math.exp(lerp(lerp(Math.log(h0), Math.log(hf), e), Math.log(LOW_ALTITUDE_M), low));
    // Riktningen: en enda sväng mot målet medan den dyker, sedan rakt fram.
    const bearing = b0 + turn * smoothstep(0, 0.35, t);
    // Blicken: framåt mot målet när den är låg – och när målet kommer
    // närmare än så låser den på målet och tittar ner på det.
    const toTarget = total - s;
    const lookGoal = softMin(height * Math.tan(LOW_PITCH * DEG), toTarget);
    const look = Math.min(lerp(look0, lookGoal, smoothstep(0, 0.3, t)), height * Math.tan(LOW_PITCH * DEG));

    const ahead = dir(bearing);
    const center: V2 = [ground[0] + ahead[0] * look, ground[1] + ahead[1] * look];
    map.jumpTo({
      center: toLngLat(center),
      zoom: zoomForDist(Math.hypot(look, height)),
      pitch: Math.atan2(look, height) / DEG,
      bearing,
      padding,
    });

    // Rörelseoskärpa: hur många pixlar två punkter nere i bilden flyttats.
    if (lastProbes) {
      const ref = probePx();
      const px = Math.max(
        ...lastProbes.map((ll, i) => {
          const p = map.project(ll);
          return Math.hypot(p.x - ref[i][0], p.y - ref[i][1]);
        }),
      );
      const goal = t < 1 ? Math.min(MAX_BLUR_PX, Math.max(0, px - 4) / 12) : 0;
      blur = blur * 0.5 + goal * 0.5;
      canvas.style.filter = blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : "";
    }
    lastProbes = probePx().map((p) => map.unproject(p).toArray() as [number, number]);

    if (t < 1) raf = requestAnimationFrame(frame);
    else cancel();
  };

  const cancel = () => {
    if (cancelled) return;
    cancelled = true;
    cancelAnimationFrame(raf);
    canvas.style.filter = "";
    container.removeEventListener("pointerdown", cancel);
    container.removeEventListener("wheel", cancel);
    container.removeEventListener("touchstart", cancel);
  };

  // Användaren tar över (drar, zoomar, nyper) → avbryt.
  container.addEventListener("pointerdown", cancel);
  container.addEventListener("wheel", cancel, { passive: true });
  container.addEventListener("touchstart", cancel, { passive: true });

  map.stop();
  raf = requestAnimationFrame(frame);
  return cancel;
}
