// Mapsas logga: ordbilden "Mapsa" och symbolen (ett "M" under ett tak/en nål).
// Spårad till vektor från Mapsa UF:s logga så att den är skarp i alla
// storlekar. Färgen följer texten (currentColor). Vektordata: lib/brand-paths.ts.

import { MARK_PATH, MARK_VIEWBOX, WORD_PATH } from "@/lib/brand-paths";

// Hela loggan: ordbild till vänster, symbol till höger (samma avstånd som originalet).
const LOGO_VIEWBOX = "0 0 933.7 254.7";

export function MapsaLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} className={className} aria-hidden="true" fill="currentColor">
      <path transform="translate(0 31.2)" d={WORD_PATH} />
      <path transform="translate(668.9 0)" d={MARK_PATH} />
    </svg>
  );
}

/** Bara symbolen (t.ex. i runda knappar och ikoner). */
export function MapsaMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`} className={className} aria-hidden="true" fill="currentColor">
      <path d={MARK_PATH} />
    </svg>
  );
}
