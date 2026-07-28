---
phase: 03
plan: 11
status: completed
completed: 2026-07-28
---

# 03-11 Summary: Search launch setup

- Centralized the production origin as `https://www.eloviz.hu`, matching the live Vercel hostname, and aligned metadata, self-referential canonicals, JSON-LD, breadcrumbs, robots, and sitemap URLs.
- Added canonicals to the homepage and public catalogue indexes.
- Stopped emitting artificial current timestamps for sitemap entries whose actual update time is unknown.
- Made the raw-PDF policy effective: crawlers may fetch public document routes, which return `X-Robots-Tag: noindex` and an HTTP canonical link to the descriptive HTML study page; bundled legacy PDFs also return `noindex`.
- Added the existing Vercel project as an ignored local link and pushed commit `cbd2d51` to `main`.
- Production deployment `dpl_2exBRBmQCD3rfWw39dGGCZTafRCz` reached READY and received the `www.eloviz.hu` and `eloviz.hu` aliases.

## Verification

- All seven focused test suites passed.
- ESLint, strict TypeScript, the Next.js production build, and GTD Phase 03 verification passed.
- Local and production HTTP checks confirmed:
  - homepage, topic, study, and video canonicals use `https://www.eloviz.hu`;
  - `robots.txt` allows public document crawling and points to the `www` sitemap;
  - the sitemap contains no non-`www` URLs;
  - database-served PDFs return `noindex, follow` plus an HTML canonical;
  - legacy static PDFs return `noindex, nofollow`.

## Owner handoff

1. In Vercel Project Settings > Domains, edit `eloviz.hu` and change its redirect to `www.eloviz.hu` from temporary `307` to permanent `308`.
2. Add `eloviz.hu` as a Domain property in Google Search Console.
3. Copy Google's verification TXT value into the DNS zone served by `ns1-4.dns24.hu`, verify the property, and keep the TXT record.
4. Submit `https://www.eloviz.hu/sitemap.xml`.
5. Inspect and request indexing for the homepage plus the most important topic and study pages.
