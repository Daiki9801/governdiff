# Gate 2C — Impact, Evidence, Approval, and Publish Implementation Plan

## 1. Status and decision

**Planning status:** COMPLETE

**Implementation status:** COMPLETE

**Closure status:** VALIDATED

**Planning baseline:** `4ae321324cf5d53d09641497760e06776a2eb7c3`

**Decision:** Gate 2C can be completed as one dependency-free, network-free mutation using the existing Gate 2A state/domain foundation and Gate 2B Client workspace.

The slice starts at one immutable published baseline `mfs-v1` with 18 Findings and ends at an immutable two-release history, `mfs-v1` followed by `mfs-v2`, with the candidate approved against its current revision and analysis ID. Gate 3 Live GPT-5.6 remains separate.

## 2. Authority and baseline

Authority order:

1. Current direct human instruction
2. `AGENTS.md`
3. `docs/codex/SECURITY_BOUNDARY.md`
4. `docs/specs/GOVERNDIFF_REQUIREMENTS_DEFINITION_v1_2_2.md`
5. `docs/specs/GOVERNDIFF_BASIC_DESIGN_v1_0_0.md`
6. `docs/codex/GATE_2_PRODUCT_FLOW_AND_SAMPLE_MODE_PLAN.md`
7. `docs/codex/GATE_2A_IMPLEMENTATION_PLAN.md`
8. `docs/codex/GATE_2B_IMPLEMENTATION_PLAN.md`
9. `docs/codex/HANDOFF.md`
10. Commit `4ae321324cf5d53d09641497760e06776a2eb7c3`
11. Current implementation and tests

Verified baseline:

```text
repository: <repository-root>
branch: master
HEAD: 4ae321324cf5d53d09641497760e06776a2eb7c3
subject: feat: complete Gate 2B baseline UI
working tree: clean
index: empty
untracked: none
basic design SHA-256: 6CC55AAA6C53437F2294D85AF48AC70AB5194B94CE68C7EDE699E2C0C9382B13
existing validation baseline: 13 test files / 111 tests PASS
```

Reviewed differences and resolutions:

- The planning prompt lists candidate approval before Impact in one coverage list and refers to an approved candidate spec as Impact input. The canonical reducer requires `candidate_ready → IMPACT_COMPUTED → impact_ready → APPROVE_CANDIDATE → candidate_approved`; therefore Impact is computed from a current, not-yet-approved candidate analysis, then the user approves the reviewed current Impact.
- Finding-set Impact has only `removed`, `added`, and `unchanged`. There is no modified Finding category. `modified` belongs only to Rule Diff, where `EXP-RCT-001` is modified.
- `3 / 1 / 15` means three removed FindingKeys, one added FindingKey, and fifteen shared FindingKeys represented by candidate-side Findings. It does not mean three modified records, one modified rule, or fifteen unchanged policy sentences.
- The canonical repository tree is conceptual. The current implementation correctly co-locates runtime and Impact under `lib/domain/`; Gate 2C uses the real paths and does not create empty `lib/runtime/` or `lib/impact/` abstractions.
- Current state/events/reducer already implement Gate 2C transitions. A narrow selector change is still required so a removed baseline Finding can be selected for evidence without duplicating selection state. No event or reducer case changes are required.

## 3. Gate 2C objective

Complete the credential-free Sample flow:

```text
immutable mfs-v1 / 18 Findings
→ start candidate from exact published v1 text
→ atomically transform to canonical v2 text
→ analyze target 1.1.0 / seven rules
→ compute deterministic Impact against the same 48 records
→ show 18 → 16, removed 3, added 1, unchanged 15
→ show modified receipt rule and added rideshare rule
→ inspect affected Finding evidence
→ approve the current candidate revision + analysis ID
→ publish immutable mfs-v2 / 16 Findings
→ retain ordered v1 → v2 session history
```

The UI remains explicit that Findings are review candidates, publication is session-only, prior v1 is unchanged, and no expense is approved, rejected, reimbursed, submitted, or otherwise acted upon.

## 4. In scope

- Guarded candidate start from the single published `mfs-v1` snapshot.
- Candidate editor initialized with an exact string copy of published v1.
- Atomic `createCandidateV2()` transformation and one revision increment.
- Candidate Sample analysis through the existing controller at target version `1.1.0`.
- Seven-rule candidate review with zero ambiguities and zero unsupported statements.
- Deterministic candidate runtime and Impact computation against the same 48-record array.
- Fail-closed fixture verification for exact Finding keys, totals, and Rule Diff.
- Impact summary, exact affected records, and canonical Rule Diff.
- Finding selection and Evidence Drawer for baseline, removed, added, and unchanged/current candidate Findings.
- Candidate approval after current Impact exists.
- Guarded immutable `mfs-v2` publication from `ImpactComputation.candidateFindings`.
- Ordered session release history preserving immutable v1.
- Safe failure, retry, Reset, stale-response, pending, and post-publication states.
- Keyboard, focus, drawer, desktop, and approximately 768px responsive behavior.
- Focused controller/workflow tests, full regression validation, and localhost manual acceptance.

## 5. Out of scope

- Live GPT-5.6 success path, OpenAI SDK call, or `POST /api/analyze`.
- API-key detection, input, storage, or environment-value access.
- External network, automatic Live-to-Sample fallback, or any application API request.
- CSV upload, arbitrary policy vocabulary, additional scenarios, or generalized rule authoring.
- Database, localStorage, persistence, authentication, RBAC, audit chain, rollback, revoke, or edit-published behavior.
- Email, payment, reimbursement, approval, rejection, SaaS update, or other operational action.
- Dependency, package script, configuration, or lockfile change.
- Playwright/DOM-test dependency, design-system rewrite, animation framework, favicon work, deployment, analytics, export, README, or submission polish.
- Gate 3 planning or implementation, remote operations, push, or release publication outside the local session.

## 6. Existing architecture assessment

