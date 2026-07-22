---
generated: 2026-07-22T16:30:33+02:00
status: passed
---

# Verification Report

## Summary

- Status: **passed**
- Timestamp: 2026-07-22T16:30:33+02:00

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

- `npm run test:references`: PASS — 3/3 reference parsing tests.
- `npx tsc --noEmit`: PASS.
- Desktop first viewport at 1440×900: PASS — throne, river, joined tree canopy, meadow, brand, quotation, and both calls to action are visible; no horizontal overflow.
- Mobile first viewport at 390×844 and compact 320×700: PASS — responsive crop retains the river/tree scene and distant throne; brand, quotation, and both actions fit above the fold.
- Identity separation: PASS — computed wordmark/heading font is Outfit, the logo is uppercase sans-serif, all brown/sepia design tokens and the old stone-water image are absent, and the body uses cool white/green surfaces.
- Public route sweep: PASS — home, all three collections, three topic details, three study details, and the video detail have no overflow at 1440 px or 390 px after correcting the long `Bibliatanulmányok` mobile heading.
- Interaction pass: PASS — desktop navigation, hero study CTA, and the full mobile-menu open/navigate/close cycle work with real clicks.
- Reduced motion: PASS — hero animation duration collapses to `0.01ms` with one iteration.
- Visual inspection: PASS — home hero, full landing page, mobile collection page, and study detail were reviewed for crop, contrast, hierarchy, typography, spacing, clipping, and unwanted resemblance to the retired styling.
- Browser console: no application errors; the initial `127.0.0.1` HMR origin warning was eliminated by restarting the dev server and testing through `localhost`.

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
✓ Compiled successfully in 8.8s
  Running TypeScript ...
  Finished TypeScript in 9.8s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/9) ...
  Generating static pages using 11 workers (2/9)
  Generating static pages using 11 workers (4/9)
  Generating static pages using 11 workers (6/9)
✓ Generating static pages using 11 workers (9/9) in 916ms
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
