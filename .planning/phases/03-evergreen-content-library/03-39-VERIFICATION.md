# Plan 03-39 Verification

2026-10-14. Target study d59628de-0741-4917-b6b8-462a0665039a; current PDF
737cdc94-6480-42fe-8742-85f236844285, slug mitosz-vagy-tortenelem.

## Evidence and checks

- Live before: four bullet lists had one long item apiece; wrapped Apostolok /
  Cselekedetei 7:2 split became a false quotation. Reference tails consumed list
  separators, producing 1Móz 1:1-28:2, Mt 24:37-39:2 and other invalid spans.
- Downloaded actual public PDF; rendered pages 2/3 and inspected list layout.
  SHA256 5030f84ae1d8e5912ce602ea07a3d0aa2d1c8fc87b4226b6a0693ad4321f4067.
- PASS actual repaired extraction: 4 pages, 25 blocks, zero quotations,
  list item counts 22/15/10/14. Exact reading text retained after removal of bullet
  markers and whitespace normalization. True excerpts in existing tests retained.
- PASS 95 repository tests, including nine new real failure/edge regressions:
  compact/wrapped/page-broken lists, bare/partial references, reference separators,
  inherited lists, real cross-chapter ranges, numbered books, parenthesized book,
  Timótheus, single-chapter notation and occurrence ordering.
- PASS final GTD report read: lint/build/strict TypeScript exit0, status passed.
- PASS targeted dry-run and backed-up atomic regeneration. First precision guard
  failure aborted before mutations; original article equality verified afterward.
  Lossless timestamp guard fix then passed. Final article/hash/document pointer and
  study publication/update timestamps exactly match expected snapshots.
- Final stored references: 88 evidence candidates, 69 consolidated ranges; correct
  additional Júdás/1Timótheus/parenthesized 1Mózes citations included.
- Local backups preserved under ignored tmp/backups; first successful repair backup
  study-737cdc94-6480-42fe-8742-85f236844285-1791963571768.json contains original v1;
  final refinement backup ends 1791963970987.json. PDF bytes never changed.
- PASS built-in browser on actual database: study 1440/390px, zero blockquotes,
  lists 22/15/10/14, 69 sidebar entries, intact wrapped Ábrahám item, no overflow.
  Summary label, body heading and visible 1px border present; mobile body order3.
- PASS series index 1440/390/320px, one semantic series list item, short Sorozatok
  heading, 26.4px item title at390, no horizontal overflow; screenshots inspected.
- React review: Server Components, no new effects/state, valid list/link hierarchy,
  Hungarian copy, existing URLs/accessibility and publication filtering retained.
- No schema changes, file replacement, publication-date changes, provider changes,
  email sends or unrelated document regeneration. Production rollout pending.

Screenshots in ignored output/: study-after-local-desktop.png,
study-after-local-mobile.png, study-lists-after-local.png,
series-index-after-local-mobile.png, series-index-after-local-desktop.png.
