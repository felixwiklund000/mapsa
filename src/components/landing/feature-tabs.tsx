"use client";

// Flikar med funktioner: mörk flikrad, rubrik + text + fyra punkter till
// vänster och en bild som byts till höger.

import { useState, type ReactNode } from "react";
import {
  BadgeCheck,
  CalendarCheck,
  Camera,
  Clock,
  Globe,
  MessageCircle,
  Layers,
  MapPin,
  MousePointerClick,
  Navigation,
  Phone,
  Smartphone,
  Tag,
  Trophy,
  Video,
  type LucideIcon,
} from "lucide-react";
import { ClicksScene } from "./scenes";

type Point = { icon: LucideIcon; title: string; text: string };
type Tab = { id: string; label: string; title: string; text: string; points: Point[]; visual: ReactNode };

const FLAME = "#ff5a1f";

const TABS: Tab[] = [
  {
    id: "kartan",
    label: "Kartan",
    title: "Ditt pris, direkt på kartan",
    text: "Kunden ser vad det kostar innan de klickar. Inga överraskningar – och du jämförs på riktigt.",
    points: [
      { icon: Tag, title: "Lapp med pris", text: "Ditt lägsta pris syns på kartan" },
      { icon: Navigation, title: "Drönarflygning", text: "Kartan flyger till dig vid tryck" },
      { icon: Layers, title: "Riktiga 3D-hus", text: "Lätt att se var du ligger" },
      { icon: Smartphone, title: "Funkar som app", text: "Läggs på hemskärmen" },
    ],
    visual: <MapVisual />,
  },
  {
    id: "profilen",
    label: "Profilen",
    title: "En profil som säljer åt dig",
    text: "Allt kunden vill veta på ett ställe: vad du gör, vad det kostar och var du finns.",
    points: [
      { icon: Tag, title: "Tjänster och priser", text: "Tydlig lista, inte löptext" },
      { icon: Camera, title: "Bilder", text: "Upp till fem i Bas" },
      { icon: Clock, title: "Öppettider", text: "Och adress med karta" },
      { icon: Video, title: "Video", text: "Ingår i VIP" },
    ],
    visual: <ProfileVisual />,
  },
  {
    id: "statistik",
    label: "Statistik",
    title: "Se vad Mapsa ger dig",
    text: "Vi räknar varje klick på din bokningsknapp, så att du ser att det lönar sig.",
    points: [
      { icon: MousePointerClick, title: "Klick till bokning", text: "Ingår i Mellan och VIP" },
      { icon: Trophy, title: "Topplacering", text: "Först i listan (Mellan)" },
      { icon: BadgeCheck, title: "Utvald-märke", text: "Syns på profilen" },
      { icon: MapPin, title: "Hela Blekinge", text: "Fem kommuner på kartan" },
    ],
    visual: (
      <div className="h-full w-full pt-10">
        <ClicksScene accent={FLAME} />
      </div>
    ),
  },
  {
    id: "bokning",
    label: "Bokning",
    title: "Din bokning, inte vår",
    text: "Mapsa bokar inget åt dig och tar ingen provision. Knappen går till det du redan använder.",
    points: [
      { icon: CalendarCheck, title: "Bokningssystem", text: "Bokadirekt, Fresha m.fl." },
      { icon: Globe, title: "Egen hemsida", text: "Länka direkt dit" },
      { icon: Phone, title: "Telefon", text: "Ring och boka" },
      { icon: MessageCircle, title: "Instagram", text: "Boka via DM" },
    ],
    visual: <BookingVisual />,
  },
];

