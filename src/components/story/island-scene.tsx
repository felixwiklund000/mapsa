"use client";

// Ön på startsidan: en stiliserad low-poly-version av Trossö i Karlskrona.
// Rundad markplatta, 20 hus (box + sadeltak), granar, klippor och vatten som
// rör sig mjukt. Matt "lera"-känsla: MeshStandardMaterial med hög roughness,
// mjukt ljus och en enkel kontaktskugga – inga realtidsskuggor.
//
// Kameran och ön styrs av scroll-progress (0–3, en ref från Story):
//   0–1  ön roterar långsamt (hero, steg 1)
//   2    prislapparna poppar upp ovanför husen, en i taget
//   3    ön stannar, kameran glider in mot den valda prislappen
// Prislapparna är <PricePill> i HTML (drei <Html>), samma som på kartan.
// Ingen interaktion: ön går inte att vrida, och scroll går rakt igenom.
// Laddas bara via scene-loader.tsx (next/dynamic, ssr: false).

import { useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Html, Instance, Instances } from "@react-three/drei";
import * as THREE from "three";
import { PricePill } from "../price-pill";
import type { StoryPill } from "./story";

// Färger från design tokens (design-system.css) och kartans palett (map-style.ts).
const C = {
  ground: "#e2d9c8", // sand-deep
  groundSide: "#cfc3ad",
  wall: "#f6f1e8", // sand-light
  roof: "#c8643c", // terrakotta (dämpad flame)
  tree: "#7f9a6b",
  rock: "#a39a8c", // stone, ljusare
  water: "#b9d3e0", // kartans vatten, lite mer mättat i ljuset
  street: "#efe9de",
};

// Husen ligger i kvarter som på Trossö (rutnät), lite oregelbundet.
// [x, z, bredd, djup, höjd, vinkel]
type House = [number, number, number, number, number, number];
const HOUSES: House[] = [
  [-2.6, -1.6, 1.1, 0.8, 0.7, 0], [-1.2, -1.9, 0.9, 0.8, 0.9, 0], [0.2, -2.0, 1.2, 0.8, 0.8, 0],
  [1.6, -1.7, 1.0, 0.8, 0.7, 0], [2.9, -1.2, 0.9, 0.7, 0.6, 0.1],
  [-3.1, -0.1, 0.9, 0.8, 0.6, 0], [-1.7, -0.3, 1.1, 0.9, 0.8, 0], [-0.2, -0.4, 1.0, 0.8, 1.0, 0],
  [1.3, -0.2, 1.2, 0.8, 0.8, 0], [2.8, 0.2, 1.0, 0.8, 0.7, 0],
  [-2.7, 1.4, 1.0, 0.8, 0.7, 0], [-1.2, 1.3, 1.2, 0.8, 0.8, 0], [0.3, 1.2, 0.9, 0.8, 0.9, 0],
  [1.7, 1.4, 1.1, 0.8, 0.7, 0], [3.0, 1.6, 0.8, 0.7, 0.6, -0.1],
  [-1.9, 2.7, 1.0, 0.7, 0.6, 0.05], [-0.4, 2.8, 1.1, 0.8, 0.7, 0], [1.1, 2.7, 0.9, 0.7, 0.6, 0],
  [-0.9, -3.2, 1.0, 0.7, 0.6, 0], [0.8, -3.2, 1.0, 0.7, 0.7, 0],
];

/** Husen som får en prislapp (i den ordning prislapparna visas). */
export const PIN_HOUSES = [7, 10, 9, 16, 3];

const TREES: [number, number, number][] = [
  [-4.3, 0.8, 1], [-4.0, -1.4, 0.8], [-3.6, 2.6, 0.9], [-3.4, -2.8, 0.8], [4.2, -0.6, 1],
  [4.0, 1.3, 0.8], [3.5, 2.9, 0.9], [3.7, -2.5, 0.8], [-2.2, -3.9, 0.7], [2.2, -3.6, 0.9],
  [-0.2, 4.1, 0.8], [1.8, 3.9, 0.7], [-2.0, 3.8, 0.9], [2.4, 0.95, 0.6], [-0.95, 0.5, 0.6],
];
const ROCKS: [number, number, number][] = [
  [-5.1, 1.9, 0.5], [-4.7, -2.6, 0.4], [4.9, -1.9, 0.45], [4.6, 2.6, 0.35], [0.4, 5.0, 0.4], [-1.6, -4.9, 0.35],
];

const ISLAND_R = 5;
const WATER_R = 8;
// Kameran: höjdvinkel och hur stor del av scenen som ska rymmas i bild.
const ELEVATION = THREE.MathUtils.degToRad(36);
const FIT_R = 8.6;
const FOV = 30;
const roofTop = (h: House) => h[4] + Math.min(h[2], h[3]) * 0.38;

type Props = {
  progress: RefObject<number>;
  stage: number;
  pills: StoryPill[];
  selectedSlug: string | null;
  isDesktop: boolean;
  onReady: () => void;
  /** false = ön syns inte, rita inga bildrutor. */
  active: boolean;
};

