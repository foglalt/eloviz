# Phase 04: Simple Bible Reader - Context

**Gathered:** 2026-10-13
**Status:** Ready for implementation

## Phase Boundary

Import one permitted Hungarian Bible, provide book/chapter navigation and verse anchors, and connect verses to the published studies containing their references.

## Implementation Decisions

### Locked Decisions

- User selected revised **1908 Károli** on 2026-10-13, requesting source/reuse verification first. Public copy stays Hungarian.
- CrossWire HunKar 2.0 and its linked source declare Public Domain. Pin upstream commit and SHA-256; preserve spelling and numbering.
- Import verse text only; omit modern section headings, cross-reference notes and editorial apparatus. Record provenance and visible source attribution.
- OSIS identities remain the study-matching basis. HunKar uses Calvin versification; document gaps instead of inventing verses.
- Reader uses existing visual identity, Server Components and stable Hungarian URLs.
- Execute 04-01 ingestion, 04-02 reader, then 04-03 verse-study connections. Test migration/import on an isolated Neon branch before production.

### Codex Discretion

- Exact slugs/layout within the brand, import batching, and verification fixtures.

## Deferred Ideas

- Additional translations (04-04), accounts, reading progress, full-text concordance and Greek/Hebrew features.

---
*Phase: 04-simple-bible-reader*
