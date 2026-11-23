// Kopierar MapLibres worker-fil till public/, så att den kan laddas av
// webbläsaren. (Next paketerar MapLibre så att den inte hittar filen själv.)
// Körs automatiskt före `npm run dev` och `npm run build`.
import { copyFileSync } from "node:fs";

copyFileSync("node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", "public/maplibre-gl-worker.js");
