import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const headingFont = Cormorant_Garamond({
  subsets: ["latin-ext"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
  display: "swap",
});

const bodyFont = Manrope({
  subsets: ["latin-ext"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eloviz.hu"),
  applicationName: "Élő Víz",
  title: { default: "Élő Víz – Bibliatanulmányok magyarul", template: "%s | Élő Víz" },
  description: "Magyar nyelvű bibliatanulmányok és gondosan válogatott videók, témák szerint rendezve.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "hu_HU",
    siteName: "Élő Víz",
    images: [{ url: "/living-water-hero.png", width: 1536, height: 1024, alt: "Tiszta forrásvíz mészkőlépcsők mellett" }],
  },
  twitter: { card: "summary_large_image", images: ["/living-water-hero.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
