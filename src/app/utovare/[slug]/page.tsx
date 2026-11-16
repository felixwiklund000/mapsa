import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Clock, Mail, MapPin, Phone, PlayCircle, Tag } from "lucide-react";
import { CategoryIcon, categoryVars } from "@/components/category-icon";
import { formatPrice, lowestPrice } from "@/components/practitioner-card";
import { PractitionerCover } from "@/components/practitioner-cover";
import { LevelBadge, TestDataBadge } from "@/components/ui/badges";
import { getCategory } from "@/lib/categories";
import { getPublishedPractitionerBySlug, type Practitioner } from "@/lib/db/practitioners";
import { isExternalUrl, isValidBookingUrl, toVideoEmbedUrl } from "@/lib/urls";
import { BookingButton } from "./booking-button";

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
    <main className="page-container pt-5 sm:pt-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-full py-1.5 pr-3 text-sm font-medium text-ink-muted transition hover:text-ink"
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
  const p = getPublishedPractitionerBySlug(slug);
  if (!p) notFound();

  const category = getCategory(p.category);
  const v = categoryVars(p.category);
  const price = lowestPrice(p);
  const booking = isValidBookingUrl(p.bookingUrl)
    ? { href: p.bookingUrl, external: isExternalUrl(p.bookingUrl) }
    : null;
  const disclaimer = `Mapsa bokar inte åt dig – du går vidare till ${genitive(p.name)} egen bokning.`;

  return (
    <article className="mt-4">
      {/* Bild / header */}
      <Gallery practitioner={p} />

      <div className="mt-8 lg:mt-12 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        <div>
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold"
                style={{ backgroundColor: v.soft, color: v.color }}
              >
                <CategoryIcon slug={p.category} className="size-4" strokeWidth={2.25} />
                {category?.name}
              </span>
              <LevelBadge level={p.level} />
            </div>
            <h1 className="text-title mt-4 text-ink">{p.name}</h1>
            <p className="mt-3 flex items-center gap-1.5 text-ink-muted">
              <MapPin className="size-4.5 shrink-0" aria-hidden />
              {p.address ? `${p.address}, ` : ""}
              {p.area}, Karlskrona
            </p>
          </header>

          {p.campaign && p.level !== "grundlistning" && (
            <div className="mt-8 flex gap-3 rounded-card bg-accent-soft px-5 py-4">
              <Tag className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
              <p>
                <span className="font-semibold text-ink">Kampanj </span>
                <span className="text-ink">{p.campaign}</span>
              </p>
            </div>
          )}

          {p.description && (
            <section className="mt-10">
              <h2 className="text-heading text-ink">Om {p.name}</h2>
              <p className="mt-3 max-w-prose text-[1.0625rem] leading-relaxed whitespace-pre-line text-ink">
                {p.description}
              </p>
            </section>
          )}

          <section className="mt-12">
            <h2 className="text-heading text-ink">Tjänster och priser</h2>
            {p.services.length === 0 ? (
              <p className="text-meta mt-3">Utövaren har inte lagt upp några tjänster än.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line overflow-hidden rounded-card bg-surface shadow-card">
                {p.services.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{s.name}</p>
                      {s.durationMin && (
                        <p className="text-meta mt-0.5 flex items-center gap-1">
                          <Clock className="size-3.5" aria-hidden /> {s.durationMin} min
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 font-display text-[1.0625rem] font-bold tracking-[-0.01em] text-ink tabular-nums">
                      {formatPrice(s.priceSek)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {p.level === "vip" && <Video url={p.videoUrl} name={p.name} />}

          <section className="mt-12 grid gap-4 sm:grid-cols-2">
            <div className="rounded-card bg-surface p-6 shadow-card">
              <h2 className="text-card-title flex items-center gap-2 text-ink">
                <Clock className="size-4.5 text-ink-muted" aria-hidden /> Öppettider
              </h2>
              <p className="mt-2 whitespace-pre-line text-ink">{p.openingHours ?? "Ej angivet"}</p>
            </div>
            <div className="rounded-card bg-surface p-6 shadow-card">
              <h2 className="text-card-title flex items-center gap-2 text-ink">
                <Mail className="size-4.5 text-ink-muted" aria-hidden /> Kontakt
              </h2>
              <ul className="mt-2 space-y-1.5">
                <li>
                  <a href={`mailto:${p.email}`} className="break-all text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                    {p.email}
                  </a>
                </li>
                {p.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="size-4 text-ink-muted" aria-hidden />
                    <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                      {p.phone}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </section>
        </div>

        {/* Bokningskort – sticky på desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-card bg-surface p-6 shadow-lift ring-1 ring-line/60">
            {price !== null && (
              <p className="text-ink-muted">
                från{" "}
                <span className="font-display text-[1.75rem] font-extrabold tracking-[-0.02em] text-ink">
                  {formatPrice(price)}
                </span>
              </p>
            )}
            <p className="text-meta mt-1">
              {p.services.length} {p.services.length === 1 ? "tjänst" : "tjänster"} · {p.area}
            </p>
            {booking ? (
              <>
                <BookingButton
                  slug={p.slug}
                  href={booking.href}
                  external={booking.external}
                  label={`Boka hos ${p.name}`}
                  className="mt-5 w-full"
                />
                <p className="text-meta mt-3 text-center">{disclaimer}</p>
              </>
            ) : (
              <p className="text-meta mt-5">Bokningslänken saknas just nu. Kontakta utövaren direkt.</p>
            )}
          </div>
        </aside>
      </div>

      {/* Sticky bokningsfält längst ner på mobil */}
      {booking && (
        <div className="sticky bottom-0 z-40 -mx-5 mt-12 border-t border-line bg-canvas/90 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:-mx-8 sm:px-8 lg:hidden">
          <div className="flex items-center gap-4">
            <div className="min-w-0 shrink-0">
              {price !== null && (
                <p className="text-sm text-ink-muted">
                  från <span className="font-display text-lg font-extrabold text-ink">{formatPrice(price)}</span>
                </p>
              )}
              <p className="text-xs text-ink-muted">Bokas hos utövaren</p>
            </div>
            <BookingButton
              slug={p.slug}
              href={booking.href}
              external={booking.external}
              label="Boka tid"
              className="h-12 flex-1"
            />
          </div>
          <p className="sr-only">{disclaimer}</p>
        </div>
      )}
    </article>
  );
}

function Gallery({ practitioner: p }: { practitioner: Practitioner }) {
  const [first, ...rest] = p.images;
  return (
    <div>
      <div
        className={`relative overflow-hidden rounded-card shadow-card ${
          first ? "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]" : "aspect-[16/10] sm:aspect-auto sm:h-72 lg:h-80"
        }`}
      >
        <PractitionerCover category={p.category} imagePath={first?.path} alt={p.name} size="lg" />
        {p.isTestData && <TestDataBadge className="absolute top-4 right-4" />}
      </div>
      {rest.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {rest.slice(0, 4).map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- uppladdade bilder optimeras senare
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

function Video({ url, name }: { url: string | null; name: string }) {
  const embed = url ? toVideoEmbedUrl(url) : null;
  return (
    <section className="mt-12">
      <h2 className="text-heading text-ink">Video</h2>
      {embed ? (
        <iframe
          src={embed}
          title={`Video från ${name}`}
          className="mt-4 aspect-video w-full rounded-card shadow-card"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 font-semibold text-accent hover:text-accent-hover"
        >
          <PlayCircle className="size-5" aria-hidden /> Se video från {name}
        </a>
      ) : (
        <div className="mt-4 flex items-center gap-4 rounded-card border border-dashed border-line-strong px-6 py-6 text-ink-muted">
          <PlayCircle className="size-9 shrink-0" strokeWidth={1.5} aria-hidden />
          <div>
            <p className="font-medium text-ink">Video kommer snart</p>
            <p className="text-meta">Här visar {name} upp sin verksamhet.</p>
          </div>
        </div>
      )}
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mt-4" aria-busy="true" aria-label="Hämtar profil">
      <div className="aspect-[16/10] animate-pulse rounded-card bg-sunken sm:aspect-auto sm:h-72 lg:h-80" />
      <div className="mt-8 space-y-3">
        <div className="h-6 w-28 animate-pulse rounded-full bg-sunken" />
        <div className="h-10 w-2/3 animate-pulse rounded-full bg-sunken" />
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-sunken" />
      </div>
    </div>
  );
}

/** Svensk genitiv: "Saxen & Spegeln" -> "Saxen & Spegelns", "Glöd Hus" -> "Glöd Hus". */
function genitive(name: string): string {
  return /[sxz]$/i.test(name.trim()) ? name.trim() : `${name.trim()}s`;
}
