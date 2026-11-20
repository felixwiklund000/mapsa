import { Search } from "lucide-react";
import type { Filters } from "@/lib/search";

// Sökfält enligt Ubers "Vart vill du åka?": helt runt, 60 px högt, vit
// bakgrund, 1 px kant, ikon + 18 px text. Skugga bara när det flyter över
// kartan (mobil). Enter söker.
// Valda kategorier och område följer med som dolda fält.

export function SearchBar({ filters }: { filters?: Filters }) {
  return (
    <form
      action="/"
      method="get"
      role="search"
      className="flex h-15 items-center gap-4 rounded-full border border-line bg-canvas px-5 shadow-float lg:shadow-none"
    >
      {filters?.categories.map((c) => (
        <input key={c} type="hidden" name="kategori" value={c} />
      ))}
      {filters?.area && <input type="hidden" name="omrade" value={filters.area} />}

      <Search className="size-6 shrink-0" strokeWidth={2} aria-hidden />
      <label className="min-w-0 flex-1">
        <span className="sr-only">Sök på tjänst, namn eller område</span>
        <input
          name="q"
          type="search"
          enterKeyHint="search"
          defaultValue={filters?.q ?? ""}
          placeholder="Vad letar du efter?"
          autoComplete="off"
          className="h-12 w-full bg-transparent text-lg text-ink placeholder:text-muted focus:outline-none"
        />
      </label>
      <button type="submit" className="sr-only">
        Sök
      </button>
    </form>
  );
}
