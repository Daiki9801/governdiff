"use client";

import { useEffect, useReducer, useRef, useState } from "react";

import {
  PolicyAnalysisController,
  type AnalyzeExecutor,
} from "../lib/analysis/policy-analysis-controller";
import { createLivePolicyExecutor } from "../lib/analysis/live-policy-client";
import { SamplePolicyAnalyzer } from "../lib/analysis/sample-policy-analyzer";
import { computeImpact } from "../lib/domain/impact-engine";
import { evaluatePolicy } from "../lib/domain/policy-runtime";
import type { FixtureExpectations } from "../lib/domain/schemas";
import type { AnalysisMode, ExpenseRecord, Finding } from "../lib/domain/types";
import type { SampleAnalysisAssets } from "../lib/demo/fixture-contract";
import { verifyFixtureExpectations } from "../lib/demo/fixture-expectation-guard";
import {
  createCandidateV2,
  resolveLodgingThreshold,
} from "../lib/demo/quick-actions";
import { createAppError, isAppError, type AppError } from "../lib/errors/app-error";
import { demoReducer } from "../lib/state/demo-reducer";
import {
  canAnalyzeBaseline,
  canAnalyzeCandidate,
  canApproveCandidate,
  canChangeMode,
  canComputeImpact,
  canCreateBaselineRelease,
  canPublishCandidate,
  canResetScenario,
  canSelectFinding,
  canStartCandidate,
  createImpactComputation,
  createInitialDemoState,
  createReleaseSnapshot,
  selectBaselineRelease,
  selectCandidateRelease,
  selectVisibleFindings,
} from "../lib/state/demo-state";
import { AnalysisPanel } from "./analysis-panel";
import { BaselineResults } from "./baseline-results";
import {
  EvidenceDrawer,
  type FindingEvidenceContext,
} from "./evidence-drawer";
import { ImpactPreview } from "./impact-preview";
import { ModeSelector } from "./mode-selector";
import { PolicyEditor } from "./policy-editor";
import { ReleaseHistory } from "./release-history";
import { StatusBanner } from "./status-banner";
import { StepIndicator } from "./step-indicator";

export interface GovernDiffScenario {
  readonly initialDraftText: string;
  readonly sampleAnalyses: SampleAnalysisAssets;
  readonly records: readonly ExpenseRecord[];
  readonly expectations: FixtureExpectations;
  readonly liveModeAvailable: boolean;
}

interface GovernDiffWorkspaceProps {
  readonly scenario: GovernDiffScenario;
}

type AnalyzerInitialization =
  | Readonly<{ analyzer: SamplePolicyAnalyzer; error: null }>
  | Readonly<{ analyzer: null; error: AppError }>;

function initializeAnalyzer(scenario: GovernDiffScenario): AnalyzerInitialization {
  try {
    return Object.freeze({
      analyzer: new SamplePolicyAnalyzer(scenario.sampleAnalyses),
      error: null,
    });
  } catch (error) {
    return Object.freeze({
      analyzer: null,
      error: isAppError(error)
        ? error
        : createAppError(
            "SAMPLE_VARIANT_UNSUPPORTED",
            "The built-in Sample analysis is unavailable.",
            false,
            "SAMPLE_ANALYZER_INIT_FAILED",
          ),
    });
  }
}

