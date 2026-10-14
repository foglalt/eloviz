import Link from "next/link";
import type { BibleChapter } from "@/lib/bible-repository";

export function BibleConnectedStudies({ content }: { content: BibleChapter }) {
  const connectedVerses = content.verses.filter((verse) => verse.studies.length > 0);

  return (
    <details className="bible-connected-studies">
      <summary>
        <span className="bible-connected-studies__show">Kapcsolódó tanulmányok megjelenítése</span>
        <span className="bible-connected-studies__hide">Kapcsolódó tanulmányok elrejtése</span>
      </summary>
      {connectedVerses.length ? (
        <div className="bible-connected-studies__results" role="region" aria-label="Kapcsolódó tanulmányok versenként" tabIndex={0}>
          <ol>
            {connectedVerses.map((verse) => (
              <li key={verse.osis}>
                <h2>
                  <a href={`#vers-${verse.number}`} aria-label={`${content.book.name} ${content.chapter}:${verse.number} – ugrás a vershez`}>
                    {content.chapter}:{verse.number}
                  </a>
                  <span>{verse.studies.length} tanulmány</span>
                </h2>
                <ul>
                  {verse.studies.map((study) => (
                    <li key={study.id}>
                      <Link prefetch={false} href={`/tanulmanyok/${study.slug}`}>{study.title}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <p className="bible-connected-studies__empty">Ehhez a fejezethez még nincs kapcsolódó tanulmány.</p>
      )}
    </details>
  );
}
