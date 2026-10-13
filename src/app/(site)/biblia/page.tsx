import type { Metadata } from "next";
import Link from "next/link";
import { BibleReferenceForm } from "@/components/bible-navigation";
import { BIBLE_TRANSLATION_NAME, bibleBookPath } from "@/lib/bible-core";
import { getBibleEdition, listBibleBooks } from "@/lib/bible-repository";

export const metadata: Metadata = { title: "Biblia – Károli 1908", description: "A revideált Károli Biblia (1908) könyvei és fejezetei, kapcsolódó bibliatanulmányokkal.", alternates: { canonical: "/biblia" } };
export default async function BiblePage({ searchParams }: { searchParams: Promise<{ hiba?: string }> }) {
  const [edition, books, query] = await Promise.all([getBibleEdition(), listBibleBooks(), searchParams]);
  return <div className="page-shell bible-index">
    <header className="page-intro"><p className="eyebrow">{BIBLE_TRANSLATION_NAME}</p><h1>Biblia</h1><p className="lead">Válassz egy könyvet, vagy nyiss meg egy ismert igeszakaszt.</p>
      <BibleReferenceForm error={query.hiba ? "Az igeszakasz nem található. Ellenőrizd a könyvet, a fejezetet és a versszámot." : undefined} />
    </header>
    {edition ? <div className="bible-testaments">{[["OT","Ószövetség"],["NT","Újszövetség"]].map(([testament,label]) => <section key={testament} aria-labelledby={`testament-${testament}`}><h2 id={`testament-${testament}`}>{label}</h2><ul className="bible-book-list">{books.filter((book) => book.testament===testament).map((book) => <li key={book.code}><Link prefetch={false} href={bibleBookPath(book.slug)}><span>{book.name}</span><small>{book.chapters} fejezet</small></Link></li>)}</ul></section>)}</div> : <p className="empty-state">A Biblia szövege hamarosan elérhető lesz.</p>}
    {edition ? <p className="bible-source">{edition.attribution} <a href={edition.sourceUrl} target="_blank" rel="noopener">Szövegforrás</a></p> : null}
  </div>;
}
