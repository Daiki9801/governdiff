import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { computeImpact } from "../../lib/domain/impact-engine";
import { evaluatePolicy } from "../../lib/domain/policy-runtime";
import type { AnalysisMetadata } from "../../lib/domain/types";
import { loadDemoScenario } from "../../lib/demo/fixture-loader.server";
import { createAppError } from "../../lib/errors/app-error";
import { DEMO_EVENT_TYPES } from "../../lib/state/demo-events";
import { demoReducer } from "../../lib/state/demo-reducer";
import {
  DEMO_PHASES,
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
  hasCurrentAnalysis,
  selectBaselineRelease,
  type DemoPhase,
  type DemoState,
} from "../../lib/state/demo-state";

const METADATA: AnalysisMetadata = Object.freeze({
  mode: "sample",
  model: null,
  requestId: null,
  analyzedAt: "2026-07-19T00:00:00.000Z",
  durationMs: 5,
});

function initial(): DemoState {
  const scenario = loadDemoScenario(process.cwd(), false);
  return createInitialDemoState({
    initialDraftText: scenario.initialDraftText,
    liveModeAvailable: scenario.liveModeAvailable,
  });
}

function toBaselineReady(): DemoState {
  const scenario = loadDemoScenario(process.cwd(), false);
  let state = initial();
  state = demoReducer(state, {
    type: "ANALYSIS_STARTED",
    target: "baseline",
    requestedRevision: state.baseline.revision,
  });
  state = demoReducer(state, {
    type: "ANALYSIS_SUCCEEDED",
    target: "baseline",
    requestedRevision: state.baseline.revision,
    spec: scenario.sampleAnalyses["draft-v1"].analysis,
    metadata: METADATA,
  });
  state = demoReducer(state, {
    type: "POLICY_EDITED",
    target: "baseline",
    text: scenario.policyV1,
  });
  state = demoReducer(state, {
    type: "ANALYSIS_STARTED",
    target: "baseline",
    requestedRevision: state.baseline.revision,
  });
  return demoReducer(state, {
    type: "ANALYSIS_SUCCEEDED",
    target: "baseline",
    requestedRevision: state.baseline.revision,
    spec: scenario.sampleAnalyses["resolved-v1"].analysis,
    metadata: METADATA,
  });
}

function toBaselinePublished(): DemoState {
  const scenario = loadDemoScenario(process.cwd(), false);
  const ready = toBaselineReady();
  const release = createReleaseSnapshot({
    releaseId: "mfs-v1",
    displayVersion: "v1",
    releaseVersion: "1.0.0",
    policyText: ready.baseline.text,
    spec: ready.baseline.analysis!,
    findings: evaluatePolicy(ready.baseline.analysis!, scenario.records),
    analysisMetadata: ready.baseline.analysisMetadata!,
    status: "published",
    approvedRevision: ready.baseline.revision,
    approvedAnalysisId: ready.baseline.analysisId!,
    publishedAt: "2026-07-19T00:01:00.000Z",
  });
  return demoReducer(ready, { type: "BASELINE_RELEASE_CREATED", release });
}

function toCandidateReady(): DemoState {
  const scenario = loadDemoScenario(process.cwd(), false);
  let state = toBaselinePublished();
  state = demoReducer(state, {
    type: "START_CANDIDATE",
    text: selectBaselineRelease(state)!.policyText,
  });
  state = demoReducer(state, {
    type: "POLICY_EDITED",
    target: "candidate",
    text: scenario.policyV2,
  });
  state = demoReducer(state, {
    type: "ANALYSIS_STARTED",
    target: "candidate",
    requestedRevision: state.candidate!.revision,
  });
  return demoReducer(state, {
    type: "ANALYSIS_SUCCEEDED",
    target: "candidate",
    requestedRevision: state.candidate!.revision,
    spec: scenario.sampleAnalyses["candidate-v2"].analysis,
    metadata: METADATA,
  });
}

function toImpactReady(): DemoState {
  const scenario = loadDemoScenario(process.cwd(), false);
  const state = toCandidateReady();
  const preview = computeImpact(
    selectBaselineRelease(state)!.spec,
    state.candidate!.analysis!,
    scenario.records,
  );
  const computation = createImpactComputation({
    preview,
    candidateFindings: evaluatePolicy(state.candidate!.analysis!, scenario.records),
    baselineReleaseId: "mfs-v1",
    candidateRevision: state.candidate!.revision,
    candidateAnalysisId: state.candidate!.analysisId!,
  });
  return demoReducer(state, { type: "IMPACT_COMPUTED", computation });
}

