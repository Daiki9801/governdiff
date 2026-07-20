# GovernDiff — Devpost Submission Draft

```text
Draft status: READY FOR HUMAN FINALIZATION
Repository URL: https://github.com/Daiki9801/governdiff
Demo video URL: <DEMO_VIDEO_URL>
/feedback Session ID: enter in Devpost only; do not commit the value
```

## 1. Project name

GovernDiff

## 2. Tagline

Test policy changes before they ship.

## 3. Short description

GovernDiff helps operations teams understand what a written policy change will do before they publish it. GPT-5.6 structures policy language into a reviewable rule specification, while a deterministic local runtime compares published and candidate versions against the same synthetic records and shows exactly which review Findings are added or removed.

## 4. Detailed description

Operational policies often change as prose: a threshold is raised, a new exception is introduced, or an ambiguous phrase is clarified. Reviewers can compare the wording, but they still cannot see which records would be treated differently after publication.

GovernDiff treats a policy change like a release. It turns the policy into a typed specification, blocks unresolved supported ambiguities, publishes an immutable baseline, creates a separately reviewed candidate, and runs both versions over one fixed synthetic dataset. The result is an evidence-backed Impact Preview with exact removed, added, and unchanged Findings.

The built-in scenario contains 48 synthetic expense records across 12 reports and 8 fictional employees. The ambiguous draft produces five rules and one blocking ambiguity. Resolving the lodging threshold produces a six-rule baseline with 18 Findings. The candidate has seven rules and 16 Findings, yielding an Impact of 3 removed, 1 added, and 15 unchanged.

## 5. Problem

Policy owners and operations teams need to know the behavioral effect of a policy edit before release. Traditional document review shows text differences but not record-level consequences. Asking a language model to make final operational decisions would create a different risk: nondeterministic enforcement with weak auditability.

GovernDiff separates those responsibilities. AI structures the uncertain language. Deterministic code validates, evaluates, compares, and presents evidence. A human remains responsible for resolving ambiguity and approving the current candidate.

## 6. Solution

GovernDiff provides one focused flow:

1. Analyze a written policy and block on a supported ambiguity.
2. Resolve the ambiguity and publish an immutable baseline.
3. Create a candidate policy release.
4. Evaluate baseline and candidate against the same records.
5. Review Rule Diff, affected records, and Evidence.
6. Approve the current candidate and publish v2 without changing v1.

This makes policy-change governance concrete without performing payment, reimbursement, legal, compliance, fraud, or expense-approval decisions.

## 7. How it works

GovernDiff is one Next.js application with a server boundary and a deterministic domain core.

- A Server Component loads and verifies the built-in synthetic scenario.
- The Client workspace uses one reducer and one request-sequencing controller.
- Sample Mode returns human-reviewed, frozen precomputed specifications.
- Live Mode posts only policy text and target version to a strict same-origin route.
- A server-only analyzer uses exact `gpt-5.6` through the Responses API.
- The host validates schema, vocabulary, stable rule identity, source quotes, and canonical variant semantics.
- Pure TypeScript evaluates records and computes Findings, Rule Diff, and Impact.
- Approval is bound to the current candidate revision and analysis.
- Published v1 and v2 releases remain immutable in the current session.

## 8. GPT-5.6 usage

Live Mode uses exact `gpt-5.6` with `responses.parse`, strict Structured Outputs, reasoning effort `low`, `store: false`, zero SDK retries, and a server-only API key. GPT-5.6 receives the built-in synthetic policy text, target version, and static field/rule catalogs. It returns a constrained candidate policy structure; the host treats that output as untrusted until every local validation passes.

GPT-5.6 does not receive expense rows, employee data, Findings, Impact, Evidence, approvals, or releases, and it does not decide whether an expense should be approved or reimbursed.

A bounded real route-level smoke sent exactly three canonical GPT-5.6 requests—draft, baseline v1, and candidate v2. All three passed, with zero retries and no fourth request. The rendered Live UI was not rerun against the Real API; the complete UI/state flow is covered by the mocked three-call workflow and local acceptance.

## 9. Codex usage

Codex was the primary engineering collaborator across the core implementation and review task. Its concrete contributions included:

- reconciling canonical requirements and implementation plans;
- defining strict TypeScript contracts and host validation boundaries;
- implementing the deterministic policy compiler, runtime, Findings, and Impact engine;
- building state-transition, approval, immutability, abort, and stale-response guards;
- adding Sample and Live analyzers with strict browser/server separation;
- creating mocked route, client, analyzer, and complete workflow tests;
- reviewing privacy, dependency, error, and data-minimization boundaries;
- repeatedly validating canonical 5/6/7-rule and 18→16 / 3-1-15 results.

Codex also helped make the major engineering decisions explicit and testable: AI structures policy language but does not decide outcomes; the host owns stable rule identity and canonical validation; expense data remains local; Sample and Live provenance never blur together; and publication requires approval bound to the current candidate revision and analysis.

