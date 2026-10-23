import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Geist_Mono } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  ),
  title: "GX1 — Walk. It stays level.",
  description:
    "GX1 is a pocket camera on a three-axis gimbal. A fictional product, built as a Next.js showcase.",
  openGraph: {
    title: "GX1 — Walk. It stays level.",
    description: "A pocket camera on a three-axis gimbal. Fictional product, real Next.js.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  colorScheme: "dark",
};

const contract = `<!--
THESIS: The page is GX1's live viewfinder and every scroll is a take. It refuses the category's floating-render-on-black launch page.
OWN-WORLD: Full-bleed daylight footage under a thin white HUD. Barlow Condensed caps for HUD and display, Geist Mono only for timecode and measurements. REC red #ff2d2d marks recording and the primary action; focus yellow #ffd400 marks whatever is in focus: brackets, selection, the level mark. Camera-menu panels in ink #0b0b0b. No glow, no gradient text.
STORY: A creator, and the reviewer behind them, watches GX1 hold the horizon while walking, then sees stabilization, low light, punch-in and captions proved on footage, reads the spec menu, configures a finish and kit, and reserves.
FIRST VIEWPORT: Walking footage edge to edge. The HUD on top carries GX1, REC with running timecode, the menu, and Configure. A level line spans the whole frame beneath the headline at every width. "Walk. It stays level." is set at up to 6rem inside yellow focus brackets, left of center. Below it sit the subline, a red shutter-style Configure GX1 button, and the from-price.
FORM: Live Viewfinder, rank 1 of 7 on my ordered list (the pick card, chosen by the user). Seed 4fc3d1c6.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-commentary="off"
      className={`${barlow.variable} ${barlowCondensed.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-svh">
        <div hidden dangerouslySetInnerHTML={{ __html: contract }} />
        {children}
      </body>
    </html>
  );
}
