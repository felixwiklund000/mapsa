"use client";

// Kortet som visas när man väljer en utövare (tryck på prislapp eller rad).
// Prislapp → Boka = 2 tryck. Ersätter listan medan det är öppet.

import Link from "next/link";
import { X } from "lucide-react";
import { BookingButton } from "./booking-button";
import { Photo } from "./photo";

export type CardItem = {
  slug: string;
  name: string;
  href: string;
  image: string | null;
  category: string;
  categoryName: string;
  area: string;
  priceText: string | null;
  booking: { href: string; external: boolean } | null;
};

export function SelectedCard({ item, onClose }: { item: CardItem; onClose: () => void }) {
  return (
    <article aria-label={item.name} className="relative">
      <button
        type="button"
        onClick={onClose}
        aria-label="Stäng"
        className="pressable absolute -top-1 -right-2 flex size-11 items-center justify-center rounded-full text-ink hover:bg-fill"
      >
        <X className="size-5" strokeWidth={2.25} aria-hidden />
      </button>

      <div className="flex items-center gap-4 pr-10">
        <Photo src={item.image} alt={item.name} category={item.category} className="size-16 shrink-0 rounded-xl" />
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{item.name}</h2>
          <p className="truncate text-sm text-muted">
            {item.categoryName} · {item.area}
          </p>
          {item.priceText && <p className="mt-0.5 text-base font-semibold">{item.priceText}</p>}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {item.booking ? (
          <>
            <BookingButton
              slug={item.slug}
              href={item.booking.href}
              external={item.booking.external}
              label="Boka"
              className="tap-guard flex-1"
            />
            <Link href={item.href} className="flex h-11 shrink-0 items-center px-3 text-sm font-semibold underline-offset-4 hover:underline">
              Mer info
            </Link>
          </>
        ) : (
          <Link href={item.href} className="btn-primary tap-guard flex-1">
            Mer info
          </Link>
        )}
      </div>
    </article>
  );
}
