import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { filtersToHref, toggleCategoryHref, type Filters } from "@/lib/search";

// Kategorier som filterknappar. "Alla" nollställer, övriga slås på/av
// (flerval). Scrollar i sidled på mobil.

const base =
  "inline-flex h-11 shrink-0 items-center rounded-control border px-4 text-[0.9375rem] whitespace-nowrap transition-colors sm:h-10";
const off = "border-line-strong text-ink hover:border-ink active:bg-subtle";
const on = "border-ink bg-ink font-medium text-canvas";

export function CategoryFilter({ filters }: { filters?: Filters }) {
  const selected = filters?.categories ?? [];
  const allHref = filters ? filtersToHref({ ...filters, categories: [] }) : "/";

  return (
    <nav aria-label="Kategorier">
      <ul className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-wrap lg:px-0">
        <li>
          <Link
            href={allHref}
            scroll={false}
            aria-current={selected.length === 0 ? "true" : undefined}
            className={`${base} ${selected.length === 0 ? on : off}`}
          >
            Alla
          </Link>
        </li>
        {CATEGORIES.map((c) => {
          const active = selected.includes(c.slug);
          return (
            <li key={c.slug}>
              <Link
                href={filters ? toggleCategoryHref(filters, c.slug) : `/?kategori=${c.slug}`}
                scroll={false}
                aria-pressed={active}
                className={`${base} ${active ? on : off}`}
              >
                {c.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
