# 04-01 Verification — 2026-10-13

| Check | Result |
|---|---|
| CrossWire/upstream edition and Public Domain declarations | PASS |
| Primary and supplemental raw SHA-256 pins | PASS |
| Five parser failure/text/gap/supplement tests | PASS |
| All existing and importer tests | PASS: 75/75 |
| Complete normalized text SHA-256 | PASS: 6119e14ad2f654678428fe406e586e1bc2908d5b44dd32a7f0555857f184ac9b |
| Isolated migration 010 and complete import | PASS: 66 books, 1189 chapters, 31171 verses |
| Full stored text read-back | PASS |
| Genesis 1:1, John 3:16, Revelation 22:17 and three supplements | PASS |
| Existing published study-reference start/end coverage | PASS: no unresolved endpoints |
| Repeat import preserves timestamp/provenance | PASS |
| Conflicting stored text aborts and rolls back newly inserted verse | PASS; isolated fixtures restored |
| Production migration/import/read-back/idempotency | PASS |
| Lint, strict TypeScript, production build, GTD | PASS |

Commands: `scripts/import-bible.ts --validate-only`, `scripts/migrate.mjs`,
`scripts/verify-bible-import.ts` and isolated `--probe-rollback`, complete Node
test suite, `npm run lint`, `npx tsc --noEmit`, `scripts/gtd.ps1 verify -Phase 04`.
Migration used direct production host after explicit matching to the existing
endpoint; no existing content tables were modified. No public reader routes in
this plan. Full licence/source analysis: research/2026-10-13-karoli-1908-source.md.
