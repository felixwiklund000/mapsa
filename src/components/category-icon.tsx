import { Activity, Bone, Droplet, Dumbbell, Scissors, Waves, type LucideIcon } from "lucide-react";
import { getCategory, type CategorySlug } from "@/lib/categories";
import { MapsaMark } from "./brand";

// Ikon per kategori (används när ett foto saknas – aldrig en grå ruta).
const ICONS: Record<CategorySlug, LucideIcon> = {
  massage: Waves,
  pt: Dumbbell,
  frisor: Scissors,
  kiropraktor: Bone,
  naprapat: Activity,
  skonhet: Droplet,
};

/** Kategori-ikon på kategorins ljusa ton. Fyller ytan den får (className). */
export function CategoryTile({ category, label, className = "" }: { category?: string; label: string; className?: string }) {
  const c = category ? getCategory(category) : undefined;
  if (!c) {
    return (
      <div role="img" aria-label={label} className={`flex items-center justify-center bg-[#f2efe8] text-[#b5ad9f] ${className}`}>
        <MapsaMark className="w-2/5 max-w-12" />
      </div>
    );
  }
  const Icon = ICONS[c.slug];
  return (
    <div role="img" aria-label={label} className={`flex items-center justify-center ${className}`} style={{ background: c.tone.bg, color: c.tone.fg }}>
      <Icon className="size-1/2 max-h-12 max-w-12" strokeWidth={1.75} aria-hidden />
    </div>
  );
}
