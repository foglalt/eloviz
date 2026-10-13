---
phase: 04
plan: 01
status: complete
completed: 2026-10-13
---

# 04-01 Summary

- User chose Károli 1908. CrossWire/upstream Public Domain declarations and
  Digital Bible Society corroboration are recorded in the source research.
- Pinned OSIS and supplemental sources with raw and normalized SHA-256 hashes.
  Filled only the three verified upstream omissions; preserved Calvin numbering
  and Hungarian spelling; omitted editorial notes/headings.
- Additive migration 010 creates canonical chapters/verses, translations and
  text storage. Import validates the complete canon and atomically verifies
  conflicts before committing; repeated imports preserve timestamp/provenance.
- Imported **66 books / 1189 chapters / 31171 verses** into isolated branch
  `br-delicate-boat-agq580gq`, then the verified production database.
- Full read-back checksums, representative passages, current published study
  endpoints, repeated import and isolated conflict/rollback passed.
- 75 tests, lint, strict TypeScript, production build and GTD checks passed.
- Test branch restored after probes; expires 2026-10-14T10:28:13Z, with compute
  auto-suspend after 300 seconds. Secrets and downloaded source files are ignored.
- Next: 04-02 public reader, then 04-03 reciprocal verse/study discovery.
