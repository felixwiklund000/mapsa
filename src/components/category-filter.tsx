import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { filtersToHref, toggleCategoryHref, type Filters } from "@/lib/search";
import { AreaChip } from "./area-chip";

// Filter: område + kategorier (flerval). Chips 36 px, #F3F3F3, 14/600.
// Vald = svart. Scrollar i sidled på mobil (touch-pan-x låter bottenarket
// dras uppåt/nedåt även med fingret på knapparna).

const chip = "pressable inline-flex h-9 shrink-0 items-center rounded-lg px-3 text-sm font-semibold whitespace-nowrap";
const off = "bg-fill text-ink hover:bg-line";
const on = "bg-ink text-canvas";

export function CategoryFilter({ filters }: { filters?: Filters }) {
  const selected = filters?.categories ?? [];
  const allHref = filters ? filtersToHref({ ...filters, categories: [] }) : "/";

  return (
    <nav aria-label="Filter">
      <ul className="scrollbar-none -mx-4 flex touch-pan-x gap-2 overflow-x-auto px-4 lg:-mx-8 lg:flex-wrap lg:px-8">
        <li>
          <AreaChip filters={filters} />
        </li>
        <li>
          <Link
            href={allHref}
            scroll={false}
            aria-current={selected.length === 0 ? "true" : undefined}
            className={`${chip} ${selected.length === 0 ? on : off}`}
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
                className={`${chip} ${active ? on : off}`}
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
