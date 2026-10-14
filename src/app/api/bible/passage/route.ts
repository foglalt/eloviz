import { NextResponse } from "next/server";
import { parseBiblePassageRequest } from "@/lib/bible-passage-core";
import { getBiblePassage } from "@/lib/bible-repository";

export async function GET(request: Request) {
  const range = parseBiblePassageRequest(new URL(request.url).searchParams);
  if (!range) return NextResponse.json({ error: "Adj meg egy érvényes igeszakaszt, például Jn 3:16 vagy Jn 3. Legfeljebb tíz fejezet nyitható meg egyszerre." }, { status: 400 });
  try {
    const passage = await getBiblePassage(range);
    if (!passage) return NextResponse.json({ error: "Ez az igeszakasz nem található a Károli 1908 fordításban." }, { status: 404 });
    return NextResponse.json(passage, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400", "X-Robots-Tag": "noindex" } });
  } catch (error) {
    console.error("Bible passage could not be loaded.", error);
    return NextResponse.json({ error: "A Biblia most nem tölthető be. Próbáld újra." }, { status: 503 });
  }
}
