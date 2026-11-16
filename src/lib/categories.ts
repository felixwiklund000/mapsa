// Fast lista över kategorier. `slug` är värdet som sparas i databasen och
// används i URL:er (/kategori/massage). Färgen används ENDAST som markör
// (prick, ikoncirkel, badge) – aldrig som yta.

export const CATEGORIES = [
  {
    slug: "massage",
    name: "Massage",
    color: "#3f8577",
    schemaType: "HealthAndBeautyBusiness",
  },
  {
    slug: "pt",
    name: "PT / Träning",
    color: "#4472b0",
    schemaType: "ExerciseGym",
  },
  {
    slug: "frisor",
    name: "Frisör",
    color: "#a8517e",
    schemaType: "HairSalon",
  },
  {
    slug: "kiropraktor",
    name: "Kiropraktor",
    color: "#7d63c9",
    schemaType: "Chiropractic",
  },
  {
    slug: "naprapat",
    name: "Naprapat",
    color: "#5e8f42",
    schemaType: "PhysicalTherapy",
  },
  {
    slug: "skonhet",
    name: "Skönhet / Hud",
    color: "#b3524a",
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
