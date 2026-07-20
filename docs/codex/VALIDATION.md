# GovernDiff Validation Guide

## Principles

- Run the smallest sufficient checks during development.
- Run the full local gate before feature freeze, video recording, and submission.
- Never claim a command passed when it did not run or exited nonzero.
- Do not repair unrelated failures without approval.
- Validation commands do not authorize file cleanup, dependency changes, or Git mutation.

## Validation sets

### Documentation-only

```text
git diff --check
git status --short
```

Also verify links, headings, paths, protected files, and absence of secrets.

### Focused domain change

```text
pnpm typecheck
pnpm test -- <relevant test file or pattern>
git diff --check
git status --short
```

### UI or API change

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
git status --short
```

### Full release gate

```text
pnpm check
git diff --check
git status --short
```

Then manually verify:

1. Sample Mode is visibly labeled.
2. Draft ambiguity is blocked.
3. Baseline produces 18 Findings.
4. Candidate produces 16 Findings.
5. Impact is removed 3 / added 1 / unchanged 15.
6. Evidence shows policy sentence, record, observed value, and expected condition.
7. Candidate edits clear candidate approval.
8. Published baseline remains unchanged.
9. Live Mode uses GPT-5.6 and does not expose the API key.
10. Full flow completes three consecutive times before recording.

## Evidence table

| Field | Required |
|---|---|
| Command | Exact command |
| Scope | Files/component validated |
| Exit code | Numeric result |
| Result | Pass, fail, or not run |
| Notes | Warnings and limits |

## Dependency validation

After the one-time human-approved install:

```text
pnpm install --frozen-lockfile
pnpm check
```

Do not use force, repair, checksum refresh, or dependency updates as routine fixes.
