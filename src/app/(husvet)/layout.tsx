import type { Metadata } from "next";
import { husvetSite } from "./_content/husvet-site";

export const metadata: Metadata = {
  title: {
    default: husvetSite.seo.title,
    template: `%s | ${husvetSite.brand}`,
  },
  description: husvetSite.seo.description,
  alternates: {
    canonical: `https://${husvetSite.domain}`,
  },
  openGraph: {
    title: husvetSite.seo.title,
    description: husvetSite.seo.description,
    locale: "hu_HU",
    siteName: husvetSite.brand,
    type: "website",
    url: `https://${husvetSite.domain}`,
  },
};

export default function HusvetLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
