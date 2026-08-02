---
phase: 03
plan: 27
status: completed
completed: 2026-08-02
---

# 03-27 Summary: Move study PDF action to sidebar

- Moved the public study PDF action into the right-column `Dokumentum` section.
- Replaced the stored PDF filename with one clear `PDF megnyitása` button.
- Removed the main-column PDF callout, the obsolete reference-review explanation,
  and the callout styles that were no longer used.
- Reformatted the study detail component for easier maintenance without changing
  its metadata, Scripture ordering, topic links, or related-video behavior.

## Verification

- ESLint, strict TypeScript, and the Next.js production build passed.
- A local rendered-page check for `A Páska tipológiája` returned HTTP 200,
  found exactly one PDF button inside the sidebar, and confirmed that the bare
  filename and both removed explanatory texts were absent.
- Production deployment `dpl_5r8TS6tjGwP3AvauYRMqbwjj7u4Z` reached READY.
  The live study page passed the same checks, its PDF button targets the
  controlled document route, and the deployment error/fatal log scan was clean.

---
*Completed: 2026-08-02*
