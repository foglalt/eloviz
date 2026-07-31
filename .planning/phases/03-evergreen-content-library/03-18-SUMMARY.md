---
phase: 03
plan: 18
status: completed
completed: 2026-07-31
---

# 03-18 Summary: Published default for new topics

- Added a configurable new-record status to the shared admin content fields,
  retaining `draft` as the default for existing consumers.
- Configured only the new-topic editor to begin with `published` selected.
- Kept a loaded record's stored status authoritative, so editing an existing
  topic does not overwrite its publication state.

## Verification

- ESLint, strict TypeScript, and the Next.js production build passed.
- An authenticated browser check confirmed new topics select `Publikált`.
- New study and video forms still select `Vázlat`.
- An existing topic retained its stored `published` state in edit mode.
- The changed admin form remained visually coherent at 1440 px without
  horizontal overflow.
- GTD verification and repository health passed.

---
*Completed: 2026-07-31*
