// Bild för en utövare. Saknas bild visas en lugn grå yta med initialen,
// så att korten i rutnätet håller samma form.

export function PractitionerCover({
  name,
  imagePath,
  className = "",
}: {
  name: string;
  imagePath?: string | null;
  className?: string;
}) {
  if (imagePath) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- uppladdade bilder optimeras senare
      <img src={imagePath} alt={name} className={`h-full w-full object-cover ${className}`} />
    );
  }
  return (
    <div
      role="img"
      aria-label={`${name}, ingen bild`}
      className={`flex h-full w-full items-center justify-center bg-subtle ${className}`}
    >
      <span aria-hidden className="font-display text-3xl font-semibold tracking-[-0.02em] text-faint/70">
        {name.trim().charAt(0).toLocaleUpperCase("sv-SE")}
      </span>
    </div>
  );
}
