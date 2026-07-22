import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Morzsanavigáció">
      <ol className="breadcrumbs">
        {items.map((item) => <li key={item.label}>{item.href ? <Link href={item.href}>{item.label}</Link> : item.label}</li>)}
      </ol>
    </nav>
  );
}

export function breadcrumbJsonLd(items: Required<BreadcrumbItem>[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, item: `https://eloviz.hu${item.href}` })),
  };
}
