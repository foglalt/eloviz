import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isAutomatedAnalyticsUserAgent, normalizeAnalyticsPath } from "@/lib/analytics-core";
import { recordAnalyticsPageView } from "@/lib/analytics";

const VISITOR_COOKIE = "eloviz-visitor";
const VISITOR_LIFETIME_SECONDS = 60 * 60 * 24 * 365;
const VISITOR_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function noContent() {
  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

function requestOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host"))
    ?.split(",")[0]
    .trim();
  const protocol = (request.headers.get("x-forwarded-proto") ?? requestUrl.protocol.slice(0, -1))
    .split(",")[0]
    .trim();
  return host && protocol ? `${protocol}://${host}` : requestUrl.origin;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 512) return noContent();

  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (origin && origin !== requestOrigin(request)) return noContent();
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return noContent();
  if (isAutomatedAnalyticsUserAgent(request.headers.get("user-agent"))) return noContent();
  if (await isAdminAuthenticated()) return noContent();

  let submittedPath: unknown;
  try {
    ({ path: submittedPath } = await request.json() as { path?: unknown });
  } catch {
    return noContent();
  }

  const path = normalizeAnalyticsPath(submittedPath);
  if (!path) return noContent();

  const cookieStore = await cookies();
  const currentVisitor = cookieStore.get(VISITOR_COOKIE)?.value;
  const visitorId = currentVisitor && VISITOR_ID.test(currentVisitor) ? currentVisitor : randomUUID();
  const visitorHash = createHash("sha256").update(visitorId).digest("hex");

  try {
    await recordAnalyticsPageView(visitorHash, path);
  } catch (error) {
    console.error("Analytics page view could not be recorded.", error);
  }

  const response = noContent();
  if (visitorId !== currentVisitor) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      maxAge: VISITOR_LIFETIME_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}
