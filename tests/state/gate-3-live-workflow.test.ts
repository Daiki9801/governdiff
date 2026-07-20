import { describe, expect, it, vi } from "vitest";

import type { AnalyzePolicyResult } from "../../lib/analysis/analyzer-contract";
import {
  PolicyAnalysisController,
  type AnalyzeExecutor,
} from "../../lib/analysis/policy-analysis-controller";
import { computeImpact } from "../../lib/domain/impact-engine";
import { evaluatePolicy } from "../../lib/domain/policy-runtime";
import type { AnalysisMetadata } from "../../lib/domain/types";
import { verifyFixtureExpectations } from "../../lib/demo/fixture-expectation-guard";
import { loadDemoScenario } from "../../lib/demo/fixture-loader.server";
import {
  createCandidateV2,
  resolveLodgingThreshold,
} from "../../lib/demo/quick-actions";
import { createAppError } from "../../lib/errors/app-error";
import type { DemoEvent } from "../../lib/state/demo-events";
import { demoReducer } from "../../lib/state/demo-reducer";
import {
  createImpactComputation,
  createInitialDemoState,
  createReleaseSnapshot,
  selectBaselineRelease,
  type DemoState,
} from "../../lib/state/demo-state";

function requireValue<T>(value: T | null | undefined, label: string): T {
  if (value === null || value === undefined) {
    throw new Error(`Missing ${label}`);
  }
  return value;
}

function liveMetadata(requestId: string): AnalysisMetadata {
  return Object.freeze({
    mode: "live",
    model: "gpt-5.6",
    requestId,
    analyzedAt: "2026-07-19T04:00:00.000Z",
    durationMs: 10,
  });
}

