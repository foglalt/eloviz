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

## Revelation 22 visual redesign — 2026-07-22

- Replaced the dark stone-water hero and parchment-adjacent palette with an original luminous landscape of the river of life flowing from the throne, the tree spanning both banks, and fresh green plains.
- Rebuilt the public identity around Outfit and Source Sans 3, a spaced uppercase wordmark, a new tree-and-river mark/favicon, cool white surfaces, river blue, meadow green, and restrained pearl light.
- Removed the repeated hero image from the featured-study area and converted it into a calm cardless editorial feature; refreshed public buttons, lists, references, footer, hover states, and motion without changing information architecture.
- Retired the 2.4 MB legacy PNG and added an optimized 540 KB WebP hero with updated Open Graph/Twitter metadata and descriptive Hungarian alt text.
- Verified every public collection/detail route at 1440 px and 390 px, the complete first viewport at 320 px, real CTA/navigation/mobile-menu interactions, responsive image loading, and reduced-motion behavior.

## Vercel Blob OIDC compatibility — 2026-07-22

- Updated PDF upload and deletion storage selection to support Vercel's automatically supplied `BLOB_STORE_ID` plus short-lived `VERCEL_OIDC_TOKEN`, while retaining legacy `BLOB_READ_WRITE_TOKEN` compatibility.
- Kept the durable database fallback for missing, blank, or partial Blob credentials and documented the modern connected-store setup in the README and environment example.
- Added focused storage-configuration tests covering legacy authentication, complete OIDC authentication, partial credentials, and blank values.
- Passed storage and reference tests, lint, strict TypeScript, and the Next.js production build.

## Scalable study administration — 2026-07-22

- Removed the publication-readiness error from ordinary study edits. Saves now persist metadata and relationships, keep a study public when it has a finalized PDF, and automatically fall back to draft when publication is requested without one.
- Replaced the N+1 admin study load with a 30-item server-paginated title/slug search index plus one detailed query for the selected study; dashboard counts and video relationship options now use lightweight queries.
- Moved “Új tanulmány” into the study sidebar, made each compact row the navigation target, removed visible “Szerkesztés/Kiválasztva” labels, and retained accessible `aria-current` selection semantics with a single color highlight.
- Added searchable, scroll-bounded relation pickers for topics, videos, and studies so forms remain usable with 100+ catalogue entries.
- Passed publication, Blob, and reference tests, lint, strict TypeScript, production build, authenticated Chromium interaction checks, server-backed search, relationship filtering, and 390 px overflow verification.

## Public catalogue search — 2026-07-23

- Added a compact central search to the desktop header and the mobile menu, with native GET submission and no additional client-side search state.
- Added the Hungarian `/kereses` results page with grouped topics, finalized PDF studies, and video recommendations, plus clear short-query and empty states.
- Implemented bounded, parameterized database searches that exclude drafts and studies without a published document, match related published topic text, rank title matches first, and accept Hungarian searches without accents.
- Kept a bundled-content fallback for missing or unavailable database connections and added focused tests for normalization, cross-type/topic-context matching, accent-free input, and minimum query length.
- Marked result pages `noindex, follow`, while keeping all result destinations as normal crawlable detail links.
- Passed search, publication, Blob, and reference tests, lint, strict TypeScript, production build, desktop/mobile Chromium interaction checks, result navigation, empty-state metadata, and responsive overflow verification.

## Nunito typography refinement — 2026-07-23

- Replaced Outfit and Source Sans 3 with one Hungarian-capable Nunito family across headings, body copy, navigation, admin surfaces, and controls through `next/font`.
- Increased the hero eyebrow-to-title spacing from 14 px to 24 px so “MAGYAR BIBLIATANULMÁNYOK” no longer crowds the accented `ÉLŐ VÍZ` title.
- Confirmed the real Nunito webfont rather than its fallback at 1440×900 and 390×844, with a measured 24 px visual gap at both sizes.
- Verified the complete hero and both actions remain inside the first viewport, the mobile menu still fits, collection headings and body copy use Nunito, and no overflow, framework overlay, or browser console error appears.
- Passed lint, strict TypeScript, the production build, GTD phase verification, and repository health.

## Mobile menu interaction refinement — 2026-07-23

- Added outside-pointer dismissal to the mobile menu while preserving interaction with its search field and navigation links.
- Added Escape dismissal with focus returned to the menu trigger for keyboard users.
- Removed the browser-native cyan tap flash, established a 44 px trigger target, and added a restrained pale-green open state plus a keyboard-only teal focus ring.
- Extended the same native-highlight suppression, 44 px target, rounded pale-green pressed state, teal text, and keyboard focus treatment to every mobile navigation link.
- Aligned the menu panel directly beneath the 72 px header and verified the layout at 390 px and 320 px without horizontal overflow.
- Passed lint, strict TypeScript, the production build, focused Chromium interaction checks, GTD phase verification, and repository health.

## Site-wide interaction feedback — 2026-07-23

- Removed the browser-native tap highlight from all links, buttons, disclosures, labels, and form controls, including both Élő Víz logo links.
- Replaced default link/button/disclosure keyboard outlines with the established teal focus treatment while retaining the existing form-control focus system.
- Applied the pale-green and deep-teal selection palette globally so selectable content remains useful without reverting to browser blue.
- Audited the homepage, collections, search, representative detail pages, desktop navigation, mobile navigation, footer, and available admin controls at 1440 px, 390 px, and 320 px.
- Passed real logo/menu/hero/footer/search navigation, focused and held-state visual review, lint, strict TypeScript, production build, GTD phase verification, and repository health.

## Direct deletion workflow — 2026-07-24

- Removed the draft-first guard from confirmed topic, study, and video deletion; publication status is no longer an extra manual prerequisite.
- Made every study PDF version removable, including the current PDF of a published study.
- Automatically changes a study to draft, clears its publication readiness, and refreshes the public catalogue when its current PDF is removed; older-version removal leaves publication unchanged.
- Kept the title confirmation for whole-content deletion and the checkbox confirmation for individual PDF removal.
- Keyed the study editor form by the record update timestamp so automatic draft changes appear immediately after the server-action redirect.
- Passed five publication-state tests, lint, strict TypeScript, production build, authenticated desktop/mobile UI review, and temporary database-backed published-topic, published-study, PDF-removal, cascade, and cleanup checks.
