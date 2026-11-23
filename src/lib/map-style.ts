// Kartstil för MapLibre, inspirerad av Ubers och Airbnbs kartor:
// lugn ljusgrå mark, vita vägar, mjukt blått vatten, dämpat grönt och låga
// grå byggnader i 3D. Alltid ljus. Kartdata: OpenFreeMap (fritt, ingen API-nyckel),
// schema OpenMapTiles. Se docs/design-spec.md, avsnittet Kartan.

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
  buildingTop: string;
  label: string;
  labelHalo: string;
  waterLabel: string;
};

// Ljus och mjuk, i Airbnb/Uber-anda: ljus mark med en aning grönt,
// ljusgröna parker, ljusblått vatten, vita vägar, ljusgrå byggnader.
const LIGHT: Palette = {
  land: "#f2f3ef",
  landAlt: "#eef0eb",
  green: "#d8ecc9",
  wood: "#cfe6bd",
  water: "#b4dcf7",
  road: "#ffffff",
  roadCasing: "#e2e3df",
  path: "#e8e9e5",
  building: "#e6e6e4",
  buildingTop: "#e9e9e7",
  label: "#6b6b6b",
  labelHalo: "#ffffff",
  waterLabel: "#4a86b5",
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
    // Mjukt ljus på byggnaderna (svag skugga på ena sidan).
    light: { anchor: "viewport", color: "#ffffff", intensity: 0.3, position: [1.3, 210, 35] },
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

      // Byggnader: platta på medelzoom, låga 3D-block när man zoomar in.
      {
        id: "building-flat",
        type: "fill",
        source: "omt",
        "source-layer": "building",
        minzoom: 13,
        maxzoom: 14.5,
        paint: { "fill-color": c.building, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 13.5, 1] as unknown as number },
      },

      // Vägar: först kanter (casing), sedan vit fyllning ovanpå.
      ...roadLayers(c),

      {
        id: "building-3d",
        type: "fill-extrusion",
        source: "omt",
        "source-layer": "building",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": c.buildingTop,
          "fill-extrusion-opacity": 0.9,
          // Låga byggnader: verklig höjd, max 24 m, skalad till 60 %. Växer fram mellan zoom 14 och 15,5.
          "fill-extrusion-height": [
            "interpolate", ["linear"], ["zoom"],
            14, 0,
            15.5, ["*", ["min", ["coalesce", ["get", "render_height"], 6], 24], 0.6],
          ] as unknown as number,
          "fill-extrusion-base": [
            "interpolate", ["linear"], ["zoom"],
            14, 0,
            15.5, ["*", ["min", ["coalesce", ["get", "render_min_height"], 0], 24], 0.6],
          ] as unknown as number,
          "fill-extrusion-vertical-gradient": true,
        },
      },

      // Etiketter: få och lugna.
      {
        id: "water-name",
        type: "symbol",
        source: "omt",
        "source-layer": "water_name",
        minzoom: 11,
        layout: {
          "text-field": ["get", "name"] as unknown as string,
          "text-font": FONT,
          "text-size": 12,
          "text-letter-spacing": 0.05,
        },
        paint: { "text-color": c.waterLabel, "text-halo-color": c.water, "text-halo-width": 1 },
      },
      {
        id: "road-name",
        type: "symbol",
        source: "omt",
        "source-layer": "transportation_name",
        minzoom: 14,
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
      // Mörk ton över allt utanför Blekinge, och en kontur runt länet.
      {
        id: "outside-blekinge",
        type: "fill",
        source: "outside",
        paint: { "fill-color": "#000000", "fill-opacity": 0.35 },
      },
      {
        id: "blekinge-outline",
        type: "line",
        source: "blekinge",
        layout: { "line-join": "round" },
        paint: {
          "line-color": "#000000",
          "line-opacity": 0.7,
          "line-width": ["interpolate", ["linear"], ["zoom"], 7, 1.5, 12, 2.5] as unknown as number,
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
