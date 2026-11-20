import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { formatPrice, lowestPrice } from "@/components/practitioner-card";
import { getCategory } from "@/lib/categories";
import { getPublishedPractitionerBySlug, type Practitioner } from "@/lib/db/practitioners";
import { isExternalUrl, isValidBookingUrl, toVideoEmbedUrl } from "@/lib/urls";
import { BookingButton } from "./booking-button";

export async function generateMetadata(props: PageProps<"/utovare/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getPublishedPractitionerBySlug(slug);
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
    <main className="page-container pt-4 lg:pt-6">
      <Link
        href="/"
        className="text-small -ml-1 inline-flex h-11 items-center gap-1.5 rounded-control px-1 text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden /> Alla utövare
      </Link>
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile params={props.params} />
      </Suspense>
    </main>
  );
}

async function Profile({ params }: { params: PageProps<"/utovare/[slug]">["params"] }) {
  await connection();
  const { slug } = await params;
  const p = await getPublishedPractitionerBySlug(slug);
  if (!p) notFound();

  const category = getCategory(p.category);
  const price = lowestPrice(p);
  const booking = isValidBookingUrl(p.bookingUrl)
    ? { href: p.bookingUrl, external: isExternalUrl(p.bookingUrl) }
    : null;
  const note = `Mapsa bokar inte åt dig. Du går vidare till ${genitive(p.name)} egen bokning.`;
  const videoUrl = p.level === "vip" ? p.videoUrl : null;

  return (
    <article className="mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
      <div className="min-w-0">
        <Gallery practitioner={p} />

        <header className={p.images.length > 0 ? "mt-8" : ""}>
          <h1 className="text-title text-ink">{p.name}</h1>
          <p className="mt-2 text-muted">
            {category?.name} · {p.address ? `${p.address}, ` : ""}
            {p.area}, Karlskrona
          </p>
          {p.isTestData && (
            <p className="text-small mt-1 text-faint">Testdata – det här är en påhittad exempelprofil.</p>
          )}
        </header>

        {p.description && <p className="mt-6 max-w-prose whitespace-pre-line text-ink">{p.description}</p>}

        {p.campaign && p.level !== "grundlistning" && (
          <p className="mt-6 max-w-prose border-l-2 border-ink pl-4 text-ink">
            <span className="font-semibold">Erbjudande:</span> {p.campaign}
          </p>
        )}

        <section className="mt-12" aria-labelledby="tjanster">
          <h2 id="tjanster" className="text-heading text-ink">
            Tjänster
          </h2>
          {p.services.length === 0 ? (
            <p className="mt-3 text-muted">Inga tjänster upplagda än.</p>
          ) : (
            <ul className="mt-3 border-t border-line">
              {p.services.map((s) => (
                <li key={s.id} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                  <span className="min-w-0 text-ink">
                    {s.name}
                    {s.durationMin && <span className="text-muted"> · {s.durationMin} min</span>}
                  </span>
                  <span className="shrink-0 text-ink tabular-nums">{formatPrice(s.priceSek)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {videoUrl && <Video url={videoUrl} name={p.name} />}

        <section className="mt-12" aria-labelledby="info">
          <h2 id="info" className="text-heading text-ink">
            Öppettider och kontakt
          </h2>
          <dl className="mt-3 border-t border-line">
            <InfoRow label="Öppettider">{p.openingHours ?? "Ej angivet"}</InfoRow>
            <InfoRow label="E-post">
              <a href={`mailto:${p.email}`} className="break-all text-accent hover:text-accent-hover hover:underline">
                {p.email}
              </a>
            </InfoRow>
            {p.phone && (
              <InfoRow label="Telefon">
                <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="text-accent hover:text-accent-hover hover:underline">
                  {p.phone}
                </a>
              </InfoRow>
            )}
          </dl>
        </section>
      </div>

      {/* Bokning: ruta till höger på desktop */}
      <aside className="hidden lg:block">
        <div className="sticky top-8 rounded-media border border-line p-6">
          {price !== null && <p className="text-heading text-ink">från {formatPrice(price)}</p>}
          {booking ? (
            <>
              <BookingButton
                slug={p.slug}
                href={booking.href}
                external={booking.external}
                label="Boka tid"
                className="mt-4 w-full"
              />
              <p className="text-small mt-3 text-muted">{note}</p>
            </>
          ) : (
            <p className="text-small mt-3 text-muted">Bokningslänk saknas. Kontakta utövaren direkt.</p>
          )}
        </div>
      </aside>

      {/* Bokning: fast rad längst ner på mobil */}
      {booking && (
        <div className="sticky bottom-0 z-40 -mx-5 mt-12 border-t border-line bg-canvas px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:-mx-8 sm:px-8 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            {price !== null && <p className="text-ink">från {formatPrice(price)}</p>}
            <BookingButton slug={p.slug} href={booking.href} external={booking.external} label="Boka tid" className="min-w-40" />
          </div>
          <p className="sr-only">{note}</p>
        </div>
      )}
    </article>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-line py-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
      <dt className="text-muted">{label}</dt>
      <dd className="whitespace-pre-line text-ink">{children}</dd>
    </div>
  );
}

// Visas bara när det finns riktiga bilder.
function Gallery({ practitioner: p }: { practitioner: Practitioner }) {
  if (p.images.length === 0) return null;
  const [first, ...rest] = p.images;
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element -- uppladdade bilder optimeras senare */}
      <img src={first.path} alt={p.name} className="aspect-[16/10] w-full rounded-media object-cover" />
      {rest.length > 0 && (
        <div className="mt-2 grid grid-cols-4 gap-2">
          {rest.slice(0, 4).map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={img.path}
              alt={`${p.name}, bild ${i + 2}`}
              className="aspect-square w-full rounded-media object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Video({ url, name }: { url: string; name: string }) {
  const embed = toVideoEmbedUrl(url);
  return (
    <section className="mt-12" aria-labelledby="video">
      <h2 id="video" className="text-heading text-ink">
        Video
      </h2>
      {embed ? (
        <iframe
          src={embed}
          title={`Video från ${name}`}
          className="mt-3 aspect-video w-full rounded-media"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-accent hover:underline">
          Se video från {name}
        </a>
      )}
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mt-4" aria-busy="true" aria-label="Hämtar profil">
      <div className="h-9 w-2/3 animate-pulse rounded bg-subtle" />
      <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-subtle" />
      <div className="mt-8 h-24 max-w-prose animate-pulse rounded bg-subtle" />
    </div>
  );
}

/** Svensk genitiv: "Saxen & Spegeln" -> "Saxen & Spegelns", "Glöd Hus" -> "Glöd Hus". */
function genitive(name: string): string {
  return /[sxz]$/i.test(name.trim()) ? name.trim() : `${name.trim()}s`;
}
