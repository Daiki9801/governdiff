# Gate 2A — Sample and State Foundation Implementation Plan

**Plan status:** IMPLEMENTED — CLOSURE DOCUMENTATION UPDATED

**Prepared:** 2026-07-18 JST

**Implementation status:** COMPLETE AND VALIDATED IN THE WORKING TREE

**Parent plan:** `docs/codex/GATE_2_PRODUCT_FLOW_AND_SAMPLE_MODE_PLAN.md`

**Execution base HEAD:** `ac9fbc441a471084204edf88c2e9ad4a33217d24`

## Closure record

Gate 2A is complete in the working tree. The implementation provides:

- three exact, human-reviewed `gpt-5.4` Sample assets and target/hash matching;
- a server-only scenario loader, canonical fixture expectation guard, and browser-boundary Sample analyzer ownership;
- two atomic, hash-checked policy quick actions;
- the exact 13 canonical phases and 12 canonical event types;
- state types, factories, guard selectors, and selectors exported from `lib/state/demo-state.ts`;
- guarded immutable reducer transitions, revision freshness, analysis invalidation, immutable release snapshots, and Impact ownership.

The canonical public result is recomputed as baseline 18, candidate 16, removed 3, added 1, and unchanged 15. Full validation passes with 11 test files and 97 tests. The frozen Sample asset SHA-256 values are:

```text
sample-analysis-draft-v1.json  87E81A7B753F721CF4F177D83A3DFEF5FC38F117D2D6FFE897A24505D6F10B1F
sample-analysis-v1.json        BDED5EF8C5D1A4BA9A01B7DA993FD28CADFC4566F0EF04696B20DECA7F9BFC4B
sample-analysis-v2.json        354E75FC601A702A5CEFC227F546C707E521F4A18CCC90F3951D9223F6B11D32
```

The capture runner, isolated Vitest capture configuration, temporary capture directory, obsolete loader path, and `lib/state/demo-selectors.ts` are absent. No dependency, configuration, lockfile, canonical specification, frozen CSV/expectation, or application UI path changed. The implementation and closure documentation are uncommitted, the index is empty, and no push has occurred.

## 1. Goal

Implement the non-UI foundation required for an honest credential-free Sample Mode:

- three exact Sample variants;
- server-only fixture load and startup validation;
- shared analyzer contract and Sample analyzer;
- atomic policy-text quick actions;
- complete pure reducer/state transitions;
- regression tests for hashes, semantic validity, state invalidation, and immutable releases.

Gate 2A must leave `app/**` and product UI unchanged.

## 2. Entry gates

Do not write implementation files until all checks pass:

```text
resolved Git root == <repository-root>
branch == master
Gate 1 closeout and planning docs are committed
working tree and index are clean
workspace-write is active
Full Access is inactive
network is default-denied
dependency/config/lockfile changes are unnecessary
```

Two human decisions are required before execution:

1. Provide the three truthful, human-reviewed Sample assets, or, if they are absent, explicitly approve the exact capture workflow before Gate 2A starts. The current three-asset capture decision is `gpt-5.4`; provenance may be `gpt-5.4` or `gpt-5.6` only when it exactly matches the model actually used. Workflow approval does not itself authorize network/key use; the capture execution receives its own exact approval at the checkpoint below. Do not manufacture or relabel provenance.
2. Explicitly authorize the exact rename `lib/demo/load-demo-scenario.ts` → `lib/demo/fixture-loader.server.ts` for the canonical server-only boundary.

The implementation prompt must record its actual baseline commit at execution time. Do not assume `f5d85b6`, because the Gate 1 closeout and these plans are currently uncommitted.

### Capture checkpoint and truthful procedure

Capture approval and capture execution occur at different times. If the three assets are not supplied, use this non-circular sequence:

1. **Before Gate 2A:** approve the capture workflow and exact loader rename, establish the clean human-owned baseline, and keep network/key access disabled.
2. **Gate 2A foundation, network-free:** implement and locally validate the narrow draft compiler bridge, shared post-compiler canonical `PolicySpec` validator, and browser-safe fixture contracts. The foundation must be human-reviewed before capture.
3. **Separate capture task:** grant exact, one-time network/key authorization only after the foundation is available; capture, canonicalize, and human-review the three results.
4. **Gate 2A integration, network-free:** add the reviewed canonical assets to the loader/analyzer, run the startup expectation guard, and complete all Gate 2A tests.

Gate 2A may therefore begin after workflow/rename approval and a clean baseline, but it cannot pass its exit gate until the separate capture checkpoint and asset integration are complete.

