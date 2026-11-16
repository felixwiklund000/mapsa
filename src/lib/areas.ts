// Kända områden i Karlskrona med ungefärliga mittpunkter. När en utövare
// anmäler sig väljs koordinaterna härifrån utifrån området. Koordinaterna är
// ungefärliga – admin kan justera dem per utövare om nålen hamnar fel.

export type Area = { name: string; lat: number; lng: number };

export const AREAS: readonly Area[] = [
  { name: "Trossö", lat: 56.1612, lng: 15.5869 },
  { name: "Pottholmen", lat: 56.1664, lng: 15.5796 },
  { name: "Saltö", lat: 56.1566, lng: 15.5745 },
  { name: "Långö", lat: 56.1556, lng: 15.5935 },
  { name: "Hästö", lat: 56.1596, lng: 15.5555 },
  { name: "Vämö", lat: 56.1795, lng: 15.5605 },
  { name: "Galgamarken", lat: 56.1838, lng: 15.5868 },
  { name: "Bergåsa", lat: 56.1786, lng: 15.5935 },
  { name: "Rosenholm", lat: 56.1985, lng: 15.5850 },
  { name: "Gullberna", lat: 56.1962, lng: 15.6070 },
  { name: "Kungsmarken", lat: 56.1858, lng: 15.6255 },
  { name: "Lyckeby", lat: 56.1990, lng: 15.6480 },
  { name: "Nättraby", lat: 56.2052, lng: 15.5270 },
  { name: "Rödeby", lat: 56.2575, lng: 15.6080 },
  { name: "Jämjö", lat: 56.1908, lng: 15.8400 },
];

// Används när området inte finns i listan.
export const KARLSKRONA_CENTER: Area = { name: "Karlskrona", lat: 56.1612, lng: 15.5869 };

function normalize(s: string): string {
  return s.trim().toLocaleLowerCase("sv-SE");
}

export function findArea(name: string): Area | undefined {
  const n = normalize(name);
  return AREAS.find((a) => normalize(a.name) === n);
}
