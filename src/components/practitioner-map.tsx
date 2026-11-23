"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { KARLSKRONA_CENTER } from "@/lib/areas";
import { droneFlight } from "@/lib/drone-flight";
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

const PITCH = 20; // bara lite lutad: mest översikt, men husen får lite djup
// Startvyn är aldrig mer utzoomad än så här (MapLibre-zoom, 512 px-rutor).
// Mobilen har mindre synlig kartyta (sökfält + ark), därför lite lägre där.
const MIN_START_ZOOM = { mobile: 12, desktop: 12.5 };
const CORE_RADIUS_KM = 3; // utövare längre bort från mitten räknas inte med i startvyn

/** Avstånd i km mellan två punkter (räcker för korta avstånd). */
function distanceKm(a: MapPoint, b: { lat: number; lng: number }) {
  const dLat = (a.lat - b.lat) * 111;
  const dLng = (a.lng - b.lng) * 111 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

/** Utövarna runt mitten (medianen) – ensamma långt bort lämnas utanför startvyn. */
function corePoints(points: MapPoint[]): MapPoint[] {
  const median = (v: number[]) => [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)];
  const center = { lat: median(points.map((p) => p.lat)), lng: median(points.map((p) => p.lng)) };
  const core = points.filter((p) => distanceKm(p, center) <= CORE_RADIUS_KM);
  return core.length > 0 ? core : points;
}

