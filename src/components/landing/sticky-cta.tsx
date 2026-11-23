"use client";

// Mobil: klistrad knapp "Lägg upp ditt företag" längst ner. Syns överallt på
// /foretag utom när anmälan (#anmal) är i bild.

import { useEffect, useState } from "react";

export function StickyCta() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const form = document.getElementById("anmal");
    const hero = document.getElementById("akt-1-knapp");
    let formVisible = false;
    let heroVisible = true;
    const update = () => setHidden(formVisible || heroVisible);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === form) formVisible = e.isIntersecting;
        if (e.target === hero) heroVisible = e.isIntersecting;
      }
      update();
    });
    if (form) io.observe(form);
    if (hero) io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 transition-[opacity,transform] duration-300 lg:hidden ${
        hidden ? "pointer-events-none translate-y-4 opacity-0" : ""
      }`}
      aria-hidden={hidden}
    >
      <a
        href="#anmal"
        tabIndex={hidden ? -1 : 0}
        className="pressable flex h-14 items-center justify-center rounded-full bg-flame text-lg font-medium text-white shadow-[0_12px_30px_-10px_rgb(255_90_31/0.8)]"
      >
        Lägg upp ditt företag
      </a>
    </div>
  );
}
