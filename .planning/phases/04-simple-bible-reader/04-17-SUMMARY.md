---
phase: 04
plan: 17
status: implemented-awaiting-release
---

# 04-17 Summary

- Verified the exact six-page chapter4 PDF against SHA-256 and visually inspected pages5/6. Question7 was merged across a page break into the unpunctuated third answer; question6 and the restarted answer list were also combined.
- Article v6 treats marked list items as new blocks across pages. Ordered lists retain source start numbers and split on numbering restarts, gaps or delimiter changes. Renderer uses native ordered-list starts; older saved articles remain compatible. Bold and hidden-answer ranges remain attached to their own text.
- Added four focused regressions covering the actual question/answer boundary, bullet page breaks, numbering/restarts and stored-data validation. All132 tests pass; lint, production build and TypeScript pass.
- Added article-only guarded reprocessing: original PDF hash/size and unchanged extracted text required, private backup before transaction, stale snapshot guard, exact article/publication readback and unchanged reference-row verification.
- Dry-run of the affected current document produces separate lists6;1–3;7,44blocks, zero quote blocks and unchanged extracted text. Deployment, targeted saved-article repair and live responsive review pending.
- Pre-existing newsletter intro edit remains outside this work.
