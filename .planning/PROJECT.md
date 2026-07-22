# Élő Víz

## What This Is

A Hungarian-language, evergreen Bible-study library. Visitors discover topics, open uploaded PDF study materials, watch recommended YouTube videos, move between related resources, and later read a simple Bible with links back to studies that cite each verse.

## Core Value

Make thoughtful, Scripture-oriented Hungarian material easy to explore, share, and find through search engines.

## Audience

- Hungarian readers looking for Bible-study material by subject.
- Small groups, teachers, and church communities preparing studies.
- A small trusted editorial team maintaining the catalogue.

## Product Principles

- Scripture and content come before interface decoration.
- Every public topic, study, and video has a useful, indexable URL of its own.
- Public copy is Hungarian by default.
- The public experience is calm, readable, accessible, and unmistakably connected to the “living water” theme.
- Editorial work stays simple enough for a non-technical administrator.
- Content is never destroyed during migration without an explicit decision.
- Automatically detected Scripture references are suggestions until an editor confirms them.

## Technical Constraints

- Continue with Next.js 16 App Router, React 19, TypeScript, and Neon Postgres.
- Default to async Server Components and keep client boundaries small.
- Use React Actions and `useActionState` for admin forms.
- Store durable content in Postgres rather than source files.
- Keep `.planning/` current and verify every implementation plan.

## Key Decisions

| Decision | Rationale | Status |
|---|---|---|
| Make `eloviz.hu` an evergreen content library | The new purpose is broader than the former Easter microsite | completed |
| Model topics, studies, and videos as separate entities | Each needs its own description, lifecycle, URL, and SEO metadata | completed |
| Use many-to-many topic assignments | One resource can legitimately belong to more than one subject | completed |
| Relate studies and videos through a dedicated join table | Keeps the requested pairing simple and referentially safe | completed |
| Keep a one-password admin for V1 | Matches the requested operational simplicity | completed |
| Treat versioned PDF files as the primary study material | Matches the real editorial workflow and preserves authored document layout | completed |
| Extract candidate Scripture references from each PDF | Makes verse-to-study discovery practical without requiring manual entry from scratch | completed |
| Require editorial confirmation of detected references | Reference syntax is ambiguous and automated extraction must not silently publish errors | completed |
| Link references to a translation-independent canonical verse structure | Lets one reference list power the simple reader and future translations | completed |
| Retire the Easter microsite after local backup and permanent redirects | The user explicitly approved complete legacy replacement | completed |
| Build a one-translation Bible reader before concordances | Delivers the useful reader and verse-to-study discovery with substantially less data complexity | planned |

---
*Last updated: 2026-07-22*
