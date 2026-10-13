---
generated: 2026-10-13T11:52:21+02:00
status: passed
---

# Verification Report

## Summary

- Status: **passed**
- Timestamp: 2026-10-13T11:52:21+02:00

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
✓ Compiled successfully in 5.6s
  Running TypeScript ...
  Finished TypeScript in 4.8s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/14) ...
  Generating static pages using 11 workers (3/14)
  Generating static pages using 11 workers (6/14)
  Generating static pages using 11 workers (10/14)
✓ Generating static pages using 11 workers (14/14) in 620ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /admin
├ ƒ /admin/feliratkozok
├ ƒ /admin/sorozatok
├ ƒ /admin/tanulmanyok
├ ƒ /admin/temak
├ ƒ /admin/videok
├ ƒ /api/analytics
├ ƒ /api/cron/newsletter
├ ƒ /api/documents/[id]
├ ƒ /api/newsletter/webhook
├ ƒ /api/youtube-metadata
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

## Plan 03-34 additional evidence

- All 70 unit tests and 11 focused newsletter tests passed.
- Database/transport probes passed pending signup, hashed/expired/single-use tokens,
  resend/rate limits, publication boundaries, draft exclusion, atomic claims,
  repeat suppression, empty week, lost-response recovery, signed/stale opt-outs.
- Chromium public signup/confirmation/protection/footer passed at 320/390/1440px;
  authenticated admin passed at 390/1440px. Mobile email template visually passed.
- Real Resend confirmation and weekly newsletter delivered to a reserved labeled
  test sink. Successful broadcast: 92278376-5112-448c-9d54-99914c2db4fd.
  No duplicate email on repeat; test contact, segment and database fixtures removed.
  Delivery checked through individual email events after queued sending completed;
  aggregate recipient statistics lag. Early disposable probe cleanup was corrected.
- Rackhost DKIM name corrected to resend._domainkey.eloviz.hu; authoritative DNS
  and Resend verification passed. User selected Élő Víz <hirlevel@eloviz.hu>.
- Dedicated segment, signed unsubscribe webhook and production configuration ready.
  Secrets never printed or tracked; sensitive production storage confirmed.
- Production rollout is pending exact-commit live verification.
