import assert from "node:assert/strict";
import test from "node:test";
import { completeKaroliText, parseKaroliOsis, validateBibleCanon } from "./bible-import-core.ts";

function fixture(content: string) {
  return `<osis xmlns="http://www.bibletechnologies.net/2003/OSIS/namespace"><osisText osisIDWork="HunKar" xml:lang="hu"><div type="book" osisID="John"><chapter osisID="John.1">${content}</chapter></div></osisText></osis>`;
}

test("preserves Hungarian spelling and inline text while omitting modern notes and headings", () => {
  const verses = parseKaroliOsis(fixture('<verse osisID="John.1.1">Ő &amp; ő <hi>vala</hi>. <note>Mt 1:1 <reference>extra</reference></note><title>heading</title></verse>'), ["John"]);
  assert.equal(verses[0].text, "Ő & ő vala.");
});
test("rejects entities, malformed XML, wrong edition and unexpected markup", () => {
  assert.throws(() => parseKaroliOsis('<!DOCTYPE osis>'+fixture(""), ["John"]));
  assert.throws(() => parseKaroliOsis(fixture('<verse osisID="John.1.1">text</chapter>'), ["John"]));
  assert.throws(() => parseKaroliOsis(fixture("").replace("HunKar", "Other"), ["John"]));
  assert.throws(() => parseKaroliOsis(fixture('<verse osisID="John.1.1"><script>bad</script></verse>'), ["John"]));
});
test("rejects duplicates, unknown books, empty verses and mismatched parents", () => {
  const verse = '<verse osisID="John.1.1">text</verse>';
  assert.throws(() => parseKaroliOsis(fixture(verse+verse), ["John"]));
  assert.throws(() => parseKaroliOsis(fixture(verse.replace("John.1.1", "Acts.1.1")), ["John"]));
  assert.throws(() => parseKaroliOsis(fixture(verse.replace("text", "")), ["John"]));
  assert.throws(() => parseKaroliOsis(fixture(verse.replace("John.1.1", "John.2.1")), ["John"]));
});
test("supplement fills only explicitly identified omissions and cannot overwrite source text", () => {
  const verses = parseKaroliOsis(fixture('<verse osisID="John.1.2">Second.</verse>'), ["John"]);
  const patch = { osis: "John.1.1", bookIndex: 0, chapter: 1, verse: 1 };
  const completed = completeKaroliText(verses, [{chapters: [["First.", "Second."]]}], [patch], ["John"]);
  assert.equal(completed[0].osis, "John.1.1");
  assert.deepEqual(validateBibleCanon(completed, ["John"], 1, 2), [{book_code:"John",chapter_number:1,verse_count:2}]);
  assert.throws(() => completeKaroliText(completed, [{chapters: [["First."]]}], [patch], ["John"]));
  assert.throws(() => completeKaroliText(verses, [{chapters: [[]]}], [patch], ["John"]));
});
test("canon validation refuses verse gaps, missing books, missing chapters and changed counts", () => {
  const verses = parseKaroliOsis(fixture('<verse osisID="John.1.2">text</verse>'), ["John"]);
  assert.throws(() => validateBibleCanon(verses,["John"],1,1), /Verse gap/);
  assert.throws(() => validateBibleCanon(verses,["John","Acts"],1,1), /Incomplete book/);
  assert.throws(() => validateBibleCanon(verses,["John"],2,1), /chapter count/);
  assert.throws(() => validateBibleCanon(verses,["John"],1,2), /verse count/);
});
