// "Drönarflygning" till en vald utövare – en enda sammanhängande kamerabana:
//   1. Dyk ner till strax ovanför hustaken.
//   2. Susa fram lågt mellan byggnaderna, med lätt rörelseoskärpa i farten.
//   3. Dra upp mjukt och fortsätt uppåt (och framåt) till en drönarvy över
//      platsen. Kameran backar aldrig och vänder aldrig.
// Avbryts direkt om användaren själv tar tag i kartan.
//
// Kameran räknas som en riktig punkt i luften (marklage + höjd i meter) som
// tittar på en punkt på marken. Varje bildruta görs om till center/zoom/
// lutning/riktning och sätts med jumpTo.

import type { Map as MapLibreMap, PaddingOptions } from "maplibre-gl";

const DRONE = { zoom: 15.8, pitch: 50 }; // slutvyn uppe i luften
const LOW_ALTITUDE_M = 40; // flyghöjd strax ovanför hustaken (husen är upp till ~15 m)
const LOW_PITCH = 72; // grader – tittar framåt längs gatorna
const MAX_TURN = 90; // grader kameran vrider sig högst per flygning
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
const lerp2 = (a: V2, b: V2, t: number): V2 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const dir = (bearingDeg: number): V2 => [Math.sin(bearingDeg * DEG), Math.cos(bearingDeg * DEG)];

/** Kompassriktning (grader) från a till b. */
function heading(a: V2, b: V2): number {
  return Math.atan2(b[0] - a[0], b[1] - a[1]) / DEG;
}

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

  /** Kamerans position i luften för en vy (center, zoom, lutning, riktning). */
  const cameraFor = (center: V2, zoom: number, pitch: number, bearing: number) => {
    const dist = camDistPx() * metersPerPx(zoom);
    const back = dir(bearing);
    const ground: V2 = [center[0] - back[0] * dist * Math.sin(pitch * DEG), center[1] - back[1] * dist * Math.sin(pitch * DEG)];
    return { ground, height: dist * Math.cos(pitch * DEG) };
  };

  // Start: där kameran är nu.
  const A: V2 = [0, 0];
  const B = toM(target[0], target[1]);
  const b0 = map.getBearing();
  const start = cameraFor(A, map.getZoom(), map.getPitch(), b0);

  // Slut: drönarvy över målet, vänd (högst MAX_TURN) mot färdriktningen.
  const distM = Math.hypot(B[0], B[1]);
  const turn = distM < 40 ? 0 : ((heading(A, B) - b0 + 540) % 360) - 180;
  const b1 = b0 + Math.max(-MAX_TURN, Math.min(MAX_TURN, turn));
  const end = cameraFor(B, DRONE.zoom, DRONE.pitch, b1);

  const duration = Math.min(3400, 2300 + (distM / 1000) * 500);

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

    // Marklaget glider rakt fram, snabbast i mitten.
    const ground = lerp2(start.ground, end.ground, e);
    // Höjden: från start till slut (logaritmiskt, som zoom) – men dyker ner
    // till hustaken i början och drar sedan upp i en lång mjuk stigning.
    const low = smoothstep(0, 0.28, t) * (1 - smoothstep(0.45, 1, t));
    const logH = lerp(Math.log(start.height), Math.log(end.height), e);
    const height = Math.exp(lerp(logH, Math.log(LOW_ALTITUDE_M), low));
    // Blicken: från startcentrum mot målet, men framåt längs gatan när den flyger lågt.
    const bearing = lerp(b0, b1, e);
    const ahead = dir(bearing);
    const lookAhead: V2 = [
      ground[0] + ahead[0] * height * Math.tan(LOW_PITCH * DEG),
      ground[1] + ahead[1] * height * Math.tan(LOW_PITCH * DEG),
    ];
    const look = lerp2(lerp2(A, B, e), lookAhead, low);

    // Gör om till kartans kamera.
    let v: V2 = [look[0] - ground[0], look[1] - ground[1]];
    let horiz = Math.hypot(v[0], v[1]);
    const maxHoriz = height * Math.tan(LOW_PITCH * DEG);
    if (horiz > maxHoriz) {
      v = [(v[0] / horiz) * maxHoriz, (v[1] / horiz) * maxHoriz];
      horiz = maxHoriz;
    }
    const center: V2 = [ground[0] + v[0], ground[1] + v[1]];
    map.jumpTo({
      center: toLngLat(center),
      zoom: zoomForDist(Math.hypot(horiz, height)),
      pitch: Math.atan2(horiz, height) / DEG,
      bearing: horiz > 1 ? heading([0, 0], v) : bearing,
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
