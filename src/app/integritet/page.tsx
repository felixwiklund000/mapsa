import type { Metadata } from "next";
import { Logo } from "@/components/site-header";
import { brandFonts } from "../foretag/fonts";

// UTKAST – skrivet utifrån vad Mapsa faktiskt sparar. Ska granskas och
// godkännas av Mapsa UF innan rubriken "Utkast" tas bort.
// TODO(Mapsa UF): fyll i kontaktmejl (KONTAKT nedan).

const KONTAKT = "[kontaktmejl – fylls i av Mapsa UF]";

export const metadata: Metadata = {
  title: "Integritetspolicy – Mapsa",
  description: "Vilka uppgifter Mapsa sparar, varför, var och hur du tar bort dem.",
};

export default function IntegritetPage() {
  return (
    <div className={`${brandFonts} min-h-dvh bg-sand text-panel`}>
      <header className="mx-auto flex h-16 w-full max-w-[1440px] items-center px-4 pt-[env(safe-area-inset-top)] sm:px-8">
        <Logo />
      </header>
      <main className="mx-auto max-w-2xl px-5 pt-8 pb-24 sm:pt-16">
        <p className="inline-flex rounded-full bg-flame/15 px-3 py-1.5 text-sm font-semibold text-flame">
          Utkast – granskas av Mapsa UF
        </p>
        <h1 className="mt-6 font-serif text-headline">Integritetspolicy</h1>
        <div className="mt-10 space-y-8 text-base leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_p]:mt-2 [&_p]:text-stone [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:text-stone">
          <section>
            <h2>Vem är vi?</h2>
            <p>Mapsa drivs av Mapsa UF, ett UF-företag i Karlskrona. Vi ansvarar för uppgifterna som beskrivs här.</p>
          </section>
          <section>
            <h2>Vad sparar vi när du lägger upp ditt företag?</h2>
            <ul>
              <li>Företagsnamn, kategori och adress (med plats på kartan)</li>
              <li>Din billigaste tjänst och dess pris</li>
              <li>Länk till din bokning, eller telefonnummer</li>
              <li>Ditt namn, din mejladress och ditt telefonnummer (valfritt)</li>
              <li>Vilken länk du kom ifrån, t.ex. en QR-kod (om det finns)</li>
              <li>När du godkände den här policyn</li>
            </ul>
          </section>
          <section>
            <h2>Varför?</h2>
            <p>
              För att granska din anmälan, kontakta dig och visa ditt företag på kartan. Det som syns för kunderna är företagets
              namn, kategori, adress, pris och bokningslänk – aldrig ditt namn, din mejl eller ditt telefonnummer, om du inte
              själv vill det.
            </p>
          </section>
          <section>
            <h2>Var sparas uppgifterna?</h2>
            <p>
              I vår databas hos Supabase (servrar i London, Storbritannien) och på sajtens server hos Vercel. Vi säljer eller
              delar aldrig uppgifterna med någon annan.
            </p>
          </section>
          <section>
            <h2>Hur länge?</h2>
            <p>Så länge ditt företag finns på Mapsa. Blir du inte godkänd, eller tar bort din profil, raderar vi uppgifterna.</p>
          </section>
          <section>
            <h2>Ändra eller ta bort</h2>
            <p>
              Du kan när som helst be oss visa, ändra eller ta bort dina uppgifter. Mejla oss på {KONTAKT}, så gör vi det så fort
              vi kan.
            </p>
          </section>
          <section>
            <h2>I din webbläsare</h2>
            <p>
              Medan du fyller i anmälan sparas det du skrivit i din egen webbläsare, så att inget försvinner om du lämnar sidan.
              Det skickas inte till oss förrän du trycker på Skicka in, och raderas när anmälan är skickad. Vi använder inga
              spårningscookies.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
