// Fast lista över kategorier. `slug` är värdet som sparas i databasen och
// används i URL:er (/kategori/massage). `schemaType` är typen i schema.org.
// `tone` används bara när ett foto saknas (kategori-ikon på färgad bakgrund).

export const CATEGORIES = [
  {
    slug: "massage",
    name: "Massage",
    schemaType: "HealthAndBeautyBusiness",
    tone: { bg: "#e3efec", fg: "#3f8577" },
  },
  {
    slug: "pt",
    name: "PT / Träning",
    schemaType: "ExerciseGym",
    tone: { bg: "#e4ebf5", fg: "#4472b0" },
  },
  {
    slug: "frisor",
    name: "Frisör",
    schemaType: "HairSalon",
    tone: { bg: "#f3e5ec", fg: "#a8517e" },
  },
  {
    slug: "kiropraktor",
    name: "Kiropraktor",
    schemaType: "Chiropractic",
    tone: { bg: "#ece8f7", fg: "#7d63c9" },
  },
  {
    slug: "naprapat",
    name: "Naprapat",
    schemaType: "PhysicalTherapy",
    tone: { bg: "#e7efe1", fg: "#5e8f42" },
  },
  {
    slug: "skonhet",
    name: "Skönhet / Hud",
    schemaType: "BeautySalon",
    tone: { bg: "#f5e6e4", fg: "#b3524a" },
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
