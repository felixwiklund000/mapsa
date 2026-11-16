import Link from "next/link";

// Loggan: kartnål i accentfärg + ordet Mapsa i fet Archivo.
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden="true" className="text-accent">
        <path
          d="M11 1C5.48 1 1 5.33 1 10.68c0 3.86 2.7 7.6 8.08 13.1a2.7 2.7 0 0 0 3.84 0C18.3 18.28 21 14.54 21 10.68 21 5.33 16.52 1 11 1Z"
          fill="currentColor"
        />
        <circle cx="11" cy="10.5" r="3.6" fill="var(--canvas)" />
      </svg>
      <span className="font-display text-[1.375rem] font-black tracking-[-0.04em] text-ink">Mapsa</span>
    </span>
  );
}

// Minimal header: sticky med frostat glas och ett mycket svagt prickat
// kartrutnät i bakgrunden.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-[1000] border-b pt-[env(safe-area-inset-top)] border-line/70 bg-canvas/80 backdrop-blur-xl backdrop-saturate-150">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(var(--line-strong) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          maskImage: "linear-gradient(to right, transparent, black 30%, black 70%, transparent)",
        }}
      />
      <div className="page-container relative flex h-16 items-center">
        <Link href="/" aria-label="Mapsa – till startsidan" className="rounded-lg">
          <Logo />
        </Link>
      </div>
    </header>
  );
}