At the capture checkpoint:

1. Use the approved `gpt-5.4` model for the current three assets and send only the normalized policy text plus the canonical field, operator, outcome, and rule catalogs required by the model-facing analysis prompt. Gate 3 Live Mode remains `gpt-5.6`; this capture does not satisfy or replace that integration.
2. Never send the CSV, any expense row, expense/employee/report ID, employee email, Finding, or other record-derived data.
3. Permit network access and make an API key available only to the isolated capture process without displaying or persisting its value; neither network nor key access is enabled in the Gate 2 application or normal Sample execution.
4. Record the actual successful-response time as `capturedAt` and the actual response request ID as `requestId`. Use `null` only when the provider response genuinely exposes no request ID.
5. Treat the raw `PolicyAnalysis` response as transient capture material. Do not commit it or present it as a Sample asset.
6. Validate the raw response, run it through the host `compilePolicyAnalysis` canonicalization path, then validate the resulting canonical `PolicySpec`, exact source quotes, registry metadata, target/hash mapping, runtime totals, Impact parity, and Rule Diff.
7. Human-review each canonicalized result against its policy and expected rule set before accepting it.
8. Add only the three canonical `SampleAnalysisAsset` JSON files, containing canonical `PolicySpec` plus truthful provenance. Any staging or commit remains a separate, explicit Git authorization.

Failure at any step leaves the corresponding asset absent. Do not substitute hand-authored analysis, an inferred timestamp, an invented request ID, or a response from a model other than the approved capture model. Never label one model's result as another model.

## 3. Proposed exact implementation scope

The later implementation task must explicitly authorize this scope. It may narrow it after inspection but must not silently expand it.

### Exact rename

- `lib/demo/load-demo-scenario.ts` → `lib/demo/fixture-loader.server.ts`

### Add

- `demo/sample-analysis-draft-v1.json`
- `demo/sample-analysis-v1.json`
- `demo/sample-analysis-v2.json`
- `lib/analysis/analyzer-contract.ts`
- `lib/analysis/sample-policy-analyzer.ts`
- `lib/demo/fixture-contract.ts`
- `lib/demo/fixture-expectation-guard.ts`
- `lib/demo/quick-actions.ts`
- `lib/errors/app-error.ts`
- `lib/state/demo-state.ts`
- `lib/state/demo-events.ts`
- `lib/state/demo-reducer.ts`
- `tests/analysis/sample-policy-analyzer.test.ts`
- `tests/demo/fixture-contract.test.ts`
- `tests/demo/fixture-expectation-guard.test.ts`
- `tests/demo/quick-actions.test.ts`
- `tests/state/demo-reducer.test.ts`

### Update

- `lib/domain/types.ts`
- `lib/domain/schemas.ts`
- `lib/domain/policy-compiler.ts`
- `tests/compiler.test.ts`
- `tests/demo-loader.test.ts`
- `docs/codex/HANDOFF.md`

### Forbidden in Gate 2A

- `app/**`
- `components/**`
- `app/api/**`
- `lib/openai/**`
- dependencies, scripts, configuration, or `pnpm-lock.yaml`
- canonical specs, frozen CSV, or `demo/public-fixture-expectations.json`
- `.env*`, README, deployment, or submission files

## 4. Contracts

### Analyzer contract

```ts
interface AnalyzePolicyRequest {
  policyText: string;
  targetVersion: "draft-v1" | "1.0.0" | "1.1.0";
}

interface AnalyzePolicyResult {
  spec: PolicySpec;
  metadata: AnalysisMetadata;
}

interface PolicyAnalyzer {
  analyze(request: AnalyzePolicyRequest): Promise<AnalyzePolicyResult>;
}
```

Sample and future Live analyzers use this interface. Gate 2A implements only Sample.

### Sample variants

```ts
type SampleVariant = "draft-v1" | "resolved-v1" | "candidate-v2";
```

Exact mapping:

| Target version | Variant | Normalized SHA-256 |
|---|---|---|
| `draft-v1` | `draft-v1` | `356315c45637a47d8a2c02cdb4f773fe0337649bb7a52f396e167cc2e551adff` |
| `1.0.0` | `resolved-v1` | `21b948db95724c8484f317414f6d1d64ea22b92d208787fb8a00801d602d460d` |
| `1.1.0` | `candidate-v2` | `1d6e521b4b8715c74bdebfbf6518e61686e207cb450847f0541097f443fd6b63` |

Matching requires both target version and normalized hash. Neither value alone is sufficient.

