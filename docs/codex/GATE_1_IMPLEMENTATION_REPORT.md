# Gate 1 Deterministic Domain Core — Implementation Report

**Report date:** 2026-07-18 JST

**Repository:** `<repository-root>`

**Branch:** `master`

**Implementation baseline:** `0f84b9c`

**Self-review verdict:** PASS

**Gate status:** IN PROGRESS — human review is still required

## 1. Scope and authority

This report covers the complete Gate 1 deterministic domain-core implementation against:

1. `docs/specs/GOVERNDIFF_REQUIREMENTS_DEFINITION_v1_2_2.md`
2. `docs/specs/GOVERNDIFF_BASIC_DESIGN_v1_0_0.md`
3. `AGENTS.md`
4. `docs/codex/SECURITY_BOUNDARY.md`
5. `docs/codex/VALIDATION.md`

Gate 1 intentionally excludes UI behavior, OpenAI API integration, approval persistence, databases, authentication, external actions, and Sample Mode JSON assets.

## 2. Implementation inventory

| Area | Paths | Implemented responsibility |
|---|---|---|
| Contracts and validation | `lib/domain/types.ts`, `lib/domain/schemas.ts` | Strict analysis, expense, policy, Finding, rule-diff, and Impact contracts; Zod schemas are statically bound to their TypeScript contracts. |
| Primitive normalization | `lib/domain/money.ts`, `lib/domain/dates.ts` | Exact decimal USD-to-integer-cents conversion, deterministic rendering, strict ISO calendar dates, and UTC weekend derivation. |
| Host rule registry | `lib/domain/rule-registry.ts` | Seven stable host-owned rule IDs, supported predicate templates, messages, evidence order, source-quote rendering, and canonical ordering. |
| Policy compiler | `lib/domain/policy-compiler.ts` | Strict analysis parsing, blocking issue rejection, exact source-quote validation, structural registry matching, canonical predicate construction, `ruleId`-ascending output, deep-frozen output, and exact versioned rule sets. |
| Fixed runtime | `lib/domain/policy-runtime.ts` | Pure deterministic evaluation, registry revalidation, stable Finding identity/evidence/sorting, and input non-mutation. |
| Impact engine | `lib/domain/impact-engine.ts` | Stable-key removed/added/unchanged Finding classification and canonical stable-ID rule diff that omits unchanged rules. |
| Demo adapter | `lib/demo/load-demo-scenario.ts` | Fixed-path CSV loading, strict normalization, SHA-256 fixture integrity verification, synthetic-email validation, and public-expectation parsing. |
| Verification | `tests/*.test.ts` | Money/date/loader/compiler/runtime/impact/environment coverage, including exact public fixture parity and edge boundaries. |

The domain layer has no React, Next.js, OpenAI SDK, browser, network, random, or current-time dependency.

## 3. Strict review and remediation

The final review found four correctness or hardening gaps. All were corrected before this report was created.

| Finding | Risk | Remediation | Regression evidence |
|---|---|---|---|
| Runtime accepted a structurally matching `all` condition with non-canonical predicate order. | A hand-constructed policy could bypass the compiler's canonical form and create non-canonical runtime behavior. | Runtime now re-canonicalizes predicates and rejects order or value mismatches before evaluating records. | Added runtime test for reversed receipt predicates. |
| Source-quote uniqueness advanced by the full quote length. | Overlapping duplicate occurrences could be missed. | The second search now begins at `first + 1`. | Added compiler test using overlapping `aaa` occurrences in `aaaa`. |
| Synthetic email validation only checked the suffix. | Malformed addresses such as `tester@@example.invalid` could pass normalization. | Added an anchored single-`@` synthetic-domain pattern. | Added demo-loader rejection case. |
| Zod schemas and TypeScript contracts were not statically coupled. | Future schema/type drift might compile unnoticed. | Both boundary schemas are explicitly typed as `z.ZodType<...>`; required textual fields are non-empty. | `pnpm typecheck` and schema-driven tests pass. |

The runtime was also refactored to validate each policy rule once per evaluation instead of repeating registry validation for every record. This does not change observable results.

### Repository-local canonical re-review

A final review against the repository-local requirements and basic design corrected these additional contract mismatches:

| Finding | Canonical correction | Regression evidence |
|---|---|---|
| Compiled rules used registry declaration order. | `PolicySpec.rules` now use stable `ruleId` ascending order. | Compiler tests assert the complete baseline and candidate order. |
| Rule Diff emitted entries for unchanged rules. | Unchanged rules are now omitted; the canonical fixture emits only modified receipt and added rideshare entries. | Impact test asserts the exact two-entry diff. |
| Rule Diff compared `sourceQuote` and rendered text. | Projection now contains only `ruleId`, `outcome`, condition kind, and typed canonical predicates. Source-quote/message-only changes are ignored as required by basic design 14.1. | Added text-only change regression test. |
| Date normalization trimmed input before strict validation. | Date text is NFC-normalized but not trimmed, so surrounding whitespace is rejected by the exact `YYYY-MM-DD` contract. | Added loader rejection case. |
| Canonical output relied only on compile-time `readonly`. | The compiler now deep-freezes its newly copied spec, arrays, rules, conditions, and metadata without freezing model input. | Added deep-freeze/non-input-freeze regression test. |

## 4. Determinism and domain invariants

