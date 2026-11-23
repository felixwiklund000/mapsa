import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Check, ChevronDown, ChevronRight, Smartphone } from "lucide-react";
import { Logo } from "@/components/site-header";
import { SiteMenu } from "@/components/site-menu";
import { CityScene } from "@/components/landing/scenes";
import { FeatureTabs } from "@/components/landing/feature-tabs";
import { RadiatingLines } from "@/components/landing/radiating-lines";
import { SignupSection } from "@/components/signup/signup-section";
import { brandFonts } from "./fonts";

// Landningssida för företag (utövare): vad Mapsa är, hur det funkar, priser.
// Egen stil: sand + mörka paneler + orange accent, Instrument Serif i
// rubriker, Geist Mono i små etiketter. Nivåer och priser enligt produktspecen.
// Tonen: direkt, ärlig och vänlig – inga överord, inga påhittade siffror.


export const metadata: Metadata = {
  title: "Mapsa för företag – syns på kartan i Blekinge",
  description:
    "Mapsa visar din salong, klinik eller studio på kartan med dina priser. Kunden bokar via din egen bokning. Första månaden gratis.",
};

// Anmälan finns längre ner på sidan (#anmal).
const SIGNUP_HREF: string | null = "#anmal";

const FLAME = "#ff5a1f";

const BOOKING_TOOLS = ["Bokadirekt", "Fresha", "Egen hemsida", "Telefon", "Instagram"];

const STATS = [
  { value: "6", unit: "", label: "kategorier att synas i" },
  { value: "5", unit: "", label: "kommuner i Blekinge" },
  { value: "0", unit: "kr", label: "för kunden att använda" },
  { value: "0", unit: "%", label: "provision på dina bokningar" },
];

const PLANS = [
  {
    name: "Grundlistning",
    price: "0 kr",
    period: "första månaden",
    features: ["Profil med tjänster och priser", "Din lapp på kartan", "Länk till din bokning", "En bild"],
  },
  {
    name: "Bas",
    price: "99 kr",
    period: "per månad",
    features: ["Allt i Grundlistning", "Upp till 5 bilder", "Kampanjfält", "Längre beskrivning"],
  },
  {
    name: "Mellan",
    price: "249 kr",
    period: "per månad",
    badge: "Syns först",
    features: ["Allt i Bas", "Topplacering i listan", "Klickstatistik", "Utvald-märke på profilen"],
  },
  {
    name: "VIP",
    price: "549 kr",
    period: "per månad",
    features: ["Allt i Mellan", "Video på profilen", "VIP-märke på profilen"],
  },
];

const FAQ = [
  {
    q: "Är Mapsa ett bokningssystem?",
    a: "Nej. Vi länkar bara vidare till din befintliga bokning – Bokadirekt, Fresha, din hemsida, telefon eller Instagram. Du behåller allt du har i dag.",
  },
  {
    q: "Vilka kan vara med?",
    a: "Massörer, PT:er, frisörer, kiropraktorer, naprapater och skönhet/hud i Blekinge.",
  },
  {
    q: "Hur hamnar jag på kartan?",
    a: "Du skickar in dina uppgifter, vi granskar dem och lägger ut dig på kartan. Inget syns publikt innan det är godkänt.",
  },
  {
    q: "Kan jag ändra eller ta bort min profil?",
    a: "Ja, när som helst. Hör av dig så ändrar eller tar vi bort den. Dina uppgifter delas aldrig med tredje part.",
  },
  {
    q: "Vilka står bakom Mapsa?",
    a: "Två gymnasieelever som driver Mapsa som UF-företag i Blekinge.",
  },
];

const label = "font-mono text-xs tracking-[0.08em] uppercase";

function FlameButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="pressable inline-flex h-12 items-center justify-center gap-1.5 rounded-full bg-flame pr-4 pl-6 text-base font-medium text-white shadow-[0_8px_24px_-8px_rgb(255_90_31/0.7)] hover:brightness-105"
    >
      {children}
      <ChevronRight size={18} strokeWidth={2.25} aria-hidden="true" />
    </a>
  );
}

function SignupButton() {
  if (!SIGNUP_HREF) {
    return (
      <span className="inline-flex h-12 cursor-default items-center rounded-full bg-panel/10 px-6 text-base font-medium text-stone">
        Anmälan öppnar snart
      </span>
    );
  }
  return <FlameButton href={SIGNUP_HREF}>Lägg upp ditt företag</FlameButton>;
}

