---
phase: 03
plan: 12
status: completed
completed: 2026-07-28
---

# 03-12 Summary: Remove redundant resource type labels

- Removed the repeated `PDF tanulmány` and `Videóajánló` eyebrow labels from shared study and video rows.
- Removed the repeated `Téma`, `PDF-tanulmány`, and `Videóajánló` labels from items inside grouped catalogue search results.
- Preserved the explicit group headings, item titles, topic tags, Scripture references, speaker/channel metadata, and contextual labels on standalone detail pages.
- Removed the now-unused search-result eyebrow CSS rule and type-label mapping.

## Verification

- ESLint passed.
- Strict TypeScript passed.
- The Next.js production build passed.
- Local production HTTP rendering confirmed zero repeated type labels in the study and video listings.
- A live local search returned four items and confirmed zero item-level eyebrow labels beneath the explicit result-group headings.

---
*Completed: 2026-07-28*
