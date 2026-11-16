// Påhittade testprofiler för utveckling. Alla märks med is_test_data = true
// och bokningslänken pekar på /testdata. Ändra här och kör sedan
// `npm run db:seed` (eller `npm run db:export-sql` för Supabase SQL Editor).

export type SeedService = { name: string; price: number; minutes?: number };
export type SeedProfile = {
  slug: string;
  name: string;
  category: string;
  area: string;
  // Liten förskjutning från områdets mittpunkt så att nålar inte hamnar exakt ovanpå varandra.
  offset: [number, number];
  openingHours: string;
  description: string;
  level: "grundlistning" | "bas" | "mellan" | "vip";
  status: "vantar_granskning" | "publicerad" | "inaktiv";
  registeredDaysAgo: number;
  campaign?: string;
  services: SeedService[];
};

export const PROFILES: SeedProfile[] = [
  {
    slug: "lugna-handen-massage",
    name: "Lugna Handen Massage",
    category: "massage",
    area: "Trossö",
    offset: [0.0008, -0.0012],
    openingHours: "Mån–fre 9–18, lör 10–14",
    description:
      "Klassisk massage och djupvävnadsmassage i en lugn lokal mitt på Trossö. Bra om du sitter mycket vid skrivbordet.",
    level: "mellan",
    status: "publicerad",
    registeredDaysAgo: 40,
    services: [
      { name: "Klassisk massage", price: 595, minutes: 50 },
      { name: "Djupvävnadsmassage", price: 695, minutes: 50 },
      { name: "Rygg- och nackmassage", price: 395, minutes: 25 },
    ],
  },
  {
    slug: "kraftverket-pt",
    name: "Kraftverket PT",
    category: "pt",
    area: "Kungsmarken",
    offset: [-0.0006, 0.0009],
    openingHours: "Mån–sön 6–21",
    description:
      "Personlig träning för dig som vill komma igång eller bli starkare. Upplägg efter din nivå, inga måsten.",
    level: "grundlistning",
    status: "publicerad",
    registeredDaysAgo: 12,
    services: [
      { name: "PT-pass", price: 650, minutes: 60 },
      { name: "Kostgenomgång", price: 450, minutes: 45 },
      { name: "Klippkort 10 pass", price: 5500 },
    ],
  },
  {
    slug: "saxen-och-spegeln",
    name: "Saxen & Spegeln",
    category: "frisor",
    area: "Pottholmen",
    offset: [0.0004, 0.0006],
    openingHours: "Tis–fre 10–18, lör 9–15",
    description: "Liten frisörsalong med fokus på klippning och färg. Drop-in när det finns lediga tider.",
    level: "bas",
    status: "publicerad",
    registeredDaysAgo: 25,
    campaign: "20 % på färg för nya kunder hela december.",
    services: [
      { name: "Klippning kort hår", price: 450, minutes: 30 },
      { name: "Klippning långt hår", price: 595, minutes: 45 },
      { name: "Färg och klipp", price: 1450, minutes: 120 },
      { name: "Barnklippning (under 12)", price: 295, minutes: 30 },
    ],
  },
  {
    slug: "ryggraden-kiropraktik",
    name: "Ryggraden Kiropraktik",
    category: "kiropraktor",
    area: "Lyckeby",
    offset: [-0.0005, -0.0007],
    openingHours: "Mån–tor 8–17, fre 8–13",
    description:
      "Legitimerad kiropraktor som behandlar rygg, nacke och huvudvärk. Första besöket innehåller en grundlig undersökning.",
    level: "vip",
    status: "publicerad",
    registeredDaysAgo: 60,
    services: [
      { name: "Nybesök inkl. undersökning", price: 795, minutes: 45 },
      { name: "Återbesök", price: 595, minutes: 30 },
    ],
  },
  {
    slug: "rorelsekliniken-naprapat",
    name: "Rörelsekliniken Naprapat",
    category: "naprapat",
    area: "Bergåsa",
    offset: [0.0006, 0.0004],
    openingHours: "Mån–fre 8–19",
    description: "Naprapati för besvär i muskler och leder, med övningar du kan göra hemma mellan besöken.",
    level: "grundlistning",
    status: "publicerad",
    registeredDaysAgo: 5,
    services: [
      { name: "Nybesök", price: 750, minutes: 60 },
      { name: "Återbesök", price: 650, minutes: 45 },
    ],
  },
  {
    slug: "hudateljen-glod",
    name: "Hudateljén Glöd",
    category: "skonhet",
    area: "Rosenholm",
    offset: [-0.0004, 0.0008],
    openingHours: "Ons–lör 10–18",
    description: "Ansiktsbehandlingar och fransar. Vi hjälper dig hitta en hudrutin som funkar i vardagen.",
    level: "bas",
    status: "publicerad",
    registeredDaysAgo: 33,
    services: [
      { name: "Klassisk ansiktsbehandling", price: 795, minutes: 60 },
      { name: "Fransförlängning, nytt set", price: 990, minutes: 90 },
      { name: "Bryn- och fransfärgning", price: 350, minutes: 30 },
    ],
  },
  {
    slug: "jamjo-sportmassage",
    name: "Jämjö Sportmassage",
    category: "massage",
    area: "Jämjö",
    offset: [0.0003, -0.0005],
    openingHours: "Kvällar och helger efter bokning",
    description: "Sportmassage för dig som tränar mycket. Kort väg från E22.",
    level: "grundlistning",
    status: "publicerad",
    registeredDaysAgo: 18,
    services: [
      { name: "Sportmassage", price: 550, minutes: 45 },
      { name: "Sportmassage", price: 350, minutes: 25 },
    ],
  },
  {
    slug: "gullberna-frisyr",
    name: "Gullberna Frisyr",
    category: "frisor",
    area: "Gullberna",
    offset: [-0.0003, -0.0004],
    openingHours: "Mån–fre 9–17",
    description: "Herrfrisör med skäggtrimning. (Den här profilen väntar på granskning och ska inte synas publikt.)",
    level: "grundlistning",
    status: "vantar_granskning",
    registeredDaysAgo: 1,
    services: [
      { name: "Herrklippning", price: 395, minutes: 30 },
      { name: "Skäggtrimning", price: 195, minutes: 15 },
    ],
  },
];
