export type PortableSubscriber = {
  id: string;
  email: string;
  status: "pending" | "subscribed" | "unsubscribed";
  consentedAt: string;
  confirmedAt: string | null;
  updatedAt: string;
};
export type ExportContact = { id: string; email: string; unsubscribed: boolean };
export type ExportSuppression = { id: string; email: string; origin: string };
export type ExportPage<T> = { data: T[]; has_more: boolean };

export async function collectExportPages<T extends { id: string }>(
  fetchPage: (after?: string) => Promise<ExportPage<T>>,
) {
  const records: T[] = [];
  const seen = new Set<string>();
  let after: string | undefined;
  for (;;) {
    const page = await fetchPage(after);
    if (!Array.isArray(page.data) || typeof page.has_more !== "boolean") throw new Error("Invalid export page.");
    for (const record of page.data) {
      if (!record.id || seen.has(record.id)) throw new Error("Export pagination changed; retry the snapshot.");
      seen.add(record.id);
      records.push(record);
    }
    if (!page.has_more) return records;
    if (!page.data.length) throw new Error("Incomplete export page.");
    after = page.data[page.data.length - 1].id;
  }
}

export function reconcileNewsletterExport(subscribers: PortableSubscriber[], contacts: ExportContact[],
  members: ExportContact[], suppressions: ExportSuppression[]) {
  const normalize = (email: string) => email.trim().toLowerCase();
  const contactGroups = new Map<string, ExportContact[]>();
  for (const contact of contacts) {
    if (typeof contact.email !== "string" || typeof contact.unsubscribed !== "boolean") throw new Error("Invalid provider contact.");
    const email = normalize(contact.email);
    contactGroups.set(email, [...(contactGroups.get(email) ?? []), contact]);
  }
  const membership = new Set(members.map((contact) => normalize(contact.email)));
  const memberOptOuts = new Set(members.filter((contact) => contact.unsubscribed).map((contact) => normalize(contact.email)));
  const blocked = new Map<string, Set<string>>();
  for (const suppression of suppressions) {
    const email = normalize(suppression.email);
    const reasons = blocked.get(email) ?? new Set<string>();
    reasons.add(`suppression:${suppression.origin}`);
    blocked.set(email, reasons);
  }
  const seen = new Set<string>();
  return subscribers.map((subscriber) => {
    const email = normalize(subscriber.email);
    if (seen.has(email)) throw new Error("Duplicate local email in migration export.");
    seen.add(email);
    const matches = contactGroups.get(email) ?? [];
    const reasons = [...(blocked.get(email) ?? [])];
    if (subscriber.status === "unsubscribed") reasons.push("local_unsubscribe");
    if (matches.some((contact) => contact.unsubscribed) || memberOptOuts.has(email)) reasons.push("provider_unsubscribe");
    if (reasons.length) return { ...subscriber, email, eligibility: "blocked" as const, reasons };
    if (subscriber.status === "pending") return { ...subscriber, email, eligibility: "pending" as const, reasons: ["confirmation_pending"] };
    if (!subscriber.confirmedAt) reasons.push("confirmation_evidence_missing");
    if (!matches.length) reasons.push("provider_contact_missing");
    if (matches.length > 1) reasons.push("provider_email_conflict");
    if (!membership.has(email)) reasons.push("newsletter_membership_missing");
    return { ...subscriber, email, eligibility: reasons.length ? "review" as const : "eligible" as const, reasons };
  });
}
