// Bild för en utövare. Saknas bild visas en grå yta med initialen.

export function PractitionerCover({
  name,
  imagePath,
  size = "sm",
  className = "",
}: {
  name: string;
  imagePath?: string | null;
  size?: "sm" | "lg";
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
      className={`flex h-full w-full items-center justify-center bg-fill ${className}`}
    >
      <span
        aria-hidden
        className={`font-extrabold tracking-[-0.04em] text-faint ${size === "lg" ? "text-6xl" : "text-xl"}`}
      >
        {name.trim().charAt(0).toLocaleUpperCase("sv-SE")}
      </span>
    </div>
  );
}
