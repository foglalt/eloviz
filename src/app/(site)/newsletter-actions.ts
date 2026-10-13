"use server";

import { parseNewsletterSignup } from "@/lib/newsletter-core";
import { saveNewsletterSubscriber } from "@/lib/newsletter";

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
      return { status: "success", message: "Köszönjük! Feliratkozásodat rögzítettük." };
    }
    return { status: "error", message: parsed.message };
  }

  try {
    await saveNewsletterSubscriber(parsed.email);
    return {
      status: "success",
      message: "Köszönjük! Értesítünk, amikor új tartalommal bővül az oldal.",
    };
  } catch (error) {
    console.error("Newsletter signup failed.", error);
    return {
      status: "error",
      message: "A feliratkozást most nem tudtuk rögzíteni. Kérjük, próbáld meg később.",
    };
  }
}