function sortedFindingKeys(values: readonly { readonly findingKey: string }[]): string[] {
  return values.map((value) => value.findingKey).sort();
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function GovernDiffWorkspace({ scenario }: GovernDiffWorkspaceProps) {
  const [state, dispatch] = useReducer(
    demoReducer,
    {
      initialDraftText: scenario.initialDraftText,
      liveModeAvailable: scenario.liveModeAvailable,
    },
    createInitialDemoState,
  );
  const stateRef = useRef(state);
  const [analyzerInitialization] = useState<AnalyzerInitialization>(() =>
    initializeAnalyzer(scenario),
  );
  const [commandError, setCommandError] = useState<AppError | null>(
    analyzerInitialization.error,
  );
  const controllerRef = useRef<PolicyAnalysisController | null>(null);

  const reviewHeadingRef = useRef<HTMLHeadingElement>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const candidateHeadingRef = useRef<HTMLHeadingElement>(null);
  const impactHeadingRef = useRef<HTMLHeadingElement>(null);
  const historyHeadingRef = useRef<HTMLHeadingElement>(null);
  const evidenceTriggerRef = useRef<HTMLButtonElement | null>(null);
  const previousPhaseRef = useRef(state.phase);
  const quickActionInFlightRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const executeLive = createLivePolicyExecutor();
    const execute: AnalyzeExecutor = (request, signal) => {
      if (stateRef.current.mode === "live") {
        return executeLive(request, signal);
      }
      if (analyzerInitialization.analyzer === null) {
        return Promise.reject(analyzerInitialization.error);
      }
      return analyzerInitialization.analyzer.analyze(request);
    };
    const controller = new PolicyAnalysisController({
      getState: () => stateRef.current,
      dispatch,
      execute,
    });
    controllerRef.current = controller;
    return () => {
      controller.cancel();
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    };
  }, [analyzerInitialization, dispatch]);

  useEffect(() => {
    const previous = previousPhaseRef.current;
    if (previous === "draft_analyzing" && state.phase === "draft_blocked") {
      reviewHeadingRef.current?.focus();
    }
    if (previous !== "baseline_published" && state.phase === "baseline_published") {
      resultsHeadingRef.current?.focus();
    }
    if (previous === "baseline_published" && state.phase === "candidate_editing") {
      candidateHeadingRef.current?.focus();
    }
    if (previous !== "impact_ready" && state.phase === "impact_ready") {
      impactHeadingRef.current?.focus();
    }
    if (previous !== "published" && state.phase === "published") {
      historyHeadingRef.current?.focus();
    }
    previousPhaseRef.current = state.phase;
  }, [state.phase]);

  const pending =
    state.phase === "draft_analyzing" ||
    state.phase === "baseline_analyzing" ||
    state.phase === "candidate_analyzing";
  const baselineRelease = selectBaselineRelease(state);
  const candidateRelease = selectCandidateRelease(state);
  const visibleFindings = selectVisibleFindings(state);
  const selectedFinding =
    state.selectedFindingKey === null
      ? null
      : visibleFindings.find(
          (finding) => finding.findingKey === state.selectedFindingKey,
        ) ?? null;
  const employeeCount = new Set(
    scenario.records.map((record) => record.employeeId),
  ).size;

  function handleModeChange(mode: AnalysisMode): void {
    const current = stateRef.current;
    if (mode === current.mode || !canChangeMode(current, mode)) {
      return;
    }
    if (
      current.releases.length > 0 &&
      !window.confirm("Changing mode resets this demo session.")
    ) {
      return;
    }
    controllerRef.current?.cancel();
    setCommandError(null);
    dispatch({ type: "MODE_CHANGED", mode });
  }

  function handleTextChange(text: string): void {
    setCommandError(null);
    dispatch({ type: "POLICY_EDITED", target: "baseline", text });
  }

  function handleCandidateTextChange(text: string): void {
    setCommandError(null);
    dispatch({ type: "POLICY_EDITED", target: "candidate", text });
  }

  function handleAnalyze(): void {
    setCommandError(null);
    const controller = controllerRef.current;
    if (controller === null) {
      setCommandError(
        createAppError(
          "ANALYSIS_REQUEST_INVALID",
          "Policy analysis is not ready yet.",
          true,
          "ANALYSIS_CONTROLLER_NOT_READY",
        ),
      );
      return;
    }
    void controller.analyze("baseline");
  }

  function handleAnalyzeCandidate(): void {
    setCommandError(null);
    const controller = controllerRef.current;
    if (controller === null) {
      setCommandError(
        createAppError(
          "ANALYSIS_REQUEST_INVALID",
          "Candidate analysis is not ready yet.",
          true,
          "CANDIDATE_CONTROLLER_NOT_READY",
        ),
      );
      return;
    }
    void controller.analyze("candidate");
  }

  async function handleResolve(): Promise<void> {
    if (quickActionInFlightRef.current || stateRef.current.phase !== "draft_blocked") {
      return;
    }
    quickActionInFlightRef.current = true;
    const sourceText = stateRef.current.baseline.text;
    const sourceRevision = stateRef.current.baseline.revision;
    try {
      const result = await resolveLodgingThreshold(sourceText);
      const current = stateRef.current;
      if (
        current.phase !== "draft_blocked" ||
        current.baseline.revision !== sourceRevision ||
        current.baseline.text !== sourceText
      ) {
        return;
      }
      if (!result.ok) {
        setCommandError(result.error);
        return;
      }
      setCommandError(null);
      dispatch({ type: "POLICY_EDITED", target: "baseline", text: result.text });
    } finally {
      quickActionInFlightRef.current = false;
    }
  }

  function handleCreateBaselineRelease(): void {
    const current = stateRef.current;
    if (!canCreateBaselineRelease(current)) {
      setCommandError(
        createAppError(
          "STATE_TRANSITION_INVALID",
          "The baseline is not ready to publish.",
          false,
          "BASELINE_COMMAND_NOT_READY",
        ),
      );
      return;
    }

    try {
      const analysis = current.baseline.analysis;
      const metadata = current.baseline.analysisMetadata;
      const analysisId = current.baseline.analysisId;
      if (analysis === null || metadata === null || analysisId === null) {
        throw createAppError(
          "STATE_TRANSITION_INVALID",
          "The baseline is not ready to publish.",
          false,
          "BASELINE_BINDING_MISSING",
        );
      }
      const findings = evaluatePolicy(analysis, scenario.records);
      const actualKeys = sortedFindingKeys(findings);
      const expectedKeys = scenario.expectations.baseline_release.findings
        .map((finding) => finding.finding_key)
        .sort();
      if (
        findings.length !== scenario.expectations.baseline_release.finding_count ||
        !sameStrings(actualKeys, expectedKeys)
      ) {
        throw createAppError(
          "FIXTURE_EXPECTATION_FAILED",
          "Fixture verification failed.",
          false,
          "BASELINE_FINDINGS_MISMATCH",
        );
      }

      const release = createReleaseSnapshot({
        releaseId: "mfs-v1",
        displayVersion: "v1",
        releaseVersion: "1.0.0",
        policyText: current.baseline.text,
        spec: analysis,
        findings,
        analysisMetadata: metadata,
        status: "published",
        approvedRevision: current.baseline.revision,
        approvedAnalysisId: analysisId,
        publishedAt: new Date().toISOString(),
      });
      setCommandError(null);
      dispatch({ type: "BASELINE_RELEASE_CREATED", release });
    } catch (error) {
      setCommandError(
        isAppError(error)
          ? error
          : createAppError(
              "RUNTIME_SPEC_INVALID",
              "The deterministic baseline could not be created.",
              false,
              "BASELINE_COMMAND_FAILED",
            ),
      );
    }
  }

  function handleStartCandidate(): void {
    const current = stateRef.current;
    const release = selectBaselineRelease(current);
    if (!canStartCandidate(current) || release === null) {
      setCommandError(
        createAppError(
          "STATE_TRANSITION_INVALID",
          "A candidate cannot be started from the current state.",
          false,
          "CANDIDATE_COMMAND_NOT_READY",
        ),
      );
      return;
    }
    setCommandError(null);
    dispatch({ type: "START_CANDIDATE", text: release.policyText });
  }

  async function handleCreateCandidateV2(): Promise<void> {
    const currentCandidate = stateRef.current.candidate;
    if (
      quickActionInFlightRef.current ||
      stateRef.current.phase !== "candidate_editing" ||
      currentCandidate === null
    ) {
      return;
    }
    quickActionInFlightRef.current = true;
    const sourceText = currentCandidate.text;
    const sourceRevision = currentCandidate.revision;
    try {
      const result = await createCandidateV2(sourceText);
      const current = stateRef.current;
      if (
        current.phase !== "candidate_editing" ||
        current.candidate === null ||
        current.candidate.revision !== sourceRevision ||
        current.candidate.text !== sourceText
      ) {
        return;
      }
      if (!result.ok) {
        setCommandError(result.error);
        return;
      }
      setCommandError(null);
      dispatch({ type: "POLICY_EDITED", target: "candidate", text: result.text });
    } finally {
      quickActionInFlightRef.current = false;
    }
  }

  function handleComputeImpact(): void {
    const current = stateRef.current;
    const release = selectBaselineRelease(current);
    const candidate = current.candidate;
    if (
      !canComputeImpact(current) ||
      release === null ||
      candidate === null ||
      candidate.analysis === null ||
      candidate.analysisId === null
    ) {
      setCommandError(
        createAppError(
          "STATE_TRANSITION_INVALID",
          "The candidate is not ready for Impact.",
          false,
          "IMPACT_COMMAND_NOT_READY",
        ),
      );
      return;
    }

    try {
      verifyFixtureExpectations({
        baselineSpec: release.spec,
        candidateSpec: candidate.analysis,
        records: scenario.records,
        expectations: scenario.expectations,
      });
      const preview = computeImpact(
        release.spec,
        candidate.analysis,
        scenario.records,
      );
      const candidateFindings = evaluatePolicy(
        candidate.analysis,
        scenario.records,
      );
      const expectedKeys = scenario.expectations.candidate_release.findings
        .map((finding) => finding.finding_key)
        .sort();
      if (
        candidateFindings.length !==
          scenario.expectations.candidate_release.finding_count ||
        !sameStrings(sortedFindingKeys(candidateFindings), expectedKeys)
      ) {
        throw createAppError(
          "FIXTURE_EXPECTATION_FAILED",
          "Fixture verification failed.",
          false,
          "CANDIDATE_FINDINGS_MISMATCH",
        );
      }
      const computation = createImpactComputation({
        preview,
        candidateFindings,
        baselineReleaseId: "mfs-v1",
        candidateRevision: candidate.revision,
        candidateAnalysisId: candidate.analysisId,
      });
      setCommandError(null);
      dispatch({ type: "IMPACT_COMPUTED", computation });
    } catch (error) {
      setCommandError(
        isAppError(error)
          ? error
          : createAppError(
              "FIXTURE_EXPECTATION_FAILED",
              "Fixture verification failed.",
              false,
              "IMPACT_COMMAND_FAILED",
            ),
      );
    }
  }

  function handleViewEvidence(
    finding: Finding,
    trigger: HTMLButtonElement,
  ): void {
    const current = stateRef.current;
    if (!canSelectFinding(current, finding.findingKey)) {
      setCommandError(
        createAppError(
          "STATE_TRANSITION_INVALID",
          "That evidence is no longer available.",
          false,
          "EVIDENCE_SELECTION_NOT_CURRENT",
        ),
      );
      return;
    }
    evidenceTriggerRef.current = trigger;
    setCommandError(null);
    dispatch({ type: "FINDING_SELECTED", key: finding.findingKey });
  }

  function handleCloseEvidence(): void {
    dispatch({ type: "FINDING_SELECTED", key: null });
  }

  function handleApproveCandidate(): void {
    if (!canApproveCandidate(stateRef.current)) {
      setCommandError(
        createAppError(
          "STATE_TRANSITION_INVALID",
          "Review the current Impact before approving the candidate.",
          false,
          "CANDIDATE_APPROVAL_NOT_READY",
        ),
      );
      return;
    }
    setCommandError(null);
    dispatch({ type: "APPROVE_CANDIDATE" });
  }

  function handlePublishCandidate(): void {
    const current = stateRef.current;
    const candidate = current.candidate;
    const impact = current.impact;
    if (
      !canPublishCandidate(current) ||
      candidate === null ||
      candidate.analysis === null ||
      candidate.analysisMetadata === null ||
      candidate.analysisId === null ||
      impact === null
    ) {
      setCommandError(
        createAppError(
          "STATE_TRANSITION_INVALID",
          "The current candidate is not approved for publication.",
          false,
          "CANDIDATE_PUBLISH_NOT_READY",
        ),
      );
      return;
    }

    try {
      const release = createReleaseSnapshot({
        releaseId: "mfs-v2",
        displayVersion: "v2",
        releaseVersion: "1.1.0",
        policyText: candidate.text,
        spec: candidate.analysis,
        findings: impact.candidateFindings,
        analysisMetadata: candidate.analysisMetadata,
        status: "published",
        approvedRevision: candidate.revision,
        approvedAnalysisId: candidate.analysisId,
        publishedAt: new Date().toISOString(),
      });
      setCommandError(null);
      dispatch({ type: "CANDIDATE_RELEASE_CREATED", release });
    } catch (error) {
      setCommandError(
        isAppError(error)
          ? error
          : createAppError(
              "STATE_TRANSITION_INVALID",
              "The current candidate could not be published.",
              false,
              "CANDIDATE_PUBLISH_FAILED",
            ),
      );
    }
  }

  function selectedFindingContext(finding: Finding): FindingEvidenceContext {
    const impact = state.impact;
    if (impact === null) {
      return "Published v1 before Impact";
    }
    if (impact.preview.removed.some((value) => value.findingKey === finding.findingKey)) {
      return "Published v1 · removed";
    }
    if (impact.preview.added.some((value) => value.findingKey === finding.findingKey)) {
      return "Candidate v2 · added";
    }
    return "Candidate v2 · unchanged";
  }

  function handleReset(): void {
    if (!canResetScenario(stateRef.current)) {
      return;
    }
    controllerRef.current?.cancel();
    evidenceTriggerRef.current = null;
    setCommandError(null);
    dispatch({ type: "RESET_SCENARIO" });
  }

  return (
    <div className="app-shell">
      <div
        className="app-shell-content"
        inert={selectedFinding === null ? undefined : true}
      >
        <header className="site-header">
          <div className="brand-copy">
            <p className="eyebrow">Policy change workspace</p>
            <h1>GovernDiff</h1>
            <p className="tagline">Test policy changes before they ship.</p>
            <p className="problem-line">
              Preview how a written policy change affects operational reviews before publishing.
            </p>
          </div>
          <ModeSelector
            mode={state.mode}
            liveModeAvailable={state.liveModeAvailable}
            disabled={pending}
            onModeChange={handleModeChange}
          />
        </header>

        <main className="workspace-main">
          <aside className="fiction-notice" aria-label="Fictional scenario notice">
            <strong>Fictional demo</strong>
            <span>
              Mavrenna Field Systems, its policies, employees, and expenses are synthetic. GovernDiff does not submit, reimburse, approve, or reject expenses.
            </span>
          </aside>

          <StepIndicator phase={state.phase} />
          <StatusBanner
            phase={state.phase}
            mode={state.mode}
            reducerError={state.error}
            commandError={commandError}
          />

          <div className="workspace-grid">
            <PolicyEditor
              text={state.baseline.text}
              phase={state.phase}
              analyzeEnabled={canAnalyzeBaseline(state) && commandError?.retryable !== false}
              resetEnabled={canResetScenario(state)}
              editable={baselineRelease === null}
              retrying={state.error !== null}
              onTextChange={handleTextChange}
              onAnalyze={handleAnalyze}
              onReset={handleReset}
            />

            <aside className="summary-rail" aria-labelledby="scenario-heading">
              <p className="eyebrow">Built-in scenario</p>
              <h2 id="scenario-heading">Mavrenna Field Systems</h2>
              <dl>
                <div><dt>Records</dt><dd>{scenario.records.length}</dd></div>
                <div><dt>Employees</dt><dd>{employeeCount}</dd></div>
                <div><dt>Data</dt><dd>Synthetic</dd></div>
                <div><dt>Runtime</dt><dd>Local</dd></div>
              </dl>
              <p>
                This hackathon build supports only the built-in Mavrenna expense vocabulary and dataset. It is not a general policy engine.
              </p>
            </aside>
          </div>

          <AnalysisPanel
            policy={state.baseline}
            phase={state.phase}
            resolveEnabled={state.phase === "draft_blocked"}
            baselineReleaseEnabled={canCreateBaselineRelease(state)}
            retryEnabled={state.error !== null && canAnalyzeBaseline(state)}
            onResolve={() => void handleResolve()}
            onRetry={handleAnalyze}
            onCreateBaselineRelease={handleCreateBaselineRelease}
            headingRef={reviewHeadingRef}
          />

          {baselineRelease !== null ? (
            <BaselineResults
              release={baselineRelease}
              recordCount={scenario.records.length}
              candidateStartEnabled={canStartCandidate(state)}
              onStartCandidate={handleStartCandidate}
              onViewEvidence={handleViewEvidence}
              headingRef={resultsHeadingRef}
            />
          ) : null}

          {state.candidate === null ? null : (
            <div className="candidate-stack">
              <PolicyEditor
                idPrefix="candidate"
                eyebrow="Step 3 · Candidate"
                heading="Candidate v2"
                label="Mavrenna global expense policy candidate"
                text={state.candidate.text}
                phase={state.phase}
                analyzeEnabled={canAnalyzeCandidate(state)}
                resetEnabled={canResetScenario(state)}
                editable={candidateRelease === null && state.phase !== "published"}
                retrying={state.error !== null}
                analyzeLabel="Analyze candidate"
                quickActionLabel="Apply canonical v2 changes"
                quickActionEnabled={
                  state.phase === "candidate_editing" &&
                  baselineRelease !== null &&
                  state.candidate.text === baselineRelease.policyText
                }
                onTextChange={handleCandidateTextChange}
                onAnalyze={handleAnalyzeCandidate}
                onQuickAction={() => void handleCreateCandidateV2()}
                onReset={handleReset}
                headingRef={candidateHeadingRef}
              />
              <AnalysisPanel
                idPrefix="candidate"
                eyebrow="Step 3 · Candidate analysis"
                heading="Review candidate v2"
                policy={state.candidate}
                phase={state.phase}
                resolveEnabled={false}
                baselineReleaseEnabled={false}
                impactEnabled={canComputeImpact(state)}
                retryEnabled={state.error !== null && canAnalyzeCandidate(state)}
                onResolve={() => undefined}
                onRetry={handleAnalyzeCandidate}
                onCreateBaselineRelease={() => undefined}
                onComputeImpact={handleComputeImpact}
              />
            </div>
          )}

          {state.impact === null ? null : (
            <ImpactPreview
              computation={state.impact}
              approved={state.phase === "candidate_approved" || state.phase === "published"}
              published={candidateRelease !== null}
              approveEnabled={canApproveCandidate(state)}
              publishEnabled={canPublishCandidate(state)}
              onApprove={handleApproveCandidate}
              onPublish={handlePublishCandidate}
              onViewEvidence={handleViewEvidence}
              headingRef={impactHeadingRef}
            />
          )}

          {state.releases.length === 0 ? null : (
            <ReleaseHistory releases={state.releases} headingRef={historyHeadingRef} />
          )}
        </main>

        <footer>
          Session-only demonstration. Refresh or Reset starts the built-in scenario again.
        </footer>
      </div>

      {selectedFinding === null ? null : (
        <EvidenceDrawer
          finding={selectedFinding}
          context={selectedFindingContext(selectedFinding)}
          returnFocusRef={evidenceTriggerRef}
          fallbackFocusRef={state.impact === null ? resultsHeadingRef : impactHeadingRef}
          onClose={handleCloseEvidence}
        />
      )}
    </div>
  );
}
