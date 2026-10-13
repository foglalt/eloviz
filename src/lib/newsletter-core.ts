import { z } from "zod";

const emailSchema = z.string()
  .trim()
  .min(1, "Add meg az e-mail-címed.")
  .max(254, "Az e-mail-cím túl hosszú.")
  .email("Adj meg egy érvényes e-mail-címet.");

export type NewsletterSignupInput = {
  email: unknown;
  consent: unknown;
  website: unknown;
};

export type NewsletterSignupResult =
  | { success: true; email: string }
  | { success: false; reason: "invalid" | "consent" | "bot"; message: string };

export function parseNewsletterSignup(input: NewsletterSignupInput): NewsletterSignupResult {
  const website = typeof input.website === "string" ? input.website.trim() : "";
  if (website) {
    return { success: false, reason: "bot", message: "A feliratkozás nem sikerült." };
  }

  const parsedEmail = emailSchema.safeParse(input.email);
  if (!parsedEmail.success) {
    return {
      success: false,
      reason: "invalid",
      message: parsedEmail.error.issues[0]?.message ?? "Adj meg egy érvényes e-mail-címet.",
    };
  }

  if (input.consent !== "on") {
    return {
      success: false,
      reason: "consent",
      message: "A feliratkozáshoz erősítsd meg a hozzájárulásodat.",
    };
  }

  return { success: true, email: parsedEmail.data.toLowerCase() };
}
