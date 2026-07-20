# GovernDiff Codex Task Prompt Template

```markdown
# Goal

Implement <one coherent gate/task>.

# Canonical authority

- `docs/specs/GOVERNDIFF_REQUIREMENTS_DEFINITION_v1_2_2.md` — <relevant sections>
- `docs/specs/GOVERNDIFF_BASIC_DESIGN_v1_0_0.md` — <relevant sections>
- `AGENTS.md` and `docs/codex/SECURITY_BOUNDARY.md`

# Exact scope

Allowed Add/Update paths:

- `<path>`

No deletion, move, rename, dependency change, network access, or Git mutation is required.

# Required behavior

- <observable behavior>
- <architecture invariant>
- <canonical fixture expectation>

# Non-goals

- <explicitly excluded work>

# Validation

- `<command>`

# Completion report

Report changed paths, exact validation results, remaining risks, and safety confirmations required by `AGENTS.md`.
```

Use one prompt per coherent task. Do not combine unrelated implementation and cleanup.
