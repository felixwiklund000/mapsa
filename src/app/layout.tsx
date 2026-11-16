import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mapsa",
  description: "Hitta och jämför lokala utövare i Karlskrona.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sv" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
