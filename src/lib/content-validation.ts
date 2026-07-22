import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyHungarian(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export const topicInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2, "A cím legalább 2 karakter legyen.").max(120),
  slug: z.string().trim().regex(slugPattern, "A slug csak kisbetűt, számot és kötőjelet tartalmazhat.").max(120),
  description: z.string().trim().min(20, "A leírás legalább 20 karakter legyen.").max(1200),
  seoTitle: z.string().trim().max(70).optional().default(""),
  seoDescription: z.string().trim().max(170).optional().default(""),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0).max(10000),
});

export const studyInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().regex(slugPattern).max(120),
  summary: z.string().trim().min(30, "Az összefoglaló legalább 30 karakter legyen.").max(1500),
  seoTitle: z.string().trim().max(70).optional().default(""),
  seoDescription: z.string().trim().max(170).optional().default(""),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0).max(10000),
  topicIds: z.array(z.string().uuid()).max(30),
  relatedVideoIds: z.array(z.string().uuid()).max(30),
});

export const videoInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().regex(slugPattern).max(120),
  description: z.string().trim().min(30, "A leírás legalább 30 karakter legyen.").max(3000),
  youtubeUrl: z.string().url(),
  youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
  channelName: z.string().trim().max(160).optional().default(""),
  seoTitle: z.string().trim().max(70).optional().default(""),
  seoDescription: z.string().trim().max(170).optional().default(""),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0).max(10000),
  topicIds: z.array(z.string().uuid()).max(30),
  relatedStudyIds: z.array(z.string().uuid()).max(30),
});

export function parseYouTubeId(input: string) {
  try {
    const url = new URL(input.trim());
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let id = "";

    if (host === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (url.pathname === "/watch") {
        id = url.searchParams.get("v") ?? "";
      } else {
        const parts = url.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].includes(parts[0] ?? "")) {
          id = parts[1] ?? "";
        }
      }
    }

    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function sanitizePdfFilename(input: string) {
  const base = input.split(/[\\/]/).pop() ?? "tanulmany.pdf";
  const safe = base.replace(/[^\p{L}\p{N}._ -]+/gu, "").trim().slice(0, 140);
  return safe.toLowerCase().endsWith(".pdf") ? safe : `${safe || "tanulmany"}.pdf`;
}
