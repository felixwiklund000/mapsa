import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical } from "lucide-react";

export const metadata: Metadata = {
  title: "Det här är testdata | Mapsa",
  robots: { index: false },
};

export default function TestdataPage() {
  return (
    <main className="page-container py-16 sm:py-24">
      <div className="mx-auto max-w-xl rounded-card bg-surface p-8 shadow-card sm:p-10">
        <span className="flex size-12 items-center justify-center rounded-full bg-sunken text-ink-muted">
          <FlaskConical className="size-6" aria-hidden />
        </span>
        <h1 className="text-title mt-6 text-ink">Det här är testdata</h1>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink">
          Utövaren du klickade på är påhittad. Vi använder exempelprofiler medan vi bygger Mapsa, så att
          sidan inte står tom. De är märkta med ”Testdata” och tas bort innan vi lanserar.
        </p>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-muted">
          För en riktig utövare skickas du i stället vidare till deras egen bokning, till exempel
          Bokadirekt, Fresha eller deras hemsida.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-full bg-accent px-6 py-3 font-semibold text-on-accent hover:bg-accent-hover"
        >
          Tillbaka till alla utövare
        </Link>
      </div>
    </main>
  );
}
