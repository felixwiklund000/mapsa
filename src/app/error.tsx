"use client"; // Felgränser måste vara klientkomponenter

import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-container flex-1 pt-12 lg:pt-20">
      <h1 className="text-display">Något gick fel</h1>
      <p className="mt-2 max-w-md text-muted">Vi kunde inte hämta utövarna just nu. Försök igen om en stund.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="btn-primary mt-8 w-full sm:w-auto"
      >
        Försök igen
      </button>
    </main>
  );
}
