"use client";

// 3D-stad för landningssidans hero: en liten stadsdel på en rundad platta –
// hus som växer upp, park med träd, kanal med bro – och svarta kartnålar som
// svävar ovanför med prislappar (samma lappar som på kartan i appen).
// Färgerna är kartans (lib/map-style.ts). Priserna är bara exempel.

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { createStage, easeOutBack, easeOutCubic, flatPatch, seeded, slab } from "./three-stage";

const C = {
  base: "#ffffff",
  ground: "#f2f3ef",
  road: "#ffffff",
  water: "#b4dcf7",
  park: "#d8ecc9",
  tree: "#9fd08a",
  treeDark: "#86c172",
  trunk: "#cbbfae",
  buildings: ["#ffffff", "#f6f6f4", "#ecebe8"],
  pin: "#111111",
};

// Kartnålar: läge (x, z) och lapptext.
const PINS = [
  { x: -2.35, z: -2.3, label: "650 kr" },
  { x: 0.0, z: -0.05, label: "400 kr" },
  { x: 1.65, z: -2.35, label: "300 kr" },
  { x: -2.4, z: 2.35, label: "800 kr" },
  { x: 1.65, z: 2.4, label: "250 kr" },
];

// Gator (x- och z-led) och kvarter mellan dem.
const ROADS_X = [-1.15, 0.95]; // gator i nord–sydlig riktning (x = konstant)
const ROADS_Z = [-1.05, 1.15];
const XS: [number, number][] = [
  [-3.5, -1.3],
  [-1.0, 0.8],
  [1.1, 2.15],
];
const ZS: [number, number][] = [
  [-3.5, -1.2],
  [-0.9, 1.0],
  [1.3, 3.5],
];
const PARK = { xi: 1, zi: 2 };

