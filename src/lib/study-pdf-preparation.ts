import "server-only";
import { pdfFileIssue } from "./pdf-file-policy";
import { validatePdfBuffer, sha256 } from "./document-storage";
import { extractPdfDocument } from "./pdf-extract";
import { sanitizePdfFilename } from "./content-validation";
import { detectScriptureReferences, mergeScriptureReferenceRanges } from "./scripture-references";
import type { PreparedStudyPdf } from "./study-save-queries";

export async function prepareStudyPdf(file: File, title: string): Promise<PreparedStudyPdf> {
  const issue = pdfFileIssue(file);
  if (issue) throw new Error(issue);
  const buffer = Buffer.from(await file.arrayBuffer());
  validatePdfBuffer(buffer);
  const filename = sanitizePdfFilename(file.name);
  let extraction: Awaited<ReturnType<typeof extractPdfDocument>>;
  try { extraction = await extractPdfDocument(buffer, title); }
  catch (error) {
    console.error("PDF text extraction failed", { filename, byteSize: buffer.length, error: error instanceof Error ? error.message : String(error) });
    throw new Error("A PDF szövege nem olvasható ki automatikusan. Tölts fel géppel olvasható szövegréteget tartalmazó PDF-et.");
  }
  if (extraction.pages.join(" ").trim().length < 40) throw new Error("A PDF nem tartalmaz elegendő géppel olvasható szöveget. Tölts fel szövegréteget tartalmazó PDF-et.");
  const candidates = detectScriptureReferences(extraction.pages);
  return { buffer, filename, hash: sha256(buffer), extraction, candidates, finalizedReferences: mergeScriptureReferenceRanges(candidates) };
}
