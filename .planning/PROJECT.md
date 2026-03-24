# eloviz

## What This Is

React + Vite application with structured-memory workflow enabled for reproducible delivery.

## Core Value

Stable baseline setup and verified build/lint pipeline before feature work.

## Audience

Project owner and contributors.

## Constraints

- Keep setup reproducible with npm scripts.
- Keep `.planning/` memory accurate after every meaningful change.
- Prefer small, verifiable changes.

## Key Decisions

| Decision | Rationale | Status |
|---|---|---|
| Use React 19 + Vite 8 baseline | Fast iteration and modern toolchain | active |
| Use `scripts/gtd.ps1` as the memory workflow entrypoint | Keeps plan, state, and verification consistent | active |

---
*Last updated: 2026-03-24*
