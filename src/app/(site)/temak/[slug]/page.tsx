import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { StudyRows, VideoRows } from "@/components/resource-lists";
import { getTopicBySlug } from "@/lib/content-repository";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const topic = await getTopicBySlug(slug); return topic ? { title: topic.seoTitle || topic.title, description: topic.seoDescription || topic.description, alternates: { canonical: `/temak/${slug}` } } : {}; }

export default async function TopicPage({ params }: Props) {
  const { slug } = await params; const topic = await getTopicBySlug(slug); if (!topic) notFound();
  const crumbs = [{ label: "Kezdőlap", href: "/" }, { label: "Témák", href: "/temak" }, { label: topic.title, href: `/temak/${topic.slug}` }];
  return <div className="page-shell"><JsonLd data={breadcrumbJsonLd(crumbs)} /><JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: topic.title, description: topic.description, url: `https://eloviz.hu/temak/${topic.slug}`, inLanguage: "hu" }} /><Breadcrumbs items={[...crumbs.slice(0, -1), { label: topic.title }]} /><header className="page-intro"><p className="eyebrow">Bibliai téma</p><h1>{topic.title}</h1><p className="lead">{topic.description}</p></header><section><div className="section-heading"><div><p className="eyebrow">Olvasnivaló</p><h2>Tanulmányok</h2></div><p>{topic.studyCount ?? topic.studies.length} közzétett anyag ebben a témában.</p></div><StudyRows studies={topic.studies} /></section><section className="section"><div className="section-heading"><div><p className="eyebrow">Kiegészítés</p><h2>Videók</h2></div><p>Kapcsolódó előadások és magyarázatok.</p></div><VideoRows videos={topic.videos} /></section></div>;
}
