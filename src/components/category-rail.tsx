import Link from "next/link";
import { Check } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import type { Practitioner } from "@/lib/db/practitioners";
import { toggleCategoryHref, type Filters } from "@/lib/search";
import { CategoryIcon, categoryVars } from "./category-icon";

// Kategorier: horisontellt scrollbar rad på mobil, rutnät på desktop.
// Varje kort slår på/av kategorin som filter (flerval).

export function CategoryRail({
  filters,
  practitioners,
}: {
  filters?: Filters;
  practitioners?: Practitioner[];
}) {
  return (
    <nav aria-label="Kategorier">
      <ul className="scrollbar-none -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 py-2 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-4 lg:overflow-visible lg:px-0">
        {CATEGORIES.map((c) => {
          const v = categoryVars(c.slug);
          const count = practitioners?.filter((p) => p.category === c.slug).length;
          const active = filters?.categories.includes(c.slug) ?? false;
          const href = filters ? toggleCategoryHref(filters, c.slug) : `/?kategori=${c.slug}`;
          return (
            <li key={c.slug} className="w-[9.5rem] shrink-0 snap-start lg:w-auto">
              <Link
                href={href}
                aria-pressed={active}
                scroll={false}
                className="group relative flex h-full flex-col gap-4 rounded-card bg-surface p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0 active:scale-[0.98]"
                style={active ? { boxShadow: `0 0 0 2px ${v.color}, var(--shadow-lift)` } : undefined}
              >
                <span
                  className="flex size-11 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105"
                  style={{ backgroundColor: v.soft, color: v.color }}
                >
                  <CategoryIcon slug={c.slug} className="size-5.5" strokeWidth={2} />
                </span>
                <span>
                  <span className="block font-display text-[0.9375rem] font-bold leading-tight tracking-[-0.01em] text-ink">
                    {c.name}
                  </span>
                  <span className="text-meta mt-0.5 block">
                    {count === undefined ? "\u00a0" : `${count} utövare`}
                  </span>
                </span>
                {active && (
                  <span
                    className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: v.color }}
                  >
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