| Existing path / contract | Assessment | Gate 2C decision |
|---|---|---|
| `lib/state/demo-events.ts` | Exact 12-event union already includes every Gate 2C event. | Consume unchanged; add no event. |
| `lib/state/demo-reducer.ts` | Implements candidate start/edit/analyze, Impact, approval, selection, v2 publish, invalidation, duplicate guards, and Reset. | Consume unchanged. |
| `lib/state/demo-state.ts` | Factories and guards are complete; visible Finding selection currently excludes removed baseline Findings once Impact is current. | Modify only the visible-Finding selector membership used by `canSelectFinding`; retain all state shape and guards. |
| `lib/analysis/policy-analysis-controller.ts` | Already maps candidate to `1.1.0`, sequences requests, aborts prior work, and checks target revision. | Reuse unchanged; extend focused tests for candidate concurrency. |
| `lib/analysis/sample-policy-analyzer.ts` | Owns copied/frozen browser assets and exact target/text matching. | Reuse unchanged. |
| `lib/demo/quick-actions.ts` | `createCandidateV2()` performs exact atomic anchors, normalized v2 hash check, and original-text failure. | Reuse unchanged. |
| `lib/domain/policy-runtime.ts` | Stable, deterministic Finding generation and sorting. | Reuse unchanged for candidate Findings. |
| `lib/domain/impact-engine.ts` | Implements FindingKey classification and canonical Rule Diff. | Reuse unchanged. |
| `lib/demo/fixture-expectation-guard.ts` | Recomputes and verifies 18/16/3/1/15, exact keys, and the two Rule Diff entries. | Invoke before dispatching `IMPACT_COMPUTED`; reuse unchanged. |
| `createImpactComputation()` / `createReleaseSnapshot()` | Copy and deep-freeze all nested values. | Use for every dispatched Impact/v2 payload. |
| Gate 2B Client workspace | Owns reducer, controller, command errors, focus refs, and browser-side Sample analyzer. | Extend as the single command orchestrator; do not create another reducer or controller. |
| Current presentation components | Baseline-only copy/actions and no evidence callback. | Generalize narrowly and add the three canonical missing views. |
| Vitest configuration | Node-only `tests/**/*.test.ts`; no DOM renderer or browser environment. | Use pure workflow/controller tests and manual browser verification; add no dependency. |

Next.js boundary remains unchanged: `app/page.tsx` stays the dynamic Server Component that loads the fixture, while `GovernDiffWorkspace` stays the narrow interactive Client island. Gate 2C adds no route, Server Action, client fetch, cache, external font, or external asset.

## 7. Gate 2B handoff contract

Gate 2C starts only from:

```text
phase: baseline_published
mode: sample
releases: exactly one immutable mfs-v1 / v1 / 1.0.0
baseline Findings: exact 18 stable keys
baseline approval: current baseline revision + analysisId
candidate: null
impact: null
selectedFindingKey: null
error: null
```

`canStartCandidate(state)` must be true. The command re-selects the single `mfs-v1`, passes its exact `policyText` as `START_CANDIDATE.text`, and performs no transformation. The reducer requires exact text equality, no existing candidate, and no `mfs-v2` before entering `candidate_editing` with revision `0`.

The published v1 object is never used as mutable editor state. String primitives may have equal values, but all candidate analysis, approval, Impact, and release objects remain independently owned. No event can mutate a published release.

## 8. Canonical candidate progression

Baseline:

```text
releaseId: mfs-v1
displayVersion: v1
releaseVersion/spec version: 1.0.0
rules: 6
Findings: 18
receipt threshold: amount_usd >= USD 100.00 with missing receipt
```

Candidate progression:

1. `START_CANDIDATE` copies exact published v1 text into candidate revision `0`.
2. `createCandidateV2(candidate.text)` validates every source anchor and the resolved-v1 hash.
3. Success changes display/release/effective metadata, changes receipt USD 100.00 → USD 150.00, and inserts the rideshare sentence exactly once.
4. `POLICY_EDITED target: candidate` stores the canonical v2 text, increments revision exactly once, clears derived state, and remains `candidate_editing`.
5. The normalized output must match SHA-256 `1d6e521b4b8715c74bdebfbf6518e61686e207cb450847f0541097f443fd6b63`.
6. Candidate analysis uses target `1.1.0` and accepts exactly seven sorted rule IDs:

```text
EXP-LDG-001
EXP-RCT-001
EXP-REQ-001
EXP-REQ-002
EXP-REQ-003
EXP-RID-001
EXP-WKD-001
```

Candidate behavioral changes:

- `EXP-RCT-001` remains the stable receipt rule ID but changes from `amount_usd >= 10000` cents to `amount_usd >= 15000` cents.
- `EXP-RID-001` is added with `category == rideshare AND amount_usd > 12000 AND manager_preapproved == false`.
- The other five rules retain canonical behavior.
- Candidate analysis must have zero ambiguities and zero unsupported statements.
- Candidate Findings must be 16 exact stable keys; no UI constant may substitute for runtime results.

## 9. State and event contract

The exact 13 phases and 12 events remain unchanged.

| Command/event | Required guard/input | Transition/result | Invalid or stale behavior |
|---|---|---|---|
| `START_CANDIDATE` | `canStartCandidate`; exact v1 snapshot text | `baseline_published → candidate_editing`; candidate revision 0 | Safe `STATE_TRANSITION_INVALID`; domain data preserved |
| Candidate `POLICY_EDITED` | candidate exists; v2 not published; not analyzing | revision +1; analysis/approval/Impact clear | Original quick-action text retained on action failure; no event dispatched |
| Candidate `ANALYSIS_STARTED` | `canAnalyzeCandidate`; requested revision current | `candidate_editing → candidate_analyzing`; old analysis/approval/Impact clear | Invalid event rejected; UI disables edit/Reset while pending |
| Candidate `ANALYSIS_SUCCEEDED` | revision current; frozen `1.1.0`; exact 7 rules; no issues | new analysisId; `candidate_ready` | Revision-stale response returns identical state; controller also discards superseded same-revision response |
| Candidate `ANALYSIS_FAILED` | current request and candidate analyzing | safe error; `candidate_editing` | Stale/aborted/superseded failures are silent |
| `IMPACT_COMPUTED` | `canComputeImpact`; frozen exact computation bound to candidate revision/analysisId and `mfs-v1` | `candidate_ready → impact_ready` | No success display/event on expectation mismatch |
| `FINDING_SELECTED` | null or key in the current validated visible set | selection changes only | Invalid key changes only safe error |
| `APPROVE_CANDIDATE` | `canApproveCandidate`; current Impact | binds approval revision + analysisId; `candidate_approved` | No approval before current Impact |
| `CANDIDATE_RELEASE_CREATED` | `canPublishCandidate`; frozen exact v2 snapshot; current approval/Impact; no v2 | append once; `published` | Duplicate or mismatched release rejected |
| `RESET_SCENARIO` | not analyzing | exact ambiguous draft; Sample retained; releases/candidate/Impact/selection clear | Pending Reset remains disabled |

Minimal selector change:

- Before current Impact, visible evidence Findings remain the 18 baseline-release Findings.
- With current Impact, visible evidence Findings become the stable-key union of `impact.preview.removed` (baseline-side) and `impact.candidateFindings` (all 16 candidate-side Findings).
- Removed keys do not overlap candidate keys. Candidate `added` and `unchanged` evidence resolves to candidate-side Findings as required by the canonical Impact contract.
- The selector returns a new readonly, stable FindingKey-sorted array and never mutates frozen Impact/release data.
- `selectedFindingKey` remains the only open-drawer domain state. No local duplicate selected key is added.

