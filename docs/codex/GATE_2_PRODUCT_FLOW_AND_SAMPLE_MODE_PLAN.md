# Gate 2 — Product Flow and Sample Mode Plan

**Plan status:** COMPLETE — VALIDATED

**Prepared:** 2026-07-18 JST

**Gate 2B implementation base HEAD:** `171691e567647086d9e8752bc10305f2ef514923`

**Gate 2C implementation base HEAD:** `4ae321324cf5d53d09641497760e06776a2eb7c3`

**Gate 0:** COMPLETE

**Gate 1:** COMPLETED

**Gate 2:** COMPLETE

**Gate 2A:** COMPLETE

**Gate 2B:** COMPLETE

**Gate 2C:** COMPLETE

**Gate 3:** COMPLETE

## Current execution status

Gate 2 is complete. The network-free Gate 2A foundation, Gate 2B baseline UI, and Gate 2C Impact/publish flow form one credential-free Sample Mode product flow: verified ambiguous draft → resolved immutable `mfs-v1` → canonical candidate v2 → immutable `mfs-v2`.

The existing controller provides same-revision request sequencing and `AbortController` lifecycle without changing the canonical reducer/event contract. Gate 2C adds deterministic Impact `18 → 16` with 3 removed / 1 added / 15 unchanged Findings, exact Rule Diff and affected records, safe Evidence Drawer, current approval, immutable publication, and ordered release history. Gate 3 adds the server-only exact `gpt-5.6` Responses API integration while keeping Findings, Impact, Evidence, approval, and publication local and deterministic. Final validation passes 180 tests plus lint, typecheck, production build without a key, and `pnpm check`; the no-key Sample regression passes. The bounded route-level Real GPT-5.6 smoke passed all three canonical draft/v1/v2 analyses with three requests, zero retries, and no fourth request. No additional API request is permitted or needed. No dependency, package, configuration, lockfile, or Sample asset changed, and no push has occurred. The next phase is submission readiness and pre-push privacy audit.

## 1. Objective

Gate 2 turns the deterministic Gate 1 core into a complete credential-free product flow using the built-in Mavrenna scenario and honestly labeled precomputed analysis.

The user must be able to complete this flow without an API key:

```text
ambiguous draft
→ precomputed Sample analysis
→ resolve lodging ambiguity
→ analyze and publish baseline v1
→ create and analyze candidate v2
→ compute Impact Preview
→ approve and publish candidate v2 in the current session
```

Gate 2 does not implement a successful Live GPT-5.6 path. Live analysis, `POST /api/analyze`, and API-key handling belong to Gate 3.

## 2. Canonical authority

Use only repository-local authorities, in this order:

1. Current direct user instruction
2. `AGENTS.md`
3. `docs/codex/SECURITY_BOUNDARY.md`
4. `docs/specs/GOVERNDIFF_REQUIREMENTS_DEFINITION_v1_2_2.md`
5. `docs/specs/GOVERNDIFF_BASIC_DESIGN_v1_0_0.md`
6. This reviewed plan and the current `docs/codex/HANDOFF.md`

External planning prompts are not product authorities and must not override the repository-local requirements or basic design.

## 3. Review of the supplied overview

The supplied overview correctly identifies the three-step product flow, Sample/Live separation, canonical fixture totals, approval invalidation, immutable baseline, evidence, and session-only publishing. The following corrections and clarifications are incorporated into this plan.

