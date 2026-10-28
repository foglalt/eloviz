# Project State

**Project:** Élő Víz
**Current Phase:** 04
**Current Phase Name:** Simple Bible Reader
**Current Plan:** 04-18
**Total Plans in Phase:** 18
**Status:** Complete; owner copy edits published
**Progress:** 100%
**Last Activity:** 2026-10-28
**Last Activity Description:** Three owner copy edits published and live label verified
**Paused At:** No unfinished plans; edition selection before any translation ingestion

## Delivered

- Plan04-18: three exact owner copy edits published (Nyomtatás in public/admin,
  shorter newsletter intro).6newsletter tests/lint/build and live label pass.
  cd4f7d8 / dpl_GcmTmqGTDCW9ZyTRpfrkBd1T1GM8 READY. No email sent.

- Plan04-17: PDF page-break/list separation and original numbering preserved;
  affected chapter repaired from original PDF with backup, references unchanged.
  132tests/lint/build/tsc and live HTML/PDF pass. f0e4733 /
  dpl_2n9THJhmgPwEwkTNJoTZdRopR6jJ READY. Browser disabled in Work settings;
  visual/click review unavailable; no tabs changed.

- Plan04-16: Managed Turnstile with server token/action/hostname verification,
  responsive retry UI and fail-closed behavior;128tests/build/action+live browser
  pass.78pending removed with private backup,2named pending+3active unchanged.
  a58df83 / dpl_Yns2ND8yoPocJ4x9ocxRSdYNfi8J READY; real validation/admin/logs
  verified. Opera test closed; owner tabs preserved; IAB error close guard blocked.

- Plan04-15: optional PDF before first save; atomic study/series/document/article/
  reference creation, inline errors retain entries/File.122tests/build, actual
  rollback/Blob cleanup and responsive built-browser checks pass; bf7fe29 /
  dpl_2P8V5tvzb8xU2KkunJauhL7DVdLr READY. Live guard/HTTP/logs verified.
  Tab3 closed, owner/pre-existing tab1 preserved; tab2 error-page close blocked.

- Plan04-14: red+underlined PDF text becomes optional inline hidden answers on
  fresh extraction; accessible reveal/hide, intact bold/Bible links.116tests/build
  and responsive keyboard checks pass; b04a1be /
  dpl_2ozugHVNWSnDVCgJYTLmFUh5NG6a READY, live/cleanup verified.

- Plan04-13: native PDF bold weight now joins red-to-bold on fresh extraction;
  compatible v4 article, font families ignored.110tests/build/browser passed;
  60dc865 / dpl_2tfDcZUKCXg7STDwstiG2cj5FKvx READY and live verified.

- Plan04-12: compact public pages/featured study, earlier series chapters, hidden
  empty collections with direct URLs retained; subscription background scroll
  locked.107tests/build/browser pass; d11c5ee /
  dpl_J98uKM4oBb4neYS4u2Qcu1vNQxgi READY and live verified.

- Plan04-11: red PDF words become bold on new upload;106tests/build and colored
  fixture passed; a073c10 / dpl_HSmxBBC74fagATmaRpcigux9vm58 live verified.

- Plan04-10: full intro/summary newlines live;6f7b835 verified, text unchanged.

- Plan04-09: normal sidebar restored when reader closed; full available height
  when open, close/Escape, retained passage, scroll/focus and mobile checks passed.
  Lint/build passed; f2a90a1 / dpl_58xC65MqsdUU9qSVocYrAeoAFj2V live verified.

- Plan04-08: authorized modern-reader links recommended; attribution/API access
  does not clear onsite text. See research/2026-10-14-modern-bible-links-and-permissions.md.

- Plan04-07: clickable study references, sticky Bible inspector/mobile modal,
  chapter context and arbitrary lookup; canonical data and scroll/focus verified.
  Reviewed as useful; d578490 / dpl_HhFofN5DQoG9MMypUwmM819SaHuq READY,
  live API/browser/console/runtime checks passed. No stored-study/translation changes.

