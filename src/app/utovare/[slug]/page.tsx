import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Clock, Mail, MapPin, Phone, Tag } from "lucide-react";
import { Photo } from "@/components/photo";
import { formatPrice } from "@/components/practitioner-row";
import { SiteHeader } from "@/components/site-header";
import { kommunFor } from "@/lib/areas";
import { getCategory } from "@/lib/categories";
import { getPublishedPractitionerBySlug } from "@/lib/db/practitioners";
import { isExternalUrl, isValidBookingUrl, toVideoEmbedUrl } from "@/lib/urls";
import { BookingButton } from "@/components/booking-button";

export async function generateMetadata(props: PageProps<"/utovare/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getPublishedPractitionerBySlug(slug);
  if (!p) return { title: "Utövaren hittades inte | Mapsa", robots: { index: false } };
  const category = getCategory(p.category);
  return {
    title: `${p.name} – ${category?.name ?? ""} i ${p.area} | Mapsa`,
    description:
      p.description?.slice(0, 155) ??
      `${p.name} i ${p.area}, ${kommunFor(p.area)}. Se tjänster, priser och boka direkt hos utövaren.`,
    robots: p.isTestData ? { index: false } : undefined,
  };
}

export default function PractitionerPage(props: PageProps<"/utovare/[slug]">) {
  return (
    <main className="flex-1">
      {/* Mobil: ingen header – bilden går ända upp. Desktop: header med logga. */}
      <SiteHeader className="hidden lg:block" />
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
  const booking = isValidBookingUrl(p.bookingUrl)
    ? { href: p.bookingUrl, external: isExternalUrl(p.bookingUrl) }
    : null;
  const note = `Mapsa bokar inte åt dig. Du går vidare till ${genitive(p.name)} egen bokning.`;
  const videoUrl = p.level === "vip" ? p.videoUrl : null;

  return (
    <article className="lg:page-container lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16 lg:pt-8">
      <div className="min-w-0">
        {/* Bild överst: 4:3 kant i kant på mobil, 16:9 med 8 px radie på desktop */}
        <div className="relative">
          <Photo
            src={p.images[0]?.path}
            alt={p.name}
            eager
            className="aspect-[4/3] w-full lg:aspect-video lg:rounded-lg"
          />
          <Link
            href="/"
            aria-label="Alla utövare"
            className="pressable absolute top-[max(12px,env(safe-area-inset-top))] left-3 flex size-11 items-center justify-center lg:top-2 lg:left-2"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-canvas text-ink">
              <ArrowLeft className="size-5" strokeWidth={2} aria-hidden />
            </span>
          </Link>
        </div>

        <div className="px-4 pt-6 lg:px-0 lg:pt-8">
          <h1 className="text-2xl font-bold lg:text-4xl">{p.name}</h1>
          <p className="mt-1 text-muted">
            {category?.name} · {p.area}
          </p>

          {p.description && <p className="mt-4 max-w-[65ch] whitespace-pre-line">{p.description}</p>}

          <ul className="mt-6">
            <InfoRow icon={<MapPin className="size-5" aria-hidden />} label="Adress">
              {p.address ? `${p.address}, ` : `${p.area}, `}
              {kommunFor(p.area)}
            </InfoRow>
            {p.openingHours && (
              <InfoRow icon={<Clock className="size-5" aria-hidden />} label="Öppettider">
                {p.openingHours}
              </InfoRow>
            )}
            {p.phone && (
              <InfoRow icon={<Phone className="size-5" aria-hidden />} label="Telefon">
                <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="underline-offset-4 hover:underline">
                  {p.phone}
                </a>
              </InfoRow>
            )}
            {p.email && (
              <InfoRow icon={<Mail className="size-5" aria-hidden />} label="E-post">
                <a href={`mailto:${p.email}`} className="underline-offset-4 hover:underline">
                  {p.email}
                </a>
              </InfoRow>
            )}
            {p.campaign && p.level !== "grundlistning" && (
              <InfoRow icon={<Tag className="size-5" aria-hidden />} label="Erbjudande">
                {p.campaign}
              </InfoRow>
            )}
          </ul>

          <section className="mt-8" aria-labelledby="tjanster">
            <h2 id="tjanster" className="text-lg font-semibold">
              Tjänster
            </h2>
            {p.services.length === 0 ? (
              <p className="mt-2 text-muted">Inga tjänster upplagda än.</p>
            ) : (
              <ul className="mt-2">
                {p.services.map((s) => (
                  <li key={s.id} className="flex min-h-16 items-center justify-between gap-4 py-2">
                    <div className="min-w-0">
                      <p className="font-semibold">{s.name}</p>
                      {s.durationMin && <p className="text-sm text-muted">{s.durationMin} min</p>}
                    </div>
                    <p className="shrink-0 font-semibold">{formatPrice(s.priceSek)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {videoUrl && (
            <section className="mt-8" aria-labelledby="video">
              <h2 id="video" className="text-lg font-semibold">
                Video
              </h2>
              {toVideoEmbedUrl(videoUrl) ? (
                <iframe
                  src={toVideoEmbedUrl(videoUrl)!}
                  title={`Video från ${p.name}`}
                  className="mt-4 aspect-video w-full rounded-lg"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block underline">
                  Se video från {p.name}
                </a>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Boka, desktop: kolumn till höger, ingen ruta */}
      <aside className="hidden lg:block">
        <div className="sticky top-8">
          {booking ? (
            <>
              <BookingButton slug={p.slug} href={booking.href} external={booking.external} label="Boka" className="w-full" />
              <p className="mt-4 text-sm text-muted">{note}</p>
            </>
          ) : (
            <p className="text-sm text-muted">Bokningslänk saknas. Kontakta utövaren direkt.</p>
          )}
        </div>
      </aside>

      {/* Boka, mobil: fast längst ner */}
      {booking && (
        <div className="sticky bottom-0 z-40 mt-8 border-t border-line bg-canvas px-4 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] lg:hidden">
          <BookingButton slug={p.slug} href={booking.href} external={booking.external} label="Boka" className="w-full" />
          <p className="mt-2 text-center text-xs text-muted">Du går vidare till utövarens egen bokning.</p>
        </div>
      )}
    </article>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <li className="flex min-h-14 items-center gap-4 py-2">
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0 break-words">
        <span className="sr-only">{label}: </span>
        {children}
      </div>
    </li>
  );
}

function ProfileSkeleton() {
  return (
    <div className="lg:page-container lg:pt-8" aria-busy="true" aria-label="Hämtar profil">
      <div className="aspect-[4/3] animate-pulse bg-fill lg:aspect-video lg:max-w-[calc(100%-384px)] lg:rounded-lg" />
      <div className="px-4 pt-6 lg:px-0">
        <div className="h-8 w-2/3 animate-pulse rounded-lg bg-fill" />
        <div className="mt-2 h-4 w-1/3 animate-pulse rounded-lg bg-fill" />
      </div>
    </div>
  );
}

/** Svensk genitiv: "Saxen & Spegeln" -> "Saxen & Spegelns", "Glöd Hus" -> "Glöd Hus". */
function genitive(name: string): string {
  return /[sxz]$/i.test(name.trim()) ? name.trim() : `${name.trim()}s`;
}
