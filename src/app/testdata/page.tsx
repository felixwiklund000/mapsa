import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Det här är testdata | Mapsa",
  robots: { index: false },
};

export default function TestdataPage() {
  return (
    <main className="flex-1">
      <SiteHeader />
      <div className="page-container pt-12 lg:pt-20">
        <h1 className="text-2xl font-bold lg:text-4xl">Det här är testdata</h1>
        <div className="mt-4 max-w-[65ch] space-y-4">
          <p>
            Utövaren du klickade på är påhittad. Vi använder exempelprofiler medan vi bygger Mapsa, och de tas
            bort innan vi lanserar.
          </p>
          <p className="text-muted">
            Hos en riktig utövare kommer du i stället vidare till deras egen bokning, till exempel Bokadirekt,
            Fresha eller deras hemsida.
          </p>
        </div>
        <Link href="/karta" className="btn-primary mt-8 w-full sm:inline-flex sm:w-auto">
          Tillbaka till alla utövare
        </Link>
      </div>
    </main>
  );
}