| Topic | Reviewed correction |
|---|---|
| State phases | Use all canonical phases, including `baseline_analyzing` and `candidate_analyzing`; do not replace them with a duplicated `pending` boolean. |
| Rule Diff | `ruleDiff` contains only modified/added/removed entries. For the canonical scenario it contains `EXP-RCT-001 modified` and `EXP-RID-001 added`; unchanged rules are omitted. |
| Text-only changes | A `sourceQuote` or message-only change is not a canonical rule behavior change under basic design 14.1. UI text diff and Rule Diff remain separate concepts. |
| Sample provenance | Do not invent or relabel capture provenance. The current three-asset capture decision is `gpt-5.4`; provenance may be `gpt-5.4` or `gpt-5.6` only when it exactly matches the model actually used. The assets require truthful, human-reviewed capture evidence or a separately authorized capture workflow before they can be committed. |
| Asset/compiler boundary | Sample JSON contains post-compiler canonical `PolicySpec` plus provenance, never raw model-facing `PolicyAnalysis`. Sample loading validates the canonical asset directly and does not compile it again. |
| Capture isolation | The current one-time `gpt-5.4` capture is a separately authorized human-reviewed task that sends policy/catalog data only, never CSV/record data; raw responses are transient and are not committed. |
| Capture sequencing | Approve capture before Gate 2A, implement/review the draft compiler bridge and canonical validator without network, execute capture as a separate authorized checkpoint, then integrate assets and finish Gate 2A. |
| Server boundary | Node filesystem loading must live in a `.server.ts` module or use an equivalent canonical server-only boundary before the loader is imported by `app/page.tsx`. |
| Quick actions | Baseline and candidate quick actions are pure, atomic, hash-checked functions and belong in Gate 2A, not in UI components. |
| Fixture guard | Startup validation must recompute the real `18 / 16 / 3 / 1 / 15` result from loaded specs and records. Expectation JSON is a guard, not the runtime source of truth. |
| Draft canonicalization | The current compiler rejects blocking ambiguity for readiness. Gate 2A must permit only the exact `draft-v1` five-rule/one-lodging-ambiguity form while continuing to reject ambiguity for resolved/candidate readiness. |
| Mode honesty | Gate 2 may render the Live option as unavailable, but it must never simulate or label a Sample result as Live. |
| Event contract | Use the exact basic-design event union. In particular, canonical `START_CANDIDATE` includes `text: string`; stale success/failure is discarded while current failure returns to the matching editing phase. |
| Guards and ownership | Central selectors own command/button eligibility. Compiler, loader, and snapshot/Impact factories own copy/freeze; the reducer never freezes or mutates event payloads. |
| Reset source | Store verified normalized `initialDraftText` as immutable initial configuration so payload-free reset/mode events can restore the exact built-in ambiguous draft without filesystem access or embedded literals. |
| Request freshness | The reducer rejects revision-mismatched responses. The Gate 2B controller separately rejects aborted or superseded same-revision requests using a local request sequence and `AbortController`. |
| Clean baseline | Gate 2A implementation begins only after Gate 1 closeout and these planning documents have a human-owned commit and the working tree is clean. |

## 4. Product flow

### Step 1 — Policy

- Render GovernDiff, the canonical tagline, the fictional-data notice, mode status, policy editor, and dataset summary.
- Start from the built-in ambiguous draft.
- In Sample Mode, analyze only an exact supported target-version/text-hash pair.
- Display the lodging ambiguity and block publication without inventing a threshold or lodging rule.
- Use an explicit pending phase and accessible status message.

### Step 2 — Review and baseline

- Show rules, ambiguity, unsupported statements, source sentences, conditions, and outcomes as separate concepts.
- Apply `Resolve to USD 275.00` as an atomic text-only quick action.
- Require re-analysis after the edit.
- Enable baseline approval only for a current six-rule analysis with no ambiguities or unsupported statements.
- Evaluate the same 48 records through the Gate 1 runtime and require exactly 18 Findings.
- Create an immutable, session-only `mfs-v1` release snapshot.
- Show baseline Findings and evidence without describing them as fraud, legal violations, automatic rejection, or expense processing.

### Step 3 — Impact and publish

- Start the candidate from a copy of the published v1 text.
- Apply all candidate metadata, threshold, and rideshare edits atomically.
- Require the normalized candidate hash to match the canonical v2 hash.
- Require a fresh current seven-rule analysis.
- Compute Impact against the same 48-record reference used for the baseline.
- Display `18 → 16`, removed `3`, added `1`, unchanged `15`, exact affected records, and the two canonical Rule Diff entries.
- Bind candidate approval to both revision and analysis ID.
- Publish only when approval and Impact are current.
- Retain immutable v1 and append v2 once; refresh resets the session.

## 5. Cross-cutting invariants

### Sample honesty

- Persistent label: `Sample Mode — precomputed policy analysis`.
- Sample metadata: `mode: "sample"`, `model: null`, `requestId: null`.
- Sample assets contain canonical `PolicySpec` plus truthful provenance; raw `PolicyAnalysis` is never a persisted Sample asset.
- The current three-asset capture uses `gpt-5.4`; `capturedFrom` may be `gpt-5.4` or `gpt-5.6` only when it truthfully names the actual capture model.
- Gate 3 Live Mode continues to use `gpt-5.6`. The `gpt-5.4` Sample capture neither satisfies nor replaces that integration.
- Unsupported text/target combinations fail with `SAMPLE_VARIANT_UNSUPPORTED`.
- Sample failures never fall back to fabricated success or a Live label.

### Determinism

- UI totals are derived from runtime/Impact results, never hard-coded as authoritative state.
- Startup and transition guards compare calculated results with frozen expectations.
- Repeated execution must produce identical Finding keys, ordering, rule diff, and totals.

### State integrity

