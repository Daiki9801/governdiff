# GovernDiff Codex Launch and Configuration

## Technical boundary first

Repository instructions reduce mistakes but do not enforce filesystem isolation. The native Codex sandbox, the exact `--cd` root, and human approval are the technical controls.

## One-time human setup

1. Install or upgrade Codex CLI manually to a version compatible with GPT-5.6 Sol (`0.144.0` minimum).
2. Complete the current native Windows sandbox setup. The current Windows implementation may require one human-reviewed elevated setup step to create restricted users and firewall rules; normal Codex work then runs without administrator authority.
3. Keep Windows Defender and Tamper Protection enabled.
4. Do not let Codex install/upgrade itself, elevate, disable security controls, or broaden permissions.

## Required launch command

Run from an ordinary PowerShell session:

```powershell
Set-Location "$env:USERPROFILE\CodexProjects\governdiff"
codex --cd . --sandbox workspace-write --ask-for-approval on-request
```

Do not use a parent directory as `--cd`. Do not use `--add-dir`.

## Status gate

Before any write, use `/status` and confirm:

```text
model: GPT-5.6 Sol
workspace: exact GovernDiff repository
sandbox: workspace-write
approval: on-request or equivalent human review
network: disabled for normal tasks
```

A config file or profile name is not proof of the effective state. `/status` is the required session check.

## Optional configuration template

The following is a reference only. CLI flags and `/status` remain authoritative because configuration keys and profile behavior can change between releases.

```toml
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[sandbox_workspace_write]
network_access = false
writable_roots = []
```

Do not place provider credentials or secrets in a project configuration file.

## Failure behavior

- Native sandbox unavailable: stop or use read-only analysis.
- Root differs: exit and relaunch from the exact repository.
- Full Access suggested as a workaround: reject it.
- Network needed: request approval for one exact command/operation only.
- Defender alert: stop, preserve the alert and transcript, and do not create exclusions or disable protection.
