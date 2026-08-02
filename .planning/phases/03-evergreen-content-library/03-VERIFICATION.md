---
generated: 2026-08-02T14:13:31+02:00
status: passed
---

# Verification Report

## Summary

- Status: **passed**
- Timestamp: 2026-08-02T14:13:31+02:00

## Checks

| Command | Exit | Result |
|---|---:|---|
| `npm run lint` | 0 | PASS |
| `npm run build` | 0 | PASS |

## Plan 03-29 Evidence

- `npm run test:article`: 4/4 passed.
- `npm run test:pdf`: 2/2 passed against the production PDF.js runtime.
- Reference, publication, search, storage, topic, YouTube, admin-shortcut,
  and analytics suites: 42/42 passed.
- `npx tsc --noEmit`: passed.
- Migration `005_study_article_content` applied to production and the current
  Páska document was backfilled into 53 semantic blocks.
- Local Chromium at 1440 px and 390 px confirmed complete article content,
  PDF-before-article mobile order, 28 sidebar references, no duplicate title,
  no browser errors, and no horizontal overflow.
- Production deployment `dpl_8kT5JCQ4Qjerp1Jr7Nt2XUEo5SQ6` reached READY.
  The live study returned 200 with 15 headings, 32 Scripture excerpts, 28
  sidebar references, correct mobile order, and no browser errors or overflow.
- The retained PDF endpoint returned 200, `application/pdf`, the original
  75,525-byte payload, and its UTF-8 inline filename. Deployment logs showed
  no failed request or application exception; the successful PDF request emits
  one pre-existing Node `Buffer()` dependency deprecation warning.

## Detailed Output

### npm run lint

Exit code: 0

```text
> eloviz@0.1.0 lint
> eslint src scripts next.config.ts --no-warn-ignored
```

### npm run build

Exit code: 0

```text
> eloviz@0.1.0 build
> next build

▲ Next.js 16.2.1 (Turbopack)
- Environments: .env
- Experiments (use with caution):
  · serverActions

  Creating an optimized production build ...
✓ Compiled successfully in 7.9s
  Running TypeScript ...
  Finished TypeScript in 6.3s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/12) ...
  Generating static pages using 11 workers (3/12)
  Generating static pages using 11 workers (6/12)
  Generating static pages using 11 workers (9/12)
✓ Generating static pages using 11 workers (12/12) in 928ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /admin
├ ƒ /admin/tanulmanyok
├ ƒ /admin/temak
├ ƒ /admin/videok
├ ƒ /api/analytics
├ ƒ /api/documents/[id]
├ ƒ /api/youtube-metadata
├ ƒ /kereses
├ ○ /robots.txt
├ ○ /sitemap.xml
├ ○ /tanulmanyok
├ ƒ /tanulmanyok/[slug]
├ ○ /temak
├ ƒ /temak/[slug]
├ ○ /videok
└ ƒ /videok/[slug]


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```