Only `lib/state/demo-state.ts` requires this selector adjustment. `DemoState`, `DemoEvent`, and `demoReducer` require no changes.

## 10. Controller reuse

Use the existing single `PolicyAnalysisController` instance:

- `analyze("candidate")` maps only an eligible `candidate_editing` state to `{ policyText, targetVersion: "1.1.0" }`.
- A same-target/same-revision programmatic supersede reuses the exact request, aborts the older signal, increments the local sequence, and dispatches no second start event.
- Before completion dispatch, sequence, token identity, non-aborted signal, target, and requested revision must all remain current.
- Reset, mode change, and unmount call the existing idempotent `cancel()`.
- Baseline and candidate share one active slot; phase/selector guards prevent simultaneous eligible analysis targets.
- Sample executor remains local and network-free; no fetch adapter or Gate 3 behavior is introduced.
- Do not duplicate or modify controller production code.

Extend the existing controller test file to prove candidate same-revision supersession, stale candidate completion, signal abort, target `1.1.0`, cleanup/reuse, and no duplicate dispatch. Existing baseline cases remain unchanged.

## 11. Impact computation contract

Command inputs:

```text
baselineSpec = immutable mfs-v1.spec
candidateSpec = current candidate.analysis / version 1.1.0
records = the same scenario.records reference used for baseline
expectations = verified public fixture expectations
candidateRevision = current candidate.revision
candidateAnalysisId = current candidate.analysisId
```

Command sequence:

1. Recheck `canComputeImpact(state)` and select exactly one `mfs-v1`.
2. Call `verifyFixtureExpectations()` with the baseline spec, candidate spec, same records, and expectations. This must pass before any success event.
3. Call `computeImpact()` to obtain the deterministic preview.
4. Call `evaluatePolicy(candidateSpec, records)` to retain the exact candidate Finding set used for publication.
5. Require candidate Finding keys to equal `expectations.candidate_release.findings` exactly.
6. Create a copied/deep-frozen `ImpactComputation` through `createImpactComputation()` bound to `mfs-v1`, candidate revision, and candidate analysis ID.
7. Dispatch one exact `IMPACT_COMPUTED` event.

Exact Finding-set meaning:

```text
baselineCount = 18 = removed 3 + unchanged 15
candidateCount = 16 = added 1 + unchanged 15
removed = baseline-side Finding exists only in v1
added = candidate-side Finding exists only in v2
unchanged = same FindingKey exists in both; store candidate-side Finding
modified Finding category = nonexistent in P0
```

Exact affected records:

| Classification | Finding key | Amount/category | Meaning |
|---|---|---|---|
| Removed | `mfs-global-expense\|EXP-RCT-001\|MFS-EXP-004` | USD 105.00 meal, no receipt | No longer reaches the USD 150 receipt threshold |
| Removed | `mfs-global-expense\|EXP-RCT-001\|MFS-EXP-005` | USD 129.50 software, no receipt | No longer reaches the USD 150 receipt threshold |
| Removed | `mfs-global-expense\|EXP-RCT-001\|MFS-EXP-006` | USD 149.99 other, no receipt | Remains below the new USD 150 threshold |
| Added | `mfs-global-expense\|EXP-RID-001\|MFS-EXP-015` | USD 145.00 rideshare, not preapproved | New rideshare manager-review Finding |

Exact Rule Diff, independently computed from rules rather than Finding membership:

```text
EXP-RCT-001 modified
EXP-RID-001 added
```

Unchanged rules are omitted. `sourceQuote` or message-only changes do not create Rule Diff entries. Any total, key, order, or Rule Diff mismatch is a fatal command error for the demo result: show safe `Fixture verification failed`, dispatch no Impact, and never hard-code numbers to hide the mismatch.

## 12. Candidate publication contract

Approval occurs after current Impact is visible:

```text
impact_ready
→ APPROVE_CANDIDATE
→ candidate_approved with approvalRevision == candidate.revision
   and approvedAnalysisId == candidate.analysisId
```

Publication rechecks `canPublishCandidate(state)` and creates:

```text
releaseId: mfs-v2
displayVersion: v2
releaseVersion: 1.1.0
policyText: current candidate text
spec: current candidate analysis
findings: current ImpactComputation.candidateFindings (exact 16)
analysisMetadata: current candidate analysis metadata
status: published
approvedRevision: current candidate revision
approvedAnalysisId: current candidate analysisId
publishedAt: new ISO display timestamp
```

Use `createReleaseSnapshot()` before dispatching `CANDIDATE_RELEASE_CREATED`. Do not recompute or infer candidate Findings at publish time. The reducer verifies frozen ownership, exact fields, current approval/Impact bindings, Finding-key order, and absence of an existing `mfs-v2`.

Release history remains the single `state.releases` source of truth in append order:

| Order | Release | Version | Status | Findings |
|---:|---|---|---|---:|
| 1 | `mfs-v1` | v1 / 1.0.0 | Published, unchanged | 18 |
| 2 | `mfs-v2` | v2 / 1.1.0 | Published | 16 |

No new source-baseline field is invented in `ReleaseSnapshot`; the canonical relationship is held by `ImpactComputation.baselineReleaseId === "mfs-v1"` before publication and by ordered session history afterward. Published v1 remains the same frozen object. After `published`, editor and publication controls are unavailable; Reset is the only new-session path. Publication performs no remote or operational action.

## 13. Evidence Drawer contract

`EvidenceDrawer` is a Client presentation component controlled by canonical selection state.

Inputs:

- selected `Finding` derived from `state.selectedFindingKey` and the current visible validated Finding set;
- context label derived from membership: `Published v1 · removed`, `Candidate v2 · added`, `Candidate v2 · unchanged`, or `Published v1` before Impact;
- `onClose` callback dispatching `FINDING_SELECTED key: null`;
- ephemeral origin-element ref used only for focus restoration.

Displayed allowlist:

- Record ID (`expenseId`)
- Rule ID
- Outcome
- Policy source sentence
- Host-projected `observed` fields already limited to the matched condition
- Host-generated expected condition
- Host-generated message/reason
- Baseline/candidate classification context
- `Review candidate — not a compliance or fraud determination`

Do not pass or render the raw `ExpenseRecord`. Do not display employee email, business purpose, justification, request ID, provenance request ID, filesystem path, raw payload, stack, hash, or secret. Money and booleans use existing projected evidence strings.

