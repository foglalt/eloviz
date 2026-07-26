---
generated: 2026-07-26T12:57:26+02:00
status: passed
---

# Verification Report

## Summary

- Status: **passed**
- Timestamp: 2026-07-26T12:57:26+02:00

## Checks

| Command | Exit | Result |
|---|---:|---|
| `npm run test:youtube` | 0 | PASS — 2 tests |
| `npm run test:search` | 0 | PASS — 4 tests |
| `npm run db:migrate` | 0 | PASS — migration 003 applied |
| `npm run lint` | 0 | PASS |
| `npm run build` | 0 | PASS |
| Production deployment `dpl_6Z7y7jiGgpHo88pHif5rnpxP84C3` | — | READY |
| Authenticated desktop and 390×844 editor checks | — | PASS |

## Production UI Evidence

- A valid YouTube link derived the title `Áttekintés: Jeremiás` and channel `BibleProject - Hungarian / Magyarország` in the editor.
- Both topic/related-study pickers measured 240 px at desktop and 390 px viewport widths.
- The mobile relationship layout resolved to one column with no horizontal overflow.

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
✓ Compiled successfully in 9.5s
  Running TypeScript ...
  Finished TypeScript in 4.8s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/11) ...
  Generating static pages using 11 workers (2/11) 
  Generating static pages using 11 workers (5/11) 
  Generating static pages using 11 workers (8/11) 
✓ Generating static pages using 11 workers (11/11) in 547ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /admin
├ ƒ /admin/tanulmanyok
├ ƒ /admin/temak
├ ƒ /admin/videok
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