export default function IslandScene(props: Props) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={props.active ? "always" : "never"}
      gl={{ antialias: true, powerPreference: "low-power" }}
      camera={{ fov: FOV, near: 0.5, far: 120, position: [0, 9, 14] }}
      style={{ pointerEvents: "none", touchAction: "pan-y" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        // Första bildrutan är ritad → stillbilden kan tona bort.
        requestAnimationFrame(() => requestAnimationFrame(props.onReady));
      }}
    >
      <hemisphereLight args={["#fff8ee", "#d8ccb6", 1.5]} />
      <directionalLight position={[5, 9, 4]} intensity={1.6} color="#fff4e6" />
      <Water />
      <Island progress={props.progress} stage={props.stage} pills={props.pills} selectedSlug={props.selectedSlug} isDesktop={props.isDesktop} />
    </Canvas>
  );
}

// Låg vattenplatta som rör sig mjukt (få hörn, platt skuggning).
function Water() {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.RingGeometry(0.01, WATER_R, 36, 9);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo]);
  useFrame(({ clock }) => {
    if (posterMode()) return;
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.elapsedTime * 0.6;
    const pos = mesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      const z = base[i * 3 + 2];
      // Kanten står still, så att vattnet ser ut som en lugn rund bassäng.
      const edge = 1 - Math.min(1, Math.hypot(x, z) / WATER_R) ** 4;
      pos.setY(i, (Math.sin(x * 0.55 + t) * 0.06 + Math.cos(z * 0.45 + t * 0.8) * 0.06) * edge);
    }
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  });
  return (
    <>
      <mesh ref={ref} geometry={geo} position={[0, -0.32, 0]}>
        <meshStandardMaterial color={C.water} roughness={0.7} flatShading />
      </mesh>
      {/* Mjuk skugga under hela ön (räknas en gång) */}
      <ContactShadows position={[0, -0.36, 0]} scale={WATER_R * 2.6} opacity={0.28} blur={3} far={2} resolution={256} frames={1} />
    </>
  );
}

