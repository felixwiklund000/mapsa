"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import Link from "next/link";
import { animate, useMotionValue, useReducedMotion, useTransform, motion } from "motion/react";
import { Logo } from "./site-header";
import { PractitionerMap, type MapPoint } from "./practitioner-map";

// Startsidans layout (se docs/design-spec.md).
//
// Mobil:   ingen header, kartan fyller skärmen, sökfältet flyter överst och
//          listan ligger i ett bottenark med tre lägen: 25 / 50 / 90 %.
// Desktop: panel till vänster (logga, sök, rubrik, filter, lista), karta till höger.
//
// Klick på en rad väljer utövaren: raden markeras, nålen blir vald och
// kartan glider dit. Knappen "Visa …" (eller ett andra klick) öppnar profilen.

const SNAPS = [0.25, 0.5, 0.9];
const SEARCH_AREA = 92; // 16 (marginal) + 60 (sökfält) + 16 (luft)

export type ShellItem = MapPoint & { href: string };

export function HomeShell({
  search,
  header,
  list,
  footer,
  items,
}: {
  search: ReactNode;
  header: ReactNode;
  list: ReactNode;
  footer: ReactNode;
  items: ShellItem[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [rootHeight, setRootHeight] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [snap, setSnap] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const sheetHeight = useMotionValue(0);
  const sheetHeightCss = useTransform(sheetHeight, (h) => (h > 0 ? `${h}px` : "50dvh"));

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

  // Glid till valt läge (fjäder), eller hoppa direkt vid reducerad rörelse.
  useEffect(() => {
    if (!rootHeight) return;
    const target = rootHeight * SNAPS[snap];
    if (sheetHeight.get() === 0 || reduceMotion) {
      sheetHeight.set(target);
      return;
    }
    const controls = animate(sheetHeight, target, { type: "spring", stiffness: 380, damping: 38 });
    return () => controls.stop();
  }, [rootHeight, snap, reduceMotion, sheetHeight]);

  // En vald utövare som inte längre finns bland träffarna räknas som ovald.
  const selectedItem = items.find((i) => i.slug === selected) ?? null;
  const activeSlug = selectedItem?.slug ?? null;

  // Markera vald rad och se till att den syns (knappen längst ner tar plats).
  useEffect(() => {
    let selectedRow: HTMLElement | null = null;
    listRef.current?.querySelectorAll<HTMLElement>("[data-slug]").forEach((row) => {
      const on = row.dataset.slug === activeSlug;
      row.classList.toggle("is-selected", on);
      // Listan finns både som rader (mobil) och kort (desktop) – välj den som syns.
      if (on && row.offsetParent !== null) selectedRow = row;
    });
    (selectedRow as HTMLElement | null)?.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  }, [activeSlug, items, reduceMotion]);

  function select(slug: string) {
    setSelected(slug);
    if (!isDesktop && snap === 0) setSnap(1); // gör plats för raden och knappen
  }

  // Klick på rad: första klicket väljer, ett klick på redan vald rad öppnar profilen.
  function onListClick(e: MouseEvent<HTMLDivElement>) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const row = (e.target as Element).closest<HTMLElement>("[data-slug]");
    const slug = row?.dataset.slug;
    if (!slug || slug === activeSlug) return;
    e.preventDefault();
    select(slug);
  }

  // --- Dra i arket (mobil) ---
  function startDrag(e: PointerEvent<HTMLElement>, fromList: boolean) {
    if (isDesktop || !rootHeight) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (fromList && snap === SNAPS.length - 1) return; // i helt läge scrollar listan i stället
    const startY = e.clientY;
    const startX = e.clientX;
    const startH = sheetHeight.get();
    const min = rootHeight * SNAPS[0];
    const max = rootHeight * SNAPS[SNAPS.length - 1];
    let active = false;
    let last = { y: startY, t: e.timeStamp };
    let velocity = 0; // px/ms, positivt = nedåt

    const move = (ev: globalThis.PointerEvent) => {
      const dy = ev.clientY - startY;
      if (!active) {
        if (Math.abs(ev.clientX - startX) > 8 && Math.abs(ev.clientX - startX) > Math.abs(dy)) return stop();
        if (Math.abs(dy) < 6) return;
        active = true;
      }
      const dt = Math.max(1, ev.timeStamp - last.t);
      velocity = (ev.clientY - last.y) / dt;
      last = { y: ev.clientY, t: ev.timeStamp };
      const h = startH - dy;
      // Lätt motstånd utanför yttersta lägena.
      sheetHeight.set(h < min ? min - (min - h) * 0.25 : h > max ? max + (h - max) * 0.25 : h);
    };
    const end = () => {
      stop();
      if (!active) return;
      const projected = sheetHeight.get() - velocity * 200;
      let nearest = 0;
      SNAPS.forEach((s, i) => {
        if (Math.abs(rootHeight * s - projected) < Math.abs(rootHeight * SNAPS[nearest] - projected)) nearest = i;
      });
      setSnap(nearest);
      animate(
        sheetHeight,
        rootHeight * SNAPS[nearest],
        reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 38, velocity: -velocity * 1000 },
      );
      // Draget ska inte räknas som ett klick på raden/knappen under fingret.
      const swallow = (c: globalThis.MouseEvent) => {
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

  const snapHeight = rootHeight * SNAPS[snap];
  const insets = isDesktop
    ? { top: 0, bottom: 0, left: 0, right: 0 }
    : { top: SEARCH_AREA, bottom: Math.min(snapHeight, rootHeight * SNAPS[1]), left: 0, right: 0 };
  const fullOpen = snap === SNAPS.length - 1;

  return (
    <div
      ref={rootRef}
      className="relative h-dvh overflow-hidden lg:grid lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]"
    >
      {/* Karta */}
      <div className="absolute inset-0 z-0 lg:static lg:order-2">
        {rootHeight > 0 && (
          <PractitionerMap
            points={items}
            selectedSlug={activeSlug}
            highlightSlug={isDesktop ? hovered : null}
            onSelect={select}
            insets={insets}
            showZoom={isDesktop}
          />
        )}
      </div>

      {/* Panel (desktop) / flytande sök + bottenark (mobil) */}
      <div className="max-lg:contents lg:order-1 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-line">
        <div className="absolute inset-x-4 top-[max(16px,env(safe-area-inset-top))] z-10 lg:static lg:shrink-0 lg:px-8 lg:pt-6">
          <div className="hidden lg:mb-6 lg:flex lg:items-center lg:justify-between">
            <Logo />
            <Link href="/foretag" className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-fill hover:text-ink">
              För företag
            </Link>
          </div>
          {search}
        </div>

        <motion.section
          aria-label="Utövare"
          style={{ "--sheet-h": sheetHeightCss } as never}
          className="absolute inset-x-0 bottom-0 z-20 flex h-[var(--sheet-h)] flex-col rounded-t-2xl bg-canvas shadow-sheet lg:static lg:h-auto lg:min-h-0 lg:flex-1 lg:rounded-none lg:shadow-none"
        >
          <div
            className="shrink-0 touch-none px-4 pb-4 select-none lg:touch-auto lg:px-8 lg:pt-6"
            onPointerDown={(e) => startDrag(e, false)}
          >
            <button
              type="button"
              onClick={() => setSnap(fullOpen ? 1 : SNAPS.length - 1)}
              aria-expanded={fullOpen}
              aria-label={fullOpen ? "Visa mer av kartan" : "Visa fler utövare"}
              className="mx-auto flex h-6 w-16 items-center justify-center lg:hidden"
            >
              <span className="h-1 w-8 rounded-full bg-line" />
            </button>
            {header}
          </div>

          <div
            ref={listRef}
            className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 lg:px-8 ${fullOpen ? "touch-pan-y" : "max-lg:touch-none"}`}
            onPointerDown={(e) => startDrag(e, true)}
            onClickCapture={onListClick}
            onMouseOver={(e) => setHovered((e.target as Element).closest<HTMLElement>("[data-slug]")?.dataset.slug ?? null)}
            onMouseLeave={() => setHovered(null)}
          >
            {list}
            {footer}
          </div>

          {selectedItem && (
            <div className="shrink-0 border-t border-line px-4 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] lg:px-8">
              <Link href={selectedItem.href} className="btn-primary w-full">
                <span className="truncate">Visa {selectedItem.name}</span>
              </Link>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
