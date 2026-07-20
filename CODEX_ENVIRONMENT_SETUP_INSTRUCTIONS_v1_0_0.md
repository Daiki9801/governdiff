# Codex Environment Setup Instructions — GovernDiff v1.0.0

## Purpose

Paste this instruction into the **primary Codex thread** for Gate 0 only. Establish a minimal buildable repository shell without implementing GovernDiff product behavior.

## Human prerequisites

Before starting this task, the human operator must:

1. Create `%USERPROFILE%\CodexProjects\governdiff` as an isolated, normal local directory outside OneDrive and other sync roots.
2. Copy this environment pack into that repository.
3. Create the Git repository and a baseline commit manually.
4. Install Codex CLI `0.144.0` or later and complete the native Windows sandbox setup manually. Any one-time UAC elevation is initiated and reviewed by the human, never by Codex.
5. Launch from the exact repository root using:

```powershell
Set-Location "$env:USERPROFILE\CodexProjects\governdiff"
codex --cd . --sandbox workspace-write --ask-for-approval on-request
```

6. Run `/status` and confirm the exact root, GPT-5.6 Sol, `workspace-write`, human-review approval, and no normal-task network access.

If native sandbox setup or verification fails, stop. Do not use Full Access as a fallback.

## Task

Establish the minimal application scaffold defined by the canonical basic design.

Read in order:

1. `AGENTS.md`
2. `docs/codex/START_HERE.md`
3. `docs/codex/SECURITY_BOUNDARY.md`
4. `docs/codex/CODEX_LAUNCH_AND_CONFIG.md`
5. `docs/codex/DEPENDENCY_BASELINE.md`
6. `docs/codex/PROJECT_MAP.md`
7. `docs/specs/GOVERNDIFF_REQUIREMENTS_DEFINITION_v1_2_2.md`
8. `docs/specs/GOVERNDIFF_BASIC_DESIGN_v1_0_0.md`

Before writing, report:

- current working directory and resolved Git root;
- Codex version, model, sandbox, approval, and network state from the session;
- `git status --short`;
- existing paths that conflict with the scaffold;
- proposed files and dependency manifest;
- confirmation that this task needs no deletion, move, rename, package install, network request, or Git mutation.

Stop if the current directory and resolved Git root are not the same exact GovernDiff repository.

## Allowed changes

Create or update only:

```text
.editorconfig
.gitattributes
.gitignore
.env.example
.node-version
LICENSE
README.md
package.json
next.config.ts
eslint.config.mjs
tsconfig.json
vitest.config.ts
app/**
components/**
lib/**
tests/**
demo/sample-analysis-*.json
docs/codex/HANDOFF.md
```

Do not modify the frozen policies, CSV, expectations, canonical specs, `AGENTS.md`, security policy, `.codex/**`, `.env.local`, or lockfile in this task.

Use `apply_patch` for Add/Update changes. Do not delete, move, or rename anything.

## Scaffold requirements

1. One Next.js App Router application; no monorepo packages and no separate backend.
2. `.node-version` is `24.18.0`.
3. Use only exact dependency versions approved in `docs/codex/DEPENDENCY_BASELINE.md`; no caret, tilde, `latest`, preview, canary, Git URL, or local-path specifier.
4. Pin the reviewed toolchain in `package.json` exactly as follows:

```json
{
  "packageManager": "pnpm@11.6.0",
  "engines": {
    "node": ">=24.18.0 <25",
    "pnpm": "11.6.0"
  }
}
```

Place only the runtime packages from `docs/codex/DEPENDENCY_BASELINE.md` in `dependencies` and only its development packages in `devDependencies`. Do not add `@types/typescript`, `autoprefixer`, Prettier, a component library, or any package not listed in that baseline.

5. TypeScript strict mode.
6. Use `app/globals.css` and ordinary CSS. Do not add a CSS framework or component library. No PostCSS configuration is required.
7. Vitest defaults to a Node environment for pure domain tests.
8. Provide scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "check": "pnpm lint && pnpm typecheck && pnpm test && pnpm build"
}
```

Do not add any other scripts during Gate 0.

9. `.gitignore` ignores `.env*` while allowing `.env.example`; also ignore `.next/`, `node_modules/`, coverage, logs, and OS/editor noise.
10. `.env.example` contains `OPENAI_API_KEY=` only. Do not create, read, print, or modify `.env.local`.
11. Create the repository directories from the basic design, but do not implement compiler/runtime/impact logic yet.
12. Create a minimal page that displays `GovernDiff`, `Sample Mode`, and `Environment ready`; make no fabricated feature claim.
13. Create one trivial Vitest test proving the runner configuration.
14. README states that Mavrenna Field Systems and all demo data are synthetic.
15. Do not use `create-next-app`, generators, MCP, browser automation, Computer Use, subagents, or network access.

## Dependency-install gate

Do **not** run `pnpm install`.

After writing `package.json`, stop and report:

- exact direct dependencies and licenses where known;
- why each is required;
- exact proposed install command;
- whether lifecycle scripts would run;
- files expected to change.

The human reviews and runs or explicitly approves one exact install command. After a reviewed lockfile exists, future installs use `pnpm install --frozen-lockfile`.

## Validation

Run only checks that need no installed dependency:

```powershell
git diff --check
git status --short
```

Inspect changed files for secrets, version ranges, unexpected scripts, scope expansion, prohibited external actions, and paths outside the allowlist.

Update `docs/codex/HANDOFF.md` with Gate 0 status, changed paths, commands/results, blockers, and next single task.

## Completion report

Return:

1. Environment summary.
2. Exact added/updated paths.
3. Dependency manifest and proposed install command.
4. Commands and exit codes.
5. Validation results.
6. Deviations or blockers.
7. Confirmation that no file was deleted, moved, renamed, written outside the repository, installed, network-accessed, or Git-mutated.

Do not commit. The human operator reviews and commits.