The required `/feedback` Session ID must come from the primary implementation/review task and must be entered directly in Devpost, not committed here.

## 10. Technologies

- Next.js 16 App Router
- React 19
- TypeScript 5.9 in strict mode
- OpenAI JavaScript SDK and Responses API
- Zod and strict Structured Outputs
- Vitest
- ESLint
- csv-parse
- pnpm
- Node.js 24 LTS

## 11. Architecture

```text
Server Component
  -> verified synthetic scenario
  -> boolean Live availability only
Client workspace
  -> one reducer + one analysis controller
  -> Sample analyzer or same-origin Live client
POST /api/analyze
  -> server-only GPT-5.6 analyzer
  -> strict schema + host compiler/canonical validation
Local domain core
  -> policy runtime -> Findings -> Impact -> Evidence
  -> immutable in-session release history
```

This boundary keeps model-assisted language structuring separate from deterministic operational logic.

## 12. Privacy and data handling

The demo uses a fictional company and synthetic policy/expense data only. Synthetic employee emails use the reserved `example.invalid` domain.

Live outbound dynamic data is limited to the built-in synthetic policy text and target version. Static developer instructions, a field catalog, and a rule catalog accompany it. GovernDiff does not send CSV bytes, expense records or identifiers, employee identifiers or emails, Findings, Impact, Evidence, approval state, or release history to OpenAI.

The API key exists only on the server process. The browser receives only a boolean availability signal and never imports the OpenAI SDK. The application has no database, authentication, upload, persistent project storage, analytics, or external business action. `store: false` is the Responses API request-storage setting, not a guarantee of zero provider-side operational retention.

## 13. Challenges

- Translating policy language without allowing the model to invent stable rule identity or business outcomes.
- Preserving deterministic behavior across Sample and Live analysis modes.
- Rejecting structurally valid but semantically noncanonical model output.
- Preventing stale or aborted analysis from becoming current.
- Showing record-level impact without sending those records to the model.
- Keeping the Build Week P0 narrow enough for strict testing and an honest local demo.

## 14. Accomplishments

- One coherent flow from ambiguous draft through immutable v1 and v2 releases.
- Exact canonical results: 5/6/7 rules, 18→16 Findings, and 3 removed / 1 added / 15 unchanged.
- Evidence-backed Rule Diff and affected-record review.
- Server-only GPT-5.6 integration with strict Structured Outputs and fail-closed validation.
- Credential-free, network-free Sample Mode.
- Audited baseline of 18 test files and 180 passing tests.
- Three of three bounded real route-level GPT-5.6 analyses passed with no retry.

## 15. What was learned

AI is most useful here when it structures uncertain language under a narrow contract, not when it owns final enforcement. Stable host-defined identifiers, exact source evidence, deterministic evaluation, immutable releases, and human approval make the AI contribution reviewable rather than opaque.

The same separation also creates a strong privacy boundary: a model can help interpret synthetic policy text without receiving the records used to test that policy.

## 16. What is next

GovernDiff is intentionally a local Build Week demo. Future work could generalize the supported policy vocabulary, add explicitly designed persistence and authentication, and support additional synthetic scenarios. Those changes would require new privacy, security, migration, and authorization design; they are not claims about the current build.

## 17. License

GovernDiff is licensed under the MIT License.

Principal frameworks and libraries are used under their respective licenses. Their inclusion does not imply vendor endorsement.

## 18. Human-only placeholders

```text
Judging repository state: public MIT repository

GitHub owner/organization: Daiki9801
Repository name: governdiff
Repository visibility: public
Repository URL: https://github.com/Daiki9801/governdiff
Demo video URL: <DEMO_VIDEO_URL>
/feedback Session ID: enter in Devpost only; do not commit the value
Submission timestamp: <HUMAN_INPUT_REQUIRED>
```

`/feedback` handling decision: `DEVPOST_ONLY`. Use the primary Codex implementation/review task, capture only the Session ID, and do not copy transcript or private task context into submission materials.

## 19. Final submission checklist

- [ ] Work and Productivity category selected.
- [ ] Project name, tagline, short description, and detailed description finalized.
- [ ] Technology list and architecture claims checked against the repository.
- [ ] Privacy/data disclosure retained without a zero-retention claim.
- [x] Repository owner/organization and name confirmed.
- [x] Repository visibility confirmed.
- [ ] Public repository URL entered in Devpost.
- [x] MIT `LICENSE` included in the publication snapshot.
- [ ] Clean-clone installation and free Sample testing path verified.
- [x] Selected screenshots reviewed for synthetic-only content and sensitive surfaces.
- [ ] Public demo video URL entered.
- [ ] Video duration confirmed under three minutes.
- [ ] Video has English narration and no copyrighted music.
- [ ] Video claims match the implemented canonical results.
- [ ] `/feedback` Session ID entered directly in Devpost and not committed.
- [ ] README and submission copy receive final spelling and claim review.
- [ ] Final pre-push privacy and asset review passes.
- [ ] Submission completed before the deadline and timestamp recorded privately.
