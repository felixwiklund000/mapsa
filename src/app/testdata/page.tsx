import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Det här är testdata | Mapsa",
  robots: { index: false },
};

export default function TestdataPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Det här är testdata</h1>
      <p className="mt-4">
        Utövaren du klickade på är påhittad. Vi använder exempelprofiler medan vi bygger Mapsa, så att
        sidan inte står tom. De märks med &quot;Testdata&quot; och tas bort innan vi lanserar.
      </p>
      <p className="mt-4">
        För en riktig utövare skickas du i stället vidare till deras egen bokning, till exempel
        Bokadirekt, Fresha eller deras hemsida.
      </p>
      <p className="mt-8">
        <Link href="/" className="underline underline-offset-2">
          ← Tillbaka till alla utövare
        </Link>
      </p>
    </main>
  );
}
