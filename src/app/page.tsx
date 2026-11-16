import { Suspense } from "react";
import { connection } from "next/server";
import { getCategory } from "@/lib/categories";
import { listPublishedPractitioners } from "@/lib/db/practitioners";

// Enkel första version av startsidan: listar publicerade utövare direkt från
// databasen. Design, sök, filter och karta kommer i senare steg.

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Mapsa</h1>
      <p className="mt-1 text-neutral-600">Lokala utövare i Karlskrona.</p>

      <Suspense fallback={<p className="mt-8 text-neutral-500">Hämtar utövare…</p>}>
        <PractitionerList />
      </Suspense>
    </main>
  );
}

async function PractitionerList() {
  // Läs databasen vid varje besök, inte bara en gång när appen byggs.
  await connection();
  const practitioners = listPublishedPractitioners();

  if (practitioners.length === 0) {
    return <p className="mt-8 text-neutral-600">Inga utövare listade än.</p>;
  }

  return (
    <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
      {practitioners.map((p) => {
        const category = getCategory(p.category);
        const lowestPrice = Math.min(...p.services.map((s) => s.priceSek));
        return (
          <li key={p.id} className="py-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span
                aria-hidden
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: category?.color }}
              />
              <h2 className="font-semibold">{p.name}</h2>
              {p.isTestData && (
                <span className="rounded border border-neutral-300 px-1.5 text-xs text-neutral-600">
                  Testdata
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-neutral-600">
              {category?.name} · {p.area} · nivå: {p.level}
              {p.services.length > 0 && <> · från {lowestPrice} kr</>}
            </p>
            {p.description && <p className="mt-1 text-sm">{p.description}</p>}
          </li>
        );
      })}
    </ul>
  );
}
