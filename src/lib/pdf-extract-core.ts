async function ensurePdfJsNodeGlobals() {
  const canvas = await import("@napi-rs/canvas");
  const runtime = globalThis as Record<string, unknown>;

  runtime.DOMMatrix ??= canvas.DOMMatrix;
  runtime.Path2D ??= canvas.Path2D;
  runtime.ImageData ??= canvas.ImageData;

  // PDF.js falls back to this worker in Node. Keep the import explicit so
  // Next.js includes it in the deployed server bundle instead of leaving a
  // runtime-relative import that fails inside a Vercel function.
  await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
}

export async function extractPdfPages(buffer: Buffer) {
  await ensurePdfJsNodeGlobals();

  // Import PDF.js only after its Node canvas globals exist. Vercel otherwise
  // omits the optional canvas package and PDF.js fails before parsing the file.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableFontFace: true,
    useSystemFonts: true,
  });
  const document = await loadingTask.promise;
  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      pages.push(text);
      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }

  return pages;
}
