import type { Metadata } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

// Bodoni carries the display voice — high-contrast, playbill, unmistakably
// theatrical. Jost is the Futura-lineage geometric that deco signage was set
// in; it does every label, button and paragraph.
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Broadway Opticals — Luxury Eyewear, Seen Clearly",
    template: "%s · Broadway Opticals",
  },
  description:
    "Designer sunglasses, eyeglasses and contact lenses from the world's finest houses. Expert eye care and precision lens craft since 1974.",
  keywords: ["eyewear", "sunglasses", "eyeglasses", "optical", "frames", "contact lenses", "India"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bodoni.variable} ${jost.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
