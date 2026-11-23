// Kända områden i Blekinge (Mapsa finns bara i Blekinge än så länge) med
// ungefärliga mittpunkter. När en utövare anmäler sig väljs koordinaterna
// härifrån utifrån området. Admin kan justera dem per utövare om nålen
// hamnar fel. `kommun` visas i adressen ("Trossö, Karlskrona").

export type Area = { name: string; kommun: string; lat: number; lng: number };

export const AREAS: readonly Area[] = [
  // Karlskrona kommun
  { name: "Trossö", kommun: "Karlskrona", lat: 56.1612, lng: 15.5869 },
  { name: "Pottholmen", kommun: "Karlskrona", lat: 56.1664, lng: 15.5796 },
  { name: "Saltö", kommun: "Karlskrona", lat: 56.1566, lng: 15.5745 },
  { name: "Långö", kommun: "Karlskrona", lat: 56.1556, lng: 15.5935 },
  { name: "Hästö", kommun: "Karlskrona", lat: 56.1596, lng: 15.5555 },
  { name: "Vämö", kommun: "Karlskrona", lat: 56.1795, lng: 15.5605 },
  { name: "Galgamarken", kommun: "Karlskrona", lat: 56.1838, lng: 15.5868 },
  { name: "Bergåsa", kommun: "Karlskrona", lat: 56.1786, lng: 15.5935 },
  { name: "Rosenholm", kommun: "Karlskrona", lat: 56.1985, lng: 15.585 },
  { name: "Gullberna", kommun: "Karlskrona", lat: 56.1962, lng: 15.607 },
  { name: "Kungsmarken", kommun: "Karlskrona", lat: 56.1858, lng: 15.6255 },
  { name: "Lyckeby", kommun: "Karlskrona", lat: 56.199, lng: 15.648 },
  { name: "Nättraby", kommun: "Karlskrona", lat: 56.2052, lng: 15.527 },
  { name: "Rödeby", kommun: "Karlskrona", lat: 56.2575, lng: 15.608 },
  { name: "Jämjö", kommun: "Karlskrona", lat: 56.1908, lng: 15.84 },
  // Ronneby kommun
  { name: "Ronneby", kommun: "Ronneby", lat: 56.2093, lng: 15.2757 },
  { name: "Kallinge", kommun: "Ronneby", lat: 56.2457, lng: 15.288 },
  { name: "Bräkne-Hoby", kommun: "Ronneby", lat: 56.2318, lng: 15.117 },
  // Karlshamns kommun
  { name: "Karlshamn", kommun: "Karlshamn", lat: 56.1705, lng: 14.8633 },
  { name: "Mörrum", kommun: "Karlshamn", lat: 56.1903, lng: 14.747 },
  { name: "Asarum", kommun: "Karlshamn", lat: 56.2003, lng: 14.8382 },
  // Sölvesborgs kommun
  { name: "Sölvesborg", kommun: "Sölvesborg", lat: 56.0505, lng: 14.5853 },
  { name: "Mjällby", kommun: "Sölvesborg", lat: 56.029, lng: 14.678 },
  { name: "Hällevik", kommun: "Sölvesborg", lat: 56.0122, lng: 14.6996 },
  // Olofströms kommun
  { name: "Olofström", kommun: "Olofström", lat: 56.277, lng: 14.5337 },
];

// Används när området inte finns i listan.
export const KARLSKRONA_CENTER: Area = { name: "Karlskrona", kommun: "Karlskrona", lat: 56.1612, lng: 15.5869 };

/** Kommun för ett område, t.ex. "Trossö" → "Karlskrona". */
export function kommunFor(area: string): string {
  return findArea(area)?.kommun ?? area;
}

function normalize(s: string): string {
  return s.trim().toLocaleLowerCase("sv-SE");
}

export function findArea(name: string): Area | undefined {
  const n = normalize(name);
  return AREAS.find((a) => normalize(a.name) === n);
}
