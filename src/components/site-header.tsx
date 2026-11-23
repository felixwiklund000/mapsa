import Link from "next/link";
import { MapsaLogo } from "./brand";
import { SiteMenu } from "./site-menu";

export function Logo() {
  return (
    <Link href="/" aria-label="Mapsa – till startsidan" className="-mx-2 inline-flex h-11 items-center rounded-lg px-2 text-ink">
      <MapsaLogo className="h-[22px] w-auto" />
    </Link>
  );
}

// Header för undersidor. Startsidan har ingen header (kartan fyller skärmen).
export function SiteHeader({ className = "" }: { className?: string }) {
  return (
    <header className={`border-b border-line pt-[env(safe-area-inset-top)] ${className}`}>
      <div className="page-container flex h-14 items-center justify-between">
        <Logo />
        <SiteMenu />
      </div>
    </header>
  );
}
