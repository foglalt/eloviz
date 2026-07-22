# Élő Víz Evergreen Rebuild and Bible V2 Feasibility

**Checked:** 2026-07-22
**Purpose:** Ground Phase 03 architecture and estimate the separate Bible/concordance V2.

## Executive Conclusion

The current Next.js 16 / React 19 / Neon foundation can be retained, but the present product model cannot. Studies are source-code constants, the database schema is quiz-specific, public pages are Easter-specific, and the admin edits only quiz JSON. Phase 03 should therefore replace the content architecture while preserving useful content through migration.

V2 is feasible in stages:

- A reader with one open/public-domain Hungarian translation is **moderate**.
- Several modern Hungarian translations are **technically moderate but legally gated**.
- Greek and Hebrew text with lemma, morphology, and occurrence concordances is **high but tractable** using open datasets.
- A polished Hungarian interlinear that aligns every translated word to Greek/Hebrew is **very high complexity** and should not be conflated with a concordance.

## Current-State Findings

- `src/app/(husvet)/_content/studies-content.ts` holds study material in TypeScript rather than durable storage.
- Neon support currently creates quiz/contact/analytics tables at runtime; there is no general content schema or migration layer.
- `/admin` uses a single password and signed cookie, but its form and actions are specialized to quiz JSON.
- `/studies` is one accordion page, so studies do not have individual canonical URLs or per-study metadata.
- Root metadata exists, but there is no database-backed sitemap, robots file, per-resource structured data, or social image strategy.
- Several repository and planning files display mojibake, making an explicit UTF-8 migration check necessary.

## Recommended V1 Data Model

```text
topics
  id, slug, title, description, seo_title, seo_description,
  status, sort_order, created_at, updated_at, published_at

studies
  id, slug, title, summary, cover_image_url, published_document_id,
  seo_title, seo_description, status, featured, created_at,
  updated_at, published_at

videos
  id, slug, title, description, youtube_url, youtube_id,
  channel_name, thumbnail_url, duration_seconds, upload_date,
  seo_title, seo_description, status, featured, created_at,
  updated_at, published_at

study_topics       study_id, topic_id, sort_order
video_topics       video_id, topic_id, sort_order
study_videos       study_id, video_id, relation_note, sort_order

study_scripture_references
  id, study_id, start_canonical_verse_id, end_canonical_verse_id,
  display_label, sort_order

study_documents
  id, study_id, version_number, storage_key, original_filename,
  mime_type, byte_size, sha256, extraction_status, created_at

study_reference_candidates
  id, document_id, raw_text, normalized_start, normalized_end,
  page_number, context_snippet, detector_version, review_status
```

Separate join tables are preferable to a polymorphic `content_relations` table because Postgres can enforce foreign keys and the requested relationship is specifically study-to-video.

## Admin Scope

The smallest useful admin is not a dashboard of metrics. It is a content workbench:

- One list per content type with title, state, updated time, and edit action.
- Create/edit forms with draft, preview, publish, unpublish, and guarded delete.
- Topic checkboxes/search and a related-content selector.
- PDF revision upload, extraction status, candidate-reference review, and manual reference entry for studies.
- YouTube URL validation and preview for videos.
- Automatic slug proposal with explicit conflict errors and stable published slugs.
- Revalidation after writes so public pages and sitemap update promptly.

## SEO Scope

Each published record must provide substantial visible Hungarian copy. Metadata alone cannot compensate for thin pages.

- Next.js supports file-based metadata plus dynamic `generateMetadata`, Open Graph images, `robots.txt`, and `sitemap.xml`.
- Google recommends canonical URLs in the sitemap and supports `BreadcrumbList`, `Article`, and `VideoObject` structured data when page-visible facts match the markup.
- Video pages need a stable thumbnail, unique title/description, and visible video presence for video-specific eligibility.
- YouTube supports a privacy-enhanced `youtube-nocookie.com` embed. A consent-gated click-to-load player is stronger for privacy but can reduce video indexing because Google advises not relying on user interaction to load the player. Phase 03 should prioritize descriptive text-page indexing, implement a privacy-conscious embed, and validate actual crawl output before claiming video-rich-result support.

## Living Water Art Direction

### Visual thesis

Deep spring water meeting warm limestone: an editorial sanctuary with luminous movement, generous reading space, and no generic religious clip art.

### Composition

- Full-bleed water image in the first viewport with the Élő Víz name as the loudest element.
- Short Revelation 22:17 invitation and one “Témák felfedezése” action.
- Cardless topic index using typographic rows, dividers, and selective imagery.
- Featured study/video pairing as the signature content relationship.
- Long-form pages optimized for reading width, Scripture quotations, references, and clear related-content exits.

### Motion

- Short entrance sequence in the hero.
- One water-depth or masked-light scroll effect.
- Consistent link/current and image reveal transitions.
- Full `prefers-reduced-motion` alternative.

## Bible Translation Feasibility

| Capability | Difficulty | Main risk | Recommended approach |
|---|---|---|---|
| One Károli/public-domain reader | Moderate | Text provenance and normalization | Self-host a verified USFM/OSIS source and retain attribution/provenance |
| Open Hungarian New Testament | Moderate | NT-only scope and CC BY-SA/trademark notices | Use as an optional version only with the required notices |
| Modern Hungarian translations (RÚF, ÚRK, etc.) | Legally gated | Copyright and full-text display terms | Obtain written permission or use a licensed API before implementation |
| API-backed multi-translation reader | Moderate | Quotas, commercial/non-commercial terms, availability | Put the API behind a server adapter and cache only as the licence allows |
| Cross-translation search | Medium–high | Versification and normalization | Use canonical book/chapter/verse identifiers and per-version search indexes |

