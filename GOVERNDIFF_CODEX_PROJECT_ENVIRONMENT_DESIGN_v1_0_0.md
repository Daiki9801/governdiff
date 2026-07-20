# GovernDiff Codex Project Environment Design v1.0.0

**Project:** GovernDiff  
**Purpose:** OpenAI Build Week solo implementation environment  
**Target model:** GPT-5.6 Sol in Codex  
**Primary host:** Windows 11, standard user account  
**Canonical requirements:** `GOVERNDIFF_REQUIREMENTS_DEFINITION_v1_2_2.md`  
**Canonical basic design:** `GOVERNDIFF_BASIC_DESIGN_v1_0_0.md`  
**Date:** 2026-07-18  
**Status:** Approved environment baseline after strict review

## 1. Executive decision

Use a **single isolated native-Windows Git repository**, opened by Codex CLI from the exact repository root under the native `workspace-write` sandbox and human-review approval policy.

Do not add Docker, WSL, dev containers, monorepo tooling, MCP, Computer Use, browser automation, subagents, product-embedded Codex App Server, or cloud infrastructure. None is required by the frozen lean P0, whose application architecture is one Next.js app with a server-only GPT-5.6 route and pure TypeScript runtime. The environment therefore preserves the same scope and dependency direction as the canonical basic design.

The environment optimizes for:

1. safe project-bounded execution;
2. a primary thread that clearly represents the core Build Week work;
3. deterministic and reviewable local validation;
4. minimum environment overhead for a solo entrant;
5. recoverability through human-owned Git history and backups.

## 2. Research findings and design implications

### 2.1 GPT-5.6 and Codex version

OpenAI's current GPT-5.6 guidance specifies Codex CLI `0.144.0` as the minimum for GPT-5.6 access. The reviewed current stable package during this design was `0.144.1`; the environment records the actual installed version and rejects pre-release builds for the primary submission thread.

### 2.2 Short AGENTS map

OpenAI's harness-engineering guidance describes a short `AGENTS.md` of roughly 100 lines as a map into structured repository documentation rather than a giant encyclopedia. GovernDiff follows this pattern: root instructions contain mission, preflight, hard boundaries, architecture invariants, and delivery; details live under `docs/codex/`.

### 2.3 Sandbox and approvals

OpenAI describes sandboxing and approvals as complementary: the sandbox is the technical execution boundary; approvals govern crossing it. OpenAI's Windows sandbox uses restricted identities, filesystem ACLs, and firewall rules, with a one-time elevated setup stage and restricted normal execution. GovernDiff therefore requires native sandbox setup by the human and refuses Full Access fallback.

### 2.4 Narrow working directory

A 2026 issue in the official Codex repository reported that `apply_patch` honored the broader `--cd` boundary rather than a narrower `--add-dir` intention. This is direct evidence that `--add-dir` must not be treated as a security fence. GovernDiff launches with `--cd .` from the repository itself and configures no additional project writable root.

### 2.5 Destructive incidents and PowerShell alerts

Official-repository user reports describe severe Windows file deletion. One report later disclosed no sandbox/full-access operation; another disputed an initial assumption that bypass mode was used. These reports do not establish current-sandbox failure rates or a verified common root cause. They do show that unsandboxed/full-access operation, vague cleanup authority, continued execution after unexpected changes, and broad PowerShell mutation are unacceptable failure modes.

A separate issue reported Microsoft Defender blocking a generated PowerShell command that combined inline command execution, encoding manipulation, and corrupted text. The appropriate control is transparent commands, targeted patches, and preserved endpoint protection—not disabling Defender or adding broad exclusions.

## 3. Topology

```text
Windows 11 standard user
└── %USERPROFILE%\CodexProjects\governdiff\
    ├── .git\                     human-managed recovery baseline
    ├── AGENTS.md                 concise repository map
    ├── docs\specs\               frozen authorities
    ├── docs\codex\               operating/security guidance
    ├── app\ components\ lib\     implementation
    ├── demo\                     frozen synthetic scenario
    ├── tests\                    verification
    ├── package.json
    └── pnpm-lock.yaml            human-reviewed then frozen
```

