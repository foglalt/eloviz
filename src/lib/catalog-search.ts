import type { StudySummary, TopicSummary, VideoSummary } from "./content-types";

export const CATALOG_SEARCH_LIMIT = 12;

export const CATALOG_SEARCH_KINDS = ["topic", "study", "video"] as const;

export type CatalogSearchKind = (typeof CATALOG_SEARCH_KINDS)[number];

export function normalizeCatalogSearchKinds(value?: string | string[]) {
  const requested = new Set(Array.isArray(value) ? value : value ? [value] : []);
  const selected = CATALOG_SEARCH_KINDS.filter((kind) => requested.has(kind));
  return selected.length ? selected : [...CATALOG_SEARCH_KINDS];
}

export function catalogSearchKindsForPathname(pathname: string | null) {
  const section = pathname?.split("/").filter(Boolean)[0];
  if (section === "temak") return ["topic"] satisfies CatalogSearchKind[];
  if (section === "tanulmanyok") return ["study"] satisfies CatalogSearchKind[];
  if (section === "videok") return ["video"] satisfies CatalogSearchKind[];
  return [...CATALOG_SEARCH_KINDS];
}

export type CatalogSearchItem = {
  id: string;
  kind: CatalogSearchKind;
  slug: string;
  title: string;
  description: string;
  meta: string | null;
};

export type CatalogSearchResults = {
  query: string;
  topics: CatalogSearchItem[];
  studies: CatalogSearchItem[];
  videos: CatalogSearchItem[];
  total: number;
};

export function normalizeCatalogSearchQuery(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 100);
}

export function foldCatalogSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("hu");
}

function rankResult(title: string, haystack: string, query: string) {
  const foldedTitle = foldCatalogSearchText(title);
  if (foldedTitle === query) return 0;
  if (foldedTitle.startsWith(query)) return 1;
  if (foldedTitle.includes(query)) return 2;
  return haystack.includes(query) ? 3 : 4;
}

function matches(query: string, values: Array<string | null | undefined>) {
  const haystack = foldCatalogSearchText(values.filter(Boolean).join(" "));
  return { haystack, matches: haystack.includes(query) };
}

function bySearchRank(
  query: string,
  getTitle: (item: CatalogSearchItem) => string,
  getHaystack: (item: CatalogSearchItem) => string,
) {
  return (left: CatalogSearchItem, right: CatalogSearchItem) => {
    const rankDifference = rankResult(getTitle(left), getHaystack(left), query)
      - rankResult(getTitle(right), getHaystack(right), query);
    return rankDifference || left.title.localeCompare(right.title, "hu");
  };
}

export function searchBundledCatalog(
  rawQuery: string,
  topics: TopicSummary[],
  studies: StudySummary[],
  videos: VideoSummary[],
  selectedKinds: readonly CatalogSearchKind[] = CATALOG_SEARCH_KINDS,
): CatalogSearchResults {
  const query = normalizeCatalogSearchQuery(rawQuery);
  const foldedQuery = foldCatalogSearchText(query);

  if (foldedQuery.length < 2) {
    return { query, topics: [], studies: [], videos: [], total: 0 };
  }

  const haystacks = new Map<string, string>();
  const includedKinds = new Set(selectedKinds);

  const topicResults = includedKinds.has("topic") ? topics.flatMap<CatalogSearchItem>((topic) => {
    const match = matches(foldedQuery, [topic.title, topic.slug, topic.description]);
    if (!match.matches) return [];
    haystacks.set(`topic:${topic.id}`, match.haystack);
    return [{
      id: topic.id,
      kind: "topic",
      slug: topic.slug,
      title: topic.title,
      description: topic.description,
      meta: `${topic.studyCount ?? 0} tanulmány · ${topic.videoCount ?? 0} videó`,
    }];
  }) : [];

  const studyResults = includedKinds.has("study") ? studies.flatMap<CatalogSearchItem>((study) => {
    const topicText = study.topics.map((topic) => `${topic.title} ${topic.description}`).join(" ");
    const match = matches(foldedQuery, [study.title, study.slug, study.summary, topicText]);
    if (!match.matches) return [];
    haystacks.set(`study:${study.id}`, match.haystack);
    return [{
      id: study.id,
      kind: "study",
      slug: study.slug,
      title: study.title,
      description: study.summary,
      meta: study.topics.map((topic) => topic.title).join(" · ") || "PDF-tanulmány",
    }];
  }) : [];

  const videoResults = includedKinds.has("video") ? videos.flatMap<CatalogSearchItem>((video) => {
    const topicText = video.topics.map((topic) => `${topic.title} ${topic.description}`).join(" ");
    const match = matches(foldedQuery, [
      video.title,
      video.slug,
      video.description,
      video.channelName,
      video.speaker,
      topicText,
    ]);
    if (!match.matches) return [];
    haystacks.set(`video:${video.id}`, match.haystack);
    return [{
      id: video.id,
      kind: "video",
      slug: video.slug,
      title: video.title,
      description: video.description,
      meta: video.speaker?.trim() || null,
    }];
  }) : [];

  const sorter = bySearchRank(
    foldedQuery,
    (item) => item.title,
    (item) => haystacks.get(`${item.kind}:${item.id}`) ?? "",
  );
  const limitedTopics = topicResults.sort(sorter).slice(0, CATALOG_SEARCH_LIMIT);
  const limitedStudies = studyResults.sort(sorter).slice(0, CATALOG_SEARCH_LIMIT);
  const limitedVideos = videoResults.sort(sorter).slice(0, CATALOG_SEARCH_LIMIT);

  return {
    query,
    topics: limitedTopics,
    studies: limitedStudies,
    videos: limitedVideos,
    total: limitedTopics.length + limitedStudies.length + limitedVideos.length,
  };
}