- Plan04-06: open Biblica NT and historical Hungarian candidate licences/coverage
  researched and documented with source-quality/numbering audit prerequisites;
  no new translation ingested. See research/2026-10-14-hungarian-open-bible-editions.md.

- Plan04-05 corrects04-04 placement: one sidebar button reveals all study links
  inline beside verses; no sidebar results. Deployed17e6bb3 /
  dpl_7NuXswbKmpu8b8KUPN7DgvJGULYS READY; build and live browser/log checks passed.

- Plan 03-39: PDF list/quote and reference-list rules fixed, target source-preserving
  regeneration done, summary/body separation and series index improved. 95 tests,
  build and actual responsive browser checks passed. Deployed cae4459 /
  dpl_BgdgydiEUyXiZtXro1e3hS6GWCSV READY; live browser/HTTP/PDF/log checks passed.

- Plan 03-38: approved revised F used in header/footer and browser/touch icons;
  restrained navy/gold palette with existing light reading layout retained.
  Build, responsive rendering, asset delivery and contrast passed; deployed 0c99fcc
  / dpl_BZXh5DfMq4frfcvieNgdW5wkmrvj READY, live checks/logs passed.

- Plan03-37: revised F icon selected; assets retained, integrated in03-38.

- Plan 03-36: actual Gmail Inbox receipt and built-in browser confirmation work.
  Open Gmail view was stale; no sending failure reproduced. Both authorized test
  accounts remain confirmed and active; no mailbox/DNS configuration changes.

- Plan 03-35: protected portable newsletter export reconciles own consent records
  with provider opt-outs/blocks and delivery history; migration/rollback guide.
  Resend still sends weekly; actual replacement remains a future scoped task.

- Phase 04-02/03: Hungarian book/chapter reader, reference lookup, exact verse
  anchors, SEO/sitemap, visible attribution, inclusive current-document study
  matching, draft/obsolete-reference exclusions and reciprocal study links.
- Phase 04-01: reviewed Károli 1908 Public Domain sources, pinned checksums and
  three verified omission supplements; 66 books/1189 chapters/31171 verses
  imported transactionally into production with exact read-back verification.
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
- First-visit development notice, consented email signup, and protected subscriber
  overview are deployed; confirmed signup, weekly Resend delivery, native unsubscribe, and Vercel scheduling are live in 03-34.
- Ordered study series, chapter PDFs/URLs, author/source metadata, admin ordering,
  add-next defaults, contents and previous/next links are implemented in plan 03-33.

## Verification Snapshot

- Earlier baseline and deployment evidence retained in phase03/04 plan verification
  and summary files; no historical evidence removed from those files.
- Phase04-11:106tests, lint/build/TypeScript, actual colored PDF/source render,
  responsive article/Bible-link checks and exact production SHA/PDF verified.
- Phase04-12:107tests and read-only visibility/empty-series fixtures pass; desktop,
  tablet and phone layouts/scroll isolation reviewed; lint/build/TypeScript pass.
  Exact-SHA deployment, live HTTP/layout/modal and runtime-log checks pass.

## Next Decision Gate

- Additional-edition shortlist ready; select editions before implementation.
  Biblica open NT recommended for modern wording; historical full/NT candidates
  have separate corpus/canon/numbering audit needs. Current reader correction live.

- Károli 1908 chosen on 2026-10-13; source/reuse verification complete in
  `.planning/research/2026-10-13-karoli-1908-source.md`. Reader is implemented;
  Phase 05 concordances and additional translations await product prioritization.
- On the next new PDF revision, spot-check the automatically generated heading
  and paragraph structure; extraction and storage are automatic, while manual
  HTML correction remains intentionally out of scope.

## Workflow Preference

- After each completed and verified implementation workflow, stage, commit, and push the changes to `origin` unless the user explicitly requests local-only work.

## Session

**Last Date:** 2026-10-28T11:09:38+01:00
**Stopped At:** 04-18 deployed; live copy verified
**Resume File:** None
