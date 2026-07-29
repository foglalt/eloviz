---
phase: 03
plan: 17
status: completed
completed: 2026-07-29
---

# 03-17 Summary: Aligned admin relationship panels

- Replaced the permanent study-topic fallback note with a compact info button
  that reveals the same guidance on hover, click/focus, and keyboard focus.
- Removed draft/published state labels from every relation-picker row and from
  relation search matching.
- Standardized relation legend height so paired 240 px pickers share the same
  top edge.
- Changed picker option grids to content-sized, top-aligned rows so sparse lists
  no longer stretch through the available height.
- Restored correct filtering by ensuring relation rows with the HTML `hidden`
  attribute do not reserve grid space.

## Verification

- ESLint, strict TypeScript, and the Next.js production build passed.
- Authenticated 1440 px browser checks measured identical picker tops and
  heights, 20 px legends, and compact 5 px row gaps.
- Topic and video/study relation rows contained titles only, with no `élő` or
  `vázlat` labels.
- Pointer and keyboard checks exposed the complete `Egyéb` fallback guidance;
  the tooltip was hidden in the resting state.
- A zero-result filter placed its empty message at the top and rendered no
  filtered rows.
- The 390 px stacked layout retained 240 px picker heights, kept the tooltip
  inside the viewport, and had no horizontal overflow.
- GTD verification and repository health passed.

---
*Completed: 2026-07-29*
