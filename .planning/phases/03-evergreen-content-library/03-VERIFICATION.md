---
generated: 2026-07-26T10:56:36+02:00
status: passed
---

# Verification Report

## Summary

- Status: **passed**
- Timestamp: 2026-07-26T10:56:36+02:00

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
✓ Compiled successfully in 12.0s
  Running TypeScript ...
  Finished TypeScript in 11.6s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/10) ...
  Generating static pages using 11 workers (2/10)
  Generating static pages using 11 workers (4/10)
  Generating static pages using 11 workers (7/10)
✓ Generating static pages using 11 workers (10/10) in 3.1s
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

## Additional evidence

- `npm run test:references`: PASS; four tests cover canonical alias deduplication, single/range/cross-chapter OSIS formatting, and detection across previously missing canonical books.
- `npm run test:storage`: PASS; 3/3.
- `npm run test:publication`: PASS; 5/5.
- `npm run test:search`: PASS; 3/3.
- `npm run test:topics`: PASS; 5/5.
- `npm run test:pdf`: PASS; 1/1.
- `npx tsc --noEmit`: PASS.
- Static inspection: no manual finalization action, third-step review UI, pending-review dashboard queue, or manual-review copy remains in application code.
- Upload integrity: extraction/short-text failures return before storage; successful document, candidate, finalized-reference, and current-pointer writes use one Neon transaction.
- `scripts/gtd.ps1 health`: PASS.
- Vercel production deployment `dpl_8YCudqoQDCg2mWAFMqP7zAc2CuT1`: READY from commit `7690bb7`.
- Production normalization: 11 stored labels changed to the canonical Hungarian format; one staged complete document finalized with seven accepted references.
- `Teszt.pdf` state: extraction `complete`, current document pointer set, `reference_reviewed=true`, study status still `draft`, and all seven candidates accepted.
- `Teszt.pdf` canonical labels: `Zsid 8:4`, `Zsid 11:1`, `1Kor 5:8`, `1Kor 8:5`, `1Kor 8:1`, `2Móz 12:1-28`, and `2Móz 13:28-30`.
- Idempotence: second `npm run db:normalize-references` run reported zero normalized labels, zero finalized documents, and zero finalized references.
