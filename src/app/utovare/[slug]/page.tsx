import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Clock, Mail, MapPin, Phone, Tag } from "lucide-react";
import { CategoryDot } from "@/components/category-dot";
import { PractitionerMap } from "@/components/practitioner-map";
import { formatPrice, lowestPrice } from "@/components/practitioner-row";
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
    <main className="flex-1">
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
    <article>
      <div className="lg:page-container lg:pt-6">
        <Cover practitioner={p} />
      </div>

      <div className="page-container pt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16 lg:pt-10">
        <div className="min-w-0">
          <header>
            <h1 className="text-display">{p.name}</h1>
            <p className="mt-2 flex items-center gap-2 text-muted">
              <CategoryDot slug={p.category} />
              {category?.name} · {p.area}
            </p>
            {p.isTestData && <p className="text-small mt-1 text-faint">Testdata – påhittad exempelprofil.</p>}
          </header>

          {p.description && <p className="mt-5 max-w-prose text-[1.0625rem] whitespace-pre-line">{p.description}</p>}

          <ul className="mt-8 border-t border-line">
            <InfoRow icon={<MapPin className="size-5" aria-hidden />} label="Adress">
              {p.address ? `${p.address}, ` : ""}
              {p.area}, Karlskrona
            </InfoRow>
            {p.openingHours && (
              <InfoRow icon={<Clock className="size-5" aria-hidden />} label="Öppettider">
                {p.openingHours}
              </InfoRow>
            )}
            {p.phone && (
              <InfoRow icon={<Phone className="size-5" aria-hidden />} label="Telefon">
                <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="underline-offset-2 hover:underline">
                  {p.phone}
                </a>
              </InfoRow>
            )}
            <InfoRow icon={<Mail className="size-5" aria-hidden />} label="E-post">
              <a href={`mailto:${p.email}`} className="break-all underline-offset-2 hover:underline">
                {p.email}
              </a>
            </InfoRow>
            {p.campaign && p.level !== "grundlistning" && (
              <InfoRow icon={<Tag className="size-5" aria-hidden />} label="Erbjudande">
                {p.campaign}
              </InfoRow>
            )}
          </ul>

          <section className="mt-10" aria-labelledby="tjanster">
            <h2 id="tjanster" className="text-heading">
              Tjänster
            </h2>
            {p.services.length === 0 ? (
              <p className="mt-3 text-muted">Inga tjänster upplagda än.</p>
            ) : (
              <ul className="mt-2">
                {p.services.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-6 border-b border-line py-4 last:border-b-0">
                    <div className="min-w-0">
                      <p className="font-semibold">{s.name}</p>
                      {s.durationMin && <p className="text-small text-muted">{s.durationMin} min</p>}
                    </div>
                    <p className="shrink-0 font-bold tabular-nums">{formatPrice(s.priceSek)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {videoUrl && <Video url={videoUrl} name={p.name} />}
        </div>

        {/* Bokning, desktop: panel till höger */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 rounded-media border border-line p-6">
            {price !== null && (
              <p className="text-heading">
                <span className="text-base font-normal text-muted">från </span>
                {formatPrice(price)}
              </p>
            )}
            {booking ? (
              <>
                <BookingButton
                  slug={p.slug}
                  href={booking.href}
                  external={booking.external}
                  label="Boka"
                  className="mt-4 w-full"
                />
                <p className="text-small mt-3 text-muted">{note}</p>
              </>
            ) : (
              <p className="text-small mt-3 text-muted">Bokningslänk saknas. Kontakta utövaren direkt.</p>
            )}
          </div>
        </aside>
      </div>

      {/* Bokning, mobil: fast längst ner */}
      {booking && (
        <div className="sticky bottom-0 z-[1001] mt-10 border-t border-line bg-canvas px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
          <BookingButton slug={p.slug} href={booking.href} external={booking.external} label="Boka" className="w-full" />
          <p className="mt-2 text-center text-xs text-muted">Du går vidare till utövarens egen bokning.</p>
        </div>
      )}
    </article>
  );
}

// Stor bild överst. Saknas foto visas platsen på en karta i stället.
function Cover({ practitioner: p }: { practitioner: Practitioner }) {
  const first = p.images[0];
  return (
    <div className="relative isolate h-60 overflow-hidden bg-fill sm:h-80 lg:h-96 lg:rounded-media">
      {first ? (
        // eslint-disable-next-line @next/next/no-img-element -- uppladdade bilder optimeras senare
        <img src={first.path} alt={p.name} className="h-full w-full object-cover" />
      ) : (
        <PractitionerMap
          variant="location"
          label={`Karta: ${p.name} i ${p.area}`}
          points={[{ slug: p.slug, name: p.name, area: p.area, categoryName: "", priceFrom: null, lat: p.lat, lng: p.lng }]}
        />
      )}
      <Link
        href="/"
        aria-label="Alla utövare"
        className="absolute top-3 left-3 z-[1000] flex size-11 items-center justify-center rounded-full bg-canvas text-ink transition-colors hover:bg-fill lg:top-4 lg:left-4"
      >
        <ArrowLeft className="size-5" strokeWidth={2.25} aria-hidden />
      </Link>
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4 border-b border-line py-4">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="sr-only">{label}</p>
        <div className="whitespace-pre-line">{children}</div>
      </div>
    </li>
  );
}

function Video({ url, name }: { url: string; name: string }) {
  const embed = toVideoEmbedUrl(url);
  return (
    <section className="mt-10" aria-labelledby="video">
      <h2 id="video" className="text-heading">
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
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block underline">
          Se video från {name}
        </a>
      )}
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Hämtar profil">
      <div className="lg:page-container lg:pt-6">
        <div className="h-60 animate-pulse bg-fill sm:h-80 lg:h-96 lg:rounded-media" />
      </div>
      <div className="page-container pt-6">
        <div className="h-9 w-2/3 animate-pulse rounded bg-fill" />
        <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-fill" />
      </div>
    </div>
  );
}

/** Svensk genitiv: "Saxen & Spegeln" -> "Saxen & Spegelns", "Glöd Hus" -> "Glöd Hus". */
function genitive(name: string): string {
  return /[sxz]$/i.test(name.trim()) ? name.trim() : `${name.trim()}s`;
}
