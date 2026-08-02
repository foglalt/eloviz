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
