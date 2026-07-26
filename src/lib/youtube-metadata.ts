export type YouTubeMetadata = {
  title: string;
  channelName: string;
};

type OEmbedResponse = {
  title?: unknown;
  author_name?: unknown;
};

export async function fetchYouTubeMetadata(
  youtubeUrl: string,
  fetcher: typeof fetch = fetch,
): Promise<YouTubeMetadata> {
  const endpoint = new URL("https://www.youtube.com/oembed");
  endpoint.searchParams.set("url", youtubeUrl);
  endpoint.searchParams.set("format", "json");

  const response = await fetcher(endpoint, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    throw new Error(`YouTube metadata request failed with status ${response.status}.`);
  }

  const payload = await response.json() as OEmbedResponse;
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const channelName = typeof payload.author_name === "string" ? payload.author_name.trim() : "";

  if (!title || !channelName) {
    throw new Error("YouTube metadata response did not include a title and channel.");
  }

  return {
    title: title.slice(0, 160),
    channelName: channelName.slice(0, 160),
  };
}
