import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CategoryFilter } from "@/components/category-filter";
import { formatPrice, lowestPrice, PractitionerCard } from "@/components/practitioner-card";
import { ResultsView } from "@/components/results-view";
import { SearchBar } from "@/components/search-bar";
import { getCategory } from "@/lib/categories";
import { listPublishedPractitioners, type Practitioner } from "@/lib/db/practitioners";
import { filterPractitioners, hasActiveFilters, parseFilters, type Filters } from "@/lib/search";

// Startsida: rubrik, sök, kategorifilter och resultat (lista + karta).
// Innehållet först – utövarna ska synas utan att man scrollar.

type SearchParams = PageProps<"/">["searchParams"];

export default function Home(props: PageProps<"/">) {
  return (
    <main className="page-container pt-8 lg:pt-12">
      <h1 className="text-title max-w-2xl text-ink">Massage, PT, frisör och mer i Karlskrona</h1>
      <p className="mt-2 text-muted">Jämför här. Boka direkt hos utövaren.</p>

      <Suspense fallback={<SearchAndFilter />}>
        <SearchAndFilterWithParams searchParams={props.searchParams} />
      </Suspense>

      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

function SearchAndFilter({ filters }: { filters?: Filters }) {
  return (
    <div className="mt-6 space-y-4 lg:mt-8">
      <SearchBar filters={filters} />
      <CategoryFilter filters={filters} />
    </div>
  );
}

async function SearchAndFilterWithParams({ searchParams }: { searchParams: SearchParams }) {
  return <SearchAndFilter filters={parseFilters(await searchParams)} />;
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const filters = parseFilters(await searchParams);
  const all = await listPublishedPractitioners();
  const results = filterPractitioners(all, filters);

  return (
    <section className="mt-8 border-t border-line pt-6" aria-labelledby="resultat">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 id="resultat" className="text-heading text-ink">
          {results.length} utövare
          {filters.area && <span className="font-normal text-muted"> i {filters.area}</span>}
        </h2>
        {hasActiveFilters(filters) && results.length > 0 && (
          <Link
            href="/"
            scroll={false}
            className="text-small -my-3 inline-flex h-11 items-center font-medium text-accent hover:text-accent-hover hover:underline"
          >
            Rensa filter
          </Link>
        )}
      </div>

      <ResultsView
        list={
          results.length === 0 ? (
            <EmptyState filters={filters} all={all} />
          ) : (
            <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
              {results.map((p) => (
                <li key={p.id}>
                  <PractitionerCard practitioner={p} />
                </li>
              ))}
            </ul>
          )
        }
        points={results.map(toMapPoint)}
      />
    </section>
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

// Sekundär knapp: sidans huvudknapp är Sök.
const secondaryButton =
  "inline-flex h-11 items-center rounded-control border border-line-strong px-5 font-medium text-ink transition-colors hover:border-ink active:bg-subtle";

function EmptyState({ filters, all }: { filters: Filters; all: Practitioner[] }) {
  // En vald kategori som saknar utövare helt: be utövare anmäla sig.
  const emptyCategory =
    filters.categories.length === 1 && !all.some((p) => p.category === filters.categories[0])
      ? getCategory(filters.categories[0])
      : undefined;

  if (emptyCategory) {
    return (
      <div className="max-w-xl rounded-media border border-line px-6 py-8">
        <p className="text-heading text-ink">Inga utövare inom {emptyCategory.name.toLocaleLowerCase("sv-SE")} än</p>
        <p className="mt-1 max-w-md text-muted">Är du utövare? Bli en av de första. Första månaden är gratis.</p>
        <Link href="/bli-utovare" className={`${secondaryButton} mt-6`}>
          Lista din verksamhet
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl rounded-media border border-line px-6 py-8">
      <p className="text-heading text-ink">Inga träffar</p>
      <p className="mt-1 max-w-md text-muted">Prova ett annat sökord, område eller en annan kategori.</p>
      <Link href="/" scroll={false} className={`${secondaryButton} mt-6`}>
        Visa alla utövare
      </Link>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="mt-8 border-t border-line pt-6" aria-busy="true" aria-label="Hämtar utövare">
      <div className="mb-6 h-6 w-28 animate-pulse rounded bg-subtle" />
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[3/2] animate-pulse rounded-media bg-subtle" />
            <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-subtle" />
            <div className="mt-2 h-3.5 w-1/2 animate-pulse rounded bg-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}
