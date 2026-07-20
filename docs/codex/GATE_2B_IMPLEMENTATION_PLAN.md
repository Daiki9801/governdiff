# Gate 2B — Policy, Review, and Baseline UI Implementation Plan

## 1. Status and decision

**Planning status:** COMPLETE

**Implementation status:** COMPLETE

**Closure status:** VALIDATED

**Planning baseline:** `171691e567647086d9e8752bc10305f2ef514923`

**Implementation baseline HEAD:** `171691e567647086d9e8752bc10305f2ef514923`

**Final implementation verdict:** `PASS`

Gate 2B can be completed in one reviewable Codex mutation without dependency, configuration, lockfile, network, API, or canonical-contract changes. This slice ends at an immutable published baseline v1 with 18 Findings. Candidate start, Impact, evidence, candidate approval, and candidate publication remain Gate 2C.

## Closure evidence

Gate 2B completed the exact 15-path implementation allowlist from Section 11:

```text
app/globals.css
app/layout.tsx
app/page.tsx
components/govern-diff-workspace.tsx
components/step-indicator.tsx
components/mode-selector.tsx
components/policy-editor.tsx
components/analysis-panel.tsx
components/rule-list.tsx
components/baseline-results.tsx
components/finding-table.tsx
components/status-banner.tsx
lib/analysis/policy-analysis-controller.ts
tests/analysis/policy-analysis-controller.test.ts
tests/state/gate-2b-workflow.test.ts
```

The completed browser-safe controller owns monotonic request sequencing, same-revision supersession, `AbortController` lifecycle, revision checks, and silent stale/aborted/duplicate completion discard. The credential-free Sample workflow now runs from the exact ambiguous draft through the five-rule blocking review, atomic USD 275.00 resolution, six-rule resolved analysis, and one immutable `mfs-v1` with 18 exact Findings. Candidate start, Impact, evidence, candidate approval/publication, and Live GPT-5.6 remain outside Gate 2B.

Validation and acceptance evidence:

