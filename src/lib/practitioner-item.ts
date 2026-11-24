// Utövare → det kartan, listan och kortet behöver (pris, bokning, kategori).

import type { ShellItem } from "@/components/home-shell";
import { formatPrice, lowestPrice } from "@/components/practitioner-row";
import { getCategory } from "./categories";
import type { Practitioner } from "./db/practitioners";
import { isExternalUrl, isValidBookingUrl } from "./urls";

export function toShellItem(p: Practitioner): ShellItem {
  const price = lowestPrice(p);
  const categoryName = getCategory(p.category)?.name ?? "";
  return {
    slug: p.slug,
    name: p.name,
    label: price === null ? categoryName || p.name : formatPrice(price),
    lat: p.lat,
    lng: p.lng,
    href: `/utovare/${p.slug}`,
    image: p.images[0]?.path ?? null,
    category: p.category,
    categoryName,
    area: p.area,
    priceText: price === null ? null : `fr. ${formatPrice(price)}`,
    booking: isValidBookingUrl(p.bookingUrl) ? { href: p.bookingUrl, external: isExternalUrl(p.bookingUrl) } : null,
  };
}
