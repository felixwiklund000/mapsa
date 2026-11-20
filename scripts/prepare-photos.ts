// Beskär testprofilernas foton till samma format: 4:3, 1200×900, JPG.
//
// 1. Lägg originalen i mappen bilder-original/ med utövarens slug som namn,
//    t.ex. bilder-original/lugna-handen-massage.jpg (jpg, jpeg, png eller webp).
// 2. Kör: npm run photos
// 3. Resultatet hamnar i public/testdata/<slug>.jpg.
//
// Se docs/testdata-bilder.md för vilka foton som behövs.

import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { extname, join, basename } from "node:path";
import sharp from "sharp";
import { PROFILES } from "./seed-data.ts";

const SRC = "bilder-original";
const OUT = "public/testdata";

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
    console.warn(`Hoppar över ${file}: ingen testprofil heter ${slug}.`);
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
console.log(missing.length ? `Saknas fortfarande: ${missing.join(", ")}` : "Alla testprofiler har foto.");
