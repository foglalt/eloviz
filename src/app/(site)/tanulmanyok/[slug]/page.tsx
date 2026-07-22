import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { VideoRows } from "@/components/resource-lists";
import { getStudyBySlug } from "@/lib/content-repository";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const study = await getStudyBySlug(slug); return study ? { title: study.seoTitle || study.title, description: study.seoDescription || study.summary, alternates: { canonical: `/tanulmanyok/${slug}` }, openGraph: { type: "article", title: study.seoTitle || study.title, description: study.seoDescription || study.summary } } : {}; }

export default async function StudyPage({ params }: Props) {
  const { slug } = await params; const study = await getStudyBySlug(slug); if (!study) notFound();
  const crumbs = [{ label: "Kezdőlap", href: "/" }, { label: "Tanulmányok", href: "/tanulmanyok" }, { label: study.title, href: `/tanulmanyok/${study.slug}` }];
  return <div className="page-shell"><JsonLd data={breadcrumbJsonLd(crumbs)} /><JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: study.title, description: study.summary, inLanguage: "hu", mainEntityOfPage: `https://eloviz.hu/tanulmanyok/${study.slug}`, publisher: { "@type": "Organization", name: "Élő Víz" } }} /><Breadcrumbs items={[...crumbs.slice(0, -1), { label: study.title }]} /><div className="detail-grid"><article className="detail-copy"><p className="eyebrow">PDF bibliatanulmány</p><h1>{study.title}</h1><p className="lead">{study.summary}</p><div className="document-action"><p>A teljes tanulmány külön PDF-dokumentumban olvasható és letölthető.</p><a className="button" href={study.pdfUrl} target="_blank" rel="noopener">PDF megnyitása</a></div>{study.references.length ? <><h2>Kapcsolódó igeszakaszok</h2><ul className="reference-list">{study.references.map((reference) => <li key={`${reference.osisStart}-${reference.osisEnd}`}>{reference.label}</li>)}</ul><p className="lead">A hivatkozásokat a dokumentum feltöltése után a szerkesztő ellenőrizte. A későbbi Biblia-olvasóban ezek az igék visszamutatnak majd erre a tanulmányra.</p></> : null}</article><aside className="detail-sidebar"><div className="detail-sidebar__section"><h2>Témák</h2><ul>{study.topics.map((topic) => <li key={topic.id}><Link className="text-link" href={`/temak/${topic.slug}`}>{topic.title}</Link></li>)}</ul></div>{study.pdfFilename ? <div className="detail-sidebar__section"><h2>Dokumentum</h2><ul><li>{study.pdfFilename}</li></ul></div> : null}</aside></div>{study.relatedVideos.length ? <section className="section"><div className="section-heading"><div><p className="eyebrow">Kapcsolódó tartalom</p><h2>Videóajánlók</h2></div><p>A tanulmány mellé válogatott előadások.</p></div><VideoRows videos={study.relatedVideos} /></section> : null}</div>;
}
