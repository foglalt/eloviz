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
