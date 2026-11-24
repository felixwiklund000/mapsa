"use client";

// Jordklotet på startsidan: ett litet low-poly-klot med land och hav, små
// 3D-butiker (skyltfönster, markis och skylt), granar och en mjuk skugga under.
// Matt "lera"-känsla: MeshStandardMaterial med hög roughness, färger från
// design tokens, mjukt ljus, inga realtidsskuggor.
//
// Styrs av scroll-progress (0–3, en ref från Story):
//   0–1  klotet snurrar långsamt (hero, steg 1)
//   2    klotet vänder butikerna med prislappar mot kameran, lapparna poppar upp
//   3    den valda butiken vrids fram och kameran glider in mot den
// `entering`: man har tryckt på klotet – kameran dyker in mot det, och Story
// öppnar kartan (/karta), som i sin tur zoomar in på butikerna.
// Prislapparna är <PricePill> i HTML (drei <Html>), samma som på kartan; de
// på baksidan av klotet döljs. Canvas tar inte emot tryck (scroll går igenom).
// Laddas bara via scene-loader.tsx (next/dynamic, ssr: false).

import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Html } from "@react-three/drei";
import * as THREE from "three";
import { PricePill } from "../price-pill";
import type { StoryPill } from "./story";

// Färger från design tokens (design-system.css) och kartans palett.
const C = {
  land: "#e8dcc4", // sand-deep, ljusare i ljuset
  landAlt: "#ddd0b6",
  green: "#c4d3a8",
  sea: "#a9cde0", // kartans vatten, lite mer mättat
  wall: "#fbf7f0", // sand-light
  roof: "#e4d9c6",
  glass: "#3c5562",
  door: "#6b5446",
  sign: "#ffffff",
  tree: "#76955f",
};
const AWNINGS = ["#ff5a1f", "#c8643c", "#7f9a6b", "#d9a441", "#6f8fa6"];

const R = 3; // klotets radie
const FOV = 30;
const ELEVATION = THREE.MathUtils.degToRad(10);
const TILT = 0;
const FIT_R = R + 1.25; // så mycket som ska rymmas i bild (klot + butiker + lappar)
const LOOK_Y = 0.35; // titta lite ovanför mitten: butikerna står längs överkanten
const SHOP_SCALE = 1.45;
const PILL_LIFT = 0.62 * SHOP_SCALE; // prislappen svävar ovanför taket

// Butikerna: [latitud, longitud, vridning, storlek] i grader / skala.
// De står i en krans längs klotets överkant med framsidan mot kameran
// (som på en liten planet) – så syns skyltfönster, markis och skylt. Longitud
// 0 = mot kameran. De första fem bär prislapparna (PIN_SHOPS); den första är
// den som väljs i steg 3.
type Shop = [number, number, number, number];
const SHOPS: Shop[] = [
  [64, 0, 0, 1.15],
  [58, -32, 0, 1.05],
  [58, 32, 0, 1.05],
  [52, -62, 0, 1],
  [52, 62, 0, 1],
  [60, 96, 0, 1],
  [55, 128, 0, 1.05],
  [62, 160, 0, 0.95],
  [56, 192, 0, 1.1],
  [61, 224, 0, 1],
  [54, 256, 0, 1.05],
  [60, 288, 0, 0.95],
];
export const PIN_SHOPS = [0, 1, 2, 3, 4];

const v3 = (lat: number, lon: number) => {
  const a = THREE.MathUtils.degToRad(lat);
  const b = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b));
};
const SHOP_DIRS = SHOPS.map(([lat, lon]) => v3(lat, lon));
// Prislapparnas mittpunkt: dit klotet vänds i steg 2 (och står i heron).
const PIN_CENTER_LON = PIN_SHOPS.reduce((s, i) => s + SHOPS[i][1], 0) / PIN_SHOPS.length;

/** Land eller hav? Enkla vågor på klotet – och alltid land runt butikerna. */
function isLand(d: THREE.Vector3): boolean {
  if (SHOP_DIRS.some((s) => s.dot(d) > Math.cos(THREE.MathUtils.degToRad(13)))) return true;
  const n = Math.sin(d.x * 2.1 + 0.4) * Math.cos(d.y * 1.7 - 0.3) + Math.sin(d.z * 2.6 + 1.2) * 0.6 + Math.sin((d.x + d.y) * 3.3) * 0.25;
  return n > 0.05;
}

