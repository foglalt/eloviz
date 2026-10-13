import { createHash } from "node:crypto";
import { DOMParser, type Node as XmlNode, type Element as XmlElement } from "@xmldom/xmldom";

export type BibleVerse = {
  osis: string;
  book_code: string;
  chapter_number: number;
  verse_number: number;
  text: string;
};

const namespace = "http://www.bibletechnologies.net/2003/OSIS/namespace";

export function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

function verseText(node: XmlNode): string {
  if (node.nodeType === 3 || node.nodeType === 4) return node.nodeValue ?? "";
  if (node.nodeType !== 1) return "";
  const element = node as XmlElement;
  if (["note", "title", "reference"].includes(element.localName ?? "")) return "";
  // Only these inline containers occur in the pinned source. Never execute HTML.
  if (!["verse", "hi", "seg", "w", "q", "transChange", "divineName"].includes(element.localName ?? "")) {
    throw new Error(`Unsupported verse element: ${element.localName}`);
  }
  return Array.from(element.childNodes).map(verseText).join("");
}

export function parseKaroliOsis(xml: string, bookCodes: string[]): BibleVerse[] {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error("XML declarations/entities are not allowed.");
  const document = new DOMParser({ onError: (_level, message) => { throw new Error(message); } })
    .parseFromString(xml, "application/xml");
  if (document.documentElement?.localName !== "osis" || document.documentElement.namespaceURI !== namespace) {
    throw new Error("Expected an OSIS document.");
  }
  const text = document.getElementsByTagNameNS(namespace, "osisText")[0];
  if (text?.getAttribute("osisIDWork") !== "HunKar" || text.getAttribute("xml:lang") !== "hu") {
    throw new Error("Expected the Hungarian HunKar text.");
  }
  const seen = new Set<string>();
  const verses = Array.from(document.getElementsByTagNameNS(namespace, "verse")).map((verse) => {
    const osis = verse.getAttribute("osisID") ?? "";
    const match = /^([1-3]?[A-Za-z]+)\.([1-9]\d{0,2})\.([1-9]\d{0,2})$/.exec(osis);
    if (!match || !bookCodes.includes(match[1]) || seen.has(osis)) throw new Error(`Invalid or duplicate verse: ${osis}`);
    seen.add(osis);
    let chapter: XmlElement | null = verse.parentNode as XmlElement;
    while (chapter && chapter.localName !== "chapter") chapter = chapter.parentNode as XmlElement | null;
    if (chapter?.getAttribute("osisID") !== `${match[1]}.${match[2]}`) throw new Error(`Mismatched chapter: ${osis}`);
    let book = chapter.parentNode as XmlElement | null;
    while (book && !(book.localName === "div" && book.getAttribute("type") === "book")) book = book.parentNode as XmlElement | null;
    if (book?.getAttribute("osisID") !== match[1]) throw new Error(`Mismatched book: ${osis}`);
    const content = verseText(verse).replace(/\s+/gu, " ").trim();
    if (!content || content.includes("\uFFFD") || /[<>]/.test(content)) throw new Error(`Invalid verse text: ${osis}`);
    return { osis, book_code: match[1], chapter_number: Number(match[2]), verse_number: Number(match[3]), text: content };
  });
  if (!verses.length) throw new Error("No verse text.");
  return verses;
}

export function completeKaroliText(
  verses: BibleVerse[],
  supplement: unknown,
  patches: { osis: string; bookIndex: number; chapter: number; verse: number }[],
  bookCodes: string[],
) {
  if (!Array.isArray(supplement) || supplement.length !== bookCodes.length) throw new Error("Invalid supplemental canon.");
  const result = [...verses];
  for (const patch of patches) {
    if (result.some((verse) => verse.osis === patch.osis)) throw new Error(`Supplement would overwrite ${patch.osis}`);
    const book = supplement[patch.bookIndex] as { chapters?: unknown[] } | undefined;
    const chapter = book?.chapters?.[patch.chapter - 1];
    const content: unknown = Array.isArray(chapter) ? chapter[patch.verse - 1] : null;
    const code = bookCodes[patch.bookIndex];
    if (!code || patch.osis !== `${code}.${patch.chapter}.${patch.verse}` || typeof content !== "string" || !content.trim()) {
      throw new Error(`Missing supplemental verse: ${patch.osis}`);
    }
    result.push({ osis: patch.osis, book_code: code, chapter_number: patch.chapter, verse_number: patch.verse, text: content.trim() });
  }
  return result.sort((a, b) => bookCodes.indexOf(a.book_code) - bookCodes.indexOf(b.book_code)
    || a.chapter_number - b.chapter_number || a.verse_number - b.verse_number);
}

export function validateBibleCanon(verses: BibleVerse[], bookCodes: string[], expectedChapters: number, expectedVerses: number) {
  if (verses.length !== expectedVerses || new Set(verses.map((v) => v.osis)).size !== verses.length) {
    throw new Error("Unexpected verse count or duplicate identifiers.");
  }
  const chapters = new Map<string, number[]>();
  for (const verse of verses) {
    if (!bookCodes.includes(verse.book_code) || !verse.text.trim()) throw new Error("Invalid canon content.");
    const key = `${verse.book_code}.${verse.chapter_number}`;
    chapters.set(key, [...(chapters.get(key) ?? []), verse.verse_number]);
  }
  if (chapters.size !== expectedChapters) throw new Error("Unexpected chapter count.");
  for (const code of bookCodes) {
    const numbers = [...chapters.keys()].filter((key) => key.startsWith(`${code}.`)).map((key) => Number(key.split(".")[1])).sort((a, b) => a - b);
    if (!numbers.length || numbers.some((n, index) => n !== index + 1)) throw new Error(`Incomplete book: ${code}`);
  }
  for (const [key, numbers] of chapters) {
    const ordered = numbers.sort((a, b) => a - b);
    if (ordered.some((n, index) => n !== index + 1)) throw new Error(`Verse gap: ${key}`);
  }
  return [...chapters.entries()].map(([key, numbers]) => {
    const [book_code, chapter] = key.split(".");
    return { book_code, chapter_number: Number(chapter), verse_count: numbers.length };
  });
}
