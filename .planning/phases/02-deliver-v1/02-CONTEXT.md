# Phase 02: Deliver V1 - Context

**Gathered:** 2026-03-24
**Status:** In progress

## Phase Boundary

Establish the Next.js 16 App Router foundation and deliver the first Hungarian `husvet.eloviz.hu` surface with a landing page, quiz entry point, and expandable Easter timeline structure.

## Implementation Decisions

### Locked Decisions

- Public-facing copy is fully Hungarian.
- The repo uses Next.js 16 App Router with React 19.
- The current feature slice is organized under a route group with private folders to prepare for future site/subdomain-specific surfaces.
- Landing-page content is data-driven so the Easter timeline can be refined later without restructuring the page.

### Codex Discretion

- Visual language inside the "living water" theme.
- Exact draft phrasing for the first timeline entries until the user provides the final chronology/content.
- Whether a follow-up quiz page starts as a placeholder or a minimal interactive shell.

## Deferred Ideas

- Real host-based subdomain routing and deployment setup.
- Detailed quiz logic, scoring, and results experience.
- Final Easter event wording and verse-by-verse study content.

## Additional Notes

- Vercel still carried a stale `dist` Output Directory from the old Vite setup, so repo-level deployment overrides may be needed while the dashboard catches up.

---
*Phase: 02-deliver-v1*
