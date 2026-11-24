"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { animate, useMotionValue, useReducedMotion, useTransform, motion } from "motion/react";
import { Logo } from "./site-header";
import Link from "next/link";
import { SiteMenu } from "./site-menu";
import { PractitionerMap, type MapPoint } from "./practitioner-map";
import { SelectedCard, type CardItem } from "./selected-card";
import { MapLoading } from "./map-loading";

// Startsidans layout (se docs/design-spec.md).
//
// Mobil:   ingen header, kartan fyller skärmen, sökfältet flyter överst och
//          listan ligger i ett bottenark: ihopfällt som standard ("N utövare"
//          + kategorier, högst 40 % av höjden), dras upp för hela listan.
// Desktop: smal panel till vänster (380 px: logga, sök, rubrik, filter,
//          lista), karta till höger. Inget bottenark.
//
// Tryck på en prislapp eller en rad väljer utövaren: prislappen markeras och
// ett kort med Boka ersätter listan (prislapp → Boka = 2 tryck). Kortet
// stängs med ✕, tryck på kartan, Esc eller svep ner. Kartan zoomar aldrig vid val.

const EXPANDED = 0.9; // uppdraget ark: andel av höjden
const MAX_COLLAPSED = 0.4; // ihopfällt ark får aldrig täcka mer än så

export type ShellItem = MapPoint & CardItem;

/** Skriv ?vald=<slug> i adressfältet (delbar länk) utan att ladda om sidan. */
function syncUrl(slug: string | null) {
  try {
    const params = new URLSearchParams(window.location.search);
    if (slug) params.set("vald", slug);
    else params.delete("vald");
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  } catch {
    // adressfältet är bara en bekvämlighet
  }
}