export default function ForetagPage() {
  return (
    <div className={`${brandFonts} min-h-dvh bg-sand text-panel`}>
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-30 bg-sand/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="relative mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-8">
          <Logo />
          <nav aria-label="Sidan" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {[
              ["#funktioner", "Funktioner"],
              ["#sa-funkar-det", "Så funkar det"],
              ["#priser", "Priser"],
              ["#fragor", "Frågor"],
            ].map(([href, text]) => (
              <a key={href} href={href} className="rounded-full px-3 py-2 text-sm font-medium text-panel/80 transition-colors hover:text-panel">
                {text}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="#anmal"
              className="pressable hidden h-11 items-center rounded-full bg-panel px-5 text-sm font-medium text-white sm:inline-flex"
            >
              Kom igång
            </a>
            <SiteMenu current="/foretag" />
          </div>
        </div>
      </header>

      <main>
        {/* ---------- Hero: mörk panel ---------- */}
        <section className="px-2 sm:px-3">
          <div
            className="relative overflow-hidden rounded-[28px] bg-panel text-[#f3ede2]"
            style={{
              backgroundImage: "radial-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          >
            <div className="landing-rise relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 pt-16 text-center sm:pt-24">
              <p className={`${label} inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-white/70 ring-1 ring-white/15`}>
                <span className="h-1.5 w-1.5 rounded-full bg-flame" aria-hidden="true" />
                För utövare i Blekinge
              </p>
              <h1 className="mt-7 font-serif text-display text-balance">
                Bli hittad av kunder <span className="text-white/40">i närheten.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/60">
                Mapsa visar din salong, klinik eller studio på kartan – med dina priser. Kunden klickar vidare till din
                egen bokning.
              </p>
              <div className="mt-9 flex items-center gap-5">
                <FlameButton href="#anmal">Lägg upp ditt företag</FlameButton>
                <Link href="/" className="text-base font-medium text-white/70 underline-offset-4 hover:text-white hover:underline">
                  Se kartan
                </Link>
              </div>
            </div>

            {/* 3D-staden med kort som hänger i linjer från knappen */}
            <div className="landing-rise relative mx-auto mt-4 h-[360px] max-w-[1100px] sm:h-[460px] lg:mt-0 lg:h-[600px]" style={{ animationDelay: "150ms" }}>
              <svg
                viewBox="0 0 1100 150"
                preserveAspectRatio="none"
                className="absolute inset-x-0 top-0 hidden h-[150px] w-full lg:block"
                aria-hidden="true"
              >
                {[
                  "M550 0 V44 Q550 64 530 64 H190 Q170 64 170 84 V150",
                  "M550 0 V44 Q550 64 570 64 H910 Q930 64 930 84 V150",
                ].map((d) => (
                  <g key={d}>
                    <path d={d} fill="none" stroke="white" strokeOpacity="0.2" vectorEffect="non-scaling-stroke" />
                    <path d={d} fill="none" stroke={FLAME} strokeWidth="1.5" className="landing-flow" vectorEffect="non-scaling-stroke" />
                  </g>
                ))}
                <circle cx="550" cy="2" r="3" fill="white" fillOpacity="0.5" />
              </svg>

              <div className="absolute inset-0 lg:top-10">
                <CityScene accent={FLAME} />
              </div>

              <HeroProfileCard />
              <HeroClicksCard />
            </div>
          </div>
        </section>

        {/* ---------- Bokningsverktyg ---------- */}
        <section aria-label="Bokning" className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8 sm:py-16">
          <p className={`${label} text-center text-stone`}>Boka-knappen går till det du redan använder</p>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 sm:justify-between sm:px-6">
            {BOOKING_TOOLS.map((t) => (
              <li key={t} className="text-2xl font-semibold tracking-tight text-panel/75 sm:text-[28px]">
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Funktioner ---------- */}
        <section id="funktioner" className="mx-auto max-w-[1440px] scroll-mt-20 px-4 pt-10 pb-24 sm:px-8 sm:pt-16 sm:pb-32 lg:px-16">
          <div className="landing-reveal grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
            <h2 className="font-serif text-headline text-balance">
              Byggt för att du ska bli <span className="text-stone">vald, inte bara hittad.</span>
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-stone lg:justify-self-end">
              Från prislappen på kartan till klicket på din bokningsknapp – allt är gjort för att kunden ska välja dig.
            </p>
          </div>
          <div className="mt-16 sm:mt-20">
            <FeatureTabs />
          </div>
        </section>

        {/* ---------- Så funkar det: flöde + siffror ---------- */}
        <section id="sa-funkar-det" className="scroll-mt-16 px-2 sm:px-3">
          <div className="overflow-hidden rounded-[28px] bg-panel px-5 py-20 text-[#f3ede2] sm:py-28">
            <div className="landing-reveal mx-auto max-w-2xl text-center">
              <p className={`${label} text-white/50`}>Så funkar det</p>
              <h2 className="mt-5 font-serif text-headline text-balance">
                Kunden hittar dig. <span className="text-white/40">Bokar hos dig.</span>
              </h2>
            </div>

            <div className="landing-reveal mx-auto mt-16 max-w-4xl sm:mt-24">
              <div className="flex items-center">
                <FlowBox>
                  <Smartphone size={30} strokeWidth={1.75} aria-hidden="true" />
                </FlowBox>
                <FlowLine />
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-white shadow-[0_30px_80px_-20px_rgb(255_90_31/0.45)] sm:h-44 sm:w-44">
                  <svg viewBox="0 0 22 26" className="h-12 w-12 sm:h-20 sm:w-20" aria-hidden="true">
                    <path
                      d="M11 1C5.48 1 1 5.33 1 10.68c0 3.86 2.7 7.6 8.08 13.1a2.7 2.7 0 0 0 3.84 0C18.3 18.28 21 14.54 21 10.68 21 5.33 16.52 1 11 1Z"
                      fill="#141312"
                    />
                    <circle cx="11" cy="10.5" r="3.8" fill={FLAME} />
                  </svg>
                </div>
                <FlowLine delay="1.2s" />
                <FlowBox>
                  <CalendarCheck size={30} strokeWidth={1.75} aria-hidden="true" />
                </FlowBox>
              </div>
              <ol className="mt-8 grid grid-cols-3 text-center">
                {[
                  ["Kunden söker", "Massage, PT, frisör …"],
                  ["Mapsa visar dig", "Med pris på kartan"],
                  ["Din bokning", "Kunden bokar hos dig"],
                ].map(([t, s], i) => (
                  <li key={t} className={i === 0 ? "text-left sm:text-center" : i === 2 ? "text-right sm:text-center" : ""}>
                    <p className={`${label} text-white/80`}>{t}</p>
                    <p className="mt-1.5 hidden text-sm text-white/45 sm:block">{s}</p>
                  </li>
                ))}
              </ol>
            </div>

            <dl className="mx-auto mt-20 grid max-w-[1200px] grid-cols-2 gap-y-12 border-t border-white/10 pt-14 sm:mt-28 lg:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="landing-reveal text-center">
                  <dd className="text-stat font-light">
                    {s.value}
                    {s.unit && <span className="text-white/35">{s.unit}</span>}
                  </dd>
                  <dt className="mt-3 text-base text-white/55">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ---------- Anmälan (akt 3): bygg din prislapp ---------- */}
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

        {/* ---------- Priser ---------- */}
        <section id="priser" className="mx-auto max-w-[1440px] scroll-mt-16 px-4 py-24 sm:px-8 sm:py-32 lg:px-16">
          <div className="landing-reveal mx-auto max-w-2xl text-center">
            <p className={`${label} text-stone`}>Priser</p>
            <h2 className="mt-5 font-serif text-headline text-balance">
              Börja gratis. <span className="text-stone">Väx när du vill.</span>
            </h2>
            <p className="mt-5 text-lg text-stone">Ingen provision på dina bokningar – du betalar bara för hur mycket du syns.</p>
          </div>

          <ul className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => {
              const featured = Boolean(p.badge);
              return (
                <li
                  key={p.name}
                  className={`landing-reveal flex flex-col rounded-3xl p-7 ${
                    featured ? "bg-panel text-[#f3ede2]" : "bg-sand-light ring-1 ring-sand-deep"
                  }`}
                >
                  <div className="flex h-7 items-center justify-between gap-2">
                    <h3 className={`${label} ${featured ? "text-white/70" : "text-stone"}`}>{p.name}</h3>
                    {p.badge && <span className="rounded-full bg-flame px-2.5 py-1 text-xs font-semibold text-white">{p.badge}</span>}
                  </div>
                  <p className="mt-8 font-serif text-[56px] leading-none tracking-tight">{p.price}</p>
                  <p className={`mt-2 text-sm ${featured ? "text-white/55" : "text-stone"}`}>{p.period}</p>
                  <ul className={`mt-8 flex flex-1 flex-col gap-3 border-t pt-6 ${featured ? "border-white/10" : "border-sand-deep"}`}>
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-base">
                        <Check size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-flame" aria-hidden="true" />
                        <span className={featured ? "text-white/90" : ""}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
          <div className="mt-10 flex justify-center">
            <SignupButton />
          </div>
        </section>

        {/* ---------- Frågor ---------- */}
        <section id="fragor" className="mx-auto grid max-w-[1440px] scroll-mt-20 gap-10 px-4 pb-24 sm:px-8 sm:pb-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:px-16">
          <div className="landing-reveal">
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
                <p className="-mt-2 max-w-2xl pb-6 text-base leading-relaxed text-stone">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ---------- Avslutning: linjer som strålar in ---------- */}
        <section className="relative overflow-hidden border-t border-sand-deep">
          <RadiatingLines className="absolute inset-0 h-full w-full" />
          <div className="landing-reveal relative mx-auto flex max-w-3xl flex-col items-center px-5 py-28 text-center sm:py-40">
            <p className="inline-flex items-center gap-2 rounded-full bg-sand-light px-4 py-2 text-sm font-medium shadow-[0_2px_12px_rgb(0_0_0/0.08)]">
              <span className="font-semibold">0 kr</span> första månaden
            </p>
            <h2 className="mt-7 font-serif text-display text-balance">
              Syns där <span className="text-stone">kunderna letar.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-stone">
              Du behåller din bokning – vi ser till att fler hittar dit.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
              <SignupButton />
              <Link href="/" className="inline-flex items-center gap-1 text-base font-medium underline-offset-4 hover:underline">
                Se kartan
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-sand-deep pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <Logo />
            <span className={`${label} text-stone`}>UF-företag · Blekinge</span>
          </div>
          <nav aria-label="Sidfot" className="flex gap-5 text-sm text-stone">
            <Link href="/" className="hover:text-panel">
              Kartan
            </Link>
            <a href="#priser" className="hover:text-panel">
              Priser
            </a>
            <a href="#fragor" className="hover:text-panel">
              Frågor
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

// ---------- Små delar ----------

function FlowBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-white ring-1 ring-white/10 sm:h-24 sm:w-24">
      {children}
    </div>
  );
}

function FlowLine({ delay = "0s" }: { delay?: string }) {
  return (
    <div className="relative h-px flex-1 bg-white/20">
      <span
        className="landing-travel landing-motion absolute -top-[3px] h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-flame shadow-[0_0_12px_rgb(255_90_31)]"
        style={{ animationDelay: delay }}
        aria-hidden="true"
      />
    </div>
  );
}

// Kort till vänster i heron: så ser en profil ut (exempel).
function HeroProfileCard() {
  return (
    <div
      className="absolute top-[150px] left-[15.45%] hidden w-[260px] -translate-x-1/2 rounded-2xl bg-sand-light p-5 text-panel shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)] lg:block"
      aria-hidden="true"
    >
      <p className={`${label} text-stone`}>Frisör · Trossö</p>
      <p className="mt-1.5 text-xl font-semibold tracking-tight">Din salong här</p>
      <ul className="mt-3 divide-y divide-sand-deep text-sm">
        {[
          ["Klippning", "300 kr"],
          ["Hår och skägg", "500 kr"],
          ["Barnklippning", "250 kr"],
        ].map(([n, p]) => (
          <li key={n} className="flex justify-between py-2">
            <span>{n}</span>
            <span className="font-semibold">{p}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex h-10 items-center justify-center rounded-lg bg-panel text-sm font-semibold text-white">Boka</div>
    </div>
  );
}

// Kort till höger i heron: klick till bokning (illustration, inga riktiga siffror).
function HeroClicksCard() {
  const bars = [30, 42, 36, 55, 48, 70, 92];
  return (
    <div
      className="absolute top-[150px] left-[84.55%] hidden w-[260px] -translate-x-1/2 rounded-2xl bg-sand-light p-5 text-panel shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)] lg:block"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <p className={`${label} text-stone`}>Klick till bokning</p>
        <span className="rounded-full bg-flame/15 px-2 py-0.5 text-[10px] font-semibold text-flame">Exempel</span>
      </div>
      <div className="mt-5 flex h-28 items-end gap-2">
        {bars.map((h, i) => (
          <div key={i} className="flex flex-1 flex-col justify-end gap-1" style={{ height: `${h}%` }}>
            <div
              className={`flex-1 rounded-[5px] ${i >= 5 ? "bg-flame" : "bg-sand-deep"}`}
              style={
                i >= 5
                  ? { backgroundImage: "repeating-linear-gradient(135deg, rgb(255 255 255 / 0.22) 0 4px, transparent 4px 8px)" }
                  : undefined
              }
            />
          </div>
        ))}
      </div>
      <div className={`${label} mt-2 flex justify-between text-[10px] text-stone`}>
        {["M", "T", "O", "T", "F", "L", "S"].map((d, i) => (
          <span key={i} className="flex-1 text-center">
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}
