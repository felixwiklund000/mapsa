// Hjälpfunktioner för länkar som utövare själva anger.

/**
 * En bokningslänk är giltig om den är en absolut http(s)-URL ELLER en intern
 * sökväg som börjar med "/" (t.ex. /testdata). Används både vid visning och
 * vid validering i anmälningsformuläret.
 */
export function isValidBookingUrl(value: string): boolean {
  const v = value.trim();
  if (v.startsWith("/")) return !v.startsWith("//");
  try {
    const url = new URL(v);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isExternalUrl(value: string): boolean {
  return !value.trim().startsWith("/");
}

/**
 * Gör om en YouTube- eller Vimeo-länk till en inbäddningsadress.
 * Returnerar null för andra länkar (de visas då som vanlig länk).
 */
export function toVideoEmbedUrl(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1];
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com") {
    const id = url.pathname.match(/^\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}
