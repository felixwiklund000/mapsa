// Stillbilden av jordklotet (visas tills 3D-scenen är klar, och i stället för den när
// 3D inte används). Bilderna och prislapparnas lägen på dem tas fram ur scenen
// med samma kamera som heron: kör dev-servern och ett Playwright-skript som
// sätter window.__mapsaPosterMode (se globe-scene.tsx) och fotar canvasen.
// x och y är andelar av bildytan (0–1), i samma ordning som PIN_SHOPS i scenen.

export type PosterPin = { x: number; y: number };

export const POSTER: { mobile: string; desktop: string } | null = {
  mobile: "/scen/poster-mobil.webp",
  desktop: "/scen/poster-desktop.webp",
};

export const POSTER_PINS: { mobile: PosterPin[]; desktop: PosterPin[] } = {
  desktop: [
    { x: 0.5, y: 0.1396 },
    { x: 0.3548, y: 0.1746 },
    { x: 0.6452, y: 0.1746 },
    { x: 0.234, y: 0.2074 },
    { x: 0.766, y: 0.2074 },
  ],
  mobile: [
    { x: 0.5, y: 0.185 },
    { x: 0.3562, y: 0.2155 },
    { x: 0.6438, y: 0.2155 },
  ],
};
