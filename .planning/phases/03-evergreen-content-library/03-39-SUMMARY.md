---
phase: 03
plan: 39
title: Repair series study list and reference presentation
status: implemented
---

# Plan 03-39: Study conversion and series presentation

- Investigated live Stephen Bohr series A teremtés kódjának feltörése / chapter
  Mítosz vagy történelem? and visually rendered the actual four-page chapter PDF.
- PDF conversion v2 preserves each bullet, wrapped names and page continuations.
  Quotation styling needs a recognized complete book/reference at paragraph start
  plus actual written passage text; bare/list references and partial book names do
  not become quotes. Existing actual passage/subheading regressions retained.
- Detector v4 stops comma/semicolon lists becoming false cross-chapter endpoints;
  adds inherited verse/chapter lists, parenthesized book names, Timótheus spelling
  and omitted chapters only for single-chapter books. True cross-chapter intervals,
  deduplication, canonical ordering and first-occurrence evidence retained.
- Target current document regenerated with 25 blocks, lists of 22/15/10/14 items,
  zero quotation blocks, 88 candidates and 69 correct consolidated references.
  Exact reading text preserved after list-marker/whitespace normalization; original
  PDF checksum and publication/document pointers/timestamps preserved.
- Reprocessing CLI defaults to dry-run, requires explicit slug/document/file, checks
  PDF bytes/hash, backs up derived content/refs and locks/checks snapshot before one
  atomic write. Initial microsecond timestamp mismatch safely rolled back; corrected
  lossless timestamp comparison and successful exact read-back verified.
- Summary/body now have Hungarian labels and a divider. Series index uses semantic
  list/valid block markup, compact title scale and short Sorozatok heading; layout
  fits mobile without splitting the previous long heading into a stranded ending.
- 95 tests, lint/build/strict TypeScript passed; real local responsive browser and
  PDF checks passed. Production code rollout pending. Approved icon/palette from
  03-38 remains deployed and unchanged.