Accessibility behavior:

- Trigger is a native `View evidence` button in `FindingTable`.
- Opening dispatches the selected FindingKey, records the trigger element in a ref, and moves focus to the drawer heading or first close control.
- Use `role="dialog"`, `aria-modal="true"`, a labeled heading, and a close button.
- Trap Tab/Shift+Tab within the drawer while open.
- Escape and backdrop activation close it; pointer events inside the panel do not close it.
- Background main content is removed from keyboard interaction while the modal is open using the platform-supported `inert` behavior or an equivalent narrowly scoped ref/effect; do not duplicate application state.
- Close restores focus to the exact trigger when still connected; otherwise focus the relevant Impact or results heading.
- At narrow width the drawer becomes a full-width sheet without page horizontal overflow.

Node Vitest cannot honestly validate DOM focus trapping or visual layout. Pure selection membership is covered in the workflow test; dialog semantics, focus cycle, Escape, backdrop, focus return, responsive sheet, and console behavior require manual Chrome acceptance.

## 14. UI flow and transitions

| Step | Input / owner / module | Event and phase | Rendered result | Error / invalid / stale behavior |
|---:|---|---|---|---|
| 1 | Existing workspace and v1 snapshot | `baseline_published` | v1/18 summary and `Preview a policy change` | CTA disabled if `canStartCandidate` false |
| 2 | Workspace selects v1 text | `START_CANDIDATE` → `candidate_editing` | Candidate editor contains exact published v1 text; v1 remains frozen | Mismatch produces safe transition error |
| 3 | Candidate editor / `createCandidateV2()` | success `POLICY_EDITED candidate`; revision 0→1 | Exact v2 candidate metadata/text, USD 150 receipt, rideshare sentence | Atomic failure preserves exact source text and shows safe error |
| 4 | Candidate editor / controller | `ANALYSIS_STARTED candidate` → `candidate_analyzing` | Polite Sample pending status; edit/actions/Reset disabled | Ineligible call rejected; no executor/event |
| 5 | Controller current success | `ANALYSIS_SUCCEEDED candidate` → `candidate_ready` | Seven rules, zero ambiguity, zero unsupported | Current safe failure returns to candidate editing; stale/aborted silent |
| 6 | Analysis panel | none | Candidate source sentences, conditions, outcomes; `Compute Impact` enabled by selector | No Impact control on invalid analysis |
| 7 | Workspace / runtime, guard, Impact Engine, factory | `IMPACT_COMPUTED` → `impact_ready` | 18→16; 3 removed/1 added/15 unchanged; two Rule Diff entries | Any runtime/fixture mismatch dispatches nothing and shows safe error |
| 8 | Impact Preview | none | Exact affected records and `New approval required for candidate v2` | Totals derive from Impact object, never constants |
| 9 | Finding table | `FINDING_SELECTED key` | Evidence Drawer opens in correct baseline/candidate context | Invalid or stale key rejected safely |
| 10 | Drawer close | `FINDING_SELECTED null` | Drawer closes and focus returns to trigger | Disconnected trigger falls back to section heading |
| 11 | Impact Preview | `APPROVE_CANDIDATE` → `candidate_approved` | Current approval shown; publish enabled | Approval unavailable before current Impact |
| 12 | Workspace / snapshot factory | `CANDIDATE_RELEASE_CREATED` → `published` | Immutable v2/16 appended | Binding, duplicate, or Finding mismatch blocks publication |
| 13 | Release History | none | v1 Published unchanged, then v2 Published | No rollback/revoke/edit action |
| 14 | Published state | none | Candidate editor/actions locked; session-only disclosure | No second v2 or hidden operational action |
| 15 | Reset | `RESET_SCENARIO` → `draft_editing` | Exact ambiguous draft, Sample retained, releases/candidate/Impact/selection clear | Disabled during analysis |
| 16 | Unsupported edit/retry | normal candidate edit/analyze/reset path | Safe Sample unsupported error and recoverable session | No fabricated or Live fallback result |

Canonical ordering is Impact first, approval second. The UI may describe the upcoming approval before Impact but must not dispatch `APPROVE_CANDIDATE` until phase `impact_ready`.

## 15. Component and module design

| Name / path | Responsibility and inputs | State / effects | Accessibility, error, responsive, tests |
|---|---|---|---|
| `GovernDiffWorkspace` — `components/govern-diff-workspace.tsx` | Orchestrate candidate start/action/analyze, Impact, selection, approval, publish, Reset; consume existing guards/factories/domain functions | Owns reducer, command error, controller, focus/origin refs only; no duplicate phase/Impact/release state | Cancels controller on Reset/unmount; focuses candidate/Impact/history headings; workflow/build/manual |
| `PolicyEditor` — existing | Add explicit baseline/candidate presentation props and optional atomic candidate-action callback | No state; callback-only | Candidate label/action, pending/read-only reasons, native textarea; manual |
| `AnalysisPanel` — existing | Render baseline or candidate analysis and expose phase-appropriate resolve/baseline/Impact action | No state; callback-only | Dynamic unique heading IDs, source/rule sections, disabled reasons; manual |
| `BaselineResults` — existing | Retain v1 summary, evidence callbacks, and guarded candidate-start CTA | No state | v1 remains visibly immutable; native buttons; workflow/manual |
| `FindingTable` — existing | Add optional evidence callback and context label while retaining stable input order | No state; passes trigger element/key upward | Caption, native table/button, local overflow; manual |
| `ImpactPreview` — new `components/impact-preview.tsx` | Render counts, exact meanings, Rule Diff, removed/added affected Findings, approval and publish controls | No local domain state | Text labels independent of color; composes `FindingTable`; workflow/manual |
| `EvidenceDrawer` — new `components/evidence-drawer.tsx` | Render one safe projected Finding and manage modal focus behavior | DOM refs/effect only; selection remains reducer-owned | Dialog label, trap, Escape, backdrop, inert background, focus return; manual |
| `ReleaseHistory` — new `components/release-history.tsx` | Render ordered immutable release snapshots | No state/effects | Native list/table semantics, session-only disclosure; workflow/manual |
| `StatusBanner` — existing | Include `candidate_analyzing` and candidate command failures | No state | Polite pending and safe alert unchanged; manual |
| `StepIndicator` — existing | Replace Gate 2C-deferred copy and preserve step-3 mapping | No state | `aria-current`, textual completed/current states; manual |
| `demo-state.ts` selector | Permit removed baseline evidence during current Impact via stable union | Pure derivation only | New workflow assertions; no state/event shape change |

