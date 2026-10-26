import assert from "node:assert/strict";
import test from "node:test";
import {
  buildStudyArticle,
  parseStudyArticle,
  type PdfArticleLine,
} from "./study-article.ts";

function line(
  pageNumber: number,
  y: number,
  text: string,
  fontSize = 11,
): PdfArticleLine {
  return { pageNumber, pageHeight: 800, x: 72, y, fontSize, text };
}

test("builds semantic study content and merges a paragraph across pages", () => {
  const article = buildStudyArticle([
    [
      line(1, 750, "A páska tipológiája", 26),
      line(1, 700, "Mint példa", 14),
      line(1, 660, "Az ószövetségi történetek Krisztusra mutatnak,"),
      line(1, 645, "és a szabadítás valóságát készítik elő."),
      line(1, 600, "A bárány kiválasztása"),
      line(1, 570, "2 Mózes 12:3 - Mindenki vegyen magának egy"),
      line(1, 555, "bárányt az atyák háza szerint"),
    ],
    [
      line(2, 750, "és házanként egy bárányt!"),
    ],
  ], "A páska tipológiája");

  assert.deepEqual(article.blocks, [
    { type: "heading", level: 2, text: "Mint példa" },
    {
      type: "paragraph",
      text: "Az ószövetségi történetek Krisztusra mutatnak, és a szabadítás valóságát készítik elő.",
    },
    { type: "heading", level: 3, text: "A bárány kiválasztása" },
    {
      type: "scripture",
      text: "2 Mózes 12:3 - Mindenki vegyen magának egy bárányt az atyák háza szerint és házanként egy bárányt!",
    },
  ]);
});

test("groups consecutive PDF list items into one semantic list", () => {
  const article = buildStudyArticle([[
    line(1, 720, "- Első megfigyelés"),
    line(1, 690, "- Második megfigyelés"),
  ]]);

  assert.deepEqual(article.blocks, [{
    type: "list",
    ordered: false,
    items: ["Első megfigyelés", "Második megfigyelés"],
  }]);
});

test("keeps wrapped subheadings and Scripture excerpts together", () => {
  const article = buildStudyArticle([[
    line(1, 700, "A vér a megfelelő helyre hintve is, mert a meghintésnek vére"),
    line(1, 685, "az, ami megtisztít"),
    line(1, 655, "2 Mózes 12:7 - És vegyenek a vérből"),
    line(1, 640, "és hintsék meg az ajtófélfát."),
    line(1, 610, "Zsidók 12:24 - Jézushoz és a meghintésnek véréhez,"),
    line(1, 595, "mely jobbat beszél, mint az Ábel vére"),
    line(1, 565, "Zsoltárok 51:9 - Tisztíts meg engem"),
  ]]);

  assert.deepEqual(article.blocks.slice(0, 4), [
    {
      type: "heading",
      level: 3,
      text: "A vér a megfelelő helyre hintve is, mert a meghintésnek vére az, ami megtisztít",
    },
    {
      type: "scripture",
      text: "2 Mózes 12:7 - És vegyenek a vérből és hintsék meg az ajtófélfát.",
    },
    {
      type: "scripture",
      text: "Zsidók 12:24 - Jézushoz és a meghintésnek véréhez, mely jobbat beszél, mint az Ábel vére",
    },
    { type: "scripture", text: "Zsoltárok 51:9 - Tisztíts meg engem" },
  ]);
});

test("accepts generated article data and rejects unsafe malformed blocks", () => {
  assert.ok(parseStudyArticle({
    version: "pdf-layout-v1",
    blocks: [{ type: "paragraph", text: "Olvasható tartalom." }],
  }));
  assert.equal(parseStudyArticle({
    version: "pdf-layout-v1",
    blocks: [{ type: "html", text: "<script>alert(1)</script>" }],
  }), null);
});

test("keeps tightly spaced bullet items and wrapped reference names inside their list", () => {
  const article = buildStudyArticle([[
    line(1, 700, "● Teremtés (Máté 19:4-6)"),
    line(1, 685, "● Ábrahám (Zsidók 11:8-12; Apostolok"),
    line(1, 670, "Cselekedetei 7:2)"),
    line(1, 655, "● Sára (Zsidók 11:11)"),
  ]]);
  assert.deepEqual(article.blocks, [{ type: "list", ordered: false, items: [
    "Teremtés (Máté 19:4-6)", "Ábrahám (Zsidók 11:8-12; Apostolok Cselekedetei 7:2)",
    "Sára (Zsidók 11:11)",
  ] }]);
});

test("does not style bare references or partial book names as Bible quotations", () => {
  const article = buildStudyArticle([[
    line(1, 700, "János 3:16"),
    line(1, 665, "Cselekedetei 7:2)"),
    line(1, 630, "János 3:16; Róma 5:8"),
  ]]);
  assert.ok(article.blocks.every((block) => block.type !== "scripture"));
});

test("merges a wrapped list item over a page break without merging the following bullet", () => {
  const article = buildStudyArticle([
    [line(1, 650, "● Ábrahám (Apostolok")],
    [line(2, 650, "Cselekedetei 7:2)"), line(2, 635, "● Sára (Zsidók 11:11)")],
  ]);
  assert.deepEqual(article.blocks, [{type:"list",ordered:false,items:[
    "Ábrahám (Apostolok Cselekedetei 7:2)","Sára (Zsidók 11:11)",
  ]}]);
});

