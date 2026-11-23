"use client";

// Levande förhandsvisning av anmälan: den riktiga kartan med företagarens egen
// prislapp, och kortet som kunden ser. Uppdateras medan man skriver.

import { useMemo } from "react";
import { PractitionerMap, type MapPoint } from "@/components/practitioner-map";
import { getCategory } from "@/lib/categories";
import { normalizeBooking, type SignupFields } from "@/lib/signup";

const NO_INSETS = { top: 0, bottom: 0, left: 0, right: 0 };
const DRAFT = "utkast";
const noop = () => {};

export function priceLabel(f: SignupFields): string | null {
  const n = Number(f.pris.replace(/\s/g, ""));
  return /^\d{1,6}$/.test(f.pris.replace(/\s/g, "")) && n > 0 ? `fr. ${n.toLocaleString("sv-SE")} kr` : null;
}

export function LivePreview({ fields, className = "" }: { fields: SignupFields; className?: string }) {
  const category = getCategory(fields.kategori);
  const name = fields.foretagsnamn.trim() || "Ditt företag";
  const price = priceLabel(fields);
  const lat = Number(fields.lat);
  const lng = Number(fields.lng);
  const placed = fields.lat !== "" && fields.lng !== "" && Number.isFinite(lat) && Number.isFinite(lng);
  const label = price ?? category?.name ?? "Ditt pris";
  const bookable = normalizeBooking(fields.bokningslank) !== null;

  const points: MapPoint[] = useMemo(
    () => (placed ? [{ slug: DRAFT, name, label, lat, lng }] : []),
    [placed, name, label, lat, lng],
  );

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl bg-sand-deep">
        <PractitionerMap
          points={points}
          selectedSlug={placed ? DRAFT : null}
          onSelect={noop}
          insets={NO_INSETS}
          showZoom={false}
          autoFit={false}
          label="Förhandsvisning av din prislapp på kartan"
        />
        {!placed && (
          <p className="pointer-events-none absolute inset-x-0 top-3 mx-auto w-fit rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-panel shadow-[0_2px_10px_rgb(0_0_0/0.12)]">
            Din prislapp landar här när du valt adress
          </p>
        )}
      </div>

      {/* Kortet kunden ser när hen trycker på din prislapp */}
      <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.25)] sm:p-4" aria-hidden="true">
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[11px] tracking-[0.08em] text-stone uppercase">
            {category?.name ?? "Kategori"}
            {fields.adress.trim() ? ` · ${fields.adress.split(",").slice(-1)[0].trim()}` : ""}
          </p>
          <p className="truncate text-base font-semibold text-panel">{name}</p>
          <p className="hidden truncate text-sm text-stone sm:block">
            {price ? `${price}${fields.tjanst.trim() ? ` · ${fields.tjanst.trim()}` : ""}` : "Ditt billigaste pris"}
          </p>
        </div>
        <span
          className={`flex h-10 shrink-0 items-center rounded-lg px-4 text-sm font-semibold transition-colors duration-300 ${
            bookable ? "bg-flame text-white" : "bg-sand text-stone"
          }`}
        >
          Boka
        </span>
      </div>
    </div>
  );
}