describe("Gate 3 mocked Live workflow", () => {
  it("completes the exact three-call Live flow with local Findings, Impact, and publish", async () => {
    const scenario = loadDemoScenario(process.cwd(), true);
    let state = createInitialDemoState({
      initialDraftText: scenario.initialDraftText,
      liveModeAvailable: true,
      mode: "live",
    });
    const events: DemoEvent[] = [];
    const dispatch = (event: DemoEvent): void => {
      events.push(event);
      state = demoReducer(state, event);
    };
    const calls: Array<{
      readonly targetVersion: string;
      readonly policyText: string;
      readonly signal: AbortSignal;
    }> = [];
    const execute = vi.fn<AnalyzeExecutor>(async (request, signal) => {
      calls.push({ ...request, signal });
      expect(signal.aborted).toBe(false);
      const variant =
        request.targetVersion === "draft-v1"
          ? "draft-v1"
          : request.targetVersion === "1.0.0"
            ? "resolved-v1"
            : "candidate-v2";
      const expectedText =
        variant === "draft-v1"
          ? scenario.policyDraftV1
          : variant === "resolved-v1"
            ? scenario.policyV1
            : scenario.policyV2;
      expect(request.policyText).toBe(expectedText);
      return Object.freeze({
        spec: scenario.sampleAnalyses[variant].analysis,
        metadata: liveMetadata(`req_live_${calls.length}`),
      });
    });
    const controller = new PolicyAnalysisController({
      getState: () => state,
      dispatch,
      execute,
    });

    await controller.analyze("baseline");
    expect(state.phase).toBe("draft_blocked");
    expect(state.baseline.analysis?.rules).toHaveLength(5);
    expect(state.baseline.analysis?.ambiguities).toHaveLength(1);

    const resolved = await resolveLodgingThreshold(state.baseline.text);
    if (!resolved.ok) {
      throw new Error("Baseline quick action failed");
    }
    dispatch({ type: "POLICY_EDITED", target: "baseline", text: resolved.text });
    await controller.analyze("baseline");
    expect(state.phase).toBe("baseline_ready");
    expect(state.baseline.analysis?.rules).toHaveLength(6);

    const baselineSpec = requireValue(state.baseline.analysis, "baseline spec");
    const baselineAnalysisId = requireValue(
      state.baseline.analysisId,
      "baseline analysis ID",
    );
    const baselineFindings = evaluatePolicy(baselineSpec, scenario.records);
    expect(baselineFindings).toHaveLength(18);
    const baselineRelease = createReleaseSnapshot({
      releaseId: "mfs-v1",
      displayVersion: "v1",
      releaseVersion: "1.0.0",
      policyText: state.baseline.text,
      spec: baselineSpec,
      findings: baselineFindings,
      analysisMetadata: requireValue(
        state.baseline.analysisMetadata,
        "baseline metadata",
      ),
      status: "published",
      approvedRevision: state.baseline.revision,
      approvedAnalysisId: baselineAnalysisId,
      publishedAt: "2026-07-19T04:01:00.000Z",
    });
    dispatch({ type: "BASELINE_RELEASE_CREATED", release: baselineRelease });
    expect(state.phase).toBe("baseline_published");

    dispatch({ type: "START_CANDIDATE", text: baselineRelease.policyText });
    const transformed = await createCandidateV2(
      requireValue(state.candidate, "candidate").text,
    );
    if (!transformed.ok) {
      throw new Error("Candidate quick action failed");
    }
    dispatch({
      type: "POLICY_EDITED",
      target: "candidate",
      text: transformed.text,
    });
    await controller.analyze("candidate");
    expect(state.phase).toBe("candidate_ready");
    expect(state.candidate?.analysis?.rules).toHaveLength(7);

    const candidate = requireValue(state.candidate, "candidate");
    const candidateSpec = requireValue(candidate.analysis, "candidate spec");
    verifyFixtureExpectations({
      baselineSpec: baselineRelease.spec,
      candidateSpec,
      records: scenario.records,
      expectations: scenario.expectations,
    });
    const preview = computeImpact(
      baselineRelease.spec,
      candidateSpec,
      scenario.records,
    );
    const candidateFindings = evaluatePolicy(candidateSpec, scenario.records);
    expect(candidateFindings).toHaveLength(16);
    expect(preview.removed).toHaveLength(3);
    expect(preview.added).toHaveLength(1);
    expect(preview.unchanged).toHaveLength(15);
    const impact = createImpactComputation({
      preview,
      candidateFindings,
      baselineReleaseId: "mfs-v1",
      candidateRevision: candidate.revision,
      candidateAnalysisId: requireValue(candidate.analysisId, "candidate analysis ID"),
    });
    dispatch({ type: "IMPACT_COMPUTED", computation: impact });
    dispatch({ type: "APPROVE_CANDIDATE" });

    const approved = requireValue(state.candidate, "approved candidate");
    const candidateRelease = createReleaseSnapshot({
      releaseId: "mfs-v2",
      displayVersion: "v2",
      releaseVersion: "1.1.0",
      policyText: approved.text,
      spec: requireValue(approved.analysis, "approved candidate spec"),
      findings: impact.candidateFindings,
      analysisMetadata: requireValue(
        approved.analysisMetadata,
        "candidate metadata",
      ),
      status: "published",
      approvedRevision: approved.revision,
      approvedAnalysisId: requireValue(
        approved.analysisId,
        "approved candidate analysis ID",
      ),
      publishedAt: "2026-07-19T04:02:00.000Z",
    });
    dispatch({ type: "CANDIDATE_RELEASE_CREATED", release: candidateRelease });

    expect(state.phase).toBe("published");
    expect(state.mode).toBe("live");
    expect(state.releases.map((release) => release.releaseId)).toEqual([
      "mfs-v1",
      "mfs-v2",
    ]);
    expect(state.releases[0]?.findings).toHaveLength(18);
    expect(state.releases[1]?.findings).toHaveLength(16);
    expect(
      state.releases.every(
        (release) =>
          release.analysisMetadata.mode === "live" &&
          release.analysisMetadata.model === "gpt-5.6",
      ),
    ).toBe(true);
    expect(calls.map((call) => call.targetVersion)).toEqual([
      "draft-v1",
      "1.0.0",
      "1.1.0",
    ]);
    expect(calls).toHaveLength(3);
    expect(execute).toHaveBeenCalledTimes(3);
    expect(
      events.filter((event) => event.type === "ANALYSIS_STARTED"),
    ).toHaveLength(3);
    expect(
      events.filter((event) => event.type === "ANALYSIS_SUCCEEDED"),
    ).toHaveLength(3);
    expect(Object.isFrozen(state.releases[0])).toBe(true);
    expect(Object.isFrozen(state.releases[1])).toBe(true);
    expect(selectBaselineRelease(state)).toBe(baselineRelease);
  });

  it("keeps only the latest same-revision completion and aborts the superseded signal", async () => {
    const scenario = loadDemoScenario(process.cwd(), true);
    let state = createInitialDemoState({
      initialDraftText: scenario.initialDraftText,
      liveModeAvailable: true,
      mode: "live",
    });
    const events: DemoEvent[] = [];
    const dispatch = (event: DemoEvent): void => {
      events.push(event);
      state = demoReducer(state, event);
    };
    const pending: Array<{
      readonly signal: AbortSignal;
      readonly resolve: (result: AnalyzePolicyResult) => void;
    }> = [];
    const execute: AnalyzeExecutor = (_request, signal) =>
      new Promise((resolve) => {
        pending.push({ signal, resolve });
      });
    const controller = new PolicyAnalysisController({
      getState: () => state,
      dispatch,
      execute,
    });

    const first = controller.analyze("baseline");
    await Promise.resolve();
    const second = controller.analyze("baseline");
    await Promise.resolve();
    expect(pending).toHaveLength(2);
    expect(pending[0]?.signal.aborted).toBe(true);
    expect(pending[1]?.signal.aborted).toBe(false);
    expect(
      events.filter((event) => event.type === "ANALYSIS_STARTED"),
    ).toHaveLength(1);

    const result = Object.freeze({
      spec: scenario.sampleAnalyses["draft-v1"].analysis,
      metadata: liveMetadata("req_latest"),
    });
    pending[0]!.resolve(result);
    await first;
    expect(state.phase).toBe("draft_analyzing");
    pending[1]!.resolve(result);
    await second;
    expect(state.phase).toBe("draft_blocked");
    expect(state.baseline.analysisMetadata?.requestId).toBe("req_latest");
    expect(
      events.filter((event) => event.type === "ANALYSIS_SUCCEEDED"),
    ).toHaveLength(1);

    const beforeStale = state;
    dispatch({ type: "POLICY_EDITED", target: "baseline", text: scenario.policyV1 });
    const afterEdit = state;
    state = demoReducer(state, {
      type: "ANALYSIS_SUCCEEDED",
      target: "baseline",
      requestedRevision: beforeStale.baseline.revision,
      spec: scenario.sampleAnalyses["draft-v1"].analysis,
      metadata: liveMetadata("req_stale"),
    });
    expect(state).toBe(afterEdit);
  });

  it("keeps a Live failure in Live mode with no old-current result or fallback", async () => {
    const scenario = loadDemoScenario(process.cwd(), true);
    let state: DemoState = createInitialDemoState({
      initialDraftText: scenario.initialDraftText,
      liveModeAvailable: true,
      mode: "live",
    });
    const dispatch = (event: DemoEvent): void => {
      state = demoReducer(state, event);
    };
    const execute = vi.fn<AnalyzeExecutor>().mockRejectedValue(
      createAppError(
        "ANALYSIS_UPSTREAM_ERROR",
        "Live policy analysis is temporarily unavailable. Your policy was not changed.",
        true,
      ),
    );
    const controller = new PolicyAnalysisController({
      getState: () => state,
      dispatch,
      execute,
    });

    await controller.analyze("baseline");
    expect(execute).toHaveBeenCalledOnce();
    expect(state.mode).toBe("live");
    expect(state.phase).toBe("draft_editing");
    expect(state.baseline.analysis).toBeNull();
    expect(state.baseline.analysisMetadata).toBeNull();
    expect(state.error?.code).toBe("ANALYSIS_UPSTREAM_ERROR");

    dispatch({ type: "MODE_CHANGED", mode: "sample" });
    expect(state.mode).toBe("sample");
    expect(state.phase).toBe("draft_editing");
    expect(state.baseline.text).toBe(scenario.initialDraftText);
    expect(execute).toHaveBeenCalledOnce();
  });
});
