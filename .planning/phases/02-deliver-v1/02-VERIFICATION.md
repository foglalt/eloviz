---
generated: 2026-04-01T20:58:48+02:00
status: passed
---

# Verification Report

## Summary

- Status: **passed**
- Timestamp: 2026-04-01T20:58:49+02:00

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
> eslint .
```

### npm run build

Exit code: 0

```text
> eloviz@0.1.0 build
> next build

▲ Next.js 16.2.1 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 3.3s
  Running TypeScript ...
  Finished TypeScript in 3.9s ...
  Collecting page data using 8 workers ...
  Generating static pages using 8 workers (0/5) ...
  Generating static pages using 8 workers (1/5) 
  Generating static pages using 8 workers (2/5) 
  Generating static pages using 8 workers (3/5) 
✓ Generating static pages using 8 workers (5/5) in 711ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /admin
├ ƒ /api/quiz-progress
├ ƒ /kviz
└ ○ /studies


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```
