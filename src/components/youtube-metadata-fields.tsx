"use client";

import { useRef, useState } from "react";

type Props = {
  initialUrl?: string;
  initialTitle?: string;
  initialChannelName?: string | null;
};

type MetadataResponse = {
  title?: string;
  channelName?: string;
  error?: string;
};

export function YouTubeMetadataFields({
  initialUrl = "",
  initialTitle = "",
  initialChannelName = "",
}: Props) {
  const [youtubeUrl, setYouTubeUrl] = useState(initialUrl);
  const [title, setTitle] = useState(initialTitle);
  const [channelName, setChannelName] = useState(initialChannelName ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const loadedUrl = useRef(initialUrl);

  async function loadMetadata() {
    const normalizedUrl = youtubeUrl.trim();
    if (
      !normalizedUrl
      || loading
      || (normalizedUrl === loadedUrl.current && title && channelName && !error)
    ) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/youtube-metadata?url=${encodeURIComponent(normalizedUrl)}`);
      const payload = await response.json() as MetadataResponse;
      if (!response.ok || !payload.title || !payload.channelName) {
        throw new Error(payload.error || "A YouTube-adatok betöltése nem sikerült.");
      }

      setTitle(payload.title);
      setChannelName(payload.channelName);
      loadedUrl.current = normalizedUrl;
    } catch (metadataError) {
      setError(
        metadataError instanceof Error
          ? metadataError.message
          : "A YouTube-adatok betöltése nem sikerült.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="field field--full">
        <label htmlFor="youtubeUrl">YouTube-link</label>
        <input
          id="youtubeUrl"
          name="youtubeUrl"
          type="url"
          value={youtubeUrl}
          onChange={(event) => {
            const nextUrl = event.target.value;
            setYouTubeUrl(nextUrl);
            if (nextUrl.trim() !== loadedUrl.current) {
              setTitle("");
              setChannelName("");
            }
            setError("");
          }}
          onBlur={loadMetadata}
          placeholder="https://www.youtube.com/watch?v=…"
          required
        />
        <small className="field-help">
          A címet és a csatornát automatikusan betöltjük a linkből.
        </small>
        <span className="field-status" aria-live="polite">
          {loading ? "YouTube-adatok betöltése…" : error}
        </span>
      </div>
      <div className="field">
        <label htmlFor="title">Cím</label>
        <input
          id="title"
          name="title"
          value={title}
          readOnly
          placeholder="A YouTube-linkből töltődik be"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="channelName">Csatorna</label>
        <input
          id="channelName"
          name="channelName"
          value={channelName}
          readOnly
          placeholder="A YouTube-linkből töltődik be"
        />
      </div>
    </>
  );
}
