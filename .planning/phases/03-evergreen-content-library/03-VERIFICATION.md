---
generated: 2026-07-22T13:20:29+02:00
status: passed
---

# Verification Report

## Summary

- Status: **passed**
- Timestamp: 2026-07-22T13:20:29+02:00

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

## Manual and browser evidence

- `npm run test:references`: PASS — 3/3 tests for Hungarian references, ranges, deduplication, and reviewed OSIS lines.
- `npx tsc --noEmit`: PASS.
- `npm run db:migrate` and `npm run db:seed`: PASS — migrations 001/002 applied, 66 books, 5 topics, 3 studies, and 1 video present.
- Chromium production-route smoke test: PASS — `/`, topic, study, video, and authenticated admin routes returned 200 with a single descriptive H1 and no console/page errors.
- Missing study: PASS — returned 404.
- Sitemap: PASS — includes the seeded study and video URLs; public queries exclude drafts.
- Controlled PDF response: PASS — returned 200, `application/pdf`, and `X-Robots-Tag: noindex, nofollow`.
- Legacy redirects: PASS — `/studies` → `/tanulmanyok`, `/kviz` → `/`, `/husvet` → `/`, each as one permanent 308 hop.
- Responsive checks: PASS — home, topic list, study, video, and admin had `scrollWidth === viewport width` at 390 px; desktop and mobile screenshots were visually inspected.
- Admin protection: PASS — unauthenticated `/admin/tanulmanyok` returned to `/admin`; authenticated production route returned 200.
- Admin editing: PASS — existing topic and video saved successfully.
- Full study lifecycle: PASS — created a draft, uploaded a real PDF, detected 4 references with page/context evidence, confirmed and published them, verified the public page and reference list, returned the study to draft, then safely deleted it; the deleted public slug returned 404.
- Seed PDF visual check: PASS — rendered pages had correct Hungarian typography, margins, hierarchy, references, and no clipping.
- Security headers: PASS — `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial present.

Browser artifacts are stored locally under ignored `output/playwright/`; the private legacy backup is under ignored `output/private-backups/`.

### Post-launch layout/menu/footer regression — 2026-07-22

- Targeted ESLint and strict TypeScript: PASS.
- Mobile hero gutter at 390 px: PASS — left edge 16 px, right edge 16 px.
- Desktop hero gutter at 1440 px: PASS — left/right edge 130 px around the 1180 px content column.
- Mobile menu: PASS — open before selecting `/temak`, closed immediately after navigation.
- Footer: PASS — exact requested combined quotation/reference present; obsolete footer-bottom row absent.
- Chromium console errors: none.

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
✓ Compiled successfully in 43s
  Running TypeScript ...
  Finished TypeScript in 97s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/9) ...
  Generating static pages using 11 workers (2/9)
  Generating static pages using 11 workers (4/9)
  Generating static pages using 11 workers (6/9)
✓ Generating static pages using 11 workers (9/9) in 6.9s
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /admin
├ ƒ /admin/tanulmanyok
├ ƒ /admin/temak
├ ƒ /admin/videok
├ ƒ /api/documents/[id]
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
