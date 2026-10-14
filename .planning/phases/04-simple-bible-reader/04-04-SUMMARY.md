---
phase: 04
plan: 04
status: implemented
---

# 04-04 Summary

- Moved connected-study discovery from each Bible verse into one collapsed native
  details control below the left chapter navigation. Show/hide labels Hungarian.
- Every matching study remains available grouped by verse with counts, exact verse
  anchors and study links. Chapters without matches have an explicit empty state.
- Pure Server Component; existing matching query/publication filters and Bible text
  unchanged. No added client state, effects, API calls, data changes or migrations.
- Desktop sticky sidebar fits viewport and scrolls; mobile sidebar sits above text
  with a bounded study-results scroll area. Touch targets and keyboard access kept.
- Four Bible-core tests, lint/build/TypeScript, actual before/after equality of all
  18 verses and 14 links in Jelenések12, keyboard/fragment/navigation/empty-state
  checks and default desktop/390/320px fit passed. Screenshots visually inspected.
- Production release and final verification pending.
