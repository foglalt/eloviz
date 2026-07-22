# Roadmap: Élő Víz

## Overview

The completed Easter V1 remains the baseline. Phase 03 rebuilds the main site as an evergreen library whose study materials are versioned PDF uploads. Each PDF produces candidate Scripture references for editorial review. Phase 04 then adds one simple Bible translation and uses the confirmed references to show which published studies contain each verse. Original-language concordances follow later.

## Phase Checklist

- [x] **Phase 01: Foundation** — Establish the original project baseline and memory workflow.
- [x] **Phase 02: Deliver V1** — Deliver and refine the Hungarian Easter microsite, quiz, studies, contact, and admin features.
- [x] **Phase 03: Evergreen Content Library** — Rebuilt Élő Víz around topics, PDF studies, videos, confirmed Scripture references, relations, SEO, and a simple editorial admin.
- [ ] **Phase 04: Simple Bible Reader** — Add one licensed/open Hungarian translation and per-verse links to matching studies.
- [ ] **Phase 05: Greek and Hebrew Concordances** — Add original-language text, lemmas, morphology, and occurrence search after the reader is stable.

## Phase 03 Plans

1. [x] **03-01: Establish content platform foundation** — Database schema, canonical verse structure, PDF document/version records, migrations, repositories, and validation.
2. [x] **03-02: Migrate and seed evergreen content** — Idempotent import of useful current metadata, real PDFs, topic assignments, and a video recommendation.
3. [x] **03-03: Create the Living Water design system and shell** — Brand direction, global navigation, typography, imagery, responsive layout, and motion.
4. [x] **03-04: Build homepage and topic discovery** — `/`, `/temak`, and `/temak/[slug]`.
5. [x] **03-05: Build PDF ingestion and reference review** — Secure upload, text extraction, Hungarian reference detection, candidate evidence, and editor finalization.
6. [x] **03-06: Build SEO-first study pages** — `/tanulmanyok` and `/tanulmanyok/[slug]`, PDF access, confirmed Scripture references, topics, and related videos.
7. [x] **03-07: Build video pages and related content** — `/videok` and `/videok/[slug]`, safe YouTube handling, topics, and related studies.
8. [x] **03-08: Build the editorial admin** — Hardened CRUD, PDF revision workflow, reference review, publication, and relationships.
9. [x] **03-09: Complete technical SEO and discoverability** — Dynamic metadata, canonicals, structured data, robots, sitemap, raw-PDF indexing policy, and social previews.
10. [x] **03-10: Migrate routes and verify the rebuild** — Legacy redirects/removal, regression checks, PDF/reference fixtures, accessibility, and final verification evidence.

## Phase 04 Proposed Plans

1. **04-01: Confirm one translation and ingest canonical text** — Record licence/provenance, import books/chapters/verses, and validate versification against the Phase 03 canonical structure.
2. **04-02: Build the simple Bible reader** — Hungarian book/chapter navigation, readable verse anchors, canonical URLs, basic reference search, and responsive typography.
3. **04-03: Connect verses to studies** — On each verse, query overlapping confirmed study-reference ranges and show links to the matching published study pages.
4. **04-04: Add optional additional translations** — Only when each translation’s display, storage, caching, and attribution rights are documented.

## Phase 05 Proposed Plans

1. **05-01: Greek New Testament ingestion and reader.**
2. **05-02: Hebrew Bible ingestion and reader.**
3. **05-03: Lemma, morphology, and occurrence concordance.**
4. **05-04: Optional Hungarian alignment proof** — a separate high-complexity linguistic project, not required for concordance.

## Progress

| Phase | Plans complete | Status | Completed |
|---|---:|---|---|
| 01 Foundation | 1/1 | Completed | 2026-03-24 |
| 02 Deliver V1 | 20/20 | Completed | 2026-04-03 |
| 03 Evergreen Content Library | 10/10 | Completed | 2026-07-22 |
| 04 Simple Bible Reader | 0/4 proposed | Gated by one translation licence/source | — |
| 05 Greek and Hebrew Concordances | 0/4 proposed | Future | — |

---
*Last updated: 2026-07-22*
