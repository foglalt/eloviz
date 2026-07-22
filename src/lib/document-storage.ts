import "server-only";
import { del, get, put } from "@vercel/blob";
import { createHash } from "node:crypto";
import { isBlobStorageConfigured } from "@/lib/blob-storage-config";

export const MAX_PDF_BYTES = 12 * 1024 * 1024;

export function validatePdfBuffer(buffer: Buffer) {
  if (buffer.length === 0) throw new Error("Az üres fájl nem tölthető fel.");
  if (buffer.length > MAX_PDF_BYTES) throw new Error("A PDF legfeljebb 12 MB lehet.");
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error("A fájl tartalma nem érvényes PDF.");
}

export function sha256(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export async function storePdf(buffer: Buffer, studyId: string, filename: string) {
  if (isBlobStorageConfigured()) {
    const result = await put(`studies/${studyId}/${filename}`, buffer, {
      access: "private",
      addRandomSuffix: true,
      contentType: "application/pdf",
    });
    return { storageKind: "blob" as const, storageKey: result.pathname, fileData: null };
  }

  return {
    storageKind: "database" as const,
    storageKey: `database:${studyId}:${sha256(buffer).slice(0, 16)}`,
    fileData: buffer,
  };
}

export async function getBlobPdf(pathname: string) {
  return get(pathname, { access: "private", useCache: true });
}

export async function deleteBlobPdf(pathname: string) {
  if (isBlobStorageConfigured()) await del(pathname);
}
