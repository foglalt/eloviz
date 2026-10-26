import "server-only";
import { isTurnstileConfigured, verifyNewsletterHuman } from "./newsletter-human-core";

function configuration() {
  return {
    siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim(),
    secretKey: process.env.TURNSTILE_SECRET_KEY?.trim(),
    production: process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL_ENV),
  };
}

export function newsletterHumanCheckConfigured() {
  return isTurnstileConfigured(configuration());
}

export function verifyNewsletterSignupHuman(token: unknown) {
  return verifyNewsletterHuman(token, configuration());
}
