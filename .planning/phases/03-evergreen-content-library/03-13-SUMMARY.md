---
phase: 03
plan: 13
status: completed
completed: 2026-07-28
---

# 03-13 Summary: Route-aware multi-type search filters

- Added canonical public-search filters for topics, studies, and videos, with multiple simultaneous selections supported through repeated `tipus` URL parameters.
- Compact header searches now derive their default scope from the current catalogue section: `/temak` selects topics, `/tanulmanyok` selects studies, and `/videok` selects videos; other routes default to all three.
- Added accessible checkbox controls to the search page and prevented the user from deselecting the final active content type.
- Preserved selected types across result navigation and limited both bundled and database searches to the requested result groups.
- Added focused regression coverage for parameter normalization, canonical ordering, route defaults, and filtered result totals.

## Verification

- All seven catalogue-search tests passed.
- ESLint, strict TypeScript, and the Next.js production build passed.
- Real-browser verification confirmed `/tanulmanyok` submits `tipus=study`, renders only the study group, and checks only “Tanulmányok”.
- Selecting “Témák” as well produced `tipus=topic&tipus=study`, persisted both checked controls, and rendered only topic and study groups.
- At a 390 px viewport, the form and filter controls fit without horizontal overflow.
- The browser console contained no errors.

---
*Completed: 2026-07-28*
