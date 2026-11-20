import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mapsa – hitta lokala utövare i Karlskrona",
  description:
    "Hitta och jämför massörer, PT:er, frisörer, kiropraktorer, naprapater och skönhet i Karlskrona. Du bokar direkt hos utövaren.",
  applicationName: "Mapsa",
  // iPhone: "Lägg till på hemskärmen" öppnar Mapsa som en egen app.
  appleWebApp: {
    capable: true,
    title: "Mapsa",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  // Låter sidan gå ut till skärmkanten på telefoner med notch; marginaler
  // för notch och hemknapp läggs på i header och bokningsfält.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sv" className={`${archivo.variable} ${plex.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
