import { Resend } from "resend";
import { synchronizeNewsletterOptOut } from "@/lib/newsletter";

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) return new Response("Unavailable", { status: 503 });
  const payload = await request.text();
  let event;
  try {
    event = new Resend(process.env.RESEND_API_KEY).webhooks.verify({ payload, webhookSecret: secret,
      headers: { id: request.headers.get("svix-id") ?? "", timestamp: request.headers.get("svix-timestamp") ?? "", signature: request.headers.get("svix-signature") ?? "" } });
  } catch { return new Response("Invalid signature", { status: 400 }); }
  if ((event.type === "contact.updated" && event.data.unsubscribed) || event.type === "contact.deleted") {
    await synchronizeNewsletterOptOut(event.data.email, event.data.id, event.created_at);
  }
  return Response.json({ received: true });
}
