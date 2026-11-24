"use client";

// Laddar 3D-ön först när sidan är klar (load + ledig tid), så att heron och
// stillbilden aldrig väntar på three.js. Renderar bara när ön syns.

import { useEffect, useRef, useState, type RefObject } from "react";
import dynamic from "next/dynamic";
import type { StoryPill } from "./story";

const IslandScene = dynamic(() => import("./island-scene"), { ssr: false });

let capable: boolean | null = null;

/** Klarar enheten 3D-ön? WebGL, inte "spara data", inte en svag enhet. */
export function can3D(): boolean {
  if (capable !== null) return capable;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  const weak = (nav.hardwareConcurrency ?? 8) < 4 || (nav.deviceMemory ?? 8) < 4;
  capable = webgl && !weak && !nav.connection?.saveData;
  return capable;
}

export function SceneLoader(props: {
  progress: RefObject<number>;
  stage: number;
  pills: StoryPill[];
  selectedSlug: string | null;
  isDesktop: boolean;
  onReady: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let idle = 0;
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const start = () => {
      idle = ric(() => !cancelled && setGo(true), { timeout: 3000 });
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      (window.cancelIdleCallback ?? window.clearTimeout)(idle);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref} className="absolute inset-0">{go && <IslandScene {...props} active={visible} />}</div>;
}
