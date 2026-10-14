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

- PASS code f2a90a12e08667677bf42e359ec5628a01f63d93 pushed;
  dpl_58xC65MqsdUU9qSVocYrAeoAFj2V READY, exact SHA and www.eloviz.hu alias.
- PASS live initial regular sections/reference list and11447character article;
  Gen3:15 opens with normal sections hidden and close control present.
- PASS live default1280x720: top96, height608, bottom704;
  tall1440x1080: top96, height968, bottom1064, beyond old680px cap.
- PASS live native close keepsY1066.4 and focus on opening reference; all normal
  sections restored. Explicit reopen retains1Móz3:15. Phone390 modal closes with
  body styles restored, no horizontal overflow and preservedY362.4.
- PASS live browser error console and deployment-scoped error/fatal logs empty.
  Screenshots output/study-sidebar-closed-production.png and
  output/study-sidebar-open-production.png saved; layout visually reviewed.
- Temporary viewport reset, local server stopped; live study tab retained.
  Memory health/whitespace checks passed before documentation commit.