- Focused controller tests: 1 file / 12 tests PASS.
- Focused network-free workflow tests: 1 file / 2 tests PASS.
- Full Vitest run: 13 files / 111 tests PASS; the existing 97 tests remain unchanged and green.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm check`, and `git diff --check`: PASS.
- Human localhost manual acceptance: PASS for the initial Sample workspace, five-rule blocking ambiguity, USD 275.00 resolution, six-rule clear analysis, immutable v1/18 Findings/48 records, Reset, safe unsupported input, keyboard flow, and approximately 768px responsive behavior.
- Console acceptance: no hydration error, uncaught exception, unhandled rejection, or React runtime warning.
- Network acceptance: localhost Next.js document/assets and HMR only; no OpenAI, application API, external API, font, image, or script request.
- Non-blocking observation: localhost `favicon.ico` returned 404 in development; favicon work is deferred.
- No dependency, configuration, lockfile, Sample asset, API, secret, package-install, or external-network change occurred.
- Before this closeout task, no Gate 2B staging, commit, or push had occurred. Gate 2C implementation planning is next after the closure commit.

## 2. Authority and baseline

Authority order:

1. Current direct human instruction
2. `AGENTS.md`
3. `docs/codex/SECURITY_BOUNDARY.md`
4. `docs/specs/GOVERNDIFF_REQUIREMENTS_DEFINITION_v1_2_2.md`
5. `docs/specs/GOVERNDIFF_BASIC_DESIGN_v1_0_0.md`
6. `docs/codex/GATE_2_PRODUCT_FLOW_AND_SAMPLE_MODE_PLAN.md`
7. `docs/codex/GATE_2A_IMPLEMENTATION_PLAN.md`
8. `docs/codex/HANDOFF.md`
9. Commit `171691e567647086d9e8752bc10305f2ef514923`
10. Current implementation and tests

Verified baseline:

```text
repository: <repository-root>
branch: master
HEAD: 171691e567647086d9e8752bc10305f2ef514923
subject: feat: complete Gate 2A network-free integration
working tree: clean
index: empty
untracked: none
basic design SHA-256: 6CC55AAA6C53437F2294D85AF48AC70AB5194B94CE68C7EDE699E2C0C9382B13
```

Differences and resolutions:

- Basic Design Phase 2 describes the complete Sample product; the reviewed Gate 2 plan divides delivery into Gate 2B baseline UI and Gate 2C Impact/publish UI. This schedules, but does not remove, canonical P0. The explicit Gate 2B/2C slice boundary controls this plan.
- Basic Design can default to Live when a key exists. Gate 2B is expressly network-free and must not inspect `OPENAI_API_KEY`; it passes `liveModeAvailable: false`, defaults to Sample, and leaves Live availability/adapter work to Gate 3.
- Some existing closure prose still describes the pre-commit checkpoint. The current instruction and verified Git facts establish that Gate 2A is committed and complete. Gate 2B does not edit existing documents.
- The repository's actual typecheck is `next typegen && tsc --noEmit`; it supersedes older illustrative script text in Basic Design.

## 3. Gate 2B objective

Deliver this credential-free flow:

```text
verified server fixture
→ Sample draft editor
→ precomputed draft analysis
→ visible blocking lodging ambiguity
→ atomic USD 275.00 resolution
→ resolved v1 re-analysis
→ six-rule review
→ approve baseline and run deterministic runtime
→ immutable mfs-v1 release with 18 Findings
→ explicit Gate 2C handoff
```

The UI must remain honest about Sample provenance, deterministic behavior, synthetic data, session-only state, disabled Live availability, and unfinished Gate 2C scope.

## 4. In scope

- Dynamic App Router page loading and validating `DemoScenario` on the server.
- Client workspace using the existing `demoReducer` and `createInitialDemoState`.
- Persistent `Sample Mode — precomputed policy analysis` label; disabled Live option and reason.
- Canonical product copy, fictional notice, dataset summary, scope limitation, and three-step indicator.
- Editable baseline policy until v1 publication.
- Draft and resolved v1 Sample analysis through `SamplePolicyAnalyzer`.
- Separate rules, blocking ambiguities, unsupported statements, source sentences, conditions, and outcomes.
- Atomic lodging resolution, re-analysis, loading, safe error, retry, disabled reasons, and reset.
- Controller-owned same-revision sequencing and `AbortController` lifecycle.
- Baseline evaluation, exact Finding-key guard, immutable release creation, and `BASELINE_RELEASE_CREATED`.
- Baseline summary and stable 18-Finding table without an evidence drawer.
- P0 keyboard, focus, status semantics, and desktop/narrow responsive baseline.
- Pure controller/workflow tests using current Node Vitest.

## 5. Out of scope

- Candidate start UI, candidate quick action/editor/analysis, Impact, affected-record comparison, Rule Diff UI, candidate approval/publication, or v2 history.
- Evidence drawer, focus trap, Finding selection UI, or `FINDING_SELECTED` wiring; Gate 2C owns them.
- Live GPT-5.6, `POST /api/analyze`, key detection/input, OpenAI calls, or automatic Sample fallback.
- CSV upload, arbitrary Sample policies, persistence, database, auth, deployment, telemetry, or external action.
- New dependencies, DOM/E2E frameworks, component libraries, Tailwind setup, animation frameworks, or design-system replacement.
- Gate 2A state/event/reducer/selector changes, Sample asset changes, canonical/config/package/lockfile changes.
- Stage, commit, push, remote operations, Gate 2C implementation, or Gate 3 implementation.

## 6. Existing architecture assessment

- `app/page.tsx` is a static placeholder; no fixture, state, or interaction exists.
- `app/layout.tsx` has correct language/title but a scaffold description.
- `app/globals.css` is a minimal plain-CSS scaffold. No component/design system exists.
- `components/**`, client controller modules, and UI/controller tests do not exist.
- The stack is Next.js 16 App Router, React 19.2, strict TypeScript, ESLint, and Vitest.
- Vitest is Node-only and includes `tests/**/*.test.ts`; there is no jsdom, happy-dom, React Testing Library, test renderer, Playwright, or browser E2E.
- Existing 11 files / 97 tests cover Gate 1 and Gate 2A.
- No new dependency is needed: React, Web Crypto, existing domain code, and plain CSS are sufficient.

Next.js boundary:

- `app/page.tsx` stays a Server Component, exports `dynamic = "force-dynamic"`, calls `loadDemoScenario(process.cwd(), false)`, and passes verified plain data to the client.
- `GovernDiffWorkspace` is the narrow client island. No Node module crosses it.
- Fixture failure is caught by the page and shown as a safe `role="alert"`; the workspace is not mounted.
- Gate 2B adds no Server Action, Route Handler, cache, client fetch, or external font/asset.

## 7. Gate 2A contracts consumed

Consumed unchanged:

- `DemoScenario`: normalized texts, deserialized Sample assets, records, expectations, dataset hash, and Live capability.
- `SamplePolicyAnalyzer`: exact version/text hash and analyzer-owned browser copy/deep-freeze.
- `resolveLodgingThreshold`: exact-anchor, atomic, hash-checked baseline edit.
- `demoReducer`: exact 13 phases and exact 12 events.
- `createInitialDemoState`, `createReleaseSnapshot`, and selectors/guards from `demo-state.ts`.
- `evaluatePolicy` and safe `AppError` helpers.

Ownership:

- UI never mutates scenario, state, records, specs, findings, or releases.
- Reducer owns all domain state; existing selectors own command eligibility.
- Workspace may own only focus refs and an ephemeral safe quick-action/runtime command error. It must not duplicate phase, pending, policy, analysis, approval, Impact, or releases.
- Sample metadata stays `mode: sample / model: null / requestId: null`; capture provenance is not runtime metadata.

## 8. Controller and concurrency contract

Add browser-safe, React-independent `lib/analysis/policy-analysis-controller.ts`.

Proposed surface:

```ts
type AnalysisTarget = "baseline" | "candidate";
type AnalysisRequestSequence = number;
type AnalysisRunOutcome = "started" | "superseded" | "rejected";
type AnalyzeExecutor = (
  request: AnalyzePolicyRequest,
  signal: AbortSignal,
) => Promise<AnalyzePolicyResult>;

