---
phase: 03
plan: 32
status: completed
completed: 2026-08-21
---

# 03-32 Summary: Add first-visit email signup

- Added a restrained, responsive first-visit dialog that clearly says the site
  is under development and continuously growing, then offers optional email
  updates about newly added studies and other content.
- Added explicit consent, inline Hungarian validation, pending/error/success
  states, a spam honeypot, and one-year dismissal persistence without storing
  personal visitor data in the browser marker.
- Added normalized, unique subscriber storage through migration 007. Repeated
  signup reactivates the same address instead of creating duplicates; no
  newsletter sending is part of this plan.
- Added a protected `/admin/feliratkozok` list, navigation entry, and dashboard
  count so collected addresses and consent times are visible only after login.

## Verification

- Five newsletter validation tests, ESLint, strict TypeScript, and the production
  build passed.
- Migration 007 applied successfully. A temporary database probe confirmed
  insert/read behavior and removed its synthetic address afterward.
- Desktop and 390 px browser checks passed for first display, Hungarian copy,
  focus, invalid feedback, dismissal persistence, and horizontal overflow.
- Unauthenticated access to `/admin/feliratkozok` redirected to `/admin`.
- A browser runtime issue in the first draft (a non-function export from a
  `use server` module) was found during interaction testing, fixed, and retested.

---
*Completed: 2026-08-21*

## State Recheck — 2026-10-13

- All 58 current automated tests passed, including the five newsletter tests.
- GTD lint/build verification (including TypeScript) and memory health passed;
  fresh evidence is in `03-VERIFICATION.md`.
- Implementation is still uncommitted. No plan 03-32 production rollout is
  recorded; the live homepage returned HTTP 200 but lacked the local notice markup.
- This audit did not repeat the recorded database migration or browser checks.

## Release — 2026-10-13

- Accepted signup changes were included in commit `de50aab` with plan 03-33,
  pushed to `main`, and deployed through the connected Vercel project.
- Deployment `dpl_DRzEst1fqvPYtV5xG1KpXmDLgNhS` reached READY. Live homepage
  contains the first-visit notice; subscriber administration redirects anonymous
  users to login. No notification emails were sent.
