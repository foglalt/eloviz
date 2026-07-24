import type { StudySummary, TopicSummary } from "./content-types";

export const OTHER_TOPIC_SLUG = "egyeb";

const OTHER_TOPIC: TopicSummary = {
  id: "system-topic-egyeb",
  slug: OTHER_TOPIC_SLUG,
  title: "Egyéb",
  description: "Azok a közzétett bibliatanulmányok, amelyek még nem kapcsolódnak külön témakörhöz.",
  seoTitle: "Egyéb bibliatanulmányok",
  seoDescription: "Témakörhöz még nem kapcsolt, közzétett bibliatanulmányok egy helyen.",
  featured: false,
  sortOrder: 1_000_000,
  studyCount: 0,
  videoCount: 0,
};

export function createOtherTopic(studyCount: number): TopicSummary {
  return {
    ...OTHER_TOPIC,
    studyCount,
  };
}

export function attachOtherTopicToUnassignedStudies(studies: StudySummary[]): StudySummary[] {
  return studies.map((study) => study.topics.length
    ? study
    : { ...study, topics: [createOtherTopic(0)] });
}

export function includeOtherTopic(
  topics: TopicSummary[],
  unassignedStudyCount: number,
): TopicSummary[] {
  const existing = topics.find((topic) => topic.slug === OTHER_TOPIC_SLUG);
  if (!existing) return [...topics, createOtherTopic(unassignedStudyCount)];

  return topics.map((topic) => topic.slug === OTHER_TOPIC_SLUG
    ? {
        ...topic,
        studyCount: (topic.studyCount ?? 0) + unassignedStudyCount,
      }
    : topic);
}
