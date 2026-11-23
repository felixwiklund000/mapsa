// Riktiga företag i Karlskrona, från offentliga uppgifter (se `source`).
// Bara företag med priser i källan är med.
//
// Bara det som stod i källan är med: namn, adress, bokningslänk, och
// priser/öppettider där de syntes. Inget är påhittat. Koordinaterna är
// ungefärliga (stadsdelen/gatan, inte exakt adress) – justera i adminvyn.
//
// Företagen har inte själva anmält sig (consent_at lämnas tomt). Ta bort ett
// företag direkt om det inte vill vara med.

export type RealService = { name: string; price: number; minutes?: number };
export type RealPlace = {
  slug: string;
  name: string;
  category: "massage" | "pt" | "frisor" | "kiropraktor" | "naprapat" | "skonhet";
  area: string;
  address: string;
  lat: number;
  lng: number;
  openingHours?: string;
  description: string;
  bookingUrl: string;
  email?: string;
  phone?: string;
  services: RealService[];
  /** Var uppgifterna kommer ifrån. */
  source: string;
};

export const REAL_PLACES: RealPlace[] = [
  {
    slug: "naprapat-orjan-bergstrom",
    name: "Naprapat Örjan Bergström",
    category: "naprapat",
    area: "Karlskrona",
    address: "Valhallavägen 16",
    lat: 56.1745, // ungefärligt – stadsdelen gick inte att bekräfta
    lng: 15.5905,
    openingHours: "Vardagar, stängt helger",
    description: "Naprapat på Valhallavägen. Erbjuder naprapatbehandling och medicinsk massage.",
    bookingUrl: "https://www.bokadirekt.se/places/naprapat-orjan-bergstrom-45443",
    services: [
      { name: "Naprapatbehandling", price: 800, minutes: 45 },
      { name: "Medicinsk massage", price: 650, minutes: 45 },
    ],
    source: "https://www.bokadirekt.se/places/naprapat-orjan-bergstrom-45443",
  },
  {
    slug: "ferdoss-salong",
    name: "Ferdoss salong",
    category: "frisor",
    area: "Trossö",
    address: "Styrmansgatan 38",
    lat: 56.1617,
    lng: 15.5893,
    description: "Salong för hår och skönhet – klippning, färgning, hudvård och makeup.",
    bookingUrl: "https://www.bokadirekt.se/places/ferdoss-salong-132939",
    services: [
      { name: "Klippning med fön", price: 400 },
      { name: "Barnklippning", price: 250 },
    ],
    source: "https://www.bokadirekt.se/places/ferdoss-salong-132939",
  },
  {
    slug: "grease-and-peace-barbershop",
    name: "Grease & Peace Barbershop",
    category: "frisor",
    area: "Trossö",
    address: "Drottninggatan 10",
    lat: 56.1604,
    lng: 15.5852,
    openingHours: "Tis–lör 10.30–18, lördagar endast drop-in",
    description: "Barbershop på Drottninggatan med klippning och skäggvård.",
    bookingUrl: "https://www.bokadirekt.se/places/grease-peace-barbershop-35394",
    services: [
      { name: "Klippning", price: 600, minutes: 45 },
      { name: "Royal Treatment (klippning, skägg, tvätt, styling)", price: 950, minutes: 90 },
    ],
    source: "https://www.bokadirekt.se/places/grease-peace-barbershop-35394",
  },
  {
    slug: "cxi-barbershop",
    name: "CXI Barbershop",
    category: "frisor",
    area: "Trossö",
    address: "Ronnebygatan 19",
    lat: 56.1627,
    lng: 15.5859,
    openingHours: "Mån–fre 10–18.30, lör 10–15",
    description: "Barbershop med certifierade barberare. Boka via Bokadirekt eller kom in utan bokning (CutQ).",
    bookingUrl: "https://www.bokadirekt.se/places/cxi-barbershop-40863",
    services: [
      { name: "Klippning", price: 300, minutes: 30 },
      { name: "Hår och skägg", price: 500, minutes: 60 },
      { name: "Barnklippning", price: 250, minutes: 30 },
    ],
    source: "https://www.bokadirekt.se/places/cxi-barbershop-40863",
  },
];
