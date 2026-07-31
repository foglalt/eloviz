---
phase: 03
plan: 20
status: completed
completed: 2026-07-31
---

# 03-20 Summary: First-party content analytics dashboard

- Added an idempotent analytics migration with minute-level duplicate
  suppression and indexes for recent and per-path reporting.
- Added a small public client boundary and same-origin API that record approved
  public paths using a hashed anonymous browser identifier.
- Excluded authenticated admins, automated browsers, invalid/private routes,
  cross-origin requests, Do Not Track, and Global Privacy Control.
- Added all-time and 30-day visitor/view counters plus top-five 30-day rankings
  for topics, studies, and videos to the existing admin dashboard.
- Kept the reporting UI as a compact editorial ledger with linked public titles,
  clear empty states, and an explicit measurement/privacy note.

## Verification

- Migration 004 applied successfully and skipped on the second run.
- Four focused path and user-agent tests passed.
- Two synthetic visitors produced the expected unique counts and rankings;
  a same-minute repeat was deduplicated.
- Admin, bot, invalid-path, and cross-origin probes returned without changing
  counts.
- All 10 synthetic view rows were deleted; the real table returned to zero.
- Authenticated 1440 px and 390 px dashboard checks passed without horizontal
  overflow; a ranking link opened its matching public detail page.
- ESLint, strict TypeScript, production build, GTD verification, repository
  health, and React/Next.js review passed.

---
*Completed: 2026-07-31*
