import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getCategory } from "@/lib/categories";
import { getPublishedPractitionerBySlug, type Practitioner } from "@/lib/db/practitioners";
import { isExternalUrl, isValidBookingUrl, toVideoEmbedUrl } from "@/lib/urls";
import { BookingButton } from "./booking-button";

// Profilsida för en utövare. Enkel layout – design kommer i nästa omgång.

export async function generateMetadata(props: PageProps<"/utovare/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = getPublishedPractitionerBySlug(slug);
  if (!p) return { title: "Utövaren hittades inte | Mapsa", robots: { index: false } };
  const category = getCategory(p.category);
  return {
    title: `${p.name} – ${category?.name ?? ""} i ${p.area} | Mapsa`,
    description:
      p.description?.slice(0, 155) ??
      `${p.name} i ${p.area}, Karlskrona. Se tjänster, priser och boka direkt hos utövaren.`,
    robots: p.isTestData ? { index: false } : undefined,
  };
}

export default function PractitionerPage(props: PageProps<"/utovare/[slug]">) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-neutral-600 underline-offset-2 hover:underline">
        ← Alla utövare
      </Link>
      <Suspense fallback={<p className="mt-8 text-neutral-500">Hämtar profil…</p>}>
        <Profile params={props.params} />
      </Suspense>
    </main>
  );
}

async function Profile({ params }: { params: PageProps<"/utovare/[slug]">["params"] }) {
  await connection();
  const { slug } = await params;
  const p = getPublishedPractitionerBySlug(slug);
  if (!p) notFound();

  const category = getCategory(p.category);
  const bookingUrlOk = isValidBookingUrl(p.bookingUrl);
  const featured = p.level === "mellan" || p.level === "vip";

  return (
    <article className="mt-6">
      <header>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: category?.color }}
            />
            {category?.name}
          </span>
          {featured && (
            <span
              className="rounded-full border px-2 text-xs font-medium"
              style={{ borderColor: category?.color, color: category?.color }}
            >
              Utvald
            </span>
          )}
          {p.level === "vip" && (
            <span className="rounded-full border border-neutral-400 px-2 text-xs font-medium">VIP</span>
          )}
          {p.isTestData && (
            <span className="rounded border border-neutral-300 px-1.5 text-xs text-neutral-600">
              Testdata
            </span>
          )}
        </div>
        <h1 className="mt-2 text-3xl font-bold">{p.name}</h1>
        <p className="mt-1 text-neutral-600">
          {p.address ? `${p.address}, ` : ""}
          {p.area}, Karlskrona
        </p>
      </header>

      <Gallery practitioner={p} />

      {p.campaign && p.level !== "grundlistning" && (
        <p className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
          <span className="font-semibold">Kampanj: </span>
          {p.campaign}
        </p>
      )}

      {p.description && <p className="mt-6 whitespace-pre-line">{p.description}</p>}

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Tjänster och priser</h2>
        {p.services.length === 0 ? (
          <p className="mt-2 text-neutral-600">Utövaren har inte lagt upp några tjänster än.</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
            {p.services.map((s) => (
              <li key={s.id} className="flex items-baseline justify-between gap-4 py-3">
                <span>
                  {s.name}
                  {s.durationMin && <span className="text-sm text-neutral-600"> · {s.durationMin} min</span>}
                </span>
                <span className="shrink-0 font-medium tabular-nums">{s.priceSek.toLocaleString("sv-SE")} kr</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        {bookingUrlOk ? (
          <>
            <BookingButton
              slug={p.slug}
              href={p.bookingUrl}
              name={p.name}
              external={isExternalUrl(p.bookingUrl)}
            />
            <p className="mt-2 text-sm text-neutral-600">
              Mapsa bokar inte åt dig – du går vidare till {genitive(p.name)} egen bokning.
            </p>
          </>
        ) : (
          <p className="text-neutral-600">Bokningslänken saknas just nu. Kontakta utövaren direkt.</p>
        )}
      </section>

      {p.level === "vip" && <Video url={p.videoUrl} name={p.name} />}

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">Öppettider</h2>
          <p className="mt-2 whitespace-pre-line">{p.openingHours ?? "Ej angivet"}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Kontakt</h2>
          <ul className="mt-2 space-y-1">
            <li>
              <a href={`mailto:${p.email}`} className="underline underline-offset-2">
                {p.email}
              </a>
            </li>
            {p.phone && (
              <li>
                <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="underline underline-offset-2">
                  {p.phone}
                </a>
              </li>
            )}
          </ul>
        </div>
      </section>
    </article>
  );
}

function Gallery({ practitioner: p }: { practitioner: Practitioner }) {
  const category = getCategory(p.category);
  if (p.images.length === 0) {
    // Platshållare – får sin riktiga stil i designomgången.
    return (
      <div className="mt-6 flex aspect-[16/9] items-center justify-center rounded-xl bg-neutral-100">
        <span
          aria-hidden
          className="flex size-16 items-center justify-center rounded-full text-2xl font-bold text-white"
          style={{ backgroundColor: category?.color }}
        >
          {p.name.charAt(0)}
        </span>
        <span className="sr-only">Ingen bild uppladdad</span>
      </div>
    );
  }
  const [first, ...rest] = p.images;
  return (
    <div className="mt-6 space-y-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- uppladdade bilder, optimeras senare */}
      <img src={first.path} alt={p.name} className="aspect-[16/9] w-full rounded-xl object-cover" />
      {rest.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {rest.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={img.path}
              alt={`${p.name}, bild ${i + 2}`}
              className="aspect-square w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Video({ url, name }: { url: string | null; name: string }) {
  const embed = url ? toVideoEmbedUrl(url) : null;
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">Video</h2>
      {embed ? (
        <iframe
          src={embed}
          title={`Video från ${name}`}
          className="mt-3 aspect-video w-full rounded-xl"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : url ? (
        <p className="mt-2">
          <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            Se video från {name}
          </a>
        </p>
      ) : (
        <div className="mt-3 flex aspect-video items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-neutral-600">
          Video kommer snart
        </div>
      )}
    </section>
  );
}

/** Svensk genitiv: "Saxen & Spegeln" -> "Saxen & Spegelns", "Glöd Hus" -> "Glöd Hus". */
function genitive(name: string): string {
  return /[sxz]$/i.test(name.trim()) ? name.trim() : `${name.trim()}s`;
}
