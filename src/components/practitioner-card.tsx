import Link from "next/link";
import { getCategory } from "@/lib/categories";
import type { Practitioner } from "@/lib/db/practitioners";
import { PractitionerCover } from "./practitioner-cover";

export function lowestPrice(p: Practitioner): number | null {
  return p.services.length > 0 ? Math.min(...p.services.map((s) => s.priceSek)) : null;
}

export function formatPrice(sek: number): string {
  return `${sek.toLocaleString("sv-SE")} kr`;
}

// Kort: bild, namn, kategori · område, pris. Inget mer.
// (Testprofiler märks med en liten grå text tills de tas bort före lansering.)
export function PractitionerCard({ practitioner: p }: { practitioner: Practitioner }) {
  const price = lowestPrice(p);

  return (
    <Link href={`/utovare/${p.slug}`} className="group block rounded-media outline-offset-4 active:opacity-80">
      <div className="aspect-[3/2] overflow-hidden rounded-media">
        <PractitionerCover
          name={p.name}
          imagePath={p.images[0]?.path}
          className="transition-transform duration-300 ease-out group-hover:scale-[1.02]"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="font-semibold text-ink underline-offset-2 group-hover:underline">{p.name}</h3>
        {p.isTestData && <span className="text-xs text-faint">Testdata</span>}
      </div>
      <p className="text-small text-muted">
        {getCategory(p.category)?.name} · {p.area}
      </p>
      {price !== null && <p className="text-small mt-1 text-ink">från {formatPrice(price)}</p>}
    </Link>
  );
}