/** Ställ en sak på klotets yta: upp = ytans normal, framsida vriden `yaw` grader. */
function surfaceMatrix(d: THREE.Vector3, yawDeg: number, scale: number): THREE.Matrix4 {
  const up = d.clone().normalize();
  const east = new THREE.Vector3(0, 1, 0).cross(up);
  if (east.lengthSq() < 1e-6) east.set(1, 0, 0);
  east.normalize();
  const north = up.clone().cross(east).normalize();
  const yaw = THREE.MathUtils.degToRad(yawDeg);
  const front = north.clone().multiplyScalar(-Math.cos(yaw)).addScaledVector(east, Math.sin(yaw)).normalize();
  const right = up.clone().cross(front).normalize();
  const m = new THREE.Matrix4().makeBasis(right, up, front);
  m.scale(new THREE.Vector3(scale, scale, scale));
  m.setPosition(up.multiplyScalar(R * 0.995));
  return m;
}

// Butikens delar i lokala koordinater (framsidan mot +z). Utan färg = butikens
// egen färg (markis och skyltband).
type Part = { size: [number, number, number]; at: [number, number, number]; tilt?: number; color?: string };
const PARTS: Part[] = [
  { size: [0.5, 0.44, 0.4], at: [0, 0.22, 0], color: C.wall }, // huset
  { size: [0.54, 0.05, 0.44], at: [0, 0.465, 0], color: C.roof }, // platt tak med kant
  { size: [0.27, 0.19, 0.02], at: [-0.07, 0.14, 0.201], color: C.glass }, // skyltfönster
  { size: [0.1, 0.24, 0.02], at: [0.165, 0.12, 0.201], color: C.door }, // dörr
  { size: [0.5, 0.03, 0.2], at: [0, 0.3, 0.27], tilt: 0.5 }, // markis
  { size: [0.5, 0.09, 0.02], at: [0, 0.39, 0.202] }, // skyltband
  { size: [0.3, 0.055, 0.02], at: [0, 0.39, 0.214], color: C.sign }, // skylt
];

type Props = {
  progress: RefObject<number>;
  stage: number;
  pills: StoryPill[];
  selectedSlug: string | null;
  isDesktop: boolean;
  entering: boolean;
  onReady: () => void;
  /** false = klotet syns inte, rita inga bildrutor. */
  active: boolean;
};

export default function GlobeScene(props: Props) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={props.active ? "always" : "never"}
      gl={{ antialias: true, powerPreference: "low-power" }}
      camera={{ fov: FOV, near: 0.3, far: 120, position: [0, 3, 18] }}
      style={{ pointerEvents: "none", touchAction: "pan-y" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        requestAnimationFrame(() => requestAnimationFrame(props.onReady));
      }}
    >
      <hemisphereLight args={["#fffaf2", "#e0d4bf", 2.1]} />
      <directionalLight position={[4, 6, 9]} intensity={1.4} color="#fff4e6" />
      <Globe {...props} />
      <ContactShadows position={[0, -R - 0.55, 0]} scale={R * 3} opacity={0.3} blur={2.6} far={2.4} resolution={256} frames={1} />
    </Canvas>
  );
}

