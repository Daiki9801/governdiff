# GovernDiff Codex Project Environment Strict Review v1.0.0

**Reviewed artifact:** GovernDiff Codex Project Environment v1.0.0  
**Review date:** 2026-07-18  
**Development model:** Solo entrant / Windows 11 / GPT-5.6 Sol  
**Pass threshold:** 90/100  
**Final score:** **97/100**  
**Decision:** **PASS**

## 1. Review objective

Determine whether the environment:

1. remains consistent with requirements v1.2.2 and basic design v1.0.0;
2. enables the majority of core implementation in one Codex thread;
3. protects project-external data with a technical boundary;
4. prohibits unapproved deletion/move/rename and dangerous commands;
5. minimizes supply-chain and secret exposure;
6. remains feasible under the hackathon deadline.

## 2. Evidence reviewed

### Project authorities

- `GOVERNDIFF_REQUIREMENTS_DEFINITION_v1_2_2.md`
- `GOVERNDIFF_BASIC_DESIGN_v1_0_0.md`
- canonical policies, CSV, and expected fixture results

### Official OpenAI sources

- GPT-5.6 minimum Codex version guidance
- Windows native sandbox architecture
- sandbox/approval/network operational guidance
- harness-engineering guidance for short `AGENTS.md`
- current Codex package release metadata

### Primary issue reports

- #24214: narrower `--add-dir` expectation not enforced by `apply_patch`; exact `--cd` did constrain it
- #14487 and #12277: severe user-reported Windows deletions, with different/disputed sandbox context
- #15423: Defender heuristic on generated PowerShell

Issue reports were used as threat evidence, not as verified platform-wide incident statistics.

## 3. Review cycles

### Cycle 1 — Architecture and deadline

**Finding:** Docker, WSL, dev containers, MCP, subagents, or App Server integration would add setup and failure modes not required by the lean product design.

**Correction:** Native Windows, one repository, one Next.js application, one primary thread.

**Result:** Pass.

### Cycle 2 — AGENTS context quality

**Finding:** A monolithic security and architecture manual in `AGENTS.md` would consume context and drift.

**Correction:** Short root map with structured `docs/codex/` system of record, matching OpenAI harness guidance.

**Result:** Pass.

### Cycle 3 — Technical boundary versus prose

**Finding:** Initial language could imply AGENTS rules technically prevent every deletion.

**Correction:** Explicitly distinguish technical sandbox enforcement from instruction/process controls. Project-outside writes are technically fenced; in-repository deletion is controlled by exact approval, protected paths, Git baseline, small patches, and review.

**Result:** Pass with honest limitation.

### Cycle 4 — Working-root vulnerability

**Finding:** `--add-dir` must not be treated as the narrower security boundary because of official-repository issue evidence.

**Correction:** exact repository `--cd`, no parent launch, no `--add-dir`, `/status` gate.

**Result:** Pass.

### Cycle 5 — Windows sandbox lifecycle

**Finding:** “Never elevate” could conflict with the current Windows sandbox's human-initiated setup stage.

**Correction:** one-time human-reviewed UAC setup allowed; Codex never self-elevates; normal tasks remain standard/restricted; no Full Access fallback.

**Result:** Pass.

### Cycle 6 — Destructive incidents

**Finding:** Anecdotal reports could be overstated or ignored.

**Correction:** classify them as user reports with incomplete/different execution contexts, extract conservative controls, and avoid claiming a common verified root cause.

**Result:** Pass.

### Cycle 7 — PowerShell and endpoint security

**Finding:** Windows workflows can create opaque one-line commands and false-positive endpoint alerts.

**Correction:** targeted `apply_patch`, transparent commands, no encoded/dynamic execution, no Defender disable/exclusion, preserve incident evidence.

**Result:** Pass.

### Cycle 8 — Supply chain

**Finding:** late generators and unpinned dependencies could consume time or execute unexpected scripts.

**Correction:** offline scaffold, exact reviewed manifest, human install gate, frozen lockfile, no preview/Git/local-path packages.

**Result:** Pass.

### Cycle 9 — Prompt and setup usability

**Finding:** setup allowlist included unnecessary monorepo metadata and did not include handoff update.

**Correction:** remove `pnpm-workspace.yaml`; add `docs/codex/HANDOFF.md`; prohibit install/network during scaffold.

**Result:** Pass.

### Cycle 10 — Recovery and audit

**Finding:** prevention inside the writable repository cannot be absolute.

**Correction:** baseline commit, gate-sized human commits, external backup, transcript preservation, immediate stop on unexpected change, no automatic rollback.

**Result:** Pass.

## 4. Score

| Axis | Weight | Score |
|---|---:|---:|
| Alignment with frozen product design | 15 | 15 |
| Project-outside technical containment | 20 | 19 |
| Destructive-operation safety | 15 | 14 |
| Secret/network/supply-chain safety | 15 | 15 |
| AGENTS quality and context efficiency | 10 | 10 |
| Windows practicality | 10 | 9 |
| Solo deadline feasibility | 10 | 10 |
| Handoff and Build Week evidence | 5 | 5 |
| **Total** | **100** | **97** |

The three-point deduction reflects residual platform risk, the fact that in-repository deletion cannot be made impossible by Markdown instructions alone, and dependency metadata freshness at bootstrap.

## 5. Critical controls that must not be relaxed

1. Exact repository `--cd`; no parent and no `--add-dir`.
2. Native `workspace-write` sandbox and `/status` verification.
3. No Full Access, bypass, or Codex-initiated elevation.
4. No deletion/move/rename without exact user paths.
5. No project-outside cleanup or broad PowerShell mutation.
6. Human-controlled Git and external recovery copy.
7. Server-only API key and no secret discovery.
8. Human-reviewed manifest and frozen lockfile.
9. Network disabled except one exact approved operation.
10. Stop immediately on unexpected filesystem behavior.

## 6. Residual risks

| Risk | Severity | Treatment |
|---|---:|---|
| Future Codex sandbox regression | Medium | pin stable version, exact root, `/status`, small commits, incident stop |
| In-repository `apply_patch` deletion despite instructions | Medium | exact no-delete rule, protected paths, Git baseline, human diff/recovery |
| Broad read visibility of user files | Medium | isolated standard account/repo; prohibit project-external reads; no secret searching |
| Defender false positive | Low/Medium | transparent commands; preserve protection and alert evidence |
| Package registry/version drift | Medium | human revalidation once, exact manifest, frozen lockfile |
| Deadline pressure | High | remove product scope, never remove security controls |

## 7. Final decision

> **PASS — the pack is suitable for immediate GovernDiff implementation. No additional environment feature is justified before Gate 1.**
