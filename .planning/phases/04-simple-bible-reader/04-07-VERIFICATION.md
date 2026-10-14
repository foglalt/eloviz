# 04-07 Verification

2026-10-14. Story: SSR recognizes references in study text -> client click/select/
lookup -> bounded public passage API -> canonical Károli text -> highlighted chapter
context in sticky inspector/mobile modal, without leaving or repositioning study.

## Code and data

- PASS100 tests, including5new cases: precise Unicode/repeated mention offsets,
  nonoverlapping inherited fragments, single-chapter/parenthesized/cross-chapter
  notation, compact arbitrary lookup and invalid/reversed/cross-book/excessive input.
  Existing95 reference/PDF/newsletter/series/Bible/etc regressions remain passing.
- Initial lint caught mutable render cursor; changed to pure indexed slicing.
  Final GTD04 report2026-10-14T11:58:20+02:00 read: lint/build exit0, strict TypeScript
  and production compilation passed. Further changes limited to memory after build.
- PASS real API probe tmp/verify-study-bible-api.mjs: every returned verse matches
  database text exactly. John3:16 selects1of36 contextual verses; John3 selects36;
  Matthew26:30–27:10 selects56of141 across2chapters. Invalid/cross-book/reversed/
  oversized input400, absentJohn3:99404, canonical first/last chapter neighbours,
  public caching/noindex headers, attribution and full-reader href passed.
- Mítosz vagy történelem? article textContent exactly11447characters and byte-equal
  to original browser baseline; lists/zero false blockquotes retained. Páska keeps
  all32actual scripture blocks and31recognized inline references; Heb10:1 opens.
- No raw HTML execution, new dependencies, migrations, stored text edits or external
  messages. Small client state, server-only repository/type-only client imports,
  parameterized read query and abort/cleanup reviewed. Ordinary anchor fallback kept.

## Browser and scroll

- PASS actual inlineGen3:15 loads exact selected verse with pageY unchanged during
  load. Fast Gen->Rev switches settle atRev12:1–5, not a stale first response.
  Inherited standalone17 opensRev12:17. Cross-chapter lookup highlights56verses.
- Desktop default1280×720 and1440×900: pane stays at96px below header when scrolling
  main article to late sections, bottom inside viewport; no horizontal overflow.
  Native focused PageDown/ArrowDown leave main pageY6148 unchanged while pane moves
  51.2->310.4->350.4px. Pointer wheel leaves pageY1733.6 unchanged while pane moves
  51.2->771.2px. Locator key helper refocusing shifted the page, so actual native
  focused input was used for evidence; no raw-CDP state changes were made.
- Reader jumps by adjusting only its own scrollTop, never whole-page scrollIntoView.
  Study page smooth scrolling disabled to avoid asynchronous focus/jump drift;
  keyboard Home/End/Page/Arrow keys are contained within focused pane.
- Mobile390×844: tapJohn3:16 opens native modal, input/close controls remain fixed,
  text scrolls independently, body fixed at top-9976px. Close restores pageY9976,
  original body styles and focus to János3:16. Escape also restores same position.
- WholeJohn3 lookup selects36verses; next button opensJohn4. Invalid99 gives clear
  error/retry; retry remains safe and valid compactJn3:16 recovers. Study picker
  retains all69reference choices. No page navigation for plain reference click.
- Mobile320×740: no overflow, dialog text pane281px before final touch refinement;
  changing to desktop closes dialog/restores body while selection remains available.
  Final390 layout has337px text pane and44px full-reader/source touch targets.
- Screenshots output/study-bible-reader-local-desktop.png and local-mobile.png
  visually inspected: readable selected chapter context and source/navigation.
  Final browser errors empty, local server starts cleanly; viewport reset.
- Accessibility: named links/native dialog, close/Escape/focus restoration, busy/
  status/error announcements, labelled lookup/picker, keyboard scroll region and
  mobile44px controls. Retain after review; no extra approval needed by user scope.

## Production

Pending commit/push and exact deployment/alias/live API/browser/runtime checks.
