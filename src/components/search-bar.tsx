import { Search } from "lucide-react";
import { AREAS } from "@/lib/areas";
import type { Filters } from "@/lib/search";

// Sökfält + område + knapp. Vanligt GET-formulär: fungerar utan JavaScript
// och sökningen hamnar i URL:en.

const field =
  "h-12 w-full rounded-control border border-line-strong bg-canvas text-base text-ink transition-colors hover:border-faint focus:border-ink focus:outline-none";

export function SearchBar({ filters }: { filters?: Filters }) {
  return (
    <form action="/" method="get" role="search" className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_13rem_auto]">
      {filters?.categories.map((c) => (
        <input key={c} type="hidden" name="kategori" value={c} />
      ))}

      <label className="relative col-span-2 block sm:col-span-1">
        <span className="sr-only">Sök på namn, tjänst eller område</span>
        {/* Ikonen visar att fältet är ett sökfält */}
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-faint" aria-hidden />
        <input
          name="q"
          type="search"
          defaultValue={filters?.q ?? ""}
          placeholder="Sök tjänst, namn eller område"
          autoComplete="off"
          className={`${field} pr-3 pl-10 placeholder:text-faint`}
        />
      </label>

      <label className="relative block">
        <span className="sr-only">Område</span>
        <select name="omrade" defaultValue={filters?.area ?? ""} className={`${field} cursor-pointer appearance-none pr-9 pl-3.5`}>
          <option value="">Alla områden</option>
          {AREAS.map((a) => (
            <option key={a.name} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="pointer-events-none absolute top-1/2 right-3.5 size-3 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 4.5 3 3 3-3" />
        </svg>
      </label>

      <button
        type="submit"
        className="h-12 rounded-control bg-accent px-6 font-semibold text-on-accent transition-colors hover:bg-accent-hover active:bg-accent-hover/90"
      >
        Sök
      </button>
    </form>
  );
}
