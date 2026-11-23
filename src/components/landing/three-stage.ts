// Gemensam grund för landningssidans 3D-scener (three.js): renderare, kamera,
// ljus, storleksändring och en animationsloop som bara går när scenen syns.
// Med "reducerad rörelse" ritas scenen en gång i sitt slutläge.

import * as THREE from "three";

export type StageOptions = {
  fov: number;
  /** Kamerans riktning från målpunkten (normaliseras) och avstånd. */
  direction: [number, number, number];
  distance: number;
  target: [number, number, number];
  /** Smala/höga ytor: flytta kameran bakåt så att allt får plats. */
  fitAspect?: number;
  shadowSize?: number;
  /** Anropas varje bildruta. `t` = sekunder sedan scenen först syntes. */
  onFrame: (t: number, stage: Stage) => void;
};

export type Stage = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  width: number;
  height: number;
  reducedMotion: boolean;
  /** Kamerans avstånd som andel av normalläget (1 = normalt, >1 = längre bort). */
  zoom: number;
  dispose: () => void;
};

export function createStage(container: HTMLElement, opts: StageOptions): Stage {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.setAttribute("aria-hidden", "true");
  container.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(opts.fov, 1, 0.1, 200);
  const target = new THREE.Vector3(...opts.target);
  const dir = new THREE.Vector3(...opts.direction).normalize();

  // Mjukt dagsljus: himmel + mark, och en sol som kastar mjuka skuggor.
  scene.add(new THREE.HemisphereLight("#ffffff", "#dfe2e6", 1.9));
  const sun = new THREE.DirectionalLight("#ffffff", 2.4);
  sun.position.set(5, 10, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const s = opts.shadowSize ?? 6;
  Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 30 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 4;
  scene.add(sun);

  const stage: Stage = { renderer, scene, camera, width: 1, height: 1, reducedMotion, zoom: 1, dispose };

  let fit = 1;
  const placeCamera = () => {
    camera.position.copy(target).addScaledVector(dir, opts.distance * fit * stage.zoom);
    camera.lookAt(target);
  };

  let raf = 0;
  let visible = false;
  let started = 0; // när scenen först syntes (ms)
  let initialized = false;

  const render = (now: number) => {
    if (!started) started = now;
    opts.onFrame(reducedMotion ? 1000 : (now - started) / 1000, stage);
    placeCamera();
    renderer.render(scene, camera);
  };
  const loop = (now: number) => {
    render(now);
    raf = requestAnimationFrame(loop);
  };
  const play = () => {
    cancelAnimationFrame(raf);
    if (reducedMotion) render(performance.now());
    else if (visible && !document.hidden) raf = requestAnimationFrame(loop);
  };

  const resize = () => {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    stage.width = w;
    stage.height = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    fit = opts.fitAspect ? Math.max(1, opts.fitAspect / camera.aspect) : 1;
    placeCamera();
    camera.updateProjectionMatrix();
    // Rita om direkt vid storleksändring (inte första gången – då är scenen inte byggd än).
    if (initialized && (!raf || reducedMotion)) render(performance.now());
  };

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) play();
    else cancelAnimationFrame(raf);
  });
  io.observe(container);
  const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : play());
  document.addEventListener("visibilitychange", onVisibility);
  resize();
  initialized = true;

  function dispose() {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        for (const m of [obj.material].flat()) m.dispose();
      }
    });
    renderer.dispose();
    renderer.domElement.remove();
  }

  return stage;
}

/** Rundad rektangel (för plattor och ytor), i XY-planet. */
export function roundedRect(w: number, h: number, r: number): THREE.Shape {
  const x = -w / 2;
  const y = -h / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/** En platt rundad yta som ligger på marken (y = höjd). */
export function flatPatch(w: number, d: number, r: number, color: string, y: number, opts: THREE.MeshStandardMaterialParameters = {}) {
  const geo = new THREE.ShapeGeometry(roundedRect(w, d, r), 6);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 1, ...opts }));
  mesh.position.y = y;
  mesh.receiveShadow = true;
  return mesh;
}

/** Tjock rundad platta (sockeln som allt står på). Ovansidan hamnar på y = 0. */
export function slab(w: number, d: number, r: number, depth: number, color: string) {
  const bevel = 0.06;
  const geo = new THREE.ExtrudeGeometry(roundedRect(w, d, r), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 12,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -(depth + bevel), 0);
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.9 }));
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return mesh;
}

/** Litet deterministiskt slumptal, så att staden ser likadan ut varje gång. */
export function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const easeOutCubic = (t: number) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;
export const easeOutBack = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  const c = 1.4;
  return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2;
};
