import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-canvas pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center px-[max(1rem,env(safe-area-inset-left))] lg:px-8">
        <Link
          href="/"
          aria-label="Mapsa – till startsidan"
          className="-mx-2 inline-flex h-11 items-center gap-1.5 rounded-control px-2"
        >
          <svg width="14" height="17" viewBox="0 0 22 26" aria-hidden="true" className="text-ink">
            <path
              d="M11 1C5.48 1 1 5.33 1 10.68c0 3.86 2.7 7.6 8.08 13.1a2.7 2.7 0 0 0 3.84 0C18.3 18.28 21 14.54 21 10.68 21 5.33 16.52 1 11 1Z"
              fill="currentColor"
            />
            <circle cx="11" cy="10.5" r="3.8" fill="var(--canvas)" />
          </svg>
          <span className="text-[1.25rem] font-extrabold tracking-[-0.045em] text-ink">Mapsa</span>
        </Link>
      </div>
    </header>
  );
}