export function FeatureTabs() {
  const [active, setActive] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
      <div className="flex flex-col">
        <div role="tablist" aria-label="Funktioner" className="scrollbar-none -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex gap-1 rounded-full bg-panel p-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={t.id === active}
                aria-controls={`panel-${t.id}`}
                onClick={() => setActive(t.id)}
                className={`h-10 shrink-0 rounded-full px-5 text-sm font-medium transition-colors duration-200 ${
                  t.id === active ? "bg-flame text-white" : "text-white/75 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div role="tabpanel" id={`panel-${tab.id}`} aria-labelledby={`tab-${tab.id}`} key={tab.id} className="landing-rise mt-10">
          <h3 className="font-serif text-headline text-balance">{tab.title}</h3>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-stone">{tab.text}</p>
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7">
            {tab.points.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <Icon size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-flame" aria-hidden="true" />
                <div>
                  <p className="text-base font-semibold">{title}</p>
                  <p className="mt-0.5 text-sm text-stone">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div key={tab.id} className="landing-rise relative h-[380px] overflow-hidden rounded-3xl bg-sand-deep sm:h-[460px]" aria-hidden="true">
        {tab.visual}
      </div>
    </div>
  );
}

// ---------- Bilder per flik ----------

function MapVisual() {
  const pills = [
    { left: "18%", top: "26%", label: "650 kr" },
    { left: "50%", top: "52%", label: "400 kr", active: true },
    { left: "74%", top: "22%", label: "300 kr" },
    { left: "30%", top: "74%", label: "800 kr" },
    { left: "80%", top: "70%", label: "250 kr" },
  ];
  return (
    <div className="absolute inset-5 overflow-hidden rounded-2xl" style={{ background: "#f2f3ef" }}>
      <div className="absolute -right-12 top-0 h-full w-[30%] -skew-x-12" style={{ background: "#b4dcf7" }} />
      <div className="absolute left-[10%] top-[58%] h-[30%] w-[18%] rounded-xl" style={{ background: "#d8ecc9" }} />
      <div className="absolute left-0 top-[44%] h-3 w-full bg-white" />
      <div className="absolute left-[40%] top-0 h-full w-3 bg-white" />
      <div className="absolute left-[64%] top-0 h-full w-2 rotate-6 bg-white" />
      {[
        [6, 8, 14, 16],
        [22, 6, 12, 14],
        [46, 8, 14, 18],
        [44, 62, 12, 18],
        [68, 50, 10, 16],
      ].map(([l, t, w, h]) => (
        <div key={`${l}-${t}`} className="absolute rounded-[4px]" style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%`, background: "#e6e6e3" }} />
      ))}
      {pills.map((p) => (
        <span
          key={p.label}
          className={`absolute inline-flex h-8 -translate-x-1/2 items-center rounded-full px-3 text-sm font-semibold shadow-[0_2px_10px_rgb(0_0_0/0.14)] ${
            p.active ? "scale-110 bg-flame text-white" : "bg-white text-black"
          }`}
          style={{ left: p.left, top: p.top }}
        >
          {p.label}
        </span>
      ))}
    </div>
  );
}

function ProfileVisual() {
  return (
    <div className="absolute inset-x-6 top-8 rounded-2xl bg-white p-6 shadow-[0_20px_60px_-20px_rgb(0_0_0/0.25)] sm:inset-x-12 sm:top-12">
      <div className="h-28 rounded-xl bg-sand" />
      <p className="mt-5 font-mono text-xs tracking-wide text-stone uppercase">Frisör · Trossö</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">Din salong här</p>
      <ul className="mt-4 divide-y divide-black/5 text-base">
        {[
          ["Klippning", "300 kr"],
          ["Hår och skägg", "500 kr"],
          ["Barnklippning", "250 kr"],
        ].map(([n, p]) => (
          <li key={n} className="flex justify-between py-2.5">
            <span>{n}</span>
            <span className="font-semibold">{p}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex h-12 items-center justify-center rounded-lg bg-black text-base font-semibold text-white">Boka</div>
    </div>
  );
}

function BookingVisual() {
  const rows: [LucideIcon, string][] = [
    [CalendarCheck, "Bokadirekt"],
    [CalendarCheck, "Fresha"],
    [Globe, "Egen hemsida"],
    [Phone, "Telefon"],
    [MessageCircle, "Instagram"],
  ];
  return (
    <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-2xl bg-white p-3 shadow-[0_20px_60px_-20px_rgb(0_0_0/0.25)] sm:inset-x-14">
      <p className="px-3 pt-2 pb-3 font-mono text-xs tracking-wide text-stone uppercase">Boka-knappen går till</p>
      <ul className="flex flex-col gap-1">
        {rows.map(([Icon, name], i) => (
          <li key={name} className="flex items-center gap-3 rounded-xl px-3 py-3 odd:bg-sand-light">
            <Icon size={18} strokeWidth={2} aria-hidden="true" />
            <span className="flex-1 text-base font-medium">{name}</span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${i === 0 ? "bg-flame text-white" : "bg-black/5 text-stone"}`}
            >
              {i === 0 ? "Vald" : "Funkar"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
