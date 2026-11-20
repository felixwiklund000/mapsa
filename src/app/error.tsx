"use client"; // Felgränser måste vara klientkomponenter

import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-container pt-16 lg:pt-24">
      <h1 className="text-title text-ink">Något gick fel</h1>
      <p className="mt-2 max-w-md text-muted">Vi kunde inte hämta utövarna just nu. Försök igen om en stund.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-8 inline-flex h-11 items-center rounded-control bg-accent px-5 font-semibold text-on-accent transition-colors hover:bg-accent-hover"
      >
        Försök igen
      </button>
    </main>
  );
}
