import "server-only";
import { del, get, put } from "@vercel/blob";
import { createHash } from "node:crypto";
import {
  blobAuthOptions,
  resolveBlobStorageAuth,
  resolvePdfStorageAuth,
  type BlobStorageAuth,
} from "@/lib/blob-storage-config";

export const MAX_PDF_BYTES = 12 * 1024 * 1024;

export function validatePdfBuffer(buffer: Buffer) {
  if (buffer.length === 0) throw new Error("Az üres fájl nem tölthető fel.");
  if (buffer.length > MAX_PDF_BYTES) throw new Error("A PDF legfeljebb 12 MB lehet.");
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error("A fájl tartalma nem érvényes PDF.");
}

export function sha256(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function requireBlobStorageAuth(): Exclude<BlobStorageAuth, { kind: "database" }> {
  const auth = resolveBlobStorageAuth();
  if (auth.kind === "database") {
    throw new Error("A Vercel Blob hitelesítése nincs beállítva.");
  }
  return auth;
}

export async function storePdf(buffer: Buffer, studyId: string, filename: string) {
  const auth = resolvePdfStorageAuth();
  if (auth.kind !== "database") {
    const result = await put(`studies/${studyId}/${filename}`, buffer, {
      access: "private",
      addRandomSuffix: true,
      contentType: "application/pdf",
      ...blobAuthOptions(auth),
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
  const auth = requireBlobStorageAuth();
  return get(pathname, { access: "private", useCache: true, ...blobAuthOptions(auth) });
}

export async function deleteBlobPdf(pathname: string) {
  const auth = requireBlobStorageAuth();
  await del(pathname, blobAuthOptions(auth));
}