export function HomeShell({
  search,
  header,
  list,
  footer,
  items,
  initialSelected = null,
  mapPlaceholder = false,
}: {
  search: ReactNode;
  header: ReactNode;
  list: ReactNode;
  footer: ReactNode;
  items: ShellItem[];
  /** Utövare att visa kortet för direkt (från ?vald= i länken). */
  initialSelected?: string | null;
  /** Visa bara laddvyn där kartan ska ligga (medan listan hämtas) – startar ingen karta. */
  mapPlaceholder?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [rootHeight, setRootHeight] = useState(0);
  // Kartan skapas när ytan först fått en höjd och tas sedan aldrig bort igen
  // bara för att höjden tillfälligt mäts till 0 (Safari vid adressfält/zoom).
  const [mapMounted, setMapMounted] = useState(false);
  if (rootHeight > 0 && !mapMounted) setMapMounted(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [searchBottom, setSearchBottom] = useState(0);
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const [cardHeight, setCardHeight] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const sheetHeight = useMotionValue(0);
  const sheetHeightCss = useTransform(sheetHeight, (h) => (h > 0 ? `${h}px` : "50dvh"));

  // En vald utövare som inte längre finns bland träffarna räknas som ovald.
  const selectedItem = items.find((i) => i.slug === selected) ?? null;
  const activeSlug = selectedItem?.slug ?? null;
  const cardOpen = selectedItem !== null;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setRootHeight(el.clientHeight);
      const search = searchRef.current;
      if (search) setSearchBottom(search.offsetTop + search.offsetHeight);
    });
    ro.observe(el);
    if (searchRef.current) ro.observe(searchRef.current);
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  // Kortets höjd (mobil: arket blir lika högt som kortet).
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCardHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [cardOpen]);

  // Ihopfällt ark = handtaget + "N utövare" + kategoriknapparna (uppmätt).
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeaderHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [cardOpen]);

  const collapsedHeight = Math.min(headerHeight, rootHeight * MAX_COLLAPSED);
  const expandedHeight = rootHeight * EXPANDED;
  const listHeight = expanded ? expandedHeight : collapsedHeight;

  // Glid till valt läge (fjäder), eller hoppa direkt vid reducerad rörelse.
  const sheetTarget = cardOpen && !isDesktop && cardHeight > 0 ? cardHeight : listHeight;
  useEffect(() => {
    if (!rootHeight || !sheetTarget) return;
    if (sheetHeight.get() === 0 || reduceMotion) {
      sheetHeight.set(sheetTarget);
      return;
    }
    const controls = animate(sheetHeight, sheetTarget, { type: "spring", stiffness: 380, damping: 38 });
    return () => controls.stop();
  }, [rootHeight, sheetTarget, reduceMotion, sheetHeight]);

  // Esc stänger kortet.
  useEffect(() => {
    if (!cardOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function select(slug: string) {
    setSelected(slug);
    syncUrl(slug);
  }

  function close() {
    setSelected(null);
    syncUrl(null);
  }

  // Klick på en rad väljer utövaren (kortet öppnas). Utan JavaScript är raden
  // en vanlig länk till profilen.
  function onListClick(e: MouseEvent<HTMLDivElement>) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const row = (e.target as Element).closest<HTMLElement>("[data-slug]");
    const slug = row?.dataset.slug;
    if (!slug) return;
    e.preventDefault();
    select(slug);
  }

  /** Ett drag ska inte räknas som ett klick på raden/knappen under fingret. */
  function swallowNextClick() {
    const swallow = (c: globalThis.MouseEvent) => {
      c.preventDefault();
      c.stopPropagation();
    };
    window.addEventListener("click", swallow, { capture: true, once: true });
    setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
  }

  // --- Dra i arket (mobil) ---
  function startDrag(e: PointerEvent<HTMLElement>, fromList: boolean) {
    if (isDesktop || !rootHeight) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (fromList && expanded) return; // uppdraget ark: listan scrollar i stället
    const startY = e.clientY;
    const startX = e.clientX;
    const startH = sheetHeight.get();
    const min = collapsedHeight;
    const max = expandedHeight;
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
      const open = Math.abs(max - projected) < Math.abs(min - projected);
      setExpanded(open);
      animate(
        sheetHeight,
        open ? max : min,
        reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 38, velocity: -velocity * 1000 },
      );
      swallowNextClick();
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

  // --- Svep ner på kortet (mobil) stänger det ---
  function startCardDrag(e: PointerEvent<HTMLElement>) {
    if (isDesktop) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const startY = e.clientY;
    const startX = e.clientX;
    const startH = sheetHeight.get();
    let active = false;
    let last = { y: startY, t: e.timeStamp };
    let velocity = 0;

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
      sheetHeight.set(dy > 0 ? startH - dy : startH - dy * 0.2);
    };
    const end = () => {
      stop();
      if (!active) return;
      if (last.y - startY > 70 || velocity > 0.6) close();
      else animate(sheetHeight, startH, reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 38 });
      swallowNextClick();
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

  // Luft för kartan: sökfältets underkant och arkets höjd (verkliga mått), så
  // att ingen prislapp hamnar bakom dem. Desktop: panelen täcker inte kartan.
  const insets = isDesktop
    ? { top: 0, bottom: 0, left: 0, right: 0 }
    : { top: searchBottom, bottom: cardOpen ? cardHeight : listHeight, left: 0, right: 0 };
  const measured = isDesktop || (searchBottom > 0 && headerHeight > 0);

  return (
    <div
      ref={rootRef}
      className="relative h-dvh overflow-hidden lg:grid lg:grid-cols-[380px_minmax(0,1fr)]"
    >
      {/* Karta */}
      <div className="absolute inset-0 z-0 lg:relative lg:order-2">
        {!mapMounted || mapPlaceholder ? (
          <MapLoading />
        ) : (
          <PractitionerMap
            points={items}
            selectedSlug={activeSlug}
            highlightSlug={isDesktop ? hovered : null}
            onSelect={select}
            onMapClick={close}
            insets={insets}
            showZoom={isDesktop}
            fitKey={measured ? items.map((i) => i.slug).join("|") : ""}
          />
        )}
      </div>

      {/* Panel (desktop) / flytande sök + bottenark (mobil) */}
      <div className="max-lg:contents lg:order-1 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-line">
        <div
          ref={searchRef}
          className="absolute inset-x-4 top-[max(16px,env(safe-area-inset-top))] z-30 lg:relative lg:inset-auto lg:shrink-0 lg:px-6 lg:pt-5"
        >
          <div className="hidden lg:mb-5 lg:flex lg:items-center lg:justify-between">
            <Logo />
            <div className="flex items-center gap-1">
              <Link href="/foretag" className="rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink">
                För företag
              </Link>
              <SiteMenu current="/karta" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">{search}</div>
            <SiteMenu variant="round" current="/karta" className="lg:hidden" />
          </div>
        </div>

        <motion.section
          aria-label={selectedItem ? `Vald: ${selectedItem.name}` : "Utövare"}
          style={{ "--sheet-h": sheetHeightCss } as never}
          className="absolute inset-x-0 bottom-0 z-20 flex h-[var(--sheet-h)] flex-col rounded-t-2xl bg-canvas shadow-sheet lg:static lg:h-auto lg:min-h-0 lg:flex-1 lg:rounded-none lg:shadow-none"
        >
          {selectedItem ? (
            // Kortet ersätter listan medan det är öppet.
            <div
              ref={cardRef}
              className="shrink-0 touch-none px-4 pb-[max(16px,env(safe-area-inset-bottom))] select-none lg:touch-auto lg:px-6 lg:pt-5 lg:select-auto"
              onPointerDown={startCardDrag}
            >
              <div className="mx-auto flex h-6 w-16 items-center justify-center lg:hidden" aria-hidden>
                <span className="h-1 w-8 rounded-full bg-line" />
              </div>
              <SelectedCard key={selectedItem.slug} item={selectedItem} onClose={close} />
            </div>
          ) : (
            <>
              <div
                ref={headerRef}
                className="shrink-0 touch-none px-4 pb-[max(12px,env(safe-area-inset-bottom))] select-none lg:touch-auto lg:px-6 lg:pt-5 lg:pb-4"
                onPointerDown={(e) => startDrag(e, false)}
              >
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                  aria-label={expanded ? "Visa mer av kartan" : "Visa alla utövare i listan"}
                  className="mx-auto flex h-6 w-16 items-center justify-center lg:hidden"
                >
                  <span className="h-1 w-8 rounded-full bg-line" />
                </button>
                {header}
              </div>

              <div
                className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 lg:px-6 ${expanded ? "touch-pan-y" : "max-lg:touch-none"}`}
                onPointerDown={(e) => startDrag(e, true)}
                onClickCapture={onListClick}
                onMouseOver={(e) => setHovered((e.target as Element).closest<HTMLElement>("[data-slug]")?.dataset.slug ?? null)}
                onMouseLeave={() => setHovered(null)}
              >
                {list}
                {footer}
              </div>
            </>
          )}
        </motion.section>
      </div>
    </div>
  );
}
