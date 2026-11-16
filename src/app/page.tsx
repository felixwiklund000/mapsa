import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { AREAS } from "@/lib/areas";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { listPublishedPractitioners, type Practitioner } from "@/lib/db/practitioners";
import {
  filterPractitioners,
  filtersToHref,
  hasActiveFilters,
  parseFilters,
  toggleCategoryHref,
  type Filters,
} from "@/lib/search";

// Startsida: sök, kategorirutnät och resultatlista. Enkel layout – design
// kommer i nästa omgång.

export default function Home(props: PageProps<"/">) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Hitta lokala utövare i Karlskrona</h1>
        <p className="mt-2 text-neutral-600">
          Massörer, PT:er, frisörer och fler på ett ställe. Du bokar direkt hos utövaren.
        </p>
      </div>

      <Suspense fallback={<p className="mt-10 text-center text-neutral-500">Hämtar utövare…</p>}>
        <SearchAndResults searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function SearchAndResults({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  await connection();
  const filters = parseFilters(await searchParams);
  const all = listPublishedPractitioners();
  const results = filterPractitioners(all, filters);
  // Antal per kategori räknas med sök och område, men oberoende av vald kategori.
  const forCounts = filterPractitioners(all, filters, { ignoreCategories: true });

  return (
    <>
      <SearchForm filters={filters} />
      <CategoryGrid filters={filters} practitioners={forCounts} />

      <section className="mt-10" aria-labelledby="resultat">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="resultat" className="text-xl font-semibold">
            {results.length} utövare
          </h2>
          {hasActiveFilters(filters) && (
            <Link href="/" className="text-sm underline underline-offset-2">
              Rensa filter
            </Link>
          )}
        </div>
        {results.length === 0 ? (
          <EmptyState filters={filters} all={all} />
        ) : (
          <ResultList practitioners={results} />
        )}
      </section>
    </>
  );
}

function SearchForm({ filters }: { filters: Filters }) {
  return (
    <form action="/" method="get" role="search" className="mx-auto mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row">
      {filters.categories.map((c) => (
        <input key={c} type="hidden" name="kategori" value={c} />
      ))}
      <label className="sr-only" htmlFor="q">
        Sök på namn, tjänst eller område
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={filters.q}
        placeholder="Sök t.ex. ”massage” eller ”Trossö”"
        className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2"
      />
      <label className="sr-only" htmlFor="omrade">
        Område
      </label>
      <select
        id="omrade"
        name="omrade"
        defaultValue={filters.area ?? ""}
        className="rounded-lg border border-neutral-300 px-3 py-2"
      >
        <option value="">Alla områden</option>
        {AREAS.map((a) => (
          <option key={a.name} value={a.name}>
            {a.name}
          </option>
        ))}
      </select>
      <button type="submit" className="rounded-lg bg-neutral-900 px-4 py-2 font-medium text-white">
        Sök
      </button>
    </form>
  );
}

function CategoryGrid({ filters, practitioners }: { filters: Filters; practitioners: Practitioner[] }) {
  return (
    <nav aria-label="Kategorier" className="mt-8">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((c) => {
          const count = practitioners.filter((p) => p.category === c.slug).length;
          const active = filters.categories.includes(c.slug);
          return (
            <li key={c.slug}>
              <Link
                href={toggleCategoryHref(filters, c.slug)}
                aria-pressed={active}
                className="flex h-full flex-col gap-2 rounded-xl border-2 bg-neutral-100 p-3 hover:bg-neutral-200"
                style={{ borderColor: active ? c.color : "transparent" }}
              >
                <span
                  aria-hidden
                  className="inline-block size-8 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span className="font-medium">{c.name}</span>
                <span className="text-sm text-neutral-600">
                  {count} {count === 1 ? "träff" : "träffar"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function EmptyState({ filters, all }: { filters: Filters; all: Practitioner[] }) {
  // En vald kategori som saknar utövare helt: be utövare anmäla sig.
  if (filters.categories.length === 1 && !all.some((p) => p.category === filters.categories[0])) {
    const name = getCategory(filters.categories[0])?.name ?? "";
    return (
      <p className="mt-4 text-neutral-700">
        Inga utövare listade än i {name.toLocaleLowerCase("sv-SE")} – är du utövare?{" "}
        <Link href="/bli-utovare" className="underline underline-offset-2">
          Bli en av de första, gratis första månaden
        </Link>
        .
      </p>
    );
  }
  return (
    <p className="mt-4 text-neutral-700">
      Inga träffar – prova en annan sökning eller kategori.{" "}
      <Link href={filtersToHref({ q: "", categories: [], area: null })} className="underline underline-offset-2">
        Visa alla
      </Link>
    </p>
  );
}

function ResultList({ practitioners }: { practitioners: Practitioner[] }) {
  return (
    <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
      {practitioners.map((p) => {
        const category = getCategory(p.category);
        const lowestPrice = p.services.length > 0 ? Math.min(...p.services.map((s) => s.priceSek)) : null;
        return (
          <li key={p.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span
                  aria-hidden
                  className="inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: category?.color }}
                />
                <h3 className="font-semibold">
                  <Link href={`/utovare/${p.slug}`} className="underline-offset-2 hover:underline">
                    {p.name}
                  </Link>
                </h3>
                {p.isTestData && (
                  <span className="rounded border border-neutral-300 px-1.5 text-xs text-neutral-600">
                    Testdata
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-neutral-600">
                {category?.name} · {p.area}
                {lowestPrice !== null && <> · från {lowestPrice.toLocaleString("sv-SE")} kr</>}
              </p>
              {p.description && <p className="mt-1 line-clamp-2 text-sm">{p.description}</p>}
            </div>
            <Link
              href={`/utovare/${p.slug}`}
              className="shrink-0 rounded-lg bg-[#a85a26] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[#8f4c20]"
            >
              Boka
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
