"use client";

// Bokningsknappen är en vanlig länk, så den fungerar även utan JavaScript.
// Vid klick skickas en "beacon" som räknar klicket i bakgrunden – länken
// väntar aldrig på den.

export function BookingButton({
  slug,
  href,
  name,
  external,
}: {
  slug: string;
  href: string;
  name: string;
  external: boolean;
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
      className="inline-flex w-full items-center justify-center rounded-lg bg-[#a85a26] px-5 py-3 font-semibold text-white hover:bg-[#8f4c20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a85a26] sm:w-auto"
    >
      Boka hos {name}
      {external && <span className="sr-only"> (öppnas i ny flik)</span>}
    </a>
  );
}
