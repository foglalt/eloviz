---
phase: 04
plan: 15
status: implemented
---

# 04-15 Summary

- New-study form accepts an optional initial PDF before the first save. One
  submit validates/extracts the PDF and atomically saves study metadata,
  topics/videos/study relations, ordered series membership, document, article,
  recognized references and current-document pointer. Initial publication works
  when requested with a usable PDF; no-PDF creation remains a draft.
- Shared PDF preparation/document queries retain existing formatting, spoilers,
  reference handling and saved-study revision uploads/history. Blob storage is
  compensated only on failed DB commit; redirects/revalidation happen afterward.
- Small useActionState form boundary reports errors inline, focuses the error,
  and prevents React form reset so text, relations, series and selected File
  survive validation/processing/storage/DB errors. Optional 12 MB input checks
  reject oversized/empty files before submission; server validation remains.
- 122 unit tests pass. Real PDF + exact shared queries passed rollback-only
  published/draft/draft-only checks, relation/series/article/reference read-back,
  and FK/duplicate title/revision failure probes. No fixtures committed.
- Authenticated browser confirmed invalid bytes, invalid metadata and real
  processed-PDF/duplicate-slug failure preserve inputs/file and close pending
  dialog. Private Blob read-back and DB checks confirm no orphan upload/record.
  Saved-study PDF revision/history still visible. Full build/release evidence
  and browser cleanup are recorded in04-15-VERIFICATION.md.
- No schema/dependency/production-content changes. Local admin env was missing;
  test server used ephemeral credentials confined to localhost, not .env edits.
