"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { KARLSKRONA_CENTER } from "@/lib/areas";
import { mapStyle } from "@/lib/map-style";

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

const PITCH = 45; // lätt lutning så att byggnaderna syns i 3D

// Interaktiv karta (MapLibre GL + OpenFreeMap, egen stil i lib/map-style.ts).
// Nålarna är prislappar i Airbnb-stil: vita, runda, mjuk skugga. Vald = svart.
export function PractitionerMap({
  points,
  selectedSlug,
  onSelect,
  insets,
  showZoom,
}: {
  points: MapPoint[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  insets: MapInsets;
  showZoom: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const libRef = useRef<MapLibreModule | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const onSelectRef = useRef(onSelect);
  const insetsRef = useRef(insets);
  const selectedRef = useRef(selectedSlug);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
    insetsRef.current = insets;
    selectedRef.current = selectedSlug;
  });

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
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => mapRef.current?.setStyle(mapStyle(dark.matches));

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
          style: mapStyle(dark.matches),
          center: [KARLSKRONA_CENTER.lng, KARLSKRONA_CENTER.lat],
          zoom: 12,
          pitch: PITCH,
          maxPitch: 60,
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
      dark.addEventListener("change", onScheme);
      resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(el);
      setReady(true);
    });

    return () => {
      cancelled = true;
      dark.removeEventListener("change", onScheme);
      resizeObserver?.disconnect();
      markers.forEach((m) => m.remove());
      markers.clear();
      mapRef.current?.remove();
      mapRef.current = null;
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
      map.removeControl(control);
    };
  }, [ready, showZoom]);

  // Rita prislapparna när resultaten ändras och visa alla.
  useEffect(() => {
    const lib = libRef.current;
    const map = mapRef.current;
    if (!ready || !lib || !map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();
    points.forEach((p, index) => {
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

    const i = insetsRef.current;
    const padding = { top: i.top + 48, bottom: i.bottom + 48, left: i.left + 48, right: i.right + 48 };
    if (points.length === 1) {
      map.jumpTo({ center: [points[0].lng, points[0].lat], zoom: 14 });
    } else if (points.length > 1) {
      const bounds = new lib.LngLatBounds();
      points.forEach((p) => bounds.extend([p.lng, p.lat]));
      map.fitBounds(bounds, { padding, maxZoom: 14, animate: false });
    }
    declutter();
  }, [points, ready, declutter]);

  // Vald lapp: svart och lite större. Kartan glider dit och lutar in (flyTo).
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    for (const [slug, marker] of markersRef.current) {
      marker.getElement().classList.toggle("is-active", slug === selectedSlug);
    }
    declutter();
    const point = points.find((p) => p.slug === selectedSlug);
    if (!point) return;

    const i = insetsRef.current;
    const camera = {
      center: [point.lng, point.lat] as [number, number],
      zoom: Math.max(map.getZoom(), 15),
      pitch: PITCH,
      padding: { top: i.top, bottom: i.bottom, left: i.left, right: i.right },
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) map.jumpTo(camera);
    else map.flyTo({ ...camera, duration: 1000, curve: 1.3 });
  }, [selectedSlug, ready, points, declutter]);

  return <div ref={containerRef} role="region" aria-label="Karta över utövare" className="h-full w-full" />;
}
