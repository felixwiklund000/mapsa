// En liten 3D-butik som reser sig där det valda stället ligger: en orange
// kropp med ett mörkt, lite bredare tak (som ett skärmtak). Ritas med två
// fill-extrusion-lager över kartans 3D-hus. Höjden animeras genom att ändra
// lagrens höjd varje bildruta.

import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";

export const SHOP_HEIGHT = 18; // meter
const ROOF_THICKNESS = 2;
const BODY_SIZE = 14; // meter, sida på kvadraten
const ROOF_SIZE = 17;

const SOURCE = "selected-shop";
const BODY = "shop-body";
const ROOF = "shop-roof";

const EMPTY = { type: "FeatureCollection" as const, features: [] };

/** Kvadrat (meter) runt en punkt, som GeoJSON-polygon. */
export function shopFootprint(lng: number, lat: number, sizeM: number, part: "body" | "roof") {
  const half = sizeM / 2;
  const dLat = half / 110540;
  const dLng = half / (111320 * Math.cos((lat * Math.PI) / 180));
  return {
    type: "Feature" as const,
    properties: { part },
    geometry: {
      type: "Polygon" as const,
      coordinates: [
        [
          [lng - dLng, lat - dLat],
          [lng + dLng, lat - dLat],
          [lng + dLng, lat + dLat],
          [lng - dLng, lat + dLat],
          [lng - dLng, lat - dLat],
        ],
      ],
    },
  };
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInCubic = (t: number) => t * t * t;

export class Shop3D {
  /** Nuvarande höjd (meter). */
  height = 0;
  private raf = 0;
  private pending: [number, number] | null = null;

  constructor(
    private map: MapLibreMap,
    private onHeight: (h: number) => void,
  ) {}

  private ready(): boolean {
    try {
      this.addLayers();
      return true;
    } catch {
      // Stilen är inte klar än ("Style is not done loading") – försök igen sen.
      return false;
    }
  }

  private addLayers() {
    const map = this.map;
    if (!map.getSource(SOURCE)) map.addSource(SOURCE, { type: "geojson", data: EMPTY });
    // Under etiketterna men över husen.
    const before = map.getLayer("water-name") ? "water-name" : undefined;
    if (!map.getLayer(BODY)) {
      map.addLayer(
        {
          id: BODY,
          type: "fill-extrusion",
          source: SOURCE,
          filter: ["==", ["get", "part"], "body"],
          paint: {
            "fill-extrusion-color": "#ff5a1f",
            "fill-extrusion-height": 0,
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 1,
            "fill-extrusion-vertical-gradient": true,
          },
        },
        before,
      );
    }
    if (!map.getLayer(ROOF)) {
      map.addLayer(
        {
          id: ROOF,
          type: "fill-extrusion",
          source: SOURCE,
          filter: ["==", ["get", "part"], "roof"],
          paint: {
            "fill-extrusion-color": "#141312",
            "fill-extrusion-height": 0,
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 1,
          },
        },
        before,
      );
    }
  }

  /** Flytta butiken (utan att ändra höjden). */
  place(lng: number, lat: number) {
    if (!this.ready()) {
      // Stilen laddas fortfarande – lägg ut butiken när kartan är klar, med
      // den höjd butiken har hunnit få.
      this.pending = [lng, lat];
      this.map.once("idle", () => {
        const p = this.pending;
        if (!p) return;
        this.place(...p);
        if (!this.pending) this.apply(this.height);
      });
      return;
    }
    this.pending = null;
    (this.map.getSource(SOURCE) as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: [shopFootprint(lng, lat, BODY_SIZE, "body"), shopFootprint(lng, lat, ROOF_SIZE, "roof")],
    });
  }

  clear() {
    this.pending = null;
    if (this.map.getSource(SOURCE)) (this.map.getSource(SOURCE) as GeoJSONSource).setData(EMPTY);
  }

  /** Sätt höjden direkt. */
  set(h: number) {
    cancelAnimationFrame(this.raf);
    this.apply(h);
  }

  /** Res upp (eller sjunk ner) till en höjd. */
  animate(to: number, ms: number, done?: () => void) {
    cancelAnimationFrame(this.raf);
    const from = this.height;
    if (Math.abs(to - from) < 0.01) {
      this.apply(to);
      done?.();
      return;
    }
    const ease = to > from ? easeOutCubic : easeInCubic;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      this.apply(from + (to - from) * ease(t));
      if (t < 1) this.raf = requestAnimationFrame(step);
      else done?.();
    };
    this.raf = requestAnimationFrame(step);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
  }

  private apply(h: number) {
    this.height = h;
    const map = this.map;
    if (map.getLayer(BODY)) {
      map.setPaintProperty(BODY, "fill-extrusion-height", h);
      map.setPaintProperty(ROOF, "fill-extrusion-base", h);
      map.setPaintProperty(ROOF, "fill-extrusion-height", h > 0.5 ? h + ROOF_THICKNESS : 0);
    }
    this.onHeight(h);
  }
}
