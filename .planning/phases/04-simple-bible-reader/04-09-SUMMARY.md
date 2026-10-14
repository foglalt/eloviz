---
phase: 04
plan: 09
status: complete
---

# 04-09 Summary

- Reader starts closed with ordinary series/topic/document/related content and
  reference links available. Open from a reference or the explicit Bible button.
- Open desktop reader replaces regular sections and fills the actual available
  height below its top edge, expanding to the sticky96px position while scrolling;
  removed680px cap. DOM measurement/listeners clean up on close and resize.
- Close button and focused desktop Escape restore ordinary sidebar, opener focus
  and study scroll; last passage retained for reopening. Mobile modal keeps regular
  content underneath, restores body styles/scroll and switches safely at820px.
- GTD lint/build/TypeScript and actual desktop/phone checks passed. No API/data,
  dependency or translation changes. Production release evidence in04-09-VERIFICATION.md.
