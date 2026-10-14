import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { StudyArticle } from "@/components/study-article";
import { ScriptureText } from "@/components/scripture-text";
import { StudyBibleReader, StudyBibleWorkspace } from "@/components/study-bible-reader";
import { StudySeriesContents, StudySeriesNavigation } from "@/components/study-series-navigation";
import { getStudyBySlug } from "@/lib/content-repository";
import { absoluteSiteUrl } from "@/lib/site-config";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = await getStudyBySlug(slug);

  return study
    ? {
        title: study.seoTitle || study.title,
        description: study.seoDescription || study.summary,
        alternates: { canonical: `/tanulmanyok/${slug}` },
        openGraph: {
          type: "article",
          title: study.seoTitle || study.title,
          description: study.seoDescription || study.summary,
        },
      }
    : {};
}

export default async function StudyPage({ params }: Props) {
  const { slug } = await params;
  const study = await getStudyBySlug(slug);

  if (!study) notFound();

  const crumbs = [
    { label: "Kezdőlap", href: "/" },
    { label: "Tanulmányok", href: "/tanulmanyok" },
    ...(study.series ? [{ label: study.series.title, href: `/sorozatok/${study.series.slug}` }] : []),
    { label: study.title, href: `/tanulmanyok/${study.slug}` },
  ];

  return (
    <div className="page-shell">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: study.title,
          description: study.summary,
          inLanguage: "hu",
          mainEntityOfPage: absoluteSiteUrl(`/tanulmanyok/${study.slug}`),
          publisher: { "@type": "Organization", name: "Élő Víz" },
          ...(study.series ? {
            isPartOf: { "@type": "CreativeWorkSeries", "@id": absoluteSiteUrl(`/sorozatok/${study.series.slug}`), name: study.series.title },
            ...(study.series.author ? { author: { "@type": "Person", name: study.series.author } } : {}),
          } : {}),
        }}
      />
      <Breadcrumbs items={[...crumbs.slice(0, -1), { label: study.title }]} />
      <StudyBibleWorkspace key={study.id}>
      <div className="detail-grid study-detail-grid">
        <div className="detail-copy study-detail__intro">
          <p className="eyebrow">{study.series ? `${study.series.parts.find((part) => part.id === study.id)?.position}. rész` : "Bibliatanulmány"}</p>
          {study.series ? <Link className="text-link study-series-link" href={`/sorozatok/${study.series.slug}`}>{study.series.title}</Link> : null}
          <h1 id="study-title">{study.title}</h1>
          <div className="study-summary"><p className="study-summary__label">Összefoglaló</p><p className="lead"><ScriptureText text={study.summary} /></p></div>
        </div>
        <aside className="detail-sidebar study-detail__sidebar">
          {study.series ? <div className="detail-sidebar__section study-detail__series"><h2>A sorozat részei</h2><Link className="text-link" href={`/sorozatok/${study.series.slug}`}>{study.series.title}</Link><StudySeriesContents series={study.series} currentStudyId={study.id} /></div> : null}
          <div className="detail-sidebar__section study-detail__topics">
            <h2>Témák</h2>
            <ul>
              {study.topics.map((topic) => (
                <li key={topic.id}>
                  <Link className="text-link" href={`/temak/${topic.slug}`}>
                    {topic.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {study.pdfFilename ? (
            <div className="detail-sidebar__section study-detail__document">
              <h2>Dokumentum</h2>
              <a
                className="button"
                href={study.pdfUrl}
                target="_blank"
                rel="noopener"
              >
                PDF megnyitása
              </a>
            </div>
          ) : null}
          {!study.series && study.relatedStudies.length ? (
            <div className="detail-sidebar__section study-detail__related-studies">
              <h2>Kapcsolódó tanulmányok</h2>
              <ul>
                {study.relatedStudies.map((relatedStudy) => (
                  <li key={relatedStudy.id}>
                    <Link className="text-link" href={`/tanulmanyok/${relatedStudy.slug}`}>
                      {relatedStudy.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {study.relatedVideos.length ? (
            <div className="detail-sidebar__section study-detail__related-videos">
              <h2>Kapcsolódó videók</h2>
              <ul>
                {study.relatedVideos.map((video) => (
                  <li key={video.id}>
                    <Link className="text-link" href={`/videok/${video.slug}`}>
                      {video.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <StudyBibleReader references={study.references.map(({ label, osisStart, osisEnd }) => ({ label, osisStart, osisEnd }))} />
        </aside>
        <article className="detail-copy study-detail__article" aria-labelledby="study-title">
          <h2 className="study-body-heading">Tanulmány</h2>
          {study.article
            ? <StudyArticle article={study.article} />
            : <p className="study-article__fallback">A teljes tanulmány jelenleg a PDF-dokumentumban olvasható.</p>}
          {study.series ? <StudySeriesNavigation series={study.series} studyId={study.id} /> : null}
        </article>
      </div>
      </StudyBibleWorkspace>
    </div>
  );
}