function Globe({ progress, stage, pills, selectedSlug, isDesktop, entering }: Omit<Props, "active" | "onReady">) {
  const spinGroup = useRef<THREE.Group>(null);
  const spin = useRef(THREE.MathUtils.degToRad(-PIN_CENTER_LON));
  const enter = useRef(0);
  const look = useRef(new THREE.Vector3());
  const tmp = useRef({ pos: new THREE.Vector3(), lookAt: new THREE.Vector3(), shop: new THREE.Vector3() });

  // Klotet: platt skuggade trianglar, land och hav som färg per triangel.
  const planet = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(R, 7);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    const mid = new THREE.Vector3();
    for (let f = 0; f < pos.count; f += 3) {
      mid.set(0, 0, 0);
      for (let k = 0; k < 3; k++) mid.add(new THREE.Vector3().fromBufferAttribute(pos, f + k));
      mid.normalize();
      const land = isLand(mid);
      const shade = Math.sin(mid.x * 9.1 + mid.y * 7.3 + mid.z * 5.7);
      c.set(land ? (shade > 0.55 ? C.green : shade < -0.6 ? C.landAlt : C.land) : C.sea);
      for (let k = 0; k < 3; k++) colors.set([c.r, c.g, c.b], (f + k) * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  // Granar på land, en bit från butikerna (gyllene spiralen, samma varje gång).
  const trees = useMemo(() => {
    const out: THREE.Matrix4[] = [];
    const n = 140;
    for (let i = 0; i < n && out.length < 26; i++) {
      const y = 1 - (2 * (i + 0.5)) / n;
      const r = Math.sqrt(1 - y * y);
      const t = i * Math.PI * (3 - Math.sqrt(5));
      const d = new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r);
      if (!isLand(d) || SHOP_DIRS.some((s) => s.dot(d) > Math.cos(THREE.MathUtils.degToRad(9)))) continue;
      out.push(surfaceMatrix(d, 0, 0.7 + ((i * 37) % 10) / 30));
    }
    return out;
  }, []);

  const selectedIndex = Math.max(0, pills.findIndex((p) => p.slug === selectedSlug));

  useFrame((state, dt) => {
    const g = spinGroup.current;
    if (!g) return;
    const camera = state.camera;
    const p = progress.current ?? 0;
    const still = posterMode();
    const step = Math.min(dt, 0.1);

    // Rotation: fritt och långsamt i början, sedan vänds butikerna fram.
    if (!still) {
      if (p < 1.4) spin.current += 0.16 * step;
      else {
        const lon = p < 2.2 ? PIN_CENTER_LON : SHOPS[PIN_SHOPS[selectedIndex] ?? 0][1];
        spin.current = THREE.MathUtils.damp(spin.current, nearestAngle(spin.current, THREE.MathUtils.degToRad(-lon)), 3, step);
      }
    }
    g.rotation.y = spin.current;
    g.updateMatrixWorld();

    // Kameran: hela klotet i bild → in mot den valda butiken i steg 3 → dyk in vid tryck.
    const v = tmp.current;
    const half = THREE.MathUtils.degToRad(FOV / 2);
    const halfMin = Math.min(half, Math.atan(Math.tan(half) * (state.size.width / Math.max(1, state.size.height))));
    let dist = FIT_R / Math.sin(halfMin);
    const k = THREE.MathUtils.smoothstep(p, 2.2, 3);
    const shopIndex = PIN_SHOPS[selectedIndex] ?? 0;
    v.shop.copy(SHOP_DIRS[shopIndex]).multiplyScalar(R + 0.25).applyMatrix4(g.matrixWorld);
    // Steg 1–2: klotet sjunker lite, så att sökfältet ovanför inte täcker butikerna.
    const lower = THREE.MathUtils.smoothstep(p, 0.4, 1.1) * (isDesktop ? 0.9 : 1.5);
    v.lookAt.set(0, LOOK_Y + lower, 0).lerp(v.shop, k * (isDesktop ? 0.85 : 0.75));
    dist *= THREE.MathUtils.lerp(1, isDesktop ? 0.62 : 0.68, k);
    if (entering) enter.current = Math.min(1, enter.current + step / 0.75);
    const e = enter.current * enter.current * (3 - 2 * enter.current);
    dist = THREE.MathUtils.lerp(dist, R * 1.18, e);
    v.lookAt.lerp(v.shop, e);
    v.pos.set(0, Math.sin(ELEVATION) * dist, Math.cos(ELEVATION) * dist).add(new THREE.Vector3(v.lookAt.x, v.lookAt.y * 0.6, 0));

    if (still || entering) {
      camera.position.lerp(v.pos, still ? 1 : 0.25);
      look.current.lerp(v.lookAt, still ? 1 : 0.25);
    } else {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, v.pos.x, 4, step);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, v.pos.y, 4, step);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, v.pos.z, 4, step);
      look.current.x = THREE.MathUtils.damp(look.current.x, v.lookAt.x, 4, step);
      look.current.y = THREE.MathUtils.damp(look.current.y, v.lookAt.y, 4, step);
      look.current.z = THREE.MathUtils.damp(look.current.z, v.lookAt.z, 4, step);
    }
    camera.lookAt(look.current);
    if (still) reportPosterPins(camera, g);
  });

  return (
    <group rotation={[TILT, 0, 0]}>
      <group ref={spinGroup}>
        <mesh geometry={planet}>
          <meshStandardMaterial vertexColors roughness={0.95} flatShading />
        </mesh>
        {PARTS.map((part, i) => (
          <PartInstances key={i} part={part} />
        ))}
        <TreeInstances matrices={trees} />
        {stage >= 2 &&
          pills.map((pill, i) => {
            const shop = PIN_SHOPS[i];
            if (shop === undefined) return null;
            return (
              <Pill
                key={pill.slug}
                at={SHOP_DIRS[shop].clone().multiplyScalar(R + PILL_LIFT * SHOPS[shop][3])}
                label={pill.label}
                active={stage >= 3 && pill.slug === selectedSlug}
                delay={i * 160}
              />
            );
          })}
      </group>
    </group>
  );
}

