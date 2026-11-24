"use client";

// Startsidans berättelse: heron och tre steg medan ön ligger kvar (sticky).
//   0 hero  ·  1 "Sök det du letar efter."  ·  2 "Se alla priser direkt."
//   3 "Boka där de redan tar bokningar." + "Öppna kartan"
// Desktop: texten till vänster, ön till höger. Mobil: ön överst, texten under.
// Scroll-progress (0–3) räknas fram ur var textblocken ligger och skrivs till
// en ref – scenen läser den varje bildruta utan att React renderar om.
// Utan 3D (ingen WebGL, svag enhet, reducerad rörelse): stillbild och tre
// vanliga kort i stället.

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PricePill } from "../price-pill";
import { SearchBarPreview } from "../search-bar";
import { SelectedCard, type CardItem } from "../selected-card";
import { POSTER, POSTER_PINS } from "./poster";

export type StoryPill = { slug: string; label: string };

export const STEPS = ["Sök det du letar efter.", "Se alla priser direkt.", "Boka där de redan tar bokningar."];
const QUERY = "frisör";
const DESKTOP = "(min-width: 1024px)";

/** En mediefråga som följs live (servern antar `server`). */
function useMedia(query: string, server: boolean): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => server,
  );
}

export function Story({ hero, pills, card }: { hero: ReactNode; pills: StoryPill[]; card: CardItem | null }) {
  const isDesktop = useMedia(DESKTOP, true);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const mode = reduced ? "cards" : "story";
  const [stage, setStage] = useState(0);
  const [typed, setTyped] = useState(0);
  const progress = useRef(0);
  const blocks = useRef<(HTMLElement | null)[]>([]);

  // Scroll → progress (0–3) och steg.
  useEffect(() => {
    if (mode !== "story") return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const anchor = window.innerHeight * (isDesktop ? 0.5 : 0.78);
      const centers = blocks.current.map((el) => {
        const r = el?.getBoundingClientRect();
        return r ? r.top + r.height / 2 : 0;
      });
      let p = 0;
      if (anchor >= centers[centers.length - 1]) p = centers.length - 1;
      else
        for (let i = 0; i < centers.length - 1; i++) {
          if (anchor >= centers[i] && anchor < centers[i + 1]) {
            p = i + (anchor - centers[i]) / Math.max(1, centers[i + 1] - centers[i]);
            break;
          }
        }
      progress.current = p;
      setStage(Math.min(3, Math.floor(p + 0.35)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mode, isDesktop]);

  // Steg 1: "frisör" skrivs in, en bokstav i taget (en gång).
  const startedTyping = stage >= 1;
  useEffect(() => {
    if (!startedTyping) return;
    const id = window.setInterval(() => {
      setTyped((n) => {
        if (n >= QUERY.length) window.clearInterval(id);
        return Math.min(QUERY.length, n + 1);
      });
    }, 120);
    return () => window.clearInterval(id);
  }, [startedTyping]);

  const shown = pills.slice(0, isDesktop ? 5 : 3);
  const selectedSlug = card?.slug ?? shown[0]?.slug ?? null;

  if (mode === "cards") return <StoryCards hero={hero} pills={shown} card={card} />;

  const posterPins = isDesktop ? POSTER_PINS.desktop : POSTER_PINS.mobile;

  return (
    <section aria-label="Så funkar Mapsa" className="relative lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Ön: ligger kvar medan texten scrollar förbi */}
      <div className="sticky top-0 z-10 h-[56dvh] bg-sand lg:order-2 lg:z-0 lg:h-dvh">
        <div className="relative h-full overflow-hidden">
          <Poster />

          {/* Prislapparna ovanför husen */}
          {stage >= 2 &&
            shown.map((pill, i) => {
              const at = posterPins[i];
              if (!at) return null;
              return (
                <PricePill
                  key={pill.slug}
                  label={pill.label}
                  active={stage >= 3 && pill.slug === selectedSlug}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${at.x * 100}%`, top: `${at.y * 100}%`, animationDelay: `${i * 160}ms` }}
                />
              );
            })}

          {/* Steg 1–2: sökfältet svävar ovanför ön */}
          <div
            className={`absolute top-[7%] left-1/2 w-[min(86%,420px)] -translate-x-1/2 transition-[opacity,translate] duration-500 ease-out ${
              stage === 1 || stage === 2 ? "opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
            }`}
          >
            <SearchBarPreview text={QUERY.slice(0, typed)} caret={stage === 1 && typed < QUERY.length} />
          </div>

          {/* Steg 3: kortet fälls ut */}
          {card && (
            <div
              inert
              className={`absolute bottom-[5%] left-1/2 w-[min(92%,360px)] -translate-x-1/2 rounded-2xl bg-canvas p-4 text-ink shadow-float transition-[opacity,translate] duration-500 ease-out lg:right-[6%] lg:bottom-[12%] lg:left-auto lg:translate-x-0 ${
                stage >= 3 ? "opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <SelectedCard item={card} />
            </div>
          )}
        </div>
      </div>

      {/* Texten */}
      <div className="relative px-4 sm:px-8 lg:order-1 lg:pr-0 lg:pl-16">
        <div ref={(el) => void (blocks.current[0] = el)} className="py-8 lg:flex lg:min-h-[calc(100dvh-4rem)] lg:items-center lg:py-0">
          <div className="w-full">{hero}</div>
        </div>
        {STEPS.map((text, i) => (
          <div
            key={text}
            ref={(el) => void (blocks.current[i + 1] = el)}
            className="flex min-h-[60dvh] items-center lg:min-h-dvh"
          >
            <div>
              <p className="font-mono text-xs tracking-[0.08em] text-stone uppercase">Steg {i + 1}</p>
              <h2 className="mt-3 max-w-[16ch] font-serif text-headline text-balance">{text}</h2>
              {i === 2 && <OpenMap className="mt-8" />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function OpenMap({ className = "" }: { className?: string }) {
  return (
    <Link href="/karta" className={`btn-primary w-full gap-2 sm:inline-flex sm:w-auto sm:px-8 ${className}`}>
      Öppna kartan
      <ArrowRight className="size-5" strokeWidth={2.25} aria-hidden />
    </Link>
  );
}

/** Stillbilden av ön (eller en lugn yta tills den finns). */
function Poster() {
  if (!POSTER) return <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_55%,#e2d9c8_0%,#ede6d9_70%)]" />;
  return (
    <picture>
      <source media={DESKTOP} srcSet={POSTER.desktop} />
      <img
        src={POSTER.mobile}
        alt="Ön Trossö i Karlskrona med små hus och prislappar"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </picture>
  );
}

// Utan 3D: stillbilden och de tre stegen som vanliga kort.
function StoryCards({ hero, pills, card }: { hero: ReactNode; pills: StoryPill[]; card: CardItem | null }) {
  return (
    <section aria-label="Så funkar Mapsa" className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-8 lg:px-16">
      <div className="py-8 lg:py-16">{hero}</div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl lg:aspect-[21/9]">
        <Poster />
      </div>
      <ol className="mt-10 grid gap-4 lg:grid-cols-3">
        {STEPS.map((text, i) => (
          <li key={text} className="flex flex-col rounded-3xl bg-sand-light p-6">
            <p className="font-mono text-xs tracking-[0.08em] text-stone uppercase">Steg {i + 1}</p>
            <h2 className="mt-3 font-serif text-3xl text-balance">{text}</h2>
            <div inert className="mt-6 text-ink">
              {i === 0 && <SearchBarPreview text={QUERY} />}
              {i === 1 && (
                <div className="flex flex-wrap gap-2">
                  {pills.map((p) => (
                    <PricePill key={p.slug} label={p.label} />
                  ))}
                </div>
              )}
              {i === 2 && card && (
                <div className="rounded-2xl bg-canvas p-4 shadow-float">
                  <SelectedCard item={card} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      <OpenMap className="mt-10" />
    </section>
  );
}
