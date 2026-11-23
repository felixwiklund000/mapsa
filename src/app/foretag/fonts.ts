// Typsnitt för företagssidorna (/foretag, /foretag/tack, /integritet).
import { Geist_Mono, Instrument_Serif } from "next/font/google";

export const serif = Instrument_Serif({ weight: "400", subsets: ["latin"], variable: "--font-instrument-serif", display: "swap" });
export const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
export const brandFonts = `${serif.variable} ${mono.variable}`;
