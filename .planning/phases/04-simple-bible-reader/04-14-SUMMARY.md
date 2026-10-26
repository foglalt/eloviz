---
phase: 04
plan: 14
status: verifying
---

# 04-14 Summary

- New PDF extraction intersects red glyphs with thin painted underline geometry
  or Underline annotation bounds. Handles transformed strokes/filled rectangles,
  partial text runs and glyph advances; native bold is applied after detection.
- Compatible pdf-layout-v5 carries optional spoiler ranges through whitespace,
  hyphenation, line joining, lists and validated JSON; original text/references
  remain complete. Existing red-to-bold and font-weight extraction stay intact.
- Small Hungarian inline reveal buttons hide answers and links from the reading
  order until activation. Click/Enter/Space reveal or hide; focus stays on the
  control and Tab reaches a revealed Bible link. Answer text retains bold/links.
-116tests, real source PDF render, proportional-font probe, desktop/390/320
  browser checks and full lint/build/TypeScript pass. Release evidence pending
  in04-14-VERIFICATION.md. No new dependencies/schema or saved-document rewrite.
- Agent-created test tab recorded in tmp/agent-project-tabs.json; reused for
  release checks and to be closed afterward. Pre-existing tabs preserved.
