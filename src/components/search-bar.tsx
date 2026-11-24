import { Search } from "lucide-react";
import type { Filters } from "@/lib/search";

// Sökfält enligt Ubers "Vart vill du åka?": helt runt, 60 px högt, vit
// bakgrund, 1 px kant, ikon + 18 px text. Skugga bara när det flyter över
// kartan (mobil). Enter söker.
// Valda kategorier följer med som dolda fält.

const BAR = "flex h-15 items-center gap-4 rounded-full border border-line bg-canvas px-5";

export function SearchBar({ filters }: { filters?: Filters }) {
  return (
    <form action="/karta" method="get" role="search" className={`${BAR} shadow-float lg:shadow-none`}>
      {filters?.categories.map((c) => (
        <input key={c} type="hidden" name="kategori" value={c} />
      ))}

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

/** Samma sökfält som bild (startsidans berättelse): visar en text, går inte att använda. */
export function SearchBarPreview({ text, caret = false }: { text: string; caret?: boolean }) {
  return (
    <div aria-hidden className={`${BAR} shadow-float`}>
      <Search className="size-6 shrink-0" strokeWidth={2} />
      <span className="flex h-12 min-w-0 flex-1 items-center text-lg text-ink">
        {text || <span className="text-muted">Vad letar du efter?</span>}
        {caret && <span className="scene-caret ml-px h-6 w-0.5 bg-ink" />}
      </span>
    </div>
  );
}