test("keeps red emphasis through line cleanup, dehyphenation, page continuations and list markers", () => {
  const article = buildStudyArticle([
    [{ ...line(1, 650, "-  Fontos elvá-"), boldRanges: [{ start: 3, end: 14 }] }],
    [
      { ...line(2, 650, "lasztás , megmarad."), boldRanges: [{ start: 0, end: 7 }] },
      line(2, 635, "- Második elem."),
      { ...line(2, 620, "- Harmadik piros elem."), boldRanges: [{ start: 11, end: 16 }] },
    ],
  ]);
  assert.equal(article.blocks.length, 1);
  const list = article.blocks[0];
  assert.equal(list.type, "list");
  if (list.type !== "list") return;
  assert.deepEqual(list.items, ["Fontos elválasztás, megmarad.", "Második elem.", "Harmadik piros elem."]);
  assert.deepEqual(list.itemBoldRanges?.map((ranges, index) => ranges.map(({ start, end }) => list.items[index].slice(start, end))), [["Fontos elválasztás"], [], ["piros"]]);
  assert.deepEqual(parseStudyArticle(article), article);
});

test("validates stored emphasis offsets while still accepting older articles", () => {
  const base = { version: "pdf-layout-v3", blocks: [{ type: "paragraph", text: "János 3:16", boldRanges: [{ start: 0, end: 5 }] }] };
  assert.deepEqual(parseStudyArticle(base), base);
  for (const boldRanges of [[{ start: -1, end: 5 }], [{ start: 3, end: 30 }], [{ start: 5, end: 3 }], [{ start: 0.5, end: 2 }], [{ start: 0, end: 5 }, { start: 4, end: 6 }]]) {
    assert.equal(parseStudyArticle({ ...base, blocks: [{ ...base.blocks[0], boldRanges }] }), null);
  }
  assert.equal(parseStudyArticle({ version: "pdf-layout-v3", blocks: [{ type: "list", ordered: false, items: ["Első"], itemBoldRanges: [] }] }), null);
  assert.ok(parseStudyArticle({ version: "pdf-layout-v2", blocks: [{ type: "paragraph", text: "Korábbi szöveg." }] }));
});

test("keeps a new question on the next page out of an unpunctuated hidden answer", () => {
  const answer = "3) Az örök életet";
  const article = buildStudyArticle([
    [line(1, 200, "6. Gondolatébresztő kérdés: Milyen három áldást kaptunk?"),
      line(1, 185, "1) Az uralkodást"), line(1, 170, "2) A fiúságot"),
      { ...line(1, 155, answer), boldRanges: [{ start: 3, end: answer.length }], spoilerRanges: [{ start: 3, end: answer.length }] }],
    [line(2, 720, "7. Mi az egyetlen lehetőségünk, hogy az Atyát elérjük?"),
      line(2, 705, "Én vagyok az út. (János 14:6)")],
  ]);
  assert.deepEqual(article.blocks.map((block) => block.type === "list" ? { start: block.start ?? 1, items: block.items } : block), [
    { start: 6, items: ["Gondolatébresztő kérdés: Milyen három áldást kaptunk?"] },
    { start: 1, items: ["Az uralkodást", "A fiúságot", "Az örök életet"] },
    { start: 7, items: ["Mi az egyetlen lehetőségünk, hogy az Atyát elérjük? Én vagyok az út. (János 14:6)"] },
  ]);
  const answers = article.blocks[1];
  assert.equal(answers.type, "list");
  if (answers.type !== "list") return;
  assert.deepEqual(answers.itemSpoilerRanges, [[], [], [{ start: 0, end: "Az örök életet".length }]]);
  assert.deepEqual(answers.itemBoldRanges, [[], [], [{ start: 0, end: "Az örök életet".length }]]);
  assert.deepEqual(parseStudyArticle(article), article);
});

test("never merges a newly marked bullet into prose across a page break", () => {
  const article = buildStudyArticle([[line(1, 100, "Egy bevezető mondat írásjel nélkül")], [line(2, 720, "- Új felsorolás")]]);
  assert.equal(article.blocks.length, 2);
  assert.deepEqual(article.blocks[1], { type: "list", ordered: false, items: ["Új felsorolás"] });
});

test("retains source numbering after a note and separates restarted or changed lists", () => {
  const article = buildStudyArticle([[
    line(1, 700, "Megjegyzés: külön bekezdés."),
    line(1, 670, "6. Kérdés."), line(1, 655, "1) Első válasz"), line(1, 640, "2) Második válasz"),
    line(1, 625, "7. Következő kérdés."), line(1, 610, "8. Még egy kérdés."),
    line(1, 595, "1. Újrakezdett lista."), line(1, 580, "3. Kimaradó szám után."),
  ]]);
  assert.deepEqual(article.blocks.filter((b) => b.type === "list").map((b) => [b.start ?? 1, b.items.length]), [[6, 1], [1, 2], [7, 2], [1, 1], [3, 1]]);
});

test("validates optional list starts while retaining legacy articles", () => {
  const list = { type: "list", ordered: true, start: 7, items: ["Hetedik kérdés."] };
  assert.deepEqual(parseStudyArticle({ version: "pdf-layout-v6", blocks: [list] })?.blocks, [list]);
  for (const start of [-1, 1.5, "7", null, 1_000_000_001]) assert.equal(parseStudyArticle({ version: "pdf-layout-v6", blocks: [{ ...list, start }] }), null);
  assert.equal(parseStudyArticle({ version: "pdf-layout-v6", blocks: [{ ...list, ordered: false }] }), null);
  assert.ok(parseStudyArticle({ version: "pdf-layout-v5", blocks: [{ type: "list", ordered: true, items: ["Régi pont."] }] }));
});
