import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CategoryFilter } from "@/components/category-filter";
import { HomeShell } from "@/components/home-shell";
import { formatPrice, lowestPrice, PractitionerRow } from "@/components/practitioner-row";
import { SearchBar } from "@/components/search-bar";
import { SiteFooter } from "@/components/site-footer";
import { getCategory } from "@/lib/categories";
import { listPublishedPractitioners, type Practitioner } from "@/lib/db/practitioners";
import { filterPractitioners, hasActiveFilters, parseFilters, type Filters } from "@/lib/search";

// Startsida: karta + lista. Se HomeShell för layouten.

export default function Home(props: PageProps<"/">) {
  return (
    <main className="flex-1">
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
  const testCount = results.filter((p) => p.isTestData).length;
  const allTest = results.length > 0 && testCount === results.length;

  return (
    <HomeShell
      search={<SearchBar filters={filters} />}
      header={<ListHeader filters={filters} count={results.length} allTest={allTest} />}
      list={
        results.length === 0 ? (
          <EmptyState filters={filters} all={all} />
        ) : (
          <ul className="divide-y divide-line">
            {results.map((p) => (
              <li key={p.id}>
                <PractitionerRow practitioner={p} showTestLabel={testCount > 0 && !allTest} />
              </li>
            ))}
          </ul>
        )
      }
      footer={<SiteFooter inline />}
      points={results.map(toMapPoint)}
    />
  );
}

function ListHeader({ filters, count, allTest }: { filters?: Filters; count?: number; allTest?: boolean }) {
  return (
    <>
      <div className="mt-1 flex items-end justify-between gap-4 lg:mt-0">
        <div>
          <h1 className="text-title lg:text-display">Utövare i Karlskrona</h1>
          <p className="text-small mt-1 text-muted">
            {count === undefined ? " " : `${count} ${count === 1 ? "träff" : "träffar"}`}
            {filters?.area && ` i ${filters.area}`}
            {allTest && " · påhittade testprofiler"}
          </p>
        </div>
        {filters && hasActiveFilters(filters) && (
          <Link href="/" scroll={false} className="btn-secondary shrink-0 text-sm">
            Rensa
          </Link>
        )}
      </div>
      <div className="mt-4">
        <CategoryFilter filters={filters} />
      </div>
    </>
  );
}

function toMapPoint(p: Practitioner) {
  const price = lowestPrice(p);
  return {
    slug: p.slug,
    name: p.name,
    area: p.area,
    categoryName: getCategory(p.category)?.name ?? "",
    priceFrom: price === null ? null : formatPrice(price),
    lat: p.lat,
    lng: p.lng,
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
      <div className="py-6">
        <p className="text-heading">Inga utövare inom {emptyCategory.name.toLocaleLowerCase("sv-SE")} än</p>
        <p className="mt-1 text-muted">Är du utövare? Bli en av de första. Första månaden är gratis.</p>
        <Link href="/bli-utovare" className="btn-secondary mt-5">
          Lista din verksamhet
        </Link>
      </div>
    );
  }
  return (
    <div className="py-6">
      <p className="text-heading">Inga träffar</p>
      <p className="mt-1 text-muted">Prova ett annat sökord, område eller en annan kategori.</p>
      <Link href="/" scroll={false} className="btn-secondary mt-5">
        Visa alla utövare
      </Link>
    </div>
  );
}

// Visas medan data hämtas: samma layout, utan innehåll.
function HomeFallback() {
  return (
    <HomeShell
      search={<SearchBar />}
      header={<ListHeader />}
      list={
        <ul aria-busy="true" aria-label="Hämtar utövare">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="flex items-center gap-4 py-3">
              <div className="size-16 animate-pulse rounded-control bg-fill" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 animate-pulse rounded bg-fill" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-fill" />
              </div>
            </li>
          ))}
        </ul>
      }
      footer={null}
      points={[]}
    />
  );
}
