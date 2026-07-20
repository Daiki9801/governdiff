# GovernDiff Codex Workflow and Handoff

## 1. Primary thread

Use one primary Codex thread for most core implementation:

- deterministic domain model/runtime;
- canonical fixture tests;
- Sample Mode flow;
- GPT-5.6 server adapter and ambiguity gate;
- final integration, README, and testing instructions.

This keeps the Build Week `/feedback` Session ID attributable to the core work.

Separate threads are limited to read-only independent review or recovery after the primary thread becomes unusable. A review thread must not silently modify the primary worktree.

## 2. Gates

### Gate 0 — Environment

- Tool versions recorded.
- Native sandbox and `/status` verified.
- AGENTS, security guidance, specs, and demo assets present.
- Manifest reviewed; lockfile created by/with exact human approval.

### Gate 1 — Deterministic core

- integer cents;
- compiler and stable rule registry;
- runtime;
- Impact Engine;
- 18/16 and 3/1/15 tests.

### Gate 2 — Sample UI

- three-step flow;
- honest Sample label;
- Findings/evidence;
- candidate approval invalidation and immutable baseline.

### Gate 3 — Live GPT-5.6

- server route;
- strict JSON Schema;
- Zod validation;
- stale-response protection;
- one approved Live smoke test.

### Gate 4 — Submission

- `pnpm check`;
- three successful full flows;
- English README;
- video/Devpost assets;
- `/feedback` Session ID.

Do not start a later gate while the current gate acceptance criteria fail.

## 3. Task prompt pattern

```text
Goal
Canonical authority
Exact scope and allowed paths
Required behavior/invariants
Validation commands
Explicit non-goals
Expected final report
```

State the boundary once and refer to `AGENTS.md` and the security document. Avoid long repeated prohibition lists that crowd out the task.

## 4. Gate review

1. Ask the primary thread to self-review against exact acceptance criteria.
2. Run required validation.
3. Human reviews the diff.
4. Update `HANDOFF.md`.
5. Human creates the commit.
6. Continue in the same thread when context remains healthy.

## 5. Handoff

`HANDOFF.md` is current state, not a diary. Replace it at gate boundaries.

Record:

- gate/status;
- exact human-provided baseline commit;
- uncommitted paths;
- commands/results;
- blockers;
- next single task;
- primary Session ID and `/feedback` status.

Never include credentials, personal data, private prompts, or hidden reasoning.

## 6. Session closure

Before ending a write session:

```text
appropriate pnpm checks
git diff --check
git status --short
```

Confirm no unapproved deletion/move/rename, project-outside write, network/install, secret access, Git mutation, or protected-file change.
