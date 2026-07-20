# GovernDiff — Submission Documentation and Asset Plan

## 1. Status and decision

**Planning status:** COMPLETE

**Implementation status:** COMPLETE

**Documentation validation status:** PASS

**Screenshot capture status:** NOT STARTED

**Video recording status:** NOT STARTED

**`/feedback` Session ID status:** MISSING

**Repository remote status:** NOT CONFIGURED

**Closure status:** VALIDATED

**Decision:** Complete the repository-authored submission package in one documentation-only mutation. Replace the obsolete Gate 0 README, redact the five current machine-local paths, and add three non-overlapping submission documents. Screenshot capture, video recording/upload, `/feedback`, remote creation, and form submission remain explicit human-only follow-up actions.

## 2. Authority and baseline

Authority order:

1. Current direct human instruction
2. `AGENTS.md`
3. `docs/codex/SECURITY_BOUNDARY.md`
4. `docs/specs/GOVERNDIFF_REQUIREMENTS_DEFINITION_v1_2_2.md`
5. `docs/specs/GOVERNDIFF_BASIC_DESIGN_v1_0_0.md`
6. Approved Gate plans
7. `docs/codex/HANDOFF.md`
8. Committed implementation
9. Accepted pre-push privacy audit

Verified planning baseline:

```text
repository: <repository-root>
branch: master
HEAD: 08aa4ad54fc6a2a97de24ba656135c8d3ed7544f
subject: feat: complete Gate 3 Live GPT-5.6 integration
working tree before planning: clean
index before planning: empty
untracked before planning: none
remote: none
Basic Design SHA-256: 6CC55AAA6C53437F2294D85AF48AC70AB5194B94CE68C7EDE699E2C0C9382B13
tests at audited baseline: 18 files / 180 tests PASS
```

Product implementation status:

```text
Gate 0: COMPLETE
Gate 1: COMPLETE
Gate 2: COMPLETE
Gate 3: COMPLETE
Product implementation gates: COMPLETE
```

## 3. Accepted privacy-audit findings

The accepted privacy verdict is `PRIVACY_PASS_WITH_REDACTIONS_REQUIRED`.

- No actual secret, private key, credential-bearing URL, committed `.env*`, private data, or private-looking commit email exists in the current tree or reachable history.
- History rewrite is not required.
- The three Sample asset request IDs remain intentional provenance and are kept. Their values must not be copied into public submission prose.
- Real GPT-5.6 smoke request ID values were not recorded.
- The current tree contains exactly five machine-local absolute-path occurrences in five internal Codex documents.
- The Git identity uses a privacy-preserving GitHub noreply address.
- `LICENSE` and `package.json` consistently declare MIT.

This plan rechecks only the facts necessary to define the next mutation. It does not reopen or repeat the full privacy audit.

## 4. Submission objective

The next mutation must leave GovernDiff understandable, reproducible, and honestly represented to a first-time public reviewer without changing application behavior.

The documentation must make these facts immediately clear:

- GovernDiff tests policy changes before publication.
- Sample Mode is precomputed, credential-free, deterministic, and works without network access.
- Live Mode uses exact `gpt-5.6` to structure policy text through the Responses API with strict Structured Outputs and `store: false`.
- GPT-5.6 does not compute Findings or Impact and does not receive CSV rows, ExpenseRecords, employee data, Findings, Impact, Evidence, approvals, or releases.
- Pure local TypeScript evaluates the same 48 synthetic records and computes canonical Findings and Impact.
- The canonical flow is baseline 18 Findings, candidate 16 Findings, with 3 removed / 1 added / 15 unchanged.
- The product is a local-only Build Week demo; deployment is not provided.

## 5. In scope

The next documentation mutation includes only:

1. Updating `README.md` from Gate 0 scaffold copy to the completed Gate 3 public README.
2. Replacing the exact five current machine-local paths with context-preserving repository-root language.
3. Adding one offline Devpost draft that also owns the reusable privacy disclosure, architecture summary, human placeholders, and final submission checklist.
4. Adding one under-three-minute demo video script.
5. Adding one screenshot shot list.
6. Running documentation, scope, privacy, consistency, and final pre-push checks without network access.

## 6. Out of scope

- Application source, tests, fixtures, Sample assets, configuration, dependencies, lockfile, or canonical specification changes.
- Screenshot capture or image editing.
- Video recording, editing, upload, or YouTube access.
- Executing `/feedback` or inventing a Session ID.
- Entering a Session ID in a repository file.
- Creating a Git remote or repository, choosing an owner/organization, or pushing.
- Opening GitHub, Devpost, OpenAI, YouTube, or any other network service.
- Real OpenAI API calls; the approved request budget is exhausted.
- History rewrite or historical path redaction.
- Deployment, favicon work, P1 product polish, or online advisory checks.

