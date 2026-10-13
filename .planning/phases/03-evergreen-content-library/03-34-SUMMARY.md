---
phase: 03
plan: 34
title: Weekly email digests and subscription lifecycle
status: verified-awaiting-production-rollout
---

# Plan 03-34 implementation and remaining rollout

## Changes

- New Hungarian `/feliratkozas` entry from the footer and first-visit notice; shared
  React Action form, explicit consent, honeypot, retained fields on error.
- Pending subscriptions, 72-hour SHA-256 token confirmation with an explicit POST
  button (email scanner GETs cannot subscribe), per-address/IP/day throttles, and
  confirmation-triggered membership in a dedicated Resend segment.
- Verified signed Resend contact opt-out/deletion webhook; stale opt-outs and
  provider opt-ins cannot silently reactivate subscribers.
- Weekly Sunday 18:00 UTC digest of newly published readable studies and videos,
  ordered series chapter context, no attachments, HTML/text escaping and native
  unsubscribe links. Empty weeks and lists skip delivery.
- Atomic per-period run claims, durable draft IDs and content snapshots; provider
  rate-limit retries and uncertain-send reconciliation avoid blind duplicate sends.
- Authenticated setup status, subscriber states, preview and twelve-run history.
- Existing-account setup script validates sender domain, configures isolated
  segment/webhook and saves secrets only in ignored `.env`. No billing upgrades.
- Migration 009 applied to the real database; no existing subscribers at start.

## Verification

- All 70 unit tests and 11 focused newsletter tests passed.
- Production build/strict TypeScript passed; lint passed. Database/provider test
  transport probes passed signup, token hashing/reuse, resend/rate limits,
  publication boundaries, draft exclusion, concurrent/repeated execution,
  empty week, lost send response and signed/stale unsubscribe handling.
- All integration fixtures were removed. Test provider interception is restricted
  to the verification script; application delivery uses the real Resend SDK.
- Chromium signup, consent/invalid-email/provider-setup errors, retained inputs,
  scanner-safe confirmation/expiry/referrer, admin protection, footer entry and
  320/390/1440px fit passed. Authenticated admin 390/1440px and mobile email checks
  passed. Form reset and footer overflow corrected.
- Real confirmation and weekly newsletter delivered to a labeled reserved
  `delivered@resend.dev` sink; token confirmed into an isolated temporary segment;
  repeat suppressed. Successful test broadcast:
  `92278376-5112-448c-9d54-99914c2db4fd`; owned contacts/segment/DB records removed.
  The probe waits for completed sending before cleanup and uses the individual
  email delivery event, because aggregate recipient metrics update later.
- GTD report read: lint/build/strict TypeScript passed. Memory health passed.
  The old collector's default remains compatible; new signup inserts pending explicitly.

## Connection and rollout

- User supplied Full access key and selected `Élő Víz <hirlevel@eloviz.hu>`.
  Dedicated segment and signed opt-out/deletion webhook are configured.
- User requested Rackhost inspection in Opera. Its correct DKIM value was under
  `resend.eloviz.hu`. Corrected its name to `resend._domainkey.eloviz.hu`;
  Rackhost and authoritative DNS show the change; Resend verifies all records.
- Six server-only production settings stored securely; secrets never printed or
  committed. `NEWSLETTER_ENABLED=true` after real provider tests.
- Commit/push and exact-commit production verification are next.
- Pricing checked 2026-10-13: Marketing Free 1000 account-wide contacts/unlimited
  broadcasts; confirmations use transactional Free 100/day and 3000/month.
  Existing services: Vercel hosting/Cron, Neon Postgres (Launch shared account),
  Resend delivery. Cron weekly cadence fits all Vercel plans.

## Resume

Finish commit/push and verify deployment, live browser signup with a reserved
recipient, signed live webhook and protected cron. Record deployment evidence and
mark plan/state complete.
