# Phase 03: Evergreen Content Library — Context

**Gathered:** 2026-07-22
**Status:** Ready for implementation

## Phase Boundary

Replace the current root microsite with a Hungarian evergreen content library organized around topics, uploaded PDF Bible studies, and recommended YouTube videos. Deliver dedicated public pages, editable confirmed Scripture references extracted from each PDF, explicit study/video relations, a small editorial admin, a new Living Water identity, complete technical SEO, and a non-destructive migration path for existing content.

This phase does not implement the Bible reader or original-language concordances.

## Locked Product Decisions

- Public-facing content is Hungarian.
- Every topic has a description and dedicated page.
- Every study and video has its own descriptive, indexable page.
- Study materials are uploaded PDF files rather than primarily authored as Markdown in the admin.
- A PDF upload or replacement triggers a simple Bible-reference scan, followed by mandatory editorial review of the proposed list.
- Videos are YouTube recommendations, not self-hosted media.
- A study and video can be explicitly marked as related when they belong together.
- Topics, studies, videos, descriptions, and relations are editable through a very simple admin.
- The visual language must be redesigned around “living water.”
- Revelation 22:17 may anchor the invitation and brand message.
- Planning and feasibility work must be complete before product code is edited.

## Architecture Decisions

### Content model

- `topics`, `studies`, and `videos` are separate tables with UUID identifiers, unique slugs, draft/published status, timestamps, sort order, and SEO fields.
- `study_documents` stores immutable PDF revisions, object-storage metadata, checksum, extraction state, and which revision is currently published.
- `canonical_books`, `canonical_chapters`, and `canonical_verses` provide translation-independent verse identities before any Bible text is imported.
- `study_topics` and `video_topics` provide many-to-many topic membership.
- `study_videos` provides the requested relationship, with optional editor note and ordering.
- `study_reference_candidates` stores detected ranges plus source page, context snippet, detector version, and review status.
- `study_scripture_references` stores only editor-confirmed canonical ranges used by public pages and the future reader.
- Published queries never return drafts. Admin queries are explicitly authenticated and may return both.

### Content editing

- The study record contains a plain-text summary/description for its dedicated SEO page; the authored material itself is the attached PDF.
- Replacing a PDF creates a new document revision and a new candidate set without changing the currently published PDF/reference list until the editor finalizes the revision.
- Text extraction is page-aware where possible. Native-text PDFs receive automatic candidate detection; scanned/image-only PDFs are flagged for manual reference entry in the first version, with OCR deferred.
- Reference detection recognizes an explicit, tested dictionary of Hungarian Bible-book names/abbreviations and common chapter/verse/range separators. It is assistive rather than authoritative.
- The review screen lets the editor accept, edit, reject, add, and reorder references, while viewing page/context evidence and the PDF.
- Topic and video summaries/descriptions are plain text with sensible length validation.
- Slugs are generated from Hungarian titles, remain manually editable, and never change silently after publication.
- Deletion is blocked when it would orphan or silently remove linked content; unpublish is the default safe action.

### Rendering and caching

- Public pages are async Server Components.
- Admin interactivity is kept in small client form boundaries using Server Actions and `useActionState`.
- Successful writes revalidate the affected detail, index, topic, sitemap, and admin paths.
- The data layer is server-only and independent of React components.

### Authentication

- Retain one shared admin password for V1.
- Use a separate `ADMIN_SESSION_SECRET`, secure HTTP-only cookies, constant-time comparison, expiry, and basic login throttling.
- Multi-user roles and password recovery are deferred.

## Information Architecture

| Route | Purpose |
|---|---|
| `/` | Brand invitation, featured topics, recent/featured studies and videos |
| `/temak` | All published topics |
| `/temak/[slug]` | Topic description plus its studies and videos |
| `/tanulmanyok` | All published studies |
| `/tanulmanyok/[slug]` | Study description, confirmed Scripture references, PDF access, topics, and related videos |
| `/videok` | All published video recommendations |
| `/videok/[slug]` | Descriptive watch page, topics, and related studies |
| `/admin` | Authenticated editorial dashboard |
| `/admin/temak/...` | Topic create/edit workflow |
| `/admin/tanulmanyok/...` | Study create/edit workflow |
| `/admin/videok/...` | Video create/edit workflow |

## Visual Thesis

**Mood:** deep spring water meeting warm limestone — contemplative, clear, tactile, and quietly alive.

**Material and colour:** deep mineral teal for structure, warm off-white/limestone for reading surfaces, ink blue-green for text, and one luminous spring-water accent. Avoid beach imagery, generic blue gradients, card mosaics, and ornamental church motifs.