`lib/demo/fixture-contract.ts` owns one browser-safe immutable variant definition table containing the target version, normalized hash, and asset key/file mapping. The loader, Sample analyzer, quick-action hash checks, fixture guard, and tests import this table; they do not repeat hash literals or maintain parallel variant maps.

### Sample asset

```ts
interface SampleAnalysisAsset {
  analysis: PolicySpec;
  provenance: {
    capturedFrom: "gpt-5.4" | "gpt-5.6";
    capturedAt: string;
    requestId: string | null;
  };
}
```

Runtime metadata derived from the asset is always:

```text
mode: sample
model: null
requestId: null
```

Asset provenance is explanatory capture history and never becomes current runtime metadata or affects Findings/Impact. It must exactly name the model actually used; the current three-asset decision is `gpt-5.4`. Sample runtime metadata remains Sample/null/null, while Gate 3 Live Mode remains `gpt-5.6`.

The representation boundary is strict:

- `PolicyAnalysis` is model-facing, untrusted compiler input and is never the shape stored in a Sample JSON file.
- `PolicySpec` is this repository's implementation name for the post-compiler canonical policy spec.
- `SampleAnalysisAsset` contains only a canonical `PolicySpec` plus capture provenance.
- The server loader validates the stored canonical schema, registry/source invariants, and runtime expectations directly. It never re-feeds `asset.analysis` into `compilePolicyAnalysis` as though it were raw model output.
- A shared post-compiler canonical-spec validator is used both after compiler canonicalization and by the loader. This prevents the loader from duplicating or weakening registry, source, ordering, required-rule, ambiguity, or unsupported-statement checks.
- The draft compiler bridge in Section 5 exists for future Live output, compiler tests, and the isolated capture pipeline. Normal Sample analysis performs no compilation.

### Errors

Implement the exact canonical `AppErrorCode` union and safe `AppError` shape:

- `DEMO_FIXTURE_INVALID`
- `LIVE_MODE_UNAVAILABLE`
- `ANALYSIS_REQUEST_INVALID`
- `ANALYSIS_TIMEOUT`
- `ANALYSIS_RATE_LIMITED`
- `ANALYSIS_UPSTREAM_ERROR`
- `ANALYSIS_REFUSED`
- `ANALYSIS_SCHEMA_INVALID`
- `SOURCE_QUOTE_INVALID`
- `SAMPLE_VARIANT_UNSUPPORTED`
- `QUICK_ACTION_SOURCE_MISMATCH`
- `RUNTIME_SPEC_INVALID`
- `RUNTIME_RECORD_INVALID`
- `FIXTURE_EXPECTATION_FAILED`
- `STATE_TRANSITION_INVALID`
- `UNKNOWN_ERROR`

Errors contain no raw policy text, asset JSON, stack trace, personal data, or secret material. Optional `detail` is limited to a short development-only diagnostic code and is omitted from production browser output.

Error ownership is explicit:

- The Sample analyzer rejects with a safe `AppError`; it never falls back to another variant or returns a partial result.
- The server fixture loader throws a fatal safe `AppError` and returns no partial scenario.
- Quick actions do not throw. They return a discriminated result and preserve the exact original text on failure:

```ts
type QuickActionResult =
  | { ok: true; text: string }
  | { ok: false; text: string; error: AppError };
```

- The reducer never throws. It discards stale responses or stores a recoverable safe error according to Section 8.

## 5. Fixture and asset validation pipeline

`fixture-loader.server.ts` must use `process.cwd()` plus `path.join()` and read only fixed repository-relative assets.

Validation order:

1. Required files exist and JSON parses.
2. Existing CSV/header/row/category/date/boolean/money/email/hash checks pass.
3. Draft, v1, and v2 policy text are loaded and normalized hashes match the canonical constants.
4. Each Sample asset passes strict Zod structural validation as canonical `PolicySpec` plus provenance; a raw `PolicyAnalysis` shape is rejected.
5. Provenance shape accepts only `gpt-5.4` or `gpt-5.6`, exactly matches the actual capture model, and is preserved only as provenance.
6. Asset `analysis.policyId` and version match its variant.
7. Rules, predicates, registry metadata, source quotes, required rule set, ambiguity, and unsupported statements pass the same post-compiler semantic constraints as normal analysis without calling `compilePolicyAnalysis` on the asset.
8. Loaded specs are copied and deep-frozen; mutable JSON objects are not exposed as canonical state.
9. The real runtime recomputes baseline 18 and candidate 16 from the same 48 records.
10. The real Impact Engine recomputes removed 3, added 1, unchanged 15 and exact key parity.
11. Canonical Rule Diff is exactly receipt modified plus rideshare added.
12. Any failure stops scenario load with `DEMO_FIXTURE_INVALID` or `FIXTURE_EXPECTATION_FAILED`; no partial scenario is returned.

