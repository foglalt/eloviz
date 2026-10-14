export const DETECTOR_VERSION = "hu-reference-v4";

type BookDefinition = {
  code: string;
  label: string;
  aliases: string[];
};

function defineBook(code: string, label: string, ...aliases: string[]): BookDefinition {
  return { code, label, aliases: [label, ...aliases] };
}

const books: BookDefinition[] = [
  defineBook("Gen", "1Móz", "1Mózes", "1 Mózes", "1 Móz", "Teremtés"),
  defineBook("Exod", "2Móz", "2Mózes", "2 Mózes", "2 Móz", "Kivonulás"),
  defineBook("Lev", "3Móz", "3Mózes", "3 Mózes", "3 Móz", "Leviticus"),
  defineBook("Num", "4Móz", "4Mózes", "4 Mózes", "4 Móz", "Számok"),
  defineBook("Deut", "5Móz", "5Mózes", "5 Mózes", "5 Móz", "Második törvénykönyv"),
  defineBook("Josh", "Józs", "Józsué"),
  defineBook("Judg", "Bír", "Bírák"),
  defineBook("Ruth", "Ruth", "Rut"),
  defineBook("1Sam", "1Sám", "1Sámuel", "1 Sámuel", "1 Sám"),
  defineBook("2Sam", "2Sám", "2Sámuel", "2 Sámuel", "2 Sám"),
  defineBook("1Kgs", "1Kir", "1Királyok", "1 Királyok", "1 Kir"),
  defineBook("2Kgs", "2Kir", "2Királyok", "2 Királyok", "2 Kir"),
  defineBook("1Chr", "1Krón", "1Krónikák", "1 Krónikák", "1 Krón"),
  defineBook("2Chr", "2Krón", "2Krónikák", "2 Krónikák", "2 Krón"),
  defineBook("Ezra", "Ezsd", "Ezsdrás"),
  defineBook("Neh", "Neh", "Nehémiás"),
  defineBook("Esth", "Eszt", "Eszter"),
  defineBook("Job", "Jób"),
  defineBook("Ps", "Zsolt", "Zsoltárok", "Zsoltár", "Zsol"),
  defineBook("Prov", "Péld", "Példabeszédek"),
  defineBook("Eccl", "Préd", "Prédikátor"),
  defineBook("Song", "Énekek", "Énekek éneke", "Én"),
  defineBook("Isa", "Ézs", "Ézsaiás", "Ésaiás", "Ésa"),
  defineBook("Jer", "Jer", "Jeremiás"),
  defineBook("Lam", "JSir", "Jeremiás siralmai", "Siralmak"),
  defineBook("Ezek", "Ezék", "Ezékiel"),
  defineBook("Dan", "Dán", "Dániel"),
  defineBook("Hos", "Hós", "Hóseás"),
  defineBook("Joel", "Jóel"),
  defineBook("Amos", "Ám", "Ámós", "Am"),
  defineBook("Obad", "Abd", "Abdiás"),
  defineBook("Jonah", "Jón", "Jónás"),
  defineBook("Mic", "Mik", "Mikeás"),
  defineBook("Nah", "Náh", "Náhum"),
  defineBook("Hab", "Hab", "Habakuk"),
  defineBook("Zeph", "Zof", "Zofóniás"),
  defineBook("Hag", "Agg", "Aggeus"),
  defineBook("Zech", "Zak", "Zakariás"),
  defineBook("Mal", "Mal", "Malakiás"),
  defineBook("Matt", "Mt", "Máté"),
  defineBook("Mark", "Mk", "Márk"),
  defineBook("Luke", "Lk", "Lukács"),
  defineBook("John", "Jn", "János"),
  defineBook("Acts", "ApCsel", "Apostolok cselekedetei", "Apcsel"),
  defineBook("Rom", "Róm", "Róma"),
  defineBook("1Cor", "1Kor", "1Korinthus", "1 Korinthus", "1 Kor"),
  defineBook("2Cor", "2Kor", "2Korinthus", "2 Korinthus", "2 Kor"),
  defineBook("Gal", "Gal", "Galata"),
  defineBook("Eph", "Ef", "Efézus"),
  defineBook("Phil", "Fil", "Filippi"),
  defineBook("Col", "Kol", "Kolossé"),
  defineBook("1Thess", "1Thessz", "1Thesszalonika", "1 Thesszalonika", "1 Thessz"),
  defineBook("2Thess", "2Thessz", "2Thesszalonika", "2 Thesszalonika", "2 Thessz"),
  defineBook("1Tim", "1Tim", "1Timóteus", "1 Timóteus", "1Timótheus", "1 Timótheus", "1 Tim"),
  defineBook("2Tim", "2Tim", "2Timóteus", "2 Timóteus", "2Timótheus", "2 Timótheus", "2 Tim"),
  defineBook("Titus", "Tit", "Titusz"),
  defineBook("Phlm", "Filem", "Filemon", "Filemón"),
  defineBook("Heb", "Zsid", "Zsidók"),
  defineBook("Jas", "Jak", "Jakab"),
  defineBook("1Pet", "1Pt", "1Péter", "1 Péter", "1 Pt"),
  defineBook("2Pet", "2Pt", "2Péter", "2 Péter", "2 Pt"),
  defineBook("1John", "1Jn", "1János", "1 János", "1 Jn"),
  defineBook("2John", "2Jn", "2János", "2 János", "2 Jn"),
  defineBook("3John", "3Jn", "3János", "3 János", "3 Jn"),
  defineBook("Jude", "Júd", "Júdás"),
  defineBook("Rev", "Jel", "Jelenések", "Jelenések könyve"),
];

