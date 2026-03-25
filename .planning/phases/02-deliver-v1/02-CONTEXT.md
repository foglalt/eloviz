# Phase 02: Deliver V1 - Context

**Gathered:** 2026-03-24
**Status:** In progress

## Phase Boundary

Establish the Next.js 16 App Router foundation and deliver the first Hungarian `husvet.eloviz.hu` surface with a landing page, real quiz flow, editable admin question management, and an expandable Easter timeline structure.

## Implementation Decisions

### Locked Decisions

- Public-facing copy is fully Hungarian.
- The repo uses Next.js 16 App Router with React 19.
- The current feature slice is organized under a route group with private folders to prepare for future site/subdomain-specific surfaces.
- Landing-page content is data-driven so the Easter timeline can be refined later without restructuring the page.
- Quiz question content persists in Neon when `DATABASE_URL` is available.
- The admin editor is protected by `ADMIN_PASSWORD` and a signed cookie session.

### Codex Discretion

- Exact quiz copy, explanations, and scoring tone.
- Visual language inside the warmer parchment/clay theme direction.
- Admin-editor ergonomics for adding, removing, and reordering questions.

## Deferred Ideas

- Real host-based subdomain routing and deployment setup.
- Final Easter event wording and verse-by-verse study content.
- Richer quiz result tiers or follow-up reading recommendations.

## Additional Notes

- Vercel still carried a stale `dist` Output Directory from the old Vite setup, so repo-level deployment overrides may be needed while the dashboard catches up.
- The local shell used for this implementation does not currently expose `DATABASE_URL`, so Neon-backed writes could not be exercised locally.

---
*Phase: 02-deliver-v1*