The returned serializable scenario includes draft/v1/v2 policy text, records, all three Sample assets, expectations, and an explicitly supplied `liveModeAvailable` boolean. Gate 2A tests pass `false`; the loader must not read `OPENAI_API_KEY`. Gate 2 keeps Live unavailable until the separately scoped Gate 3 server boundary supplies real availability.

### Draft canonicalization bridge

The current compiler rejects a blocking ambiguity before producing a spec. Gate 2A must refine this without weakening resolved/candidate readiness:

- `draft-v1` may canonicalize only when it has the exact five required rule IDs, no `EXP-LDG-001`, exactly one blocking lodging ambiguity for the full `Unusually high` sentence, and zero unsupported statements.
- The draft ambiguity remains present and blocks baseline publication; it is never converted into a threshold or lodging rule.
- `1.0.0` and `1.1.0` continue to reject every blocking ambiguity and blocking unsupported statement.
- Resolved v1 still requires exactly six rules and candidate v2 exactly seven.
- Existing Gate 1 baseline/candidate behavior and all 54 tests must remain valid.

Implement this as a narrow version-aware canonicalization/readiness distinction in `policy-compiler.ts`; do not add a second permissive compiler or bypass registry/source validation for Sample assets.

## 6. Sample analyzer behavior

1. Normalize policy text using the canonical CRLF/CR → LF, NFC, line-end trimming, and exactly-one-final-LF contract.
2. Compute SHA-256 with Web Crypto `crypto.subtle.digest` and `TextEncoder`; return lowercase hex.
3. Map the exact `(targetVersion, hash)` pair to one variant.
4. Return the analyzer-owned, validated, copied, deep-frozen canonical spec. Never return a server-deserialized input object or compile it again.
5. Create Sample runtime metadata with injected clock/timer dependencies so tests are deterministic.
6. On mismatch or hash failure, reject with a safe `SAMPLE_VARIANT_UNSUPPORTED` `AppError`.
7. Never switch to another target, call a network API, or return a Live label/metadata.

The analyzer must remain browser-safe and must not import the server loader, `node:*`, OpenAI, React, or Next.js.

### SamplePolicyAnalyzer construction boundary

Server-side freeze is not a browser ownership guarantee: passing `DemoScenario` from a Server Component to a Client Component serializes and recreates the asset graph as mutable browser objects. Analyzer construction therefore establishes a second ownership boundary:

- Treat server-supplied Sample assets as structurally validated but newly deserialized mutable input.
- Immediately create a schema-guided fresh deep copy of the complete asset map, including provenance, every `PolicySpec`, rules, nested conditions, ambiguities, unsupported statements, and arrays; then deep-freeze the complete analyzer-owned graph.
- Never retain, freeze in place, or return any caller-supplied deserialized object or nested reference.
- Repeated `analyze()` calls may return the matching analyzer-owned frozen `PolicySpec` because the analyzer owns that immutable graph.
- Loader-side copy/freeze is the server invariant. Analyzer-construction copy/freeze is the browser invariant after serialization.

No dependency, Node API, JSON round-trip at runtime, or new trust assumption is introduced by this boundary.

## 7. Atomic quick actions

### Baseline resolution

Replace exactly one occurrence:

```text
Unusually high lodging expenses require manager review.
```

with:

```text
Lodging expenses above USD 275.00 require manager review.
```

Zero or multiple anchors return `QUICK_ACTION_SOURCE_MISMATCH` and the original text unchanged.

The function reports that failure through `QuickActionResult`; it does not throw.

### Candidate transformation

Starting only from the published v1 text, validate all anchors before constructing output:

1. `**Display version:** v1` → `**Display version:** v2 candidate`
2. `**Release version:** 1.0.0` → `**Release version:** 1.1.0`
3. `**Effective from:** 2026-07-01` → `**Proposed effective from:** 2026-08-01`
4. `Expenses of USD 100.00 or more must include a receipt.` → `Expenses of USD 150.00 or more must include a receipt.`
5. Insert `Rideshare expenses above USD 120.00 require manager review unless a manager preapproved the expense.` exactly once after the weekend sentence

Commit no partial transformation. Reject missing/duplicate anchors and pre-existing duplicate rideshare content. Normalize the result and require the exact canonical v2 hash. A successful action causes exactly one reducer edit/revision increment and never mutates analysis/spec directly.