## 7. Exact local-path redaction inventory

The accepted and reverified inventory is exactly five files and five occurrences. The username is deliberately redacted below.

| Repository-relative path | Occurrences | Context category | Current redacted pattern | Exact replacement | Meaning changes? |
|---|---:|---|---|---|---|
| `docs/codex/GATE_1_IMPLEMENTATION_REPORT.md` | 1 | Report header | machine-local repository root (redacted) | `**Repository:** \`<repository-root>\`` | No; the repository identity remains explicit without machine ownership. |
| `docs/codex/GATE_2A_IMPLEMENTATION_PLAN.md` | 1 | Verified baseline code block | machine-local repository root (redacted) | `resolved Git root == <repository-root>` | No; it still records root equality. |
| `docs/codex/GATE_2B_IMPLEMENTATION_PLAN.md` | 1 | Baseline code block | machine-local repository root (redacted) | `repository: <repository-root>` | No. |
| `docs/codex/GATE_2C_IMPLEMENTATION_PLAN.md` | 1 | Baseline code block | machine-local repository root (redacted) | `repository: <repository-root>` | No. |
| `docs/codex/GATE_3_IMPLEMENTATION_PLAN.md` | 1 | Baseline code block | machine-local repository root (redacted) | `repository: <repository-root>` | No. |

Implementation rules:

- Patch the five literal occurrences individually; do not run a repository-wide replacement.
- Do not alter historical commits.
- Do not change any executable command or source path.
- Recount before and after mutation. A pre-mutation count/path mismatch is `BLOCKED_REDACTION_INVENTORY_MISMATCH`.
- After mutation, the current tracked/untracked documentation set must contain zero machine-local Windows, macOS, or Linux home-directory roots.

## 8. README target design

`README.md` is public-facing, English-primary, concise enough for a reviewer, and complete enough for a clean clone. Replace obsolete Gate 0 claims instead of appending corrections below them.

Required section order:

1. `# GovernDiff`
2. Tagline: `Test policy changes before they ship.`
3. `What GovernDiff does`
4. `The problem`
5. `Key capabilities`
6. `Sample Mode`
7. `Live GPT-5.6 Mode`
8. `Why GPT-5.6 is meaningful`
9. `Architecture`
10. `Data and privacy boundary`
11. `Prerequisites`
12. `Install`
13. `Run without an API key`
14. `Run with a server-side API key`
15. `Complete demo flow`
16. `Validation and tests`
17. `Canonical expected results`
18. `Security model`
19. `Limitations`
20. `Synthetic-data disclosure`
21. `Repository status`
22. `License`
23. `OpenAI Build Week`

Required factual content:

- Node.js `>=24.18.0 <25` and pnpm `11.6.0`.
- `pnpm install --frozen-lockfile`, `pnpm dev`, and `pnpm check`.
- The audited baseline is 18 test files / 180 tests, while noting that future changes may increase the count.
- Sample Mode needs no key and makes no application/OpenAI request.
- Sample assets were captured once with `gpt-5.4`, human-reviewed, canonicalized, and are always labeled precomputed. This provenance neither impersonates nor replaces Live `gpt-5.6`.
- Live Mode uses exact `gpt-5.6`, Responses API `responses.parse`, strict Structured Outputs, reasoning effort low, `store: false`, zero SDK retries, and a server-only key boundary.
- The Client receives only a boolean Live-availability signal; `NEXT_PUBLIC_OPENAI_API_KEY` must never be used.
- GPT-5.6 structures policy text only. CSV records, employee data, Findings, Impact, Evidence, approvals, and releases remain local and are not sent.
- Real route-level smoke completed exactly three canonical requests successfully: draft, v1, and v2. No retry or fourth request occurred. Do not include request ID values.
- Dataset: 48 records, 12 reports, 8 synthetic employees.
- Canonical flow: ambiguous draft 5 rules / 1 blocking ambiguity; baseline 6 rules / 18 Findings; candidate 7 rules / 16 Findings; Impact 3 removed / 1 added / 15 unchanged.
- The app is local-only and has no database, authentication, persistence, upload, external business action, or deployment.
- MIT license and Build Week Work and Productivity context.

Media rule:

- The immediate documentation mutation must not add Markdown image/video links because no approved media file or public video URL exists yet.
- README media links may be added only after the target exists and a later exact path/URL review passes.
- Plain text may say that demo media will be linked after publication, but the cleaner default is to omit the section until an asset exists.

