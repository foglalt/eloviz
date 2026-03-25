# eloviz

## What This Is

Next.js 16 App Router website for Hungarian Bible studies and Christian content, starting with the `husvet.eloviz.hu` Easter surface.

## Core Value

Clear, scripture-oriented Hungarian content delivered with server-first React patterns and reproducible structured memory.

## Audience

Project owner, contributors, and Hungarian readers looking for Bible-study and Christian resources.

## Constraints

- Use Next.js App Router with React 19 working rules.
- Keep public-facing content fully Hungarian.
- Prepare the codebase for multiple subdomain-specific slices.
- Keep `.planning/` memory accurate after every meaningful change.
- Prefer small, verifiable changes.

## Key Decisions

| Decision | Rationale | Status |
|---|---|---|
| Use Next.js 16 App Router with React 19 | Server-first rendering, metadata support, and future subdomain organization | active |
| Use route groups and private folders for site-specific slices | Keeps URLs clean while allowing subdomain-oriented feature colocation | active |
| Keep public copy Hungarian | Matches the intended audience and content surface | active |
| Store editable quiz content in Neon | Admin changes need durable persistence beyond a local file or deploy cycle | active |
| Protect `/admin` with `ADMIN_PASSWORD` and a signed cookie session | Keeps the admin flow simple without exposing the password to the client | active |
| Use `scripts/gtd.ps1` as the memory workflow entrypoint | Keeps plan, state, and verification consistent | active |

---
*Last updated: 2026-03-24*
