"use client";

import { useEffect, useRef, useState } from "react";

// Foto av en utövare. Saknas bilden (eller går inte att ladda) visas en tom
// grå yta – aldrig en bokstav, ikon eller trasig bild.
export function Photo({
  src,
  alt,
  className = "",
  eager = false,
}: {
  src?: string | null;
  alt: string;
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

  if (!src || failed) return <div role="img" aria-label={alt} className={`bg-fill ${className}`} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- lokala/uppladdade foton
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className={`bg-fill object-cover text-transparent ${className}`}
    />
  );
}
