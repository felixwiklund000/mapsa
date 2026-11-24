// Stillbilden av ön (visas tills 3D-scenen är klar, och i stället för den när
// 3D inte används). Bilderna och prislapparnas lägen på dem tas fram ur scenen
// med samma kamera som heron: kör dev-servern och ett Playwright-skript som
// sätter window.__mapsaPosterMode (se island-scene.tsx) och fotar canvasen.
// x och y är andelar av bildytan (0–1), i samma ordning som PIN_HOUSES i scenen.

export type PosterPin = { x: number; y: number };

export const POSTER: { mobile: string; desktop: string } | null = {
  mobile: "/scen/poster-mobil.webp",
  desktop: "/scen/poster-desktop.webp",
};

export const POSTER_PINS: { mobile: PosterPin[]; desktop: PosterPin[] } = {
  desktop: [
    { x: 0.4885, y: 0.4026 },
    { x: 0.3387, y: 0.4718 },
    { x: 0.6626, y: 0.4341 },
    { x: 0.4753, y: 0.5186 },
    { x: 0.589, y: 0.3786 },
  ],
  mobile: [
    { x: 0.4884, y: 0.4136 },
    { x: 0.3387, y: 0.475 },
    { x: 0.6631, y: 0.4416 },
  ],
};
