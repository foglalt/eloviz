import assert from "node:assert/strict";
import test from "node:test";
import { fetchYouTubeMetadata } from "./youtube-metadata.ts";

test("maps the YouTube oEmbed title and channel", async () => {
  const fetcher = (async (input: string | URL | Request) => {
    const url = new URL(String(input));
    assert.equal(url.hostname, "www.youtube.com");
    assert.equal(url.pathname, "/oembed");
    assert.equal(url.searchParams.get("format"), "json");
    assert.equal(
      url.searchParams.get("url"),
      "https://www.youtube.com/watch?v=9hi9Xp_Nczw",
    );

    return new Response(JSON.stringify({
      title: "  Áttekintés: Jeremiás  ",
      author_name: "  BibleProject – Magyar  ",
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  const metadata = await fetchYouTubeMetadata(
    "https://www.youtube.com/watch?v=9hi9Xp_Nczw",
    fetcher,
  );

  assert.deepEqual(metadata, {
    title: "Áttekintés: Jeremiás",
    channelName: "BibleProject – Magyar",
  });
});

test("rejects unsuccessful metadata responses", async () => {
  const fetcher = (async () => new Response(null, { status: 404 })) as typeof fetch;

  await assert.rejects(
    fetchYouTubeMetadata("https://youtu.be/9hi9Xp_Nczw", fetcher),
    /status 404/,
  );
});
