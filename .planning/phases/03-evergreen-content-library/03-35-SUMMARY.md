---
phase: 03
plan: 35
title: Newsletter migration readiness
status: complete
---

# Plan 03-35: Newsletter migration readiness

## Changes

- Authenticated, uncached portable JSON export in newsletter admin; all local
  consent/confirmation records, exclusions, delivery snapshots and provider states.
- Paginated provider contacts, dedicated segment members, suppressions and
  broadcasts. Only addresses from the site's database enter the export.
- Conservative reconciliation: any local/provider opt-out or block wins; pending,
  missing consent/provider membership and conflicting provider addresses stay
  ineligible. Incomplete/unstable pages or changed local snapshots fail the export.
- Cutover warnings for enabled sending, unresolved local runs, queued/scheduled
  provider broadcasts and recipients needing review; final reconciliation required.
- Hungarian migration guide covers paused senders/confirmation writes, block-first
  imports, old Resend unsubscribe links and webhook forwarding, pending tokens,
  DNS, provider-specific integration, reputation and rollback without repeat sends.
- No provider switch, paid purchase, subscription mutation or email sending.

## Verification

- All 86 repository tests passed, including seven export cases; 18 newsletter tests.
- Production build/strict TypeScript and lint passed.
- Actual account/database read-only export passed: four provider GETs, zero current
  recipients, one local digest run; sending_is_enabled is correctly flagged.
  Probe asserts no provider mutations and no API keys/tokens in the export.
- Browser download passed: logged-out request 401, authenticated JSON attachment
  200, private/no-store headers, versioned schema and cutover warning. Actual
  download button and 320/390/1440px admin fit passed; screenshot visually reviewed.
- GTD lint/build report passed and was read; no schema migration or DB mutation.
- Commit `e7e3058541150de584540479d77b35d3abc59ee4` pushed to origin/main;
  production `dpl_43CMawMyHbT3n9tf4jYTvZjuJv38` READY with exact SHA and www alias.
- Live export rejects unauthenticated requests with 401/private,no-store;
  newsletter admin redirects to login (307). Signup/Bible routes return 200.
  Authenticated attachment and real provider reconciliation were tested locally.
- Deployment-scoped error/fatal logs empty. Memory health passed; local auth and
  temporary downloaded snapshot removed; browser session closed.

## Remaining

- Plan complete and deployed. Resend continues sending on the existing schedule.
- A future provider replacement needs its own implementation and tests; existing
  Resend links require retaining the old account/webhook and forwarding opt-outs.
- Phase 04 Bible reader remains complete and deployed; this is scoped follow-up
  work in Phase 03 rather than reopening Bible-reader plans.