**Typography:** a characterful Hungarian-capable serif for Scripture and headings, paired with a restrained sans-serif for navigation and body text. Two families maximum.

**Hero working copy:**

> „Aki szomjúhozik, jöjjön el; és aki akarja, vegye az élet vizét ingyen.”
> — Jelenések 22,17

The final wording and translation attribution must be verified before launch. The 1908 Károli text is the preferred public-domain starting point.

### Public content plan

1. Full-bleed hero: Élő Víz brand, verse invitation, one CTA to explore topics, and a strong natural-water image.
2. Topic current: a cardless editorial list of a small number of meaningful entry points.
3. Paired content: one featured study and its related video, showing how the catalogue works.
4. Latest or selected resources: restrained list/media rows, not a dashboard grid.
5. Final invitation: return to the verse and invite the reader to begin with a topic.

### Interaction thesis

- A brief, restrained hero entrance suggesting water coming into light.
- Subtle scroll depth or masked water movement in one section only, disabled for reduced motion.
- Underline/current transitions and media reveals that clarify links and relationships.

The admin uses utility-first product language and a calm operational layout, not the marketing hero treatment.

## SEO Decisions

- Topic, study, and video descriptions must be unique editorial copy, not duplicated metadata filler.
- Generate title, description, canonical, Open Graph, and social image data from published records.
- Add valid `BreadcrumbList`; use `Article` for study pages and `VideoObject` only when all required data is present and the embed strategy remains eligible.
- Generate database-backed `sitemap.xml` and `robots.txt`; drafts are excluded and inaccessible publicly.
- Use descriptive Hungarian URLs, semantic headings, visible publication/update dates where useful, and strong internal links between topic/study/video pages.
- Add Search Console and rich-result validation to launch checks; structured data is an eligibility signal, never a ranking promise.

## Migration Policy

- Import the five current study entries and descriptions into the new schema through an idempotent seed/migration, but do not pretend that legacy TypeScript text is an uploaded PDF.
- Existing records without a real PDF remain draft or legacy content until the source document is supplied and reviewed.
- Replace mojibake with verified UTF-8 Hungarian source text during migration.
- Do not delete the Easter quiz, invitation, or old study content during early plans.
- In 03-09, choose between preserving the Easter experience at `/husvet`, retaining selected routes, or redirecting retired routes to the closest relevant evergreen page.
- Back up production content before schema or route cutover.

## PDF Upload and Finalization Flow

1. Admin creates or opens a study draft and uploads a PDF revision directly to the chosen object store through a constrained signed upload.
2. The server validates PDF signature/type, size, sanitized filename, and checksum, then records an immutable `study_document` revision.
3. Text is extracted per page. If extraction fails or yields too little text, the document is marked “manual references required.”
4. The detector produces normalized candidate verse/range rows with page number and a short surrounding snippet.
5. The admin reviews the candidates beside the PDF, edits/adds/removes entries, and explicitly marks reference review complete.
6. Finalization transactionally selects the new PDF revision and replaces the public study-reference set with the confirmed rows.
7. Revalidation updates the study, its topics, sitemap, and—once Phase 04 exists—the affected Bible verse pages.

Files remain private/staged before publication. Published PDFs are served without application cookies and with a deliberate raw-PDF indexing policy so the descriptive HTML page remains canonical.

## Simple Bible Reader Boundary

Phase 03 creates the canonical verse structure and confirmed study mappings but does not display full Bible text. Phase 04 imports one permitted Hungarian translation, builds book/chapter/verse pages, and adds a per-verse “Kapcsolódó tanulmányok” result that selects every published study whose confirmed range contains the verse. Additional translations and Greek/Hebrew concordances remain later phases.

## Codex Discretion

- Exact component names and folder boundaries within the stated route structure.
- Exact colour values, spacing scale, and image crop after visual testing.
- Whether lists use cursor pagination immediately or only once the catalogue size requires it.
- Exact admin navigation layout and form grouping.

## Deferred Ideas

- User accounts, bookmarks, reading progress, comments, newsletters, and personalization.
- Site-wide full-text content search unless the initial catalogue size justifies it during implementation.
- Automated YouTube Data API synchronization; editors remain authoritative for titles and descriptions in V1.
- General media library, image uploads, audio content, or podcast feeds beyond study PDFs.
- OCR for scanned PDFs in the first release; manual reference review remains available.
- Multiple translations, Greek/Hebrew tools, interlinear alignment, and Hungarian lexicon localization.

---
*Phase: 03-evergreen-content-library*
