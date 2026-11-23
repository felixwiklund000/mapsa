// Ritar Mapsas app-ikoner (symbolen ur loggan) och sparar dem som PNG/SVG.
// Kör igen om loggan ändras: npm run icons
//
//   src/app/icon.svg          favicon i webbläsaren
//   src/app/apple-icon.png    hemskärmsikon på iPhone (180×180, fyrkantig – iOS rundar själv)
//   public/icons/icon-*.png   ikoner i manifestet (Android, Chrome)
//   public/icons/maskable-512.png  Android-ikon som får beskäras till cirkel/droppe

import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { MARK_PATH, MARK_VIEWBOX } from "../src/lib/brand-paths.ts";

// Som Mapsas profilbild: vit bakgrund, svart symbol.
const BACKGROUND = "#ffffff";
const MARK_COLOR = "#000000";

/**
 * @param size      ikonens storlek i pixlar
 * @param markScale symbolens bredd som andel av ikonen
 * @param radius    hörnradie som andel av ikonen (0 = fyrkantig, fyller hela ytan)
 */
function iconSvg(size: number, markScale: number, radius: number): string {
  const w = size * markScale;
  const scale = w / MARK_VIEWBOX.width;
  const h = MARK_VIEWBOX.height * scale;
  const x = (size - w) / 2;
  const y = (size - h) / 2;
  const r = size * radius;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="${BACKGROUND}"/>
  <path transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(5)})" d="${MARK_PATH}" fill="${MARK_COLOR}"/>
</svg>`;
}

async function png(svg: string, file: string) {
  await sharp(Buffer.from(svg)).png().toFile(file);
  console.log("Skrev", file);
}

mkdirSync("public/icons", { recursive: true });

writeFileSync("src/app/icon.svg", iconSvg(64, 0.78, 0.22));
console.log("Skrev src/app/icon.svg");

await png(iconSvg(180, 0.66, 0), "src/app/apple-icon.png");
await png(iconSvg(192, 0.66, 0.22), "public/icons/icon-192.png");
await png(iconSvg(512, 0.66, 0.22), "public/icons/icon-512.png");
// Maskable: hela ytan fylld, symbolen inom den säkra mittzonen (80 %).
await png(iconSvg(512, 0.5, 0), "public/icons/maskable-512.png");
