"use client";

// 3D-staplar för "klickstatistik"-kortet: staplar som växer upp när kortet
// syns, den sista svart. Illustration – inga riktiga siffror.

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { createStage, easeOutBack, flatPatch, slab } from "./three-stage";

const HEIGHTS = [0.55, 0.85, 0.7, 1.1, 0.95, 1.4, 1.95];

export default function ClicksScene() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const world = new THREE.Group();
    world.add(slab(4.6, 1.9, 0.45, 0.25, "#ffffff"));
    world.add(flatPatch(4.35, 1.65, 0.35, "#f3f3f3", 0.002));

    const light = new THREE.MeshStandardMaterial({ color: "#d6d6d3", roughness: 0.6 });
    const dark = new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0.35, metalness: 0.1 });
    const bars = HEIGHTS.map((h, i) => {
      const geo = new RoundedBoxGeometry(0.38, h, 0.38, 3, 0.08);
      geo.translate(0, h / 2, 0);
      const mesh = new THREE.Mesh(geo, i === HEIGHTS.length - 1 ? dark : light);
      mesh.position.set(-1.65 + i * 0.55, 0, 0);
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.scale.y = 0.001;
      world.add(mesh);
      return mesh;
    });

    const stage = createStage(el, {
      fov: 28,
      direction: [0.55, 0.7, 1],
      distance: 9.5,
      target: [0, 0.55, 0],
      fitAspect: 1.6,
      shadowSize: 4,
      onFrame: (t) => {
        world.rotation.y = -0.25 + Math.sin(t * 0.3) * 0.12;
        bars.forEach((bar, i) => (bar.scale.y = Math.max(0.001, easeOutBack((t - 0.2 - i * 0.1) / 0.7))));
      },
    });
    stage.scene.add(world);
    return () => stage.dispose();
  }, []);

  return <div ref={ref} className="h-full w-full" />;
}
