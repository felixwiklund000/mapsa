import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mapsa – hitta lokala utövare i Blekinge",
  description:
    "Hitta och jämför massörer, PT:er, frisörer, kiropraktorer, naprapater och skönhet i Blekinge. Du bokar direkt hos utövaren.",
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
  // för notch och hemknapp läggs på där det behövs.
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sv" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