README must not:

- Claim deployment, production readiness, generalized policy support, zero provider retention, legal/compliance judgment, expense approval, or reimbursement action.
- Expose request IDs, response IDs, token usage, raw model output, policy payloads beyond the visible synthetic scenario, or a key.
- Suggest `.env.local`, browser key entry, `NEXT_PUBLIC_*`, or committing any secret.
- Claim automatic Sample fallback after a Live failure.
- Claim current online vulnerability/advisory freshness.
- Contain a machine-local absolute path or broken asset link.

## 9. Setup and reproducibility instructions

Public setup belongs in README only. A separate setup document would duplicate the quick-start path and the existing Gate 0 environment pack is historical/internal rather than the public runtime guide.

Clean-clone commands:

```text
git clone <repository-url> governdiff
cd governdiff
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm dev
```

Expected default URL: `http://localhost:3000`.

No-key Sample flow:

1. Ensure the current process has no `OPENAI_API_KEY`.
2. Run `pnpm dev`.
3. Open the localhost URL.
4. Use Sample Mode. Live remains visibly unavailable; the Sample flow remains fully functional and network-free.

Do not show an unsafe literal API-key assignment. The PowerShell example must prompt interactively so the secret does not appear in source or shell history:

```powershell
$liveKey = Read-Host "OpenAI API key" -AsSecureString
$liveCredential = [System.Management.Automation.PSCredential]::new("OpenAI", $liveKey)
$env:OPENAI_API_KEY = $liveCredential.GetNetworkCredential().Password
Remove-Variable liveKey, liveCredential
pnpm dev
```

Required explanation:

- The environment variable exists only in that terminal process and its descendants.
- Do not use `.env.local` for this project, paste the key into a committed command/file, put it in the browser, or use `NEXT_PUBLIC_OPENAI_API_KEY`.
- Stop the server with `Ctrl+C`, then clear process-scoped variables without printing them:

```powershell
Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:PORT -ErrorAction SilentlyContinue
```

Port conflict handling:

```text
pnpm exec next dev --port 3107
```

Validation:

```text
pnpm check
```

Clarify that builds and Sample Mode do not require a key. Live failure stays a Live failure; switching to Sample Mode is an explicit user choice, never an automatic fallback.

## 10. Submission documentation package

Select exactly three new submission documents.

### `docs/submission/DEVPOST_SUBMISSION_DRAFT.md`

- **Purpose:** Own all offline Devpost copy, reusable privacy disclosure, compact architecture summary, human-only placeholders, and the final submission checklist.
- **Audience:** Project owner/reviewer preparing the Devpost form; safe to keep in a public repository while placeholders remain.
- **Required sections:** Project fields, problem, solution, workflow, GPT-5.6, Codex, technologies, architecture, privacy/data, challenges, accomplishments, lessons, next steps, license, human-input placeholders, and final checklist.
- **Sources:** Canonical requirements/basic design, completed Gate plans, `HANDOFF.md`, package manifest, README target contract, and accepted privacy audit.
- **Placeholders:** `<REPOSITORY_URL>`, `<DEMO_VIDEO_URL>`, and a non-value marker stating `/feedback Session ID: enter in Devpost only; do not commit the value`.
- **Acceptance:** English-primary, accurate, concise, no unverified deployment/retention claim, no identifier value, no secret, and all human-only fields visibly marked.

### `docs/submission/DEMO_VIDEO_SCRIPT.md`

- **Purpose:** Provide a timed English narration and exact screen-action script under three minutes.
- **Audience:** Project owner recording/editing the public video.
- **Required sections:** Safety checklist, capture setup, 2:48 timeline, scene table, Live proof decision, cut points, contingencies, and final media review.
- **Sources:** Canonical demo flow, completed Sample UI, Gate 3 closure evidence, and screenshot plan.
- **Placeholders:** `<PUBLIC_VIDEO_URL>` only after upload; no request ID or key placeholder.
- **Acceptance:** Total planned duration at most 2:50, every canonical result shown or narrated once, no new API request assumed, no sensitive surface visible.

### `docs/submission/SCREENSHOT_SHOTLIST.md`

