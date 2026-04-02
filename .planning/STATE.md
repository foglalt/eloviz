# Project State

**Project:** eloviz
**Current Phase:** 02
**Current Phase Name:** Deliver V1
**Current Plan:** 02-13
**Total Plans in Phase:** 13
**Status:** Completed plan 02-13
**Progress:** 100%
**Last Activity:** 2026-04-02
**Last Activity Description:** Portaled shared Baja invite modal overlay to document.body and verified phase checks
**Paused At:** None

## Recent Decisions

- Quiz content is now stored in Neon when `DATABASE_URL` is available, with seeded defaults as a fallback.
- `/admin` is protected by `ADMIN_PASSWORD` and a signed cookie session instead of a larger auth system.
- The public and admin surfaces now use a warmer parchment/clay palette instead of the earlier cool aqua theme.
- The public quiz now shows one question at a time and uses optional verse-location hints instead of correctness feedback.
- The site favicon now uses a custom open-Bible and living-water mark instead of the generic placeholder.
- The site now includes a `/studies` route with collapsible topics and browser-based PDF export.
- The Easter surface now includes a reusable learn-more CTA at the end of the quiz and below the timeline that opens the shared Baja invite modal.
- The public Easter surface now includes a floating Adventist church invite badge with a Baja visit modal, simple map on larger screens, the provided Hungarian Adventist SVG mark cropped to the symbol, a re-centered floating badge mark, and a tighter mobile sheet layout without the map.
- The public quiz now removes the hero, uses only a compact progress bar, keeps a small previous-next navigation row, keeps the Adventist badge as a compact round button on phones, clips answer-card tap feedback to the rounded option shape, and ends with a Baja church invitation plus a secondary expandable answer review.
- The public quiz now restores quiz progress on the same device.
- The completed quiz screen now includes a restart button that clears the saved same-device quiz progress and returns the visitor to the first question.
- The public quiz now reports device-level progress and correctness snapshots to a server-side store, and the admin page lists saved contacts plus per-device quiz progress and success when `DATABASE_URL` is configured.
- The Adventist invite dialog now uses its own centered modal-logo sizing so the symbol sits correctly inside the circular frame on phones, and the round logo frame itself is centered in the mobile modal header.
- The rounded public pill and circular controls now suppress the browser's rectangular tap highlight and clip feedback to their real shape on mobile.
- The completed quiz invitation now uses the same address and Saturday-service card styling as the Adventist modal instead of a separate oversized variant.
- The Baja church content now keeps separate title and lead-copy entries for the modal and the completed quiz screen while continuing to share the address and service details.
- The completed quiz review now shows each question's related Bible verse reference, and the stale unused helper warning in the quiz client component has been removed.
- The floating Adventist badge now disappears on the completed quiz screen only, and returns on the active quiz flow and elsewhere in the public site.
- Timeline detail finalization remains separate follow-up work after the Adventist invite work.
- Public modals now share a reusable accessibility hook (focus trap, Escape close, scroll lock, focus restore), common parsing utilities are deduplicated, and README now matches the Next.js stack.
- The quiz/admin oversized clients are now split into hook + UI modules, shared CSS primitives now cover repeated pill/label patterns, and unused media plus manual `next-env.d.ts` import drift were removed.
- The contact CTA now opens the same reusable Baja church modal template as the floating Adventist badge, removing the separate contact form modal variant.
- The shared Baja invite modal now renders through a `document.body` portal, preventing backdrop clipping caused by transformed quiz containers.

## Blockers

- `DATABASE_URL` is not exposed in the local shell used for this session, so Neon-backed save operations were not exercised locally.

## Session

**Last Date:** 2026-04-02T10:40:00+02:00
**Stopped At:** Plan 02-13 completed and verified
**Resume File:** .planning/phases/02-deliver-v1/02-13-SUMMARY.md

