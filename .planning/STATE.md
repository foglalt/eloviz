# Project State

**Project:** Élő Víz
**Current Phase:** 03
**Current Phase Name:** Evergreen Content Library
**Current Plan:** 03-31
**Total Plans in Phase:** 31
**Status:** Completed and verified
**Progress:** 100%
**Last Activity:** 2026-08-03
**Last Activity Description:** Deployed the Blob credential fix and migrated the existing PDF from Postgres to Blob
**Paused At:** Plan 03-31 complete, deployed, migrated, and verified

## Delivered

- Hungarian topic, PDF-study, and YouTube-video library with dedicated public pages and relations.
- Versioned PDF upload with validation, extraction, evidence-backed automatic reference finalization, canonical OSIS ranges, and normalized Hungarian display labels.
- Password-protected editorial admin with publication lifecycle, ordering, SEO fields, relations, and safe deletion.
- Living-water visual identity, Revelation 22:17 invitation, responsive layouts, sitemap, canonicals, structured data, and controlled PDF delivery.
- Five seeded topics, three polished study PDFs, and one verified Hungarian BibleProject video.
- Legacy code and database tables retired after local private backup; old routes permanently redirected.
- Text-readable study PDFs now publish a safe semantic HTML reading view while the original PDF remains downloadable.
- Study-study and study-video relationships are bidirectional, editable from either side, and presented in public detail sidebars.
- Production PDF uploads now use explicit legacy-token or request-context OIDC
  Blob authentication, cannot silently fall back to Postgres, and include a
  checksum-verifying migration path for legacy database-backed documents.

## Verification Snapshot

