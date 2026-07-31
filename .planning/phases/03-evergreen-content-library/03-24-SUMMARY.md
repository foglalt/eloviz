---
phase: 03
plan: 24
status: in_progress
---

# 03-24 Summary: Bundle PDF.js worker for Vercel parsing

- Explicitly initialized the PDF.js worker after the required Node canvas
  globals so fake-worker parsing no longer depends on an untraced relative
  runtime import.
- Added a route-scoped Next.js output-file tracing include for the PDF.js
  worker used by the study admin Server Action.
- Added regression coverage that confirms the worker handler is available
  during native PDF extraction.

## Verification

- The supplied `A páska tipológiája.pdf` extracted successfully through the
  application path: four pages and 6,566 text characters.
- The focused PDF and Scripture-reference tests, ESLint, strict TypeScript, and
  the Next.js production build passed.
- Production deployment verification remains pending.

---
*Implementation checkpoint: 2026-07-31*
