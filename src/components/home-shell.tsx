"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { PractitionerMap, type MapPoint } from "./practitioner-map";

// Startsidans layout.
//
// Mobil:   kartan fyller skärmen, sökfältet flyter överst och listan ligger
//          i ett bottenark som dras mellan halv och hel höjd.
// Desktop: panel med sök och lista till vänster, karta till höger.
//
// Pekar man på en rad i listan blir motsvarande nål större.

type Snap = "half" | "full";

const SEARCH_AREA = 76; // sökfältets höjd + marginaler överst på kartan (px)

export function HomeShell({
  search,
  header,
  list,
  footer,
  points,
}: {
  search: ReactNode;
  header: ReactNode;
  list: ReactNode;
  footer: ReactNode;
  points: MapPoint[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [rootHeight, setRootHeight] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [snap, setSnap] = useState<Snap>("half");
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setRootHeight(el.clientHeight));
    ro.observe(el);
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  const halfHeight = Math.round(rootHeight * 0.5);
  const fullHeight = Math.max(halfHeight, rootHeight - SEARCH_AREA);
  const sheetHeight = dragHeight ?? (snap === "full" ? fullHeight : halfHeight);

  // --- Dra i arkets överdel ---
  // Rörelsen följs på hela fönstret, så att draget fortsätter även när
  // pekaren lämnar arket (mus) och klick inuti arket fungerar som vanligt.
  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (isDesktop || !rootHeight || (e.pointerType === "mouse" && e.button !== 0)) return;
    const start = { x: e.clientX, y: e.clientY, h: sheetHeight };
    let active = false;
    const min = halfHeight * 0.75;

    const move = (ev: globalThis.PointerEvent) => {
      const dy = ev.clientY - start.y;
      const dx = ev.clientX - start.x;
      if (!active) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) return stop(); // sidledes: kategoriraden scrollar
        if (Math.abs(dy) < 6) return;
        active = true;
      }
      setDragHeight(Math.min(fullHeight, Math.max(min, start.h - dy)));
    };
    const end = (ev: globalThis.PointerEvent) => {
      stop();
      if (!active) return;
      const moved = start.y - ev.clientY; // positivt = uppåt
      if (moved > 40) setSnap("full");
      else if (moved < -40) setSnap("half");
      setDragHeight(null);
      // Draget ska inte räknas som ett klick på knappen/länken under fingret.
      const swallow = (c: MouseEvent) => {
        c.preventDefault();
        c.stopPropagation();
      };
      window.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  // --- Koppla rader i listan till nålar ---
  function slugFrom(target: EventTarget | null) {
    return target instanceof Element ? (target.closest("[data-slug]")?.getAttribute("data-slug") ?? null) : null;
  }

  const insets = isDesktop
    ? { top: 48, bottom: 48, left: 48, right: 48 }
    : { top: SEARCH_AREA + 8, bottom: halfHeight + 16 };

  return (
    <div
      ref={rootRef}
      className="relative h-[calc(100dvh-3.5rem-env(safe-area-inset-top))] overflow-hidden lg:grid lg:grid-cols-[30rem_minmax(0,1fr)] xl:grid-cols-[34rem_minmax(0,1fr)]"
    >
      {/* Karta (zoomknappar bara på desktop – på mobil zoomar man med fingrarna) */}
      <div className="absolute inset-0 z-0 max-lg:[&_.leaflet-control-zoom]:hidden lg:static lg:order-2">
        {rootHeight > 0 && (
          <PractitionerMap points={points} activeSlug={selected ?? hovered} onSelect={setSelected} insets={insets} />
        )}
      </div>

      {/* Panel (desktop) / sök + bottenark (mobil) */}
      <div className="max-lg:contents lg:order-1 lg:h-full lg:overflow-y-auto lg:border-r lg:border-line">
        <div className="absolute inset-x-3 top-3 z-10 lg:static lg:px-8 lg:pt-8">{search}</div>

        <section
          aria-label="Utövare"
          style={{ "--sheet-h": rootHeight ? `${sheetHeight}px` : undefined } as React.CSSProperties}
          className={`absolute inset-x-0 bottom-0 z-20 flex h-[var(--sheet-h,50%)] flex-col rounded-t-2xl border-t border-line bg-canvas lg:static lg:h-auto lg:rounded-none lg:border-0 ${
            dragHeight === null ? "transition-[height] duration-300 ease-out" : ""
          }`}
        >
          <div
            className="shrink-0 touch-none px-4 pb-3 select-none lg:touch-auto lg:px-8 lg:pt-8 lg:pb-4"
            onPointerDown={onPointerDown}
          >
            <button
              type="button"
              onClick={() => setSnap(snap === "full" ? "half" : "full")}
              aria-expanded={snap === "full"}
              aria-label={snap === "full" ? "Visa mer av kartan" : "Visa fler utövare"}
              className="mx-auto flex h-6 w-16 items-center justify-center lg:hidden"
            >
              <span className="h-1 w-10 rounded-full bg-fill-hover" />
            </button>
            {header}
          </div>

          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:overflow-visible lg:px-8"
            onMouseOver={(e) => setHovered(slugFrom(e.target))}
            onMouseLeave={() => setHovered(null)}
            onFocus={(e) => setHovered(slugFrom(e.target))}
            onBlur={() => setHovered(null)}
          >
            {list}
            {footer}
          </div>
        </section>
      </div>
    </div>
  );
}
