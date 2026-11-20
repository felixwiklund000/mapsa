import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-container flex-1 pt-12 lg:pt-20">
      <h1 className="text-display">Sidan finns inte</h1>
      <p className="mt-2 max-w-md text-muted">Länken kan vara gammal, eller så har utövaren tagits bort från Mapsa.</p>
      <Link
        href="/"
        className="btn-primary mt-8 w-full sm:w-auto"
      >
        Till alla utövare
      </Link>
    </main>
  );
}
