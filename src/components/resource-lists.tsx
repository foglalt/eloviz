import Link from "next/link";
import type { StudySummary, TopicSummary, VideoSummary } from "@/lib/content-types";

export function TopicRows({ topics }: { topics: TopicSummary[] }) {
  return <div className="editorial-list">{topics.map((topic, index) => (
    <Link className="editorial-row" href={`/temak/${topic.slug}`} key={topic.id}>
      <span className="editorial-row__number">{String(index + 1).padStart(2, "0")}</span>
      <span><span className="editorial-row__title">{topic.title}</span><span className="meta-line"><span>{topic.studyCount ?? 0} tanulmány</span><span>{topic.videoCount ?? 0} videó</span></span></span>
      <span className="editorial-row__description">{topic.description}</span><span className="editorial-row__arrow">↗</span>
    </Link>
  ))}</div>;
}

export function StudyRows({ studies }: { studies: StudySummary[] }) {
  if (!studies.length) return <p className="empty-state">Ehhez a válogatáshoz még nincs közzétett tanulmány.</p>;
  return <div className="resource-list">{studies.map((study) => (
    <Link className="resource-item" href={`/tanulmanyok/${study.slug}`} key={study.id}>
      <span><span className="eyebrow">PDF tanulmány</span><h3>{study.title}</h3><span className="tag-list">{study.topics.map((topic) => <span className="tag" key={topic.id}>{topic.title}</span>)}</span></span>
      <span className="resource-item__summary">{study.summary}<span className="meta-line">{study.references.slice(0, 2).map((reference) => <span key={reference.osisStart}>{reference.label}</span>)}</span></span>
    </Link>
  ))}</div>;
}

export function VideoRows({ videos }: { videos: VideoSummary[] }) {
  if (!videos.length) return <p className="empty-state">A videógyűjtemény szerkesztés alatt áll. Hamarosan itt is megjelennek az ajánlások.</p>;
  return <div className="resource-list">{videos.map((video) => (
    <Link className="resource-item" href={`/videok/${video.slug}`} key={video.id}>
      <span><span className="eyebrow">Videóajánló</span><h3>{video.title}</h3><span className="tag-list">{video.topics.map((topic) => <span className="tag" key={topic.id}>{topic.title}</span>)}</span></span>
      <span className="resource-item__summary">{video.description}</span>
    </Link>
  ))}</div>;
}
