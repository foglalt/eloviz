# 04-09 Verification

2026-10-14. Story: regular sidebar -> explicit button/verse click -> optional
full-height Bible inspector -> close -> restored sidebar without losing reading.

## Local

- PASS final GTD04 report2026-10-14T12:32:09+02:00: lint/build exit0;
  strict TypeScript and production compilation passed after all runtime edits.
- PASS1440x1080: panel top96, height968, bottom1064; no680px cap.
  At page top: top256.575, height807.425, bottom1064. Real available-height
  adjustment avoids clipping navigation before sticky position engages.
- PASS initial/closed normal series, topics, document and69reference links;
  open desktop hides regular sections from layout/accessibility. Native close at
  pageY916 preserves exactly916 and restores focus to opening1Móz3:15 link.
- PASS reopening retains selected passage. Real Gen3:15 and John3:16 returned and
  rendered; article textContent remains11447characters. Ordinary href fallback kept.
- PASS pointer scroll: mainY1267.2 unchanged, Bible pane1519.2->2095.2.
- PASS390x844 modal open/close/Escape, body lock and restoration atY1267.2,
  last passage retained, focus returns to launcher;337px text pane/no overflow.
- PASS320x740 modal243px text pane/no overflow; open phone -> desktop restores
  body and sameY1267.2, keeps selectedJohn3:16 and uses968px reader. Desktop
  Escape works; focus fallback handles launcher unmount during breakpoint change.
- PASS browser error console empty. Reviewed conditional visibility, server link
  fallback, request cancellation and resize/scroll observer cleanup. No new tests
  mirroring this reversible layout change; actual browser interactions verify it.

## Production

- Release and live checks follow the verified implementation commit.