- Reference detector tests, lint, strict TypeScript, production build: passed.
- Chromium route, 404, sitemap, PDF header, responsive overflow, admin protection, and CRUD checks: passed.
- Complete PDF editorial lifecycle: passed with four detected and published references; test content then safely deleted.
- Database migrations and idempotent seed: passed.
- Post-launch hero gutter, mobile-menu close behavior, and combined footer quotation regression: passed.
- Admin selection, direct record switching, complete field hydration, authenticated PDF viewing/removal, and 390 px responsive checks: passed.
- Revelation 22 visual redesign, original hero asset, sans-serif identity, all public routes, 320/390 px responsive behavior, and reduced motion: passed.
- Vercel Blob legacy-token/OIDC configuration tests, lint, strict TypeScript, and production build: passed.
- Automatic study draft fallback, paginated/searchable admin index, large relation pickers, authenticated desktop/mobile interactions, and production build: passed.
- Central catalogue search tests, accent-free database matching, grouped public results, empty/noindex states, result navigation, and desktop/mobile responsive checks: passed.
- Nunito next/font loading, 24 px hero eyebrow/title spacing, first-viewport fit, collection typography, mobile menu, and responsive overflow: passed.
- Mobile-menu outside dismissal, internal search interaction, Escape/focus behavior, transparent tap feedback, 44 px target, and 320/390 px responsive fit: passed.
- Mobile navigation link pressed state, transparent tap highlight, keyboard focus, touch navigation, and 320/390 px fit: passed.
- Site-wide transparent tap highlights, branded selection, teal keyboard focus, logo/footer/menu/hero/search navigation, public route audit, and 320/390/1440 px fit: passed.
- Direct published topic/study deletion, current-PDF automatic draft fallback, immediate editor refresh, cascade cleanup, five publication tests, and authenticated desktop/mobile UI checks: passed.
- Shared topic/study/video workspace, common content fields and danger zone, 30-item searchable/paginated indexes, lightweight relation options, real selection/search interaction, and 390/1440 px responsive checks: passed.
- Automatic Egyéb fallback topic, orphan-study categorization, accented/accent-free search, sitemap/canonical metadata, reserved slug, admin guidance, five focused tests, and 390/1440 px route checks: passed.
- Production PDF.js/canvas dependency tracing, native-PDF extraction regression, deployed `Teszt.pdf` seven-candidate repair, authenticated PDF response, lint, strict TypeScript, and production build: passed.
- All-66-book Hungarian reference formatting, alias deduplication, automatic transactional PDF finalization, review-layer removal, six regression suites, lint, strict TypeScript, and production build: passed.
- Production deployment `dpl_8YCudqoQDCg2mWAFMqP7zAc2CuT1`: READY; 11 stored labels normalized and the repaired `Teszt.pdf` revision finalized with seven accepted canonical references.
- Compact topic/related-content admin sections, hidden stable slugs, lint, strict TypeScript, and production build: passed.
- Production deployment `dpl_Hu8c6msEvrNEQJVd4CTaSFtJ1V1V`: READY; authenticated study/video editors passed 1440/390 px layout and overflow checks.
- Fixed-height relationship panels, authenticated YouTube title/channel derivation, speaker storage/search, migration 003, focused metadata/search tests, lint, migrated-schema build, GTD verification, and repository health: passed.
- Production deployment `dpl_6Z7y7jiGgpHo88pHif5rnpxP84C3`: READY; authenticated metadata derivation and fixed 240 px relationship panels passed desktop/390 px responsive checks without overflow.
- Modal save/PDF-processing lock, disabled submit state, explicit success confirmation, React review, lint, production build, GTD verification, and repository health: passed.
- Production deployment `dpl_3wsRUW6oq8nu9UW2RfA5Jg4gZtEd`: READY; authenticated save redirect, focused success acknowledgement, modal dismissal, and URL cleanup passed.
- Canonical `www` host, self-referential public canonicals, crawl-visible PDF noindex/canonical headers, sitemap/robots alignment, all focused tests, lint, strict TypeScript, production build, and local HTTP checks: passed.
- Production deployment `dpl_2exBRBmQCD3rfWw39dGGCZTafRCz`: READY; `www` canonicals, sitemap/robots host alignment, and raw-PDF indexing headers passed live HTTP checks.
- Redundant list-item type labels removed while section headings and useful metadata remain; lint, strict TypeScript, production build, and local rendered-page checks passed.
- Production deployment `dpl_2iSZuVKTWo5FD6no5bFH4PDdaQkm`: READY; live study, video, and grouped search results contain no repeated item-level type labels.
- Route-aware topic/study/video search defaults, accessible multi-select controls, filtered database queries, URL persistence, seven focused tests, production build, and desktop/mobile browser checks: passed.
- Production deployment `dpl_Ev3WxPrZ9GPVurmvaXpUMQLZtn6S`: READY; live single- and multi-type search URLs retain their checked filters and show only selected result groups.
- Three-line public preview descriptions, hidden video-channel preview metadata, retained speaker/detail metadata and channel search matching, eight focused tests, production build, and desktop/mobile browser checks: passed.
- Production deployment `dpl_HfVCERfTUa7LFtDabf4cQqvAYG2d`: READY; live preview clamp, hidden list/search channel metadata, channel-based matching, and selected-video channel display passed.
- Atomic study/video record-and-relationship saves, rollback probe, publication/YouTube tests, lint, strict TypeScript, production build, and warm round-trip comparison: passed.
- Ctrl/Cmd+S content-save shortcut, native validation, duplicate suppression, pending modal, exclusion scope, four focused tests, lint, strict TypeScript, production build, and authenticated browser checks: passed.
- Aligned 240 px relation pickers, accessible topic info control, title-only top-packed rows, correct hidden filtering, lint, strict TypeScript, production build, and authenticated 1440/390 px browser checks: passed.
- Published new-topic default, preserved existing topic states, unchanged study/video draft defaults, lint, strict TypeScript, production build, and authenticated browser checks: passed.
- Binary publication switch, exact published/draft form serialization, keyboard operation, 44 px touch target, lint, strict TypeScript, production build, and authenticated desktop/mobile checks: passed.
- First-party anonymous analytics, all-time/30-day counters, topic/study/video rankings, duplicate/admin/bot/privacy exclusions, migration 004, focused tests, production build, and authenticated desktop/mobile checks: passed.
- Hidden topic/study/video SEO editors, preserved existing SEO overrides through ordinary saves, retained general metadata fallbacks, lint, strict TypeScript, production build, and authenticated desktop/mobile checks: passed.
- New-study help now explicitly explains that PDF upload appears after entering the title and summary and completing the first save; lint, strict TypeScript, and production build: passed.
- Contained, overlapping, and same-chapter adjacent Scripture ranges now finalize as concise continuous ranges while every PDF evidence candidate remains intact; six reference tests, publication tests, lint, strict TypeScript, and production build: passed.
- Explicit PDF.js worker initialization and route-scoped output tracing now protect Vercel PDF parsing; the originally rejected four-page PDF, focused tests, lint, strict TypeScript, and production build: passed locally.
- Production deployment `dpl_6ds244CStu7Jb4x4Xc1NvE4JqWd1`: READY; live admin HTTP check and deployment-scoped error/fatal log scan passed.
- Public study references now render in canonical Bible book, chapter, and verse order without changing stored detection evidence; seven reference tests, lint, strict TypeScript, and production build: passed.
- Production deployment `dpl_BuB3tdXjNcKfx3SsQS9sgnuXRWB7`: READY; the live 28-reference Páska study rendered in exact canonical order and the deployment error/fatal log scan was clean.
- Public catalogue search now filters studies by overlapping single-verse or ranged Scripture references, including cross-chapter intervals; focused tests, PostgreSQL-backed route checks, responsive browser checks, lint, strict TypeScript, and production build: passed.
- Production deployment `dpl_ESeCJpKPutjUbWBCUn5yPRaRriFv`: READY; five live Scripture-search cases passed and the deployment error/fatal log scan was clean.
- Study pages now present one PDF action under the sidebar document heading, with
  the bare filename and obsolete PDF/reference explanations removed; lint,
  strict TypeScript, production build, and local rendered-page checks passed.
