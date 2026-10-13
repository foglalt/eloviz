import "server-only";
import { Resend } from "resend";

export function newsletterConfiguration() {
  const required = ["RESEND_API_KEY", "NEWSLETTER_FROM_EMAIL", "RESEND_NEWSLETTER_SEGMENT_ID", "RESEND_WEBHOOK_SECRET", "CRON_SECRET"];
  const missing = required.filter((key) => !process.env[key]?.trim());
  const enabled = process.env.NEWSLETTER_ENABLED === "true" && missing.length === 0
    && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production");
  return { enabled, missing };
}

export function newsletterProvider() {
  if (!newsletterConfiguration().enabled) throw new Error("Newsletter delivery is not configured.");
  return {
    resend: new Resend(process.env.RESEND_API_KEY!.trim()),
    from: process.env.NEWSLETTER_FROM_EMAIL!.trim(),
    segmentId: process.env.RESEND_NEWSLETTER_SEGMENT_ID!.trim(),
  };
}

export function requireProviderData<T>(response: { data: T | null; error: { name: string; message: string } | null }): T {
  if (response.error || !response.data) throw new Error(`Resend request failed: ${response.error?.name ?? "empty_response"}`);
  return response.data;
}

export async function providerRequest<T>(operation: () => Promise<{ data: T | null; error: { name: string; message: string } | null }>) {
  for (let attempt = 0; ; attempt++) {
    const response = await operation();
    if (response.error?.name !== "rate_limit_exceeded" || attempt >= 3) return response;
    await new Promise((resolve) => setTimeout(resolve, 1100 * (attempt + 1)));
  }
}
