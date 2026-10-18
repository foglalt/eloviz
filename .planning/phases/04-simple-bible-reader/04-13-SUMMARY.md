---
phase: 04
plan: 13
status: complete
---

# 04-13 Summary

- Native PDF bold/semibold/heavy weight now becomes semantic strong text, in
  addition to red-text emphasis. Reads resolved PDF.js face metadata/names per
  item; never applies the source font family to the website.
- Weight is merged before line/paragraph/list assembly, preserving bold Bible
  links and wrapped/hyphenated words. Missing font metadata leaves red emphasis
  intact. New extraction version pdf-layout-v4 uses the existing compatible JSON.
-110tests passed, including real mixed-font PDF, flags/weights/subset names,
  list/reference/color combinations and no source mutation. Three real PDFs
  retain identical text/pages/article structure; only bold offsets change.
- Source PDF render and actual desktop/mobile website reviewed;700weight strong
  versus400body, selected John3:16 and no overflow/console errors.
- No dependency/schema changes or mass regeneration of previously stored studies.
  Lint/build/TypeScript passed; release evidence in04-13-VERIFICATION.md.

- Released60dc865 / dpl_2tfDcZUKCXg7STDwstiG2cj5FKvx READY; exact-SHA
  canonical deployment and stored-article compatibility verified live.