- **Purpose:** Define the smallest useful set of stills, capture state, viewport, proof, exclusions, and intended placement.
- **Audience:** Project owner capturing and selecting repository/Devpost media.
- **Required sections:** Global capture rules, required shots, conditional Live proof shot, filename convention, sanitization review, proposed later repository paths, and selection checklist.
- **Sources:** Completed UI flow and canonical 18→16 / 3-1-15 results.
- **Placeholders:** Capture status only; no URLs or identifiers.
- **Acceptance:** Every shot is reproducible from Sample Mode unless explicitly conditional, contains only synthetic application data, and has no browser/terminal/DevTools/secret surface.

Files considered but not needed:

- `docs/submission/SUBMISSION_CHECKLIST.md`: merge into `DEVPOST_SUBMISSION_DRAFT.md`.
- `docs/submission/PRIVACY_AND_DATA_DISCLOSURE.md`: merge exact reusable copy into README and Devpost draft.
- `docs/submission/TECHNICAL_ARCHITECTURE_SUMMARY.md`: merge the 60-second architecture into README and Devpost draft.

This avoids four overlapping sources of truth while keeping the video and screenshot workflows operationally separate.

## 11. Devpost content contract

`docs/submission/DEVPOST_SUBMISSION_DRAFT.md` must prepare these exact fields offline:

1. Project name
2. Tagline
3. Short description
4. Detailed description
5. Problem
6. Solution
7. How it works
8. GPT-5.6 usage
9. Codex usage
10. Technologies
11. Architecture
12. Privacy and data handling
13. Challenges
14. Accomplishments
15. What was learned
16. What is next
17. Repository URL placeholder
18. Demo/video URL placeholder
19. `/feedback` handling marker
20. License
21. Final submission checklist

Content rules:

- Use English primary copy and globally understandable policy-change governance framing.
- State that GPT-5.6 converts policy language into a reviewable typed rule specification; it does not execute the business policy.
- State that Sample assets were captured with `gpt-5.4`, reviewed, frozen, and labeled precomputed.
- State that deterministic local TypeScript computes Findings and Impact from synthetic data.
- State that no raw expense rows, employee emails, Findings, Impact, Evidence, approvals, or releases are sent to OpenAI.
- State that the Real GPT-5.6 verification was a bounded route-level smoke of exactly three canonical requests, all successful, with zero retry. Do not imply a rendered Live UI Real API recording.
- Include the canonical counts and Rule Diff meaning without inflating them into compliance or reimbursement decisions.
- Explain Codex's concrete contribution: typed domain/contracts, deterministic engine, state guards, boundary tests, Live adapter, and strict review.
- Do not include Japan-only framing, a deployment claim, online advisory freshness, request ID values, raw model output, or a zero-provider-retention promise.

Human input required later:

- GitHub owner/organization, repository name, visibility, and final public URL.
- Public video URL.
- `/feedback` Session ID, entered directly into Devpost and never substituted into the committed draft.
- Final category/form confirmations and submission timestamp.

## 12. Demo video contract

Target total duration: **2:48**, hard maximum **2:59**.

| Time | Screen action | Narration beat | On-screen proof | Cut point / contingency |
|---|---|---|---|---|
| 0:00–0:12 | Open initial GovernDiff workspace | Problem and tagline: test policy changes before they ship | Product name, tagline, fictional-data notice | Use title card if first paint is slow. |
| 0:12–0:25 | Point to Sample Mode and dataset summary | No-key, precomputed Sample Mode evaluates synthetic data locally | Sample label; 48 records / 12 reports | Do not show browser network/DevTools. |
| 0:25–0:40 | Analyze ambiguous draft | Ambiguous language blocks publication | 5 rules, 1 blocking ambiguity, 0 unsupported | Cut loading wait; retain final status. |
| 0:40–0:54 | Apply USD 275 resolution and re-analyze | Human resolves ambiguity explicitly | Resolved threshold; 6 rules / 0 ambiguity | If animation stalls, hard cut after action. |
| 0:54–1:10 | Approve/publish baseline | Deterministic runtime creates immutable v1 | `mfs-v1`, 18 Findings | Keep synthetic notice visible where practical. |
| 1:10–1:25 | Start/apply candidate v2 | Candidate raises receipt threshold and adds rideshare rule | 7 rules; version 1.1.0 | Cut editor typing; show atomic result. |
| 1:25–1:45 | Compute Impact and Rule Diff | Same records reveal exact behavior change | 18→16; 3 removed / 1 added / 15 unchanged; two rule changes | Hold result long enough to read. |
| 1:45–2:02 | Open removed then added Evidence | Evidence connects rule, record, expected condition, and source | Safe synthetic Evidence Drawer | Use one quick cut between evidence states. |
| 2:02–2:18 | Approve and publish candidate | Approval is current-revision bound; v1 stays immutable | Ordered v1→v2 release history | Re-record scene locally if focus is lost; no API needed. |
| 2:18–2:36 | Show approved Live proof asset or honest evidence slate | GPT-5.6 structures policy only; bounded real route smoke passed 3/3 | Exact `gpt-5.6`, Responses API, strict schema, 3/3 route-level verification | Never make another request. Use the fallback slate below if no prior safe capture exists. |
| 2:36–2:48 | Return to final Impact/history screen | Closing value and privacy boundary | 3/1/15, local deterministic evaluation, MIT repository | End before 2:50. |

