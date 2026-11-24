import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Clock, Mail, MapPin, Phone, Tag } from "lucide-react";
import { Photo } from "@/components/photo";
import { formatPrice, lowestPrice } from "@/components/practitioner-row";
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
      {/* Mobil: ingen header (bakåtknappen ligger överst). Desktop: header med logga. */}
      <SiteHeader className="hidden lg:block" />
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile params={props.params} />
      </Suspense>
    </main>
  );
}

// En kolumn, i den ordning man behöver: namn, kategori · område, pris och
// Boka högst upp – sedan tjänster, adress, öppettider och resten. Boka ligger
// i flödet (inte fast längst ner), så att den aldrig hamnar där kortets
// "Mer info" låg i vyn innan, och tar inte emot tryck de första 600 ms (tap-guard).
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
  const price = lowestPrice(p);
  const image = p.images[0]?.path;

  return (
    <article className={`${CONTAINER} pb-16`}>
      <BackLink />

      {/* Bild bara om den finns – ingen tom yta annars. */}
      {image && <Photo src={image} alt={p.name} category={p.category} eager className="mt-2 aspect-video w-full rounded-xl" />}

      <h1 className={`text-2xl font-bold lg:text-4xl ${image ? "mt-5" : "mt-3"}`}>{p.name}</h1>
      <p className="mt-1 text-muted">
        {category?.name} · {p.area}
      </p>
      {price !== null && <p className="mt-3 text-lg font-semibold">fr. {formatPrice(price)}</p>}

      {booking ? (
        <div className="mt-5">
          <BookingButton
            slug={p.slug}
            href={booking.href}
            external={booking.external}
            label="Boka"
            className="tap-guard w-full sm:inline-flex sm:w-auto sm:min-w-64 sm:px-10"
          />
          <p className="mt-2 text-sm text-muted">{note}</p>
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted">Bokningslänk saknas. Kontakta utövaren direkt.</p>
      )}

      <section className="mt-10" aria-labelledby="tjanster">
        <h2 id="tjanster" className="text-lg font-semibold">
          Tjänster
        </h2>
        {p.services.length === 0 ? (
          <p className="mt-2 text-muted">Inga tjänster upplagda än.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
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

      <ul className="mt-8 border-t border-line pt-2">
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

      {p.description && (
        <section className="mt-8" aria-labelledby="om">
          <h2 id="om" className="text-lg font-semibold">
            Om {p.name}
          </h2>
          <p className="mt-2 max-w-[65ch] whitespace-pre-line">{p.description}</p>
        </section>
      )}

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
    </article>
  );
}

const CONTAINER = "page-container max-w-[752px] pt-[max(12px,env(safe-area-inset-top))] lg:pt-6";

function BackLink() {
  return (
    <Link href="/" aria-label="Alla utövare" className="pressable -ml-1.5 flex size-11 items-center justify-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-fill text-ink">
        <ArrowLeft className="size-5" strokeWidth={2} aria-hidden />
      </span>
    </Link>
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

// Skelett utan bildruta: bakåtknapp, namn, kategori, pris och knappen.
function ProfileSkeleton() {
  return (
    <div className={CONTAINER} aria-busy="true" aria-label="Hämtar profil">
      <div className="size-11" />
      <div className="mt-3 h-8 w-2/3 animate-pulse rounded-lg bg-fill" />
      <div className="mt-2 h-4 w-1/3 animate-pulse rounded-lg bg-fill" />
      <div className="mt-4 h-5 w-24 animate-pulse rounded-lg bg-fill" />
      <div className="mt-5 h-12 w-full animate-pulse rounded-full bg-fill sm:w-64" />
    </div>
  );
}

/** Svensk genitiv: "Saxen & Spegeln" -> "Saxen & Spegelns", "Glöd Hus" -> "Glöd Hus". */
function genitive(name: string): string {
  return /[sxz]$/i.test(name.trim()) ? name.trim() : `${name.trim()}s`;
}
