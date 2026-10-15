# 04-11 Verification

2026-10-15. Story: upload action calls PDF extractor -> color-aware glyph mapping ->
versioned article JSON -> validated repository article -> strong text and intact
Bible links. Original download retains its source bytes and font/color formatting.

## Extraction and data

- PASS106tests: actual PDF RGB red, dark red, CMYK red and red stroke text become
  emphasis, black/grey/orange/magenta stay normal. Nested form paint state,
  ligatures, decomposed accents, mismatched text streams, lists/dehyphenation/
  cross-page cleanup and malformed offsets covered. Older v1/v2articles accepted.
- PASS JSON round-trip of real colored-PDF extraction preserves exact offsets.
  Upload action already serializes extraction.article and its version directly;
  no upload/storage/repository schema change or production test upload required.
- PASS previous committed extractor compared with new extractor on three real
  PDFs: Mítosz4pages/25blocks, Páska1page/15blocks, Hited1page/15blocks. Both page
  strings and complete article blocks exactly equal. Series lists22/15/10/14,
  zero false quotations and69finalized reference ranges retained.
- PASS glyph/text streams match on all current series pages and Páska; red color
  flags attach before geometric line sorting, preserving reading-order heuristics.
- Mapping is deliberately conservative: if normalized page glyphs differ from
  extracted text, emphasis is omitted rather than guessed. No OCR/image text or
  source font-family styling introduced. Ordinary red hues include dark red;
  orange/magenta/grey/pale tints are outside the red detector.

## Rendering and reliability

- PASS real colored PDF generated, rendered by Poppler and visually inspected.
  Fallback-font warnings did not affect sample readability or color evidence.
- PASS temporary local preview used actual extractor and production article/
  ScriptureText/Bible workspace components.12strong fragments all weight700 in
  site ink/link colors; surrounding words and nonred samples remain normal.
- PASS bold János3:16 remains one anchor with John.3.16 identity; desktop click
  opens exact canonical verse. Mobile390 text wraps without overflow; reference
  opens reader selection and closes back to article. Console errors empty.
- Screenshots output/pdf-red-text-to-bold-desktop.png and mobile.png saved and
  visually reviewed. Temporary test route removed before final build; viewport
  reset, local tab/server closed. No test route or fixture publication.
- PASS final GTD04 report2026-10-15T11:04:35+02:00: lint/build exit0, production
  compilation and strict TypeScript. Standalone tsc --noEmit also passed after
  correcting an existing URLSearchParams fixture type; all106tests then passed.
- Reviewed React server boundaries, original reference text/detection, safe escaped
  markup, bounded/sorted offset validation and old-article compatibility. No new
  dependencies, DB writes or mass reprocessing. Memory/whitespace checks before commit.

## Production

- Release/live verification follows the implementation commit.
