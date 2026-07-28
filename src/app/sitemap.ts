import type { MetadataRoute } from "next";
import { listPublicStudies, listPublicTopics, listPublicVideos } from "@/lib/content-repository";
import { absoluteSiteUrl } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [topics, studies, videos] = await Promise.all([
    listPublicTopics(),
    listPublicStudies(),
    listPublicVideos(),
  ]);

  return [
    { url: absoluteSiteUrl("/"), priority: 1 },
    { url: absoluteSiteUrl("/temak"), priority: 0.8 },
    { url: absoluteSiteUrl("/tanulmanyok"), priority: 0.8 },
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
    ...videos.map((item) => ({
      url: absoluteSiteUrl(`/videok/${item.slug}`),
      priority: 0.7,
    })),
  ];
}
