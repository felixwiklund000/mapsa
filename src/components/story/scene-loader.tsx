"use client";

// Laddar 3D-ön först när besökaren gör något (scrollar, rör musen, trycker
// eller använder tangentbordet) och sidan är klar. Fram till dess visas
// stillbilden, som är tagen ur scenen i samma läge – bytet syns inte. Så
// väntar heron aldrig på three.js. Renderar bara när ön syns.

import { useEffect, useRef, useState, type RefObject } from "react";
import dynamic from "next/dynamic";
import type { StoryPill } from "./story";

const IslandScene = dynamic(() => import("./island-scene"), { ssr: false });

/** Klarar enheten 3D-ön? Inte "spara data" och inte en svag enhet (billig koll). */
export function deviceCan3D(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const weak = (nav.hardwareConcurrency ?? 8) < 4 || (nav.deviceMemory ?? 8) < 4;
  return !weak && !nav.connection?.saveData;
}

/** Finns WebGL? Görs först när ön ska laddas – att skapa en kontext kostar. */
function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function SceneLoader(props: {
  progress: RefObject<number>;
  stage: number;
  pills: StoryPill[];
  selectedSlug: string | null;
  isDesktop: boolean;
  onReady: () => void;
  /** WebGL saknas: visa stillbild och kort i stället. */
  onUnsupported: () => void;
}) {
  const { onUnsupported, ...sceneProps } = props;
  const unsupported = useRef(onUnsupported);
  useEffect(() => {
    unsupported.current = onUnsupported;
  });
  const ref = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let idle = 0;
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const events = ["scroll", "pointermove", "pointerdown", "touchstart", "keydown", "wheel"] as const;
    const start = () => {
      events.forEach((e) => window.removeEventListener(e, onInteract));
      const go = () => {
        idle = ric(
          () => {
            if (cancelled) return;
            if (hasWebGL()) setGo(true);
            else unsupported.current();
          },
          { timeout: 1000 },
        );
      };
      if (document.readyState === "complete") go();
      else window.addEventListener("load", go, { once: true });
    };
    const onInteract = () => start();
    events.forEach((e) => window.addEventListener(e, onInteract, { passive: true, once: true }));
    return () => {
      cancelled = true;
      events.forEach((e) => window.removeEventListener(e, onInteract));
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

  return <div ref={ref} className="absolute inset-0">{go && <IslandScene {...sceneProps} active={visible} />}</div>;
}