interface PolicyAnalysisControllerDependencies {
  readonly getState: () => DemoState;
  readonly dispatch: (event: DemoEvent) => void;
  readonly execute: AnalyzeExecutor;
}

class PolicyAnalysisController {
  analyze(target: AnalysisTarget): Promise<AnalysisRunOutcome>;
  cancel(): void;
}
```

Names may be refined for TypeScript clarity, but behavior is fixed. Sequence is an in-memory monotonic integer, not a model request ID, and is never added to `DemoEvent`, `DemoState`, UI, or provenance.

Start algorithm:

1. Snapshot text, revision, and target version from current state: draft baseline → `draft-v1`; resolved baseline → `1.0.0`; future valid candidate → `1.1.0`.
2. For an eligible editing phase, increment sequence, abort/invalidate any old token, create one `AbortController`, dispatch exact `ANALYSIS_STARTED`, then call `execute(request, signal)`.
3. A programmatic second request for the same target/revision while its token is active supersedes it: abort old, issue a new sequence/controller, reuse the captured target-version contract, and do not dispatch a second start event into an analyzing reducer phase.
4. Other ineligible calls return `rejected` with no analyzer invocation/event. UI also disables Analyze while pending.

Before any completion dispatch, require:

```text
captured sequence == latest sequence
active token identity == captured token
signal.aborted == false
current target revision == requestedRevision
```

- Current success dispatches exact `ANALYSIS_SUCCEEDED`.
- Current `AppError` dispatches exact `ANALYSIS_FAILED`; unknown failure becomes safe `UNKNOWN_ERROR`.
- Aborted, superseded, stale-revision, or consumed completion dispatches nothing and shows no banner.
- Clear the active slot only when the completing token still owns it. Duplicate completion cannot dispatch twice.
- Reducer revision/phase checks remain the second defense.

Abort lifecycle:

- One controller per accepted execution; newer execution aborts the old one first.
- `cancel()` increments/invalidate sequence, aborts once, clears active state, is idempotent, and leaves the coordinator reusable.
- Workspace stores coordinator in `useRef<...>(null)`, keeps a latest-state ref, and calls `cancel()` in `useEffect` cleanup.
- React Strict Mode cleanup is safe: no permanent disposed flag; remount creates a fresh instance.
- Accepted Reset/mode/scenario replacement calls `cancel()` before transition. Controls remain disabled during analysis, so cancellation never strands an analyzing reducer state.
- Sample executor receives the signal as a local discard boundary but need not pass it into `SamplePolicyAnalyzer`. Gate 3 may supply a fetch executor consuming the same signal without reducer changes.

Controller tests must prove: latest same-revision wins; first signal aborts; superseded success/failure are silent; revision change is silent; current success/failure payloads are exact; reset/unmount cleanup is idempotent; duplicate/late completion cannot dispatch twice.

## 9. UI flow and state transitions

| Step | Input / owner | Event | Transition | Render / failure |
|---:|---|---|---|---|
| 1 | `/` → server loader | none | none | Verified scenario; safe fixture alert prevents mount on failure |
| 2 | Workspace initialization | none | `draft_editing` | Draft, Sample label, dataset summary |
| 3 | Mode display | none normally | Sample retained | Live visible but disabled; never claims Live |
| 4 | Textarea edit | `POLICY_EDITED baseline` | revision + 1; derived state cleared | Edited draft; unsupported text is not analyzed as success |
| 5 | Analyze/controller | `ANALYSIS_STARTED` | `draft_analyzing` or `baseline_analyzing` | Polite pending status; controls disabled |
| 6 | Current success | `ANALYSIS_SUCCEEDED` | draft → `draft_blocked`; resolved → `baseline_ready` | Review sections; stale/aborted is silent |
| 7 | Current failure | `ANALYSIS_FAILED` | matching editing phase | Safe alert and Retry |
| 8 | Resolve quick action | success: `POLICY_EDITED baseline` | `baseline_editing` | Exact USD 275 text, re-analysis required; atomic failure preserves text |
| 9 | Re-analyze | canonical analysis events | `baseline_analyzing` → `baseline_ready` | Six rules, zero blocking issues |
| 10 | Approve & run | `BASELINE_RELEASE_CREATED` | `baseline_published` | Immutable v1, 18 Findings; no release event on runtime mismatch |
| 11 | Reset | `RESET_SCENARIO` after controller cancel | `draft_editing` | Exact draft, releases cleared, Sample retained |
| 12 | Candidate boundary | none | remains `baseline_published` | Step 3 marked next/deferred; no `START_CANDIDATE` |

Baseline command:

- Recheck `canCreateBaselineRelease`.
- Evaluate current baseline spec over `scenario.records`.
- Require exactly the expected 18 stable keys from `scenario.expectations.baseline_release`.
- Use `createReleaseSnapshot` with `mfs-v1`, v1/1.0.0, current text/spec/metadata/revision/analysis ID, Findings, and ISO timestamp.
- Dispatch only the frozen snapshot; reducer rechecks all release guards.

## 10. Component and module design

| Name / path | Contract | Ownership / effects | UI behavior and tests |
|---|---|---|---|
| `GovernDiffWorkspace` — `components/govern-diff-workspace.tsx` | Client orchestrator; `scenario: DemoScenario` | reducer, analyzer/controller, command error, focus refs; cleanup cancel | Compose focused views; focus Review/results headings; workflow/build/manual |
| `StepIndicator` — `components/step-indicator.tsx` | `phase` | none | ordered steps, phase label, `aria-current`; build/manual |
| `ModeSelector` — `components/mode-selector.tsx` | mode/capability/disabled reason | callback only; no env read | Sample persistent, Live disabled reason; build/manual |
| `PolicyEditor` — `components/policy-editor.tsx` | text and edit/analyze/reset callbacks/eligibility | none | labeled textarea, pending/read-only, adjacent reasons; workflow/manual |
| `AnalysisPanel` — `components/analysis-panel.tsx` | spec/phase and resolve/retry/approve callbacks | none | distinct rules/ambiguity/unsupported sections; no JSON; manual |
| `RuleList` — `components/rule-list.tsx` | canonical rules | none | sentence primary, ID secondary, condition/outcome text; manual |
| `BaselineResults` — `components/baseline-results.tsx` | v1 snapshot and record count | none | 18 summary, deterministic/session labels, composes table; workflow/manual |
| `FindingTable` — `components/finding-table.tsx` | stable Findings | none | caption, Record/Rule/Outcome/Why; no drawer action; manual |
| `StatusBanner` — `components/status-banner.tsx` | phase and safe errors | none | pending `aria-live`; error `role=alert`; controller/manual |
| `PolicyAnalysisController` — `lib/analysis/policy-analysis-controller.ts` | dependencies above | sequence + active controller only; never logs | focused Node tests |

Component prop/callback contracts:

```ts
interface GovernDiffWorkspaceProps {
  readonly scenario: DemoScenario;
}