- Policy edits increment revision and clear analysis, analysis metadata, approval, selected Finding when invalid, and dependent Impact.
- Accepted analysis start clears the target's prior analysis/metadata/approval and dependent Impact before invoking the analyzer, so failure cannot revive an old current analysis.
- Every successful analysis receives a new monotonically increasing analysis ID, including re-analysis of unchanged text.
- Late analysis results with a stale requested revision are discarded.
- Same-revision request freshness is owned by the controller: only the latest local request sequence may dispatch, and aborted/superseded results are silent discards.
- Stale success/failure leaves the entire state, including any current recoverable error, unchanged.
- Current analysis failure returns to its matching editing phase; other invalid transitions preserve domain data and set only a safe `STATE_TRANSITION_INVALID` error.
- Published releases exist only in `releases`; no duplicate release cache is maintained.
- Published snapshots share no mutable references with editor state.
- Pure selectors are the single source for command/button eligibility and include server-supplied immutable Live availability.
- Mode change/reset rebuilds baseline from immutable verified `initialDraftText`; it retains only the requested/current mode plus immutable server-supplied `liveModeAvailable` capability.

### Security and privacy

- No browser access to filesystem, API keys, Node-only modules, raw stack traces, or raw analysis payloads.
- No `dangerouslySetInnerHTML` or Markdown HTML renderer.
- No CSV row, expense ID, or employee email is sent externally.
- No analytics, telemetry, CDN dependency, email, payment, or SaaS action.

### Accessibility

- Visible labels and text status do not rely on color alone.
- Phase changes move focus to the new step heading.
- Pending completion uses `aria-live="polite"`; blocking errors use `role="alert"`.
- Evidence drawer traps focus, closes with Escape, and restores focus to the originating row action.
- Disabled controls have adjacent explanatory text.

## 6. Delivery slices

### Gate 2A — Sample and state foundation

**Slice status:** COMPLETE

Deliver:

- truthful, schema-validated Sample assets;
- a reviewed network-free compiler/validator foundation followed by a separately authorized capture checkpoint when assets are not supplied;
- server-only fixture loader and startup expectation guard;
- shared analyzer contract and Sample analyzer;
- atomic baseline/candidate quick actions;
- AppError contract;
- complete pure state/reducer model, copy/freeze factories, and guard selectors;
- focused unit and fixture tests.

Do not modify `app/**` or add product UI in Gate 2A.

Exit:

- all Sample variants match target plus normalized hash;
- unsupported combinations fail honestly;
- startup guard proves `18 / 16 / 3 / 1 / 15`;
- reducer tests prove invalidation, stale/current/invalid failure behavior, selector parity, release immutability, duplicate rejection, and guarded transitions;
- reducer tests prove reset/mode restoration from verified initial draft and old-analysis clearing at re-analysis start;
- full local validation passes.

Detailed plan: `docs/codex/GATE_2A_IMPLEMENTATION_PLAN.md`.

### Gate 2B — Policy, review, and baseline UI

**Slice status:** COMPLETE

Closure evidence: the exact credential-free baseline flow is implemented from the ambiguous Sample draft through five rules / one blocking lodging ambiguity, atomic USD 275.00 resolution, six rules / zero blocking ambiguity / zero unsupported statements, and one immutable `mfs-v1` with 18 Findings over 48 records. Automated validation passed 13 files / 111 tests, and human localhost acceptance passed keyboard flow, approximately 768px responsive behavior, safe unsupported-input recovery, and localhost-only network inspection. The development-only `favicon.ico` 404 is non-blocking and deferred. Gate 2C subsequently completed the full Sample flow; no push has occurred.

Deliver:

- dynamic server page loading the verified scenario;
- client workspace, step indicator, Sample label, disabled Live option, and reset behavior;
- policy editor and accessible analysis pending/error states;
- controller-owned local request sequencing and `AbortController` discard behavior without changing reducer events;
- ambiguity/rule review;
- baseline quick action wiring;
- baseline approval/runtime command;
- 18-Finding summary and table.

Exit:

- credential-free draft → ambiguity → resolved six-rule baseline → immutable v1/18 Findings flow works;
- component/controller tests prove superseded or aborted same-revision responses never dispatch;
- component/reducer tests and UI/build validation pass.

### Gate 2C — Impact, evidence, approval, and publish

**Slice status:** COMPLETE

Closure evidence: the exact published `mfs-v1` handoff starts the canonical `v2 / 1.1.0` seven-rule candidate, computes Findings `18 → 16` with 3 removed / 1 added / 15 unchanged, renders the exact receipt-modified/rideshare-added Rule Diff and affected records, and provides safe Evidence Drawer inspection. Current revision/analysis-bound approval guards immutable `mfs-v2`, which appends after the unchanged immutable v1 in session history. Three consecutive deterministic localhost flows plus one prior smoke flow passed keyboard, focus, Drawer, 1440px/768px responsive, safe-error/Reset, console, and localhost-only network checks. Final automated validation passed 14 files / 119 tests, lint, typecheck, production build, and `pnpm check`. Gate 2 is complete, Sample-only, and network-free; Gate 3 Live Mode planning is next. No push has occurred.

