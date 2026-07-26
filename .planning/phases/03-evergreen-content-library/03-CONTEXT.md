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
- A PDF upload or replacement triggers Bible-reference detection and automatic finalization when text extraction succeeds.
- OSIS remains the translation-independent storage format; all detected and stored ranges are displayed with one canonical Hungarian abbreviation format.
- Videos are YouTube recommendations, not self-hosted media.
- Video titles and channel names are derived from the YouTube link; the editor separately records the person speaking.
- A study and video can be explicitly marked as related when they belong together.
- Topics, studies, videos, descriptions, and relations are editable through a very simple admin.
- Published studies without an explicit public topic appear under the system-managed `Egyéb` topic; the fallback is derived and does not create a fake editable relationship.
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
- `study_reference_candidates` stores automatically accepted detected ranges plus source page, context snippet, detector version, and compatibility review status.
- `study_scripture_references` stores automatically finalized canonical ranges used by public pages and the future reader.
- Published queries never return drafts. Admin queries are explicitly authenticated and may return both.

### Content editing

- The study record contains a plain-text summary/description for its dedicated SEO page; the authored material itself is the attached PDF.
- Replacing a PDF creates a new immutable document revision; successful extraction and detection atomically make that revision and its finalized reference set current.
- Text extraction is page-aware where possible. Native-text PDFs receive automatic detection and finalization; scanned/image-only or insufficient-text PDFs are rejected with a clear error, with OCR deferred.
- Reference detection recognizes an explicit, tested dictionary covering all 66 canonical books, Hungarian book names/abbreviations, and common chapter/verse/range separators.
- Aliases normalize through OSIS and then render with the canonical Hungarian abbreviation, so variants such as `Zsidók 5:8` and `Zsid 5:8` both finalize as `Zsid 5:8`.
- Topic and video summaries/descriptions are plain text with sensible length validation.
- The video speaker is stored independently from the YouTube channel and participates in admin and public catalogue search.
- Slugs are generated from Hungarian titles when content is created, remain stable on later edits, and are not shown as an ordinary editor field.
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
- Existing records without a real PDF remain draft or legacy content until a text-readable source document is supplied and processed.
- Replace mojibake with verified UTF-8 Hungarian source text during migration.
- Do not delete the Easter quiz, invitation, or old study content during early plans.
- In 03-09, choose between preserving the Easter experience at `/husvet`, retaining selected routes, or redirecting retired routes to the closest relevant evergreen page.
- Back up production content before schema or route cutover.

## PDF Upload and Finalization Flow

1. Admin creates or opens a study draft and uploads a PDF revision directly to the chosen object store through a constrained signed upload.
2. The server validates PDF signature/type, size, sanitized filename, and checksum, then records an immutable `study_document` revision.
3. Text is extracted per page. If extraction fails or yields too little text, the upload is rejected before a document revision is stored.
4. The detector resolves Hungarian aliases to OSIS, deduplicates identical ranges, and produces canonical Hungarian display labels with page/context evidence.
5. One database transaction stores the immutable revision, accepted evidence rows, finalized Scripture ranges, and the new current-document pointer.
6. Revalidation updates the study, its topics, sitemap, and—once Phase 04 exists—the affected Bible verse pages.

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
- Broader YouTube Data API synchronization beyond link-time title/channel metadata.
- General media library, image uploads, audio content, or podcast feeds beyond study PDFs.
- OCR and manual reference correction are deferred; V1 accepts only PDFs with a usable text layer and finalizes detected references automatically.
- Multiple translations, Greek/Hebrew tools, interlinear alignment, and Hungarian lexicon localization.

---
*Phase: 03-evergreen-content-library*
