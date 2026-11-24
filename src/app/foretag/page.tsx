import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Logo } from "@/components/site-header";
import { SiteMenu } from "@/components/site-menu";
import { CityScene } from "@/components/landing/scenes";
import { StickyCta } from "@/components/landing/sticky-cta";
import { SignupSection } from "@/components/signup/signup-section";
import { brandFonts } from "./fonts";

// /foretag – berättelsen i tre akter (docs/hemsida-brief.md, avsnitt 5):
//   Akt 1: kroken. Akt 2: kundens väg i tre scener. Akt 3: anmälan.
//   Sedan förtroende: pris (en rad), frågor, sidfot.
// En enda primär knapp på hela sidan: "Lägg upp ditt företag".
// Texterna kommer från briefen – hitta inte på nytt innehåll här.

export const metadata: Metadata = {
  title: "Mapsa för företag – syns på kartan i Blekinge",
  description:
    "Mapsa visar alla utövare i Blekinge på en karta, med priset, så kunden ser direkt vad det kostar och bokar hos dig. Gratis att komma igång.",
};

// Priset för att synas först i sin kategori bestäms av Mapsa UF.
// Sätt ett tal här så visas raden "Vill du synas först …".
const TOP_PRICE: number | null = null;

const FLAME = "#ff5a1f";
const label = "font-mono text-xs tracking-[0.08em] uppercase";

const FAQ = [
  {
    q: "Är Mapsa ett bokningssystem?",
    a: "Nej. Vi länkar vidare till bokningen du redan har – Bokadirekt, Fresha, egen hemsida, telefon eller Instagram. Vi tar ingen provision.",
  },
  {
    q: "Vad kostar det?",
    a: TOP_PRICE
      ? `Det är gratis att komma igång. Vill du synas först i din kategori kostar det ${TOP_PRICE} kr i månaden.`
      : "Det är gratis att komma igång.",
  },
  {
    q: "Hur tar jag bort min profil?",
    a: "Hör av dig till oss, så tar vi bort profilen och dina uppgifter. Läs mer i integritetspolicyn.",
  },
  {
    q: "Vilka kan vara med?",
    a: "Frisörer, massörer, PT:er, naprapater, kiropraktorer och skönhet/hud i Blekinge.",
  },
];

function PrimaryButton({ id }: { id?: string }) {
  return (
    <a
      id={id}
      href="#anmal"
      className="pressable inline-flex h-14 items-center justify-center gap-1.5 rounded-full bg-flame pr-5 pl-7 text-lg font-medium text-white shadow-[0_8px_24px_-8px_rgb(255_90_31/0.7)] hover:brightness-105"
    >
      Lägg upp ditt företag
      <ChevronRight size={20} strokeWidth={2.25} aria-hidden="true" />
    </a>
  );
}