Deliver:

- candidate-start and atomic candidate-change wiring;
- candidate analysis and Impact command;
- canonical totals, affected records, and two Rule Diff entries;
- Evidence Drawer with keyboard/focus behavior;
- candidate approval and guarded session-only publish;
- immutable v1/v2 release history;
- responsive desktop layout, final accessibility pass, and manual Sample flow smoke test.

Exit:

- complete credential-free Sample flow passes from reset to v2 publish;
- refresh/reset behavior is honest;
- all automated and manual Gate 2 acceptance checks pass.

## 7. Validation strategy

Each implementation slice must run:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
git diff --check
git status --short
```

Gate 2C additionally requires a manual desktop-Chrome Sample flow covering:

1. Initial ambiguous draft
2. Blocking ambiguity with no lodging rule
3. Atomic USD 275.00 resolution and re-analysis
4. Baseline six rules and 18 Findings
5. Evidence open/close with focus restoration
6. Atomic candidate v2 change and re-analysis
7. Candidate 16 Findings and Impact `3 / 1 / 15`
8. New approval requirement
9. v1 retained and v2 published once
10. Refresh/reset disclosure and full session reset

Automated browser/E2E frameworks are not added for P0.

## 8. Gate 2 completion criteria

Gate 2 is complete only when all are true:

- API-key-free Sample Mode completes the full three-step flow.
- Sample is persistently and accurately labeled as precomputed.
- Draft ambiguity blocks readiness and does not emit the lodging rule.
- Resolved baseline has six rules and exactly 18 Findings.
- Candidate has seven rules and exactly 16 Findings.
- Impact is exactly removed 3, added 1, unchanged 15 with exact key parity.
- Rule Diff shows only modified receipt and added rideshare.
- Candidate requires a fresh approval bound to current revision and analysis ID.
- Candidate edit/re-analysis clears stale approval and Impact.
- Published v1 remains immutable while v2 is appended once.
- Evidence includes source sentence, observed values, expected condition, message, outcome, rule ID, and record ID.
- Accessibility behaviors in Section 5 pass manual verification.
- Gate 1 tests remain green and all new Gate 2 tests pass.
- `pnpm check` and production build pass.
- Human reviews the final diff and updates `HANDOFF.md` at closeout.

## 9. Explicit non-goals

Gate 2 excludes:

- OpenAI API calls and successful Live Mode;
- `POST /api/analyze` and `OPENAI_API_KEY` handling;
- database, authentication, localStorage, or persistent storage;
- arbitrary CSV upload or additional scenarios;
- cloud deployment, analytics, telemetry, or external actions;
- Codex App Server/runtime integration;
- mobile optimization, E2E framework installation, export, rollback, or revoke;
- README, video, Devpost, and submission polish.

## 10. Entry decisions and risks

1. **Sample provenance and sequencing:** resolved. The separately authorized one-time capture used `gpt-5.4`; three human-reviewed canonical assets are present, while runtime metadata remains Sample/null/null. Raw model output and capture-only tooling are absent. Gate 3 Live Mode remains a separate `gpt-5.6` integration.
2. **Server loader boundary:** resolved. Node filesystem access is isolated in `lib/demo/fixture-loader.server.ts`; the obsolete `lib/demo/load-demo-scenario.ts` path is absent.
3. **Baseline cleanliness:** resolved. Gate 2A is committed, and Gate 2B implementation began from human-owned commit `171691e567647086d9e8752bc10305f2ef514923` with an empty index and only its reviewed plan untracked.
4. **No dependency expansion:** the current exact dependency baseline is sufficient. A perceived need for a component library, state library, hash library, or E2E framework is a stop condition requiring separate approval.

## 11. Change control

- Every slice receives its own exact Add/Update/Move allowlist and validation report.
- Protected specs, frozen CSV/expectations, dependencies, configuration, and lockfile remain unchanged unless separately and exactly authorized.
- Do not begin Gate 2B before Gate 2A is reviewed and accepted.
- Gate 2C began only after Gate 2B was reviewed and accepted.
- Do not mark Gate 2 complete before the full Sample flow and closeout criteria pass.
- Gate 0, Gate 1, Gate 2, and Gate 3 are complete and accepted. The next phase is submission readiness and pre-push privacy audit; deployment and push are not implied.
