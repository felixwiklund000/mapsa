// Kartstil för MapLibre: platt, lugn och dämpad, i sidans varma toner –
// ljus mark, vita vägar, dämpat vatten och grönt, platta byggnader och få
// etiketter (orter, stadsdelar och gatunamn). Inga POI-ikoner, ingen 3D.
// Kartdata: OpenFreeMap (fritt, ingen API-nyckel), schema OpenMapTiles.
// Se docs/design-spec.md, avsnittet Kartan.

import type { StyleSpecification } from "maplibre-gl";
import blekinge from "./blekinge-geo.json";

const SOURCE = "https://tiles.openfreemap.org/planet";
const GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";
const FONT = ["Noto Sans Regular"];
const FONT_BOLD = ["Noto Sans Bold"];

type Palette = {
  land: string;
  landAlt: string; // bostadsområden, något mörkare än marken
  green: string;
  wood: string;
  water: string;
  road: string;
  roadCasing: string;
  path: string;
  building: string;
  label: string;
  labelHalo: string;
};

// Dämpad och varm, nära sidans sandtoner, så att de orange prislapparna är
// det enda som sticker ut.
const LIGHT: Palette = {
  land: "#f6f4ef",
  landAlt: "#f2efe8",
  green: "#e4eadb",
  wood: "#dfe6d5",
  water: "#d4e2ea",
  road: "#ffffff",
  roadCasing: "#e7e3db",
  path: "#ece8e0",
  building: "#ebe7df",
  label: "#857f75",
  labelHalo: "#ffffff",
};

// Vägbredd (px) som växer med zoomnivån.
const width = (stops: [number, number][]) =>
  ["interpolate", ["exponential", 1.5], ["zoom"], ...stops.flat()] as unknown as number;

const MAJOR = ["motorway", "trunk", "primary"];
const MEDIUM = ["secondary", "tertiary"];
const MINOR = ["minor", "service", "busway"];

const majorW: [number, number][] = [[8, 0.6], [12, 2.5], [15, 9], [18, 30]];
const mediumW: [number, number][] = [[10, 0.5], [13, 2.5], [15, 7], [18, 22]];
const minorW: [number, number][] = [[13, 0.6], [15, 3.5], [18, 14]];
const casing = (w: [number, number][]) => w.map(([z, v]) => [z, v + (z >= 13 ? 2 : 0.5)] as [number, number]);

const isClass = (classes: string[]) => ["match", ["get", "class"], classes, true, false] as unknown as boolean;