interface StepIndicatorProps {
  readonly phase: DemoPhase;
}

interface ModeSelectorProps {
  readonly mode: AnalysisMode;
  readonly liveModeAvailable: boolean;
  readonly disabled: boolean;
  readonly onModeChange: (mode: AnalysisMode) => void;
}

interface PolicyEditorProps {
  readonly text: string;
  readonly phase: DemoPhase;
  readonly analyzeEnabled: boolean;
  readonly resetEnabled: boolean;
  readonly onTextChange: (text: string) => void;
  readonly onAnalyze: () => void;
  readonly onReset: () => void;
}

interface AnalysisPanelProps {
  readonly policy: RevisionedPolicy;
  readonly phase: DemoPhase;
  readonly resolveEnabled: boolean;
  readonly baselineReleaseEnabled: boolean;
  readonly onResolve: () => void;
  readonly onRetry: () => void;
  readonly onCreateBaselineRelease: () => void;
}

interface RuleListProps {
  readonly rules: readonly PolicyRule[];
}

interface BaselineResultsProps {
  readonly release: ReleaseSnapshot;
  readonly recordCount: number;
}

interface FindingTableProps {
  readonly findings: readonly Finding[];
}

interface StatusBannerProps {
  readonly phase: DemoPhase;
  readonly reducerError: AppError | null;
  readonly commandError: AppError | null;
}
```

Callbacks return immediately to React; the workspace owns asynchronous execution and catches every promise so no unhandled rejection reaches the browser. Presentation components emit no domain event directly.

Keep the one-use ambiguity view inside `AnalysisPanel`; `BaselineResults` composes `FindingTable`. Workspace orchestrates but does not absorb their presentation markup.

## 11. Exact file allowlist

### Files to add

```text
components/govern-diff-workspace.tsx
components/step-indicator.tsx
components/mode-selector.tsx
components/policy-editor.tsx
components/analysis-panel.tsx
components/rule-list.tsx
components/baseline-results.tsx
components/finding-table.tsx
components/status-banner.tsx
lib/analysis/policy-analysis-controller.ts
tests/analysis/policy-analysis-controller.test.ts
tests/state/gate-2b-workflow.test.ts
```

The nine components implement the contracts in Section 10. The controller is new because concurrency must be React-independent and directly testable. The two tests cover controller lifecycle and the real network-free draft-to-v1 workflow; no existing test can own those responsibilities.

### Files to modify

```text
app/page.tsx
app/layout.tsx
app/globals.css
```

- `app/page.tsx`: dynamic Server Component, verified fixture, safe failure, workspace mount.
- `app/layout.tsx`: replace scaffold metadata description with the canonical product problem statement.
- `app/globals.css`: P0 workspace, semantic status, focus, table, and responsive styles using plain CSS.

This exact 15-path list is the complete mutation allowlist. Broad directory allowlists are prohibited.

### Files considered but not needed

- `components/ambiguity-card.tsx`: one-use presentation stays in `AnalysisPanel`.
- `components/evidence-drawer.tsx`, `components/impact-preview.tsx`, `components/release-history.tsx`: Gate 2C.
- `lib/state/demo-selectors.ts`: forbidden by established selector ownership.
- `lib/state/demo-commands.ts`: baseline command is small and tested through the workflow.
- `app/error.tsx`: page-local safe fixture fallback is sufficient.
- `app/api/analyze/route.ts` and Live analyzer modules: Gate 3.
- Package, lockfile, or test/config changes: current infrastructure is sufficient.

## 12. Protected paths

Do not change:

```text
.git/**
.codex/**
AGENTS.md
docs/specs/**
docs/codex/SECURITY_BOUNDARY.md
docs/codex/GATE_2_PRODUCT_FLOW_AND_SAMPLE_MODE_PLAN.md
docs/codex/GATE_2A_IMPLEMENTATION_PLAN.md
docs/codex/HANDOFF.md
demo/**
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
next.config.ts
tsconfig.json
vitest.config.ts
eslint.config.mjs
lib/analysis/analyzer-contract.ts
lib/analysis/sample-policy-analyzer.ts
lib/demo/**
lib/domain/**
lib/errors/**
lib/state/demo-events.ts
lib/state/demo-reducer.ts
lib/state/demo-state.ts
all tests existing before Gate 2B
app/api/**
.env*
```

No deletion, move, rename, install, network, secret access, or Git mutation is authorized by this plan.

## 13. Test strategy

Controller test: use deferred promises and a signal-recording executor; assert exact event arrays without sleeps or wall-clock timing. Cover every Section 8 concurrency/lifecycle case.

Pure workflow test with real loader, Sample analyzer, controller, reducer, quick action, runtime, and release factory:

1. initialize Sample state;
2. analyze draft → `draft_blocked`, five rules, one exact blocking ambiguity;
3. resolve lodging → `baseline_editing`, one revision increment;
4. re-analyze → `baseline_ready`, six rules;
5. evaluate 48 records, require 18 exact keys, create v1 → `baseline_published`;
6. assert frozen release, current baseline approval, Sample null/null metadata, no candidate/Impact, and unmutated inputs;
7. reset to exact draft and empty releases;
8. prove unsupported edited Sample text yields safe failure and retry/reset.

DOM limitation: current Vitest cannot honestly render React DOM or assert focus/ARIA/layout. Do not add a dependency. Use pure tests for behavior, lint/typecheck/build for boundaries, and manual Chrome acceptance for rendered semantics.

Regression gates:

- Existing 11 files / 97 tests remain and pass.
- Sample asset hashes, exact events/phases, reducer, and selector ownership remain unchanged.
- New controller imports no React, Next, Node, OpenAI, or network module.
- Sample flow performs no fetch, XHR, WebSocket, API call, or mode fallback.

## 14. Manual acceptance flow

Under five minutes, Sample-only, no network/key:

```text
pnpm dev
http://localhost:3000
```

Use Next.js's reported URL if port 3000 is occupied.

| Action | Expected result / phase |
|---|---|
| Open `/` | Product copy, fictional notice, 48/12 summary, persistent Sample label; `draft_editing` |
| Inspect mode | Live visible but disabled with `Requires OPENAI_API_KEY`; no key prompt |
| Analyze | `Loading precomputed policy analysis...`; controls disabled; `draft_analyzing` |
| Wait | Five rules, exact blocking ambiguity, no lodging rule; `draft_blocked` |
| Resolve | Exact USD 275 text, stale analysis cleared; `baseline_editing` |
| Re-analyze | Six rules, no ambiguity/unsupported; `baseline_ready` |
| Approve baseline & run | Immutable v1, 18 Findings, 48 records, deterministic badge; `baseline_published` |
| Inspect Step 3 | Marked next/deferred; no active candidate/Impact/publish control |
| Reset | Exact ambiguous draft, empty results/releases, Sample retained |
| Edit one character and Analyze | Safe unsupported alert; Reset then retry works |

Also verify keyboard-only primary flow, visible focus, pending/error announcements, no horizontal page scroll at 1440×900 or about 768px, no console/hydration error, and no application API/OpenAI request. Capture screenshots of initial workspace, blocking ambiguity, and published v1/18 Findings with Step 3 handoff.

## 15. Accessibility and responsive baseline

- One `h1`; ordered section headings; native button/textarea/table semantics.
- Visible labels and adjacent disabled reasons.
- Mode, step, pending, error, and publication use text, not color alone.
- Pending uses `aria-live="polite"`; errors use `role="alert"`.
- Focus Review heading after draft completion and results heading after publication; never move focus for typing or silent stale completions.
- Visible focus ring and `prefers-reduced-motion` handling.
- Two columns when space permits; one column below breakpoint.
- No page horizontal scroll at desktop/768px; table may use a labeled local overflow container.
- Full mobile polish, animation, and drawer focus trap are deferred.

## 16. Error and recovery behavior

| Failure | Display / state | Recovery |
|---|---|---|
| Fixture invalid | Safe server alert; no workspace | Developer fixes fixture; no fake demo |
| Unsupported Sample text | Safe reducer alert; matching editing phase | Reset/correct and retry |
| Quick action mismatch | Safe local alert; text unchanged | Manual edit or Reset |
| Unknown analyzer failure | Safe `UNKNOWN_ERROR`; editing phase | Retry |
| Aborted/superseded/stale | No banner/event | Latest/current request continues |
| Runtime/key mismatch | Safe local fatal alert; no release event | Reset; developer investigates |
| Invalid transition | Existing safe reducer alert; domain preserved | Valid action or Reset |

Ephemeral command error clears on accepted edit/analyze, successful quick action/publication, or Reset. Never render stack, raw payload, hash, provenance request ID, or secret.

## 17. Validation commands

```text
pnpm test -- tests/analysis/policy-analysis-controller.test.ts
pnpm test -- tests/state/gate-2b-workflow.test.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
git diff --check
git diff -- <exact 15 Gate 2B paths>
git status --short
git diff --cached --name-only
```

Require exact 15 changed paths, empty index, unchanged protected/dependency/config/lockfile/assets/Gate 2A contracts, and no deletion, move, rename, install, network, secret, external write, or Git mutation. Record manual results honestly; do not claim unrun browser checks.

## 18. Acceptance criteria

1. Server loads verified scenario; browser imports no filesystem module.
2. Sample label is persistent, Live disabled honestly, and no network/key access occurs.
3. Initial exact draft/phase is `draft_editing`.
4. Draft reaches `draft_blocked`, five rules, exact ambiguity, no invented lodging rule.
5. USD 275 action is atomic, increments once, and requires re-analysis.
6. Resolved analysis reaches `baseline_ready`, six rules, zero blocking issues.
7. Baseline evaluates 48 records and creates one immutable `mfs-v1` with 18 exact keys.
8. Published v1 is uneditable and visibly session-only.
9. All sequence, abort, cleanup, stale, and duplicate-completion tests pass without event changes.
10. Pending/error/retry/reset/disabled/phase/keyboard/focus/responsive baselines pass.
11. Candidate/Impact/evidence/publish is not implemented or falsely presented complete.
12. Existing 97 plus new tests, lint, typecheck, build, and `pnpm check` pass.
13. Only the exact 15 allowlisted paths change.

## 19. Implementation sequence

1. Reconfirm clean `171691e...`, root/sandbox, and protected paths.
2. Add controller and deferred-promise tests.
3. Add pure Gate 2B workflow test.
4. Add focused presentation components.
5. Implement workspace orchestration, cleanup, and focus.
6. Convert page to server loader and update metadata.
7. Replace scaffold CSS with minimal P0 layout.
8. Run focused then full validation.
9. Perform five-minute manual flow and screenshots.
10. Review exact 15-path diff and stop without docs, stage, commit, push, or Gate 2C.

One mutation is sufficient; no dependency/config prerequisite or multi-commit sequence is planned.

## 20. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Same-revision late result wins | sequence + token identity + abort + revision + reducer guards |
| Strict Mode leaves dead controller | reusable idempotent cancel; explicit ref initialization; no dispose flag |
| Server freeze assumed in browser | analyzer copies/freezes assets; UI never mutates props/records |
| UI guard drift | existing selectors/phase; no duplicate pending/release state |
| Arbitrary text appears supported | exact Sample failure, no fallback |
| Incorrect v1 published | startup guard, exact key check, factory freeze, reducer guard |
| No DOM automation | native semantics + manual keyboard/focus/ARIA/layout + build |
| Gate 2C scope leaks | exact allowlist excludes candidate/Impact/evidence modules/events |
| CSS becomes redesign | plain local CSS, no assets/framework, P0 only |

## 21. P0 / P1 / deferred

**P0:** server/client boundary; Sample honesty; draft/editor/analysis/ambiguity/resolution/review; concurrency controller/tests; v1/18 Findings; reset/retry/errors; accessibility/responsive baseline; full validation/manual flow.

**P1 if full P0 is accepted:** optional visual polish, usability review, microcopy refinement, nonessential animation. Not in this allowlist.

**Deferred:** Gate 2C candidate/Impact/Rule Diff/evidence/approval/publish/history; Gate 3 Live route/adapter/key/fetch cancellation/authorized smoke; post-submission upload/persistence/export/deployment/auth/analytics/mobile polish.

## 22. Gate 2C handoff boundary

Gate 2B hands off:

```text
phase: baseline_published
mode: sample
releases: exactly one immutable mfs-v1 / v1 / 1.0.0
baseline findings: exact 18
candidate: null
impact: null
selectedFindingKey: null
baseline approval: current revision + analysisId
```

Gate 2C starts by guarding `canStartCandidate` and dispatching `START_CANDIDATE` with exact published v1 text. Gate 2B does not pre-create candidate, compute Impact, add evidence, or invent events. Its controller remains reusable for candidate analysis; Gate 3 may later supply a signal-consuming Live executor.

## 23. Open questions

**Blocking:** none.

**None blocking:** exact spacing, breakpoint, and secondary copy may be tuned inside the listed CSS/components while preserving canonical text, accessibility, scope, and acceptance. No human decision is needed before implementation.

## 24. Final implementation verdict

`VALIDATED`

The exact 15-path implementation, automated validation, and human localhost acceptance are complete. Gate 2B hands off the immutable `mfs-v1` / 18-Finding baseline while preserving the Gate 2C and Gate 3 boundaries. The next task is Gate 2C implementation planning; no Gate 2C implementation or push is part of this closeout.
