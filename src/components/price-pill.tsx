import type { CSSProperties } from "react";

// Prislappen ("250 kr"): liten pill i accentfärgen, mörk och lite större när
// den är vald. Samma lapp används på kartan (practitioner-map.tsx bygger
// exakt den här markupen för MapLibre) och på ön på startsidan.
// Utseendet finns i .mapsa-pin i design-system.css.

export const PRICE_PILL_CLASS = "mapsa-pin";

export function PricePill({
  label,
  active = false,
  className = "",
  style,
}: {
  label: string;
  active?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`${PRICE_PILL_CLASS}${active ? " is-active" : ""} ${className}`} style={style}>
      {label}
    </span>
  );
}
