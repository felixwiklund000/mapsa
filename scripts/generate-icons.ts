// Ritar Mapsas app-ikoner (kartnålen) och sparar dem som PNG/SVG.
// Kör igen om loggan ändras: npm run icons
//
//   src/app/icon.svg          favicon i webbläsaren
//   src/app/apple-icon.png    hemskärmsikon på iPhone (180×180, fyrkantig – iOS rundar själv)
//   public/icons/icon-*.png   ikoner i manifestet (Android, Chrome)
//   public/icons/maskable-512.png  Android-ikon som får beskäras till cirkel/droppe

import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const ACCENT = "#a85a26";
const PIN_COLOR = "#ffffff";

// Kartnålen från loggan (src/components/site-header.tsx), ritad i en 22×26-ruta.
const PIN_PATH =
  "M11 1C5.48 1 1 5.33 1 10.68c0 3.86 2.7 7.6 8.08 13.1a2.7 2.7 0 0 0 3.84 0C18.3 18.28 21 14.54 21 10.68 21 5.33 16.52 1 11 1Z";

/**
 * @param size     ikonens storlek i pixlar
 * @param pinScale nålens höjd som andel av ikonen
 * @param radius   hörnradie som andel av ikonen (0 = fyrkantig, fyller hela ytan)
 */
function iconSvg(size: number, pinScale: number, radius: number): string {
  const pinH = size * pinScale;
  const scale = pinH / 26;
  const pinW = 22 * scale;
  const x = (size - pinW) / 2;
  const y = (size - pinH) / 2 + size * 0.01; // nålens spets gör att den ser hög ut – flytta ner en aning
  const r = size * radius;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="${ACCENT}"/>
  <g transform="translate(${x} ${y}) scale(${scale})">
    <path d="${PIN_PATH}" fill="${PIN_COLOR}"/>
    <circle cx="11" cy="10.5" r="3.6" fill="${ACCENT}"/>
  </g>
</svg>`;
}

async function png(svg: string, file: string) {
  await sharp(Buffer.from(svg)).png().toFile(file);
  console.log("Skrev", file);
}

mkdirSync("public/icons", { recursive: true });

writeFileSync("src/app/icon.svg", iconSvg(64, 0.6, 0.22));
console.log("Skrev src/app/icon.svg");

await png(iconSvg(180, 0.56, 0), "src/app/apple-icon.png");
await png(iconSvg(192, 0.56, 0.22), "public/icons/icon-192.png");
await png(iconSvg(512, 0.56, 0.22), "public/icons/icon-512.png");
// Maskable: hela ytan fylld, nålen inom den säkra mittzonen (80 %).
await png(iconSvg(512, 0.42, 0), "public/icons/maskable-512.png");
