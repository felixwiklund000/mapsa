// Stillbilden av ön (visas tills 3D-scenen är klar, och i stället för den när
// 3D inte används). Bilderna och prislapparnas lägen på dem tas fram ur scenen
// med samma kamera som heron (se docs/design-spec.md, Startsidan).
// x och y är andelar av bildytan (0–1), i samma ordning som PIN_HOUSES i scenen.

export type PosterPin = { x: number; y: number };

export const POSTER: { mobile: string; desktop: string } | null = null;

export const POSTER_PINS: { mobile: PosterPin[]; desktop: PosterPin[] } = {
  desktop: [
    { x: 0.42, y: 0.42 },
    { x: 0.58, y: 0.38 },
    { x: 0.5, y: 0.55 },
    { x: 0.35, y: 0.58 },
    { x: 0.66, y: 0.54 },
  ],
  mobile: [
    { x: 0.38, y: 0.42 },
    { x: 0.62, y: 0.4 },
    { x: 0.5, y: 0.6 },
  ],
};
