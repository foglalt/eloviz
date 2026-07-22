import type { Metadata } from "next";
import { Outfit, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const headingFont = Outfit({
  subsets: ["latin-ext"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
  display: "swap",
});

const bodyFont = Source_Sans_3({
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
    images: [{ url: "/river-of-life-hero.webp", width: 1717, height: 916, alt: "A kristálytiszta élet folyója a tróntól, zöld mezők és az élet fája között" }],
  },
  twitter: { card: "summary_large_image", images: ["/river-of-life-hero.webp"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu" className={`${headingFont.variable} ${bodyFont.variable}`} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