describe("canonical Demo reducer and state", () => {
  it("exports exact 13 phases, exact 12 events, and no selector module", () => {
    expect(DEMO_PHASES).toHaveLength(13);
    expect(new Set(DEMO_PHASES).size).toBe(13);
    expect(DEMO_EVENT_TYPES).toHaveLength(12);
    expect(new Set(DEMO_EVENT_TYPES).size).toBe(12);
    expect(
      existsSync(join(process.cwd(), "lib", "state", "demo-selectors.ts")),
    ).toBe(false);
  });

  it("reaches every canonical phase in order and keeps selector parity", () => {
    const scenario = loadDemoScenario(process.cwd(), false);
    let state = initial();
    const phases: DemoPhase[] = [state.phase];
    expect(canAnalyzeBaseline(state)).toBe(true);

    state = demoReducer(state, {
      type: "ANALYSIS_STARTED",
      target: "baseline",
      requestedRevision: 0,
    });
    phases.push(state.phase);
    state = demoReducer(state, {
      type: "ANALYSIS_SUCCEEDED",
      target: "baseline",
      requestedRevision: 0,
      spec: scenario.sampleAnalyses["draft-v1"].analysis,
      metadata: METADATA,
    });
    phases.push(state.phase);
    state = demoReducer(state, {
      type: "POLICY_EDITED",
      target: "baseline",
      text: scenario.policyV1,
    });
    phases.push(state.phase);
    state = demoReducer(state, {
      type: "ANALYSIS_STARTED",
      target: "baseline",
      requestedRevision: state.baseline.revision,
    });
    phases.push(state.phase);
    state = demoReducer(state, {
      type: "ANALYSIS_SUCCEEDED",
      target: "baseline",
      requestedRevision: state.baseline.revision,
      spec: scenario.sampleAnalyses["resolved-v1"].analysis,
      metadata: METADATA,
    });
    phases.push(state.phase);
    expect(canCreateBaselineRelease(state)).toBe(true);

    const baselineRelease = createReleaseSnapshot({
      releaseId: "mfs-v1",
      displayVersion: "v1",
      releaseVersion: "1.0.0",
      policyText: state.baseline.text,
      spec: state.baseline.analysis!,
      findings: evaluatePolicy(state.baseline.analysis!, scenario.records),
      analysisMetadata: state.baseline.analysisMetadata!,
      status: "published",
      approvedRevision: state.baseline.revision,
      approvedAnalysisId: state.baseline.analysisId!,
      publishedAt: "2026-07-19T00:01:00.000Z",
    });
    state = demoReducer(state, {
      type: "BASELINE_RELEASE_CREATED",
      release: baselineRelease,
    });
    phases.push(state.phase);
    expect(canStartCandidate(state)).toBe(true);
    state = demoReducer(state, {
      type: "START_CANDIDATE",
      text: baselineRelease.policyText,
    });
    phases.push(state.phase);
    state = demoReducer(state, {
      type: "POLICY_EDITED",
      target: "candidate",
      text: scenario.policyV2,
    });
    expect(canAnalyzeCandidate(state)).toBe(true);
    state = demoReducer(state, {
      type: "ANALYSIS_STARTED",
      target: "candidate",
      requestedRevision: state.candidate!.revision,
    });
    phases.push(state.phase);
    state = demoReducer(state, {
      type: "ANALYSIS_SUCCEEDED",
      target: "candidate",
      requestedRevision: state.candidate!.revision,
      spec: scenario.sampleAnalyses["candidate-v2"].analysis,
      metadata: METADATA,
    });
    phases.push(state.phase);
    expect(canComputeImpact(state)).toBe(true);
    const preview = computeImpact(
      baselineRelease.spec,
      state.candidate!.analysis!,
      scenario.records,
    );
    const computation = createImpactComputation({
      preview,
      candidateFindings: evaluatePolicy(state.candidate!.analysis!, scenario.records),
      baselineReleaseId: "mfs-v1",
      candidateRevision: state.candidate!.revision,
      candidateAnalysisId: state.candidate!.analysisId!,
    });
    state = demoReducer(state, { type: "IMPACT_COMPUTED", computation });
    phases.push(state.phase);
    expect(canApproveCandidate(state)).toBe(true);
    state = demoReducer(state, { type: "APPROVE_CANDIDATE" });
    phases.push(state.phase);
    expect(canPublishCandidate(state)).toBe(true);
    const candidateRelease = createReleaseSnapshot({
      releaseId: "mfs-v2",
      displayVersion: "v2",
      releaseVersion: "1.1.0",
      policyText: state.candidate!.text,
      spec: state.candidate!.analysis!,
      findings: state.impact!.candidateFindings,
      analysisMetadata: state.candidate!.analysisMetadata!,
      status: "published",
      approvedRevision: state.candidate!.revision,
      approvedAnalysisId: state.candidate!.analysisId!,
      publishedAt: "2026-07-19T00:02:00.000Z",
    });
    state = demoReducer(state, {
      type: "CANDIDATE_RELEASE_CREATED",
      release: candidateRelease,
    });
    phases.push(state.phase);

    expect(phases).toEqual(DEMO_PHASES);
    expect(state.releases).toHaveLength(2);
    expect(state.releases[0]).toBe(baselineRelease);
  });

  it("rejects candidate start unless text exactly matches published v1", () => {
    const state = toBaselinePublished();
    const result = demoReducer(state, {
      type: "START_CANDIDATE",
      text: `${selectBaselineRelease(state)!.policyText}x`,
    });

    expect(result.phase).toBe("baseline_published");
    expect(result.candidate).toBeNull();
    expect(result.releases).toBe(state.releases);
    expect(result.error?.code).toBe("STATE_TRANSITION_INVALID");
  });

  it("requires exactly one baseline release before candidate start", () => {
    const state = toBaselinePublished();
    const malformed: DemoState = {
      ...state,
      releases: Object.freeze([state.releases[0]!, state.releases[0]!]),
    };
    expect(canStartCandidate(malformed)).toBe(false);
    const result = demoReducer(malformed, {
      type: "START_CANDIDATE",
      text: state.releases[0]!.policyText,
    });
    expect(result.candidate).toBeNull();
    expect(result.error?.code).toBe("STATE_TRANSITION_INVALID");
  });

  it("discards stale success and failure as the identical state", () => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const analyzing = demoReducer(initial(), {
      type: "ANALYSIS_STARTED",
      target: "baseline",
      requestedRevision: 0,
    });
    const staleSuccess = demoReducer(analyzing, {
      type: "ANALYSIS_SUCCEEDED",
      target: "baseline",
      requestedRevision: 1,
      spec: scenario.sampleAnalyses["draft-v1"].analysis,
      metadata: METADATA,
    });
    const staleFailure = demoReducer(analyzing, {
      type: "ANALYSIS_FAILED",
      target: "baseline",
      requestedRevision: 1,
      error: createAppError("ANALYSIS_UPSTREAM_ERROR", "Retry analysis.", true),
    });
    expect(staleSuccess).toBe(analyzing);
    expect(staleFailure).toBe(analyzing);
  });

  it("clears old analysis at re-analysis start and never revives it after failure", () => {
    const ready = toBaselineReady();
    const editing: DemoState = { ...ready, phase: "baseline_editing" };
    const analyzing = demoReducer(editing, {
      type: "ANALYSIS_STARTED",
      target: "baseline",
      requestedRevision: editing.baseline.revision,
    });
    expect(analyzing.baseline.analysis).toBeNull();
    expect(analyzing.baseline.analysisId).toBeNull();
    const failed = demoReducer(analyzing, {
      type: "ANALYSIS_FAILED",
      target: "baseline",
      requestedRevision: analyzing.baseline.revision,
      error: createAppError("ANALYSIS_UPSTREAM_ERROR", "Retry analysis.", true),
    });
    expect(failed.phase).toBe("baseline_editing");
    expect(failed.baseline.analysis).toBeNull();
    expect(hasCurrentAnalysis(failed.baseline)).toBe(false);
  });

  it("restores exact initial draft and enforces immutable Live capability", () => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const edited = demoReducer(initial(), {
      type: "POLICY_EDITED",
      target: "baseline",
      text: "edited",
    });
    const reset = demoReducer(edited, { type: "RESET_SCENARIO" });
    expect(reset.baseline.text).toBe(scenario.initialDraftText);
    expect(reset.initialDraftText).toBe(scenario.initialDraftText);
    expect(reset.mode).toBe("sample");
    expect(reset.liveModeAvailable).toBe(false);

    const invalidLive = demoReducer(reset, { type: "MODE_CHANGED", mode: "live" });
    expect(invalidLive.mode).toBe("sample");
    expect(invalidLive.error?.code).toBe("STATE_TRANSITION_INVALID");
    expect(canChangeMode(reset, "live")).toBe(false);
    expect(canResetScenario(reset)).toBe(true);
  });

  it("copies and deeply freezes snapshot and Impact factory inputs", () => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const ready = toBaselineReady();
    const findings = evaluatePolicy(ready.baseline.analysis!, scenario.records);
    const release = createReleaseSnapshot({
      releaseId: "mfs-v1",
      displayVersion: "v1",
      releaseVersion: "1.0.0",
      policyText: ready.baseline.text,
      spec: ready.baseline.analysis!,
      findings,
      analysisMetadata: METADATA,
      status: "published",
      approvedRevision: ready.baseline.revision,
      approvedAnalysisId: ready.baseline.analysisId!,
      publishedAt: "2026-07-19T00:01:00.000Z",
    });
    expect(release.spec).not.toBe(ready.baseline.analysis);
    expect(release.findings).not.toBe(findings);
    expect(Object.isFrozen(release)).toBe(true);
    expect(Object.isFrozen(release.spec.rules)).toBe(true);
    expect(Object.isFrozen(release.findings[0]?.observed)).toBe(true);

    const impactReady = toImpactReady();
    expect(Object.isFrozen(impactReady.impact)).toBe(true);
    expect(Object.isFrozen(impactReady.impact?.preview.removed)).toBe(true);
    expect(Object.isFrozen(impactReady.impact?.candidateFindings)).toBe(true);
    const key = impactReady.impact!.candidateFindings[0]!.findingKey;
    expect(canSelectFinding(impactReady, key)).toBe(true);
    expect(canSelectFinding(impactReady, "missing-key")).toBe(false);
  });
});
