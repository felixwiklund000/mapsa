import { Crown, Star } from "lucide-react";
import type { Level } from "@/lib/db/practitioners";

// Utvald (Mellan) och VIP: diskret guld-detalj, aldrig skrikigt.
export function LevelBadge({ level, className = "" }: { level: Level; className?: string }) {
  if (level !== "mellan" && level !== "vip") return null;
  const vip = level === "vip";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-gold-line bg-gold-soft px-2.5 py-1 text-xs font-semibold text-gold ${className}`}
    >
      {vip ? <Crown className="size-3.5" strokeWidth={2.25} aria-hidden /> : <Star className="size-3.5 fill-current" strokeWidth={0} aria-hidden />}
      {vip ? "VIP" : "Utvald"}
    </span>
  );
}

export function TestDataBadge({ className = "" }: { className?: string }) {
  return (
    <span
      title="Påhittad exempelprofil – tas bort före lansering"
      className={`inline-flex items-center rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-ink-muted ring-1 ring-line backdrop-blur ${className}`}
    >
      Testdata
    </span>
  );
}
