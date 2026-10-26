# 04-15 Verification

2026-10-26. New-study form -> authenticated save action -> PDF validation/extraction
-> private storage -> one metadata/document/reference transaction -> editor redirect.

## Verified implementation

- PASS122unit tests, including optional draft-only persistence, successful
  storage/commit lifecycle, failed-commit compensation, storage failure,
  cleanup-error reporting without losing original error, and 12 MB boundaries.
- PASS scripts/verify-study-creation.ts with an actual readable PDF and exact
  production query builders: published+PDF, draft+PDF and no-PDF draft satisfy
  status/published_at/current-document, stored JSON, accepted candidates/final
  references, topics/videos/study relation and ordered series membership.
- PASS foreign-key, duplicate-slug and duplicate-revision aborts. Every probe
  ends with an intentional exception within its transaction; study/document/
  series absence checked afterward. No test record was ever committed/public.
- PASS authenticated local browser: PDF selectable on unsaved form; invalid
  PDF bytes preserve title, summary, topic selection, series/position and file.
  Short title with a valid PDF returns Hungarian inline error and retains file.
  Oversized PDF receives client error without pending dialog/server processing;
  replacement file clears validity. Returned errors focus the alert and close
  pending modal. Repeated attempts remain usable.
- PASS actual readable-PDF upload reaches private Blob + DB; duplicate existing
  slug aborts creation. Retained file/metadata/relations verified in browser;
  study3a6fbf0c-84c0-4eac-8f09-e156a128b201/document absence and empty matching
  Blob prefix verified afterward. Existing published studies unchanged.
- PASS saved-study editor still shows separate revision upload/current-document
  history and no initial-PDF field. Browser console errors empty.
- PASS desktop and390px layout; new file input fits at320px. At320px, an existing
  hidden topic-info tooltip extends17px past viewport; unrelated to new PDF field,
  unchanged in this task. No new layout styles were required.
- Local .env lacks admin credentials. Generated ephemeral test-only credentials
  were supplied to localhost child process; existing .env/secrets untouched.

## Build/release/cleanup

- PASS GTD04 report2026-10-26T09:35:24+01:00: lint/build exit0, production
  compile and strict TypeScript; standalone tsc also passed.122tests passed again
  after final test cleanup. React review: small form/file interaction boundary,
  server-rendered form children, useActionState/useFormStatus, native file input,
  alert focus only in an effect; auth and extraction remain server-only.
- PASS built application under next start: authenticated new-study PDF selection,
  Ctrl+S invokes action; short-title error retains File and focuses inline alert,
  pending dialog closes, no console errors. Screenshot saved to
  output/new-study-pdf-form.png (selected file before first save).
- Dev service stopped for build. Built service remains available on127.0.0.1:3000.
  Agent tabs2/3 recorded; tab1 pre-existing spoiler-preview retained.
- Exact-SHA deployment and tab cleanup: pending.