Failure contingencies:

- Record the deterministic Sample flow in segments and edit out loading time; do not retry a Real API call.
- If a Sample action fails, reset and re-record locally. Do not show error traces or DevTools.
- If no prior sanitized Live capture exists, use a clearly labeled evidence slate: `Real GPT-5.6 route-level smoke completed: 3/3 canonical analyses PASS; rendered Live UI real smoke was not rerun.` Back it with committed closure evidence, not a fabricated UI result.
- Do not show an unavailable Live selector as proof of a successful real call.
- No key, request/response ID, raw response, token usage, terminal secret, environment list, or browser developer tools may appear.
- Use no copyrighted background music.

## 13. Screenshot shot list

Capture first to a human-controlled repository-external location. Use PNG, 1440×900 viewport unless a crop is explicitly chosen, consistent browser zoom, and no browser profile/account chrome.

| Filename | Phase | Visible proof | Sensitive areas to exclude | Intended use |
|---|---|---|---|---|
| `01-sample-ambiguity.png` | Draft blocked | Sample label, synthetic notice, 5 rules, 1 blocking ambiguity | Browser account chrome, terminal, unrelated desktop | README hero candidate / Devpost flow |
| `02-baseline-v1-18-findings.png` | Baseline published | Immutable `mfs-v1`, 6 rules, 18 Findings | Any debug/console surface | Devpost implementation proof |
| `03-candidate-v2-seven-rules.png` | Candidate ready | v2 / 1.1.0, 7 rules, receipt USD 150, rideshare rule | Editor selection artifacts if distracting | Devpost solution flow |
| `04-impact-18-to-16.png` | Impact computed | 18→16, 3 removed / 1 added / 15 unchanged, Rule Diff | Browser/terminal outside application | Primary Devpost screenshot / README later |
| `05-evidence-removed.png` | Evidence Drawer | One removed synthetic Finding with source/expected/observed evidence | Any email beyond the fictional reserved-domain display already in product; crop if unnecessary | Trust/explainability proof |
| `06-evidence-added.png` | Evidence Drawer | Added rideshare Finding and safe synthetic evidence | Same exclusions as above | Trust/explainability proof |
| `07-release-history-v1-v2.png` | Published | Immutable ordered v1→v2 history and final state | No developer tools | Completion proof |
| `08-live-gpt56-proof.png` | Conditional | Only an already-existing sanitized Live proof or approved evidence slate | Key, request IDs, raw output, token usage, terminal/env/DevTools | Video/Devpost only after human review |

Minimum publication set: 01, 02, 04, 05 or 06, and 07. Shot 03 is useful when rule semantics need separate proof. Shot 08 is conditional and must not trigger a new API request.

Proposed later repository paths, not authorized in the immediate documentation mutation:

```text
docs/assets/screenshots/01-sample-ambiguity.png
docs/assets/screenshots/02-baseline-v1-18-findings.png
docs/assets/screenshots/03-candidate-v2-seven-rules.png
docs/assets/screenshots/04-impact-18-to-16.png
docs/assets/screenshots/05-evidence-removed.png
docs/assets/screenshots/06-evidence-added.png
docs/assets/screenshots/07-release-history-v1-v2.png
docs/assets/screenshots/08-live-gpt56-proof.png
```

Only selected, reviewed files should receive a later exact add authorization. Do not add all shots automatically.

## 14. Live GPT-5.6 proof strategy

No new OpenAI request is allowed or needed. The request budget is exhausted.

Priority order:

1. If the human already possesses a sanitized capture from the completed route-level smoke, review it for key, identifier, payload, terminal, and token-usage exposure before use.
2. Otherwise use the honest evidence slate defined in Section 12 plus committed Gate 3 closure facts and mocked three-call UI/state coverage.
3. Do not simulate a successful rendered Live call, relabel Sample as Live, or show an unavailable selector as success.

The choice between an existing safe capture and the evidence slate is `HUMAN_DECISION_REQUIRED`, but it does not block the documentation mutation because both options and the no-new-request rule are fully specified.