### Location requirements

The repository must be:

- under `%USERPROFILE%\CodexProjects\` or a similarly isolated local development directory;
- outside OneDrive, Desktop, Documents, Downloads, Dropbox, Google Drive, iCloud, network/UNC/removable paths, and drive roots;
- a normal directory with no symlink, junction, reparse redirect, or unexpected mount;
- opened with the repository itself as the current working directory.

Recommended path:

```text
%USERPROFILE%\CodexProjects\governdiff
```

## 4. Toolchain

| Tool | Baseline | Rule |
|---|---|---|
| Windows | Windows 11 | Defender and Tamper Protection enabled |
| Codex CLI | `0.144.0` minimum | Stable release; verify actual version |
| Node.js | `24.18.0` LTS | `.node-version`; no major switch |
| pnpm | reviewed exact 11.x | pin in `packageManager` |
| Next.js | stable `16.2.10` | no preview/canary |
| React | matching stable 19.2.x | exact React/DOM versions |
| TypeScript | conservative 5.9.x | strict mode |
| OpenAI SDK | stable exact 6.x | official Responses API client |
| Zod | stable exact 4.4.x | validate untrusted output |
| Vitest | stable exact 4.1.x | pure domain tests first |

The candidate direct package baseline lives in `docs/codex/DEPENDENCY_BASELINE.md`. Human registry/license review precedes installation. The lockfile then becomes authoritative.

## 5. Client and session policy

### Required launch

```powershell
Set-Location "$env:USERPROFILE\CodexProjects\governdiff"
codex --cd . --sandbox workspace-write --ask-for-approval on-request
```

`/status` must show the exact workspace, GPT-5.6 Sol, `workspace-write`, human-review approval, and network disabled for normal work.

The config file is not trusted as the sole proof because configuration keys, profiles, or precedence can drift. CLI flags and `/status` are the session gate.

### Reasoning effort

- High: implementation, tests, focused debugging.
- Extra-high/maximum available: architecture contradiction review, security review, or final diff review only.
- Avoid maximum effort for repetitive edits; keep the primary thread coherent.

### Primary thread

Use one primary thread for domain/runtime, Sample UI, Live GPT-5.6, integration, README, and tests. Separate threads are read-only review or recovery only. Capture `/feedback` before submission.

## 6. Technical versus instruction controls

| Risk | Technical control | Instruction/process control |
|---|---|---|
| Project-outside write | native sandbox + exact `--cd` | stop on any mismatch |
| Open network | offline sandbox user/firewall | exact one-time approval only |
| `.git` mutation | sandbox protected path where supported | human-only Git policy |
| In-repo accidental deletion | Git baseline/recovery; no broad writable parent | no deletion without exact path approval; targeted patch; human diff |
| Secret exposure | server-only secret and ignored env file | no `.env.local` reading/searching/logging |
| Supply-chain execution | network disabled | reviewed manifest, one-time install, frozen lockfile |

Important limitation: `AGENTS.md` cannot make in-repository deletion cryptographically impossible. The design reduces likelihood and preserves recovery, while the sandbox technically prevents writes outside the exact repository.

## 7. Destructive-operation policy

Normal Codex work may only Add/Update task-scoped repository files. Delete/move/rename requires a current user instruction naming exact canonical paths. Recursive/wildcard cleanup, project-outside cleanup, destructive Git, history rewrite, encoded PowerShell, bulk one-liners, permission changes, endpoint-protection changes, and sandbox bypass are never normal task authority.

If deletion is genuinely required, the human should usually perform it after reviewing a proposed exact path list. Codex must not substitute a recycle-bin or quarantine scheme unless the user explicitly requests and defines it.

## 8. Dependency and supply-chain bootstrap

1. Build the scaffold without generators or network.
2. Write an exact manifest from the reviewed baseline.
3. Human reviews package names, versions, licenses, scripts, registry, and expected lockfile changes.
4. Human runs or explicitly approves one exact install command.
5. Run `pnpm check`.
6. Human commits the lockfile.
7. Use `--frozen-lockfile` thereafter.
8. Feature Freeze blocks updates except confirmed security blockers.

No `npx create-next-app`, Git dependencies, pre-release packages, unknown registries, download-and-execute, force, or lockfile repair.

## 9. Repository documentation model

`AGENTS.md` remains concise. The system of record is:

- `START_HERE.md` — reading order and authority;
- `SECURITY_BOUNDARY.md` — filesystem, command, secret, network, incident rules;
- `CODEX_LAUNCH_AND_CONFIG.md` — exact startup/status gate;
- `DEPENDENCY_BASELINE.md` — reviewed bootstrap candidates;
- `PROJECT_MAP.md` — architecture ownership;
- `VALIDATION.md` — evidence gates;
- `WORKFLOW_AND_HANDOFF.md` and `HANDOFF.md` — primary-thread continuity;
- `TASK_PROMPT_TEMPLATE.md` — compact task shaping.

This minimizes context load while keeping rules auditable and cross-linked.

## 10. Git and recovery

Codex performs read-only Git inspection only. The human creates the repository, commits, branches, tags, pushes, and restores.

Required recovery layers:

1. baseline commit before first Codex write;
2. small human commits after each gate;
3. remote or external backup outside the Codex write boundary before high-risk work;
4. preserved transcripts and `/feedback` ID.

Unexpected filesystem changes immediately stop the task. No automated rollback or cleanup is attempted before evidence is preserved.

## 11. Gate sequence

| Gate | Deliverable | Security/quality exit |
|---|---|---|
| 0 Environment | buildable scaffold, reviewed manifest, lockfile | `/status`, exact root, no network, human commit |
| 1 Deterministic core | compiler/runtime/impact | 18/16 and 3/1/15 tests |
| 2 Sample UI | three-step credential-free flow | Sample label, immutable baseline, evidence |
| 3 Live GPT-5.6 | route/schema/validation | policy-only request, stale-response guard, one smoke test |
| 4 Submission | README/video/Devpost | `pnpm check`, three complete flows, `/feedback` |

## 12. Acceptance criteria

The environment is accepted when:

1. repository is isolated and not a redirect/sync/root path;
2. Codex version supports GPT-5.6;
3. native Windows sandbox is installed and `/status` verifies effective settings;
4. launch uses exact repository `--cd` and no `--add-dir`;
5. AGENTS remains concise and detailed rules are linked;
6. canonical specs/demo data are present and protected;
7. manifest is exact and human-reviewed before install;
8. Git baseline/backup is human-owned;
9. no product scope or unnecessary tool is added;
10. primary-thread and `/feedback` workflow is ready.

## 13. Official and primary references

- OpenAI, *Running Codex safely at OpenAI* — https://openai.com/index/running-codex-safely/
- OpenAI, *Building a safe, effective sandbox to enable Codex on Windows* — https://openai.com/index/building-codex-windows-sandbox/
- OpenAI, *Harness engineering: leveraging Codex in an agent-first world* — https://openai.com/index/harness-engineering/
- OpenAI Help, *GPT-5.6 in ChatGPT* — https://help.openai.com/en/articles/20001354
- OpenAI Codex issue #24214 — `apply_patch`, `--add-dir`, and broader `--cd`
- OpenAI Codex issue #14487 — user-reported Windows drive deletion; disputed execution mode
- OpenAI Codex issue #12277 — user-reported mass deletion; reporter later stated no sandbox/full access
- OpenAI Codex issue #15423 — Defender heuristic on generated PowerShell

## 14. Final decision

> **PASS — use this environment immediately; reduce product scope rather than weaken the sandbox, repository boundary, approval gate, secret controls, or human-owned Git recovery.**
