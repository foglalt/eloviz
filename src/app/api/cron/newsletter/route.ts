import { timingSafeEqual } from "node:crypto";
import { deliverWeeklyDigest } from "@/lib/newsletter-digest";
import { newsletterConfiguration } from "@/lib/newsletter-provider";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const supplied = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (!secret || Buffer.byteLength(supplied) !== Buffer.byteLength(expected)
    || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!newsletterConfiguration().enabled) return Response.json({ status: "disabled" });
  try { return Response.json(await deliverWeeklyDigest()); }
  catch { return Response.json({ error: "Delivery failed; inspect admin history." }, { status: 500 }); }
}