// Interaktiv karta (MapLibre GL + OpenFreeMap, egen stil i lib/map-style.ts).
// Nålarna är prislappar i Airbnb-stil: vita, runda, mjuk skugga. Vald = svart.
export function PractitionerMap({
  points,
  selectedSlug,
  highlightSlug = null,
  onSelect,
  insets,
  showZoom,
  overviewKey = 0,
  onUserMove,
  autoFit = true,
  label = "Karta över utövare",
}: {
  points: MapPoint[];
  selectedSlug: string | null;
  /** Lapp som markeras utan att kartan flyttar sig (t.ex. kortet man pekar på). */
  highlightSlug?: string | null;
  onSelect: (slug: string) => void;
  insets: MapInsets;
  showZoom: boolean;
  /** Öka värdet för att flyga tillbaka till översikten (alla ställen). */
  overviewKey?: number;
  /** Anropas när användaren själv drar/zoomar i kartan. */
  onUserMove?: () => void;
  /** Visa alla ställen när listan med ställen ändras (av för förhandsvisningen). */
  autoFit?: boolean;
  /** Tillgänglig beskrivning av kartan. */
  label?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const libRef = useRef<MapLibreModule | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const onSelectRef = useRef(onSelect);
  const onUserMoveRef = useRef(onUserMove);
  const insetsRef = useRef(insets);
  const selectedRef = useRef(selectedSlug);
  const pointsRef = useRef(points);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onUserMoveRef.current = onUserMove;
    insetsRef.current = insets;
    selectedRef.current = selectedSlug;
    pointsRef.current = points;
  });

  // Startvy/översikt: inzoomad där flest utövare finns (inte hela kommunen).
  const overviewCamera = useCallback(() => {
    const map = mapRef.current;
    const points = pointsRef.current;
    if (!map || points.length === 0) return null;
    const i = insetsRef.current;
    let padding = { top: i.top + 48, bottom: i.bottom + 48, left: i.left + 48, right: i.right + 48 };
    // Lämna alltid minst 40 % av kartan fri – annars "får inte översikten plats"
    // (t.ex. på mobilen när bottenarket är halvt uppe).
    const { clientWidth: w, clientHeight: h } = map.getContainer();
    const sy = Math.min(1, (h * 0.6) / (padding.top + padding.bottom));
    const sx = Math.min(1, (w * 0.6) / (padding.left + padding.right));
    padding = { top: padding.top * sy, bottom: padding.bottom * sy, left: padding.left * sx, right: padding.right * sx };
    const core = corePoints(points);
    if (core.length === 1) return { center: [core[0].lng, core[0].lat] as [number, number], zoom: 15, pitch: PITCH, bearing: 0, padding };
    // Räkna själv (Web Mercator, 512 px-rutor) – cameraForBounds lägger på
    // kartans nuvarande marginal och "får inte plats" efter en flygning.
    const mx = (lng: number) => (lng + 180) / 360;
    const my = (lat: number) => (1 - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / Math.PI) / 2;
    const xs = core.map((p) => mx(p.lng));
    const ys = core.map((p) => my(p.lat));
    const dx = Math.max(1e-9, Math.max(...xs) - Math.min(...xs));
    const dy = Math.max(1e-9, Math.max(...ys) - Math.min(...ys));
    const availW = Math.max(1, w - padding.left - padding.right);
    const availH = Math.max(1, h - padding.top - padding.bottom);
    const fitZoom = Math.min(15.5, Math.log2(Math.min(availW / (dx * 512), availH / (dy * 512))));
    const minZoom = w < 640 ? MIN_START_ZOOM.mobile : MIN_START_ZOOM.desktop;
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    const lng = cx * 360 - 180;
    const lat = (Math.atan(Math.sinh(Math.PI * (1 - 2 * cy))) * 180) / Math.PI;
    return { center: [lng, lat] as [number, number], zoom: Math.max(fitZoom, minZoom), pitch: PITCH, bearing: 0, padding };
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
      // Mät knappen runt lappen: den har full storlek även medan lappen poppar fram.
      const r = el.getBoundingClientRect();
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
          pitch: PITCH,
          maxPitch: 75, // drönarflygningen flyger lågt mellan husen
          // Mapsa finns bara i Blekinge än så länge.
          maxBounds: BLEKINGE_BOUNDS,
          minZoom: 8,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          attributionControl: { compact: true },
        });
      } catch (err) {
        console.error("Kartan kunde inte startas (WebGL saknas?)", err);
        return;
      }
      map.touchZoomRotate.disableRotation();
      map.keyboard.disableRotation();
      map.on("moveend", declutter);
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

  // Lappen för kortet man pekar på blir svart (som hos Airbnb), utan att kartan rör sig.
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

  // Visa alla ställen när *vilka* ställen som visas ändras (t.ex. nytt filter).
  const slugKey = points.map((p) => p.slug).join("|");
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !autoFit) return;
    const camera = overviewCamera();
    if (camera) map.jumpTo(camera);
    declutter();
  }, [slugKey, ready, autoFit, overviewCamera, declutter]);

  // "Visa alla": flyg tillbaka upp till översikten.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || overviewKey === 0) return;
    const camera = overviewCamera();
    if (!camera) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) map.jumpTo(camera);
    else map.flyTo({ ...camera, duration: 1600, curve: 1.4, essential: true });
  }, [overviewKey, ready, overviewCamera]);

  // Säg till när användaren själv flyttar kartan (inte våra egna flygningar).
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const onMove = (e: { originalEvent?: unknown }) => {
      if (e.originalEvent) onUserMoveRef.current?.();
    };
    map.on("movestart", onMove);
    return () => {
      map.off("movestart", onMove);
    };
  }, [ready]);

  // Vald lapp: svart och lite större.
  useEffect(() => {
    if (!ready) return;
    for (const [slug, marker] of markersRef.current) {
      marker.getElement().classList.toggle("is-active", slug === selectedSlug);
    }
    declutter();
  }, [selectedSlug, ready, points, declutter]);

  // Kartan flyger till vald lapp som en drönare (lib/drone-flight.ts). Bara när
  // valet eller dess läge ändras – inte när texten på lappen ändras.
  const selected = points.find((p) => p.slug === selectedSlug);
  const selLng = selected?.lng;
  const selLat = selected?.lat;
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || selLng === undefined || selLat === undefined) return;
    const i = insetsRef.current;
    const padding = { top: i.top, bottom: i.bottom, left: i.left, right: i.right };
    const center: [number, number] = [selLng, selLat];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      map.jumpTo({ center, zoom: Math.max(map.getZoom(), 15), pitch: PITCH, padding });
      return;
    }
    return droneFlight(map, center, padding);
  }, [selectedSlug, selLng, selLat, ready]);

  return <div ref={containerRef} role="region" aria-label={label} className="h-full w-full" />;
}
