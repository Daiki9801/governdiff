# GovernDiff Dependency Baseline

## Purpose

This is the frozen, human-reviewed bootstrap baseline. Codex must not silently upgrade, substitute, or add packages.

## Tool baseline

| Tool | Version/policy |
|---|---|
| Node.js | `24.18.0` LTS |
| Codex CLI | `0.144.0` minimum; record actual version |
| pnpm | `11.6.0`; record `pnpm@11.6.0` in `packageManager` |

## Runtime dependencies

| Package | Exact version | Use | License |
|---|---:|---|---|
| `next` | `16.2.10` | App Router and route handler | MIT |
| `react` | `19.2.7` | UI runtime | MIT |
| `react-dom` | `19.2.7` | DOM renderer | MIT |
| `openai` | `6.47.0` | Official Responses API client | Apache-2.0 |
| `zod` | `4.4.3` | Runtime validation | MIT |
| `csv-parse` | `7.0.1` | Built-in synthetic CSV parsing | MIT |

## Development dependencies

| Package | Exact version | Use | License |
|---|---:|---|---|
| `typescript` | `5.9.3` | Strict TypeScript compiler | Apache-2.0 |
| `vitest` | `4.1.10` | Domain and adapter tests | MIT |
| `eslint` | `9.39.5` | Static analysis | MIT |
| `eslint-config-next` | `16.2.10` | Next.js lint integration | MIT |
| `@types/node` | `24.13.3` | Node.js type declarations | MIT |
| `@types/react` | `19.2.17` | React type declarations | MIT |
| `@types/react-dom` | `19.2.3` | React DOM type declarations | MIT |

Do not add `@types/typescript`, `autoprefixer`, Prettier, a component library, or any package not listed above.

## Styling baseline

- Styling uses `app/globals.css` and ordinary CSS.
- No CSS framework or component library is required.
- No PostCSS configuration is required for Gate 0 or P0.

## Supply-chain rules

- No `latest`, caret, tilde, preview, canary, Git URL, local path, or unknown registry.
- Keep every dependency in the runtime or development section shown above, with the exact version shown.
- No `create-next-app`, `npx` generator, or download-and-execute installer inside the Codex task.
- Human reviews `package.json` before first install.
- First install is one exact human-run or explicitly approved command.
- Review lifecycle scripts before installation; do not add custom lifecycle scripts.
- Commit the lockfile immediately after successful validation.
- Subsequent materialization uses `pnpm install --frozen-lockfile`.
- Feature Freeze forbids dependency updates unless required for a confirmed security blocker.

The baseline is optimized for deadline stability, not perpetual freshness.
