"use client";

import { useState, type ReactNode } from "react";
import { PractitionerMap, type MapPoint } from "./practitioner-map";

// Mobil: flikar för Lista/Karta. Desktop (lg och uppåt): sida vid sida.

export function ResultsView({ list, points }: { list: ReactNode; points: MapPoint[] }) {
  const [tab, setTab] = useState<"lista" | "karta">("lista");

  const tabClass = (active: boolean) =>
    `flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
      active ? "bg-white shadow-sm" : "text-neutral-600"
    }`;

  return (
    <div>
      <div role="tablist" aria-label="Visa som" className="mt-4 flex rounded-lg bg-neutral-100 p-1 lg:hidden">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "lista"}
          onClick={() => setTab("lista")}
          className={tabClass(tab === "lista")}
        >
          Lista
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "karta"}
          onClick={() => setTab("karta")}
          className={tabClass(tab === "karta")}
        >
          Karta
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6">
        <div className={tab === "lista" ? "block" : "hidden lg:block"}>{list}</div>
        <div className={`${tab === "karta" ? "block" : "hidden lg:block"} mt-4 h-[70vh] lg:sticky lg:top-4 lg:h-[600px]`}>
          <PractitionerMap points={points} />
        </div>
      </div>
    </div>
  );
}
