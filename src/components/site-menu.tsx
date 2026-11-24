"use client";

// Meny i Airbnb-stil: en rund "pill"-knapp (☰ + Mapsa-nål) som öppnar en
// rullgardin för att hoppa mellan kartan och företagssidan.
// Stängs vid klick utanför, Esc, eller när man väljer något.
//
// variant="pill"  – i sidhuvuden (desktop, profilsidor, företagssidan)
// variant="round" – rund 60 px knapp bredvid sökfältet på mobilen

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { MapsaMark } from "./brand";
import { CircleHelp, Map, Menu, Store, X, type LucideIcon } from "lucide-react";

type Item = { href: string; label: string; hint?: string; icon: LucideIcon; match?: string };

// Privatpersoner först – det är de som använder Mapsa mest.
const MAIN: Item[] = [
  { href: "/karta", label: "Kartan", hint: "Hitta och jämför utövare", icon: Map, match: "/karta" },
  { href: "/foretag", label: "För företag", hint: "Lägg upp ditt företag", icon: Store, match: "/foretag" },
];
const QUICK = [
  { href: "/karta?kategori=frisor", label: "Frisör" },
  { href: "/karta?kategori=massage", label: "Massage" },
  { href: "/karta?kategori=pt", label: "PT" },
  { href: "/karta?kategori=naprapat", label: "Naprapat" },
  { href: "/karta?kategori=skonhet", label: "Skönhet" },
];
const BUSINESS: Item[] = [
  { href: "/foretag#anmal", label: "Lägg upp ditt företag", hint: "Gratis att komma igång", icon: Store },
  { href: "/foretag#fragor", label: "Vanliga frågor", icon: CircleHelp },
];

// current: vilken sida man är på ("/", "/karta" eller "/foretag") – markeras i menyn.
export function SiteMenu({
  variant = "pill",
  current,
  className = "",
}: {
  variant?: "pill" | "round";
  current?: "/" | "/karta" | "/foretag";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    // Fokus till första valet så att tangentbordet funkar direkt.
    root.current?.querySelector<HTMLElement>("[data-menu-item]")?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Pil upp/ner flyttar mellan valen.
  const onPanelKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = [...(root.current?.querySelectorAll<HTMLElement>("[data-menu-item]") ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
  };

  const close = () => setOpen(false);

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        ref={button}
        type="button"
        aria-label={open ? "Stäng menyn" : "Meny"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={
          variant === "round"
            ? "pressable flex size-15 items-center justify-center rounded-full border border-line bg-canvas shadow-float"
            : `pressable flex h-11 items-center gap-2.5 rounded-full border border-line bg-canvas py-1 pr-1.5 pl-3.5 transition-shadow hover:shadow-[0_2px_8px_rgb(0_0_0/0.12)] ${
                open ? "shadow-[0_2px_8px_rgb(0_0_0/0.12)]" : ""
              }`
        }
      >
        {open ? <X className="size-5" strokeWidth={2.25} aria-hidden /> : <Menu className="size-5" strokeWidth={2.25} aria-hidden />}
        {variant === "pill" && (
          <span className="flex size-8 items-center justify-center rounded-full bg-ink" aria-hidden>
            <MapsaMark className="w-[18px] text-canvas" />
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          onKeyDown={onPanelKey}
          className="site-menu-panel absolute top-[calc(100%+8px)] right-0 z-50 w-[290px] overflow-hidden rounded-2xl border border-line bg-canvas p-2 text-ink shadow-[0_8px_28px_rgb(0_0_0/0.16)]"
        >
          <nav aria-label="Meny">
            {/* För dig som letar */}
            <p className="px-3 pt-2 pb-1 text-xs font-semibold text-muted">Hitta</p>
            <ItemLink item={MAIN[0]} current={current} onClick={close} />
            <ul className="flex flex-wrap gap-1.5 px-3 pt-1 pb-2">
              {QUICK.map((q) => (
                <li key={q.href}>
                  <Link
                    href={q.href}
                    data-menu-item
                    onClick={close}
                    className="flex h-8 items-center rounded-full bg-fill px-3 text-sm font-medium outline-none hover:bg-line focus-visible:bg-line"
                  >
                    {q.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* För företag – längre ner, tydligt avskilt */}
            <div className="mx-3 my-2 h-px bg-line" />
            <p className="px-3 pt-1 pb-1 text-xs font-semibold text-muted">För företag</p>
            <ItemLink item={{ ...BUSINESS[0], match: "/foretag" }} current={current} onClick={close} />
            <Link
              href={BUSINESS[1].href}
              data-menu-item
              onClick={close}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-base outline-none hover:bg-fill focus-visible:bg-fill"
            >
              <CircleHelp className="size-5 text-muted" strokeWidth={2} aria-hidden />
              {BUSINESS[1].label}
            </Link>
          </nav>
          <p className="mt-1 border-t border-line px-3 pt-3 pb-1.5 text-xs text-muted">Mapsa UF · Blekinge</p>
        </div>
      )}
    </div>
  );
}

function ItemLink({ item, current, onClick }: { item: Item; current?: string; onClick: () => void }) {
  const isCurrent = item.match === current;
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      data-menu-item
      onClick={onClick}
      aria-current={isCurrent ? "page" : undefined}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 outline-none hover:bg-fill focus-visible:bg-fill"
    >
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${isCurrent ? "bg-ink text-canvas" : "bg-fill text-ink"}`}>
        <Icon className="size-5" strokeWidth={2} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold">{item.label}</span>
        {item.hint && <span className="block text-sm text-muted">{item.hint}</span>}
      </span>
      {isCurrent && <span className="size-2 rounded-full bg-ink" aria-hidden />}
    </Link>
  );
}
