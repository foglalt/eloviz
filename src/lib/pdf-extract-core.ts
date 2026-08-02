import {
  buildStudyArticle,
  type PdfArticleLine,
  type StudyArticle,
} from "./study-article.ts";

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

type PdfTextItem = {
  str: string;
  transform: number[];
  width: number;
  height: number;
};

function isPdfTextItem(value: unknown): value is PdfTextItem {
  return Boolean(
    value
    && typeof value === "object"
    && "str" in value
    && "transform" in value
    && Array.isArray((value as PdfTextItem).transform),
  );
}

function joinLineItems(items: PdfTextItem[]) {
  return items.toSorted((left, right) => left.transform[4] - right.transform[4]).reduce(
    (result, item, index, sorted) => {
      if (!result) return item.str.trim();
      const previous = sorted[index - 1];
      const previousEnd = previous.transform[4] + previous.width;
      const gap = item.transform[4] - previousEnd;
      const needsSpace = gap > 0.75 && !/^\s|^[,.;:!?)]/u.test(item.str);
      return `${result}${needsSpace ? " " : ""}${item.str.trim()}`;
    },
    "",
  ).replace(/\s+/g, " ").trim();
}

function groupPageLines(
  items: PdfTextItem[],
  pageNumber: number,
  pageHeight: number,
): PdfArticleLine[] {
  const sorted = items.toSorted((left, right) => (
    right.transform[5] - left.transform[5] || left.transform[4] - right.transform[4]
  ));
  const groups: PdfTextItem[][] = [];

  for (const item of sorted) {
    if (!item.str.trim()) continue;
    const y = item.transform[5];
    const group = groups.at(-1);
    const groupY = group?.[0].transform[5];
    const tolerance = Math.max(1.5, item.height * 0.2);
    if (group && groupY !== undefined && Math.abs(groupY - y) <= tolerance) group.push(item);
    else groups.push([item]);
  }

  return groups.map((group) => ({
    pageNumber,
    pageHeight,
    x: Math.min(...group.map((item) => item.transform[4])),
    y: medianNumber(group.map((item) => item.transform[5])),
    fontSize: Math.max(...group.map((item) => item.height || Math.abs(item.transform[3]) || 1)),
    text: joinLineItems(group),
  })).filter((line) => line.text);
}

function medianNumber(values: number[]) {
  const sorted = values.toSorted((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export type ExtractedPdfDocument = {
  pages: string[];
  article: StudyArticle;
};

export async function extractPdfDocument(
  buffer: Buffer,
  documentTitle?: string,
): Promise<ExtractedPdfDocument> {
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
  const articlePages: PdfArticleLine[][] = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.filter(isPdfTextItem) as PdfTextItem[];
      const viewport = page.getViewport({ scale: 1 });
      const lines = groupPageLines(textItems, pageNumber, viewport.height);
      const text = lines
        .map((line) => line.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      pages.push(text);
      articlePages.push(lines);
      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }

  return { pages, article: buildStudyArticle(articlePages, documentTitle) };
}

export async function extractPdfPages(buffer: Buffer) {
  return (await extractPdfDocument(buffer)).pages;
}
