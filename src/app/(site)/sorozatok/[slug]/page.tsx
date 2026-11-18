import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { getPublicSeries } from "@/lib/study-series-repository";
import { absoluteSiteUrl } from "@/lib/site-config";
import { seriesCountLabel, seriesPartGroups, seriesPartLabel } from '@/lib/study-series-core';
import { SeriesChapterList } from '@/components/series-chapter-list';

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
  const { lessons, supplements } = seriesPartGroups(series.parts);
  const groups = [{ label: 'Leckék', parts: lessons }, { label: 'Mellékletek', parts: supplements }].filter((group) => group.parts.length);
  const crumbs = [{ label: "Kezdőlap", href: "/" }, { label: "Tanulmányok", href: "/tanulmanyok" }, { label: "Sorozatok", href: "/sorozatok" }, { label: series.title, href: `/sorozatok/${series.slug}` }];
  return (
    <div className="page-shell series-detail">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "CreativeWorkSeries", "@id": absoluteSiteUrl(`/sorozatok/${series.slug}`),
        name: series.title, description: series.description, inLanguage: "hu", url: absoluteSiteUrl(`/sorozatok/${series.slug}`),
        ...(series.author ? { author: { "@type": "Person", name: series.author } } : {}),
        hasPart: series.parts.map((part) => ({ "@type": "Article", name: `${seriesPartLabel(part)} – ${part.title}`, url: absoluteSiteUrl(`/tanulmanyok/${part.slug}`) })),
      }} />
      {groups.map(({ label, parts }) => <JsonLd key={label} data={{ "@context": "https://schema.org", "@type": "ItemList", name: label, itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: parts.map((part, index) => ({ "@type": "ListItem", position: index + 1, name: `${seriesPartLabel(part)} – ${part.title}`, url: absoluteSiteUrl(`/tanulmanyok/${part.slug}`) })) }} />)}
      <Breadcrumbs items={[...crumbs.slice(0, -1), { label: series.title }]} />
      <header className="page-intro"><p className="eyebrow">Tanulmánysorozat</p><h1>{series.title}</h1>
        <p className="meta-line">{seriesCountLabel(series.parts)}{series.author ? ` · Szerző: ${series.author}` : ""}</p>
      </header>
      <div className="series-detail__layout">
      <div className="series-detail__contents">
        {groups.length ? groups.map(({ label, parts }) => <section key={label} aria-label={label}>
          <h2>{label}</h2><SeriesChapterList parts={parts} />
        </section>) : <p className="empty-state">A sorozat anyagai előkészítés alatt állnak.</p>}
      </div>
      <div className="series-detail__introduction"><p className="lead">{series.description}</p>
        <div className="series-detail__actions">
        {lessons.length ? <Link className="button" href={`/tanulmanyok/${lessons[0].slug}`}>Olvasás elkezdése →</Link> : null}
        {series.sourceUrl ? <a className="text-link" href={series.sourceUrl} target="_blank" rel="noopener noreferrer">Eredeti forrás</a> : null}
        </div>
      </div>
      </div>
    </div>
  );
}
