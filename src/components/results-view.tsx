"use client";

import { useState, type ReactNode } from "react";
import { List, Map as MapIcon } from "lucide-react";
import { PractitionerMap, type MapPoint } from "./practitioner-map";

// Mobil: segmentknapp Lista/Karta. Desktop (lg+): kort till vänster,
// sticky karta till höger.

export function ResultsView({ list, points }: { list: ReactNode; points: MapPoint[] }) {
  const [tab, setTab] = useState<"lista" | "karta">("lista");

  const tabClass = (active: boolean) =>
    `inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
      active ? "bg-surface text-ink shadow-card" : "text-ink-muted hover:text-ink"
    }`;

  return (
    <div>
      <div role="tablist" aria-label="Visa som" className="mb-5 flex rounded-full bg-sunken p-1 lg:hidden">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "lista"}
          onClick={() => setTab("lista")}
          className={tabClass(tab === "lista")}
        >
          <List className="size-4" aria-hidden /> Lista
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "karta"}
          onClick={() => setTab("karta")}
          className={tabClass(tab === "karta")}
        >
          <MapIcon className="size-4" aria-hidden /> Karta
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
        <div className={tab === "lista" ? "block" : "hidden lg:block"}>{list}</div>
        <div
          className={`${tab === "karta" ? "block" : "hidden lg:block"} relative isolate z-0 h-[68vh] overflow-hidden rounded-card shadow-card ring-1 ring-line lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:max-h-[720px]`}
        >
          <PractitionerMap points={points} />
        </div>
      </div>
    </div>
  );
}
