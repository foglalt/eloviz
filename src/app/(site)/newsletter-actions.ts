"use server";

import { parseNewsletterSignup } from "@/lib/newsletter-core";
import { headers } from "next/headers";
import { confirmNewsletterSubscription, requestNewsletterConfirmation } from "@/lib/newsletter";
import { CONFIRMATION_MESSAGE } from "@/lib/newsletter-delivery-core";
import { redirect } from "next/navigation";

export type NewsletterActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

export async function subscribeToNewsletterAction(
  _previousState: NewsletterActionState,
  formData: FormData,
): Promise<NewsletterActionState> {
  const parsed = parseNewsletterSignup({
    email: formData.get("email"),
    consent: formData.get("consent"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    if (parsed.reason === "bot") {
      return { status: "success", message: CONFIRMATION_MESSAGE };
    }
    return { status: "error", message: parsed.message };
  }

  try {
    const requestHeaders = await headers();
    await requestNewsletterConfirmation(parsed.email, requestHeaders.get("x-vercel-forwarded-for") ?? requestHeaders.get("x-real-ip") ?? "local");
    return {
      status: "success",
      message: CONFIRMATION_MESSAGE,
    };
  } catch (error) {
    console.error("Newsletter signup failed.", error instanceof Error ? error.message : "Unknown error");
    return {
      status: "error",
      message: "A feliratkozást most nem tudtuk rögzíteni. Kérjük, próbáld meg később.",
    };
  }
}

export async function confirmNewsletterAction(formData: FormData) {
  const token = formData.get("token");
  let result = "expired";
  try {
    if (typeof token === "string" && await confirmNewsletterSubscription(token)) result = "confirmed";
  } catch {
    result = "error";
  }
  redirect(`/feliratkozas?result=${result}`);
}
