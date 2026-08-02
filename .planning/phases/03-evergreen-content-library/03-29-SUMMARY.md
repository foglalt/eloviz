---
phase: 03
plan: 29
status: completed
completed: 2026-08-02
---

# 03-29 Summary: Publish PDF-derived HTML studies

- Added a layout-aware PDF converter that derives safe, versioned headings,
  paragraphs, Scripture excerpts, and lists without storing or executing raw
  HTML.
- Extended immutable study documents with semantic article JSON and an
  extraction-version marker. New uploads now save the PDF, extracted article,
  evidence candidates, finalized ranges, and current-document pointer in one
  database transaction.
- Added migration 005, seed support, and a storage-aware backfill command. The
  production Páska study was backfilled successfully into 53 semantic blocks.
- Made semantic HTML the primary study reading experience while retaining the
  original PDF action. Connected Bible passages now appear in canonical order
  below that action in the desktop sidebar.
- Kept the public page a Server Component and added responsive ordering so the
  PDF action remains accessible before the long article on mobile.

## Verification

- 48 focused tests across article conversion, PDF extraction, references,
  publication, search, storage, topics, YouTube metadata, admin shortcuts, and
  analytics passed; ESLint, strict TypeScript, and the Next.js production build
  also passed.
- Local Chromium checks at 1440 px and 390 px passed complete-content, semantic
  block, reference order/count, PDF placement, responsive order, console, and
  overflow assertions.
- Production deployment `dpl_8kT5JCQ4Qjerp1Jr7Nt2XUEo5SQ6` reached READY.
  The live Páska page contains 15 headings, 32 Scripture excerpts, and 28
  connected references; its original 75,525-byte PDF still returns correctly.
- The deployment had no failed live requests or application exceptions. The
  successful PDF route emitted one longstanding Node dependency deprecation
  warning for `Buffer()`, first observed before this feature.

---
*Completed: 2026-08-02*
