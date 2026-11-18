import Link from "next/link";
import type { SeriesPart } from "@/lib/study-series-repository";

export function SeriesChapterList({ parts }: { parts: SeriesPart[] }) {
  return <ol className="series-chapter-list">{parts.map((part) => <li key={part.id}>
    <Link href={`/tanulmanyok/${part.slug}`}>
      <span className="series-part-number">{String(part.position).padStart(2, "0")}</span>
      <span><h3>{part.title}</h3><span className="preview-description">{part.summary}</span></span>
      <span aria-hidden="true">→</span>
    </Link>
  </li>)}</ol>;
}
