"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
  isAdminPasswordConfigured,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { parseHusvetQuizContentInput } from "@/lib/husvet-quiz";
import { saveHusvetQuizContent } from "@/lib/husvet-quiz-store";
import type { AdminActionState } from "./action-state";

export async function loginAdminAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!isAdminPasswordConfigured()) {
    return {
      status: "error",
      message: "Az ADMIN_PASSWORD környezeti változó nincs beállítva.",
    };
  }

  const passwordAttempt = String(formData.get("password") ?? "");

  if (!verifyAdminPassword(passwordAttempt)) {
    return {
      status: "error",
      message: "Hibás jelszó.",
    };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function saveQuizContentAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminAuthenticated())) {
    return {
      status: "error",
      message: "A munkamenet lejárt. Jelentkezz be újra.",
    };
  }

  const payloadText = formData.get("payload");

  if (typeof payloadText !== "string") {
    return {
      status: "error",
      message: "A mentési kérés nem tartalmazott feldolgozható adatot.",
    };
  }

  let payload: unknown;

  try {
    payload = JSON.parse(payloadText);
  } catch {
    return {
      status: "error",
      message: "A kérdések mentési adata sérült vagy hiányos.",
    };
  }

  const parsed = parseHusvetQuizContentInput(payload);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.message,
    };
  }

  try {
    const savedContent = await saveHusvetQuizContent(parsed.data);

    revalidatePath("/");
    revalidatePath("/kviz");
    revalidatePath("/admin");

    return {
      status: "success",
      message: "A kérdések mentése sikerült.",
      savedAt: savedContent.updatedAt ?? new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "A mentés sikertelen volt. Ellenőrizd a Neon kapcsolatot.",
    };
  }
}
