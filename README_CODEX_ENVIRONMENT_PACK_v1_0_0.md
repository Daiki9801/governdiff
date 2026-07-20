# GovernDiff Codex Project Environment Pack v1.0.0

This pack is the reviewed repository seed and operating guidance for implementing GovernDiff with Codex GPT-5.6 Sol on native Windows 11.

## Contents

- `AGENTS.md` — short repository instruction map.
- `CODEX_ENVIRONMENT_SETUP_INSTRUCTIONS_v1_0_0.md` — pasteable Gate 0 scaffold task.
- `GOVERNDIFF_CODEX_PROJECT_ENVIRONMENT_DESIGN_v1_0_0.md` — environment decision and rationale.
- `GOVERNDIFF_CODEX_PROJECT_ENVIRONMENT_STRICT_REVIEW_v1_0_0.md` — independent review.
- `docs/specs/` — frozen requirements and basic design.
- `docs/codex/` — detailed security, workflow, validation, launch, dependency, and handoff guidance.
- `demo/` — frozen synthetic policies, dataset, and expectations.

## Human setup sequence

1. Read the environment design and strict review.
2. Create `%USERPROFILE%\CodexProjects\governdiff` as a normal local directory outside synchronization roots.
3. Copy this pack's repository-seed contents into that directory.
4. Create the Git repository and baseline commit manually.
5. Install/upgrade Codex manually and complete the native Windows sandbox setup.
6. Start Codex exactly as documented in `docs/codex/CODEX_LAUNCH_AND_CONFIG.md`.
7. Verify `/status` before permitting writes.
8. Paste `CODEX_ENVIRONMENT_SETUP_INSTRUCTIONS_v1_0_0.md` into the primary thread.

No product feature implementation is included in this environment pack.
