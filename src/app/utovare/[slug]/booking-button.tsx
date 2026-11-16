"use client";

import { ArrowUpRight } from "lucide-react";

// Bokningsknappen är en vanlig länk, så den fungerar även utan JavaScript.
// Vid klick skickas en "beacon" som räknar klicket i bakgrunden – länken
// väntar aldrig på den.

export function BookingButton({
  slug,
  href,
  label,
  external,
  className = "",
}: {
  slug: string;
  href: string;
  label: string;
  external: boolean;
  className?: string;
}) {
  function countClick() {
    try {
      const url = `/api/bokningsklick/${encodeURIComponent(slug)}`;
      if (!navigator.sendBeacon?.(url)) {
        void fetch(url, { method: "POST", keepalive: true }).catch(() => {});
      }
    } catch {
      // Räkningen är best-effort och får aldrig stoppa bokningen.
    }
  }

  return (
    <a
      href={href}
      onClick={countClick}
      {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
      className={`inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-center leading-snug font-semibold text-on-accent shadow-card transition hover:bg-accent-hover hover:shadow-lift active:scale-[0.98] ${className}`}
    >
      <span>{label}</span>
      <ArrowUpRight className="size-4.5 shrink-0" strokeWidth={2.5} aria-hidden />
      {external && <span className="sr-only"> (öppnas i ny flik)</span>}
    </a>
  );
}
