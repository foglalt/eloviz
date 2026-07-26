import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { parseYouTubeId } from "@/lib/content-validation";
import { fetchYouTubeMetadata } from "@/lib/youtube-metadata";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nincs jogosultság." }, { status: 401 });
  }

  const youtubeUrl = new URL(request.url).searchParams.get("url")?.trim() ?? "";
  const youtubeId = parseYouTubeId(youtubeUrl);
  if (!youtubeId) {
    return NextResponse.json(
      { error: "Adj meg egy érvényes YouTube-linket." },
      { status: 400 },
    );
  }

  try {
    const metadata = await fetchYouTubeMetadata(youtubeUrl);
    return NextResponse.json({ youtubeId, ...metadata });
  } catch (error) {
    console.error("Unable to load YouTube metadata.", error);
    return NextResponse.json(
      { error: "A cím és a csatorna most nem tölthető be a YouTube-ról." },
      { status: 502 },
    );
  }
}
