// Fast lista över kategorier. `slug` är värdet som sparas i databasen och
// används i URL:er (/kategori/massage). `schemaType` är typen i schema.org.

export const CATEGORIES = [
  {
    slug: "massage",
    name: "Massage",
    schemaType: "HealthAndBeautyBusiness",
  },
  {
    slug: "pt",
    name: "PT / Träning",
    schemaType: "ExerciseGym",
  },
  {
    slug: "frisor",
    name: "Frisör",
    schemaType: "HairSalon",
  },
  {
    slug: "kiropraktor",
    name: "Kiropraktor",
    schemaType: "Chiropractic",
  },
  {
    slug: "naprapat",
    name: "Naprapat",
    schemaType: "PhysicalTherapy",
  },
  {
    slug: "skonhet",
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
