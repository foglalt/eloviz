import Link from "next/link";
import { seriesNeighbours, seriesPartGroups } from "@/lib/study-series-core";
import type { StudySeries } from "@/lib/study-series-repository";

export function StudySeriesContents({ series, currentStudyId }: { series: StudySeries; currentStudyId?: string }) {
  const { lessons, supplements } = seriesPartGroups(series.parts);
  return <>{([{ label: "Leckék", parts: lessons }, { label: "Mellékletek", parts: supplements }]).map(({ label, parts }) => parts.length ? (
    <section className="series-contents-group" key={label} aria-label={label}>
      <h3>{label}</h3>
      <ol className="series-contents" aria-label={label}>
        {parts.map((part) => <li key={part.id}>
          <Link href={`/tanulmanyok/${part.slug}`} aria-current={part.id === currentStudyId ? "page" : undefined}>
            <span className="series-part-number">{part.position}.</span><span>{part.title}</span>
          </Link>
        </li>)}
      </ol>
    </section>
  ) : null)}</>;
}

export function StudySeriesNavigation({ series, studyId }: { series: StudySeries; studyId: string }) {
  const { previous, next } = seriesNeighbours(series.parts, studyId);
  return <nav className="series-reading-navigation" aria-label="Olvasás a sorozatban">
    {previous ? <Link href={`/tanulmanyok/${previous.slug}`} rel="prev"><small>← Előző lecke</small><span>{previous.position}. {previous.title}</span></Link> : null}
    {next ? <Link href={`/tanulmanyok/${next.slug}`} rel="next"><small>Következő lecke →</small><span>{next.position}. {next.title}</span></Link> : null}
    <Link className="series-reading-navigation__contents" href={`/sorozatok/${series.slug}`}>A teljes sorozat tartalomjegyzéke →</Link>
  </nav>;
}
