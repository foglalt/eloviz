# Phase 04 reader verification — 2026-10-13

**Story:** Visitor selects a book/chapter or submits a reference, reads the
verified Károli text, expands a verse's matching studies, and returns through a
study's Scripture reference.

| Boundary/check | Result and evidence |
|---|---|
| UI → reference lookup | PASS: actual `Jn 3:16` form submission redirects to János 3 `#vers-16` |
| Lookup → data | PASS: endpoints checked against imported text; invalid Jn 99:1 shows Hungarian error |
| Data → reader | PASS: exact text, 36 John 3 verses, 176 Psalm 119 verses, native anchors |
| Verse → study matching | PASS: inclusive/cross-chapter boundaries and deduplicated overlaps |
| Publication/revision filters | PASS: draft, missing-PDF and old references excluded; unpublication reflected immediately |
| Study → verse | PASS: real Páska → Exodus 12:1 → expandable Páska link |
| Anchor behavior | PASS: native cross-page links fixed fragment pseudo-class; target starts around 100 px below sticky header |
| Responsive layout | PASS: 320, 390 and 1440 px; no horizontal overflow; 44 px verse targets |
| SEO/invalid routes | PASS: real canonicals, BreadcrumbList, 1189 chapter sitemap URLs, invalid book/chapter/padded-number 404s |
| Unit regressions | PASS: 79/79 tests (9 new importer/reader cases) |
| Lint/TypeScript/build | PASS; full output in 04-VERIFICATION.md |
| React review | PASS: server rendering, cache deduplication, native forms/details, no new client Effects |
| Fixture cleanup | PASS: owned isolated study/document/reference fixtures removed |

Browser showed no application errors. Development-only font-preload warnings
from the existing font setup were visible; no failed application requests.
Screenshots: ignored `output/playwright/bible-{desktop,mobile,320}.png`.

## Production release

Pending commit/push and exact-deployment HTTP/console/runtime verification.
