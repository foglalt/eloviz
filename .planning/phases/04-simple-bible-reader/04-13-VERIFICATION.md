# 04-13 Verification

2026-10-18. New upload -> resolved PDF.js font metadata -> union with red emphasis
-> cleaned/assembled bold ranges -> stored compatible JSON -> semantic strong.

- PASS110tests, zero failures. Real PDF fixture covers Helvetica regular/bold,
  oblique-only, Times BoldItalic, Courier regular, red regular+bold, lists,
  bold János3:16 and wrapped hyphenated words. Existing red fixture still passes.
- PASS metadata tests: bold/black flags,600/700/named weight, subset Georgia-Bold,
  Arial-BoldMT, Times-BoldItalic, semibold/heavy; regular/italic/unknown remain
  unchanged and inputs immutable. Color emphasis retained on regular fonts.
- PASS full extraction comparison for Mítosz4pages/25blocks, Páska1/15 and
  Hited1/15: page text and article structure identical after removing emphasis
  offsets. Mítosz now yields8ranges and Páska9on fresh extraction.
- PASS source fixture PNG rendered with Poppler and visually reviewed; actual
  website fixture1280/390shows7strong spans at700weight versus400body; single
  intact bold Bible link selects John.3.16 in existing reader. No horizontal
  overflow or browser console errors. Screenshots output/pdf-bold-desktop.png
  and output/pdf-bold-mobile.png. Viewport reset/local tab closed.
- Temporary preview removed before production build. No test publication or
  stored document update; existing articles require PDF upload/reprocessing to
  gain newly extracted weight. Source download bytes retained.
- PASS GTD04 report2026-10-18T10:46:19+02:00: lint/build exit0 including
  production compile and strict TypeScript; standalone tsc also passed.
  First build caught a stale generated dev validator after removing preview;
  removed that generated validator and reran successfully. No source workaround.
- PASS60dc865c7aefe806b107217bb18ee0150fe6286f pushed; production deployment
  dpl_2tfDcZUKCXg7STDwstiG2cj5FKvx READY for exact SHA/www.eloviz.hu alias.
- PASS live stored Mítosz article unchanged:11447characters,103Bible links,
  lists22/15/10/14, zero false quotes; browser console errors empty. Temporary
  preview404. Upload parsing verified with actual local production PDF.js;
  no production test upload or regeneration performed.
- Deployment-scoped error/fatal logs: no matching logs. Health/whitespace passed.
