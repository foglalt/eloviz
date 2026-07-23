---
generated: 2026-07-23T11:41:18+02:00
status: passed
---

# Verification Report

## Summary

- Status: **passed**
- Timestamp: 2026-07-23T11:41:18+02:00

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
✓ Compiled successfully in 9.1s
  Running TypeScript ...
  Finished TypeScript in 6.8s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/10) ...
  Generating static pages using 11 workers (2/10)
  Generating static pages using 11 workers (4/10)
  Generating static pages using 11 workers (7/10)
✓ Generating static pages using 11 workers (10/10) in 402ms
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

## Focused Nunito typography evidence

- `npx tsc --noEmit`: PASS.
- Desktop Chromium at 1440×900: PASS — computed heading and body families are `Nunito, "Nunito Fallback", sans-serif`, `document.fonts.status` is `loaded`, and the measured eyebrow/title gap is 24 px.
- Desktop first viewport: PASS — the hero actions end at 819 px inside the 900 px viewport; there is no horizontal overflow, framework overlay, or browser console error.
- Mobile Chromium at 390×844: PASS — the measured eyebrow/title gap remains 24 px, both actions end at 786 px inside the viewport, and horizontal overflow is zero.
- Collection typography: PASS — `/temak` computes Nunito for both the page heading and body copy with zero overflow.
- Mobile-menu interaction: PASS — the native menu opens through a real click, computes Nunito, stays within the 390 px viewport, and produces no overflow.
- Visual inspection: PASS — the softer rounded letterforms retain readable contrast and hierarchy, while the increased gap clearly separates “MAGYAR BIBLIATANULMÁNYOK” from the accented title.

## Retained public-search evidence

- `npm run test:search`: PASS — 3/3 checks for whitespace/accent normalization, grouped topic/study/video matching through related topic context, accent-free input, and minimum query length.
- `npm run test:publication`: PASS — 3/3 publication-invariant checks.
- `npm run test:storage`: PASS — 3/3 Blob configuration checks.
- `npm run test:references`: PASS — 3/3 reference parsing checks.
- Database-backed `szovetseg` submission: PASS — `/kereses?q=szovetseg` returned published results grouped across topics, finalized PDF studies, and videos.
- Mobile search at 390×844: PASS — the header search submits correctly, result navigation works, the unmatched-query state is clear, and search pages emit `robots: noindex, follow`.

## Retained maintenance evidence

- Authenticated Chromium at 1440×1000: PASS — the study editor provides embedded creation, title/slug search, compact rows, and no framework overlay or console errors.
- Study navigation: PASS — the complete row is the link, exactly one row receives `aria-current="page"` and the teal selection state, and no visible “Szerkesztés” or “Kiválasztva” labels remain.
- Admin search and high-volume controls: PASS — server-backed study search and bounded relation filtering preserve selected records and checked inputs.
- Admin mobile at 390×844: PASS — no horizontal overflow, the sidebar returns to normal document flow, selection remains visible, and the editor follows below it.

## Retained public-site evidence

- Desktop first viewport at 1440×900: PASS — throne, river, joined tree canopy, meadow, brand, quotation, and both calls to action are visible; no horizontal overflow.
- Mobile first viewport at 390×844 and compact 320×700: PASS — responsive crop retains the river/tree scene and distant throne; brand, quotation, and both actions fit above the fold.
- Public route sweep: PASS — home, all three collections, topic/study/video details, sitemap, PDF delivery, not-found behavior, and legacy redirects were previously checked at desktop and mobile widths.
- Interaction pass: PASS — desktop navigation, hero study CTA, and the full mobile-menu open/navigate/close cycle work with real clicks.
- Reduced motion: PASS — hero animation duration collapses to `0.01ms` with one iteration.
- Browser console: no application errors.