export default function CityScene({ accent = "#111111" }: { accent?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const pills = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rand = seeded(7);
    const world = new THREE.Group();

    // Sockel, mark, kanal, park och gator.
    world.add(slab(8, 8, 0.7, 0.45, C.base));
    world.add(flatPatch(7.7, 7.7, 0.55, C.ground, 0.002));
    const water = flatPatch(1.25, 7.1, 0.35, C.water, 0.006, { roughness: 0.2 });
    water.position.x = 2.92;
    world.add(water);
    const park = flatPatch(XS[PARK.xi][1] - XS[PARK.xi][0], ZS[PARK.zi][1] - ZS[PARK.zi][0], 0.2, C.park, 0.006);
    park.position.set((XS[PARK.xi][0] + XS[PARK.xi][1]) / 2, 0.006, (ZS[PARK.zi][0] + ZS[PARK.zi][1]) / 2);
    world.add(park);
    for (const x of ROADS_X) {
      const road = flatPatch(0.26, 7.1, 0.05, C.road, 0.008);
      road.position.x = x;
      world.add(road);
    }
    for (const z of ROADS_Z) {
      const road = flatPatch(5.6, 0.26, 0.05, C.road, 0.008);
      road.position.set(-0.75, 0.008, z);
      world.add(road);
    }
    // Bro över kanalen.
    const bridge = new THREE.Mesh(
      new RoundedBoxGeometry(1.5, 0.08, 0.3, 2, 0.03),
      new THREE.MeshStandardMaterial({ color: C.road, roughness: 0.8 }),
    );
    bridge.position.set(2.9, 0.07, ROADS_Z[1]);
    bridge.castShadow = bridge.receiveShadow = true;
    world.add(bridge);

    // Hus: varje kvarter delas i tomter, varje tomt får ett hus.
    const buildingMats = C.buildings.map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.85 }));
    const buildings: { mesh: THREE.Mesh; delay: number }[] = [];
    XS.forEach(([x0, x1], xi) =>
      ZS.forEach(([z0, z1], zi) => {
        if (xi === PARK.xi && zi === PARK.zi) return;
        const nx = Math.max(1, Math.round((x1 - x0) / 0.72));
        const nz = Math.max(1, Math.round((z1 - z0) / 0.72));
        const lw = (x1 - x0) / nx;
        const ld = (z1 - z0) / nz;
        for (let i = 0; i < nx; i++) {
          for (let j = 0; j < nz; j++) {
            const cx = x0 + lw * (i + 0.5);
            const cz = z0 + ld * (j + 0.5);
            const central = 1 - Math.min(1, Math.hypot(cx, cz) / 4.5);
            const h = 0.28 + rand() * 0.45 + central * 0.55;
            const w = lw - 0.1 - rand() * 0.06;
            const d = ld - 0.1 - rand() * 0.06;
            const geo = new RoundedBoxGeometry(w, h, d, 2, 0.035);
            geo.translate(0, h / 2, 0);
            const mesh = new THREE.Mesh(geo, buildingMats[Math.floor(rand() * buildingMats.length)]);
            mesh.position.set(cx, 0, cz);
            mesh.castShadow = mesh.receiveShadow = true;
            mesh.scale.y = 0.001;
            world.add(mesh);
            buildings.push({ mesh, delay: Math.hypot(cx, cz) * 0.09 + rand() * 0.15 });
          }
        }
      }),
    );

    // Träd: i parken och längs kanalen.
    const trunkGeo = new THREE.CylinderGeometry(0.025, 0.035, 0.18, 6);
    trunkGeo.translate(0, 0.09, 0);
    const trunkMat = new THREE.MeshStandardMaterial({ color: C.trunk, roughness: 1 });
    const crownMats = [C.tree, C.treeDark].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true }));
    const trees: { obj: THREE.Group; delay: number }[] = [];
    const treeSpots: [number, number][] = [];
    for (let k = 0; k < 9; k++) {
      treeSpots.push([lerp(XS[PARK.xi][0] + 0.25, XS[PARK.xi][1] - 0.25, rand()), lerp(ZS[PARK.zi][0] + 0.25, ZS[PARK.zi][1] - 0.25, rand())]);
    }
    for (let z = -3.1; z <= 3.1; z += 0.7) treeSpots.push([2.27, z + (rand() - 0.5) * 0.15]);
    for (const [x, z] of treeSpots) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      const r = 0.13 + rand() * 0.08;
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), crownMats[Math.floor(rand() * 2)]);
      crown.position.y = 0.18 + r * 0.8;
      crown.rotation.set(rand() * 3, rand() * 3, 0);
      trunk.castShadow = crown.castShadow = true;
      tree.add(trunk, crown);
      tree.position.set(x, 0, z);
      tree.scale.setScalar(0.001);
      world.add(tree);
      trees.push({ obj: tree, delay: 0.5 + rand() * 0.5 });
    }

    // Kartnålar: droppform (klot + kon), blanksvarta.
    const pinColor = new THREE.Color(C.pin);
    const accentColor = new THREE.Color(accent);
    const dotMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5 });
    const headGeo = new THREE.SphereGeometry(0.17, 32, 16);
    const tipGeo = new THREE.ConeGeometry(0.148, 0.3, 32, 1, true);
    tipGeo.rotateX(Math.PI);
    const dotGeo = new THREE.SphereGeometry(0.065, 16, 8);
    const pinTops = new Map<number, number>();
    for (const { mesh } of buildings) {
      PINS.forEach((p, i) => {
        if (Math.abs(mesh.position.x - p.x) < 0.4 && Math.abs(mesh.position.z - p.z) < 0.4) {
          const h = (mesh.geometry as RoundedBoxGeometry).parameters.height;
          pinTops.set(i, Math.max(pinTops.get(i) ?? 0, h));
        }
      });
    }
    const pins = PINS.map((p, i) => {
      const pin = new THREE.Group();
      const pinMat = new THREE.MeshStandardMaterial({ color: C.pin, roughness: 0.3, metalness: 0.1 });
      const head = new THREE.Mesh(headGeo, pinMat);
      head.position.y = 0.3;
      const tip = new THREE.Mesh(tipGeo, pinMat);
      tip.position.y = 0.15 - 0.0;
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.y = 0.3;
      dot.scale.set(1, 1, 1);
      head.castShadow = tip.castShadow = true;
      pin.add(head, tip, dot);
      const base = (pinTops.get(i) ?? 0.2) + 0.35;
      pin.position.set(p.x, base, p.z);
      pin.scale.setScalar(0.001);
      world.add(pin);
      return { pin, base, phase: i * 1.3, mat: pinMat };
    });

    const stage = createStage(el, {
      fov: 26,
      direction: [1, 0.95, 1],
      distance: 19,
      target: [0, 0.3, 0],
      fitAspect: 1.25,
      onFrame,
    });
    stage.scene.add(world);

    // Muspekaren lutar staden lite.
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    const onPointer = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const v = new THREE.Vector3();
    function onFrame(t: number, s: typeof stage) {
      px += (tx - px) * 0.05;
      py += (ty - py) * 0.05;
      world.rotation.y = -0.15 + Math.sin(t * 0.18) * 0.22 + px * 0.12;
      world.rotation.x = py * 0.03;

      for (const b of buildings) b.mesh.scale.y = Math.max(0.001, easeOutCubic((t - b.delay) / 0.9));
      for (const tr of trees) tr.obj.scale.setScalar(Math.max(0.001, easeOutBack((t - tr.delay) / 0.6)));
      const active = Math.floor(Math.max(0, t - 1.6) / 2.4) % PINS.length;
      pins.forEach(({ pin, base, phase, mat }, i) => {
        mat.color.lerp(i === active ? accentColor : pinColor, 0.12);
        const appear = easeOutBack((t - 1.0 - i * 0.12) / 0.6);
        const grow = i === active ? 1.25 : 1;
        pin.scale.setScalar(Math.max(0.001, appear * grow));
        pin.position.y = base + 0.08 * Math.sin(t * 1.6 + phase) + (1 - easeOutCubic((t - 1.0 - i * 0.12) / 0.6)) * 1.2;
        pin.rotation.y = t * 0.6 + phase;

        // Prislappen ovanför nålen (HTML – skarp text).
        const pill = pills.current[i];
        if (!pill) return;
        v.set(0, 0.62, 0);
        pin.localToWorld(v);
        v.project(s.camera);
        const x = (v.x * 0.5 + 0.5) * s.width;
        const y = (-v.y * 0.5 + 0.5) * s.height;
        pill.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${i === active ? 1.08 : 1})`;
        pill.style.opacity = String(easeOutCubic((t - 1.3 - i * 0.12) / 0.4));
        pill.dataset.active = String(i === active);
        pill.style.zIndex = i === active ? "2" : "1";
      });
    }

    return () => {
      window.removeEventListener("pointermove", onPointer);
      stage.dispose();
    };
  }, [accent]);

  return (
    <div ref={ref} className="relative h-full w-full" style={{ "--pill-active": accent } as never}>
      {PINS.map((p, i) => (
        <span
          key={p.label}
          ref={(node) => {
            pills.current[i] = node;
          }}
          className="landing-pill"
          style={{ opacity: 0 }}
          aria-hidden="true"
        >
          {p.label}
        </span>
      ))}
    </div>
  );
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
