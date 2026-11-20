"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { AREAS } from "@/lib/areas";
import { filtersToHref, type Filters } from "@/lib/search";

// Områdesväljaren som ett chip bland filtren. Valt område = svart chip.
export function AreaChip({ filters }: { filters?: Filters }) {
  const router = useRouter();
  const active = Boolean(filters?.area);

  return (
    <label
      className={`pressable relative inline-flex h-9 shrink-0 items-center rounded-lg ${
        active ? "bg-ink text-canvas" : "bg-fill text-ink"
      }`}
    >
      <span className="sr-only">Område</span>
      <select
        value={filters?.area ?? ""}
        disabled={!filters}
        onChange={(e) => {
          if (!filters) return;
          router.push(filtersToHref({ ...filters, area: e.target.value || null }), { scroll: false });
        }}
        className="h-9 cursor-pointer appearance-none bg-transparent pr-8 pl-3 text-sm font-semibold focus:outline-none"
      >
        <option value="">Alla områden</option>
        {AREAS.map((a) => (
          <option key={a.name} value={a.name}>
            {a.name}
          </option>
        ))}
      </select>
      {/* Pilen visar att chipet öppnar en lista */}
      <ChevronDown className="pointer-events-none absolute right-2 size-4" strokeWidth={2.5} aria-hidden />
    </label>
  );
}
