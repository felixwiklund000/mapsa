"use client";

// Startsidan för privatpersoner (första besöket på /): mjuk himmel, rubrik,
// sökrutan i mitten med kategoriknappar, och 3D-staden nedanför. När man
// söker, väljer kategori eller trycker "Öppna kartan" tonar den bort och
// kartan syns. Återkommande besökare hoppar över den (localStorage).
//
// Döljs redan innan sidan blir interaktiv av ett litet skript i page.tsx
// (data-start="dold" på <html>), så att återkommande inte ser den blinka.

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { CityScene } from "@/components/landing/scenes";
import { Logo } from "@/components/site-header";

export const START_SEEN_KEY = "mapsa-sett-start";

const CHIPS = [
  { slug: "frisor", label: "Frisör" },
  { slug: "massage", label: "Massage" },
  { slug: "pt", label: "PT" },
  { slug: "naprapat", label: "Naprapat" },
  { slug: "skonhet", label: "Skönhet" },
];

/** Skriptet som döljer heron före hydrering (körs i <head>-ordning i page.tsx). */
export const START_HIDE_SCRIPT = `try{var s=location.search;if(!/[?&]start=1/.test(s)&&(localStorage.getItem("${START_SEEN_KEY}")||/[?&](q|kategori|omrade)=/.test(s)))document.documentElement.dataset.start="dold"}catch(e){}`;

function markSeen() {
  try {
    localStorage.setItem(START_SEEN_KEY, "1");
  } catch {
    // privat läge – heron visas igen nästa gång, inget farligt
  }
}

const subscribe = () => () => {};
const visibleOnClient = () => document.documentElement.dataset.start !== "dold";

export function StartHero() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  // 3D-staden laddas bara om heron faktiskt visas.
  const visible = useSyncExternalStore(subscribe, visibleOnClient, () => false);

  function dismiss() {
    markSeen();
    setLeaving(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => setGone(true), reduce ? 0 : 600);
  }

  if (gone) return null;

  return (
    <section
      id="start"
      aria-label="Välkommen till Mapsa"
      className={`start-hero fixed inset-0 z-50 flex flex-col overflow-hidden bg-[linear-gradient(180deg,#bcdcf3_0%,#dbe9ef_45%,#ede6d9_100%)] text-panel transition-[opacity,transform] duration-600 ease-out ${
        leaving ? "pointer-events-none scale-[1.03] opacity-0" : ""
      }`}
    >
      {/* Toppbar: svävande vit pill */}
      <header className="relative z-10 px-3 pt-[max(12px,env(safe-area-inset-top))] sm:pt-5">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 rounded-2xl bg-white/85 py-2 pr-2 pl-4 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)] backdrop-blur-md">
          <Logo />
          <nav aria-label="Sidor" className="ml-auto flex items-center gap-1 sm:ml-6">
            <button type="button" onClick={dismiss} className="hidden rounded-lg px-3 py-2 text-sm font-medium text-panel/75 hover:text-panel sm:block">
              Kartan
            </button>
            <Link href="/foretag" className="rounded-lg px-3 py-2 text-sm font-medium text-panel/75 hover:text-panel">
              För företag
            </Link>
          </nav>
          <button
            type="button"
            onClick={dismiss}
            className="pressable flex h-10 items-center gap-1.5 rounded-xl bg-panel px-4 text-sm font-medium text-white sm:ml-auto"
          >
            Öppna kartan
          </button>
        </div>
      </header>

      {/* Mitten: rubrik, sök, kategorier */}
      <div className="landing-rise relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center px-5 pt-[7vh] text-center sm:pt-[10vh]">
        <h2 className="font-serif text-[clamp(2.6rem,1.4rem+4.6vw,5rem)] leading-[0.98] tracking-[-0.025em] text-balance">
          Massage, PT, frisör och mer i Blekinge
        </h2>
        <p className="mt-4 text-lg text-panel/70">Se priset direkt. Du bokar hos utövaren.</p>

        <form action="/" method="get" role="search" onSubmit={markSeen} className="mt-8 w-full">
          <label className="flex h-16 items-center gap-3 rounded-full bg-white pr-2 pl-6 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.35)] ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-panel/30">
            <Search className="size-6 shrink-0 text-panel" strokeWidth={2} aria-hidden />
            <span className="sr-only">Sök på tjänst, namn eller område</span>
            <input
              name="q"
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              placeholder="Vad letar du efter?"
              className="h-12 min-w-0 flex-1 bg-transparent text-lg placeholder:text-panel/45 focus:outline-none"
            />
            <button type="submit" aria-label="Sök" className="pressable flex size-12 shrink-0 items-center justify-center rounded-full bg-flame text-white">
              <ArrowRight className="size-5" strokeWidth={2.25} aria-hidden />
            </button>
          </label>
        </form>

        <ul className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Kategorier">
          {CHIPS.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/?kategori=${c.slug}`}
                onClick={markSeen}
                className="pressable flex h-10 items-center rounded-full bg-white/70 px-4 text-sm font-semibold text-panel ring-1 ring-black/5 backdrop-blur hover:bg-white"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 3D-staden längst ner */}
      <div className="pointer-events-none relative mt-auto h-[38vh] min-h-[240px] w-full sm:h-[46vh]">
        {visible && <CityScene accent="#ff5a1f" />}
      </div>
    </section>
  );
}
