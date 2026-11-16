"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { KARLSKRONA_CENTER } from "@/lib/areas";

export type MapPoint = {
  slug: string;
  name: string;
  area: string;
  categoryName: string;
  color: string;
  lat: number;
  lng: number;
};

// Interaktiv karta (Leaflet + OpenStreetMap). Leaflet laddas först i
// webbläsaren eftersom biblioteket behöver `window`.

export function PractitionerMap({ points }: { points: MapPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [ready, setReady] = useState(false);

  // Skapa kartan en gång.
  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;

    import("leaflet").then((L) => {
      const el = containerRef.current;
      if (cancelled || !el) return;
      leafletRef.current = L;
      const map = L.map(el, { scrollWheelZoom: false }).setView(
        [KARLSKRONA_CENTER.lat, KARLSKRONA_CENTER.lng],
        12,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      // Kartan kan ligga i en dold flik på mobil – räkna om storleken när den syns.
      resizeObserver = new ResizeObserver(() => map.invalidateSize());
      resizeObserver.observe(el);
      setReady(true);
    });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = null;
      setReady(false);
    };
  }, []);

  // Rita om nålarna när resultaten ändras.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = markersRef.current;
    if (!ready || !L || !map || !layer) return;

    layer.clearLayers();
    for (const p of points) {
      L.circleMarker([p.lat, p.lng], {
        radius: 9,
        color: "#ffffff",
        weight: 2,
        fillColor: p.color,
        fillOpacity: 1,
      })
        .bindPopup(() => popupContent(p))
        .bindTooltip(p.name)
        .addTo(layer);
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      map.setView([KARLSKRONA_CENTER.lat, KARLSKRONA_CENTER.lng], 12);
    }
  }, [points, ready]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Karta över utövare"
      className="h-full min-h-80 w-full rounded-xl bg-neutral-100"
    />
  );
}

// Popupens innehåll byggs med DOM-noder (inte HTML-strängar), så att namn
// som utövare skrivit själva aldrig tolkas som HTML.
function popupContent(p: MapPoint): HTMLElement {
  const root = document.createElement("div");
  const link = document.createElement("a");
  link.href = `/utovare/${encodeURIComponent(p.slug)}`;
  link.textContent = p.name;
  link.style.fontWeight = "600";
  const meta = document.createElement("div");
  meta.textContent = `${p.categoryName} · ${p.area}`;
  root.append(link, meta);
  return root;
}
