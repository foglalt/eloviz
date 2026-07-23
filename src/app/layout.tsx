import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const siteFont = Nunito({
  subsets: ["latin-ext"],
  variable: "--font-site",
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="hu" className={siteFont.variable} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