Candidate failure also uses `QuickActionResult`, returns the exact original text, and does not throw.

## 8. State model

### Exact phases

```ts
type DemoPhase =
  | "draft_editing"
  | "draft_analyzing"
  | "draft_blocked"
  | "baseline_editing"
  | "baseline_analyzing"
  | "baseline_ready"
  | "baseline_published"
  | "candidate_editing"
  | "candidate_analyzing"
  | "candidate_ready"
  | "impact_ready"
  | "candidate_approved"
  | "published";
```

Do not add a redundant pending boolean or a client `fatal_error` phase.

### Required state

- `mode`
- immutable session capability `liveModeAvailable`
- immutable normalized `initialDraftText`
- revisioned baseline
- nullable revisioned candidate
- monotonic `analysisSequence`
- single-source immutable `releases`
- nullable current `ImpactComputation`
- selected Finding key
- recoverable safe error

Approval binds to `revision` and `analysisId`. Impact binds to candidate revision, candidate analysis ID, and baseline release ID.

`liveModeAvailable` and `initialDraftText` are initialized by the state factory from the verified server-supplied `DemoScenario`. `initialDraftText` is the normalized `policyDraftV1` string and neither value is changed by reducer events. Gate 2 always supplies `liveModeAvailable: false`; a request to switch to Live is invalid. Gate 3 may supply `true` from its server boundary without changing the Gate 2 reducer contract.

`RESET_SCENARIO` retains the current mode, `liveModeAvailable`, and `initialDraftText`, then recreates the baseline from `initialDraftText`. `MODE_CHANGED` does the same with the requested mode. Both clear candidate, analyses, approvals, Impact, releases, selection, and recoverable error. The reducer neither reads a file nor reconstructs the canonical draft from literals.

### Exact event contract

Gate 2A implements the complete canonical union, without adding quick-action events:

```ts
type DemoEvent =
  | { type: "MODE_CHANGED"; mode: AnalysisMode }
  | { type: "POLICY_EDITED"; target: "baseline" | "candidate"; text: string }
  | {
      type: "ANALYSIS_STARTED";
      target: "baseline" | "candidate";
      requestedRevision: number;
    }
  | {
      type: "ANALYSIS_SUCCEEDED";
      target: "baseline" | "candidate";
      requestedRevision: number;
      spec: PolicySpec;
      metadata: AnalysisMetadata;
    }
  | {
      type: "ANALYSIS_FAILED";
      target: "baseline" | "candidate";
      requestedRevision: number;
      error: AppError;
    }
  | { type: "BASELINE_RELEASE_CREATED"; release: ReleaseSnapshot }
  | { type: "START_CANDIDATE"; text: string }
  | { type: "IMPACT_COMPUTED"; computation: ImpactComputation }
  | { type: "APPROVE_CANDIDATE" }
  | { type: "CANDIDATE_RELEASE_CREATED"; release: ReleaseSnapshot }
  | { type: "FINDING_SELECTED"; key: string | null }
  | { type: "RESET_SCENARIO" };
```

`START_CANDIDATE` retains its canonical `text` field from basic design Section 16.6. The controller supplies published v1 text as a string value; the reducer must not derive or transform policy text. Candidate quick action success is then dispatched as `POLICY_EDITED`.

### Reducer boundary

Reducer code is pure. It does not:

- call an analyzer;
- hash text;
- run policy evaluation or Impact;
- generate timestamps;
- read files/environment;
- mutate input state, releases, specs, Findings, or event payloads.

Command handlers in later UI code perform those effects and dispatch validated result events.

### Copy/freeze ownership

- `compilePolicyAnalysis` creates fresh canonical structures and deep-freezes the resulting `PolicySpec` under the existing canonicalization contract.
- The server loader validates, copies, and deep-freezes parsed Sample JSON before constructing the scenario.
- `SamplePolicyAnalyzer` treats Server→Client-deserialized assets as mutable input, creates and deep-freezes its own complete browser-side asset graph at construction, and retains no caller-owned nested reference.
- Pure `createReleaseSnapshot` and `createImpactComputation` factories copy nested specs, Findings, arrays, and metadata, then deep-freeze the finished value before it is dispatched.
- The reducer accepts only pre-validated factory results, rechecks transition/binding guards, and stores them without freezing, mutating, or repairing event payloads.
- No published release, Impact computation, editor state, parsed JSON object, or event payload shares a mutable nested reference.

### Guard selectors

`demo-state.ts` exports pure selectors used by command handlers and later button guards, including:

