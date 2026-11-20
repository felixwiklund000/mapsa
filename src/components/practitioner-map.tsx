"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap, Marker, TileLayer } from "leaflet";
import { KARLSKRONA_CENTER } from "@/lib/areas";

export type MapPoint = {
  slug: string;
  name: string;
  /** Kort pris för nålen, t.ex. "395 kr". */
  label: string;
  lat: number;
  lng: number;
};

/** Hur mycket av kartan som täcks av sökfält och bottenark (px). */
export type MapInsets = { top: number; bottom: number; left: number; right: number };

// Kartbilder: CARTO Positron (ljust) / Dark Matter (mörkt).
const TILES = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

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
  const mapRef = useRef<LeafletMap | null>(null);
  const tilesRef = useRef<TileLayer | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onSelectRef = useRef(onSelect);
  const insetsRef = useRef(insets);
  const selectedRef = useRef(selectedSlug);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
    insetsRef.current = insets;
    selectedRef.current = selectedSlug;
  });

  // Prislappar som skulle krocka visas som en liten prick tills man zoomar in.
  // Vald nål först, sedan i listans ordning (utvalda överst).
  const declutter = useCallback(() => {
    const placed: DOMRect[] = [];
    const entries = [...markersRef.current.entries()].sort(
      (a, b) => Number(b[0] === selectedRef.current) - Number(a[0] === selectedRef.current),
    );
    for (const [slug, marker] of entries) {
      const pin = marker.getElement()?.querySelector<HTMLElement>(".mapsa-pin");
      if (!pin) continue;
      pin.classList.remove("is-dot");
      const r = pin.getBoundingClientRect();
      const hit = placed.some((p) => r.left < p.right + 4 && r.right > p.left - 4 && r.top < p.bottom + 4 && r.bottom > p.top - 4);
      if (hit && slug !== selectedRef.current) pin.classList.add("is-dot");
      else placed.push(r);
    }
  }, []);

  // Skapa kartan en gång.
  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    const markers = markersRef.current;
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => tilesRef.current?.setUrl(dark.matches ? TILES.dark : TILES.light);

    import("leaflet").then((L) => {
      const el = containerRef.current;
      if (cancelled || !el) return;
      leafletRef.current = L;
      const map = L.map(el, { zoomControl: false, scrollWheelZoom: true }).setView(
        [KARLSKRONA_CENTER.lat, KARLSKRONA_CENTER.lng],
        12,
      );
      tilesRef.current = L.tileLayer(dark.matches ? TILES.dark : TILES.light, {
        maxZoom: 19,
        subdomains: "abcd",
        attribution: ATTRIBUTION,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      dark.addEventListener("change", onScheme);
      map.on("zoomend moveend", () => declutter());
      resizeObserver = new ResizeObserver(() => map.invalidateSize());
      resizeObserver.observe(el);
      setReady(true);
    });

    return () => {
      cancelled = true;
      dark.removeEventListener("change", onScheme);
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      tilesRef.current = null;
      markers.clear();
      setReady(false);
    };
  }, [declutter]);

  // Zoomknappar (bara desktop).
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map || !showZoom) return;
    const control = L.control.zoom({ position: "topright" }).addTo(map);
    return () => {
      control.remove();
    };
  }, [ready, showZoom]);

  // Rita nålarna när resultaten ändras och visa alla.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !map || !layer) return;

    layer.clearLayers();
    markersRef.current.clear();
    for (const p of points) {
      const pin = document.createElement("span");
      pin.className = "mapsa-pin";
      pin.textContent = p.label;
      const marker = L.marker([p.lat, p.lng], {
        title: p.name,
        alt: p.name,
        riseOnHover: true,
        icon: L.divIcon({ className: "mapsa-marker", html: pin, iconSize: [0, 0], iconAnchor: [0, 0] }),
      })
        .on("click", () => onSelectRef.current(p.slug))
        .addTo(layer);
      markersRef.current.set(p.slug, marker);
    }

    const i = insetsRef.current;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14, { animate: false });
    } else if (points.length > 1) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, {
        paddingTopLeft: [i.left + 32, i.top + 32],
        paddingBottomRight: [i.right + 32, i.bottom + 32],
        maxZoom: 14,
        animate: false,
      });
    }
    declutter();
  }, [points, ready, declutter]);

  // Vald nål: vit och lite större. Kartan glider dit (flyTo).
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!ready || !map || !L) return;
    for (const [slug, marker] of markersRef.current) {
      const active = slug === selectedSlug;
      marker.getElement()?.classList.toggle("is-active", active);
      marker.setZIndexOffset(active ? 1000 : 0);
    }
    declutter();
    const marker = selectedSlug ? markersRef.current.get(selectedSlug) : undefined;
    if (!marker) return;

    // Centrera nålen i den del av kartan som syns (ovanför bottenarket).
    const i = insetsRef.current;
    const zoom = Math.max(map.getZoom(), 14);
    const size = map.getSize();
    const visibleCenter = L.point((i.left + size.x - i.right) / 2, (i.top + size.y - i.bottom) / 2);
    const offset = size.divideBy(2).subtract(visibleCenter);
    const target = map.unproject(map.project(marker.getLatLng(), zoom).add(offset), zoom);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) map.setView(target, zoom, { animate: false });
    else map.flyTo(target, zoom, { duration: 0.6, easeLinearity: 0.25 });
  }, [selectedSlug, ready, points, declutter]);

  return <div ref={containerRef} role="region" aria-label="Karta över utövare" className="h-full w-full" />;
}
