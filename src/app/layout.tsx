import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
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
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sv" className={`${archivo.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
