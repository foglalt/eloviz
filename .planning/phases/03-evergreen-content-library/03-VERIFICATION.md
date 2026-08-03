---
generated: 2026-08-03T08:52:50+02:00
status: passed
---

# Verification Report

## Summary

- Status: **passed**
- Timestamp: 2026-08-03T08:52:50+02:00

## Checks

| Command | Exit | Result |
|---|---:|---|
| `npm run lint` | 0 | PASS |
| `npm run build` | 0 | PASS |

## Detailed Output

## Plan 03-31 production evidence

- 53 focused tests: PASS.
- Strict TypeScript (`npx tsc --noEmit`): PASS.
- Real private Blob upload/read/checksum/delete probe: PASS (64,339 bytes).
- Connected Vercel deployment for commit `f55cb6c`: SUCCESS.
- Guarded database-to-Blob migration: PASS (one 75,525-byte document).
- Post-migration database state: `storage_kind = 'blob'`, `file_data IS NULL`.
- Direct Blob read and live controlled PDF route: PASS; byte size and SHA-256
  match the pre-migration document, with live HTTP 200 and `application/pdf`.

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
✓ Compiled successfully in 6.0s
  Running TypeScript ...
  Finished TypeScript in 6.3s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/12) ...
  Generating static pages using 11 workers (3/12)
  Generating static pages using 11 workers (6/12)
  Generating static pages using 11 workers (9/12)
✓ Generating static pages using 11 workers (12/12) in 644ms
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
