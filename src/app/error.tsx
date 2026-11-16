"use client"; // Felgränser måste vara klientkomponenter

import { useEffect } from "react";
import { RotateCw } from "lucide-react";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-container flex flex-col items-center py-24 text-center sm:py-32">
      <h1 className="text-title text-ink">Något gick fel</h1>
      <p className="text-lead mt-3 max-w-md">
        Vi kunde inte hämta utövarna just nu. Försök igen om en liten stund.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-on-accent hover:bg-accent-hover"
      >
        <RotateCw className="size-4" aria-hidden /> Försök igen
      </button>
    </main>
  );
}