## 15. `/feedback` Session ID handling

Decision: `DEVPOST_ONLY`.

- Obtain the ID by running `/feedback` in the primary Codex task that contains the majority of core GovernDiff implementation and review work.
- Do not use a planning-only or unrelated task.
- Capture only the returned Session ID; do not copy transcript content, user/private context, attachments, or unrelated task metadata.
- Keep the committed Devpost draft marker value-free: `/feedback Session ID: enter in Devpost only; do not commit the value`.
- Enter the value directly into the required Devpost field or a human-controlled private submission worksheet.
- Do not commit the value to README, submission docs, screenshots, video, logs, or Git history.

Rationale: the ID is required submission metadata, not a public project feature or reproducibility input. Keeping it Devpost-only minimizes correlation with unrelated task context.

## 16. Repository publication decision

Recommendation: **private until final audit**, then public for judging.

The accepted audit found no secret/history blocker and no need for history rewrite, so public publication is appropriate after the documentation mutation, path rescan, asset review, and final pre-push gate pass.

Human decisions required later:

- GitHub owner or organization.
- Repository name.
- Final public/private visibility.
- Remote URL.
- If private, exact judge access recipients and whether private access satisfies current rules.

Because canonical submission guidance prefers a public repository with a relevant license and MIT is ready, the target end state is public. No remote creation or push belongs to the documentation mutation.

## 17. License and attribution

- Keep existing `LICENSE` unchanged.
- README must say: `Licensed under the MIT License. See LICENSE.`
- `package.json` already declares `MIT`; do not change it.
- Principal technologies may be listed factually: Next.js, React, TypeScript, OpenAI JavaScript SDK, Zod, Vitest, ESLint, csv-parse, and pnpm.
- Do not imply vendor endorsement.
- Do not create `NOTICE` or `THIRD_PARTY_NOTICES` without new evidence that one is required.

## 18. Exact file allowlist

### Files to modify — exact 6

```text
README.md
docs/codex/GATE_1_IMPLEMENTATION_REPORT.md
docs/codex/GATE_2A_IMPLEMENTATION_PLAN.md
docs/codex/GATE_2B_IMPLEMENTATION_PLAN.md
docs/codex/GATE_2C_IMPLEMENTATION_PLAN.md
docs/codex/GATE_3_IMPLEMENTATION_PLAN.md
```

### Files to add — exact 3

```text
docs/submission/DEVPOST_SUBMISSION_DRAFT.md
docs/submission/DEMO_VIDEO_SCRIPT.md
docs/submission/SCREENSHOT_SHOTLIST.md
```

### Planning input retained unchanged during that mutation

```text
docs/codex/SUBMISSION_DOCUMENTATION_AND_ASSET_PLAN.md
```

### Human-generated assets to add later — not in the immediate mutation allowlist

Only individually selected paths from Section 13 after capture and privacy review. Video remains an external public-video deliverable; do not commit a large video binary.

### Files considered but not needed

```text
docs/submission/SUBMISSION_CHECKLIST.md
docs/submission/PRIVACY_AND_DATA_DISCLOSURE.md
docs/submission/TECHNICAL_ARCHITECTURE_SUMMARY.md
```

Their responsibilities are deliberately consolidated into README and `DEVPOST_SUBMISSION_DRAFT.md`.

## 19. Protected paths

Do not modify in the documentation mutation:

```text
.git/**
.codex/**
AGENTS.md
docs/specs/**
docs/codex/SECURITY_BOUNDARY.md
app/**
components/**
lib/**
tests/**
demo/**
tools/**
.env*
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
next.config.ts
tsconfig.json
vitest.config.ts
eslint.config.mjs
LICENSE
```

No deletion, move, rename, history rewrite, dependency action, remote action, or project-outside write is authorized.

## 20. Validation strategy

The next task is documentation-only. `pnpm check` is not required because source, tests, package/configuration, fixtures, and lockfile are excluded and commit `08aa4ad` already has an audited 180-test validation baseline. Instead, validate the documentation against committed sources.

Required checks:

