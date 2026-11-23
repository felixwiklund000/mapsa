import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/site-header";
import { ClearDraft } from "@/components/signup/clear-draft";
import { brandFonts } from "../fonts";

export const metadata: Metadata = {
  title: "Tack! – Mapsa",
  robots: { index: false },
};

export default function TackPage() {
  return (
    <div className={`${brandFonts} flex min-h-dvh flex-col bg-sand text-panel`}>
      <ClearDraft />
      <header className="mx-auto flex h-16 w-full max-w-[1440px] items-center px-4 pt-[env(safe-area-inset-top)] sm:px-8">
        <Logo />
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center px-5 pb-24">
        <span className="flex size-14 items-center justify-center rounded-full bg-flame text-white" aria-hidden>
          <Check className="size-7" strokeWidth={2.5} />
        </span>
        <h1 className="mt-8 font-serif text-headline">Tack!</h1>
        <p className="mt-4 text-xl leading-relaxed text-stone">Vi hör av oss inom 48 timmar.</p>
        <p className="mt-10 text-base text-stone">Under tiden:</p>
        <Link
          href="/"
          className="pressable mt-3 inline-flex h-14 items-center rounded-full bg-panel px-7 text-lg font-medium text-white"
        >
          Se kartan
        </Link>
      </main>
    </div>
  );
}
