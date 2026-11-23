"use client"; // Felgränser måste vara klientkomponenter

import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1">
      <SiteHeader />
      <div className="page-container pt-12 lg:pt-20">
        <h1 className="text-2xl font-bold lg:text-4xl">Något gick fel</h1>
        <p className="mt-2 max-w-[65ch] text-muted">Vi kunde inte hämta utövarna just nu. Försök igen om en stund.</p>
        <button type="button" onClick={() => retry()} className="btn-primary mt-8 w-full sm:inline-flex sm:w-auto">
          Försök igen
        </button>
        {/* Felkod att skicka till oss (serverfel visar bara en kod, aldrig detaljer). */}
        <p className="mt-10 text-xs text-muted">
          Felkod: {(error as { digest?: string })?.digest ?? (error instanceof Error ? error.message.slice(0, 160) : "okänd")} ·{" "}
          <a href="/api/status" className="underline underline-offset-2">
            status
          </a>
        </p>
      </div>
    </main>
  );
}
