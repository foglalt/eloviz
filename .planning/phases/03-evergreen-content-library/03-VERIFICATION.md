---
generated: 2026-07-26T10:23:17+02:00
status: passed
---

# Verification Report

## Summary

- Status: **passed**
- Timestamp: 2026-07-26T10:23:17+02:00

## Checks

| Command | Exit | Result |
|---|---:|---|
| `npm run lint` | 0 | PASS |
| `npm run build` | 0 | PASS |

## Detailed Output

## Production PDF extraction dependency hotfix — 2026-07-26

- Production database evidence: `Teszt.pdf` was recorded as `failed` with zero extracted characters and zero candidates.
- Vercel runtime evidence at the failed upload: PDF.js could not load `@napi-rs/canvas` and could not polyfill `DOMMatrix` or `Path2D`.
- `npm run test:pdf`: PASS; the real bundled native-text PDF produced the four expected normalized ranges.
- Direct `Teszt.pdf` regression: PASS; one page, 150 extracted characters, and seven unique candidates.
- Existing reference, Blob-storage, publication, search, and automatic-topic suites: 19/19 PASS.
- `npm run lint`: PASS.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS with Next.js 16.2.1.
- Next.js function trace: PASS; the study admin function includes PDF.js, `@napi-rs/canvas`, and the native canvas binding.

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
✓ Compiled successfully in 12.3s
  Running TypeScript ...
  Finished TypeScript in 9.7s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/10) ...
  Generating static pages using 11 workers (2/10)
  Generating static pages using 11 workers (4/10)
  Generating static pages using 11 workers (7/10)
✓ Generating static pages using 11 workers (10/10) in 630ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /admin
├ ƒ /admin/tanulmanyok
├ ƒ /admin/temak
├ ƒ /admin/videok
├ ƒ /api/documents/[id]
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
