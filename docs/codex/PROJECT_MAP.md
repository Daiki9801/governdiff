# GovernDiff Project Map

## Product flow

```text
Policy draft
→ GPT-5.6 analysis or clearly labeled Sample analysis
→ host compiler and stable rule registry
→ deterministic runtime against built-in synthetic CSV
→ baseline Findings
→ candidate policy analysis
→ deterministic Impact Preview
→ session approval and publish
```

## Directory ownership

| Path | Responsibility | Constraint |
|---|---|---|
| `app/` | Next.js page, layout, server route | API key server-side only |
| `components/` | Three-step business-facing UI | No hidden business logic |
| `lib/domain/` | Compiler, money, dates, runtime, impact, release state | Pure TypeScript; no React/Next/network/OpenAI |
| `lib/openai/` | Prompt, JSON Schema, server analyzer | Policy text only; validate every response |
| `lib/demo/` | Load and validate built-in scenario | Never mislabel Sample as Live |
| `lib/errors/` | Safe user-facing error mapping | No secrets or raw SDK output |
| `demo/` | Canonical synthetic policies, CSV, samples, expectations | Fixture identity and counts are protected |
| `tests/` | Unit and adapter tests | Prove 18/16 and 3/1/15 |
| `docs/specs/` | Requirements and basic design | Read-only authority |
| `docs/codex/` | Agent operations and handoff | Keep concise and current |

## Dependency direction

```text
components → workspace reducer → domain services
API route → OpenAI analyzer → domain schemas
Demo loader → domain schemas
Domain services → no UI, framework, network, or SDK dependency
```

## Canonical invariants

- Baseline v1 Findings: 18
- Candidate Findings: 16
- Removed: 3
- Added: 1
- Unchanged: 15
- Receipt threshold changes retain the stable receipt rule ID.
- Rideshare review receives a new rule ID.
- Candidate edits invalidate candidate approval only.
- Published baseline remains unchanged.
