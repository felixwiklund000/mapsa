"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { KARLSKRONA_CENTER } from "@/lib/areas";
import { BLEKINGE_BOUNDS, mapStyle } from "@/lib/map-style";

export type MapPoint = {
  slug: string;
  name: string;
  /** Kort pris för prislappen, t.ex. "395 kr". */
  label: string;
  lat: number;
  lng: number;
};

/** Hur mycket av kartan som täcks av sökfält och bottenark (px). */
export type MapInsets = { top: number; bottom: number; left: number; right: number };

type MapLibreModule = typeof import("maplibre-gl");

// Luft runt prislapparna när kartan visar alla: marginal + en halv prislapp.
const FIT_MARGIN = 32 + 22;
const FIT_MS = 400;
// Vald prislapp ska synas: så här mycket luft (px) mot sökfält, kort och kanter.
const PIN_HALF_W = 48;
const PIN_HALF_H = 22;
const PAN_MS = 300;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Interaktiv karta (MapLibre GL + OpenFreeMap, egen stil i lib/map-style.ts).
// Platt 2D: ingen lutning, ingen rotation, inga 3D-hus. Kameran rör sig bara
// när *vilka* ställen som visas ändras (fitKey) – aldrig när man väljer ett.
export function PractitionerMap({
  points,
  selectedSlug,
  highlightSlug = null,
  onSelect,
  onMapClick,
  insets,
  showZoom,
  fitKey,
  label = "Karta över utövare",
}: {
  points: MapPoint[];
  selectedSlug: string | null;
  /** Lapp som markeras utan att kartan flyttar sig (t.ex. raden man pekar på). */
  highlightSlug?: string | null;
  onSelect: (slug: string) => void;
  /** Tryck på själva kartan (inte på en prislapp), t.ex. för att stänga kortet. */
  onMapClick?: () => void;
  insets: MapInsets;
  showZoom: boolean;
  /** När värdet ändras visar kartan alla ställen (första gången utan animation). */
  fitKey: string;
  /** Tillgänglig beskrivning av kartan. */
  label?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const libRef = useRef<MapLibreModule | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const onSelectRef = useRef(onSelect);
  const onMapClickRef = useRef(onMapClick);
  const insetsRef = useRef(insets);
  const selectedRef = useRef(selectedSlug);
  const pointsRef = useRef(points);
  const fittedKeyRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onMapClickRef.current = onMapClick;
    insetsRef.current = insets;
    selectedRef.current = selectedSlug;
    pointsRef.current = points;
  });

  // Visa alla ställen, med luft så att ingen prislapp hamnar bakom sökfältet
  // eller bottenarket. Kartans egen padding rörs aldrig.
  const fitToPoints = useCallback((animated: boolean) => {
    const map = mapRef.current;
    const lib = libRef.current;
    const pts = pointsRef.current;
    if (!map || !lib || pts.length === 0) return;
    const { clientWidth: w, clientHeight: h } = map.getContainer();
    const i = insetsRef.current;
    let padding = { top: i.top + FIT_MARGIN, bottom: i.bottom + FIT_MARGIN, left: i.left + FIT_MARGIN, right: i.right + FIT_MARGIN };
    // Lämna alltid minst 40 % av kartan fri.
    const sy = Math.min(1, (h * 0.6) / (padding.top + padding.bottom));
    const sx = Math.min(1, (w * 0.6) / (padding.left + padding.right));
    padding = { top: padding.top * sy, bottom: padding.bottom * sy, left: padding.left * sx, right: padding.right * sx };
    const bounds = new lib.LngLatBounds();
    for (const p of pts) bounds.extend([p.lng, p.lat]);
    map.fitBounds(bounds, {
      padding,
      maxZoom: pts.length === 1 ? 15 : 15.5,
      duration: animated && !reducedMotion() ? FIT_MS : 0,
      linear: true,
      essential: true,
    });
  }, []);

  // Prislappar som skulle krocka visas som en liten tom lapp tills man zoomar in.
  // Vald först, sedan i listans ordning (utvalda överst).
  const declutter = useCallback(() => {
    const placed: DOMRect[] = [];
    const entries = [...markersRef.current.entries()].sort(
      (a, b) => Number(b[0] === selectedRef.current) - Number(a[0] === selectedRef.current),
    );
    for (const [slug, marker] of entries) {
      const el = marker.getElement();
      const pin = el.querySelector<HTMLElement>(".mapsa-pin");
      if (!pin) continue;
      pin.classList.remove("is-dot");
      // Mät själva lappen (knappen runt den är en 44 px tryckyta).
      const r = pin.getBoundingClientRect();
      const hit = placed.some((p) => r.left < p.right + 2 && r.right > p.left - 2 && r.top < p.bottom + 2 && r.bottom > p.top - 2);
      const selected = slug === selectedRef.current;
      if (hit && !selected) pin.classList.add("is-dot");
      else placed.push(r);
      // Tomma lappar underst, hela lappar ovanför, vald lapp överst.
      el.style.zIndex = selected ? "3" : hit ? "1" : "2";
    }
  }, []);

  // Skapa kartan en gång.
  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    const markers = markersRef.current;

    import("maplibre-gl").then((lib) => {
      const el = containerRef.current;
      if (cancelled || !el) return;
      libRef.current = lib;
      // Worker-filen kopieras till public/ (scripts/copy-maplibre-worker.mjs).
      lib.setWorkerUrl(`/maplibre-gl-worker.js?v=${lib.getVersion()}`);
      let map: MapLibreMap;
      try {
        map = new lib.Map({
          container: el,
          style: mapStyle(),
          center: [KARLSKRONA_CENTER.lng, KARLSKRONA_CENTER.lat],
          zoom: 12,
          // Platt 2D: går inte att luta eller rotera.
          pitch: 0,
          maxPitch: 0,
          bearing: 0,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          // Mapsa finns bara i Blekinge än så länge.
          maxBounds: BLEKINGE_BOUNDS,
          minZoom: 8,
          attributionControl: { compact: true },
        });
      } catch (err) {
        console.error("Kartan kunde inte startas (WebGL saknas?)", err);
        return;
      }
      map.touchZoomRotate.disableRotation();
      map.keyboard.disableRotation();
      map.on("moveend", declutter);
      // Tryck på kartan (inte på en prislapp – de ligger i samma behållare).
      map.on("click", (e) => {
        const target = e.originalEvent?.target as Element | null;
        if (target?.closest?.(".mapsa-marker")) return;
        onMapClickRef.current?.();
      });
      mapRef.current = map;
      // Bara under utveckling: gör kartan åtkomlig för felsökning i konsolen.
      if (process.env.NODE_ENV !== "production") (window as unknown as { __mapsaMap?: MapLibreMap }).__mapsaMap = map;
      resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(el);
      setReady(true);
    });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      // Nedstängning får aldrig krascha sidan (MapLibre tar själv bort
      // kontroller och lappar när kartan tas bort).
      const map = mapRef.current;
      mapRef.current = null;
      try {
        markers.forEach((m) => m.remove());
        map?.remove();
      } catch (err) {
        console.error("Kartan kunde inte stängas ner", err);
      }
      markers.clear();
      setReady(false);
    };
  }, [declutter]);

  // Zoomknappar (bara desktop).
  useEffect(() => {
    const lib = libRef.current;
    const map = mapRef.current;
    if (!ready || !lib || !map || !showZoom) return;
    const control = new lib.NavigationControl({ showCompass: false });
    map.addControl(control, "top-right");
    return () => {
      // Är kartan redan borttagen har MapLibre redan tagit bort knapparna –
      // att ta bort dem igen kraschar ("this._map.off").
      if (mapRef.current !== map) return;
      try {
        map.removeControl(control);
      } catch {
        // redan borta
      }
    };
  }, [ready, showZoom]);

  // Lappen för raden man pekar på blir mörk (som hos Airbnb), utan att kartan rör sig.
  useEffect(() => {
    for (const [slug, marker] of markersRef.current) {
      const el = marker.getElement();
      const on = slug === highlightSlug && slug !== selectedSlug;
      el.classList.toggle("is-hover", on);
      if (on) {
        el.querySelector(".mapsa-pin")?.classList.remove("is-dot"); // visa alltid priset
        el.style.zIndex = "4";
      }
    }
    if (!highlightSlug) declutter();
  }, [highlightSlug, selectedSlug, points, declutter]);

  // Prislapparna: skapa nya, uppdatera befintliga på plats (text och läge –
  // pop-animationen spelas inte om), ta bort de som inte finns längre.
  useEffect(() => {
    const lib = libRef.current;
    const map = mapRef.current;
    if (!ready || !lib || !map) return;

    const wanted = new Set(points.map((p) => p.slug));
    for (const [slug, marker] of markersRef.current) {
      if (!wanted.has(slug)) {
        marker.remove();
        markersRef.current.delete(slug);
      }
    }
    points.forEach((p, index) => {
      const existing = markersRef.current.get(p.slug);
      if (existing) {
        const el = existing.getElement();
        el.setAttribute("aria-label", `${p.name}, från ${p.label}`);
        const pin = el.querySelector(".mapsa-pin");
        if (pin && pin.textContent !== p.label) pin.textContent = p.label;
        const at = existing.getLngLat();
        if (at.lng !== p.lng || at.lat !== p.lat) existing.setLngLat([p.lng, p.lat]);
        return;
      }
      const el = document.createElement("button");
      el.type = "button";
      el.className = "mapsa-marker";
      el.setAttribute("aria-label", `${p.name}, från ${p.label}`);
      const pin = document.createElement("span");
      pin.className = "mapsa-pin";
      pin.style.animationDelay = `${Math.min(index, 10) * 30}ms`;
      pin.textContent = p.label;
      el.append(pin);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(p.slug);
      });
      const marker = new lib.Marker({ element: el, anchor: "center" }).setLngLat([p.lng, p.lat]).addTo(map);
      markersRef.current.set(p.slug, marker);
    });
    declutter();
  }, [points, ready, declutter]);

  // Visa alla ställen: första gången direkt, sedan kort och mjukt (~400 ms)
  // när filter eller sökning ändrar vilka ställen som visas.
  useEffect(() => {
    // Tom nyckel = inte redo än (t.ex. innan sökfältet och arket är uppmätta).
    if (!ready || fitKey === "" || fittedKeyRef.current === fitKey) return;
    const first = fittedKeyRef.current === null;
    fittedKeyRef.current = fitKey;
    fitToPoints(!first);
  }, [fitKey, ready, fitToPoints]);

  // Vald lapp: mörk och lite större. Kartan rör sig inte.
  useEffect(() => {
    if (!ready) return;
    for (const [slug, marker] of markersRef.current) {
      marker.getElement().classList.toggle("is-active", slug === selectedSlug);
    }
    declutter();
  }, [selectedSlug, ready, points, declutter]);

  // Vald prislapp ska synas. Ingen zoom, ingen flygning – bara ett kort
  // panBy om lappen annars hamnar bakom sökfältet eller kortet.
  const selected = points.find((p) => p.slug === selectedSlug);
  const selLng = selected?.lng;
  const selLat = selected?.lat;
  const { top: insetTop, bottom: insetBottom, left: insetLeft, right: insetRight } = insets;
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || selLng === undefined || selLat === undefined) return;
    const raf = requestAnimationFrame(() => {
      const pt = map.project([selLng, selLat]);
      const { clientWidth: w, clientHeight: h } = map.getContainer();
      const minX = insetLeft + PIN_HALF_W;
      const maxX = w - insetRight - PIN_HALF_W;
      const minY = insetTop + PIN_HALF_H;
      const maxY = h - insetBottom - PIN_HALF_H;
      if (minX >= maxX || minY >= maxY) return; // ingen synlig yta att flytta till
      const dx = pt.x < minX ? pt.x - minX : pt.x > maxX ? pt.x - maxX : 0;
      const dy = pt.y < minY ? pt.y - minY : pt.y > maxY ? pt.y - maxY : 0;
      if (dx !== 0 || dy !== 0) map.panBy([dx, dy], { duration: reducedMotion() ? 0 : PAN_MS, essential: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [ready, selectedSlug, selLng, selLat, insetTop, insetBottom, insetLeft, insetRight]);

  return <div ref={containerRef} role="region" aria-label={label} className="h-full w-full" />;
}