export function mapStyle(): StyleSpecification {
  const c = LIGHT;
  return {
    version: 8,
    glyphs: GLYPHS,
    sources: {
      omt: { type: "vector", url: SOURCE },
      // Blekinge: kontur och mask (scripts/build-blekinge-geo.ts)
      blekinge: { type: "geojson", data: blekinge.region as never },
      outside: { type: "geojson", data: blekinge.mask as never },
    },
    layers: [
      { id: "land", type: "background", paint: { "background-color": c.land } },
      {
        id: "residential",
        type: "fill",
        source: "omt",
        "source-layer": "landuse",
        filter: ["match", ["get", "class"], ["residential", "suburb", "neighbourhood"], true, false],
        paint: { "fill-color": c.landAlt },
      },
      {
        id: "wood",
        type: "fill",
        source: "omt",
        "source-layer": "landcover",
        filter: ["match", ["get", "class"], ["wood", "forest"], true, false],
        paint: { "fill-color": c.wood, "fill-opacity": 0.8 },
      },
      {
        id: "grass",
        type: "fill",
        source: "omt",
        "source-layer": "landcover",
        filter: ["match", ["get", "class"], ["grass", "wetland", "farmland"], true, false],
        paint: { "fill-color": c.green, "fill-opacity": 0.7 },
      },
      {
        id: "park",
        type: "fill",
        source: "omt",
        "source-layer": "park",
        paint: { "fill-color": c.green },
      },
      {
        id: "landuse-green",
        type: "fill",
        source: "omt",
        "source-layer": "landuse",
        filter: ["match", ["get", "class"], ["cemetery", "pitch", "stadium", "golf"], true, false],
        paint: { "fill-color": c.green, "fill-opacity": 0.7 },
      },
      {
        id: "water",
        type: "fill",
        source: "omt",
        "source-layer": "water",
        paint: { "fill-color": c.water },
      },
      {
        id: "waterway",
        type: "line",
        source: "omt",
        "source-layer": "waterway",
        paint: { "line-color": c.water, "line-width": width([[10, 0.5], [16, 3]]) },
      },

      // Byggnader: platta och svaga, från zoom 13.
      {
        id: "building",
        type: "fill",
        source: "omt",
        "source-layer": "building",
        minzoom: 13,
        paint: { "fill-color": c.building, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14, 1] as unknown as number },
      },

      // Vägar: först kanter (casing), sedan vit fyllning ovanpå.
      ...roadLayers(c),

      // Etiketter: få och lugna.
      {
        id: "road-name",
        type: "symbol",
        source: "omt",
        "source-layer": "transportation_name",
        minzoom: 15,
        filter: isClass([...MAJOR, ...MEDIUM, "minor"]),
        layout: {
          "symbol-placement": "line",
          "text-field": ["get", "name"] as unknown as string,
          "text-font": FONT,
          "text-size": 12,
          "text-max-angle": 30,
        },
        paint: { "text-color": c.label, "text-halo-color": c.labelHalo, "text-halo-width": 1.5 },
      },
      {
        id: "place-neighbourhood",
        type: "symbol",
        source: "omt",
        "source-layer": "place",
        minzoom: 12,
        filter: isClass(["suburb", "quarter", "neighbourhood", "village", "hamlet", "island"]),
        layout: {
          "text-field": ["get", "name"] as unknown as string,
          "text-font": FONT_BOLD,
          "text-size": 12,
          "text-transform": "uppercase",
          "text-letter-spacing": 0.12,
          "text-max-width": 8,
        },
        paint: { "text-color": c.label, "text-halo-color": c.labelHalo, "text-halo-width": 1.5 },
      },
      {
        id: "place-town",
        type: "symbol",
        source: "omt",
        "source-layer": "place",
        maxzoom: 13,
        filter: isClass(["city", "town"]),
        layout: {
          "text-field": ["get", "name"] as unknown as string,
          "text-font": FONT_BOLD,
          "text-size": 14,
        },
        paint: { "text-color": c.label, "text-halo-color": c.labelHalo, "text-halo-width": 1.5 },
      },
      // Svag ton över allt utanför Blekinge, och en tunn kontur runt länet.
      {
        id: "outside-blekinge",
        type: "fill",
        source: "outside",
        paint: { "fill-color": "#141312", "fill-opacity": 0.12 },
      },
      {
        id: "blekinge-outline",
        type: "line",
        source: "blekinge",
        layout: { "line-join": "round" },
        paint: {
          "line-color": "#141312",
          "line-opacity": 0.35,
          "line-width": ["interpolate", ["linear"], ["zoom"], 7, 1, 12, 1.5] as unknown as number,
        },
      },
    ],
  };
}

/** Kartan får inte visa mer än Blekinge med omnejd. [väst, syd, öst, nord] */
export const BLEKINGE_BOUNDS = blekinge.bounds as [number, number, number, number];

function roadLayers(c: Palette): StyleSpecification["layers"] {
  const roads: [string, string[], [number, number][], number][] = [
    ["minor", MINOR, minorW, 13],
    ["medium", MEDIUM, mediumW, 10],
    ["major", MAJOR, majorW, 8],
  ];
  const casings = roads.map(([id, classes, w, minzoom]) => ({
    id: `road-${id}-casing`,
    type: "line" as const,
    source: "omt",
    "source-layer": "transportation",
    minzoom,
    filter: isClass(classes),
    layout: { "line-cap": "round" as const, "line-join": "round" as const },
    paint: { "line-color": c.roadCasing, "line-width": width(casing(w)) },
  }));
  const fills = roads.map(([id, classes, w, minzoom]) => ({
    id: `road-${id}`,
    type: "line" as const,
    source: "omt",
    "source-layer": "transportation",
    minzoom,
    filter: isClass(classes),
    layout: { "line-cap": "round" as const, "line-join": "round" as const },
    paint: { "line-color": c.road, "line-width": width(w) },
  }));
  const paths = {
    id: "road-path",
    type: "line" as const,
    source: "omt",
    "source-layer": "transportation",
    minzoom: 15,
    filter: isClass(["path", "track"]),
    paint: { "line-color": c.path, "line-width": width([[15, 0.8], [18, 3]]) },
  };
  return [paths, ...casings, ...fills];
}
