"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { KARLSKRONA_CENTER } from "@/lib/areas";
import { BLEKINGE_BOUNDS, mapStyle } from "@/lib/map-style";
import { MapLoading } from "./map-loading";
import { PRICE_PILL_CLASS } from "./price-pill";

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
// Intro (kartsidan): kartan öppnas över hela området och zoomar sedan in på
// butikerna, en gång, när kartan har laddat.
const INTRO_MS = 1600;
const INTRO_ZOOM_OUT = 3.2;
// Vald prislapp ska synas: så här mycket luft (px) mot sökfält, kort och kanter.
const PIN_HALF_W = 48;
const PIN_HALF_H = 22;
const PAN_MS = 300;
// Kluster: prislappar som överlappar på skärmen slås ihop till en lapp med antal.
const PIN_H = 26; // prislappens höjd (px), se .mapsa-pin
const PIN_GAP = 4; // så nära får två lappar vara innan de räknas som överlappande
const ACTIVE_SCALE = 1.12; // vald lapp är så här mycket större, se .is-active
const CLUSTER_SIZE = 32; // klustrets höjd (och minsta bredd), se .is-cluster
const CLUSTER_MS = 400;
// Längst in går lappar på (nästan) samma adress inte att zooma isär – där
// läggs de i stället bredvid varandra (högst 3 per rad, 44 px mellan raderna).
const CLUSTER_MAX_ZOOM = 18;
const ROW_GAP = 8;
const ROW_STEP = 44;
const PER_ROW = 3;

// Laddvyn byts mot "Kartan kunde inte laddas" om kartan inte är klar efter så här lång tid.
const LOAD_TIMEOUT_MS = 15000;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Placed = { slug: string; lng: number; lat: number; x: number; y: number; w: number };

/** Överlappar två prislappar (centrerade på x, y) på skärmen? */
function overlaps(a: Placed, b: Placed): boolean {
  return Math.abs(a.x - b.x) < (a.w + b.w) / 2 + PIN_GAP && Math.abs(a.y - b.y) < PIN_H + PIN_GAP;
}

/** Hur mycket kartan måste förstoras för att två överlappande lappar ska gå isär. */
function separation(a: Placed, b: Placed): number {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  const kx = dx > 0 ? ((a.w + b.w) / 2 + PIN_GAP) / dx : Infinity;
  const ky = dy > 0 ? (PIN_H + PIN_GAP) / dy : Infinity;
  return Math.min(kx, ky);
}

/** Flytta en lapp på skärmen (px) – bara om det faktiskt ändras. */
function setOffset(marker: Marker, [x, y]: [number, number]) {
  const o = marker.getOffset();
  if (o.x !== x || o.y !== y) marker.setOffset([x, y]);
}

/** Prislapp som DOM-knapp för MapLibre – samma markup som <PricePill>. */
function pinButton(className: string, text: string, ariaLabel: string): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className = className;
  el.setAttribute("aria-label", ariaLabel);
  const pin = document.createElement("span");
  pin.className = PRICE_PILL_CLASS;
  pin.textContent = text;
  el.append(pin);
  return el;
}

