// inline: utan egen sidbredd/marginal (sist i listan på startsidan).
export function SiteFooter({ inline = false }: { inline?: boolean }) {
  return (
    <footer className={inline ? "mt-8 border-t border-line" : "mt-24 border-t border-line"}>
      <div
        className={`text-small flex flex-col gap-1 py-6 text-muted ${inline ? "" : "page-container sm:flex-row sm:justify-between"}`}
      >
        <p>Mapsa bokar inte åt dig. Vi länkar vidare till utövarens egen bokning.</p>
        <p>UF-företag i Karlskrona</p>
      </div>
    </footer>
  );
}
