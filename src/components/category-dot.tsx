import { getCategory } from "@/lib/categories";

/** Kategorins lilla färgprick – den enda färgen i gränssnittet. */
export function CategoryDot({ slug }: { slug: string }) {
  const color = getCategory(slug)?.dot;
  return <span aria-hidden className="inline-block size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />;
}
