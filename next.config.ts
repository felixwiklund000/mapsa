import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  devIndicators: false,
  // Kartan låg tidigare på / – gamla länkar (delade kort, kategorier, sökningar,
  // visningsläget) skickas dit. Querysträngen följer med automatiskt.
  async redirects() {
    return ["vald", "kategori", "q", "visning"].map((key) => ({
      source: "/",
      has: [{ type: "query" as const, key }],
      destination: "/karta",
      permanent: false,
    }));
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
