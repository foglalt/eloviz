import { NextRequest, NextResponse } from "next/server";
import { bibleBookBySlug, bibleChapterPath, bibleVerseHref, parseBibleChapter, parseBibleLookup } from "@/lib/bible-core";
import { getBibleChapter, readableBiblePoints } from "@/lib/bible-repository";

export async function GET(request: NextRequest) {
  const query=request.nextUrl.searchParams;
  let destination: string | null=null;
  if (query.has("q")) {
    const raw=query.get("q") ?? "";
    const range=raw.length<=100 ? parseBibleLookup(raw) : null;
    if (range) {
      const points=await readableBiblePoints([range.osisStart,range.osisEnd]);
      if (points.has(range.osisStart) && points.has(range.osisEnd)) destination=bibleVerseHref(range.osisStart);
    }
  } else {
    const book=bibleBookBySlug(query.get("konyv") ?? "");
    const chapter=parseBibleChapter(query.get("fejezet") ?? "");
    if (book && chapter && await getBibleChapter(book.slug,String(chapter))) destination=bibleChapterPath(book.slug,chapter);
  }
  const response=NextResponse.redirect(new URL(destination ?? "/biblia?hiba=1",request.url),303);
  response.headers.set("X-Robots-Tag","noindex");
  return response;
}