Do not add a separate candidate reducer, command store, context provider, drawer selection hook, view-model cache, or controller. The Client island remains the only orchestration boundary; presentation components stay domain-effect-free.

## 16. Exact file allowlist

The next implementation instruction must copy this exact 14-path mutation allowlist.

### Files to add — 4

| Path | Purpose / exports / boundary / why existing files cannot cover it |
|---|---|
| `components/impact-preview.tsx` | Export `ImpactPreview` presentation component for summary, Rule Diff, affected records, approval/publish controls. This is a distinct canonical component and does not belong in baseline results or the orchestrator. Client-safe, callback-only, no side effects. |
| `components/evidence-drawer.tsx` | Export `EvidenceDrawer` for safe Finding evidence and modal focus lifecycle. Its dialog/focus responsibility is distinct and would overgrow `FindingTable`. Client-safe; DOM effects only. |
| `components/release-history.tsx` | Export `ReleaseHistory` for ordered immutable v1/v2 snapshots and session disclosure. History is a canonical independent view, not an Impact metric. Pure presentation. |
| `tests/state/gate-2c-workflow.test.ts` | Add the real network-free v1→candidate→Impact→approval→v2 workflow test. No existing test integrates controller, Sample analyzer, quick action, runtime, guard, factories, reducer, selection, and history end-to-end. Node-only. |

### Files to modify — 10

| Path | Exact purpose / imports / ownership / tests |
|---|---|
| `components/govern-diff-workspace.tsx` | Add Gate 2C command handlers and compose new/existing views. Import only browser-safe domain/demo/state modules. Continue owning reducer/controller/command error/focus refs; no network or server import. Covered by workflow, lint/typecheck/build, manual flow. |
| `components/step-indicator.tsx` | Replace deferred Gate 2C copy with active Impact/publish wording; keep existing phase mapping. Manual/build coverage. |
| `components/policy-editor.tsx` | Generalize labels/action props for candidate text and quick action without adding state. Manual/build coverage. |
| `components/analysis-panel.tsx` | Support candidate review and Compute Impact action while preserving baseline behavior. Manual/build coverage. |
| `components/baseline-results.tsx` | Replace Gate 2C handoff placeholder with guarded candidate-start and baseline evidence callbacks. Manual/workflow coverage. |
| `components/finding-table.tsx` | Add optional native View evidence action and contextual caption; retain stable input order and table-local overflow. Manual/build coverage. |
| `components/status-banner.tsx` | Treat `candidate_analyzing` as pending and render existing safe errors. Manual/build coverage. |
| `app/globals.css` | Add only Gate 2C Impact, history, drawer, focus, backdrop, inert, and responsive styles. No external asset/framework; manual viewport coverage. |
| `lib/state/demo-state.ts` | Expand current visible-Finding selector to include removed baseline plus candidate current Findings during current Impact. No type, phase, event, reducer, or guard API addition. Covered by Gate 2C workflow. |
| `tests/analysis/policy-analysis-controller.test.ts` | Retain all existing cases and add candidate same-revision, abort, stale, target separation, cleanup, and duplicate-dispatch proof. Production controller remains unchanged. |

### Files explicitly protected during implementation

```text
.git/**
.codex/**
AGENTS.md
docs/specs/**
docs/codex/SECURITY_BOUNDARY.md
docs/codex/GATE_2_PRODUCT_FLOW_AND_SAMPLE_MODE_PLAN.md
docs/codex/GATE_2A_IMPLEMENTATION_PLAN.md
docs/codex/GATE_2B_IMPLEMENTATION_PLAN.md
docs/codex/GATE_2C_IMPLEMENTATION_PLAN.md
docs/codex/HANDOFF.md
demo/**
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
next.config.ts
tsconfig.json
vitest.config.ts
eslint.config.mjs
app/page.tsx
app/layout.tsx
app/api/**
lib/analysis/**
lib/demo/**
lib/domain/**
lib/errors/**
lib/state/demo-events.ts
lib/state/demo-reducer.ts
all existing tests except tests/analysis/policy-analysis-controller.test.ts
.env*
```

`lib/analysis/**`, `lib/demo/**`, and `lib/domain/**` are consumed read-only. The exact modified controller test is the only exception under `tests/analysis/`.

### Files considered but not needed

- `components/candidate-workspace.tsx`: existing editor and analysis components can be context-generalized without duplicating structure.
- `components/rule-diff.tsx` or `components/affected-records.tsx`: each is single-use content owned cohesively by `ImpactPreview`.
- `lib/state/demo-selectors.ts`: selector ownership remains canonical in `demo-state.ts`.
- `lib/state/demo-commands.ts` or `lib/demo/candidate-commands.ts`: existing command sequence is small, and domain/guard/factory functions already isolate all testable business logic.
- `lib/analysis/policy-analysis-controller.ts`: candidate behavior is already implemented; only focused evidence is missing.
- `lib/state/demo-events.ts` / `lib/state/demo-reducer.ts`: exact canonical events and transitions already exist.
- `app/page.tsx`: the verified scenario already supplies Sample assets, records, and expectations required by the Client workspace.
- `app/api/analyze/route.ts`: Gate 3 only.
- DOM/E2E config or dependency files: manual Chrome acceptance covers the honest gap.

## 17. Protected paths

In addition to the exact allowlist, preserve these invariants:

- Do not alter the three Sample asset hashes or provenance.
- Do not alter policy v1/v2, public CSV, public expectations, or dataset SHA-256.
- Do not change the exact 13 phases, 12 events, rule registry, compiler, runtime, Impact algorithm, release shape, error codes, or fixture guard.
- Do not add direct `postcss`, a UI library, a modal library, an icon package, a state library, a test DOM, or an E2E framework.
- Do not inspect API-key values or add a successful Live path.
- Do not delete, move, rename, broadly rewrite, stage, commit, push, or update closure documents as part of implementation unless a later human instruction explicitly authorizes those exact actions.

Sample asset integrity baseline:

```text
sample-analysis-draft-v1.json  87E81A7B753F721CF4F177D83A3DFEF5FC38F117D2D6FFE897A24505D6F10B1F
sample-analysis-v1.json        BDED5EF8C5D1A4BA9A01B7DA993FD28CADFC4566F0EF04696B20DECA7F9BFC4B
sample-analysis-v2.json        354E75FC601A702A5CEFC227F546C707E521F4A18CCC90F3951D9223F6B11D32
```

## 18. Test strategy

### New Gate 2C workflow test

Use the real loader, Sample analyzer, controller, reducer, candidate quick action, runtime, Impact Engine, fixture guard, factories, and selectors. Prove:

1. Build the existing Gate 2B baseline and reach one immutable `mfs-v1` / 18 Findings.
2. `canStartCandidate` is true only at the exact handoff.
3. `START_CANDIDATE.text` equals published v1 text; candidate revision is 0; v1 remains unchanged.
4. `createCandidateV2()` returns exact canonical v2; one `POLICY_EDITED` increments revision once and clears derived state.
5. Candidate analysis targets `1.1.0`, returns exact seven rules, and reaches `candidate_ready`.
6. Receipt predicates change USD 100 → USD 150; rideshare rule is added with exact `> USD 120` and preapproval condition.
7. Fixture guard and runtime prove candidate 16 exact Finding keys.
8. Impact proves 18/16 and removed 3 / added 1 / unchanged 15, with exact affected keys and stable order.
9. Rule Diff is exactly receipt modified then rideshare added; unchanged rules are absent.
10. `createImpactComputation()` copies/freezes its inputs and binds revision/analysis ID/`mfs-v1`.
11. Removed, added, unchanged, and baseline Finding selection succeeds only for visible exact keys; invalid selection is rejected.
12. Approval is unavailable before Impact, then binds current revision + analysis ID.
13. Candidate edit/re-analysis clears approval, Impact, and invalid selection; stale Impact cannot publish.
14. `mfs-v2` uses exact 16 `impact.candidateFindings`, is deeply frozen, and appends after the same immutable v1 object.
15. Duplicate candidate publication is rejected and release order remains v1 → v2.
16. Reset restores exact ambiguous draft and clears candidate, Impact, selection, and both releases while retaining Sample mode.
17. Unsupported one-character candidate text fails safely; Reset recovers.
18. Scenario records/specs/releases and source inputs remain byte-for-byte unmutated.

### Controller focused extension

Use deferred Promises without wall-clock sleeps. Retain existing tests and add candidate-specific proof:

- exact target `1.1.0` request;
- latest same-revision candidate request wins;
- first candidate signal is aborted;
- superseded candidate success/failure are silent;
- candidate revision change makes completion silent;
- baseline/candidate target separation cannot leak an old result;
- cancel/reset/unmount equivalent cleanup remains idempotent and reusable;
- no duplicate success/failure dispatch.

### Existing regression

- Existing 111 tests all remain and pass; report the actual new total, never a predicted total.
- Existing reducer, Impact, quick-action, runtime, compiler, fixture, Sample analyzer, and Gate 2B workflow tests remain unchanged and green.
- Sample asset hashes and exact event/phase lists remain unchanged.
- Static boundary scan confirms no React/Next/Node/OpenAI/network dependency enters domain/controller paths and no server loader enters Client components.

### UI/manual gap

Current Vitest is Node-only and has no React DOM renderer. Do not add one. Lint, typecheck, build, pure workflow tests, and manual current-Chrome acceptance jointly cover rendered semantics. Manual-only claims must not be reported as automated.

## 19. Manual acceptance flow

Duration: 5–8 minutes. Sample only, localhost only, no key.

```text
pnpm dev
http://localhost:3000
```

Use the Next.js-reported loopback port if 3000 is occupied. Stop the server after acceptance.

| Action | Expected result |
|---|---|
| Open `/` | Existing fictional notice, Sample label, 48-record scenario, exact ambiguous draft |
| Complete baseline | Five rules/one blocking ambiguity → USD 275 resolution → six rules → immutable v1/18 Findings |
| Open baseline evidence | Drawer shows safe projected evidence; Escape closes and focus returns |
| Start candidate | Candidate editor contains exact published v1 text; v1 stays unchanged |
| Apply candidate changes | Metadata becomes v2/1.1.0/proposed date, receipt becomes USD 150, rideshare sentence added once |
| Analyze candidate | Pending is announced; seven rules, zero ambiguities, zero unsupported statements |
| Compute Impact | `18 → 16`, `3 removed`, `1 added`, `15 unchanged (same key under both versions)` |
| Inspect Rule Diff | Receipt `EXP-RCT-001` modified; rideshare `EXP-RID-001` added; no unchanged entries |
| Inspect affected records | Removed MFS-EXP-004/005/006 at USD 105.00/129.50/149.99; added MFS-EXP-015 rideshare USD 145.00 |
| Open each evidence class | Removed uses published-v1 Finding; added/unchanged use candidate-side Finding; safe field allowlist only |
| Keyboard drawer check | Trigger focus → drawer; Tab/Shift+Tab trapped; Escape/backdrop close; trigger focus restored |
| Review approval state | `New approval required for candidate v2`; Publish disabled before approval |
| Approve candidate | Approval becomes current and Publish enables |
| Publish candidate | v2/1.1.0/16 Findings appended once; v1/1.0.0/18 remains unchanged |
| Try post-publish actions | No edit, second publish, rollback, revoke, or operational action control |
| Reset | Exact initial draft, Sample retained, empty releases/candidate/Impact/selection |
| Unsupported candidate edit | Safe Sample unsupported alert; Reset/retry recovers |

Also verify:

- keyboard-only primary flow and visible focus;
- `aria-live` pending and `role=alert` error announcements;
- one `h1`, ordered headings, native controls/table/dialog;
- 1440×900 and approximately 768px without page horizontal scroll or overlap;
- table-local overflow and narrow full-width drawer;
- no console hydration error, uncaught exception, unhandled rejection, or React warning;
- DevTools network shows localhost Next.js document/assets/HMR only, no application API/OpenAI/external request;
- three consecutive deterministic full Sample flows before recording.

Suggested capture points:

1. candidate seven-rule review showing USD 150 and rideshare;
2. Impact summary plus Rule Diff and affected records;
3. Evidence Drawer for one removed and one added Finding;
4. published v1→v2 release history.

Screenshots/video belong outside the repository unless a later submission task explicitly authorizes exact asset paths.

## 20. Accessibility and responsive baseline

- Preserve one page `h1`; Step 3 uses ordered `h2`/`h3` structure.
- Move focus to the candidate heading after `START_CANDIDATE`, Impact heading after `IMPACT_COMPUTED`, and release-history heading after publish.
- Do not move focus for typing, silent stale completion, or rejected commands.
- Pending status is polite; actionable errors are alerts; approval/category/current state is expressed in text, not color alone.
- Buttons use adjacent disabled reasons for Apply, Analyze, Compute Impact, Approve, Publish, and Reset.
- Candidate textarea is disabled while analyzing and after publish.
- Impact cards and Rule Diff remain readable at 1440×900 and collapse to one column near 768px.
- Tables keep labeled local horizontal overflow; the page itself must not scroll horizontally.
- Drawer implements modal focus lifecycle, Escape, backdrop, focus return, and full-width narrow behavior.
- Respect the existing visible focus ring and `prefers-reduced-motion`; add no nonessential animation.

