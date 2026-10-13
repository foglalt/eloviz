---
phase: 03
plan: 33
status: completed
completed: 2026-10-13
---

# 03-33 Summary: Ordered study series

- Added named series with introduction, optional author/source and independent
  publication. Additive migration 008 preserves studies, PDFs and legacy links.
- A study has one optional series. Transactional insertion, movement, removal
  and deletion maintain unique ordered positions; a shared lock serializes editors
  and exact database timestamp revisions reject stale series-list edits.
- Replaced the study-to-study picker with series/position fields. Existing
  undirected relations survive ordinary saves; standalone public pages retain
  their legacy related-study display.
- Added `/admin/sorozatok`: searchable/paginated list, attach existing studies,
  accessible 44 px ordering/removal controls, and create-next shortcuts. New parts
  inherit series, next position and the previous chapter's topics.
- Added `/sorozatok` and `/sorozatok/[slug]`, chapter contents/current markers and
  previous/next links. Public queries exclude drafts/missing PDFs while preserving
  editorial chapter numbers and independent study URLs/canonicals.
- Added series/ordered-list structured data, Article membership/author metadata
  and sitemap entries. Draft or published-empty series return public 404s.
- Interaction tests found and repaired timestamp conversion and repeated-save
  confirmation issues. Study/series confirmations are keyed to record revisions.
- Updated README and project/phase memory. The user confirms permission for
  Hungarian Stephen Bohr notes and chooses separate chapter PDFs. Translation,
  content import and automatic PDF splitting remain outside this implementation.

## Verification

- 64 automated tests passed, including six new series tests.
- Migration 008, seven PostgreSQL transaction/revision probes, lint, TypeScript
  and production build passed.
- Authenticated create/reorder/remove/reattach/add-next/move/standalone flows and
  two consecutive identical save confirmations passed in the actual browser.
- Canonicals, structured data, sitemap, publication boundaries and reader
  navigation passed. Admin 1440/390 px and public 1440/390/320 px checks passed
  without overflow; screenshots were visually inspected and browser console clean.
- Synthetic fixtures and local test session removed; original records and Blob
  objects preserved. Evidence: `03-33-VERIFICATION.md` and `03-VERIFICATION.md`.

## Release

- Commit/push and connected Vercel rollout pending after local verification.
- Release also includes the previously accepted, uncommitted plan 03-32 signup.
