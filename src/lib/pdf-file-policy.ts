export const MAX_PDF_BYTES = 12 * 1024 * 1024;

export function pdfFileIssue(file: { size: number } | undefined) {
  if (!file) return "";
  if (!file.size) return "A kiválasztott fájl üres.";
  return file.size > MAX_PDF_BYTES ? "A PDF legfeljebb 12 MB lehet." : "";
}