- `canAnalyzeBaseline`
- `canCreateBaselineRelease`
- `canStartCandidate`
- `canAnalyzeCandidate`
- `canComputeImpact`
- `canApproveCandidate`
- `canPublishCandidate`
- `canSelectFinding`
- `canResetScenario`
- `canChangeMode`

Selectors derive from phase, current revision/analysis/approval bindings, releases, Impact bindings, selected Finding membership, and `liveModeAvailable`; components do not reproduce transition logic. `canAnalyzeBaseline` covers only the canonical draft/baseline editing phases. `canSelectFinding` also receives the requested key. `canChangeMode(state, "live")` is false when `liveModeAvailable` is false, and mode/reset selectors are false during analysis.

### Transition requirements

- Editing increments revision and clears stale analysis, approval, Impact, and invalid selected Finding.
- Analysis start is allowed only from its corresponding editing phase.
- An accepted `ANALYSIS_STARTED` preserves text/revision and `analysisSequence`, enters the matching analyzing phase, and clears the target policy's `analysis`, `analysisRevision`, `analysisId`, `analysisMetadata`, `approvalRevision`, and `approvedAnalysisId`, plus dependent Impact and any selected Finding no longer present in the visible validated set.
- Analysis success is accepted only for the current requested revision and exact variant contract.
- Every accepted success increments `analysisSequence` and assigns a new analysis ID.
- Re-analysis of unchanged text invalidates existing approval and Impact.
- Draft success requires five rules and exactly one lodging ambiguity, with no lodging rule.
- Baseline success requires six rules and zero ambiguities/unsupported statements.
- Candidate success requires seven rules and zero ambiguities/unsupported statements.
- Baseline release creation requires current analysis and exactly 18 Findings.
- Candidate start requires phase `baseline_published`, exactly one published `mfs-v1`, no `mfs-v2`, no current candidate, and an exact text-value match between the event and v1 snapshot.
- Impact acceptance requires current candidate and exact `3 / 1 / 15` guard.
- Candidate approval requires current Impact and binds to revision plus analysis ID.
- Candidate publish requires current approval/Impact and appends v2 once.
- Duplicate `mfs-v1` or `mfs-v2` release IDs are rejected.
- Published v1 has no reducer event that can update it.
- Mode change/reset is forbidden during analysis; otherwise it fully resets session-derived state from `initialDraftText` while retaining `liveModeAvailable` and using the requested/current mode respectively.
- Invalid transitions produce `STATE_TRANSITION_INVALID`, not silent no-op.

`START_CANDIDATE` acceptance is exact:

1. Locate exactly one published `mfs-v1` release.
2. Require no existing `mfs-v2` release and `candidate === null`.
3. Require `event.text === publishedV1.policyText` before creating candidate state.
4. Assign the immutable string primitive value from `event.text` to the new candidate without deriving or transforming it in the reducer. Subsequent candidate edits create new reducer state and cannot mutate the release snapshot.
5. On any mismatch, preserve phase, candidate, releases, and all other domain data; set only the recoverable `STATE_TRANSITION_INVALID` error under the normal invalid-transition contract.

Failure handling is exact:

- A stale `ANALYSIS_SUCCEEDED` or `ANALYSIS_FAILED` whose `requestedRevision` is not current returns the identical state object. It does not change phase, clear data, or overwrite an existing error.
- A current `ANALYSIS_FAILED` stores its safe `AppError` and returns to the matching editing phase: draft analysis to `draft_editing`, resolved baseline analysis to `baseline_editing`, and candidate analysis to `candidate_editing`. The previous analysis remains cleared and cannot become current again.
- Any other invalid transition preserves all domain data and changes only the recoverable error to `STATE_TRANSITION_INVALID` with a developer-visible code/context and safe user-facing message.
- `FINDING_SELECTED` accepts only `null` or a key in the currently visible validated Finding set. An invalid key follows the same invalid-transition rule.
- A valid edit, analysis start, successful transition, mode change, or reset clears the previous recoverable error as defined by the canonical transition contract.

### Request freshness ownership

The canonical event union remains unchanged and intentionally carries `requestedRevision`, not a request-sequence field:

- The Gate 2A reducer rejects only response events whose `requestedRevision` differs from the current policy revision.
- The Gate 2B controller owns a monotonically increasing local request sequence. Before dispatching success or failure, it requires both the captured sequence and captured revision to still be latest/current.
- Starting a newer request aborts the prior controller token. Component unmount aborts the current token. An aborted or superseded result is discarded without dispatch and without an error banner, even when its revision equals the current revision.
- In Sample Mode the `AbortController` signal is still a local cancellation/discard guard around the analyzer promise; Gate 3 may additionally pass the signal to browser fetch without changing reducer events.

