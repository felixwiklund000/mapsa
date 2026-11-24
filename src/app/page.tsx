import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight } from "lucide-react";
import { lowestPrice } from "@/components/practitioner-row";
import { SearchBar } from "@/components/search-bar";
import { Logo } from "@/components/site-header";
import { SiteMenu } from "@/components/site-menu";
import { Story, type StoryPill } from "@/components/story/story";
import { listPublishedPractitioners } from "@/lib/db/practitioners";
import { toShellItem } from "@/lib/practitioner-item";
import { filterPractitioners } from "@/lib/search";
import { brandFonts } from "./foretag/fonts";

// Startsidan: heron och berättelsen på ön (sök → se priser → boka), sedan
// vidare till kartan (/karta). Prislapparna och kortet är riktiga utövare.

export default function StartPage() {
  const hero = <Hero />;
  return (
    <div className={`${brandFonts} flex min-h-dvh flex-col bg-sand text-panel`}>
      <header className="relative z-20 bg-sand pt-[env(safe-area-inset-top)]">
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
        <Suspense fallback={<Story hero={hero} pills={[]} card={null} />}>
          <StoryWithData hero={hero} />
        </Suspense>
      </main>
    </div>
  );
}

function Hero() {
  return (
    <div>
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
    </div>
  );
}

// Prislapparna: det en sökning på "frisör" ger (billigast först), fyllt på med
// övriga utövare upp till 5. Kortet visar den billigaste frisören.
async function StoryWithData({ hero }: { hero: React.ReactNode }) {
  await connection();
  const all = (await listPublishedPractitioners()).filter((p) => lowestPrice(p) !== null);
  const byPrice = (a: (typeof all)[number], b: (typeof all)[number]) => lowestPrice(a)! - lowestPrice(b)!;
  const hits = filterPractitioners(all, { q: "frisör", categories: [] }).sort(byPrice);
  const rest = all.filter((p) => !hits.includes(p)).sort(byPrice);
  const items = [...hits, ...rest].slice(0, 5).map(toShellItem);
  const pills: StoryPill[] = items.map((i) => ({ slug: i.slug, label: i.label }));
  const first = items[0];
  const card = first
    ? {
        slug: first.slug,
        name: first.name,
        href: first.href,
        image: first.image,
        category: first.category,
        categoryName: first.categoryName,
        area: first.area,
        priceText: first.priceText,
        booking: first.booking,
      }
    : null;
  return <Story hero={hero} pills={pills} card={card} />;
}
