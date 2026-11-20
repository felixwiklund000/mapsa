"use client";

import { useState, type ReactNode } from "react";
import { List, Map as MapIcon } from "lucide-react";
import { PractitionerMap, type MapPoint } from "./practitioner-map";

// Desktop (lg+): lista till vänster, karta till höger.
// Mobil: listan först. En flytande knapp växlar till kartan och tillbaka.

export function ResultsView({ list, points }: { list: ReactNode; points: MapPoint[] }) {
  const [view, setView] = useState<"lista" | "karta">("lista");
  const showMap = view === "karta";

  // Utan träffar har kartan inget att visa – då får listan (tomt läge) hela bredden.
  if (points.length === 0) return <div>{list}</div>;

  return (
    <div className="relative">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <div className={showMap ? "hidden lg:block" : "block"}>{list}</div>
        <div
          className={`${showMap ? "block" : "hidden lg:block"} relative isolate z-0 h-[calc(100svh-12rem)] min-h-96 overflow-hidden rounded-media border border-line lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:max-h-[760px]`}
        >
          <PractitionerMap points={points} />
        </div>
      </div>

      {/* Växla lista/karta på mobil */}
      <div className="pointer-events-none sticky bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 mt-6 flex justify-center lg:hidden">
        <button
          type="button"
          onClick={() => setView(showMap ? "lista" : "karta")}
          className="pointer-events-auto inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-canvas shadow-pop active:scale-[0.97]"
        >
          {showMap ? <List className="size-4" aria-hidden /> : <MapIcon className="size-4" aria-hidden />}
          {showMap ? "Visa lista" : "Visa karta"}
        </button>
      </div>
    </div>
  );
}
