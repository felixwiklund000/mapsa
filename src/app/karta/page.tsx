import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { connection } from "next/server";
import { CategoryFilter } from "@/components/category-filter";
import { HomeShell, type ShellItem } from "@/components/home-shell";
import { formatPrice, lowestPrice, PractitionerRow } from "@/components/practitioner-row";
import { SearchBar } from "@/components/search-bar";
import { getCategory, type CategorySlug } from "@/lib/categories";
import { listPublishedPractitioners, type Practitioner } from "@/lib/db/practitioners";
import { filterPractitioners, parseFilters, type Filters } from "@/lib/search";
import { isExternalUrl, isValidBookingUrl } from "@/lib/urls";

// Kartan: karta + lista. Layouten finns i HomeShell.

export const metadata: Metadata = {
  title: "Hitta och jämför utövare i Blekinge | Mapsa",
  description:
    "Massörer, PT:er, frisörer, kiropraktorer, naprapater och skönhet i Blekinge på en karta, med priset. Du bokar direkt hos utövaren.",
};

export default function KartaPage(props: PageProps<"/karta">) {
  return (
    <main className="flex-1">
      <h1 className="sr-only">Massage, PT, frisör och mer i Blekinge</h1>
      <Suspense fallback={<HomeFallback />}>
        <HomeContent searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function HomeContent({ searchParams }: { searchParams: PageProps<"/karta">["searchParams"] }) {
  await connection();
  const params = await searchParams;
  const filters = parseFilters(params);
  // ?vald=<slug>: delad länk – öppna kortet för den utövaren direkt.
  const vald = typeof params.vald === "string" ? params.vald : null;
  const all = await listPublishedPractitioners();
  const results = filterPractitioners(all, filters);

  return (
    <HomeShell
      search={<SearchBar filters={filters} />}
      header={<ListHeader filters={filters} count={results.length} available={[...new Set(all.map((p) => p.category))]} />}
      list={
        results.length === 0 ? (
          <EmptyState filters={filters} all={all} />
        ) : (
          <ul className="space-y-1">
            {results.map((p) => (
              <li key={p.id}>
                <PractitionerRow practitioner={p} />
              </li>
            ))}
          </ul>
        )
      }
      footer={<Footer />}
      items={results.map(toItem)}
      initialSelected={vald}
    />
  );
}

function ListHeader({
  filters,
  count,
  available,
}: {
  filters?: Filters;
  count?: number;
  available?: CategorySlug[];
}) {
  return (
    <>
      <h2 className="mt-1 text-lg font-semibold lg:mt-0">{count === undefined ? " " : `${count} utövare`}</h2>
      <div className="mt-3">
        <CategoryFilter filters={filters} available={available} />
      </div>
    </>
  );
}

function Footer() {
  return (
    <div className="mt-8 border-t border-line py-6">
      <Link
        href="/foretag"
        className="pressable flex items-center gap-4 rounded-2xl bg-ink p-5 text-canvas"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold">Driver du ett företag?</span>
          <span className="mt-1 block text-sm text-canvas/70">Syns på kartan med dina priser – första månaden gratis.</span>
        </span>
        <ArrowRight className="size-5 shrink-0" strokeWidth={2.25} aria-hidden />
      </Link>
      <p className="mt-5 text-sm text-muted">
        Mapsa bokar inte åt dig. Vi länkar vidare till utövarens egen bokning. UF-företag i Karlskrona.
      </p>
    </div>
  );
}

function toItem(p: Practitioner): ShellItem {
  const price = lowestPrice(p);
  const categoryName = getCategory(p.category)?.name ?? "";
  return {
    slug: p.slug,
    name: p.name,
    label: price === null ? categoryName || p.name : formatPrice(price),
    lat: p.lat,
    lng: p.lng,
    href: `/utovare/${p.slug}`,
    image: p.images[0]?.path ?? null,
    category: p.category,
    categoryName,
    area: p.area,
    priceText: price === null ? null : `fr. ${formatPrice(price)}`,
    booking: isValidBookingUrl(p.bookingUrl) ? { href: p.bookingUrl, external: isExternalUrl(p.bookingUrl) } : null,
  };
}

function EmptyState({ filters, all }: { filters: Filters; all: Practitioner[] }) {
  // En vald kategori som saknar utövare helt: be utövare anmäla sig.
  const emptyCategory =
    filters.categories.length === 1 && !all.some((p) => p.category === filters.categories[0])
      ? getCategory(filters.categories[0])
      : undefined;

  if (emptyCategory) {
    return (
      <div className="py-4">
        <p className="font-semibold">Inga utövare inom {emptyCategory.name.toLocaleLowerCase("sv-SE")} än</p>
        <p className="mt-1 text-muted">Är du utövare? Bli en av de första. Första månaden är gratis.</p>
        <Link href="/foretag#anmal" className="btn-secondary mt-4">
          Lista din verksamhet
        </Link>
      </div>
    );
  }
  return (
    <div className="py-4">
      <p className="font-semibold">Inga träffar</p>
      <p className="mt-1 text-muted">Prova ett annat sökord eller en annan kategori.</p>
      <Link href="/karta" scroll={false} className="btn-secondary mt-4">
        Visa alla utövare
      </Link>
    </div>
  );
}

// Skelett medan listan laddar: samma layout, ljusa block i radernas form och
// kartans laddvy (ingen karta startas förrän listan finns).
function HomeFallback() {
  return (
    <HomeShell
      search={<SearchBar />}
      header={<ListHeader available={[]} />}
      list={
        <>
        <ul className="space-y-1" aria-busy="true" aria-label="Hämtar utövare">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="flex h-20 items-center gap-4">
              <div className="size-16 shrink-0 animate-pulse rounded-lg bg-[#f2efe8]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 animate-pulse rounded-lg bg-fill" />
                <div className="h-3 w-1/3 animate-pulse rounded-lg bg-fill" />
              </div>
              <div className="h-4 w-16 animate-pulse rounded-lg bg-fill" />
            </li>
          ))}
        </ul>
        </>
      }
      footer={null}
      items={[]}
      mapPlaceholder
    />
  );
}
