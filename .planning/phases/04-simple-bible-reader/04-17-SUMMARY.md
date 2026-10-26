---
phase: 04
plan: 17
status: complete
---

# 04-17 Summary

- Verified the exact six-page chapter4 PDF against SHA-256 and visually inspected pages5/6. Question7 was merged across a page break into the unpunctuated third answer; question6 and the restarted answer list were also combined.
- Article v6 treats marked list items as new blocks across pages. Ordered lists retain source start numbers and split on numbering restarts, gaps or delimiter changes. Renderer uses native ordered-list starts; older saved articles remain compatible. Bold and hidden-answer ranges remain attached to their own text.
- Added four focused regressions covering the actual question/answer boundary, bullet page breaks, numbering/restarts and stored-data validation. All132 tests pass; lint, production build and TypeScript pass.
- Added article-only guarded reprocessing: original PDF hash/size and unchanged extracted text required, private backup before transaction, stale snapshot guard, exact article/publication readback and unchanged reference-row verification.
- Dry-run of the affected current document produces separate lists6;1–3;7,44blocks, zero quote blocks and unchanged extracted text. Released and saved-article repair verified; browser visual review unavailable because Work settings disable browser control.
- Pre-existing newsletter intro edit remains outside this work.

- Released f0e4733043c4d7ab5e90b7c4d3339ba6d1a1db8e / dpl_2n9THJhmgPwEwkTNJoTZdRopR6jJ READY; www.eloviz.hu alias and exact SHA verified.
- Repaired only current document cc8c0241-b405-4aaa-a313-f6d37ac5c239 using --article-only. Private backup: tmp/backups/study-cc8c0241-b405-4aaa-a313-f6d37ac5c239-1793021892242.json. Article readback, PDF checksum, current document pointer, publication timestamps and all reference rows verified unchanged except intended article/version.
- Production HTTP200 HTML verified:44blocks, final three sibling ordered lists start6;1;7 with1;3;1items. All extracted article text exactly matches the source-derived expected blocks. Three answer spans are initially hidden; question7 is outside every spoiler, with its bold words and János14:6 Bible link intact. Original PDF delivery SHA unchanged; deployment error/fatal logs empty.
- Browser review attempted through built-in browser and Opera; both rejected because browser use is disabled in Work settings. No tabs created or changed in this task; no live click, phone-layout or screenshot verification claimed. Existing spoiler interaction/CSS unchanged. Previous uncertain tabs were preserved.