import { ArrowRight, Search } from "lucide-react";
import { AREAS } from "@/lib/areas";
import type { Filters } from "@/lib/search";

// Sökfält i en rad: fritext · område · svart knapp. Vanligt GET-formulär,
// fungerar utan JavaScript och sökningen hamnar i URL:en.
// Mobil: vit med tunn kant (ligger ovanpå kartan). Desktop: grått fält.

export function SearchBar({ filters, className = "" }: { filters?: Filters; className?: string }) {
  return (
    <form
      action="/"
      method="get"
      role="search"
      className={`flex h-13 items-center rounded-control border border-line bg-canvas pl-3.5 lg:border-transparent lg:bg-fill ${className}`}
    >
      {filters?.categories.map((c) => (
        <input key={c} type="hidden" name="kategori" value={c} />
      ))}

      <label className="flex min-w-0 flex-1 items-center gap-2.5">
        <Search className="size-4.5 shrink-0" strokeWidth={2.5} aria-hidden />
        <span className="sr-only">Sök på tjänst, namn eller område</span>
        <input
          name="q"
          type="search"
          enterKeyHint="search"
          defaultValue={filters?.q ?? ""}
          placeholder="Vad letar du efter?"
          autoComplete="off"
          className="h-11 w-full min-w-0 bg-transparent text-base font-medium text-ink placeholder:font-normal placeholder:text-muted focus:outline-none"
        />
      </label>

      <label className="relative flex h-full shrink-0 items-center border-l border-line pl-3">
        <span className="sr-only">Område</span>
        <select
          name="omrade"
          defaultValue={filters?.area ?? ""}
          className="h-11 max-w-30 cursor-pointer appearance-none truncate bg-transparent pr-5 text-[0.9375rem] font-medium text-ink focus:outline-none sm:max-w-40"
        >
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
          className="pointer-events-none absolute right-1 size-3"
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
        aria-label="Sök"
        className="m-1 flex size-11 shrink-0 items-center justify-center rounded-[6px] bg-ink text-on-ink transition-colors hover:bg-ink-hover active:scale-95"
      >
        <ArrowRight className="size-5" strokeWidth={2.5} aria-hidden />
      </button>
    </form>
  );
}
