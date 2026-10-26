export const NEWSLETTER_TURNSTILE_ACTION = "newsletter_signup";
export const HUMAN_CHECK_MESSAGE = "Erősítsd meg, hogy nem vagy robot, majd próbáld újra.";
export const HUMAN_CHECK_UNAVAILABLE = "Az emberi ellenőrzés most nem érhető el. Kérjük, próbáld újra később.";

type Configuration = { siteKey?: string; secretKey?: string; production: boolean };
type Verification = { success: true } | { success: false; message: string };

export function isTurnstileConfigured(configuration: Configuration) {
  const { siteKey, secretKey, production } = configuration;
  if (!siteKey?.trim() || !secretKey?.trim()) return false;
  // Cloudflare publishes dummy keys for local tests. Never accept them live.
  return !production || ![siteKey, secretKey].some((key) => /^[123]x0{10}/.test(key));
}

export async function verifyNewsletterHuman(token: unknown, configuration: Configuration, request: typeof fetch = fetch): Promise<Verification> {
  if (!isTurnstileConfigured(configuration)) return { success: false, message: HUMAN_CHECK_UNAVAILABLE };
  if (typeof token !== "string" || !token.trim() || token.length > 2048) return { success: false, message: HUMAN_CHECK_MESSAGE };
  try {
    const response = await request("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: configuration.secretKey!.trim(), response: token }),
      signal: AbortSignal.timeout(8000), cache: "no-store",
    });
    if (!response.ok) return { success: false, message: HUMAN_CHECK_UNAVAILABLE };
    const result: unknown = await response.json();
    if (!result || typeof result !== "object") return { success: false, message: HUMAN_CHECK_MESSAGE };
    const { success, hostname, action } = result as Record<string, unknown>;
    const hostnames = configuration.production ? ["eloviz.hu", "www.eloviz.hu"] : ["eloviz.hu", "www.eloviz.hu", "localhost", "127.0.0.1"];
    if (success !== true || typeof hostname !== "string" || !hostnames.includes(hostname) || action !== NEWSLETTER_TURNSTILE_ACTION) return { success: false, message: HUMAN_CHECK_MESSAGE };
    return { success: true };
  } catch {
    return { success: false, message: HUMAN_CHECK_UNAVAILABLE };
  }
}
