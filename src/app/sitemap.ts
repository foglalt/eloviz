import type { MetadataRoute } from "next";
import { listPublicStudies, listPublicTopics, listPublicVideos } from "@/lib/content-repository";
import { absoluteSiteUrl } from "@/lib/site-config";
import { listPublicSeries } from "@/lib/study-series-repository";
import { listBibleBooks, listBibleChapters } from "@/lib/bible-repository";
import { bibleBookPath, bibleChapterPath } from "@/lib/bible-core";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [topics, studies, videos, series, bibleBooks, bibleChapters] = await Promise.all([
    listPublicTopics(),
    listPublicStudies(),
    listPublicVideos(),
    listPublicSeries(),
    listBibleBooks(),
    listBibleChapters(),
  ]);

  return [
    { url: absoluteSiteUrl("/"), priority: 1 },
    { url: absoluteSiteUrl("/temak"), priority: 0.8 },
    { url: absoluteSiteUrl("/tanulmanyok"), priority: 0.8 },
    { url: absoluteSiteUrl("/sorozatok"), priority: 0.8 },
    { url: absoluteSiteUrl("/videok"), priority: 0.7 },
    ...(bibleBooks.length ? [{url:absoluteSiteUrl("/biblia"),priority:0.8}] : []),
    ...bibleBooks.map((book)=>({url:absoluteSiteUrl(bibleBookPath(book.slug)),priority:0.6})),
    ...bibleChapters.map((item)=>({url:absoluteSiteUrl(bibleChapterPath(item.slug,item.chapter)),priority:0.5})),
    ...topics.map((item) => ({
      url: absoluteSiteUrl(`/temak/${item.slug}`),
      priority: 0.7,
    })),
    ...studies.map((item) => ({
      url: absoluteSiteUrl(`/tanulmanyok/${item.slug}`),
      lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined,
      priority: 0.8,
    })),
    ...series.map((item) => ({ url: absoluteSiteUrl(`/sorozatok/${item.slug}`), lastModified: new Date(item.updatedAt), priority: 0.8 })),
    ...videos.map((item) => ({
      url: absoluteSiteUrl(`/videok/${item.slug}`),
      priority: 0.7,
    })),
  ];
}
