import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CategoryFilter } from "@/components/category-filter";
import { HomeShell, type ShellItem } from "@/components/home-shell";
import { formatPrice, lowestPrice, PractitionerCard, PractitionerRow } from "@/components/practitioner-row";
import { SearchBar } from "@/components/search-bar";
import { getCategory } from "@/lib/categories";
import { listPublishedPractitioners, type Practitioner } from "@/lib/db/practitioners";
import { filterPractitioners, parseFilters, type Filters } from "@/lib/search";

// Startsida: karta + lista. Layouten finns i HomeShell.

export default function Home(props: PageProps<"/">) {
  return (
    <main className="flex-1">
      <h1 className="sr-only">Massage, PT, frisör och mer i Karlskrona</h1>
      <Suspense fallback={<HomeFallback />}>
        <HomeContent searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function HomeContent({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  await connection();
  const filters = parseFilters(await searchParams);
  const all = await listPublishedPractitioners();
  const results = filterPractitioners(all, filters);

  return (
    <HomeShell
      search={<SearchBar filters={filters} />}
      header={<ListHeader filters={filters} count={results.length} />}
      list={
        results.length === 0 ? (
          <EmptyState filters={filters} all={all} />
        ) : (
          <>
            {/* Mobil: rader i bottenarket */}
            <ul className="space-y-2 lg:hidden">
              {results.map((p) => (
                <li key={p.id}>
                  <PractitionerRow practitioner={p} />
                </li>
              ))}
            </ul>
            {/* Desktop: kort med stor bild i två kolumner */}
            <ul className="hidden gap-x-6 gap-y-8 pt-2 lg:grid lg:grid-cols-2">
              {results.map((p) => (
                <li key={p.id}>
                  <PractitionerCard practitioner={p} />
                </li>
              ))}
            </ul>
          </>
        )
      }
      footer={<Footer />}
      items={results.map(toItem)}
    />
  );
}

function ListHeader({ filters, count }: { filters?: Filters; count?: number }) {
  return (
    <>
      <h2 className="mt-2 text-lg font-semibold lg:mt-0">{count === undefined ? " " : `${count} utövare`}</h2>
      <div className="mt-4">
        <CategoryFilter filters={filters} />
      </div>
    </>
  );
}

function Footer() {
  return (
    <p className="mt-8 border-t border-line py-6 text-sm text-muted">
      Mapsa bokar inte åt dig. Vi länkar vidare till utövarens egen bokning. UF-företag i Karlskrona.
    </p>
  );
}

function toItem(p: Practitioner): ShellItem {
  const price = lowestPrice(p);
  return {
    slug: p.slug,
    name: p.name,
    label: price === null ? "–" : formatPrice(price),
    lat: p.lat,
    lng: p.lng,
    href: `/utovare/${p.slug}`,
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
        <Link href="/bli-utovare" className="btn-secondary mt-4">
          Lista din verksamhet
        </Link>
      </div>
    );
  }
  return (
    <div className="py-4">
      <p className="font-semibold">Inga träffar</p>
      <p className="mt-1 text-muted">Prova ett annat sökord, område eller en annan kategori.</p>
      <Link href="/" scroll={false} className="btn-secondary mt-4">
        Visa alla utövare
      </Link>
    </div>
  );
}

// Skelett medan listan laddar: samma layout, grå block i radernas form.
function HomeFallback() {
  return (
    <HomeShell
      search={<SearchBar />}
      header={<ListHeader />}
      list={
        <>
        <ul className="hidden gap-x-6 gap-y-8 pt-2 lg:grid lg:grid-cols-2" aria-busy="true" aria-label="Hämtar utövare">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i}>
              <div className="aspect-[4/3] animate-pulse rounded-xl bg-fill" />
              <div className="mt-3 h-4 w-2/3 animate-pulse rounded-lg bg-fill" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded-lg bg-fill" />
            </li>
          ))}
        </ul>
        <ul className="space-y-2 lg:hidden" aria-busy="true" aria-label="Hämtar utövare">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="flex h-20 items-center gap-4">
              <div className="size-16 shrink-0 animate-pulse rounded-lg bg-fill" />
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
    />
  );
}
