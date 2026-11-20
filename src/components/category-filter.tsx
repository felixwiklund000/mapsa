import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { filtersToHref, toggleCategoryHref, type Filters } from "@/lib/search";
import { CategoryDot } from "./category-dot";

// Kategorier som filterknappar (flerval). Grå, vald = svart.
// Scrollar i sidled på mobil (touch-action: pan-x så att bottenarket kan
// dras uppåt/nedåt även med fingret på knapparna).

const base =
  "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[0.9375rem] font-medium whitespace-nowrap transition-colors lg:h-10";
const off = "bg-fill text-ink hover:bg-fill-hover";
const on = "bg-ink text-on-ink";

export function CategoryFilter({ filters }: { filters?: Filters }) {
  const selected = filters?.categories ?? [];
  const allHref = filters ? filtersToHref({ ...filters, categories: [] }) : "/";

  return (
    <nav aria-label="Kategorier">
      <ul className="scrollbar-none -mx-4 flex touch-pan-x gap-2 overflow-x-auto px-4 lg:-mx-8 lg:flex-wrap lg:px-8">
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
                <CategoryDot slug={c.slug} />
                {c.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
