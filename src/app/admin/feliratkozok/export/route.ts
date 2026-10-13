import { isAdminAuthenticated } from "@/lib/admin-auth";
import { exportNewsletterMigration } from "@/lib/newsletter-export";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex", "X-Content-Type-Options": "nosniff" };

export async function GET() {
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Belépés szükséges." }, { status: 401, headers });
  try {
    const snapshot = await exportNewsletterMigration();
    return new Response(JSON.stringify(snapshot, null, 2), { headers: { ...headers,
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="eloviz-newsletter-${snapshot.finishedAt.slice(0, 10)}.json"` } });
  } catch {
    return Response.json({ error: "A teljes export most nem készíthető el. Ellenőrizd a szolgáltatói hozzáférést, majd próbáld újra." }, { status: 503, headers });
  }
}