## PDF Reference Index Architecture

The study PDF is the authored source, but the public HTML detail page remains the canonical discovery page. Each upload is immutable and versioned. Text extraction is used for candidate discovery, not as a replacement representation of the PDF.

The detector should use a curated Hungarian alias table (full book names and common abbreviations) plus explicit patterns for `chapter:verse`, `chapter,verse`, verse lists, and ranges. Every candidate retains the original matched text, page number when available, and a short context snippet. This makes review fast and auditable.

Confirmed ranges should be stored using translation-independent canonical verse identifiers or ordinals. The simple reader can then answer “which studies contain this verse?” using a range-overlap query restricted to published studies and their published document revision. Re-uploading a PDF must not change public mappings until the editor finalizes the new revision transactionally.

Native-text PDFs are the first-release target. Image-only/scanned PDFs should show a clear extraction warning and support manual references; OCR adds language models, processing cost, and more review noise, so it is deferred until real uploads demonstrate a need.

The Magyar Bibliatársulat publishes a specific copyright policy for Bible text reuse. API.Bible exposes many translations under per-version licences and currently offers a free non-commercial tier with quotas. Every translation still needs an explicit licence record; availability in an API is not blanket permission to store or redistribute it.

## Greek and Hebrew Concordance Feasibility

### What is straightforward enough for V2

- Display the Greek New Testament and Hebrew Bible by canonical reference.
- Tokenize by verse and attach surface form, normalized form, lemma, morphology, and Strong’s-compatible identifier.
- Provide lemma pages showing definition/gloss, morphology summary, and every occurrence.
- Link study Scripture references to the relevant chapter or verse.
- Offer Hungarian interface labels even when scholarly gloss data is initially English.

### Open data candidates

- **SBLGNT:** Greek New Testament text under CC BY 4.0.
- **MorphGNT:** lemma and morphological tagging for SBLGNT under CC BY-SA; verify exact current repository terms at ingestion time.
- **Open Scriptures Hebrew Bible (OSHB):** WLC text (public domain) with lemma and morphology data under CC BY 4.0.
- **STEP Bible Data:** Greek/Hebrew texts, Extended Strong’s-compatible tags, morphology expansions, and brief lexicons under CC BY 4.0 with attribution.

STEP Bible is the most practical single starting point for concordance-oriented data, but ingestion should pin a dataset revision and preserve every upstream attribution.

### Why a Hungarian interlinear is harder

A source-language concordance indexes Greek/Hebrew lemmas and occurrences. A Hungarian interlinear additionally requires word- or phrase-level alignment between each Hungarian translation and the original text, including reordered phrases, supplied words, idioms, textual variants, and versification differences. Strong’s numbers alone do not solve this. That work needs a licensed aligned dataset or significant linguistic review and should be a separate proof after the concordance is working.

## Proposed V2 Storage

```text
bible_versions
  id, abbreviation, language, name, licence_kind, licence_text,
  source_url, attribution, enabled

bible_books / bible_chapters / bible_verses
  canonical identifiers plus version-specific text and versification mapping

original_tokens
  version_id, verse_id, position, surface, normalized, lemma_id,
  strong_id, morphology_code

lemmas
  language, lemma, transliteration, short_gloss, extended_gloss,
  source, licence

verse_mappings
  source_verse_id, target_verse_id, mapping_kind
```

Use Postgres full-text/trigram indexes for Hungarian and simple indexed equality/prefix/lemma queries for original-language concordance. Keep ingestion scripts offline and versioned; do not call third-party APIs for every page render.

## Rough Delivery Bands

These are complexity bands, not commitments; licensing and editorial review can dominate elapsed time.

- Phase 03 evergreen V1: 9 implementation plans, each independently verifiable.
- V2 one-version reader proof: small-to-medium slice after licence/source selection.
- Production multi-version reader: medium project with search, caching, attribution, and versification QA.
- Greek/Hebrew source reader plus lemma concordance: medium-to-large project, best split by testament and dataset.
- Hungarian-aligned interlinear: large research/editorial project, only after a dedicated proof.

## Primary Sources

- Next.js metadata and Open Graph: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- Next.js path revalidation: https://nextjs.org/docs/app/api-reference/functions/revalidatePath
- Google sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google breadcrumb structured data: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Google Article structured data: https://developers.google.com/search/docs/appearance/structured-data/article
- Google VideoObject and video SEO: https://developers.google.com/search/docs/appearance/structured-data/video and https://developers.google.com/search/docs/appearance/video
- YouTube privacy-enhanced embedding: https://support.google.com/youtube/answer/171780
- API.Bible documentation and licence overview: https://scripture.api.bible/docs and https://care.api.bible/article/369-understanding-api-bible-licensing
- Magyar Bibliatársulat copyright policy: https://bibliatarsulat.hu/wp-content/uploads/2023/04/MBTA-copyright-policy.pdf
- Open Hungarian New Testament terms: https://ebible.org/find/details.php?id=hun
- SBLGNT and licence: https://www.sblgnt.com/ and https://github.com/LogosBible/SBLGNT
- MorphGNT: https://github.com/morphgnt/sblgnt
- Open Scriptures Hebrew Bible: https://hb.openscriptures.org/
- STEP Bible data and licence: https://github.com/STEPBible/STEPBible-Data

## Recommendation

Complete Phase 03 first. During its final plan, preserve normalized Scripture references and add a V2 licence register template. Start Phase 04 with one verified open/public-domain Hungarian version and a small Genesis/John ingestion proof. Only then decide which modern translations merit permission work and whether a source-language concordance satisfies the need before attempting Hungarian interlinear alignment.
