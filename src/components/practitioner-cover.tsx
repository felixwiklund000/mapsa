import type { CategorySlug } from "@/lib/categories";
import { CategoryIcon, categoryVars } from "./category-icon";

// Bildyta för en utövare: riktig bild om den finns, annars en platshållare
// med mjuk pastellgradient i kategorins ton och ikonen i en fylld vit cirkel.

export function PractitionerCover({
  category,
  imagePath,
  alt,
  className = "",
  size = "md",
}: {
  category: CategorySlug;
  imagePath?: string | null;
  alt: string;
  className?: string;
  size?: "md" | "lg";
}) {
  if (imagePath) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- uppladdade bilder optimeras senare
      <img src={imagePath} alt={alt} className={`h-full w-full object-cover ${className}`} />
    );
  }

  const c = categoryVars(category);
  const large = size === "lg";
  return (
    <div
      role="img"
      aria-label={`${alt} – ingen bild uppladdad än`}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundImage: `linear-gradient(140deg, ${c.soft} 0%, ${c.soft2} 100%)` }}
    >
      {/* Svagt prickmönster som knyter an till kartrutnätet i headern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `radial-gradient(color-mix(in srgb, ${c.color} 22%, transparent) 1.2px, transparent 1.2px)`,
          backgroundSize: "16px 16px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />
      <span
        className={`relative flex items-center justify-center rounded-full bg-surface shadow-card ${
          large ? "size-24" : "size-16"
        }`}
      >
        <CategoryIcon slug={category} className={large ? "size-10" : "size-7"} strokeWidth={2} style={{ color: c.color }} />
      </span>
    </div>
  );
}
