import type { MetadataRoute } from "next";
import { listPublicStudies, listPublicTopics, listPublicVideos } from "@/lib/content-repository";
import { absoluteSiteUrl } from "@/lib/site-config";
import { listPublicSeries } from "@/lib/study-series-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [topics, studies, videos, series] = await Promise.all([
    listPublicTopics(),
    listPublicStudies(),
    listPublicVideos(),
    listPublicSeries(),
  ]);

  return [
    { url: absoluteSiteUrl("/"), priority: 1 },
    { url: absoluteSiteUrl("/temak"), priority: 0.8 },
    { url: absoluteSiteUrl("/tanulmanyok"), priority: 0.8 },
    { url: absoluteSiteUrl("/sorozatok"), priority: 0.8 },
    { url: absoluteSiteUrl("/videok"), priority: 0.7 },
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
