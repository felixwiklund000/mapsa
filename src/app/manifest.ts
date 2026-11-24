import type { MetadataRoute } from "next";

// Gör Mapsa installerbar som app ("Lägg till på hemskärmen").
// Öppnas utan webbläsarens adressfält (standalone).

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mapsa – lokala utövare i Blekinge",
    short_name: "Mapsa",
    description:
      "Hitta och jämför massörer, PT:er, frisörer, kiropraktorer, naprapater och skönhet i Blekinge.",
    lang: "sv",
    start_url: "/karta",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["health", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