function Island({ progress, stage, pills, selectedSlug, isDesktop }: Omit<Props, "active" | "onReady">) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const look = useRef(new THREE.Vector3());
  const tmp = useRef({
    pos: new THREE.Vector3(),
    lookAt: new THREE.Vector3(),
    target: new THREE.Vector3(),
    close: new THREE.Vector3(),
  });

  // Delade geometrier: sadeltak = trekantigt prisma (cylinder med 3 sidor).
  const roofGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.5, 0.5, 1, 3, 1);
    g.rotateZ(Math.PI / 2);
    g.rotateX(Math.PI / 2 + Math.PI / 6);
    g.scale(1, 0.72, 1);
    return g;
  }, []);

  const selectedIndex = Math.max(0, pills.findIndex((p) => p.slug === selectedSlug));

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const camera = state.camera;
    const p = progress.current ?? 0;
    const still = posterMode();
    // Ön snurrar långsamt i hero och steg 1–2, och stannar mjukt inför steg 3.
    const speed = still ? 0 : THREE.MathUtils.lerp(0.12, 0, THREE.MathUtils.smoothstep(p, 1.6, 2.6));
    spin.current += speed * Math.min(dt, 0.1);
    g.rotation.y = spin.current;

    // Kameran: hela ön i bild (avståndet räknas ur bildformatet) → i steg 3
    // in mot den valda prislappen.
    const v = tmp.current;
    const half = THREE.MathUtils.degToRad(FOV / 2);
    const halfMin = Math.min(half, Math.atan(Math.tan(half) * (state.size.width / Math.max(1, state.size.height))));
    const dist = FIT_R / Math.sin(halfMin);
    v.pos.set(0, Math.sin(ELEVATION) * dist, Math.cos(ELEVATION) * dist);
    v.lookAt.set(0, -0.2, 0);
    const k = THREE.MathUtils.smoothstep(p, 2.2, 3);
    const house = HOUSES[PIN_HOUSES[selectedIndex] ?? PIN_HOUSES[0]];
    g.updateMatrixWorld();
    v.target.set(house[0], roofTop(house), house[1]).applyMatrix4(g.matrixWorld);
    // Nära: halva avståndet. Mobil: titta lite framför lappen så att den
    // hamnar i övre delen av bilden (kortet ligger nedtill).
    const near = dist * 0.48;
    v.close.set(v.target.x + (isDesktop ? 0.8 : 0), v.target.y + Math.sin(ELEVATION) * near, v.target.z + Math.cos(ELEVATION) * near);
    const wantPos = v.pos.lerp(v.close, k);
    v.target.z += isDesktop ? 0.4 : 1.6;
    v.target.y -= isDesktop ? 0 : 0.6;
    const wantLook = v.lookAt.lerp(v.target, k);
    if (still) {
      camera.position.copy(wantPos);
      look.current.copy(wantLook);
    } else {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, wantPos.x, 4, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, wantPos.y, 4, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, wantPos.z, 4, dt);
      look.current.x = THREE.MathUtils.damp(look.current.x, wantLook.x, 4, dt);
      look.current.y = THREE.MathUtils.damp(look.current.y, wantLook.y, 4, dt);
      look.current.z = THREE.MathUtils.damp(look.current.z, wantLook.z, 4, dt);
    }
    camera.lookAt(look.current);
    if (still) reportPosterPins(state.camera, g, state.size);
  });

  return (
    <group ref={group}>
      {/* Markplattan: rundad, låg-poly */}
      <mesh position={[0, -0.25, 0]} scale={[1, 1, 0.86]}>
        <cylinderGeometry args={[ISLAND_R, ISLAND_R + 0.35, 0.6, 14, 1]} />
        <meshStandardMaterial color={C.groundSide} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.86, 1]}>
        <circleGeometry args={[ISLAND_R, 14]} />
        <meshStandardMaterial color={C.ground} roughness={0.95} flatShading />
      </mesh>
      {/* Gator: två ljusa stråk genom kvarteren */}
      <mesh position={[0, 0.056, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.2, 0.32]} />
        <meshStandardMaterial color={C.street} roughness={1} />
      </mesh>
      <mesh position={[0.55, 0.057, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[6.8, 0.28]} />
        <meshStandardMaterial color={C.street} roughness={1} />
      </mesh>

      {/* Husen (instancing): väggar och tak */}
      <Instances limit={HOUSES.length}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={C.wall} roughness={0.9} />
        {HOUSES.map(([x, z, w, d, h, r], i) => (
          <Instance key={i} position={[x, 0.05 + h / 2, z]} scale={[w, h, d]} rotation={[0, r, 0]} />
        ))}
      </Instances>
      <Instances limit={HOUSES.length} geometry={roofGeo}>
        <meshStandardMaterial color={C.roof} roughness={0.85} flatShading />
        {HOUSES.map(([x, z, w, d, h, r], i) => (
          <Instance
            key={i}
            position={[x, 0.05 + h + Math.min(w, d) * 0.18, z]}
            scale={[w * 1.08, Math.min(w, d) * 0.5, d * 1.08]}
            rotation={[0, r, 0]}
          />
        ))}
      </Instances>

      {/* Granar */}
      <Instances limit={TREES.length}>
        <coneGeometry args={[0.32, 1, 6]} />
        <meshStandardMaterial color={C.tree} roughness={0.9} flatShading />
        {TREES.map(([x, z, s], i) => (
          <Instance key={i} position={[x, 0.05 + s * 0.5, z]} scale={[s, s, s]} />
        ))}
      </Instances>

      {/* Klippor i strandkanten */}
      <Instances limit={ROCKS.length}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={C.rock} roughness={0.95} flatShading />
        {ROCKS.map(([x, z, s], i) => (
          <Instance key={i} position={[x, -0.1, z]} scale={[s, s * 0.7, s]} rotation={[0.3 * i, i, 0]} />
        ))}
      </Instances>

      {/* Mjuk skugga under husen (räknas en gång) */}
      <ContactShadows position={[0, 0.06, 0]} scale={11} opacity={0.32} blur={2.2} far={1.6} resolution={256} frames={1} />

      {/* Prislapparna – samma PricePill som på kartan */}
      {stage >= 2 &&
        pills.map((pill, i) => {
          const h = HOUSES[PIN_HOUSES[i]];
          if (!h) return null;
          return (
            <Html key={pill.slug} position={[h[0], roofTop(h) + 0.45, h[1]]} center zIndexRange={[20, 0]} pointerEvents="none">
              <PricePill
                label={pill.label}
                active={stage >= 3 && pill.slug === selectedSlug}
                style={{ animationDelay: `${i * 160}ms` }}
              />
            </Html>
          );
        })}
    </group>
  );
}

// --- Stillbilden (poster) -------------------------------------------------
// Bara under utveckling: med window.__mapsaPosterMode står ön still i hero-
// läget, och prislapparnas lägen (andelar av bilden) läggs i
// window.__mapsaPosterPins – så tas posterbilden och POSTER_PINS fram.

type PosterWindow = { __mapsaPosterMode?: boolean; __mapsaPosterPins?: { x: number; y: number }[] };

function posterMode(): boolean {
  return process.env.NODE_ENV !== "production" && Boolean((window as PosterWindow).__mapsaPosterMode);
}

function reportPosterPins(camera: THREE.Camera, g: THREE.Group, size: { width: number; height: number }) {
  g.updateMatrixWorld();
  (window as PosterWindow).__mapsaPosterPins = PIN_HOUSES.map((i) => {
    const h = HOUSES[i];
    const v = new THREE.Vector3(h[0], roofTop(h) + 0.45, h[1]).applyMatrix4(g.matrixWorld).project(camera);
    return { x: +((v.x + 1) / 2).toFixed(4), y: +((1 - v.y) / 2).toFixed(4) };
  });
  void size;
}
