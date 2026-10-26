---
phase: 04
plan: 16
status: complete
---

# 04-16 Summary

- Required Managed Cloudflare Turnstile in both public signup surfaces. Hungarian
  widget, flexible/compact layout selected from actual container width, native
  consent/email inputs preserved on error. Fresh challenge after each action,
  expiry/error invalidation, script timeout and retry control; no insecure fallback.
- Server validates single-use token using Siteverify with8s timeout/no cache,
  requires exact newsletter_signup action and eloviz.hu/www.eloviz.hu hostname
  before requestNewsletterConfirmation. Missing keys/tokens, expired/reused tokens,
  wrong action/host and provider outage fail closed. Published dummy test keys
  rejected under production/Vercel. Existing honeypot/limits/double opt-in retained.
- Admin reports human-check configuration, independent of weekly delivery. Owner
  created widget/keys in.env; uploaded public sitekey and sensitive server secret
  to Vercel production via stdin, no secret logging. Actual negative API probe
  accepts secret and rejects invalid token. No DNS/hosting changes.
-78initial pending+never-confirmed subscribers removed under guarded ID/status
  predicates;2named exceptions and3confirmed subscribers verified unchanged.
  Private recovery JSON saved outside Git; no removed record had a Resend contact,
  no provider deletes or messages. Confirmation links for deleted rows are inert.
-128tests and real action orchestration probe pass. Desktop/390/320 test-widget
  layout, repeated validation/token refresh, preserved inputs/consent, first-visit
  modal scrolling/close restoration pass. Full build/release evidence follows
  in04-16-VERIFICATION.md. Pre-existing newsletter digest intro edit left unstaged.

- Released a58df837f7aee5d8c04856cdd197bb80996e4669 /
  dpl_Yns2ND8yoPocJ4x9ocxRSdYNfi8J READY on www.eloviz.hu. Live Managed widget
  auto-attested the browser; real signup action accepted proof for already-active
  authorized test account (no new row/email). Admin shows Turnstile active and5rows.
  Post-check DB remains3active+2pending; deployment error/fatal logs empty.
- Agent Opera test tab closed/absence verified; Cloudflare setup tab no longer
  present after owner's setup. Owner admin remains open/refreshed. IAB error-page
  close rejected by URL guard, left for temporary cleanup; pre-existing tab retained.
