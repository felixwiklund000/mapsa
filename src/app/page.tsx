import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, SearchX, Sparkles, X } from "lucide-react";
import { CategoryRail } from "@/components/category-rail";
import { formatPrice, lowestPrice, PractitionerCard } from "@/components/practitioner-card";
import { ResultsView } from "@/components/results-view";
import { SearchBar } from "@/components/search-bar";
import { getCategory } from "@/lib/categories";
import { listPublishedPractitioners, type Practitioner } from "@/lib/db/practitioners";
import {
  filterPractitioners,
  filtersToHref,
  hasActiveFilters,
  parseFilters,
  toggleCategoryHref,
  type Filters,
} from "@/lib/search";

// Startsida: hero med sök, kategorier, utövarkort och karta.

export default function Home(props: PageProps<"/">) {
  return (
    <main>
      <section className="page-container pt-14 pb-10 text-center sm:pt-24 sm:pb-14">
        <h1 className="text-display mx-auto max-w-3xl text-ink">Hitta din nästa behandling i Karlskrona</h1>
        <p className="text-lead mx-auto mt-5 max-w-xl">
          Massage, PT, frisör, kiropraktor, naprapat och skönhet på ett ställe. Du jämför här och bokar
          direkt hos utövaren.
        </p>
        <div className="mt-9 sm:mt-10">
          <Suspense fallback={<SearchBar />}>
            <SearchBarWithFilters searchParams={props.searchParams} />
          </Suspense>
        </div>
      </section>

      <Suspense fallback={<ResultsSkeleton />}>
        <CategoriesAndResults searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

type SearchParams = PageProps<"/">["searchParams"];

async function SearchBarWithFilters({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseFilters(await searchParams);
  return <SearchBar filters={filters} />;
}

async function CategoriesAndResults({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const filters = parseFilters(await searchParams);
  const all = listPublishedPractitioners();
  const results = filterPractitioners(all, filters);
  // Antal per kategori räknas med sök och område, men oberoende av vald kategori.
  const forCounts = filterPractitioners(all, filters, { ignoreCategories: true });

  return (
    <>
      <section className="page-container" aria-label="Kategorier">
        <CategoryRail filters={filters} practitioners={forCounts} />
      </section>

      <section className="page-container mt-14 sm:mt-16" aria-labelledby="resultat">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <h2 id="resultat" className="text-heading text-ink">
              {resultHeading(results.length, filters)}
            </h2>
            <p className="text-meta mt-1">Utvalda utövare visas först.</p>
          </div>
          <ActiveFilters filters={filters} />
        </div>

        <ResultsView
          list={
            results.length === 0 ? (
              <EmptyState filters={filters} all={all} />
            ) : (
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
    </>
  );
}

function resultHeading(count: number, filters: Filters): string {
  const where = filters.area ? `i ${filters.area}` : "i Karlskrona";
  if (count === 0) return `Inga utövare ${where}`;
  return `${count} utövare ${where}`;
}

function toMapPoint(p: Practitioner) {
  const category = getCategory(p.category);
  const price = lowestPrice(p);
  return {
    slug: p.slug,
    name: p.name,
    area: p.area,
    categoryName: category?.name ?? "",
    color: category?.color ?? "#6b665e",
    priceFrom: price === null ? null : formatPrice(price),
    lat: p.lat,
    lng: p.lng,
  };
}

// Valda filter som borttagbara chips.
function ActiveFilters({ filters }: { filters: Filters }) {
  if (!hasActiveFilters(filters)) return null;
  const chip =
    "inline-flex items-center gap-1.5 rounded-full bg-surface py-1.5 pr-2.5 pl-3.5 text-sm font-medium text-ink shadow-card ring-1 ring-line transition hover:ring-line-strong";
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.q && (
        <Link href={filtersToHref({ ...filters, q: "" })} className={chip} scroll={false}>
          ”{filters.q}” <X className="size-3.5 text-ink-subtle" aria-label="Ta bort" />
        </Link>
      )}
      {filters.categories.map((c) => (
        <Link key={c} href={toggleCategoryHref(filters, c)} className={chip} scroll={false}>
          {getCategory(c)?.name} <X className="size-3.5 text-ink-subtle" aria-label="Ta bort" />
        </Link>
      ))}
      {filters.area && (
        <Link href={filtersToHref({ ...filters, area: null })} className={chip} scroll={false}>
          {filters.area} <X className="size-3.5 text-ink-subtle" aria-label="Ta bort" />
        </Link>
      )}
      <Link href="/" scroll={false} className="px-2 text-sm font-medium text-accent hover:text-accent-hover">
        Rensa allt
      </Link>
    </div>
  );
}

function EmptyState({ filters, all }: { filters: Filters; all: Practitioner[] }) {
  // En vald kategori som saknar utövare helt: be utövare anmäla sig.
  const emptyCategory =
    filters.categories.length === 1 && !all.some((p) => p.category === filters.categories[0])
      ? getCategory(filters.categories[0])
      : undefined;

  return (
    <div className="flex flex-col items-center rounded-card bg-surface px-6 py-14 text-center shadow-card">
      <span className="flex size-14 items-center justify-center rounded-full bg-sunken text-ink-muted">
        {emptyCategory ? <Sparkles className="size-6" aria-hidden /> : <SearchX className="size-6" aria-hidden />}
      </span>
      {emptyCategory ? (
        <>
          <p className="text-card-title mt-5 text-ink">
            Inga utövare listade än i {emptyCategory.name.toLocaleLowerCase("sv-SE")}
          </p>
          <p className="text-meta mt-2 max-w-sm">Är du utövare? Bli en av de första – gratis första månaden.</p>
          <Link
            href="/bli-utovare"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
          >
            Lista din verksamhet <ArrowRight className="size-4" aria-hidden />
          </Link>
        </>
      ) : (
        <>
          <p className="text-card-title mt-5 text-ink">Inga träffar</p>
          <p className="text-meta mt-2 max-w-sm">Prova en annan sökning eller kategori.</p>
          <Link
            href="/"
            scroll={false}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-sunken px-5 py-2.5 text-sm font-semibold text-ink hover:bg-line"
          >
            Visa alla utövare
          </Link>
        </>
      )}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Hämtar utövare">
      <section className="page-container">
        <CategoryRail />
      </section>
      <section className="page-container mt-14 sm:mt-16">
        <div className="mb-6 h-7 w-56 animate-pulse rounded-full bg-sunken" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="rounded-card bg-surface p-2 shadow-card">
              <div className="aspect-[4/3] animate-pulse rounded-media bg-sunken" />
              <div className="space-y-2 px-2.5 py-4">
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-sunken" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-sunken" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
