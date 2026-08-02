---
generated: 2026-08-02T16:51:40+02:00
status: passed
---

# Verification Report

## Summary

- Status: **passed**
- Timestamp: 2026-08-02T16:51:40+02:00

## Checks

| Command | Exit | Result |
|---|---:|---|
| `npm run lint` | 0 | PASS |
| `npm run build` | 0 | PASS |

## Plan 03-30 Evidence

- 51 focused tests passed, including three canonical study-relation tests;
  strict TypeScript also passed.
- Migration `006_study_relations` applied to production. A transactional probe
  resolved the same stored pair from both study IDs and removed its temporary
  records before completion.
- Authenticated local admin checks confirmed three aligned relation pickers,
  self-exclusion, study A selecting B and B loading A as selected, and a study
  selecting a video that the video editor loaded in reverse.
- Isolated public probe records confirmed bidirectional study links, related
  study/video sidebar sections, draft filtering, removal of wide related lists,
  mobile section order, and zero horizontal overflow. All probe studies,
  documents, videos, and relations were deleted after verification.
- Production deployment `dpl_ALdtMfjpJYoJ8tNLtB23qLn8ekjv` reached READY.
  Live study/video pages returned 200, retained their article/embed and compact
  sidebars, had no browser errors or overflow, and the admin remained protected.
- Deployment-scoped error/fatal logs and route error clusters were clean.

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
✓ Compiled successfully in 6.7s
  Running TypeScript ...
  Finished TypeScript in 5.7s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/12) ...
  Generating static pages using 11 workers (3/12)
  Generating static pages using 11 workers (6/12)
  Generating static pages using 11 workers (9/12)
✓ Generating static pages using 11 workers (12/12) in 796ms
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