1. **Markdown structure:** headings are ordered, code fences are balanced, tables render coherently, and files end with one newline. No formatter write.
2. **Exact scope:** `git status --porcelain=v1 -uall` resolves to the exact six modified and three added paths, plus the pre-existing untracked plan if it has not yet been committed. No other path.
3. **Diff quality:** `git diff --check` passes; inspect `git diff -- <exact paths>`.
4. **No local path:** in-memory/`rg` scan current tracked and task-added text for machine-local Windows, macOS, and Linux home-directory roots; expected zero. `<repository-root>` is allowed.
5. **Secret/privacy:** path-only scan for high-confidence key/token/private-key/credential-URL patterns. Generic matches must be reviewed without printing values.
6. **Request-ID non-duplication:** new/updated public docs contain no literal `req_...` or `resp_...` value. The words `request ID` are allowed. Existing three Sample asset provenance values remain unchanged.
7. **README command consistency:** compare every documented command/script with `package.json`; compare Node/pnpm values with `package.json`, `.node-version`, and `docs/codex/DEPENDENCY_BASELINE.md`.
8. **Result consistency:** compare 180 tests and canonical 5/6/7 rules, 18→16 Findings, and 3/1/15 Impact against `HANDOFF.md`, fixtures, and Gate closure docs.
9. **Link/path validation:** every repository-relative Markdown link target must exist. No network link checker.
10. **No broken image links:** immediate docs contain no Markdown image reference unless its local target already exists. Expected: no new image links.
11. **Protected integrity:** `git diff --name-only` contains no source/test/spec/fixture/asset/dependency/config/lockfile/security path.
12. **Index:** `git diff --cached --name-only` remains empty until separate staging approval.

The final pre-push gate, after human screenshots/video/feedback/URL work, must separately require:

- Re-run the full current-tree privacy scan and local-path scan.
- Review selected screenshots frame by frame for identifiers, browser chrome, terminal, DevTools, and secrets.
- Review the entire final video and thumbnail for the same surfaces and verify duration under three minutes.
- Verify public repository URL, public video URL, Devpost copy, Work and Productivity category, license, `/feedback` Devpost field, and free testing path.
- Verify working tree/index scope, review the final staged diff under separate authorization, and only then authorize remote creation/push.

## 21. Acceptance criteria

The documentation mutation is complete only when all are true:

1. README reflects completed Gate 3 behavior and contains no old Gate 0 status claim.
2. README gives accurate clean-clone, install, no-key, optional Live, test, port, and shutdown instructions.
3. All five current machine-local paths are replaced exactly and no current absolute user path remains.
4. API-key instructions are server/process-only, interactive, value-free, and do not introduce `.env.local` or `NEXT_PUBLIC_*` use.
5. Sample and Live modes are truthfully distinct; Live failure has no automatic Sample fallback.
6. GPT-5.4 Sample provenance and exact GPT-5.6 Live use are both honest.
7. Responses API, strict Structured Outputs, `store: false`, and the data-minimization boundary are accurate without a zero-retention promise.
8. Canonical 5/6/7 rules, 18→16 Findings, and 3/1/15 Impact are accurate.
9. MIT license, synthetic-data notice, local-only status, and limitations are documented.
10. Devpost draft is complete except clearly marked human-only URL/form inputs.
11. `/feedback` value is absent from repository content and handling is `DEVPOST_ONLY`.
12. Demo video script targets 2:48 and assumes zero new OpenAI requests.
13. Screenshot plan defines the minimum high-value set and conditional Live proof without authorizing files.
14. Privacy disclosure states exactly what is and is not sent.
15. Final submission checklist is present in the Devpost draft.
16. No request ID value is copied into new/updated docs.
17. No broken local links or image references exist.
18. Only the exact nine immediate mutation paths change.
19. Protected files remain unchanged.
20. Index stays empty and no stage, commit, remote, push, or network action occurs.

## 22. Implementation sequence

1. Reconfirm baseline HEAD, clean index, the untracked plan identity, and exact five-occurrence redaction inventory.
2. Patch each local path individually with its Section 7 replacement.
3. Replace README with the Section 8 structure and Section 9 commands.
4. Add `DEVPOST_SUBMISSION_DRAFT.md`, including reusable privacy/architecture copy, placeholders, and checklist.
5. Add `DEMO_VIDEO_SCRIPT.md` with the exact 2:48 timeline and no-new-request Live proof alternatives.
6. Add `SCREENSHOT_SHOTLIST.md` with required/conditional shots and no repository asset creation.
7. Run all Section 20 documentation checks.
8. Strictly review the exact nine-path diff for truthfulness, duplication, unsafe instructions, identifiers, and scope.
9. Report and stop. Do not capture media, execute `/feedback`, create a remote, stage, commit, or push.

## 23. Risks and mitigations

