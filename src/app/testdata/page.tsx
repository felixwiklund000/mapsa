import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Det här är testdata | Mapsa",
  robots: { index: false },
};

export default function TestdataPage() {
  return (
    <main className="page-container pt-16 lg:pt-24">
      <h1 className="text-title text-ink">Det här är testdata</h1>
      <div className="mt-4 max-w-prose space-y-4 text-ink">
        <p>
          Utövaren du klickade på är påhittad. Vi använder exempelprofiler medan vi bygger Mapsa. De är märkta
          med ”Testdata” och tas bort innan vi lanserar.
        </p>
        <p className="text-muted">
          Hos en riktig utövare kommer du i stället vidare till deras egen bokning, till exempel Bokadirekt,
          Fresha eller deras hemsida.
        </p>
      </div>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-control bg-accent px-5 font-semibold text-on-accent transition-colors hover:bg-accent-hover"
      >
        Tillbaka till alla utövare
      </Link>
    </main>
  );
}
