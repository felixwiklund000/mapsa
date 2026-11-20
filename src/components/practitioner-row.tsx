import Link from "next/link";
import { getCategory } from "@/lib/categories";
import type { Practitioner } from "@/lib/db/practitioners";
import { CategoryDot } from "./category-dot";
import { PractitionerCover } from "./practitioner-cover";

export function lowestPrice(p: Practitioner): number | null {
  return p.services.length > 0 ? Math.min(...p.services.map((s) => s.priceSek)) : null;
}

export function formatPrice(sek: number): string {
  return `${sek.toLocaleString("sv-SE")} kr`;
}

// En rad i listan: liten bild, namn, "kategori · område", pris till höger.
// data-slug kopplar raden till kartnålen (nålen blir större vid hover/fokus).
// showTestLabel: märk raden som testdata (behövs bara när listan blandar
// riktiga utövare och testprofiler – annars står det en gång överst).
export function PractitionerRow({
  practitioner: p,
  showTestLabel = false,
}: {
  practitioner: Practitioner;
  showTestLabel?: boolean;
}) {
  const price = lowestPrice(p);

  return (
    <Link
      href={`/utovare/${p.slug}`}
      data-slug={p.slug}
      className="-mx-3 flex items-center gap-4 rounded-control px-3 py-3 transition-colors hover:bg-fill focus-visible:bg-fill active:bg-fill-hover"
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-control">
        <PractitionerCover name={p.name} imagePath={p.images[0]?.path} size="sm" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[1.0625rem] leading-snug font-bold tracking-[-0.01em]">{p.name}</p>
        <p className="text-small mt-0.5 flex items-center gap-1.5 text-muted">
          <CategoryDot slug={p.category} />
          <span className="truncate">
            {getCategory(p.category)?.name} · {p.area}
            {showTestLabel && p.isTestData && " · Testdata"}
          </span>
        </p>
      </div>
      {price !== null && (
        <p className="shrink-0 text-right leading-snug">
          <span className="text-small block text-muted">från</span>
          <span className="font-bold">{formatPrice(price)}</span>
        </p>
      )}
    </Link>
  );
}
