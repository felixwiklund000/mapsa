// Sök och filter för startsidan. Filtren ligger i URL:en
// (?q=trossö&kategori=massage&kategori=pt) så att en sökning går att dela och
// fungerar utan JavaScript. (Inget områdesfilter – kartan visar området.)

import { isCategorySlug, type CategorySlug, getCategory } from "./categories.ts";
import type { Practitioner } from "./db/practitioners.ts";

export type Filters = {
  q: string;
  categories: CategorySlug[];
};

type RawParams = Record<string, string | string[] | undefined>;

function asArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseFilters(params: RawParams): Filters {
  const q = (asArray(params.q)[0] ?? "").trim().slice(0, 100);
  const categories = [...new Set(asArray(params.kategori).filter(isCategorySlug))];
  return { q, categories };
}

function normalize(s: string): string {
  return s.toLocaleLowerCase("sv-SE").normalize("NFC");
}

/** Texten som fritextsökningen letar i för en utövare. */
function searchableText(p: Practitioner): string {
  return normalize(
    [
      p.name,
      p.area,
      p.address ?? "",
      p.description ?? "",
      getCategory(p.category)?.name ?? "",
      ...p.services.map((s) => s.name),
    ].join(" "),
  );
}

/** Alla ord i sökningen måste finnas någonstans hos utövaren. */
function matchesQuery(p: Practitioner, q: string): boolean {
  const words = normalize(q).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const text = searchableText(p);
  return words.every((w) => text.includes(w));
}

export function filterPractitioners(
  practitioners: Practitioner[],
  filters: Filters,
  options: { ignoreCategories?: boolean } = {},
): Practitioner[] {
  return practitioners.filter(
    (p) =>
      matchesQuery(p, filters.q) &&
      (options.ignoreCategories || filters.categories.length === 0 || filters.categories.includes(p.category)),
  );
}

/** Bygger en startsidelänk med givna filter (tomma värden utelämnas). */
export function filtersToHref(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  for (const c of filters.categories) params.append("kategori", c);
  const qs = params.toString();
  return qs ? `/karta?${qs}` : "/karta";
}

/** Länk som slår på/av en kategori men behåller övriga filter. */
export function toggleCategoryHref(filters: Filters, slug: CategorySlug): string {
  const categories = filters.categories.includes(slug)
    ? filters.categories.filter((c) => c !== slug)
    : [...filters.categories, slug];
  return filtersToHref({ ...filters, categories });
}
