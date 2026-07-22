export type PublicationStatus = "draft" | "published";

export type TopicSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  featured: boolean;
  sortOrder: number;
  studyCount?: number;
  videoCount?: number;
};

export type ScriptureReference = {
  id?: string;
  label: string;
  osisStart: string;
  osisEnd: string;
  bookCode?: string;
  startChapter?: number;
  startVerse?: number;
  endChapter?: number;
  endVerse?: number;
};

export type StudySummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  featured: boolean;
  sortOrder: number;
  status?: PublicationStatus;
  pdfUrl: string;
  pdfFilename?: string;
  updatedAt?: string | null;
  topics: TopicSummary[];
  references: ScriptureReference[];
};

export type VideoSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  youtubeUrl: string;
  youtubeId: string;
  channelName?: string | null;
  thumbnailUrl?: string | null;
  uploadDate?: string | null;
  featured: boolean;
  sortOrder: number;
  status?: PublicationStatus;
  topics: TopicSummary[];
};

export type StudyDetail = StudySummary & {
  relatedVideos: VideoSummary[];
};

export type VideoDetail = VideoSummary & {
  relatedStudies: StudySummary[];
};

export type TopicDetail = TopicSummary & {
  studies: StudySummary[];
  videos: VideoSummary[];
};

export type ReferenceCandidate = ScriptureReference & {
  id: string;
  rawText: string;
  pageNumber: number | null;
  contextSnippet: string | null;
  reviewStatus: "pending" | "accepted" | "rejected" | "edited";
};

export type StudyDocumentAdmin = {
  id: string;
  versionNumber: number;
  originalFilename: string;
  byteSize: number;
  extractionStatus: "pending" | "complete" | "manual_required" | "failed";
  extractionError: string | null;
  createdAt: string;
  candidates: ReferenceCandidate[];
};
