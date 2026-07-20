# GovernDiff agent instructions

## Mission and authority

Implement only the lean Build Week P0 defined by:

1. `docs/specs/GOVERNDIFF_REQUIREMENTS_DEFINITION_v1_2_2.md`
2. `docs/specs/GOVERNDIFF_BASIC_DESIGN_v1_0_0.md`

Authority order: current user instruction, this file, `docs/codex/SECURITY_BOUNDARY.md`, canonical specifications, approved task plan/handoff, then historical material. Stop and report conflicts; do not silently choose.

`AGENTS.md` is an operating guide, not a technical security boundary. The actual write boundary is the verified native Codex sandbox started at the exact repository root.

## Start every task

1. Read `docs/codex/START_HERE.md` and only the linked material needed for the task.
2. Confirm current directory and resolved Git root are the exact GovernDiff repository.
3. Use `/status` to verify GPT-5.6 Sol, `workspace-write`, human-review approval, and default-denied network.
4. Run `git status --short`; preserve unrelated work.
5. State the intended paths and validation before writing.
6. Stop when root, sandbox, approval, scope, or repository state is unclear.

## Repository boundary

- The resolved repository root is the only project write boundary.
- Launch with the repository itself as `--cd`; never launch from a parent and never use `--add-dir`.
- Do not read or write personal, sibling-project, sync-root, backup, system, UNC, removable-drive, or drive-root paths.
- Treat symlinks, junctions, hardlinks, reparse points, mounts, and unexpected path resolution as boundary failures.

Full policy: `docs/codex/SECURITY_BOUNDARY.md`.

## Editing policy

- Use targeted `apply_patch` Add/Update edits.
- Keep the patch minimal and task-scoped.
- Preserve canonical specifications, fixtures, and unrelated user changes.
- Do not delete, move, or rename any file or directory unless the current user message explicitly authorizes the exact canonical source and destination paths.
- Do not perform bulk rewrites, generated one-line PowerShell replacement commands, or cleanup after the task.
- An approval for one path does not authorize its parent, siblings, wildcard matches, or later cleanup.

## Protected paths

Do not modify without exact, explicit authorization:

```text
.git/**
.codex/**
AGENTS.md
docs/specs/**
docs/codex/SECURITY_BOUNDARY.md
demo/MAVRENNA_EXPENSES_PUBLIC_DEMO.csv
demo/public-fixture-expectations.json
.env.local
.env.*.local
pnpm-lock.yaml
```

## Commands, network, and privileges

Normally allowed when relevant:

```text
git status --short
git diff --check
git diff -- <task paths>
git log/show (read-only)
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

Exact user approval is required for dependency or lockfile changes, installation, network access, unfamiliar commands, and every Git-mutating action.

Never use Full Access, `danger-full-access`, approval bypass, administrator/root elevation, destructive Git, recursive/wildcard deletion, encoded PowerShell, `Invoke-Expression`, download-and-execute, Defender exclusions, or secret discovery.

## Architecture invariants

- One Next.js App Router application; no DB, cloud, auth, external SaaS action, or product-embedded Codex App Server in P0.
- GPT-5.6 structures policy text only.
- Pure TypeScript computes Findings and Impact Preview.
- Money uses integer cents, never binary floating point.
- Stable rule IDs come from the host registry, not model invention.
- Sample Mode is always labeled precomputed and is never presented as Live.
- Published v1 is immutable; candidate edits clear candidate approval.
- Canonical results: v1 `18`, candidate `16`, removed `3`, added `1`, unchanged `15`.
- CSV rows, expense IDs, and employee emails are never sent to OpenAI.

Project map: `docs/codex/PROJECT_MAP.md`.

## Implementation quality

- TypeScript strict mode; avoid `any` and unjustified casts.
- Domain code must not depend on React, Next.js, network, or the OpenAI SDK.
- Validate untrusted data with Zod or the explicit compiler.
- Prefer pure functions and focused tests.
- Do not add dependencies, abstractions, frameworks, or P1/P2 scope without approval.
- Fix task-related failures only; report unrelated failures.

## Validation and delivery

Use `docs/codex/VALIDATION.md`. If a check cannot run, state why; never claim it passed.

Git mutation is human-controlled. Do not add, commit, push, branch, checkout, reset, clean, stash, rebase, amend, tag, gc, prune, or modify `.git`.

Keep core implementation in the primary Codex thread. Update `docs/codex/HANDOFF.md` at gate boundaries and capture the primary `/feedback` Session ID before submission.

Final reports must include changed paths, exact commands/results, remaining risks, and confirmation of no unapproved deletion/move, project-outside write, network use, dependency change, secret access, or Git mutation.
