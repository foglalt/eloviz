---
phase: 03
plan: 26
status: completed
completed: 2026-08-02
---

# 03-26 Summary: Filter study search by Scripture ranges

- Added normalized Hungarian Scripture-query parsing for single verses,
  same-chapter ranges, and cross-chapter ranges.
- Added inclusive interval-overlap matching to both bundled search data and
  the parameterized PostgreSQL study query, using the existing reference index.
- Added a URL-persistent `ige` filter to the public search form with accessible
  labels, format guidance, invalid-state feedback, and responsive styling.
- Preserved text search behavior: Scripture-only queries return studies, while
  combined queries require a study to match both text and Scripture filters.

## Verification

- Nine Scripture tests and ten catalogue-search tests passed, covering aliases,
  containment, partial overlap, cross-chapter ranges, adjacency exclusion,
  verse-only search, and combined filters.
- ESLint, strict TypeScript, and the Next.js production build passed.
- PostgreSQL-backed route checks passed against the live Páska study: overlap
  and cross-chapter queries matched, a gap-only query did not, combined text
  filtering worked, and invalid syntax produced Hungarian guidance.
- Headless Chrome passed 1440 px and 390 px interaction, URL persistence,
  accessibility state, overflow, and console-error checks.
- Production deployment `dpl_ESeCJpKPutjUbWBCUn5yPRaRriFv` reached READY.
  All five live overlap, gap, cross-chapter, combined, and invalid-input checks
  passed, and its error/fatal runtime-log scan was clean.

---
*Completed: 2026-08-02*
