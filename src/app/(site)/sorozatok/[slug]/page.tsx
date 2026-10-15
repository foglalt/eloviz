import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { getPublicSeries } from "@/lib/study-series-repository";
import { absoluteSiteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const series = await getPublicSeries((await params).slug);
  return series ? {
    title: series.title, description: series.description,
    alternates: { canonical: `/sorozatok/${series.slug}` },
    openGraph: { title: series.title, description: series.description, type: "website" },
  } : {};
}

export default async function SeriesDetailPage({ params }: Props) {
  const series = await getPublicSeries((await params).slug);
  if (!series) notFound();
  const crumbs = [{ label: "Kezdőlap", href: "/" }, { label: "Tanulmányok", href: "/tanulmanyok" }, { label: "Sorozatok", href: "/sorozatok" }, { label: series.title, href: `/sorozatok/${series.slug}` }];
  return (
    <div className="page-shell series-detail">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "CreativeWorkSeries", "@id": absoluteSiteUrl(`/sorozatok/${series.slug}`),
        name: series.title, description: series.description, inLanguage: "hu", url: absoluteSiteUrl(`/sorozatok/${series.slug}`),
        ...(series.author ? { author: { "@type": "Person", name: series.author } } : {}),
        hasPart: series.parts.map((part) => ({ "@type": "Article", name: part.title, url: absoluteSiteUrl(`/tanulmanyok/${part.slug}`) })),
      }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: series.parts.map((part, index) => ({ "@type": "ListItem", position: index + 1, name: `${part.position}. ${part.title}`, url: absoluteSiteUrl(`/tanulmanyok/${part.slug}`) })) }} />
      <Breadcrumbs items={[...crumbs.slice(0, -1), { label: series.title }]} />
      <header className="page-intro"><p className="eyebrow">Tanulmánysorozat</p><h1>{series.title}</h1>
        <p className="meta-line">{series.parts.length} olvasható rész{series.author ? ` · Szerző: ${series.author}` : ""}</p>
      </header>
      <div className="series-detail__layout">
      <section className="series-detail__contents" aria-labelledby="series-contents-title"><h2 id="series-contents-title">Tartalomjegyzék</h2>
        {series.parts.length ? <ol className="series-chapter-list">{series.parts.map((part) => <li key={part.id}><Link href={`/tanulmanyok/${part.slug}`}>
          <span className="series-part-number">{String(part.position).padStart(2, "0")}</span><span><h3>{part.title}</h3><span className="preview-description">{part.summary}</span></span><span aria-hidden="true">→</span>
        </Link></li>)}</ol> : <p className="empty-state">A sorozat részei előkészítés alatt állnak.</p>}
      </section>
      <div className="series-detail__introduction"><p className="lead">{series.description}</p>
        <div className="series-detail__actions">
        {series.parts.length ? <Link className="button" href={`/tanulmanyok/${series.parts[0].slug}`}>Olvasás elkezdése →</Link> : null}
        {series.sourceUrl ? <a className="text-link" href={series.sourceUrl} target="_blank" rel="noopener noreferrer">Eredeti forrás</a> : null}
        </div>
      </div>
      </div>
    </div>
  );
}
