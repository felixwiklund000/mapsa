import Link from "next/link";
import { getCategory } from "@/lib/categories";
import type { Practitioner } from "@/lib/db/practitioners";
import { Photo } from "./photo";

export function lowestPrice(p: Practitioner): number | null {
  return p.services.length > 0 ? Math.min(...p.services.map((s) => s.priceSek)) : null;
}

export function formatPrice(sek: number): string {
  return `${sek.toLocaleString("sv-SE")} kr`;
}

// Rad i listan (som Ubers rader för bilval): 80 px hög, bild 64×64,
// titel 16/600, "Massage · Trossö" 14 grå, "fr. 395 kr" 16/600 till höger.
// data-slug kopplar raden till nålen på kartan; .is-selected sätts av HomeShell.
export function PractitionerRow({ practitioner: p }: { practitioner: Practitioner }) {
  const price = lowestPrice(p);
  return (
    <Link
      href={`/utovare/${p.slug}`}
      data-slug={p.slug}
      className="pressable -mx-2 flex h-20 items-center gap-4 rounded-lg px-2 hover:bg-fill [&.is-selected]:bg-fill [&.is-selected]:ring-2 [&.is-selected]:ring-ink [&.is-selected]:ring-inset"
    >
      <Photo src={p.images[0]?.path} alt={p.name} className="size-16 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{p.name}</p>
        <p className="truncate text-sm text-muted">
          {getCategory(p.category)?.name} · {p.area}
        </p>
      </div>
      {price !== null && <p className="shrink-0 font-semibold">fr. {formatPrice(price)}</p>}
    </Link>
  );
}
