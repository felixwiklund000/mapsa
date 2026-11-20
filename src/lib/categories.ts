// Fast lista över kategorier. `slug` är värdet som sparas i databasen och
// används i URL:er (/kategori/massage). `dot` är färgen på kategorins lilla
// prick – den enda färgen i gränssnittet. `schemaType` är typen i schema.org.

export const CATEGORIES = [
  {
    slug: "massage",
    dot: "#3f8577",
    name: "Massage",
    schemaType: "HealthAndBeautyBusiness",
  },
  {
    slug: "pt",
    dot: "#4472b0",
    name: "PT / Träning",
    schemaType: "ExerciseGym",
  },
  {
    slug: "frisor",
    dot: "#a8517e",
    name: "Frisör",
    schemaType: "HairSalon",
  },
  {
    slug: "kiropraktor",
    dot: "#7d63c9",
    name: "Kiropraktor",
    schemaType: "Chiropractic",
  },
  {
    slug: "naprapat",
    dot: "#5e8f42",
    name: "Naprapat",
    schemaType: "PhysicalTherapy",
  },
  {
    slug: "skonhet",
    dot: "#b3524a",
    name: "Skönhet / Hud",
    schemaType: "BeautySalon",
  },
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CategorySlug = Category["slug"];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function isCategorySlug(value: string): value is CategorySlug {
  return CATEGORIES.some((c) => c.slug === value);
}
