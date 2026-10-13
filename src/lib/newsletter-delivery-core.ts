export type DigestItem = {
  id: string;
  kind: "study" | "video";
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  seriesTitle?: string;
  seriesId?: string;
  position?: number;
};

export const CONFIRMATION_MESSAGE = "Ha a cím még nincs feliratkozva, elküldtük a megerősítő levelet. A feliratkozás befejezéséhez nyisd meg a levelet, és erősítsd meg a kérésedet. Ellenőrizd a levélszemét mappát is.";
export const UNSUBSCRIBE_PLACEHOLDER = "{{{RESEND_UNSUBSCRIBE_URL}}}";

export function isConfirmationToken(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

// The latest Sunday 18:00 UTC is stable across retries and Budapest DST changes.
export function digestPeriod(now = new Date()) {
  const end = new Date(now);
  end.setUTCHours(18, 0, 0, 0);
  end.setUTCDate(end.getUTCDate() - end.getUTCDay());
  if (end > now) end.setUTCDate(end.getUTCDate() - 7);
  return { start: new Date(end.getTime() - 7 * 86400000), end };
}

export function escapeEmailHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export function itemUrl(item: DigestItem) {
  return `https://www.eloviz.hu/${item.kind === "study" ? "tanulmanyok" : "videok"}/${encodeURIComponent(item.slug)}`;
}

export function orderDigestItems(items: DigestItem[]) {
  const groups = new Map<string, number>();
  for (const item of items) {
    if (item.seriesId) groups.set(item.seriesId, Math.min(groups.get(item.seriesId) ?? Infinity, new Date(item.publishedAt).getTime()));
  }
  return [...items].sort((a, b) => {
    if (a.seriesId && a.seriesId === b.seriesId) return (a.position ?? 0) - (b.position ?? 0);
    const aTime = a.seriesId ? groups.get(a.seriesId)! : new Date(a.publishedAt).getTime();
    const bTime = b.seriesId ? groups.get(b.seriesId)! : new Date(b.publishedAt).getTime();
    return aTime - bTime || (a.seriesId ?? a.id).localeCompare(b.seriesId ?? b.id);
  });
}

export function renderDigest(items: DigestItem[], end: Date) {
  const date = new Intl.DateTimeFormat("hu-HU", { timeZone: "Europe/Budapest", month: "long", day: "numeric" }).format(end);
  const subject = `Élő Víz · Heti újdonságok · ${date}`;
  const intro = "Az elmúlt hét új tanulmányai és videói. Válaszd ki, ami most megszólít.";
  const context = (item: DigestItem) => item.seriesTitle ? `${item.seriesTitle} · ${item.position}. rész` : item.kind === "study" ? "Tanulmány" : "Videó";
  const text = `${subject}\n\n${intro}\n\n${items.map((item) => `${context(item)}\n${item.title}\n${item.summary}\n${itemUrl(item)}`).join("\n\n")}\n\nÉlő Víz · https://www.eloviz.hu\nLeiratkozás: ${UNSUBSCRIBE_PLACEHOLDER}`;
  const html = `<!doctype html><html lang="hu"><body style="margin:0;background:#f7f5ee;color:#193f3d;font-family:Arial,sans-serif"><table role="presentation" width="100%"><tr><td style="padding:32px 16px"><table role="presentation" style="max-width:600px;margin:auto;width:100%"><tr><td><a href="https://www.eloviz.hu" style="color:#164e49;font-size:26px;font-weight:bold;text-decoration:none">Élő Víz</a><h1 style="font-size:24px;margin:32px 0 16px">Heti újdonságok</h1><p style="line-height:1.7">${intro}</p>${items.map((item) => `<div style="border-top:1px solid #cddbd5;padding:24px 0"><p style="font-size:13px">${escapeEmailHtml(context(item))}</p><h2 style="font-size:20px"><a href="${itemUrl(item)}" style="color:#164e49">${escapeEmailHtml(item.title)}</a></h2><p style="line-height:1.7">${escapeEmailHtml(item.summary)}</p><a href="${itemUrl(item)}" style="color:#164e49">${item.kind === "study" ? "Elolvasom a tanulmányt" : "Megnézem a videót"} →</a></div>`).join("")}<p style="border-top:1px solid #cddbd5;padding-top:24px;font-size:13px;line-height:1.7">Ezt a levelet az Élő Víz heti értesítőjére való feliratkozásod miatt kapod.<br><a href="${UNSUBSCRIBE_PLACEHOLDER}" style="color:#164e49">Leiratkozom az értesítőről</a></p></td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}

export function providerDeliveryState(status: string, localStatus: string) {
  if (["sent", "queued", "scheduled"].includes(status)) return "sent";
  if (status !== "draft") return "review";
  // A send request whose result was lost requires review, never a blind resend.
  return localStatus === "sending" || localStatus === "review" ? "review" : "draft";
}
