import Link from "next/link";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <main className="page-container flex flex-col items-center py-24 text-center sm:py-32">
      <span className="flex size-16 items-center justify-center rounded-full bg-surface text-ink-muted shadow-card">
        <MapPinOff className="size-7" aria-hidden />
      </span>
      <h1 className="text-title mt-6 text-ink">Sidan finns inte</h1>
      <p className="text-lead mt-3 max-w-md">
        Länken kan vara gammal, eller så har utövaren tagits bort från Mapsa.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-full bg-accent px-6 py-3 font-semibold text-on-accent hover:bg-accent-hover"
      >
        Till alla utövare
      </Link>
    </main>
  );
}
