import { Logo } from "./site-header";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="page-container flex flex-col gap-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <Logo />
          <p className="text-meta mt-3">
            Mapsa är inte ett bokningssystem. Vi samlar lokala utövare i Karlskrona på ett ställe och
            länkar vidare till deras egen bokning.
          </p>
        </div>
        <p className="text-meta">Drivs som UF-företag i Karlskrona.</p>
      </div>
    </footer>
  );
}
