"use client";

import { useEffect, useRef, useState } from "react";
import { CategoryTile } from "./category-icon";

// Foto av en utövare. Saknas bilden (eller går inte att ladda) visas
// kategorins ikon på en färgad bakgrund – aldrig en grå ruta eller trasig bild.
export function Photo({
  src,
  alt,
  category,
  className = "",
  eager = false,
}: {
  src?: string | null;
  alt: string;
  /** Kategori-slug – styr ikonen och färgen när bild saknas. */
  category?: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // En bild som misslyckades redan innan sidan blev interaktiv ger inget
  // onError-anrop – kontrollera därför en gång efter laddning.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (!src || failed) return <CategoryTile category={category} label={alt} className={className} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- lokala/uppladdade foton
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className={`bg-[#f2efe8] object-cover text-transparent ${className}`}
    />
  );
}
