import Link from "next/link";
import { getCategory } from "@/lib/categories";
import type { Practitioner } from "@/lib/db/practitioners";
import { CategoryIcon, categoryVars } from "./category-icon";
import { PractitionerCover } from "./practitioner-cover";
import { LevelBadge, TestDataBadge } from "./ui/badges";

export function lowestPrice(p: Practitioner): number | null {
  return p.services.length > 0 ? Math.min(...p.services.map((s) => s.priceSek)) : null;
}

export function formatPrice(sek: number): string {
  return `${sek.toLocaleString("sv-SE")} kr`;
}

export function PractitionerCard({ practitioner: p }: { practitioner: Practitioner }) {
  const category = getCategory(p.category);
  const v = categoryVars(p.category);
  const price = lowestPrice(p);
  const vip = p.level === "vip";

  return (
    <Link
      href={`/utovare/${p.slug}`}
      className={`group flex h-full flex-col rounded-card bg-surface p-2 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift active:translate-y-0 active:scale-[0.99] ${
        vip ? "ring-1 ring-gold-line" : ""
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-media sm:aspect-[4/3]">
        <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]">
          <PractitionerCover category={p.category} imagePath={p.images[0]?.path} alt={p.name} />
        </div>
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <LevelBadge level={p.level} className="shadow-card" />
          {p.isTestData && <TestDataBadge className="ml-auto" />}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-2.5 pt-3.5 pb-2.5">
        <h3 className="text-card-title text-ink">{p.name}</h3>
        <p className="text-meta mt-1 flex items-center gap-1.5">
          <CategoryIcon slug={p.category} className="size-3.5 shrink-0" strokeWidth={2.25} style={{ color: v.color }} />
          <span className="truncate">
            {category?.name} · {p.area}
          </span>
        </p>
        {price !== null && (
          <p className="mt-auto pt-3 text-[0.9375rem] text-ink-muted">
            från <span className="font-semibold text-ink">{formatPrice(price)}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
