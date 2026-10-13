import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { bibleBookBySlug, bibleBookPath, bibleChapterPath } from "@/lib/bible-core";
import { listBibleBooks } from "@/lib/bible-repository";

type Props = { params: Promise<{book:string}> };
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const book = bibleBookBySlug((await params).book);
  return book ? {title:`${book.name} – Károli 1908`,description:`${book.name} fejezetei a revideált Károli Bibliában.`,alternates:{canonical:bibleBookPath(book.slug)}} : {};
}
export default async function BibleBookPage({params}:Props) {
  const slug = (await params).book;
  const book = (await listBibleBooks()).find((book) => book.slug===slug);
  if (!book) notFound();
  return <div className="page-shell bible-book-page"><Breadcrumbs items={[{label:"Kezdőlap",href:"/"},{label:"Biblia",href:"/biblia"},{label:book.name}]} />
    <header className="page-intro"><p className="eyebrow">Károli 1908</p><h1>{book.name}</h1><p className="lead">Válassz egy fejezetet az olvasáshoz.</p></header>
    <nav aria-label={`${book.name} fejezetei`} className="bible-chapter-links">{Array.from({length:book.chapters},(_,index)=>index+1).map((number)=><Link prefetch={false} key={number} href={bibleChapterPath(book.slug,number)} aria-label={`${number}. fejezet`}>{number}</Link>)}</nav>
  </div>;
}
