export const MAX_PDF_BYTES = 12 * 1024 * 1024;

export function hasSelectedPdf(file: { name: string; size: number; type: string }) {
  // React's multipart transport can name an unselected file input "blob".
  // A deliberately selected empty PDF must still reach normal validation.
  return Boolean(file.name) && !(file.name === "blob" && file.size === 0 && file.type === "application/octet-stream");
}

export function pdfFileIssue(file: { size: number } | undefined) {
  if (!file) return "";
  if (!file.size) return "A kiválasztott fájl üres.";
  return file.size > MAX_PDF_BYTES ? "A PDF legfeljebb 12 MB lehet." : "";
}
