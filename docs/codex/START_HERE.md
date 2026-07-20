# GovernDiff Codex Start Here

## Read only what the task needs

For an implementation task:

1. `/AGENTS.md`
2. This file
3. `SECURITY_BOUNDARY.md`
4. `PROJECT_MAP.md`
5. Relevant canonical specification sections
6. `VALIDATION.md`
7. `WORKFLOW_AND_HANDOFF.md` when opening or closing a gate

Do not load every historical document into context.

## Authority order

1. Current direct user task
2. Root `AGENTS.md`
3. `docs/codex/SECURITY_BOUNDARY.md`
4. `docs/specs/GOVERNDIFF_REQUIREMENTS_DEFINITION_v1_2_2.md`
5. `docs/specs/GOVERNDIFF_BASIC_DESIGN_v1_0_0.md`
6. Approved task-specific plan or `HANDOFF.md`
7. Historical material

A lower item may explain but not override a higher item. Security restrictions may narrow implementation freedom but must not silently change product requirements.

## Preflight before writes

```powershell
Get-Location
git rev-parse --show-toplevel
git status --short
codex --version
```

Use `/status` to verify:

- exact repository root;
- GPT-5.6 Sol;
- `workspace-write` sandbox;
- human-review approval mode;
- normal-task network disabled.

If any check fails, stop. Do not use Full Access as a workaround.

## Task sizing

Prefer one coherent gate per task:

- deterministic domain;
- Sample Mode UI;
- Live GPT-5.6 adapter;
- final integration/validation;
- submission documentation.

Do not combine environment setup, core implementation, UI polish, deployment, and submission into one unreviewable patch.
