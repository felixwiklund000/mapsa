import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-container pt-16 lg:pt-24">
      <h1 className="text-title text-ink">Sidan finns inte</h1>
      <p className="mt-2 max-w-md text-muted">Länken kan vara gammal, eller så har utövaren tagits bort från Mapsa.</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-control bg-accent px-5 font-semibold text-on-accent transition-colors hover:bg-accent-hover"
      >
        Till alla utövare
      </Link>
    </main>
  );
}
