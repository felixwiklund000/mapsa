import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { Logo } from "@/components/site-header";
import { SiteMenu } from "@/components/site-menu";
import { brandFonts } from "./foretag/fonts";

// Startsidan: rubrik, sök och vägen in till kartan (/karta).

export default function StartPage() {
  return (
    <div className={`${brandFonts} flex min-h-dvh flex-col bg-sand text-panel`}>
      <header className="pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8">
          <Logo />
          <div className="flex items-center gap-1">
            <Link href="/foretag" className="rounded-full px-3 py-2 text-sm font-medium text-stone transition-colors hover:text-panel">
              För företag
            </Link>
            <SiteMenu current="/" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-[1440px] px-4 pt-12 pb-16 sm:px-8 sm:pt-20 lg:px-16">
          <h1 className="max-w-[14ch] font-serif text-display text-balance">Se vad det kostar innan du bokar.</h1>
          <p className="mt-5 max-w-[46ch] text-lg text-stone sm:text-xl">
            Frisörer, massörer, PT och fler i Blekinge – på en karta, med priset.
          </p>
          <div className="mt-8 max-w-xl">
            <SearchBar />
          </div>
          <Link href="/karta" className="btn-primary mt-4 w-full gap-2 sm:inline-flex sm:w-auto sm:px-8">
            Öppna kartan
            <ArrowRight className="size-5" strokeWidth={2.25} aria-hidden />
          </Link>
        </section>
      </main>
    </div>
  );
}
