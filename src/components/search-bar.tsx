import { MapPin, Search } from "lucide-react";
import { AREAS } from "@/lib/areas";
import type { Filters } from "@/lib/search";

// Stort rundat sökfält. Vanligt GET-formulär: fungerar utan JavaScript och
// sökningen hamnar i URL:en.

export function SearchBar({ filters }: { filters?: Filters }) {
  return (
    <form
      action="/"
      method="get"
      role="search"
      className="mx-auto flex w-full max-w-2xl flex-col gap-1 rounded-[28px] bg-surface p-2 shadow-float ring-1 ring-line/60 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full"
    >
      {filters?.categories.map((c) => (
        <input key={c} type="hidden" name="kategori" value={c} />
      ))}

      <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full px-4 py-2.5 sm:py-2">
        <Search className="size-5 shrink-0 text-ink-subtle" aria-hidden />
        <span className="sr-only">Sök på namn, tjänst eller område</span>
        <input
          name="q"
          type="search"
          defaultValue={filters?.q ?? ""}
          placeholder="Massage, frisör, Trossö …"
          autoComplete="off"
          className="w-full min-w-0 bg-transparent text-base text-ink placeholder:text-ink-subtle focus:outline-none"
        />
      </label>

      <div aria-hidden className="mx-4 h-px bg-line sm:mx-0 sm:h-8 sm:w-px" />

      <label className="relative flex items-center gap-3 rounded-full px-4 py-2.5 sm:w-52 sm:py-2">
        <MapPin className="size-5 shrink-0 text-ink-subtle" aria-hidden />
        <span className="sr-only">Område</span>
        <select
          name="omrade"
          defaultValue={filters?.area ?? ""}
          className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-base text-ink focus:outline-none"
        >
          <option value="">Hela Karlskrona</option>
          {AREAS.map((a) => (
            <option key={a.name} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="pointer-events-none absolute right-4 size-3 text-ink-subtle"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 4.5 3 3 3-3" />
        </svg>
      </label>

      <button
        type="submit"
        className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 font-semibold text-on-accent transition-colors hover:bg-accent-hover sm:mt-0"
      >
        <Search className="size-4.5" strokeWidth={2.5} aria-hidden />
        Sök
      </button>
    </form>
  );
}
