import { Activity, Droplet, Dumbbell, Scissors, Waves, type LucideProps } from "lucide-react";
import type { CategorySlug } from "@/lib/categories";

// Ryggrad för kiropraktor. Lucide saknar en, så den är ritad i samma stil
// (24×24, 2px linje, rundade ändar).
function Spine(props: LucideProps) {
  const { size = 24, strokeWidth = 2, className, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...(rest as React.SVGProps<SVGSVGElement>)}
    >
      <rect x="9" y="2.5" width="6" height="3.5" rx="1.5" />
      <rect x="8.5" y="8.25" width="7" height="3.5" rx="1.5" />
      <rect x="9" y="14" width="6" height="3.5" rx="1.5" />
      <path d="M10.5 20.5 12 21.5l1.5-1" />
      <path d="M6 7.25h2.5M15.5 7.25H18M6 13h2.5M15.5 13H18" />
    </svg>
  );
}

const ICONS: Record<CategorySlug, React.ComponentType<LucideProps>> = {
  massage: Waves,
  pt: Dumbbell,
  frisor: Scissors,
  kiropraktor: Spine,
  naprapat: Activity,
  skonhet: Droplet,
};

export function CategoryIcon({ slug, ...props }: { slug: CategorySlug } & LucideProps) {
  const Icon = ICONS[slug];
  return <Icon aria-hidden="true" {...props} />;
}

/** CSS-variabler för en kategoris färger (definierade i design-system.css). */
export function categoryVars(slug: CategorySlug) {
  return {
    color: `var(--cat-${slug})`,
    soft: `var(--cat-${slug}-soft)`,
    soft2: `var(--cat-${slug}-soft-2)`,
  };
}
