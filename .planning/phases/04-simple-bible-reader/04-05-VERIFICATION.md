# 04-05 Verification

2026-10-14. Story: chapter SSR renders published matches beside each verse;
one small client sidebar button changes their visibility without additional fetch.

- PASS GTD04 report2026-10-14T11:23:38+02:00 read: lint/build exit0 and strict
  TypeScript successful. No tests mirroring native layout implementation added.
- PASS actual Jelenések12 all18verse paragraphs and all14study title/URL/order
  records exactly equal the baseline snapshot in output/bible-sidebar-baseline.json.
  Nine inline groups, one toggle button, zero sidebar study links.
- PASS initial statefalse and zero visible groups; keyboard Enter shows all nine
  groups/14links and aria-expanded true. Space hides every group and aria false.
  No additional per-verse button. CSS displaynone excludes hidden links from AX.
- PASS390/320px and default desktop no horizontal overflow; nine groups visible
  beside verse text. Real first-verse link opened Mítosz vagy történelem? and its
  heading visible. Abdiás1 no-match message visible after button; subsequent
  chapter change resets visibility to false. Browser errors empty.
- PASS local screenshots visually inspected: output/bible-inline-local.png and
  bible-inline-local-mobile.png. Existing chapter links, attribution and verse IDs
  retained. Small client state only; server data/query unchanged, no effects/API.
- No database writes, new dependencies or translation ingestion. Release pending.
