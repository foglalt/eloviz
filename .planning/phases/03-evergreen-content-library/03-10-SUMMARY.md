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

## Unified admin content workspace — 2026-07-24

- Rebuilt topic, study, and video administration around one shared workspace, searchable/paginated index, editor panel, common content-field template, and confirmed deletion panel.
- Moved every new-content action into its sidebar, made every list row the navigation target, and removed the remaining visible “Szerkesztés” and “Kiválasztva” labels while preserving accessible `aria-current` selection.
- Added 30-item server pagination and title/slug search to topic and video administration, with one detailed query only for the selected record.
- Replaced detailed all-record relation loads with lightweight topic, study, and video options so the editors remain practical with 100+ records.
- Kept PDF lifecycle and entity-specific relationship fields explicit while consolidating repeated title/slug, SEO, publication, ordering, featured, and destructive-action behavior.
- Audited other repeated UI: public resource lists, relation pickers, header/footer, admin shell, and notices were already shared and required no additional refactor.
- Passed all four test suites, lint, strict TypeScript, two production builds, authenticated Chrome interaction/search/selection checks, and visual/overflow review at 1440×1000 and 390×844.

## Automatic “Egyéb” topic — 2026-07-24

- Added a permanent, system-managed public `Egyéb` topic for published studies that have no explicit published topic.
- Kept the fallback derived in the public repository layer, so admin data remains truthful and editors never need to assign or maintain a fake database relation.
- Added `Egyéb` to topic lists, the homepage, `/temak/egyeb`, study tags/details, sitemap generation, bundled fallback content, and accented/accent-free central search.
- Reserved the `egyeb` slug from manually created topics and added an explanatory hint beside the study topic picker.
- Preserved explicitly categorized studies outside the fallback and made the zero-unassigned-study state a valid, indexable empty collection.
- Added five focused fallback tests and passed all existing tests, lint, strict TypeScript, three production builds, GTD verification/health, and desktop/mobile Chrome route, search, sitemap, metadata, console, and overflow checks.

## Production PDF extraction dependency hotfix — 2026-07-26

- Reproduced the failed `Teszt.pdf` upload against production data: Vercel stored the revision with zero extracted characters after PDF.js could not load `@napi-rs/canvas`, even though the file had a valid native text layer.
- Promoted `@napi-rs/canvas` from an optional transitive package to a direct production dependency, externalized it with PDF.js, initialized the required Node globals before importing PDF.js, and pinned Node 24.
- Added structured extraction-error logging so future runtime failures retain the actual exception instead of only the manual-entry fallback message.
- Added a native-PDF extraction regression test that confirms four normalized ranges from the bundled study fixture.
- Re-ran the fixed extraction path against `Teszt.pdf`: one page, 150 extracted characters, and seven unique candidate references.
- Passed all focused test suites, lint, strict TypeScript, the production build, and Next.js output-trace inspection confirming PDF.js, the canvas package, and its native binding are packaged with the study admin function.
- Deployed commit `a445158`, repaired the original failed staged revision without deleting or publishing it, and verified production now shows extracted text, seven evidence-backed candidates, a populated OSIS review list, and a working authenticated PDF response.

## Canonical Hungarian references and automatic finalization — 2026-07-26

- Added one canonical Hungarian abbreviation for every OSIS book code and expanded detection to all 66 canonical books.
- Normalized detected labels after OSIS resolution, so full names, abbreviations, punctuation variants, and duplicate aliases produce one display form such as `Zsid 5:8`.
- Kept OSIS as the stored identity and added an OSIS-to-Hungarian formatter used by repository reads, ensuring legacy labels also render consistently.
- Changed successful PDF uploads to atomically store the document, accepted evidence rows, finalized Scripture ranges, and current-document pointer without an editorial review step.
- Rejected extraction failures and insufficient-text PDFs before storing a revision, with explicit guidance to upload a PDF that has a usable text layer.
- Removed the third-step review editor, its server action, the pending-review dashboard queue, and obsolete review-specific styles.
- Updated bundled seed labels and current product/memory documentation to the canonical Hungarian format and automatic workflow.
- Passed the reference suite, all five regression suites, lint, strict TypeScript through the production build, and the Next.js production build.
- Deployed commit `7690bb7` to production as `dpl_8YCudqoQDCg2mWAFMqP7zAc2CuT1`.
- Normalized 11 existing stored labels and automatically finalized the one eligible staged document: the repaired `Teszt.pdf` revision now has seven accepted candidates, seven canonical references, and remains a draft study.
- Re-ran the normalization with zero changes, confirming the production data migration is idempotent.

## Compact admin relationships and automatic slugs — 2026-07-26

- Removed the visible URL-slug field from the shared topic, study, and video editor; new records derive it from the title while existing records submit their stable slug invisibly.
- Removed slug text from the topic index and changed the shared index search prompt to title-oriented language.
- Placed topic and related-video/study pickers side-by-side on wider screens, reduced picker chrome and list height, and retained a single-column mobile layout.
- Kept search, result counts, publication-state metadata, empty states, keyboard labels, and multi-select behavior intact.
- Passed lint, strict TypeScript, and the Next.js production build.
- Deployed commit `bb5e321` to production as `dpl_Hu8c6msEvrNEQJVd4CTaSFtJ1V1V`.
- Verified the authenticated study and video editors in production: no visible slug control, equal two-column relationship layout at 1440 px, stacked layout at 390 px, and no horizontal overflow.

## Fixed relationship panels and video metadata — 2026-07-26

- Gave every topic and connected-video/study selector the same fixed 240 px height with an internally scrolling result list.
- Added authenticated YouTube metadata lookup that derives the title and channel from a valid link in the editor and refreshes them again on the server while saving.
- Added an independent optional speaker field to the video schema, migration, seed path, admin editor, public detail/list presentation, and both admin and public catalogue search.
- Preserved a safe metadata fallback for temporary YouTube failures while preventing a changed link from silently retaining stale client-side title/channel values.
- Applied production migration `003_add_video_speaker`; YouTube metadata tests, speaker-search tests, lint, the migrated-schema production build, GTD verification, and memory health passed.
- Deployed commit `0a6a76d` to production as `dpl_6Z7y7jiGgpHo88pHif5rnpxP84C3`.
- Verified the authenticated production editor: the sample link derived `Áttekintés: Jeremiás` and `BibleProject - Hungarian / Magyarország`, both relationship panels measured 240 px at desktop and 390 px mobile width, the mobile layout stacked cleanly, and no horizontal overflow appeared.

## Blocking save feedback — 2026-07-26

- Added one shared `useFormStatus` submit component to topic, study, and video saves plus the longer PDF upload/processing action.
- Opens a native modal pending dialog during the server action, disables the initiating button, prevents Escape dismissal, and blocks pointer and keyboard interaction with the editor until completion.
- Replaced transient success notices in content workspaces with a native confirmation dialog that displays the returned server message, returns focus safely, and removes the consumed message from the browser URL when dismissed.
- Kept validation and server errors as persistent inline notices so corrective context remains visible.
- Passed the React best-practices review, lint, the production build, GTD verification, and repository health.
- Deployed commit `6c05050` to production as `dpl_3wsRUW6oq8nu9UW2RfA5Jg4gZtEd`.
- Verified an authenticated production video save: the server action completed normally, the `Mentés kész` modal displayed `A videó mentve.`, its acknowledgement button received focus, and dismissal closed the modal and removed the consumed `message` query parameter without reloading.
