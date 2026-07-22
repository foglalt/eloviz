import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { StudyRows, TopicRows, VideoRows } from "@/components/resource-lists";
import { listPublicStudies, listPublicTopics, listPublicVideos } from "@/lib/content-repository";

export default async function HomePage() {
  const [topics, studies, videos] = await Promise.all([listPublicTopics(), listPublicStudies(), listPublicVideos()]);
  const featuredStudy = studies.find((study) => study.featured) ?? studies[0];

  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "Élő Víz", url: "https://eloviz.hu", inLanguage: "hu" }} />
    <section className="hero">
      <Image className="hero__image" src="/river-of-life-hero.webp" alt="A kristálytiszta élet folyója a tróntól, zöld mezők és az élet fája között" fill priority sizes="100vw" />
      <div className="hero__content">
        <p className="hero__eyebrow">Magyar bibliatanulmányok</p>
        <h1 className="hero__brand">Élő Víz</h1>
        <p className="hero__quote">„Aki szomjúhozik, jöjjön el; és aki akarja, vegye az élet vizét ingyen.”</p>
        <p className="hero__reference">Jelenések 22:17</p>
        <div className="hero__actions"><Link className="button button--light" href="/temak">Témák felfedezése</Link><Link className="button button--ghost" href="/tanulmanyok">Tanulmányok</Link></div>
      </div>
    </section>
    <section className="section">
      <div className="section-heading"><div><p className="eyebrow">Kiindulópontok</p><h2>Témák, amelyek mélyebbre vezetnek</h2></div><p>Válassz egy kérdéskört, majd haladj a hozzá kapcsolódó tanulmányok és videók között.</p></div>
      <TopicRows topics={topics.slice(0, 5)} />
      <p className="section-footer"><Link className="text-link" href="/temak">Minden téma</Link></p>
    </section>
    {featuredStudy ? <section className="section section--tint feature-section">
      <div className="feature-study">
        <div className="feature-study__intro"><p className="eyebrow">Kiemelt tanulmány</p><h2>{featuredStudy.title}</h2></div>
        <div className="feature-study__content"><p>{featuredStudy.summary}</p><ul className="reference-list">{featuredStudy.references.map((reference) => <li key={reference.osisStart}>{reference.label}</li>)}</ul><Link className="button" href={`/tanulmanyok/${featuredStudy.slug}`}>Tanulmány megnyitása</Link></div>
      </div>
    </section> : null}
    <section className="section"><div className="section-heading"><div><p className="eyebrow">Gyűjtemény</p><h2>Legfrissebb tanulmányok</h2></div><p>Önálló, letölthető PDF-anyagok megerősített bibliai hivatkozásokkal.</p></div><StudyRows studies={studies.slice(0, 3)} /></section>
    <section className="section section--tint"><div className="section-heading"><div><p className="eyebrow">Hallgasd és nézd</p><h2>Videóajánlók</h2></div><p>Gondosan válogatott előadások, amelyek egy-egy témát vagy tanulmányt egészítenek ki.</p></div><VideoRows videos={videos.slice(0, 3)} /></section>
  </>;
}
