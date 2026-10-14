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
