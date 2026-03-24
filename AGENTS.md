# Codex Memory Autopilot Rules

This repository is configured for chat-first, structured-memory execution.

## Primary Goal

Keep `.planning/` accurate so work survives context resets and session boundaries.

## Non-Negotiable Behavior

1. If `.planning/STATE.md` is missing, run bootstrap first.
2. Before implementation, read:
   - `.planning/STATE.md`
   - current phase context/plan files (if they exist)
3. After meaningful implementation work, update:
   - relevant `*-SUMMARY.md`
   - `.planning/STATE.md`
4. After plan execution, run verification checks and store results in a verification file.
5. If there is a plan without a matching summary, resume that work before starting unrelated work.
6. Keep `STATE.md` concise. Compact/archive when it grows beyond configured thresholds.

## Workflow Routing

Use `scripts/gtd.ps1` as the single tool surface.

- Fresh memory: `init` (and `map` automatically for brownfield).
- Need orientation: `progress` or `resume`.
- Need a new phase shell: `scaffold-phase`.
- Need a plan shell: `scaffold-plan`.
- Need reliability checks: `verify`.
- Need integrity check: `health` (use `-Repair` when safe).
- Need memory cleanup: `compact`.

## Human Interaction Policy

Human interaction is allowed only for:

1. Product decisions and prioritization.
2. External secrets/login/dashboard actions Codex cannot perform.
3. Explicit destructive confirmations when data could be lost.

When needed, request it in chat and continue automatically afterward.

## Git Policy

Planning files are tracked by default. Do not add `.planning/` to `.gitignore` unless the user asks.

## Quality Bar

A task is not complete unless:

1. The code change exists.
2. The memory state reflects what changed and why.
3. Verification evidence is recorded.

## React 19 + Next.js Working Rules

Reference research: `.planning/research/2026-03-24-react19-next16-best-practices.md`

- Use Next.js 16 App Router with React 19 for all new product-facing work.
- Default to Server Components. Add `"use client"` only at the smallest interactive boundary.
- Organize site- or subdomain-specific code with route groups and private folders so URLs stay stable while features stay colocated.
- Export static `metadata` from layouts/pages and use `next/font` for typography.
- Keep components pure: derive UI from props/data during render and avoid mutations in render.
- Avoid unnecessary Effects. If logic can happen during render or in an event handler, do it there instead.
- When an Effect needs the latest props/state without resubscription churn, prefer `useEffectEvent`.
- For future form and quiz submissions, prefer React Actions with `useActionState` over hand-rolled pending/error plumbing.
- Fetch data in async Server Components by default. Use `loading.tsx` or local `<Suspense>` only where streaming improves the experience.
- Keep all public-facing copy Hungarian unless the user explicitly asks for an exception.
