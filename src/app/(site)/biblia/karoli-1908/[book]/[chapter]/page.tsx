import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BibleReaderLayout } from "@/components/bible-reader-layout";
import { BibleNavigation } from "@/components/bible-navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { bibleBookPath, bibleChapterPath } from "@/lib/bible-core";
import { getBibleChapter, getBibleEdition } from "@/lib/bible-repository";

type Props = { params: Promise<{book:string;chapter:string}> };
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const {book,chapter}=await params;
  const content=await getBibleChapter(book,chapter);
  return content ? { title:`${content.book.name} ${content.chapter} – Károli 1908`,description:`${content.book.name} ${content.chapter}. fejezet a revideált Károli Bibliában, kapcsolódó tanulmányokkal.`,alternates:{canonical:bibleChapterPath(book,content.chapter)} } : {};
}
export default async function BibleChapterPage({params}:Props) {
  const {book,chapter}=await params;
  const [content,edition]=await Promise.all([getBibleChapter(book,chapter),getBibleEdition()]);
  if (!content || !edition) notFound();
  const title=`${content.book.name} ${content.chapter}`;
  const crumbs=[{label:"Kezdőlap",href:"/"},{label:"Biblia",href:"/biblia"},{label:content.book.name,href:bibleBookPath(book)},{label:`${content.chapter}. fejezet`,href:bibleChapterPath(book,content.chapter)}];
  return <div className="page-shell bible-reader">
    <JsonLd data={breadcrumbJsonLd(crumbs)} /><Breadcrumbs items={[...crumbs.slice(0,-1),{label:`${content.chapter}. fejezet`}]} />
    <BibleReaderLayout key={`${book}-${content.chapter}`} navigation={<BibleNavigation slug={book} chapter={content.chapter} />} hasConnectedStudies={content.verses.some((verse) => verse.studies.length > 0)}>
      <article aria-labelledby="bible-title" className="bible-reading-column">
        <header><p className="eyebrow">Károli 1908</p><h1 id="bible-title">{title}</h1></header>
        <ol id="bible-verses" className="bible-verses">{content.verses.map((verse)=><li key={verse.osis} id={`vers-${verse.number}`} value={verse.number} className="bible-verse">
          <p><a className="bible-verse-number" href={`#vers-${verse.number}`} aria-label={`${verse.number}. vers hivatkozása`}>{verse.number}</a><span>{verse.text}</span></p>
          {verse.studies.length ? <div className="bible-verse-studies" role="group" aria-label={`${content.chapter}:${verse.number} vershez kapcsolódó tanulmányok`}>
            <p>Kapcsolódó tanulmányok</p>
            <ul>{verse.studies.map((study) => <li key={study.id}><Link prefetch={false} href={`/tanulmanyok/${study.slug}`}>{study.title}</Link></li>)}</ul>
          </div> : null}
        </li>)}</ol>
        <p className="bible-source">{edition.attribution} <a href={edition.sourceUrl} target="_blank" rel="noopener">Szövegforrás</a></p>
        <BibleNavigation slug={book} chapter={content.chapter} />
      </article>
    </BibleReaderLayout>
  </div>;
}
