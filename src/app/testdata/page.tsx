import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Det här är testdata | Mapsa",
  robots: { index: false },
};

export default function TestdataPage() {
  return (
    <main className="page-container flex-1 pt-12 lg:pt-20">
      <h1 className="text-display">Det här är testdata</h1>
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
        className="btn-primary mt-8 w-full sm:w-auto"
      >
        Tillbaka till alla utövare
      </Link>
    </main>
  );
}