const bookByCode = new Map(books.map((book) => [book.code, book]));
const bookOrderByCode = new Map(books.map((book, index) => [book.code, index]));
const aliasToBook = new Map<string, BookDefinition>();

function normalizeAlias(alias: string) {
  return alias.toLocaleLowerCase("hu-HU").replace(/\.$/, "");
}

for (const book of books) {
  for (const alias of book.aliases) aliasToBook.set(normalizeAlias(alias), book);
}

const aliasPattern = [...aliasToBook.keys()]
  .sort((a, b) => b.length - a.length)
  .map((alias) => alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*"))
  .join("|");

const referencePattern = new RegExp(
  `(?<![\\p{L}\\p{N}])(${aliasPattern})\\.?\\s*\\)?\\s+(\\d{1,3})\\s*[:;,]\\s*(\\d{1,3})(?:\\s*[-–—]\\s*(?:(\\d{1,3})\\s*:\\s*)?(\\d{1,3}))?`,
  "giu",
);

const referenceQueryPattern = new RegExp(
  `^(${aliasPattern})\\.?\\s+(\\d{1,3})\\s*[:;,]\\s*(\\d{1,3})(?:\\s*[-–—]\\s*(?:(\\d{1,3})\\s*[:;,]\\s*)?(\\d{1,3}))?$`,
  "iu",
);

const osisPointPattern = /^([1-3]?[A-Za-z]+)\.(\d{1,3})\.(\d{1,3})$/;
const referenceStartPattern = new RegExp(`^${referencePattern.source}`, "iu");
const referenceContinuationPattern = /^\s*([,;])\s*(\d{1,3})(?:\s*:\s*(\d{1,3}))?(?:\s*[-–—]\s*(?:(\d{1,3})\s*:\s*)?(\d{1,3}))?(?!\d)/u;
const singleChapterBooks = new Set(["Obad", "Phlm", "2John", "3John", "Jude"]);
const singleChapterAliases = books.filter((book) => singleChapterBooks.has(book.code))
  .flatMap((book) => book.aliases).sort((left, right) => right.length - left.length)
  .map((alias) => alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*")).join("|");
const singleChapterReferencePattern = new RegExp(
  `(?<![\\p{L}\\p{N}])(${singleChapterAliases})\\.?\\s+(\\d{1,3})(?:\\s*[-–—]\\s*(\\d{1,3}))?(?![\\p{L}\\p{N}]|\\s*[:;,]\\s*\\d)`, "giu",
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

export type ScriptureReferenceRange = Pick<
  DetectedReference,
  | "displayLabel"
  | "bookCode"
  | "startChapter"
  | "startVerse"
  | "endChapter"
  | "endVerse"
  | "osisStart"
  | "osisEnd"
>;

type IndexedRange = {
  range: ScriptureReferenceRange;
  firstIndex: number;
};

function comparePoints(
  leftChapter: number,
  leftVerse: number,
  rightChapter: number,
  rightVerse: number,
) {
  return leftChapter - rightChapter || leftVerse - rightVerse;
}

function canonicalizeRange(range: ScriptureReferenceRange): ScriptureReferenceRange {
  return {
    ...range,
    displayLabel: formatHungarianReference(
      range.bookCode,
      range.startChapter,
      range.startVerse,
      range.endChapter,
      range.endVerse,
    ) ?? range.displayLabel,
    osisStart: `${range.bookCode}.${range.startChapter}.${range.startVerse}`,
    osisEnd: `${range.bookCode}.${range.endChapter}.${range.endVerse}`,
  };
}

function rangesOverlapOrAreAdjacent(
  current: ScriptureReferenceRange,
  next: ScriptureReferenceRange,
) {
  const startComparedWithEnd = comparePoints(
    next.startChapter,
    next.startVerse,
    current.endChapter,
    current.endVerse,
  );
  if (startComparedWithEnd <= 0) return true;

  return next.startChapter === current.endChapter
    && next.startVerse === current.endVerse + 1;
}

export function mergeScriptureReferenceRanges(
  references: readonly ScriptureReferenceRange[],
) {
  const rangesByBook = new Map<string, IndexedRange[]>();

  references.forEach((reference, index) => {
    const ranges = rangesByBook.get(reference.bookCode) ?? [];
    ranges.push({ range: canonicalizeRange(reference), firstIndex: index });
    rangesByBook.set(reference.bookCode, ranges);
  });

  const merged: IndexedRange[] = [];
  for (const ranges of rangesByBook.values()) {
    ranges.sort((left, right) => (
      comparePoints(
        left.range.startChapter,
        left.range.startVerse,
        right.range.startChapter,
        right.range.startVerse,
      )
      || comparePoints(
        left.range.endChapter,
        left.range.endVerse,
        right.range.endChapter,
        right.range.endVerse,
      )
    ));

    let current = ranges[0];
    if (!current) continue;

    for (const next of ranges.slice(1)) {
      if (!rangesOverlapOrAreAdjacent(current.range, next.range)) {
        merged.push(current);
        current = next;
        continue;
      }

      const nextExtendsRange = comparePoints(
        next.range.endChapter,
        next.range.endVerse,
        current.range.endChapter,
        current.range.endVerse,
      ) > 0;
      current = {
        firstIndex: Math.min(current.firstIndex, next.firstIndex),
        range: canonicalizeRange({
          ...current.range,
          endChapter: nextExtendsRange ? next.range.endChapter : current.range.endChapter,
          endVerse: nextExtendsRange ? next.range.endVerse : current.range.endVerse,
        }),
      };
    }
    merged.push(current);
  }

  return merged
    .sort((left, right) => left.firstIndex - right.firstIndex)
    .map(({ range }) => range);
}

export function formatHungarianReference(
  bookCode: string,
  startChapter: number,
  startVerse: number,
  endChapter = startChapter,
  endVerse = startVerse,
) {
  const book = bookByCode.get(bookCode);
  if (!book || !isPlausibleRange(startChapter, startVerse, endChapter, endVerse)) return null;

  const start = `${book.label} ${startChapter}:${startVerse}`;
  if (startChapter === endChapter && startVerse === endVerse) return start;
  if (startChapter === endChapter) return `${start}-${endVerse}`;
  return `${start}-${endChapter}:${endVerse}`;
}

export function formatOsisReference(osisStart: string, osisEnd = osisStart) {
  const start = osisStart.match(osisPointPattern);
  const end = osisEnd.match(osisPointPattern);
  if (!start || !end || start[1] !== end[1]) return null;

  return formatHungarianReference(
    start[1],
    Number(start[2]),
    Number(start[3]),
    Number(end[2]),
    Number(end[3]),
  );
}

export function normalizeScriptureReferenceQuery(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 80);
}

export function parseScriptureReferenceQuery(value: string): ScriptureReferenceRange | null {
  const query = normalizeScriptureReferenceQuery(value);
  const match = query.match(referenceQueryPattern);
  if (!match) return null;

  const book = aliasToBook.get(normalizeAlias(match[1]));
  if (!book) return null;

  const startChapter = Number(match[2]);
  const startVerse = Number(match[3]);
  const endChapter = match[4] ? Number(match[4]) : startChapter;
  const endVerse = match[5] ? Number(match[5]) : startVerse;
  const displayLabel = formatHungarianReference(
    book.code,
    startChapter,
    startVerse,
    endChapter,
    endVerse,
  );
  if (!displayLabel) return null;

  return {
    displayLabel,
    bookCode: book.code,
    startChapter,
    startVerse,
    endChapter,
    endVerse,
    osisStart: `${book.code}.${startChapter}.${startVerse}`,
    osisEnd: `${book.code}.${endChapter}.${endVerse}`,
  };
}

export function scriptureReferenceRangesOverlap(
  left: { osisStart: string; osisEnd?: string },
  right: { osisStart: string; osisEnd?: string },
) {
  const leftStart = left.osisStart.match(osisPointPattern);
  const leftEnd = (left.osisEnd ?? left.osisStart).match(osisPointPattern);
  const rightStart = right.osisStart.match(osisPointPattern);
  const rightEnd = (right.osisEnd ?? right.osisStart).match(osisPointPattern);

  if (
    !leftStart
    || !leftEnd
    || !rightStart
    || !rightEnd
    || leftStart[1] !== leftEnd[1]
    || rightStart[1] !== rightEnd[1]
    || leftStart[1] !== rightStart[1]
  ) {
    return false;
  }

  return comparePoints(
    Number(leftStart[2]),
    Number(leftStart[3]),
    Number(rightEnd[2]),
    Number(rightEnd[3]),
  ) <= 0 && comparePoints(
    Number(leftEnd[2]),
    Number(leftEnd[3]),
    Number(rightStart[2]),
    Number(rightStart[3]),
  ) >= 0;
}

export function sortScriptureReferencesInBibleOrder<T extends { osisStart: string }>(
  references: readonly T[],
) {
  return references
    .map((reference, index) => {
      const point = reference.osisStart.match(osisPointPattern);
      return {
        reference,
        index,
        bookOrder: point ? (bookOrderByCode.get(point[1]) ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER,
        chapter: point ? Number(point[2]) : Number.MAX_SAFE_INTEGER,
        verse: point ? Number(point[3]) : Number.MAX_SAFE_INTEGER,
      };
    })
    .sort((left, right) => (
      left.bookOrder - right.bookOrder
      || left.chapter - right.chapter
      || left.verse - right.verse
      || left.index - right.index
    ))
    .map(({ reference }) => reference);
}

export function detectScriptureReferences(pages: string[]) {
  const found = new Map<string, DetectedReference>();

  pages.forEach((pageText, pageIndex) => {
    const matches = [
      ...[...pageText.matchAll(referencePattern)].map((match) => ({ match, singleChapter: false })),
      ...[...pageText.matchAll(singleChapterReferencePattern)].map((match) => ({ match, singleChapter: true })),
    ].sort((left, right) => (left.match.index ?? 0) - (right.match.index ?? 0));
    for (const { match, singleChapter } of matches) {
      if (singleChapter) {
        const book = aliasToBook.get(normalizeAlias(match[1]));
        if (!book) continue;
        const verse = Number(match[2]);
        const endVerse = Number(match[3] ?? match[2]);
        const label = formatHungarianReference(book.code, 1, verse, 1, endVerse);
        if (!label) continue;
        const start = `${book.code}.1.${verse}`;
        const end = `${book.code}.1.${endVerse}`;
        const key = `${start}-${end}`;
        const index = match.index ?? 0;
        if (!found.has(key)) found.set(key, {
          rawText: match[0], displayLabel: label, bookCode: book.code,
          startChapter: 1, startVerse: verse, endChapter: 1, endVerse,
          osisStart: start, osisEnd: end, pageNumber: pageIndex + 1,
          contextSnippet: pageText.slice(Math.max(0, index - 55), index + match[0].length + 75).replace(/\s+/g, " ").trim(),
        });
        continue;
      }
      const book = aliasToBook.get(normalizeAlias(match[1]));
      if (!book) continue;

      const startChapter = Number(match[2]);
      const startVerse = Number(match[3]);
      const endChapter = match[4] ? Number(match[4]) : startChapter;
      const endVerse = match[5] ? Number(match[5]) : startVerse;
      const displayLabel = formatHungarianReference(
        book.code,
        startChapter,
        startVerse,
        endChapter,
        endVerse,
      );
      if (!displayLabel) continue;

      const osisStart = `${book.code}.${startChapter}.${startVerse}`;
      const osisEnd = `${book.code}.${endChapter}.${endVerse}`;
      const key = `${osisStart}-${osisEnd}`;
      const index = match.index ?? 0;
      const snippet = pageText
        .slice(Math.max(0, index - 55), Math.min(pageText.length, index + match[0].length + 75))
        .replace(/\s+/g, " ")
        .trim();

      if (!found.has(key)) {
        found.set(key, {
          rawText: match[0],
          displayLabel,
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

      // Commas list verses; semicolons introduce another chapter in the same
      // book. Neither may become the end chapter of the preceding range.
      let cursor = index + match[0].length;
      let inheritedChapter = endChapter;
      for (let continuationIndex = 0; continuationIndex < 100; continuationIndex += 1) {
        const remainder = pageText.slice(cursor);
        if (referenceStartPattern.test(remainder.replace(/^\s*[,;]\s*/u, ""))) break;
        const continuation = remainder.match(referenceContinuationPattern);
        if (!continuation || (continuation[1] === ";" && !continuation[3])) break;
        const chapter = continuation[3] ? Number(continuation[2]) : inheritedChapter;
        const verse = Number(continuation[3] ?? continuation[2]);
        const lastChapter = continuation[4] ? Number(continuation[4]) : chapter;
        const lastVerse = continuation[5] ? Number(continuation[5]) : verse;
        const label = formatHungarianReference(book.code, chapter, verse, lastChapter, lastVerse);
        if (!label) break;
        cursor += continuation[0].length;
        const start = `${book.code}.${chapter}.${verse}`;
        const end = `${book.code}.${lastChapter}.${lastVerse}`;
        const continuationKey = `${start}-${end}`;
        if (!found.has(continuationKey)) {
          found.set(continuationKey, {
            rawText: pageText.slice(index, cursor), displayLabel: label, bookCode: book.code,
            startChapter: chapter, startVerse: verse, endChapter: lastChapter, endVerse: lastVerse,
            osisStart: start, osisEnd: end, pageNumber: pageIndex + 1,
            contextSnippet: pageText.slice(Math.max(0, index - 55), cursor + 75).replace(/\s+/g, " ").trim(),
          });
        }
        inheritedChapter = lastChapter;
      }
    }
  });

  return [...found.values()];
}

function isPlausibleRange(
  startChapter: number,
  startVerse: number,
  endChapter: number,
  endVerse: number,
) {
  if (
    [startChapter, startVerse, endChapter, endVerse].some(
      (value) => !Number.isInteger(value) || value < 1 || value > 200,
    )
  ) {
    return false;
  }
  if (endChapter < startChapter) return false;
  return endChapter !== startChapter || endVerse >= startVerse;
}