export default function ForetagPage() {
  return (
    <div className={`${brandFonts} min-h-dvh bg-sand text-panel`}>
      {/* ---------- Toppbar ---------- */}
      <header className="sticky top-0 z-30 bg-sand/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="relative mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-8">
          <Logo />
          <nav aria-label="Sidan" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            <Link href="/karta" className="rounded-full px-3 py-2 text-sm font-medium text-panel/80 hover:text-panel">
              Hitta utövare
            </Link>
            <a href="#sa-funkar-det" className="rounded-full px-3 py-2 text-sm font-medium text-panel/80 hover:text-panel">
              Så funkar det
            </a>
            <a href="#fragor" className="rounded-full px-3 py-2 text-sm font-medium text-panel/80 hover:text-panel">
              Frågor
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="#anmal"
              className="pressable hidden h-11 items-center rounded-full bg-panel px-5 text-sm font-medium text-white sm:inline-flex"
            >
              Lägg upp ditt företag
            </a>
            <SiteMenu current="/foretag" />
          </div>
        </div>
      </header>

      <main>
        {/* ---------- Akt 1: kroken ---------- */}
        <section className="px-2 sm:px-3">
          <div
            className="relative overflow-hidden rounded-[28px] bg-panel text-[#f3ede2]"
            style={{
              backgroundImage: "radial-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          >
            <div className="landing-rise relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 pt-16 text-center sm:pt-24">
              <h1 className="font-serif text-display text-balance">
                Din nästa kund letar efter dig <span className="text-white/40">just nu.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">
                Mapsa visar alla utövare i Blekinge på en karta, med priset, så kunden ser direkt vad det kostar och bokar hos
                dig.
              </p>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
                <PrimaryButton id="akt-1-knapp" />
                <span className="text-base text-white/70">Gratis att komma igång</span>
              </div>
              <p className={`${label} mt-6 text-white/45`}>Ett UF-företag från Karlskrona</p>
            </div>
            <div className="landing-rise relative mx-auto h-[320px] max-w-[1100px] sm:h-[440px] lg:h-[520px]" style={{ animationDelay: "150ms" }}>
              <CityScene accent={FLAME} />
            </div>
          </div>
        </section>

        {/* ---------- Akt 2: kundens väg, tre scener ---------- */}
        <section id="sa-funkar-det" className="mx-auto max-w-[1440px] scroll-mt-20 px-4 pt-24 sm:px-8 sm:pt-32 lg:px-16">
          <p className={`${label} text-stone`}>Så hittar kunden dig</p>
          <ol className="mt-10 grid gap-4 lg:grid-cols-3">
            <Scene n={1} text="Hon söker ”frisör” i Karlskrona.">
              <SceneSearch />
            </Scene>
            <Scene n={2} text="Hon ser alla frisörer, med priserna.">
              <SceneMap />
            </Scene>
            <Scene
              n={3}
              text="Hon bokar hos dig, i systemet du redan har."
              sub="Bokadirekt, Fresha, egen hemsida, telefon eller Instagram. 0 % provision."
            >
              <SceneBook />
            </Scene>
          </ol>
        </section>

        {/* ---------- Akt 3: anmälan ---------- */}
        <section id="anmal" className="mx-auto max-w-[1440px] scroll-mt-16 px-4 pt-24 pb-24 sm:px-8 sm:pt-32 sm:pb-32 lg:px-16">
          <div className="max-w-2xl">
            <p className={`${label} text-stone`}>Anmälan</p>
            <h2 className="mt-5 font-serif text-headline text-balance">
              Lägg upp ditt företag. <span className="text-stone">Det tar två minuter.</span>
            </h2>
          </div>
          <div className="mt-12 sm:mt-16">
            <SignupSection />
          </div>
        </section>

        {/* ---------- Förtroende: pris + frågor ---------- */}
        <section aria-label="Pris" className="border-y border-sand-deep">
          <p className="mx-auto max-w-[1440px] px-4 py-10 text-center font-serif text-[clamp(1.6rem,1.2rem+1.5vw,2.5rem)] leading-tight text-balance sm:px-8">
            Gratis att komma igång.
            {TOP_PRICE && <span className="text-stone"> Vill du synas först i din kategori: {TOP_PRICE} kr/mån.</span>}
          </p>
        </section>

        <section
          id="fragor"
          className="mx-auto grid max-w-[1440px] scroll-mt-20 gap-10 px-4 py-24 sm:px-8 sm:py-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:px-16"
        >
          <div>
            <p className={`${label} text-stone`}>Frågor</p>
            <h2 className="mt-5 font-serif text-headline">
              Bra <span className="text-stone">att veta</span>
            </h2>
          </div>
          <div className="divide-y divide-sand-deep border-y border-sand-deep">
            {FAQ.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-lg font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown
                    size={22}
                    strokeWidth={1.75}
                    className="shrink-0 text-stone transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="-mt-2 max-w-2xl pb-6 text-base leading-relaxed text-stone">
                  {f.a}
                  {f.q.startsWith("Hur tar jag bort") && (
                    <>
                      {" "}
                      <Link href="/integritet" className="font-medium text-panel underline underline-offset-4">
                        Integritetspolicy
                      </Link>
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-sand-deep pb-[calc(env(safe-area-inset-bottom)+88px)] lg:pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <Logo />
            <span className={`${label} text-stone`}>UF-företag · Blekinge</span>
          </div>
          <nav aria-label="Sidfot" className="flex gap-5 text-sm text-stone">
            <Link href="/karta" className="hover:text-panel">
              Hitta utövare
            </Link>
            <Link href="/integritet" className="hover:text-panel">
              Integritetspolicy
            </Link>
          </nav>
        </div>
      </footer>

      <StickyCta />
    </div>
  );
}

// ---------- Akt 2: scenerna ----------

function Scene({ n, text, sub, children }: { n: number; text: string; sub?: string; children: React.ReactNode }) {
  return (
    <li className="landing-reveal flex flex-col">
      <div className="relative h-60 overflow-hidden rounded-3xl bg-sand-deep sm:h-72" aria-hidden="true">
        {children}
      </div>
      <p className={`${label} mt-6 text-stone`}>{n} / 3</p>
      <p className="mt-2 font-serif text-[clamp(1.75rem,1.4rem+1.2vw,2.4rem)] leading-[1.05] text-balance">{text}</p>
      {sub && <p className="mt-3 max-w-sm text-base leading-relaxed text-stone">{sub}</p>}
    </li>
  );
}

function SceneSearch() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[linear-gradient(180deg,#bcdcf3,#e6e0d3)] px-6">
      <div className="flex h-14 w-full max-w-xs items-center gap-3 rounded-full bg-white px-5 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.35)]">
        <Search className="size-5 shrink-0" strokeWidth={2} />
        <span className="text-lg">
          frisör
          <span className="scene-caret ml-0.5 inline-block h-5 w-[2px] translate-y-[3px] bg-panel" />
        </span>
      </div>
      <span className="rounded-full bg-white/70 px-3 py-1.5 text-sm font-medium">Karlskrona</span>
    </div>
  );
}

function SceneMap() {
  const pills = [
    { left: "20%", top: "28%", label: "fr. 300 kr" },
    { left: "55%", top: "50%", label: "fr. 250 kr", active: true },
    { left: "76%", top: "22%", label: "fr. 400 kr" },
    { left: "34%", top: "74%", label: "fr. 600 kr" },
  ];
  return (
    <div className="absolute inset-0" style={{ background: "#f2f3ef" }}>
      <div className="absolute -right-10 top-0 h-full w-[28%] -skew-x-12" style={{ background: "#b4dcf7" }} />
      <div className="absolute left-[8%] top-[56%] h-[34%] w-[18%] rounded-xl" style={{ background: "#d8ecc9" }} />
      <div className="absolute left-0 top-[42%] h-3 w-full bg-white" />
      <div className="absolute left-[44%] top-0 h-full w-3 bg-white" />
      {[
        [6, 8, 14, 18],
        [26, 8, 12, 16],
        [50, 10, 14, 18],
        [50, 62, 12, 20],
      ].map(([l, t, w, h]) => (
        <div key={`${l}-${t}`} className="absolute rounded-[4px]" style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%`, background: "#e6e6e3" }} />
      ))}
      {pills.map((p) => (
        <span
          key={p.label}
          className={`absolute inline-flex h-8 -translate-x-1/2 items-center rounded-full px-3 text-sm font-semibold whitespace-nowrap shadow-[0_2px_10px_rgb(0_0_0/0.14)] ${
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

function SceneBook() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,#efe9de,#e2d9c8)] px-6">
      <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.35)]">
        <p className={`${label} text-stone`}>Frisör · Trossö</p>
        <p className="mt-1 text-xl font-semibold tracking-tight">Din salong</p>
        <p className="mt-0.5 text-base text-stone">fr. 250 kr · Klippning</p>
        <div className="relative mt-4">
          <span className="scene-pulse absolute inset-0 rounded-lg bg-flame" />
          <span className="relative flex h-11 items-center justify-center rounded-lg bg-flame text-base font-semibold text-white">Boka</span>
        </div>
      </div>
    </div>
  );
}
