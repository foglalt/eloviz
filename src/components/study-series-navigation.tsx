import Link from "next/link";
import { seriesNeighbours } from "@/lib/study-series-core";
import type { StudySeries } from "@/lib/study-series-repository";

export function StudySeriesContents({ series, currentStudyId }: { series: StudySeries; currentStudyId?: string }) {
  return (
    <ol className="series-contents" aria-label="A sorozat részei">
      {series.parts.map((part) => (
        <li key={part.id}>
          <Link href={`/tanulmanyok/${part.slug}`} aria-current={part.id === currentStudyId ? "page" : undefined}>
            <span className="series-part-number">{part.position}.</span><span>{part.title}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function StudySeriesNavigation({ series, studyId }: { series: StudySeries; studyId: string }) {
  const { previous, next } = seriesNeighbours(series.parts, studyId);
  return (
    <nav className="series-reading-navigation" aria-label="Olvasás a sorozatban">
      {previous ? <Link href={`/tanulmanyok/${previous.slug}`} rel="prev"><small>← Előző rész</small><span>{previous.position}. {previous.title}</span></Link> : <span />}
      {next ? <Link href={`/tanulmanyok/${next.slug}`} rel="next"><small>Következő rész →</small><span>{next.position}. {next.title}</span></Link> : <span />}
      <Link className="series-reading-navigation__contents" href={`/sorozatok/${series.slug}`}>A teljes sorozat tartalomjegyzéke →</Link>
    </nav>
  );
}
