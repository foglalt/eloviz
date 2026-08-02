---
phase: 03
plan: 30
status: completed
completed: 2026-08-02
---

# 03-30 Summary: Add symmetric related content

- Added migration 006 with a canonical undirected `study_relations` pair.
  Database constraints prevent self-relations and duplicate reverse pairs.
- Added a searchable related-study picker to the study editor alongside topics
  and videos. Saving a study atomically replaces all of its symmetric study
  pairs and keeps existing study-video rows bidirectional.
- Extended admin loading so opening either side of a study pair shows the other
  study selected. Existing study-video editors were verified to do the same.
- Public study pages now list related studies and videos as compact sidebar
  sections below topics, document, and Bible references. Video pages now show
  related studies in their sidebar rather than a wide footer section.
- Public queries resolve both ends of a study pair and filter relation targets
  through the existing published study/video collections, so drafts do not leak.

## Verification

- 51 focused tests, ESLint, strict TypeScript, and the Next.js production build
  passed.
- Migration and transactional database probes passed in both directions.
- Authenticated 1440 px and 390 px admin checks passed selection, reverse
  selection, self-exclusion, three-column/one-column layout, and overflow checks.
- Isolated public relation probes passed study↔study, study↔video, desktop
  sidebar, mobile order, draft filtering, and cleanup checks.
- Production deployment `dpl_ALdtMfjpJYoJ8tNLtB23qLn8ekjv` reached READY;
  live public routes and admin protection passed with clean error/fatal logs.

---
*Completed: 2026-08-02*
