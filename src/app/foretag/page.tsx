import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, MapPin } from "lucide-react";
import { Logo } from "@/components/site-header";
import { CityScene, ClicksScene } from "@/components/landing/scenes";

// Landningssida för företag (utövare): vad Mapsa är, hur det funkar, priser.
// Nivåer och priser enligt produktspecen (grundlistning/bas/mellan/vip).
// Tonen: direkt, ärlig och vänlig – inga överord, inga påhittade siffror.

export const metadata: Metadata = {
  title: "Mapsa för företag – syns på kartan i Blekinge",
  description:
    "Mapsa visar din salong, klinik eller studio på kartan med dina priser. Kunden bokar via din egen bokning. Första månaden gratis.",
};

// Anmälningsformuläret är inte byggt än. Sätt en länk här när det finns
// (t.ex. "/anmal" eller "mailto:…") så blir knapparna klickbara.
const SIGNUP_HREF: string | null = null;

const KOMMUNER = ["Karlskrona", "Ronneby", "Karlshamn", "Sölvesborg", "Olofström"];

const STEPS = [
  {
    title: "Berätta vad du erbjuder",
    text: "Namn, tjänster, priser och länken till din bokning. Det tar ett par minuter.",
  },
  {
    title: "Vi lägger upp dig",
    text: "Vi går igenom uppgifterna och sätter ut dig på kartan – med ditt pris på lappen.",
  },
  {
    title: "Kunder hittar dig",
    text: "De jämför i lugn och ro och bokar direkt hos dig, i det system du redan använder.",
  },
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

const BOOKING_TOOLS = ["Bokadirekt", "Fresha", "Egen hemsida", "Telefon", "Instagram"];

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

function SignupButton({ dark = false, label = "Kom igång gratis" }: { dark?: boolean; label?: string }) {
  const base = "pressable inline-flex h-14 items-center justify-center gap-2 rounded-full px-7 text-lg font-semibold";
  const style = dark ? "bg-canvas text-ink hover:bg-fill" : "bg-ink text-canvas hover:opacity-85";
  if (!SIGNUP_HREF) {
    return (
      <span className={`${base} cursor-default ${dark ? "bg-canvas/15 text-canvas" : "bg-fill text-muted"}`}>
        Anmälan öppnar snart
      </span>
    );
  }
  return (
    <a href={SIGNUP_HREF} className={`${base} ${style}`}>
      {label}
      <ArrowRight size={20} strokeWidth={2.25} aria-hidden="true" />
    </a>
  );
}

export default function ForetagPage() {
  return (
    <div className="bg-canvas text-ink">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="page-container flex h-16 items-center gap-6">
          <Logo />
          <nav aria-label="Sidan" className="hidden flex-1 items-center gap-1 md:flex">
            {[
              ["#sa-funkar-det", "Så funkar det"],
              ["#priser", "Priser"],
              ["#fragor", "Frågor"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink">
                {label}
              </a>
            ))}
          </nav>
          <Link
            href="/"
            className="pressable ml-auto inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-canvas md:ml-0"
          >
            Öppna kartan
            <ArrowRight size={16} strokeWidth={2.25} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main>
        {/* ---------- Hero ---------- */}
        <section className="page-container grid items-center gap-6 pt-10 pb-6 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-4 lg:pt-12 lg:pb-12">
          <div className="landing-rise max-w-xl">
            <p className="inline-flex h-8 items-center gap-1.5 rounded-full bg-fill px-3 text-sm font-medium">
              <MapPin size={14} strokeWidth={2.5} aria-hidden="true" />
              För utövare i Blekinge
            </p>
            <h1 className="mt-6 text-display font-semibold text-balance">Bli hittad av kunder i närheten.</h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Mapsa visar din salong, klinik eller studio på kartan – med dina priser. Kunden klickar vidare till din
              egen bokning. Vi ersätter inget du redan har.
            </p>
            <div className="mt-8 grid grid-cols-[auto_auto] justify-start gap-3">
              <a
                href="#priser"
                className="pressable inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ink px-5 text-base font-semibold text-canvas hover:opacity-85 sm:px-7 sm:text-lg"
              >
                Kom igång gratis
                <ArrowRight size={20} strokeWidth={2.25} aria-hidden="true" />
              </a>
              <Link
                href="/"
                className="pressable inline-flex h-14 items-center justify-center rounded-full bg-fill px-5 text-base font-semibold hover:bg-line sm:px-7 sm:text-lg"
              >
                Se kartan
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted">Första månaden gratis · Du behåller din bokning</p>
          </div>

          <div className="landing-rise relative -mx-4 h-[360px] sm:mx-0 sm:h-[480px] lg:h-[600px]" style={{ animationDelay: "120ms" }}>
            <CityScene />
          </div>
        </section>

        {/* ---------- Område ---------- */}
        <section aria-label="Område" className="border-y border-line">
          <div className="page-container flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-muted">Kartan täcker hela Blekinge</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {KOMMUNER.map((k) => (
                <li key={k} className="text-lg font-semibold tracking-tight">
                  {k}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Så funkar det ---------- */}
        <section id="sa-funkar-det" className="page-container scroll-mt-20 py-20 sm:py-28">
          <div className="landing-reveal max-w-2xl">
            <p className="text-sm font-semibold text-muted">Så funkar det</p>
            <h2 className="mt-3 text-headline font-semibold text-balance">Tre steg. Sen syns du.</h2>
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="landing-reveal rounded-3xl bg-fill p-7 sm:p-8">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink text-base font-semibold text-canvas">
                  {i + 1}
                </span>
                <h3 className="mt-10 text-2xl font-semibold">{s.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Funktioner ---------- */}
        <section aria-labelledby="funktioner" className="page-container pb-20 sm:pb-28">
          <div className="landing-reveal max-w-2xl">
            <p className="text-sm font-semibold text-muted">Därför Mapsa</p>
            <h2 id="funktioner" className="mt-3 text-headline font-semibold text-balance">
              Byggt för att kunden ska välja dig.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-6">
            {/* Priser på kartan */}
            <article className="landing-reveal overflow-hidden rounded-3xl bg-fill lg:col-span-4">
              <div className="p-7 sm:p-8">
                <h3 className="text-2xl font-semibold">Priset syns direkt på kartan</h3>
                <p className="mt-3 max-w-md text-base leading-relaxed text-muted">
                  Kunden ser vad det kostar innan de klickar. Inga överraskningar – och du jämförs på riktigt.
                </p>
              </div>
              <MiniMap />
            </article>

            {/* Din bokning */}
            <article className="landing-reveal flex flex-col rounded-3xl bg-ink p-7 text-canvas sm:p-8 lg:col-span-2">
              <h3 className="text-2xl font-semibold">Din bokning, inte vår.</h3>
              <p className="mt-3 text-base leading-relaxed text-canvas/70">
                Mapsa bokar inget åt dig och tar ingen del av dina bokningar. Knappen går till det du redan använder.
              </p>
              <ul className="mt-auto flex flex-wrap gap-2 pt-8">
                {BOOKING_TOOLS.map((t) => (
                  <li key={t} className="rounded-full bg-canvas/10 px-3 py-1.5 text-sm font-medium">
                    {t}
                  </li>
                ))}
              </ul>
            </article>

            {/* Klickstatistik */}
            <article className="landing-reveal overflow-hidden rounded-3xl bg-fill lg:col-span-3">
              <div className="p-7 pb-0 sm:p-8 sm:pb-0">
                <h3 className="text-2xl font-semibold">Se hur många som klickar</h3>
                <p className="mt-3 text-base leading-relaxed text-muted">
                  Vi räknar varje klick på din bokningsknapp. Ingår i Mellan och VIP.
                </p>
              </div>
              <div className="h-60 sm:h-64">
                <ClicksScene />
              </div>
            </article>

            {/* Kartan */}
            <article className="landing-reveal flex flex-col rounded-3xl bg-fill p-7 sm:p-8 lg:col-span-3">
              <h3 className="text-2xl font-semibold">En karta folk vill använda</h3>
              <p className="mt-3 text-base leading-relaxed text-muted">
                Riktiga 3D-hus och en drönarflygning till varje ställe man trycker på. Funkar som en app på mobilen – utan
                att ladda ner något.
              </p>
              <dl className="mt-auto grid grid-cols-3 gap-3 pt-8">
                {[
                  ["3D", "hus och gator"],
                  ["6", "kategorier"],
                  ["0 kr", "för kunden"],
                ].map(([v, l]) => (
                  <div key={l} className="rounded-2xl bg-canvas p-4">
                    <dt className="sr-only">{l}</dt>
                    <dd className="text-2xl font-semibold tracking-tight">{v}</dd>
                    <dd className="mt-1 text-sm text-muted">{l}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>
        </section>

        {/* ---------- Priser ---------- */}
        <section id="priser" className="scroll-mt-16 border-t border-line bg-fill/60">
          <div className="page-container py-20 sm:py-28">
            <div className="landing-reveal mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold text-muted">Priser</p>
              <h2 className="mt-3 text-headline font-semibold text-balance">Börja gratis. Synas mer när du vill.</h2>
              <p className="mt-4 text-lg text-muted">Mapsa tar ingen provision på dina bokningar.</p>
            </div>

            <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((p) => {
                const featured = Boolean(p.badge);
                return (
                  <li
                    key={p.name}
                    className={`landing-reveal relative flex flex-col rounded-3xl p-7 ${
                      featured ? "bg-ink text-canvas" : "bg-canvas ring-1 ring-line"
                    }`}
                  >
                    <div className="flex h-7 items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold">{p.name}</h3>
                      {p.badge && (
                        <span className="rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-ink">{p.badge}</span>
                      )}
                    </div>
                    <p className="mt-6 flex items-baseline gap-2">
                      <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                      <span className={`text-sm ${featured ? "text-canvas/60" : "text-muted"}`}>{p.period}</span>
                    </p>
                    <ul className="mt-8 flex flex-1 flex-col gap-3">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-base">
                          <Check
                            size={18}
                            strokeWidth={2.5}
                            className={`mt-0.5 shrink-0 ${featured ? "text-canvas" : "text-ink"}`}
                            aria-hidden="true"
                          />
                          <span className={featured ? "text-canvas/90" : ""}>{f}</span>
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
          </div>
        </section>

        {/* ---------- Frågor ---------- */}
        <section id="fragor" className="page-container grid scroll-mt-20 gap-10 py-20 sm:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div className="landing-reveal">
            <p className="text-sm font-semibold text-muted">Frågor</p>
            <h2 className="mt-3 text-headline font-semibold text-balance">Bra att veta</h2>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown
                    size={22}
                    strokeWidth={2}
                    className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="-mt-2 pb-6 text-base leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ---------- Avslutning ---------- */}
        <section className="page-container pb-16 sm:pb-24">
          <div className="landing-reveal rounded-[32px] bg-ink px-7 py-14 text-canvas sm:px-14 sm:py-20">
            <h2 className="max-w-2xl text-headline font-semibold text-balance">Syns där kunderna letar.</h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-canvas/70">
              Första månaden är gratis. Du behåller din bokning – vi ser till att fler hittar dit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <SignupButton dark />
              <Link
                href="/"
                className="pressable inline-flex h-14 items-center justify-center rounded-full px-7 text-lg font-semibold text-canvas ring-1 ring-canvas/25 hover:bg-canvas/10"
              >
                Se kartan
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line pb-[env(safe-area-inset-bottom)]">
        <div className="page-container flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-sm text-muted">UF-företag i Blekinge</span>
          </div>
          <nav aria-label="Sidfot" className="flex gap-5 text-sm text-muted">
            <Link href="/" className="hover:text-ink">
              Kartan
            </Link>
            <a href="#priser" className="hover:text-ink">
              Priser
            </a>
            <a href="#fragor" className="hover:text-ink">
              Frågor
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

// Liten platt kartbild med prislappar – kartans egna färger.
function MiniMap() {
  const pills = [
    { left: "14%", top: "30%", label: "650 kr" },
    { left: "44%", top: "58%", label: "400 kr", active: true },
    { left: "70%", top: "24%", label: "300 kr" },
    { left: "82%", top: "66%", label: "250 kr" },
  ];
  return (
    <div className="relative mx-4 mb-4 h-56 overflow-hidden rounded-2xl sm:mx-8 sm:mb-8" style={{ background: "#f2f3ef" }} aria-hidden="true">
      {/* vatten, park och gator */}
      <div className="absolute -right-10 top-0 h-full w-1/4 -skew-x-12" style={{ background: "#b4dcf7" }} />
      <div className="absolute left-[24%] top-[62%] h-[30%] w-[16%] rounded-xl" style={{ background: "#d8ecc9" }} />
      <div className="absolute left-0 top-[46%] h-3 w-full bg-canvas" />
      <div className="absolute left-[38%] top-0 h-full w-3 bg-canvas" />
      <div className="absolute left-[62%] top-0 h-full w-2 rotate-6 bg-canvas" />
      {/* hus */}
      {[
        [6, 8, 12, 14],
        [20, 10, 10, 12],
        [46, 8, 12, 16],
        [6, 62, 12, 20],
        [46, 70, 10, 18],
        [66, 54, 9, 14],
      ].map(([l, t, w, h]) => (
        <div
          key={`${l}-${t}`}
          className="absolute rounded-[4px]"
          style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%`, background: "#e9e9e7" }}
        />
      ))}
      {pills.map((p) => (
        <span
          key={p.label}
          className={`absolute inline-flex h-8 -translate-x-1/2 items-center rounded-full px-3 text-sm font-semibold shadow-[0_2px_10px_rgb(0_0_0/0.14)] ${
            p.active ? "scale-110 bg-ink text-canvas" : "bg-canvas text-ink"
          }`}
          style={{ left: p.left, top: p.top }}
        >
          {p.label}
        </span>
      ))}
    </div>
  );
}
