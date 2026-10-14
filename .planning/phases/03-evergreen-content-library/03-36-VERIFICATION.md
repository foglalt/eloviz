# Plan 03-36 Verification

Date: 2026-10-13; production www.eloviz.hu; built-in browser for signup and
confirmation, authorized Opera Gmail accounts for actual receipt.

- PASS original: requested 13:49:46 UTC, Resend created 13:49:47 UTC, delivered;
  actual Gmail Inbox label, timestamp 15:49 Budapest, no spam label. Initially
  open Gmail view lacked recent mail until focused navigation refreshed it.
- PASS fresh: requested 14:00:37 UTC, Resend created 14:01:04 UTC, delivered;
  actual second Gmail Inbox message at 16:01. Small dispatch delay observed.
  Gmail sender details show rsend.eloviz.hu, signed-by eloviz.hu and TLS.
- PASS received link opens explicit confirmation page; button redirects to
  result=confirmed and renders "Feliratkozásod megerősítve" in built-in browser.
  Ignored user-facing screenshot: output/gmail-confirmation-success.png.
- PASS original confirmed independently at 14:01:03 UTC; fresh test confirmed
  by agent at 14:02:07 UTC. Both records subscribed with token expiry cleared;
  both dedicated Resend segment contacts unsubscribed=false. Accounts preserved.
- PASS `npm run test:newsletter`: 18/18, zero failures.
- PASS GTD verification: lint and production build/strict TypeScript, exit 0;
  generated phase report read and confirmed status passed (16:07 Budapest).
- PASS production error/fatal logs 13:33:40–14:03:40 UTC: no matches.
- No code fix required; no DNS/filter/provider configuration edits, real digest,
  unrelated message opening, subscriber deletion or actual provider migration.

Conclusion: Delivery and full confirmation flow work. Stale open Gmail view was
observed; exact reason user initially missed mail cannot be proven. No assertion
about Inbox category placement. No secrets or confirmation tokens retained here.