| Risk | Mitigation |
|---|---|
| README preserves obsolete Gate 0 claims | Replace the status narrative and explicitly scan for `not implemented`, `no lockfile`, and `installation has not` claims. |
| Key instructions leak a value into history | Use interactive secure prompt and process scope; never show a literal value or `.env.local`. |
| Sample capture is mislabeled as GPT-5.6 | State exact `gpt-5.4` precomputed provenance and exact `gpt-5.6` Live runtime separately. |
| Live failure silently becomes Sample | Document explicit mode switching and no automatic fallback. |
| `store: false` is overstated | Describe request storage configuration only; do not promise zero provider operational retention. |
| Devpost copy implies AI decides expenses | State that GPT structures policy text and local deterministic code computes review Findings/Impact; no operational action. |
| Screenshot links break before assets exist | Add no image links in the immediate mutation. |
| Video requires a fourth API request | Use prior sanitized evidence if available or the honest evidence slate; request count stays zero. |
| `/feedback` correlates public repository with task context | Keep the value Devpost-only and commit only a handling marker. |
| Broad redaction changes evidence | Patch only five exact occurrences and preserve `<repository-root>` semantics. |
| Submission docs duplicate and drift | Use three documents with explicit single ownership; merge checklist/privacy/architecture rather than adding extra files. |
| Public push occurs before final review | Recommend private until final audit and retain a separate human-controlled pre-push gate. |

## 24. Human-only actions

The following may occur only after the documentation mutation and separate review:

1. Choose GitHub owner/organization, repository name, and initial visibility.
2. Capture and review screenshots outside the repository.
3. Decide whether selected screenshots should be committed and authorize exact paths.
4. Decide between an existing sanitized Live capture and the honest evidence slate.
5. Record/edit/review/upload the under-three-minute English video without copyrighted music.
6. Run `/feedback` in the correct primary task and enter only the Session ID directly in Devpost/private notes.
7. Fill repository/video URLs in Devpost.
8. Run the final pre-push privacy and asset review.
9. Create the remote, stage, commit, push, and submit only under later exact approvals.

## 25. Open questions

**Blocking for documentation mutation:** none.

Non-blocking human inputs deliberately handled by placeholders or alternatives:

- GitHub owner/organization, repository name, visibility, and URL.
- Public video URL.
- `/feedback` Session ID value.
- Availability of a pre-existing sanitized Live proof capture.
- Which reviewed screenshot subset will be committed versus used only on Devpost/video.
- Final submission timestamp and form confirmations.

These do not prevent accurate README or offline submission-document creation.

## 26. Final readiness verdict

`VALIDATED`

The exact nine-path documentation mutation is complete and validated. The redaction inventory matches the accepted audit, no canonical conflict exists, and all missing human values retain safe placeholders or external-only handling. Media capture, `/feedback`, repository publication, and push remain outside this closure and behind the final pre-push gate.

## 27. Closure evidence

Documentation implementation baseline:

```text
branch: master
implementation baseline HEAD: 08aa4ad54fc6a2a97de24ba656135c8d3ed7544f
subject: feat: complete Gate 3 Live GPT-5.6 integration
stage before this closeout task: none
commit before this closeout task: none
push before this closeout task: none
```

The exact nine documentation mutation paths are:

```text
README.md
docs/codex/GATE_1_IMPLEMENTATION_REPORT.md
docs/codex/GATE_2A_IMPLEMENTATION_PLAN.md
docs/codex/GATE_2B_IMPLEMENTATION_PLAN.md
docs/codex/GATE_2C_IMPLEMENTATION_PLAN.md
docs/codex/GATE_3_IMPLEMENTATION_PLAN.md
docs/submission/DEVPOST_SUBMISSION_DRAFT.md
docs/submission/DEMO_VIDEO_SCRIPT.md
docs/submission/SCREENSHOT_SHOTLIST.md
```

Closure review confirmed:

- README is complete for the completed Gate 3 product.
- All five machine-local path occurrences were replaced with `<repository-root>` without changing command or evidence semantics.
- The Devpost draft is complete except for the human-owned repository URL, video URL, and form values.
- The demo video script is complete at a target of 2:48 with a hard maximum of 2:59.
- The screenshot shot list is complete; no screenshot or other asset file was added.
- `/feedback` handling remains `DEVPOST_ONLY`; no Session ID value was entered in repository content.
- No repository URL or video URL was invented.
- No network or OpenAI request was used for the documentation mutation or closure.
- No request ID value was copied into the documentation.
- No source, test, dependency, configuration, lockfile, canonical specification, or security-boundary file changed.
- Documentation-only validation passed.

The remaining human work is screenshot capture, video recording/upload, `/feedback`, repository owner/name/visibility selection, and the final pre-push privacy and asset audit. These actions require later, separate authorization where applicable.
