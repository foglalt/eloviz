---
phase: 03
plan: 23
status: completed
completed: 2026-07-31
---

# 03-23 Summary: Merge overlapping and adjacent Scripture ranges

- Added canonical range merging for contained, overlapping, and same-chapter
  adjacent Scripture references.
- Preserved every original detected candidate with its PDF page, raw text, and
  context snippet while storing only concise merged finalized references.
- Applied the same finalization rule to new PDF uploads and the maintenance
  repair script, and advanced the detector version to `hu-reference-v3`.
- Preserved first-occurrence ordering after the per-book merge.

## Verification

- Six reference tests passed, including the requested conversion of
  `Jn 3:1-5`, `Jn 3:2-6`, `Jn 3:4`, and `Jn 3:6-8` to `Jn 3:1-8`.
- Tests confirm gaps and different books remain separate and original evidence
  candidates are not discarded.
- Five study-publication tests, ESLint, strict TypeScript, and the Next.js
  production build passed.
- GTD verification and repository health passed.

---
*Completed: 2026-07-31*
