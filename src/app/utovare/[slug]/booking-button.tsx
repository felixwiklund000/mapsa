"use client";

import { ArrowUpRight } from "lucide-react";

// Bokningsknappen är en vanlig länk, så den fungerar även utan JavaScript.
// Vid klick skickas en "beacon" som räknar klicket i bakgrunden – länken
// väntar aldrig på den. Pilen visar att man lämnar Mapsa.

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
      className={`inline-flex min-h-12 items-center justify-center gap-1.5 rounded-control bg-accent px-5 py-2.5 text-center leading-snug font-semibold text-on-accent transition-colors hover:bg-accent-hover active:bg-accent-hover/90 ${className}`}
    >
      <span>{label}</span>
      {external && (
        <>
          <ArrowUpRight className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
          <span className="sr-only"> (öppnas i ny flik)</span>
        </>
      )}
    </a>
  );
}
