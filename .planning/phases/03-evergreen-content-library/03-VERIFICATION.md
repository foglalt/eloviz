---
generated: 2026-10-14T09:48:40+02:00
status: passed
---

# Verification Report

## Summary

- Status: **passed**
- Timestamp: 2026-10-14T09:48:40+02:00

## Checks

| Command | Exit | Result |
|---|---:|---|
| `npm run lint` | 0 | PASS |
| `npm run build` | 0 | PASS |

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
✓ Compiled successfully in 15.3s
  Running TypeScript ...
  Finished TypeScript in 9.2s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/16) ...
  Generating static pages using 11 workers (4/16)
  Generating static pages using 11 workers (8/16)
  Generating static pages using 11 workers (12/16)
✓ Generating static pages using 11 workers (16/16) in 1229ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /admin
├ ƒ /admin/feliratkozok
├ ƒ /admin/feliratkozok/export
├ ƒ /admin/sorozatok
├ ƒ /admin/tanulmanyok
├ ƒ /admin/temak
├ ƒ /admin/videok
├ ƒ /api/analytics
├ ƒ /api/cron/newsletter
├ ƒ /api/documents/[id]
├ ƒ /api/newsletter/webhook
├ ƒ /api/youtube-metadata
├ ƒ /biblia
├ ƒ /biblia/karoli-1908/[book]
├ ƒ /biblia/karoli-1908/[book]/[chapter]
├ ƒ /biblia/megnyitas
├ ƒ /feliratkozas
├ ƒ /feliratkozas/megerosites
├ ƒ /kereses
├ ○ /robots.txt
├ ○ /sitemap.xml
├ ƒ /sorozatok
├ ƒ /sorozatok/[slug]
├ ○ /tanulmanyok
├ ƒ /tanulmanyok/[slug]
├ ○ /temak
├ ƒ /temak/[slug]
├ ○ /videok
└ ƒ /videok/[slug]


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```
