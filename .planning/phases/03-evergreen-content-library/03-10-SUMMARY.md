---
phase: 03
plan: 10
status: completed
completed: 2026-07-22
---

# 03-10 Summary: Cutover and verification

- Removed the legacy Easter route tree, quiz/contact stores, unused assets, and legacy database tables after a private backup.
- Added permanent redirects from `/studies`, `/kviz`, and `/husvet` to the new information architecture.
- Passed reference tests, targeted lint, strict TypeScript, production build, live database checks, desktop/mobile visual review, route/404/sitemap/PDF checks, admin CRUD saves, and a complete PDF publication lifecycle.

## Post-launch hotfix — 2026-07-22

- Centered the constrained hero content column so it keeps the shared 16 px mobile and 130 px desktop gutter instead of touching the viewport edge.
- Added a minimal client-side mobile menu boundary that closes the native details menu when a navigation link is selected.
- Replaced the split footer attribution with the requested single Revelation 22:17 quotation line.

## Admin editor reliability hotfix — 2026-07-22

- Reduced utility-panel heading sizes and fixed intrinsic grid/file-input sizing so the study editor has no horizontal overflow at 390 px.
- Added a visible and accessible selected state to topic, study, and video records; keyed forms now fully hydrate when editors switch directly between records or return to a new item.
- Added authenticated PDF view links and per-version removal with explicit confirmation, while preventing removal of the active PDF from a published study.
- Verified all editor routes at 390 px and 1440 px, direct client-side record switching, complete study/video field population, controlled PDF responses, and a temporary draft upload/view/remove/delete lifecycle.
