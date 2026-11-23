// Beskär utövarnas foton till samma format: 4:3, 1200×900, JPG.
// Använd bara foton som företaget själv gett er lov att använda.
//
// 1. Lägg originalen i mappen bilder-original/ med utövarens slug som namn,
//    t.ex. bilder-original/lugna-handen-massage.jpg (jpg, jpeg, png eller webp).
// 2. Kör: npm run photos
// 3. Resultatet hamnar i public/foton/<slug>.jpg. Lägg sedan in sökvägen
//    /foton/<slug>.jpg som bild för utövaren.

import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { extname, join, basename } from "node:path";
import sharp from "sharp";
import { REAL_PLACES as PROFILES } from "./real-data.ts";

const SRC = "bilder-original";
const OUT = "public/foton";

if (!existsSync(SRC)) {
  console.error(`Mappen ${SRC}/ finns inte. Skapa den och lägg originalfotona där.`);
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const slugs = new Set(PROFILES.map((p) => p.slug));

for (const file of files) {
  const slug = basename(file, extname(file));
  if (!slugs.has(slug)) {
    console.warn(`Hoppar över ${file}: ingen utövare heter ${slug}.`);
    continue;
  }
  await sharp(join(SRC, file))
    .rotate() // följ kamerans orientering
    .resize(1200, 900, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(OUT, `${slug}.jpg`));
  console.log(`Skrev ${OUT}/${slug}.jpg`);
}

const missing = PROFILES.filter((p) => !existsSync(join(OUT, `${p.slug}.jpg`))).map((p) => p.slug);
console.log(missing.length ? `Saknar foto: ${missing.join(", ")}` : "Alla utövare har foto.");
