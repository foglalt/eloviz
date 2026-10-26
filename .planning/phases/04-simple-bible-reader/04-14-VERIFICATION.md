# 04-14 Verification

2026-10-26. PDF red+underline -> spoiler ranges -> semantic article JSON ->
small server-rendered content slot/client reveal control -> existing Bible reader.

## Extraction/data

- PASS116tests. Real Courier PDF contains4hidden ranges: multi-word answer,
  János3:16, list answer and a partial underline inside a red text run. Red-only,
  black-underlined and strikethrough text remain visible. Source PNG reviewed.
- PASS unit geometry tests: transformed/restored painted strokes, thin filled
  rectangles, Underline quad points; tall paths/remote rules/rotated text ignored.
- PASS real proportional Helvetica probe: only underlined answer inside one
  red text run selected. Glyph advances/space widths map partial underlines.
- PASS cleanup/slicing/joining, multi-line hyphenated/list answers, exact JSON
  round-trip, old article compatibility and rejection of malformed/out-of-bounds/
  overlapping/mismatched range arrays.
- PASS3real PDF comparison: Mítosz4pages/25blocks, Páska1/15, Hited1/15;
  text and structure unchanged when formatting offsets are excluded.
- No DB/schema/dependency changes or production test publication. Original PDFs
  unchanged; older stored articles require a fresh upload/reprocessing.

## Browser/build

- PASS real local1280/390/320browser:4controls initially collapsed, all answer
  spans hidden, zero visible hidden Bible links and no answer text in AX state.
- PASS Enter reveals with aria-expanded=true and focus retained; Space hides.
  Repeated click toggles independently. Revealed Bible link selects John.3.16.
  Control-before-answer DOM order lets Tab reach the revealed link directly.
- PASS mobile click and wrapping, no horizontal overflow at390/320. Console
  errors empty. Screenshots output/pdf-spoiler-hidden.png and mobile.png saved;
  viewport reset. No browser settings/CDP changes or email submissions.
- Temporary spoiler-preview route removed and generated dev validator cleared
  before final build. Dev service stopped for that build, not browser cleanup.
- PASS GTD04 report2026-10-26T08:31:27+01:00: lint/build exit0, production compile
  and strict TypeScript; standalone tsc passed. React review: only the reveal
  state boundary is client-side; formatted content and reference parsing stay
  server-rendered, native button semantics and safe React escaping retained.

## Release/cleanup

Pending exact-SHA deployment, live compatibility and tab cleanup confirmation.
