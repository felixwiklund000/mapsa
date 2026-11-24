import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <main className="flex-1">
      <SiteHeader />
      <div className="page-container pt-12 lg:pt-20">
        <h1 className="text-2xl font-bold lg:text-4xl">Sidan finns inte</h1>
        <p className="mt-2 max-w-[65ch] text-muted">
          Länken kan vara gammal, eller så har utövaren tagits bort från Mapsa.
        </p>
        <Link href="/karta" className="btn-primary mt-8 w-full sm:inline-flex sm:w-auto">
          Till alla utövare
        </Link>
      </div>
    </main>
  );
}
