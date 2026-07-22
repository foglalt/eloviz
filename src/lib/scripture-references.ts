export const DETECTOR_VERSION = "hu-reference-v1";

type BookDefinition = { code: string; name: string; aliases: string[] };

const books: BookDefinition[] = [
  { code: "Gen", name: "1Mózes", aliases: ["1Mózes", "1 Mózes", "1Móz", "1 Móz", "Teremtés"] },
  { code: "Exod", name: "2Mózes", aliases: ["2Mózes", "2 Mózes", "2Móz", "2 Móz", "Kivonulás"] },
  { code: "Lev", name: "3Mózes", aliases: ["3Mózes", "3 Mózes", "3Móz", "3 Móz"] },
  { code: "Num", name: "4Mózes", aliases: ["4Mózes", "4 Mózes", "4Móz", "4 Móz"] },
  { code: "Deut", name: "5Mózes", aliases: ["5Mózes", "5 Mózes", "5Móz", "5 Móz"] },
  { code: "Josh", name: "Józsué", aliases: ["Józsué", "Józs"] },
  { code: "Judg", name: "Bírák", aliases: ["Bírák", "Bír"] },
  { code: "Ruth", name: "Ruth", aliases: ["Ruth", "Rut"] },
  { code: "1Sam", name: "1Sámuel", aliases: ["1Sámuel", "1 Sámuel", "1Sám", "1 Sám"] },
  { code: "2Sam", name: "2Sámuel", aliases: ["2Sámuel", "2 Sámuel", "2Sám", "2 Sám"] },
  { code: "1Kgs", name: "1Királyok", aliases: ["1Királyok", "1 Királyok", "1Kir", "1 Kir"] },
  { code: "2Kgs", name: "2Királyok", aliases: ["2Királyok", "2 Királyok", "2Kir", "2 Kir"] },
  { code: "Ps", name: "Zsoltárok", aliases: ["Zsoltárok", "Zsoltár", "Zsolt", "Zsolt.", "Zsol"] },
  { code: "Prov", name: "Példabeszédek", aliases: ["Példabeszédek", "Péld", "Péld."] },
  { code: "Eccl", name: "Prédikátor", aliases: ["Prédikátor", "Préd"] },
  { code: "Isa", name: "Ézsaiás", aliases: ["Ézsaiás", "Ésaiás", "Ézs", "Ésa"] },
  { code: "Jer", name: "Jeremiás", aliases: ["Jeremiás", "Jer"] },
  { code: "Ezek", name: "Ezékiel", aliases: ["Ezékiel", "Ezék"] },
  { code: "Dan", name: "Dániel", aliases: ["Dániel", "Dán"] },
  { code: "Matt", name: "Máté", aliases: ["Máté", "Mt"] },
  { code: "Mark", name: "Márk", aliases: ["Márk", "Mk"] },
  { code: "Luke", name: "Lukács", aliases: ["Lukács", "Lk"] },
  { code: "John", name: "János", aliases: ["János", "Jn"] },
  { code: "Acts", name: "Apostolok cselekedetei", aliases: ["Apostolok cselekedetei", "ApCsel", "Apcsel"] },
  { code: "Rom", name: "Róma", aliases: ["Róma", "Róm"] },
  { code: "1Cor", name: "1Korinthus", aliases: ["1Korinthus", "1 Korinthus", "1Kor", "1 Kor"] },
  { code: "2Cor", name: "2Korinthus", aliases: ["2Korinthus", "2 Korinthus", "2Kor", "2 Kor"] },
  { code: "Gal", name: "Galata", aliases: ["Galata", "Gal"] },
  { code: "Eph", name: "Efézus", aliases: ["Efézus", "Ef"] },
  { code: "Phil", name: "Filippi", aliases: ["Filippi", "Fil"] },
  { code: "Col", name: "Kolossé", aliases: ["Kolossé", "Kol"] },
  { code: "1Thess", name: "1Thesszalonika", aliases: ["1Thesszalonika", "1 Thesszalonika", "1Thessz", "1 Thessz"] },
  { code: "2Thess", name: "2Thesszalonika", aliases: ["2Thesszalonika", "2 Thesszalonika", "2Thessz", "2 Thessz"] },
  { code: "1Tim", name: "1Timóteus", aliases: ["1Timóteus", "1 Timóteus", "1Tim", "1 Tim"] },
  { code: "2Tim", name: "2Timóteus", aliases: ["2Timóteus", "2 Timóteus", "2Tim", "2 Tim"] },
  { code: "Titus", name: "Titusz", aliases: ["Titusz", "Tit"] },
  { code: "Heb", name: "Zsidók", aliases: ["Zsidók", "Zsid"] },
  { code: "Jas", name: "Jakab", aliases: ["Jakab", "Jak"] },
  { code: "1Pet", name: "1Péter", aliases: ["1Péter", "1 Péter", "1Pt", "1 Pt"] },
  { code: "2Pet", name: "2Péter", aliases: ["2Péter", "2 Péter", "2Pt", "2 Pt"] },
  { code: "1John", name: "1János", aliases: ["1János", "1 János", "1Jn", "1 Jn"] },
  { code: "2John", name: "2János", aliases: ["2János", "2 János", "2Jn", "2 Jn"] },
  { code: "3John", name: "3János", aliases: ["3János", "3 János", "3Jn", "3 Jn"] },
  { code: "Rev", name: "Jelenések", aliases: ["Jelenések", "Jelenések könyve", "Jel"] },
];

