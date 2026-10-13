import Link from "next/link";
import { bibleBookBySlug, bibleChapterPath, bibleChapterNeighbours } from "@/lib/bible-core";
import { listBibleBooks } from "@/lib/bible-repository";

export function BibleReferenceForm({ error }: { error?: string }) {
  return <form className="bible-reference-form" action="/biblia/megnyitas" method="get">
    <label htmlFor="bible-reference">Ugrás egy igeszakaszhoz</label>
    <div><input id="bible-reference" name="q" placeholder="Pl. Jn 3:16" maxLength={100} required aria-describedby={error ? "bible-reference-error" : undefined} /><button className="button" type="submit">Megnyitás</button></div>
    {error ? <p id="bible-reference-error" role="alert">{error}</p> : null}
  </form>;
}

export async function BibleNavigation({ slug, chapter }: { slug: string; chapter: number }) {
  const books = await listBibleBooks();
  const book = books.find((book) => book.slug === slug);
  const counts = new Map(books.map((book) => [book.slug, book.chapters]));
  const neighbours = bibleChapterNeighbours(slug, chapter, counts);
  function neighbourLabel(point: { slug: string; chapter: number }) { return `${bibleBookBySlug(point.slug)?.name} ${point.chapter}`; }
  return <nav className="bible-navigation" aria-label="Bibliafejezetek">
    <form action="/biblia/megnyitas" method="get" className="bible-selector">
      <label>Könyv<select name="konyv" defaultValue={slug}>{books.map((book) => <option key={book.code} value={book.slug}>{book.name}</option>)}</select></label>
      <label>Fejezet<input type="number" name="fejezet" min={1} max={150} defaultValue={chapter} required /></label>
      <button className="button" type="submit">Olvasás</button>
    </form>
    <details className="bible-chapter-picker"><summary>{book?.name} – fejezetválasztás</summary><div className="bible-chapter-links">{Array.from({length: book?.chapters ?? 0}, (_, index) => index+1).map((number) => <Link prefetch={false} key={number} href={bibleChapterPath(slug, number)} aria-current={number === chapter ? "page" : undefined}>{number}</Link>)}</div></details>
    <div className="bible-prev-next">
      {neighbours.previous ? <Link prefetch={false} href={bibleChapterPath(neighbours.previous.slug, neighbours.previous.chapter)} rel="prev"><small>← Előző fejezet</small>{neighbourLabel(neighbours.previous)}</Link> : <span />}
      {neighbours.next ? <Link prefetch={false} href={bibleChapterPath(neighbours.next.slug, neighbours.next.chapter)} rel="next"><small>Következő fejezet →</small>{neighbourLabel(neighbours.next)}</Link> : <span />}
    </div>
  </nav>;
}