// Interaktiv karta (MapLibre GL + OpenFreeMap, egen stil i lib/map-style.ts).
// Platt 2D: ingen lutning, ingen rotation, inga 3D-hus. Prislappar som
// överlappar på skärmen slås ihop till kluster (exakt de som överlappar –
// MapLibres inbyggda klustring räknar per hel zoomnivå och slog ihop lappar
// som inte överlappade). Kameran rör sig bara i introt (kartsidan öppnas:
// zoom in på alla ställen, en gång), när *vilka* ställen som visas ändras
// (fitKey) och när man trycker på ett kluster – aldrig när man väljer ett
// ställe (då högst ett kort panBy om lappen annars är dold).
export function PractitionerMap({
  points,
  selectedSlug,
  highlightSlug = null,
  onSelect,
  onMapClick,
  insets,
  showZoom,
  fitKey,
  intro = false,
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
  /** När värdet ändras visar kartan alla ställen (första gången utan animation, eller med introt). Tom = inte redo. */
  fitKey: string;
  /** Första visningen: börja utzoomad och zooma in på alla ställen när kartan laddat. */
  intro?: boolean;
  /** Tillgänglig beskrivning av kartan. */
  label?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const libRef = useRef<MapLibreModule | null>(null);
  const markersRef = useRef(new Map<string, Marker>()); // en prislapp per ställe
  const clustersRef = useRef(new Map<string, Marker>()); // kluster, nyckel = medlemmarnas slugs
  const widthsRef = useRef(new Map<string, number>()); // uppmätt bredd per prislapp
  const selectedMarkerRef = useRef<Marker | null>(null); // vald lapp, alltid utanför klustren
  const selectedRef = useRef(selectedSlug);
  const groupsKeyRef = useRef("");
  const onSelectRef = useRef(onSelect);
  const onMapClickRef = useRef(onMapClick);
  const insetsRef = useRef(insets);
  const highlightRef = useRef(highlightSlug);
  const pointsRef = useRef(points);
  const fittedKeyRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false); // kartan finns
  const [loadState, setLoadState] = useState<"loading" | "done" | "failed">("loading");

  useEffect(() => {
    onSelectRef.current = onSelect;
    onMapClickRef.current = onMapClick;
    insetsRef.current = insets;
    highlightRef.current = highlightSlug;
    pointsRef.current = points;
    selectedRef.current = selectedSlug;
  });

  // Visa alla ställen, med luft så att ingen prislapp hamnar bakom sökfältet
  // eller bottenarket. Kartans egen padding rörs aldrig.
  const fitToPoints = useCallback((duration: number) => {
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
    const long = duration > FIT_MS;
    map.fitBounds(bounds, {
      padding,
      maxZoom: pts.length === 1 ? 15 : 15.5,
      duration: reducedMotion() ? 0 : duration,
      linear: !long,
      // Introt: mjuk in- och utbromsning.
      ...(long ? { easing: (t: number) => 1 - Math.pow(1 - t, 3) } : {}),
      essential: true,
    });
  }, []);

  // Kluster: slå ihop prislappar som överlappar på skärmen (sammanhängande
  // grupper). Körs när kartan ritas om; rör bara DOM när grupperna ändras.
  const updateClusters = useCallback(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!map || !lib) return;
    const sel = selectedRef.current;
    const spread = map.getZoom() >= CLUSTER_MAX_ZOOM - 0.01; // längst in: lägg isär i stället
    const placed: Placed[] = [];
    for (const p of pointsRef.current) {
      if (p.slug === sel && !spread) continue; // vald lapp ritas för sig, aldrig i ett kluster
      const pt = map.project([p.lng, p.lat]);
      const w = widthsRef.current.get(p.slug) ?? p.label.length * 7.5 + 18;
      placed.push({ slug: p.slug, lng: p.lng, lat: p.lat, x: pt.x, y: pt.y, w });
    }
    // Sammanhängande grupper av överlappande lappar (union-find).
    const parent = placed.map((_, i) => i);
    const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    for (let i = 0; i < placed.length; i++)
      for (let j = i + 1; j < placed.length; j++) if (overlaps(placed[i], placed[j])) parent[find(i)] = find(j);
    const groups = new Map<number, Placed[]>();
    placed.forEach((p, i) => {
      const root = find(i);
      groups.set(root, [...(groups.get(root) ?? []), p]);
    });
    const multi = [...groups.values()].filter((g) => g.length > 1);
    const groupKey = (g: Placed[]) => g.map((p) => p.slug).sort().join(",");
    const key = `${spread ? "isär" : "kluster"}:${multi.map(groupKey).sort().join("|")}#${sel}`;
    const changed = key !== groupsKeyRef.current;

    if (changed) {
      groupsKeyRef.current = key;
      const clusters = spread ? [] : multi;
      const hidden = new Set(clusters.flatMap((g) => g.map((p) => p.slug)));
      if (sel) hidden.add(sel);
      for (const [slug, marker] of markersRef.current) marker.getElement().hidden = hidden.has(slug);

      const wanted = new Map(clusters.map((g) => [groupKey(g), g]));
      for (const [k, marker] of clustersRef.current) {
        if (!wanted.has(k)) {
          marker.remove();
          clustersRef.current.delete(k);
        }
      }
      for (const [k, group] of wanted) {
        if (clustersRef.current.has(k)) continue;
        const center: [number, number] = [
          group.reduce((s, p) => s + p.lng, 0) / group.length,
          group.reduce((s, p) => s + p.lat, 0) / group.length,
        ];
        const el = pinButton("mapsa-marker is-cluster", String(group.length), `${group.length} utövare – zooma in`);
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          // Zooma in precis så mycket att lapparna i klustret går isär.
          const now = group.map((p) => {
            const pt = map.project([p.lng, p.lat]);
            return { ...p, x: pt.x, y: pt.y };
          });
          let k = 1;
          for (let i = 0; i < now.length; i++)
            for (let j = i + 1; j < now.length; j++) if (overlaps(now[i], now[j])) k = Math.max(k, separation(now[i], now[j]));
          const zoom = Math.min(CLUSTER_MAX_ZOOM, map.getZoom() + (Number.isFinite(k) ? Math.log2(k) + 0.15 : 3));
          map.easeTo({ center, zoom, duration: reducedMotion() ? 0 : CLUSTER_MS, essential: true });
        });
        clustersRef.current.set(k, new lib.Marker({ element: el, anchor: "center" }).setLngLat(center).addTo(map));
        el.dataset.w = String((el.firstElementChild as HTMLElement).offsetWidth);
      }
    }

    // Förskjutning på skärmen (px): längst in läggs grupper på samma adress i
    // rader; annars flyttas det som skulle hamna under den valda lappen precis
    // bredvid den (kortaste vägen), så att inget göms bakom den.
    const selMarker = selectedMarkerRef.current;
    if (!spread && !(sel && selMarker) && !changed) return;
    const offsets = new Map<string, [number, number]>(); // prislappar (slug) och kluster (nyckel)
    if (spread) {
      for (const g of multi) {
        const cx = g.reduce((s, p) => s + p.x, 0) / g.length;
        const cy = g.reduce((s, p) => s + p.y, 0) / g.length;
        const sorted = [...g].sort((a, b) => a.lng - b.lng || a.slug.localeCompare(b.slug));
        const rows = Math.ceil(sorted.length / PER_ROW);
        for (let r = 0; r < rows; r++) {
          const row = sorted.slice(r * PER_ROW, (r + 1) * PER_ROW);
          const y = cy + (r - (rows - 1) / 2) * ROW_STEP;
          let x = cx - (row.reduce((s, p) => s + p.w, 0) + ROW_GAP * (row.length - 1)) / 2;
          for (const p of row) {
            offsets.set(p.slug, [x + p.w / 2 - p.x, y - p.y]);
            x += p.w + ROW_GAP;
          }
        }
      }
    } else if (sel && selMarker) {
      const at = map.project(selMarker.getLngLat());
      const sw = (widthsRef.current.get(sel) ?? 64) * ACTIVE_SCALE;
      const sh = PIN_H * ACTIVE_SCALE;
      const away = (x: number, y: number, w: number, h: number): [number, number] | null => {
        const dx = x - at.x;
        const dy = y - at.y;
        const needX = (w + sw) / 2 + PIN_GAP - Math.abs(dx);
        const needY = (h + sh) / 2 + PIN_GAP - Math.abs(dy);
        if (needX <= 0 || needY <= 0) return null;
        return needX <= needY ? [(dx < 0 ? -1 : 1) * needX, 0] : [0, (dy < 0 ? -1 : 1) * needY];
      };
      const inCluster = new Set(multi.flatMap((g) => g.map((p) => p.slug)));
      for (const p of placed) {
        const o = inCluster.has(p.slug) ? null : away(p.x, p.y, p.w, PIN_H);
        if (o) offsets.set(p.slug, o);
      }
      for (const [k, marker] of clustersRef.current) {
        const pt = map.project(marker.getLngLat());
        const w = Number(marker.getElement().dataset.w) || CLUSTER_SIZE;
        const o = away(pt.x, pt.y, w, CLUSTER_SIZE);
        if (o) offsets.set(k, o);
      }
    }
    for (const [slug, marker] of markersRef.current) setOffset(marker, offsets.get(slug) ?? [0, 0]);
    for (const [k, marker] of clustersRef.current) setOffset(marker, offsets.get(k) ?? [0, 0]);
    if (selMarker && sel) setOffset(selMarker, spread ? (offsets.get(sel) ?? [0, 0]) : [0, 0]);
  }, []);

  // Skapa kartan en gång.
  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    let loadTimer: ReturnType<typeof setTimeout> | undefined;
    const markers = markersRef.current;
    const clusters = clustersRef.current;

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
        setLoadState("failed");
        return;
      }
      // Laddvyn ligger kvar tills kartan är ritad (stil och första kartrutorna).
      map.once("load", () => {
        clearTimeout(loadTimer);
        if (!cancelled) setLoadState("done");
      });
      loadTimer = setTimeout(() => {
        if (!cancelled && !map.loaded()) setLoadState((s) => (s === "done" ? s : "failed"));
      }, LOAD_TIMEOUT_MS);
      map.touchZoomRotate.disableRotation();
      map.keyboard.disableRotation();
      // Tryck på kartan (inte på en prislapp – de ligger i samma behållare).
      map.on("click", (e) => {
        const target = e.originalEvent?.target as Element | null;
        if (target?.closest?.(".mapsa-marker")) return;
        onMapClickRef.current?.();
      });
      map.on("render", updateClusters);
      mapRef.current = map;
      // Bara under utveckling: gör kartan åtkomlig för felsökning i konsolen.
      if (process.env.NODE_ENV !== "production") (window as unknown as { __mapsaMap?: MapLibreMap }).__mapsaMap = map;
      resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(el);
      setReady(true);
    });

    return () => {
      cancelled = true;
      clearTimeout(loadTimer);
      resizeObserver?.disconnect();
      // Nedstängning får aldrig krascha sidan (MapLibre tar själv bort
      // kontroller och lappar när kartan tas bort).
      const map = mapRef.current;
      mapRef.current = null;
      try {
        markers.forEach((m) => m.remove());
        clusters.forEach((m) => m.remove());
        selectedMarkerRef.current?.remove();
        map?.remove();
      } catch (err) {
        console.error("Kartan kunde inte stängas ner", err);
      }
      markers.clear();
      clusters.clear();
      selectedMarkerRef.current = null;
      groupsKeyRef.current = "";
      setReady(false);
    };
  }, [updateClusters]);

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

  // Prislapparna: en knapp per ställe. Skapa nya, uppdatera befintliga på
  // plats (text och läge), ta bort de som inte finns längre. Klustren räknas
  // sedan om utifrån var lapparna hamnar på skärmen.
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
    for (const p of points) {
      const existing = markersRef.current.get(p.slug);
      if (existing) {
        const el = existing.getElement();
        el.setAttribute("aria-label", `${p.name}, från ${p.label}`);
        const pin = el.querySelector<HTMLElement>(".mapsa-pin");
        if (pin && pin.textContent !== p.label) {
          pin.textContent = p.label;
          if (pin.offsetWidth) widthsRef.current.set(p.slug, pin.offsetWidth);
        }
        const at = existing.getLngLat();
        if (at.lng !== p.lng || at.lat !== p.lat) existing.setLngLat([p.lng, p.lat]);
        continue;
      }
      const el = pinButton("mapsa-marker", p.label, `${p.name}, från ${p.label}`);
      el.dataset.slug = p.slug;
      const slug = p.slug;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(slug);
      });
      markersRef.current.set(p.slug, new lib.Marker({ element: el, anchor: "center" }).setLngLat([p.lng, p.lat]).addTo(map));
      const w = el.querySelector<HTMLElement>(".mapsa-pin")?.offsetWidth;
      if (w) widthsRef.current.set(p.slug, w);
    }
    groupsKeyRef.current = ""; // räkna om klustren
    updateClusters();
  }, [points, ready, updateClusters]);

  // Vald lapp: mörk och lite större, alltid överst. Kartan rör sig inte.
  const selected = points.find((p) => p.slug === selectedSlug);
  const selLng = selected?.lng;
  const selLat = selected?.lat;
  const selLabel = selected?.label;
  const selName = selected?.name;
  useEffect(() => {
    const lib = libRef.current;
    const map = mapRef.current;
    if (!ready || !lib || !map) return;
    groupsKeyRef.current = ""; // den valda lappen ska ut ur (eller tillbaka in i) klustren
    if (selLng === undefined || selLat === undefined || !selectedSlug) {
      selectedMarkerRef.current?.remove();
      selectedMarkerRef.current = null;
      updateClusters();
      return;
    }
    const text = selLabel ?? "";
    const aria = `${selName ?? ""}, från ${text} (vald)`;
    const current = selectedMarkerRef.current;
    if (current && current.getElement().dataset.slug === selectedSlug) {
      const pin = current.getElement().querySelector(".mapsa-pin");
      if (pin && pin.textContent !== text) pin.textContent = text;
      current.getElement().setAttribute("aria-label", aria);
      current.setLngLat([selLng, selLat]);
      updateClusters();
      return;
    }
    current?.remove();
    const el = pinButton("mapsa-marker is-active", text, aria);
    el.dataset.slug = selectedSlug;
    el.setAttribute("aria-pressed", "true");
    el.addEventListener("click", (e) => e.stopPropagation());
    selectedMarkerRef.current = new lib.Marker({ element: el, anchor: "center" }).setLngLat([selLng, selLat]).addTo(map);
    updateClusters();
  }, [ready, selectedSlug, selLng, selLat, selLabel, selName, updateClusters]);

  // Raden man pekar på (desktop): lappen blir mörk, kartan rör sig inte.
  useEffect(() => {
    for (const marker of markersRef.current.values()) {
      const el = marker.getElement();
      el.classList.toggle("is-hover", Boolean(highlightSlug) && el.dataset.slug === highlightSlug);
    }
  }, [highlightSlug]);

  // Visa alla ställen: första gången direkt (eller med introt), sedan kort och
  // mjukt (~400 ms) när filter eller sökning ändrar vilka ställen som visas.
  const introRef = useRef(intro);
  const [introDone, setIntroDone] = useState(!intro);
  useEffect(() => {
    const map = mapRef.current;
    // Tom nyckel = inte redo än (t.ex. innan sökfältet och arket är uppmätta).
    if (!ready || !map || fitKey === "" || fittedKeyRef.current === fitKey) return;
    const first = fittedKeyRef.current === null;
    if (first && introRef.current && !reducedMotion() && loadState !== "failed") {
      // Introt: stå utzoomad över ställena medan kartan laddar, zooma in sedan.
      if (loadState === "loading") {
        const pts = pointsRef.current;
        if (pts.length > 0) {
          const lng = pts.reduce((a, p) => a + p.lng, 0) / pts.length;
          const lat = pts.reduce((a, p) => a + p.lat, 0) / pts.length;
          map.jumpTo({ center: [lng, lat], zoom: Math.max(8, 13 - INTRO_ZOOM_OUT) });
        }
        return;
      }
      introRef.current = false;
      fittedKeyRef.current = fitKey;
      map.once("moveend", () => setIntroDone(true));
      fitToPoints(INTRO_MS);
      return;
    }
    fittedKeyRef.current = fitKey;
    if (first) map.once("moveend", () => setIntroDone(true));
    fitToPoints(first ? 0 : FIT_MS);
  }, [fitKey, ready, fitToPoints, loadState]);

  // Vald prislapp ska synas. Ingen zoom, ingen flygning – bara ett kort
  // panBy om lappen annars hamnar bakom sökfältet eller kortet.
  const { top: insetTop, bottom: insetBottom, left: insetLeft, right: insetRight } = insets;
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !introDone || !map || selLng === undefined || selLat === undefined) return;
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
  }, [ready, introDone, selectedSlug, selLng, selLat, insetTop, insetBottom, insetLeft, insetRight]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} role="region" aria-label={label} className="h-full w-full" />
      <MapLoading state={loadState} />
    </div>
  );
}
