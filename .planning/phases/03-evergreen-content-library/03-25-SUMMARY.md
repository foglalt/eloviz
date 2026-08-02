---
phase: 03
plan: 25
status: completed
completed: 2026-08-02
---

# 03-25 Summary: Sort study references in Bible order

- Added a stable canonical Scripture-reference sorter backed by the existing
  ordered 66-book catalogue.
- Sorted public study-detail references by book, chapter, and verse without
  altering stored PDF detection or evidence order.
- Kept malformed or unknown legacy OSIS values stable at the end of the list.

## Verification

- Seven reference tests passed, including Genesis-to-Revelation ordering,
  same-book chapter/verse ordering, unknown-value fallback, and non-mutation.
- ESLint, strict TypeScript, and the Next.js production build passed.

---
*Completed: 2026-08-02*
