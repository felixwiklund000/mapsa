"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap, Marker } from "leaflet";
import { KARLSKRONA_CENTER } from "@/lib/areas";

export type MapPoint = {
  slug: string;
  name: string;
  area: string;
  categoryName: string;
  priceFrom: string | null;
  lat: number;
  lng: number;
};

/** Hur mycket av kartan som täcks av annat (sökfält, bottenark), i pixlar. */
export type MapInsets = { top: number; bottom: number; left?: number; right?: number };

// Interaktiv karta (Leaflet + OpenStreetMap). Leaflet laddas först i
// webbläsaren eftersom biblioteket behöver `window`.
//
// variant="browse":   alla utövare, klickbara nålar med popup.
// variant="location": en enda plats, stillastående (profilsidans bildyta).

export function PractitionerMap({
  points,
  variant = "browse",
  activeSlug = null,
  onSelect,
  insets = { top: 40, bottom: 40 },
  label = "Karta över utövare",
}: {
  points: MapPoint[];
  variant?: "browse" | "location";
  activeSlug?: string | null;
  onSelect?: (slug: string | null) => void;
  insets?: MapInsets;
  label?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const isStatic = variant === "location";

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Skapa kartan en gång.
  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    const markers = markersRef.current;

    import("leaflet").then((L) => {
      const el = containerRef.current;
      if (cancelled || !el) return;
      leafletRef.current = L;
      const map = L.map(el, {
        scrollWheelZoom: false,
        zoomControl: !isStatic,
        dragging: !isStatic,
        touchZoom: !isStatic,
        doubleClickZoom: !isStatic,
        boxZoom: !isStatic,
        keyboard: !isStatic,
      }).setView([KARLSKRONA_CENTER.lat, KARLSKRONA_CENTER.lng], 12);
      if (!isStatic) map.zoomControl.setPosition("topright");
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      // Storleken ändras när bottenarket dras eller fönstret ändras.
      resizeObserver = new ResizeObserver(() => map.invalidateSize());
      resizeObserver.observe(el);
      setReady(true);
    });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      markers.clear();
      setReady(false);
    };
  }, [isStatic]);

  // Rita om nålarna när resultaten ändras.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !map || !layer) return;

    layer.clearLayers();
    markersRef.current.clear();
    for (const p of points) {
      const marker = L.marker([p.lat, p.lng], {
        title: p.name,
        alt: p.name,
        interactive: !isStatic,
        keyboard: !isStatic,
        icon: L.divIcon({
          className: "mapsa-marker",
          html: `<span class="mapsa-pin"></span>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -12],
        }),
      });
      if (!isStatic) {
        marker
          .bindPopup(() => popupContent(p), { closeButton: false, autoPanPadding: [24, 24] })
          .on("popupopen", () => onSelectRef.current?.(p.slug))
          .on("popupclose", () => onSelectRef.current?.(null));
      }
      marker.addTo(layer);
      markersRef.current.set(p.slug, marker);
    }

    const padTL: [number, number] = [insets.left ?? 24, insets.top];
    const padBR: [number, number] = [insets.right ?? 24, insets.bottom];
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], isStatic ? 15 : 14);
    } else if (points.length > 1) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { paddingTopLeft: padTL, paddingBottomRight: padBR, maxZoom: 14 });
    } else {
      map.setView([KARLSKRONA_CENTER.lat, KARLSKRONA_CENTER.lng], 12);
    }
    // insets ändras när bottenarket dras – då ska kartan inte hoppa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, ready, isStatic]);

  // Markera vald nål (större).
  useEffect(() => {
    for (const [slug, marker] of markersRef.current) {
      const active = slug === activeSlug;
      marker.getElement()?.classList.toggle("is-active", active);
      marker.setZIndexOffset(active ? 1000 : 0);
    }
  }, [activeSlug, points, ready]);

  return <div ref={containerRef} role="region" aria-label={label} className="h-full w-full" />;
}

// Popupens innehåll byggs med DOM-noder (inte HTML-strängar), så att namn
// som utövare skrivit själva aldrig tolkas som HTML.
function popupContent(p: MapPoint): HTMLElement {
  const root = document.createElement("div");
  const link = document.createElement("a");
  link.href = `/utovare/${encodeURIComponent(p.slug)}`;
  link.textContent = p.name;
  link.className = "mapsa-popup-title";
  const meta = document.createElement("div");
  meta.className = "mapsa-popup-meta";
  meta.textContent = `${p.categoryName} · ${p.area}`;
  if (p.priceFrom) meta.textContent += ` · från ${p.priceFrom}`;
  root.append(link, meta);
  return root;
}