This division is necessary because the reducer cannot distinguish two responses for the same revision from the canonical event payload alone.

## 9. Implementation sequence

1. **Foundation contracts:** extend domain types/schemas, add the exact AppError model, complete the approved server-loader rename, and extract browser-safe fixture contracts without network access.
2. **Compiler foundation:** implement the narrow draft bridge plus shared post-compiler canonical-spec validator and prove existing resolved/candidate behavior remains unchanged.
3. **Foundation review:** run focused compiler/contract tests and obtain human review before any capture execution.
4. **Separate capture checkpoint:** under its own exact approval, perform the current one-time `gpt-5.4` capture and human review; return only truthful canonical assets to the repository scope. This does not satisfy or replace Gate 3 Live Mode's `gpt-5.6` integration.
5. **Asset integration:** validate/copy/freeze the three assets, complete loader/startup guards, and implement exact Sample target/hash matching with honest metadata without further network access.
6. **Quick actions:** implement pure atomic transformations and hash checks.
7. **State contracts/events:** define exact phases/events, immutable initial configuration, revision/analysis bindings, release and Impact state, factories, and guard selectors.
8. **Reducer:** implement guarded immutable transitions, reset-from-initial behavior, analysis-start invalidation, and exact stale/current/invalid error behavior.
9. **Tests:** add focused tests, run existing Gate 1 tests unchanged, then run full validation.
10. **Handoff:** record exact paths/results and keep Gate 2 IN PROGRESS; do not mark Gate 2 complete after 2A.

## 10. Test matrix

### Fixture and Sample assets

- All three files parse with strict unknown-key rejection.
- Provenance accepts exactly `gpt-5.4` or `gpt-5.6`, truthfully matches the actual capture model, and does not become Live runtime metadata.
- Raw model-facing `PolicyAnalysis` JSON is rejected as a Sample asset.
- Each policy/spec version and source quote matches its built-in policy.
- Draft has five rules, one blocking lodging ambiguity, and no `EXP-LDG-001`.
- Resolved/candidate analyses still reject blocking ambiguity or unsupported statements.
- Resolved v1 has exactly six rules.
- Candidate v2 has exactly seven rules.
- Startup guard recomputes 18, 16, 3, 1, 15 and exact Finding keys.
- Frozen CSV and policy hashes remain unchanged.
- Loader output is copied/deep-frozen and does not share references with parsed JSON.

### Sample analyzer

- Three exact target/hash pairs succeed.
- Correct target plus edited text fails.
- Correct text plus wrong target fails.
- Unsupported text is never treated as Sample success.
- Metadata remains Sample/null/null while provenance remains separate.
- Hash output is deterministic lowercase SHA-256.
- Returned specs are the prevalidated deep-frozen assets and `compilePolicyAnalysis` is not called during Sample analysis.
- Hash/variant failures reject with safe `AppError` and never return partial data.
- A JSON serialize/parse round-trip simulates the Server→Browser boundary before analyzer construction.
- Mutating the caller-owned deserialized asset after construction does not change any later analyzer result.
- Analyzer-owned assets/specs share no nested object or array reference with the deserialized input.
- The returned spec, rules, nested conditions, ambiguities, unsupported statements, and their arrays are frozen.

### Quick actions

- Baseline replacement succeeds exactly once and output hash equals v1.
- Baseline missing/duplicate anchor is atomic failure with original text unchanged.
- Candidate transformation updates every required anchor exactly once and output hash equals v2.
- Candidate missing/duplicate/pre-existing anchor is atomic failure with original text unchanged.
- Inputs are not mutated.
- All failures return `QuickActionResult` with the exact original text and do not throw.

### Reducer