/** En butiksdel på alla butiker (instancing). Markisen får en färg per butik. */
function PartInstances({ part }: { part: Part }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const local = new THREE.Matrix4()
      .makeRotationX(part.tilt ?? 0)
      .premultiply(new THREE.Matrix4().makeTranslation(...part.at))
      .multiply(new THREE.Matrix4().makeScale(...part.size));
    const c = new THREE.Color();
    SHOPS.forEach(([, , yaw, scale], i) => {
      mesh.setMatrixAt(i, surfaceMatrix(SHOP_DIRS[i], yaw, scale * SHOP_SCALE).multiply(local));
      if (!part.color) mesh.setColorAt(i, c.set(AWNINGS[i % AWNINGS.length]));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [part]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, SHOPS.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={part.color ?? "#ffffff"} roughness={0.88} />
    </instancedMesh>
  );
}

function TreeInstances({ matrices }: { matrices: THREE.Matrix4[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const local = new THREE.Matrix4().makeTranslation(0, 0.16, 0);
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m.clone().multiply(local)));
    mesh.instanceMatrix.needsUpdate = true;
  }, [matrices]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, matrices.length]}>
      <coneGeometry args={[0.1, 0.34, 6]} />
      <meshStandardMaterial color={C.tree} roughness={0.9} flatShading />
    </instancedMesh>
  );
}

/** Prislapp ovanför en butik. Döljs när butiken är på klotets baksida. */
function Pill({ at, label, active, delay }: { at: THREE.Vector3; label: string; active: boolean; delay: number }) {
  const anchor = useRef<THREE.Group>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const world = useRef(new THREE.Vector3());
  const normal = useRef(new THREE.Vector3());
  useFrame(({ camera }) => {
    const a = anchor.current;
    const el = wrap.current;
    if (!a || !el) return;
    a.getWorldPosition(world.current);
    normal.current.copy(world.current).normalize();
    const facing = normal.current.dot(camera.position.clone().sub(world.current).normalize());
    const opacity = THREE.MathUtils.clamp((facing - 0.05) / 0.25, 0, 1);
    el.style.opacity = String(opacity);
  });
  return (
    <group ref={anchor} position={at}>
      <Html center zIndexRange={[20, 0]} pointerEvents="none">
        <div ref={wrap} style={{ transition: "opacity 150ms" }}>
          <PricePill label={label} active={active} style={{ animationDelay: `${delay}ms` }} />
        </div>
      </Html>
    </group>
  );
}

/** Vinkeln närmast `from` som pekar åt samma håll som `to`. */
function nearestAngle(from: number, to: number): number {
  const full = Math.PI * 2;
  return to + Math.round((from - to) / full) * full;
}

// --- Stillbilden (poster) -------------------------------------------------
// Bara under utveckling: med window.__mapsaPosterMode står klotet still i
// hero-läget, och prislapparnas lägen (andelar av bilden) läggs i
// window.__mapsaPosterPins – så tas posterbilden och POSTER_PINS fram.

type PosterWindow = { __mapsaPosterMode?: boolean; __mapsaPosterPins?: { x: number; y: number }[] };

function posterMode(): boolean {
  return process.env.NODE_ENV !== "production" && Boolean((window as PosterWindow).__mapsaPosterMode);
}

function reportPosterPins(camera: THREE.Camera, g: THREE.Group) {
  (window as PosterWindow).__mapsaPosterPins = PIN_SHOPS.map((i) => {
    const v = SHOP_DIRS[i]
      .clone()
      .multiplyScalar(R + PILL_LIFT * SHOPS[i][3])
      .applyMatrix4(g.matrixWorld)
      .project(camera);
    return { x: +((v.x + 1) / 2).toFixed(4), y: +((1 - v.y) / 2).toFixed(4) };
  });
}
