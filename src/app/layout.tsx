import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { SITE_URL } from "@/lib/site-config";
import "./globals.css";

const siteFont = Nunito({
  subsets: ["latin-ext"],
  variable: "--font-site",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Élő Víz",
  title: { default: "Élő Víz – Bibliatanulmányok magyarul", template: "%s | Élő Víz" },
  description: "Magyar nyelvű bibliatanulmányok és gondosan válogatott videók, témák szerint rendezve.",
  icons: {
    icon: [
      { url: "/brand/living-water-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.svg?v=living-water-3-angels", type: "image/svg+xml", sizes: "any" },
    ],
    apple: { url: "/brand/living-water-180.png", sizes: "180x180", type: "image/png" },
  },
  openGraph: {
    type: "website",
    locale: "hu_HU",
    siteName: "Élő Víz",
    images: [{ url: "/river-of-life-hero.webp", width: 1717, height: 916, alt: "A kristálytiszta élet folyója a tróntól, zöld mezők és az élet fája között" }],
  },
  twitter: { card: "summary_large_image", images: ["/river-of-life-hero.webp"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu" className={siteFont.variable} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
