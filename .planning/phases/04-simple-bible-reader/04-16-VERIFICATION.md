# 04-16 Verification

2026-10-26. Public signup -> form validation/honeypot -> Turnstile Siteverify
-> exact verified hostname/action -> existing rate-limited confirmation service
-> subscriber/email confirmation. Server rejects before persistence/send on failure.

## Cleanup/configuration

- Initial read:80pending+never-confirmed,3subscribed. Owner's2named exceptions
  bothpending.78other rows had no Resend contact IDs.
- PASS private recovery JSON round-trip verified before guarded delete. Date values
  normalized by JSON for comparison; initial comparison stopped before deletion.
  Removed78; remaining5. All retained records deep-equal to pre-cleanup snapshots.
  Exceptions remain pending (not auto-confirmed),3confirmed remain unchanged.
- Private backup: output/private-backups/unconfirmed-subscribers-2026-10-26.json,
  SHA256 c80d05fc0e34e46f58240ef13d78d310199907820d9424f51e204b755930f155.
  File and personal row data excluded from Git. No email/provider mutation.
- Owner supplied Cloudflare widget keys in.env. Vercel production contains
  NEXT_PUBLIC_TURNSTILE_SITE_KEY encrypted config and TURNSTILE_SECRET_KEY sensitive
  secret. CLI stdin used, no secret in arguments/output. Actual Siteverify200 /
  successfalse / invalid-input-response confirms invalid-token rejection and no
  missing/invalid-secret error. Existing newsletter settings unchanged.

## Automated/browser

- PASS128tests: missing/malformed/oversized tokens, missing keys/dummy production
  keys, exact allowed hostnames/action, invalid/expired/reused tokens, provider
  failure/timeout/malformed JSON, no success cache, exact server request/no email
  or subscriber data sent to Cloudflare. Consent/honeypot regression tests pass.
- PASS scripts/verify-newsletter-guard.mjs imports actual public action and real
  verifier with controlled Cloudflare responses. Rejected cases never call headers,
  subscriber persistence or mail service; valid proof alone reaches stubbed service;
  replay after first acceptance rejects. No DB/Resend request leaves this probe.
- PASS actual local Opera and built-in browser with official dummy sitekeys only:
  widget shows Hungarian success; enabled submit; invalid email repeated2times
  retains email+consent and remounts/refreshes challenge before next submit.
- Both closed first-visit dialog and dedicated signup coexist in layout. Fixed
  shared Next Script onLoad/onReady handling so both widgets initialize. Resize
  observer handles actual container width and Strict Mode teardown; no SDK ready()
  call with async script. Temporary diagnostics removed.
- PASS390px dedicated form flexible widget;320px compact widget, no horizontal
  overflow (scrollWidth=clientWidth305).320px first-visit modal compact success
  widget fits, bodyfixed/rootoverflowhidden retained; inner modal scrolls, Escape
  restores prior body/root styles. No real CAPTCHA automated or test email sent.

## Build/release/cleanup

- PASS GTD04 report2026-10-26T14:00:17+01:00: lint/build0, production compile
  and TypeScript; standalone tsc passed. React review: external widget lifecycle
  subscription via ResizeObserver; useEffectEvent for latest token callback,
  teardown/remount and shared script callbacks reviewed; server secret stays in
  server-only module, no client import of environment/private configuration.
- PASS a58df837f7aee5d8c04856cdd197bb80996e4669 pushed to origin/main;
  dpl_Yns2ND8yoPocJ4x9ocxRSdYNfi8J READY for exact SHA and www.eloviz.hu alias.
- PASS actual live Opera Managed widget renders Hungarian success, no manual
  CAPTCHA solving. Owner-authorized already-active test address submitted through
  actual form; Cloudflare host/action/token check accepted and real signup action
  returned expected generic success. Existing active record is ignored by service
  upsert, no additional confirmation email/new subscriber; post-check3active+2pending.
- PASS owner's signed-in admin tab refreshed: robot-protection configured status,
  table5rows, exactly named2pending exceptions. Weekly delivery remains enabled.
- PASS private secret absent from every built browser JS chunk. Deployment-scoped
  error/fatal runtime logs empty. Prior local chrome-error console entry from
  stopping dev for build is not a production app error.
- Screenshot output/newsletter-human-check-live.png shows the blank live form
  and successful actual widget; no private key or subscriber list in screenshot.
- PASS Opera agent test169735293 closed and verified absent. Cloudflare169735281
  not present after owner's setup; no agent closure claimed. Owner169735043
  remains at admin subscriber URL. IAB pre-existing tab1 unchanged; agenttab2
  became generated data: error page when local dev stopped for build, explicit
  close rejected by browser URL guard. No bypass; temporary cleanup pending.
  Viewport reset, no service stopped for tab cleanup. Provenance recorded in
  tmp/agent-project-tabs.json. User's digest-intro edit remains unstaged.
- Final health/whitespace checks passed; planning state and completion updated.