## 21. Error and recovery behavior

| Failure | State/display | Recovery |
|---|---|---|
| Candidate start mismatch | v1/candidate/releases unchanged; safe transition alert | Re-evaluate guard or Reset |
| Candidate quick-action anchor/hash mismatch | Exact source text/revision unchanged; safe local alert | Reset or restore canonical v1 candidate text |
| Unsupported candidate text | `candidate_editing`, no analysis/Impact; safe Sample alert | Correct/Reset and retry |
| Current candidate analyzer failure | Old analysis remains cleared; `candidate_editing`; safe retryable alert | Retry or Reset |
| Stale/aborted/superseded response | No event/banner/focus movement | Latest request continues |
| Runtime/fixture/Impact mismatch | No `IMPACT_COMPUTED`; candidate remains `candidate_ready`; safe non-success alert | Reset; developer investigates protected fixture/contract |
| Approval attempted before Impact | Domain preserved; safe transition alert | Compute current Impact first |
| Candidate edited/re-analyzed after Impact | Approval and Impact cleared; candidate editing/analyzing path | Recompute Impact and re-approve |
| Invalid evidence key | Domain data preserved; safe transition alert | Select a currently visible validated Finding |
| Publish binding/Finding mismatch | No v2 release; v1 preserved; safe local/transition alert | Recompute/re-approve or Reset |
| Duplicate v2 publish | Existing v1/v2 preserved; safe transition alert | No retry; Reset for a new session |
| Drawer trigger removed before close | Drawer closes; fallback heading receives focus | Continue from current valid phase |

Never render raw errors, stack traces, request IDs, hashes, paths, payloads, emails, or secret values. Command errors clear on accepted edit/analyze/action/Reset under existing behavior.

## 22. Validation commands

Run after implementation, without install or network:

```text
pnpm test -- tests/state/gate-2c-workflow.test.ts
pnpm test -- tests/analysis/policy-analysis-controller.test.ts
pnpm test -- tests/state/demo-reducer.test.ts tests/impact.test.ts tests/demo/quick-actions.test.ts tests/state/gate-2b-workflow.test.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
git diff --check
git diff -- <exact 14 Gate 2C paths>
git status --short
git diff --cached --name-only
```

Requirements:

- Existing 111 tests remain; report actual focused/full file and test counts.
- No test/config/dependency change outside the exact allowlist.
- Sample asset hashes, policy assets, fixture expectations, event list, phase list, and protected paths remain unchanged.
- Index remains empty; no stage/commit/push during implementation unless separately authorized.
- Perform the Section 19 localhost manual flow only after automated validation passes.

## 23. Acceptance criteria

1. Gate 2B handoff is accepted only with exactly one immutable `mfs-v1` / 18 Findings.
2. Candidate starts only from exact published v1 text and does not mutate v1.
3. Atomic candidate action produces the exact normalized v2 hash and one revision increment.
4. Candidate target is `1.1.0`, with seven exact rules, zero ambiguity, and zero unsupported statements.
5. Receipt changes from USD 100 to USD 150 under stable `EXP-RCT-001`.
6. `EXP-RID-001` is added for rideshare > USD 120 without preapproval.
7. Candidate runtime produces 16 exact stable Finding keys over the same 48 records.
8. Impact is exactly removed 3 / added 1 / unchanged 15, with the canonical Finding-set meanings.
9. Removed keys are MFS-EXP-004/005/006 receipt Findings; added key is MFS-EXP-015 rideshare Finding.
10. Rule Diff is exactly receipt modified then rideshare added; unchanged rules are omitted.
11. No modified Finding classification is introduced.
12. Impact payload is deeply frozen and bound to candidate revision, analysis ID, and `mfs-v1`.
13. Candidate edit/re-analysis invalidates stale approval, Impact, and inappropriate selection.
14. Evidence selection supports removed baseline and current candidate Findings without duplicate selected-key state.
15. Drawer renders only safe host-projected evidence and passes manual modal/focus behavior.
16. Candidate approval is impossible before current Impact and binds current revision + analysis ID.
17. Publish is impossible without current approval and current Impact.
18. `mfs-v2` is immutable, contains the exact 16 Impact candidate Findings, and appends once.
19. Release history preserves the original immutable v1 before v2.
20. Published state provides no edit, duplicate publish, rollback, revoke, or external action.
21. Reset restores exact ambiguous draft and clears the complete session while retaining Sample mode.
22. Controller candidate sequencing/abort/stale/duplicate tests pass with production controller unchanged.
23. Existing 111 tests and Gate 2B baseline flow remain green.
24. Lint, typecheck, full tests, production build, `pnpm check`, and diff check pass.
25. Manual keyboard/focus/drawer/responsive/console/network flow passes three deterministic runs.
26. Only the exact 14 implementation paths change.
27. No dependency, config, lockfile, fixture, Sample asset, Gate 3 path, API, secret, external network, or Git mutation occurs.

## 24. Implementation sequence

1. Confirm clean `4ae3213...`, root/sandbox, exact allowlist, asset hashes, and empty index.
2. Add the Gate 2C workflow test skeleton against existing contracts.
3. Add candidate-specific controller cases; keep controller source unchanged.
4. Adjust only the visible-Finding selector and prove removed/candidate selection.
5. Add `ImpactPreview`, `EvidenceDrawer`, and `ReleaseHistory` presentation components.
6. Generalize editor, analysis panel, baseline results, Finding table, status banner, and Step 3 copy.
7. Extend `GovernDiffWorkspace` command orchestration and focus/origin refs.
8. Add minimal plain CSS for Impact/history/drawer/responsive behavior.
9. Run focused tests, then lint/typecheck/full tests/build/`pnpm check`.
10. Strictly review the exact 14-path diff, security boundary, frozen assets, and Gate 3 exclusion.
11. Run the 5–8 minute localhost manual flow at 1440×900 and approximately 768px.
12. Report and stop without docs closeout, stage, commit, push, or Gate 3.

One mutation is sufficient. Do not split state events, controller, domain, UI, and tests into separate partial contracts.