const aliasToBook = new Map<string, BookDefinition>();
for (const book of books) {
  for (const alias of book.aliases) {
    aliasToBook.set(alias.toLocaleLowerCase("hu-HU").replace(/\.$/, ""), book);
  }
}

const aliasPattern = [...aliasToBook.keys()]
  .sort((a, b) => b.length - a.length)
  .map((alias) => alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*"))
  .join("|");

const referencePattern = new RegExp(
  `(?<![\\p{L}\\p{N}])(${aliasPattern})\\.?\\s+(\\d{1,3})\\s*[:;,]\\s*(\\d{1,3})(?:\\s*[-–—]\\s*(?:(\\d{1,3})\\s*[:;,]\\s*)?(\\d{1,3}))?`,
  "giu",
);

export type DetectedReference = {
  rawText: string;
  displayLabel: string;
  bookCode: string;
  startChapter: number;
  startVerse: number;
  endChapter: number;
  endVerse: number;
  osisStart: string;
  osisEnd: string;
  pageNumber: number;
  contextSnippet: string;
};

export function detectScriptureReferences(pages: string[]) {
  const found = new Map<string, DetectedReference>();

  pages.forEach((pageText, pageIndex) => {
    for (const match of pageText.matchAll(referencePattern)) {
      const alias = match[1].toLocaleLowerCase("hu-HU").replace(/\.$/, "");
      const book = aliasToBook.get(alias);
      if (!book) continue;

      const startChapter = Number(match[2]);
      const startVerse = Number(match[3]);
      const endChapter = match[4] ? Number(match[4]) : startChapter;
      const endVerse = match[5] ? Number(match[5]) : startVerse;
      if (!isPlausibleRange(startChapter, startVerse, endChapter, endVerse)) continue;

      const osisStart = `${book.code}.${startChapter}.${startVerse}`;
      const osisEnd = `${book.code}.${endChapter}.${endVerse}`;
      const key = `${osisStart}-${osisEnd}`;
      const index = match.index ?? 0;
      const snippet = pageText.slice(Math.max(0, index - 55), Math.min(pageText.length, index + match[0].length + 75)).replace(/\s+/g, " ").trim();

      if (!found.has(key)) {
        found.set(key, {
          rawText: match[0],
          displayLabel: match[0].replace(/\s+/g, " ").trim(),
          bookCode: book.code,
          startChapter,
          startVerse,
          endChapter,
          endVerse,
          osisStart,
          osisEnd,
          pageNumber: pageIndex + 1,
          contextSnippet: snippet,
        });
      }
    }
  });

  return [...found.values()];
}

function isPlausibleRange(startChapter: number, startVerse: number, endChapter: number, endVerse: number) {
  if ([startChapter, startVerse, endChapter, endVerse].some((value) => !Number.isInteger(value) || value < 1 || value > 200)) return false;
  if (endChapter < startChapter) return false;
  return endChapter !== startChapter || endVerse >= startVerse;
}

export function parseOsisReferenceLine(line: string) {
  const [labelPart, osisPart] = line.split("|").map((part) => part.trim());
  const source = osisPart || labelPart;
  const match = source.match(/^([1-3]?[A-Za-z]+)\.(\d{1,3})\.(\d{1,3})(?:-([1-3]?[A-Za-z]+)\.(\d{1,3})\.(\d{1,3}))?$/);
  if (!match) return null;
  if (match[4] && match[4] !== match[1]) return null;

  const startChapter = Number(match[2]);
  const startVerse = Number(match[3]);
  const endChapter = match[5] ? Number(match[5]) : startChapter;
  const endVerse = match[6] ? Number(match[6]) : startVerse;
  if (!isPlausibleRange(startChapter, startVerse, endChapter, endVerse)) return null;

  return {
    displayLabel: osisPart ? labelPart : source,
    bookCode: match[1],
    startChapter,
    startVerse,
    endChapter,
    endVerse,
    osisStart: `${match[1]}.${startChapter}.${startVerse}`,
    osisEnd: `${match[1]}.${endChapter}.${endVerse}`,
  };
}