- Initial state is created from verified `initialDraftText`, with empty releases and null candidate/Impact.
- Initial state has server-supplied `liveModeAvailable: false`; Live mode change is rejected without resetting domain data.
- All canonical happy-path phases are reachable in order.
- Pending phase rejects edit/mode/reset/double analysis.
- Edit clears current analysis/approval/Impact and increments revision once.
- Re-analysis start immediately clears the old analysis fields, approval, and dependent Impact without changing text/revision; a later failure does not revive them.
- Late success/failure for a stale requested revision is discarded with state unchanged and no user-facing transition error.
- Stale failure does not overwrite an existing recoverable error.
- Current failures return to the correct draft/baseline/candidate editing phase and retain only the safe failure.
- Re-analysis uses a new analysis ID and invalidates approval.
- Candidate edit invalidates candidate approval only and never mutates v1.
- Impact becomes stale when candidate revision/analysis changes.
- Mode change fully resets policy, candidate, releases, approval, Impact, selection, and errors.
- Duplicate releases and publish without current approval/Impact are rejected.
- `START_CANDIDATE` succeeds only when its text exactly equals the single published v1 `policyText`.
- A one-character candidate-start mismatch creates no candidate, preserves phase/releases/all other domain data, and sets only `STATE_TRANSITION_INVALID`.
- After valid candidate start and later candidate edit, the v1 release `policyText` remains unchanged; string value semantics introduce no mutable shared reference.
- Every invalid transition preserves domain data and sets only `STATE_TRANSITION_INVALID`; invalid Finding keys do the same.
- Guard selectors agree with reducer acceptance at every canonical phase.
- Snapshot/Impact factories copy and deep-freeze nested inputs before dispatch.
- Reducer does not mutate prior state or event objects.
- Reset after an edited policy restores the exact normalized ambiguous `initialDraftText`, retains current mode/capability, and does not mutate the stored initial string.
- Mode change from candidate/Impact/published state restores the exact normalized ambiguous `initialDraftText`, uses the requested mode, retains capability, and clears all derived/session data.

### Deferred Gate 2B controller tests

The following are specified here as cross-slice acceptance but are implemented and run with Gate 2B controller/component tests, not by expanding the Gate 2A event union:

- two requests for the same revision may resolve out of order, but only the latest local sequence dispatches;
- an aborted or component-unmounted request dispatches neither success nor failure;
- a superseded same-revision failure cannot overwrite the current request state or error.

## 11. Validation commands

Run and report every command and exit code:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
git diff --check
git diff -- <exact Gate 2A paths>
git status --short
git diff --cached --name-only
```

Also verify read-only:

- all original 54 Gate 1 tests remain present and pass;
- no React/Next/OpenAI/network/Node import exists in browser-safe analysis/state/quick-action modules;
- only the `.server.ts` loader imports filesystem/crypto/path Node APIs;
- Sample metadata never claims Live or model `gpt-5.6`;
- no dependency/config/lockfile/protected fixture change exists;
- no unexpected path, deletion beyond the exact authorized rename, partial quick-action output, or Git mutation exists.

## 12. Gate 2A exit criteria

**Exit status:** ALL CRITERIA SATISFIED IN THE WORKING TREE. Gate 2B is ready for planning only after final review and explicit human approval of the Gate 2A stage/commit operation.

Gate 2A is accepted only when:

- both entry decisions were satisfied and recorded truthfully;
- the network-free compiler/validator foundation was reviewed before any capture, and capture ran only as a separately authorized checkpoint;
- all three Sample assets and exact mappings pass;
- startup validation recomputes canonical results through the real Gate 1 core;
- Sample analyzer fails closed and remains browser-safe;
- Sample analyzer re-establishes copy/freeze ownership after Server→Browser serialization and shares no input references;
- quick actions are atomic and hash-checked;
- the full reducer contract and invalidation behavior pass tests;
- reset/mode change restore verified `initialDraftText`, and analysis start prevents old analysis revival;
- published snapshot inputs are copied/frozen and prior state remains unchanged;
- Sample asset/compiler boundaries, error ownership, guard selectors, and copy/freeze ownership pass their focused tests;
- full validation passes without new dependencies;
- human reviews the complete diff;
- `HANDOFF.md` records Gate 2 IN PROGRESS and identifies Gate 2B as the next task.

## 13. Strict plan review checklist

This plan has been checked for:

- exact alignment with requirements FR-001, FR-002, FR-005–016, FR-018–020;
- basic design Sections 3.2, 6.11–6.12, 9, 12, 16–17, 19–22, and 24;
- complete canonical phase and event coverage;
- no hidden UI business logic;
- exact canonical event union, including `START_CANDIDATE.text`;
- exact published-v1 text equality guard for candidate start;
- non-circular capture sequencing and explicit Gate 2A/Gate 2B request-freshness ownership;
- no fabricated Live/Sample behavior or provenance;
- no hard-coded authoritative fixture results;
- no dependency, network, persistence, auth, upload, or submission scope;
- explicit stale/current/invalid error handling, selector parity, approval, Impact, release, and mutation guards;
- exact preconditions for the server-loader rename and clean baseline.

The entry gates and capture checkpoint were satisfied in sequence. Gate 2A implementation is complete and validated; Gate 2B and Gate 3 have not started.