- Monetary values are parsed from decimal strings into safe integer cents; binary floating-point arithmetic is not used for policy thresholds.
- Calendar dates are validated as real `YYYY-MM-DD` dates and weekend status is derived with UTC semantics.
- Stable rule IDs, labels, messages, source-quote forms, evidence order, and predicate templates are host-owned.
- Model analysis cannot invent runtime rule IDs or author Finding messages.
- Canonical policy rules and runtime Findings are sorted by stable `ruleId`, then record identity where applicable.
- Runtime Findings use `policyId|ruleId|expenseId` identity and deterministic ordering.
- Compiler, runtime, and impact operations do not mutate their inputs.
- The exact baseline and candidate rule sets are version-bound.
- CSV rows, expense IDs, and employee emails remain local; Gate 1 performs no OpenAI or network call.

## 5. Canonical public fixture result

| Measure | Result |
|---|---:|
| Baseline v1 Findings | 18 |
| Candidate v2 Findings | 16 |
| Removed | 3 |
| Added | 1 |
| Unchanged | 15 |

Removed Finding keys:

- `mfs-global-expense|EXP-RCT-001|MFS-EXP-004`
- `mfs-global-expense|EXP-RCT-001|MFS-EXP-005`
- `mfs-global-expense|EXP-RCT-001|MFS-EXP-006`

Added Finding key:

- `mfs-global-expense|EXP-RID-001|MFS-EXP-015`

Unchanged Finding keys:

- `mfs-global-expense|EXP-LDG-001|MFS-EXP-010`
- `mfs-global-expense|EXP-LDG-001|MFS-EXP-011`
- `mfs-global-expense|EXP-LDG-001|MFS-EXP-012`
- `mfs-global-expense|EXP-RCT-001|MFS-EXP-007`
- `mfs-global-expense|EXP-RCT-001|MFS-EXP-008`
- `mfs-global-expense|EXP-RCT-001|MFS-EXP-011`
- `mfs-global-expense|EXP-RCT-001|MFS-EXP-023`
- `mfs-global-expense|EXP-REQ-001|MFS-EXP-019`
- `mfs-global-expense|EXP-REQ-001|MFS-EXP-020`
- `mfs-global-expense|EXP-REQ-001|MFS-EXP-023`
- `mfs-global-expense|EXP-REQ-002|MFS-EXP-021`
- `mfs-global-expense|EXP-REQ-003|MFS-EXP-022`
- `mfs-global-expense|EXP-REQ-003|MFS-EXP-023`
- `mfs-global-expense|EXP-WKD-001|MFS-EXP-017`
- `mfs-global-expense|EXP-WKD-001|MFS-EXP-018`

Rule diff:

| Rule ID | Classification |
|---|---|
| `EXP-RCT-001` | modified |
| `EXP-RID-001` | added |

Unchanged rules are deliberately omitted from `ruleDiff` under the canonical diff contract.

## 6. Validation evidence

| Command or check | Exit code | Result |
|---|---:|---|
| `pnpm lint` | 0 | PASS |
| `pnpm typecheck` | 0 | PASS — Next.js route types generated and strict TypeScript passed. |
| `pnpm test` | 0 | PASS — 6 test files, 54 tests. |
| `pnpm build` | 0 | PASS — optimized Next.js production build. |
| `pnpm check` | 0 | PASS — lint, typecheck, test, and build all passed in one run. |
| Domain dependency-boundary scan | 0 | PASS — no forbidden imports or APIs found. |
| Protected/dependency/config diff scan | 0 | PASS — no protected input, dependency, script, lockfile, workspace, or configuration change found. |

The first sandboxed `pnpm lint` attempt exited 1 because the sandbox identity could not read the pre-existing `node_modules` executable (`EPERM`). The exact validation commands were then run through auto-reviewed sandbox escalation and passed. Full Access was not activated, packages were not installed, and no network access or external write occurred.

## 7. Exact Gate 1 changed paths

- `lib/domain/types.ts`
- `lib/domain/schemas.ts`
- `lib/domain/money.ts`
- `lib/domain/dates.ts`
- `lib/domain/rule-registry.ts`
- `lib/domain/policy-compiler.ts`
- `lib/domain/policy-runtime.ts`
- `lib/domain/impact-engine.ts`
- `lib/demo/load-demo-scenario.ts`
- `tests/money.test.ts`
- `tests/demo-loader.test.ts`
- `tests/compiler.test.ts`
- `tests/runtime.test.ts`
- `tests/impact.test.ts`
- `docs/codex/HANDOFF.md`
- `docs/codex/GATE_1_IMPLEMENTATION_REPORT.md`

## 8. Security and scope confirmation

- No protected canonical specification, security boundary, fixture, secret file, dependency, package script, configuration, workspace setting, or lockfile was modified.
- No file or directory was deleted, moved, renamed, or wholly replaced.
- No package installation, network access, secret access, or repository-external write occurred.
- Git activity is limited to the user-authorized final staging and one local commit; no push, branch operation, history rewrite, or remote mutation is performed.
- Full Access was not used.
- Existing unrelated work was preserved.

## 9. Residual risks and next action

No known Gate 1 correctness failure remains after the repository-local canonical review and full local validation. The remaining process risk is final human acceptance: Gate 1 is deliberately left **IN PROGRESS**, not marked complete. Any later UI, OpenAI, approval, or persistence behavior belongs to a subsequent authorized gate.