- Production deployment `dpl_5r8TS6tjGwP3AvauYRMqbwjj7u4Z`: READY; the live
  study page passed placement, link-target, removed-copy, and runtime-log checks.
- Study document actions now have 14 px of heading separation, matching sidebar
  list rhythm; lint and the production build passed.
- Production deployment `dpl_5drA2KM4WkJHSZvKRu5W9Hrq1WAA`: READY; the live
  scoped spacing rule, document layout, and runtime-log checks passed.
- Layout-aware PDF-to-article conversion, versioned JSON storage, migration 005,
  upload/seed/backfill integration, semantic public rendering, retained PDF,
  and sidebar Bible references passed 48 focused tests, lint, strict TypeScript,
  production build, local responsive Chromium checks, and production backfill.
- Production deployment `dpl_8kT5JCQ4Qjerp1Jr7Nt2XUEo5SQ6`: READY; the live
  Páska study rendered 15 headings, 32 Scripture excerpts, and 28 sidebar
  references, while the original 75,525-byte PDF response remained intact.
- Canonical undirected study pairs, the three-picker study editor, symmetric
  study-video verification, and compact public related-content sidebars passed
  51 focused tests, migration/transaction probes, lint, strict TypeScript,
  production build, and authenticated desktop/mobile browser checks.
- Production deployment `dpl_ALdtMfjpJYoJ8tNLtB23qLn8ekjv`: READY; live
  study/video pages and admin protection passed with clean error/fatal logs.
- PDF storage investigation isolated the environment-only credential gate and
  request-context OIDC mismatch; the pre-fix evidence and credential validation
  are preserved in the investigation report.
- Blob credential routing, production fallback prevention, 53 focused tests,
  real private-Blob probe, connected deployment, guarded migration, cleared
  database bytes, exact checksum preservation, and live PDF delivery: passed.

## Next Decision Gate

- Before Phase 04, select and document one Hungarian Bible translation whose full text may legally be stored and displayed.
- On the next new PDF revision, spot-check the automatically generated heading
  and paragraph structure; extraction and storage are automatic, while manual
  HTML correction remains intentionally out of scope.

## Workflow Preference

- After each completed and verified implementation workflow, stage, commit, and push the changes to `origin` unless the user explicitly requests local-only work.

## Session

**Last Date:** 2026-08-03
**Stopped At:** Plan 03-31 complete, deployed, migrated, and verified
**Resume File:** .planning/STATE.md