## 25. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Prompt order accidentally approves before Impact | Encode canonical phase order in handlers, labels, workflow test, and manual acceptance. |
| `3/1/15` mislabeled as rules or records | Render explicit FindingKey definitions and keep Rule Diff in a separate section. |
| Removed evidence cannot be selected | Minimal visible-Finding selector union; workflow proof; no duplicate state. |
| Candidate Findings recomputed differently at publish | Publish only frozen `ImpactComputation.candidateFindings`. |
| v1 mutated or replaced | Start from text value only; keep frozen snapshot; append v2; test object identity/history. |
| Approval survives edit/re-analysis | Existing reducer clears approval/Impact; workflow asserts current binding. |
| Same-revision stale candidate result wins | Reuse controller sequence/token/abort checks; extend focused tests. |
| Drawer leaks raw record/private fields | Accept only `Finding` and context, never raw `ExpenseRecord`; explicit field allowlist. |
| Drawer focus/modal behavior regresses without DOM tests | Native semantics, small focused component, strict manual keyboard checklist. |
| Workspace becomes a second domain engine | Keep calculations in existing runtime/Impact/guard/factories and presentation in components. |
| Fixture mismatch hidden by UI constants | Guard before dispatch; derive display counts from frozen Impact; fail closed. |
| Scope expands into Live/API or dependencies | Exact 14-path allowlist and protected paths exclude Gate 3/config/packages. |

## 26. P0 / P1 / deferred

**P0 — required for the complete Sample demo**

- Candidate start/editor/atomic canonical transformation.
- Candidate `1.1.0` Sample analysis and seven-rule review.
- Deterministic candidate runtime and exact Impact 18→16 / 3 removed / 1 added / 15 unchanged.
- Canonical Rule Diff and exact affected records.
- Evidence Drawer with safe fields, focus trap, Escape, backdrop, and focus return.
- Current candidate approval and guarded immutable v2 publication.
- Immutable v1→v2 release history and session-only disclosure.
- Reset/error/retry/pending/stale behavior.
- Accessibility/responsive baseline, focused/full tests, and manual three-run Sample flow.

**P1 — only if P0 is accepted and time remains**

- Minor spacing/microcopy polish within existing components.
- Nonessential visual emphasis or reduced-motion-safe transition.
- Optional usability review.
- Favicon correction under a separate exact-path task.

**Deferred — Gate 3 or post-submission**

- Live GPT-5.6 route/adapter/key availability and authorized Live smoke.
- CSV upload, persistence, auth, analytics, export, deployment, extra scenarios, arbitrary policies, mobile polish, rollback/revoke, and submission assets.
- Automated browser/E2E dependency and broader design-system work.

## 27. Gate 3 handoff boundary

Gate 2C completes Gate 2 Sample Mode and hands off:

```text
mode: sample
phase after full flow: published
releases[0]: immutable mfs-v1 / v1 / 1.0.0 / 18 Findings
releases[1]: immutable mfs-v2 / v2 / 1.1.0 / 16 Findings
Impact: current 3 removed / 1 added / 15 unchanged
candidate: current seven-rule analysis, current approval
external actions: none
API routes: none
```

Gate 3 may add a server-only Live GPT-5.6 route and client fetch executor behind the existing analyzer/controller/event contracts. Gate 3 must not alter Sample assets, deterministic runtime/Impact semantics, release history, canonical totals, or the honest Sample label. Gate 2C does not pre-create Gate 3 files or inspect an API key.

## 28. Open questions

**Blocking:** none.

Resolved planning decisions:

- Impact precedes candidate approval under the canonical state machine.
- Finding classification has no `modified`; Rule Diff does.
- Removed evidence requires the documented minimal selector change, not duplicate drawer state.
- Existing controller production code is reusable unchanged.
- Existing editor/analysis/table components are narrowly generalized; no separate candidate component is needed.
- Drawer DOM behavior remains a manual acceptance responsibility because dependency-free Node Vitest has no DOM infrastructure.

Non-blocking implementation discretion is limited to exact spacing, concise secondary copy, and whether the modal background uses native `inert` directly or an equivalent narrowly scoped ref/effect. These choices must preserve the contract, allowlist, accessibility, and no-dependency boundary.

The existing development-only `favicon.ico` 404 remains non-blocking and outside this allowlist.

## 29. Final readiness verdict

`VALIDATED`

All Gate 2C domain assets, exact state transitions, analyzer variant, runtime, Impact Engine, fixture expectations, immutable factories, and release guards remain intact. The exact 14-path implementation in Section 16 satisfies the acceptance criteria in Section 23 and has passed strict review, automated validation, and localhost manual acceptance. Gate 2C remains dependency-free, Sample-only, and network-free. Gate 3 planning is the next task.

## 30. Closure evidence

**Implementation baseline HEAD:** `4ae321324cf5d53d09641497760e06776a2eb7c3`

The exact Gate 2C implementation/test path set is:

```text
app/globals.css
components/govern-diff-workspace.tsx
components/step-indicator.tsx
components/policy-editor.tsx
components/analysis-panel.tsx
components/baseline-results.tsx
components/finding-table.tsx
components/status-banner.tsx
components/impact-preview.tsx
components/evidence-drawer.tsx
components/release-history.tsx
lib/state/demo-state.ts
tests/analysis/policy-analysis-controller.test.ts
tests/state/gate-2c-workflow.test.ts
```

Closure verification established:

- The complete candidate progression starts from the exact immutable `mfs-v1` text, applies the atomic canonical v2 transformation, and analyzes the exact `1.1.0` seven-rule candidate with zero ambiguities and zero unsupported statements.
- Deterministic runtime and Impact produce Findings `18 → 16`, with exactly 3 removed, 1 added, and 15 unchanged FindingKeys.
- Rule Diff contains exactly `EXP-RCT-001 modified` and `EXP-RID-001 added`; affected records are removed `MFS-EXP-004/005/006` and added `MFS-EXP-015`.
- Evidence Drawer receives only validated Finding projections and passed dialog semantics, focus trap, Escape/backdrop close, focus return, inert-background, keyboard, and responsive checks.
- Approval is bound to the current candidate revision and analysis ID. Immutable `mfs-v2` publication uses the current frozen Impact candidate Findings and retains the same immutable `mfs-v1` in ordered v1 → v2 session history.
- Focused Gate 2C workflow and controller suites passed. Final validation passed lint, typecheck, 14 Vitest files / 119 tests, production build, `pnpm check`, and `git diff --check`.
- Localhost manual acceptance passed three consecutive deterministic complete flows plus one earlier smoke flow, for four successful complete flows total.
- Manual acceptance passed at 1440px and approximately 768px, including keyboard-only flow, Drawer behavior, no page horizontal overflow, no console error/warning, and localhost Next.js/HMR-only network behavior.
- The implementation is Sample-only. It used no external network, application API, dependency change, package installation, secret, or API key.
- The development-only favicon observation remains deferred and non-blocking.
- Before this closeout task, no Gate 2C path was staged or committed and no push occurred. Exact staging and the single closure commit are performed only after this evidence is recorded and revalidated.
- Gate 3 implementation planning is next; Gate 3 is not started.
