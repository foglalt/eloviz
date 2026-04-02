"use server";

import { saveHusvetInterestContact } from "@/lib/husvet-interest-store";
import { normalizeText } from "@/lib/value-utils";
import type { InterestActionState } from "./interest-action-state";

export async function submitHusvetInterestAction(
  _previousState: InterestActionState,
  formData: FormData,
): Promise<InterestActionState> {
  const source = normalizeText(formData.get("source"));
  const name = normalizeText(formData.get("name"));
  const contact = normalizeText(formData.get("contact"));
  const note = normalizeText(formData.get("note"));

  if (source !== "quiz" && source !== "timeline") {
    return {
      status: "error",
      message: "A kapcsolatfelvételi kérés forrása nem volt értelmezhető.",
    };
  }

  if (!contact) {
    return {
      status: "error",
      message: "Adj meg egy e-mail címet vagy telefonszámot.",
    };
  }

  if (contact.length < 5) {
    return {
      status: "error",
      message: "Az elérhetőség túl rövidnek tűnik.",
    };
  }

  if (name.length > 120 || contact.length > 200 || note.length > 1200) {
    return {
      status: "error",
      message: "Az egyik megadott mező túl hosszú lett.",
    };
  }

  try {
    const savedLead = await saveHusvetInterestContact({
      source,
      name,
      contact,
      note,
    });

    return {
      status: "success",
      message:
        "Köszönjük. Rögzítettük az elérhetőségedet, és később fel tudjuk venni veled a kapcsolatot.",
      savedAt: savedLead.createdAt,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "A kapcsolatfelvétel mentése most nem sikerült.",
    };
  }
}
