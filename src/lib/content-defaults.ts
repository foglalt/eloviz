import seed from "../../data/seed-content.json";
import type { StudySummary, TopicSummary, VideoSummary } from "./content-types";
import {
  attachOtherTopicToUnassignedStudies,
  includeOtherTopic,
} from "./other-topic";

const content = seed;

const topics: TopicSummary[] = content.topics.map((topic) => ({
  ...topic,
  studyCount: content.studies.filter((study) => study.topicIds.includes(topic.id)).length,
  videoCount: content.videos.filter((video) => video.topicIds.includes(topic.id)).length,
}));

const studies: StudySummary[] = content.studies.map((study) => ({
  id: study.id,
  slug: study.slug,
  title: study.title,
  summary: study.summary,
  featured: study.featured,
  sortOrder: study.sortOrder,
  status: "published",
  pdfUrl: study.pdfPath,
  pdfFilename: `${study.slug}.pdf`,
  updatedAt: null,
  topics: topics.filter((topic) => study.topicIds.includes(topic.id)),
  references: study.references,
}));

const unassignedStudyCount = studies.filter((study) => study.topics.length === 0).length;

export const defaultTopics = includeOtherTopic(topics, unassignedStudyCount);
export const defaultStudies = attachOtherTopicToUnassignedStudies(studies);

export const defaultVideos: VideoSummary[] = content.videos.map((video) => ({
  id: video.id,
  slug: video.slug,
  title: video.title,
  description: video.description,
  youtubeUrl: video.youtubeUrl,
  youtubeId: video.youtubeId,
  channelName: video.channelName,
  thumbnailUrl: `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`,
  uploadDate: null,
  featured: video.featured,
  sortOrder: video.sortOrder,
  status: "published",
  topics: topics.filter((topic) => video.topicIds.includes(topic.id)),
}));
