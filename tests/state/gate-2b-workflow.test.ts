import { describe, expect, it } from "vitest";

import { PolicyAnalysisController } from "../../lib/analysis/policy-analysis-controller";
import { SamplePolicyAnalyzer } from "../../lib/analysis/sample-policy-analyzer";
import { evaluatePolicy } from "../../lib/domain/policy-runtime";
import { loadDemoScenario } from "../../lib/demo/fixture-loader.server";
import { resolveLodgingThreshold } from "../../lib/demo/quick-actions";
import type { DemoEvent } from "../../lib/state/demo-events";
import { demoReducer } from "../../lib/state/demo-reducer";
import {
  canCreateBaselineRelease,
  createInitialDemoState,
  createReleaseSnapshot,
  selectBaselineRelease,
} from "../../lib/state/demo-state";

function workflow() {
  const scenario = loadDemoScenario(process.cwd(), false);
  const analyzer = new SamplePolicyAnalyzer(scenario.sampleAnalyses, {
    now: () => new Date("2026-07-19T00:00:00.000Z"),
    timer: () => 10,
  });
  let state = createInitialDemoState({
    initialDraftText: scenario.initialDraftText,
    liveModeAvailable: false,
  });
  const dispatch = (event: DemoEvent) => {
    state = demoReducer(state, event);
  };
  const controller = new PolicyAnalysisController({
    getState: () => state,
    dispatch,
    execute: (request) => analyzer.analyze(request),
  });
  return {
    scenario,
    controller,
    dispatch,
    getState: () => state,
  };
}

describe("Gate 2B network-free baseline workflow", () => {
  it("runs the canonical draft-to-immutable-v1 flow", async () => {
    const flow = workflow();
    const scenarioSnapshot = JSON.stringify(flow.scenario);
    const recordsSnapshot = JSON.stringify(flow.scenario.records);

    expect(flow.getState().phase).toBe("draft_editing");
    expect(flow.getState().baseline.text).toBe(flow.scenario.initialDraftText);

    await flow.controller.analyze("baseline");
    let state = flow.getState();
    expect(state.phase).toBe("draft_blocked");
    expect(state.baseline.analysis?.rules).toHaveLength(5);
    expect(state.baseline.analysis?.ambiguities).toEqual([
      expect.objectContaining({
        sourceQuote: "Unusually high lodging expenses require manager review.",
        blocking: true,
      }),
    ]);
    expect(
      state.baseline.analysis?.rules.some(
        (rule) => rule.ruleId === "EXP-LDG-001",
      ),
    ).toBe(false);
    expect(state.baseline.analysisMetadata).toEqual(
      expect.objectContaining({ mode: "sample", model: null, requestId: null }),
    );

    const initialRevision = state.baseline.revision;
    const resolved = await resolveLodgingThreshold(state.baseline.text);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) {
      throw new Error("Canonical lodging resolution unexpectedly failed");
    }
    flow.dispatch({
      type: "POLICY_EDITED",
      target: "baseline",
      text: resolved.text,
    });
    state = flow.getState();
    expect(state.phase).toBe("baseline_editing");
    expect(state.baseline.revision).toBe(initialRevision + 1);
    expect(state.baseline.analysis).toBeNull();
    expect(state.baseline.text).toBe(flow.scenario.policyV1);

    await flow.controller.analyze("baseline");
    state = flow.getState();
    expect(state.phase).toBe("baseline_ready");
    expect(state.baseline.analysis?.rules).toHaveLength(6);
    expect(state.baseline.analysis?.ambiguities).toHaveLength(0);
    expect(state.baseline.analysis?.unsupportedStatements).toHaveLength(0);
    expect(canCreateBaselineRelease(state)).toBe(true);

    const findings = evaluatePolicy(
      state.baseline.analysis!,
      flow.scenario.records,
    );
    const expectedKeys = flow.scenario.expectations.baseline_release.findings
      .map((finding) => finding.finding_key)
      .sort();
    expect(findings).toHaveLength(18);
    expect(findings.map((finding) => finding.findingKey).sort()).toEqual(
      expectedKeys,
    );

    const release = createReleaseSnapshot({
      releaseId: "mfs-v1",
      displayVersion: "v1",
      releaseVersion: "1.0.0",
      policyText: state.baseline.text,
      spec: state.baseline.analysis!,
      findings,
      analysisMetadata: state.baseline.analysisMetadata!,
      status: "published",
      approvedRevision: state.baseline.revision,
      approvedAnalysisId: state.baseline.analysisId!,
      publishedAt: "2026-07-19T00:01:00.000Z",
    });
    flow.dispatch({ type: "BASELINE_RELEASE_CREATED", release });

    state = flow.getState();
    const published = selectBaselineRelease(state);
    expect(state.phase).toBe("baseline_published");
    expect(state.releases).toHaveLength(1);
    expect(published?.findings).toHaveLength(18);
    expect(published?.analysisMetadata).toEqual(
      expect.objectContaining({ mode: "sample", model: null, requestId: null }),
    );
    expect(Object.isFrozen(published)).toBe(true);
    expect(Object.isFrozen(published?.spec)).toBe(true);
    expect(Object.isFrozen(published?.findings)).toBe(true);
    expect(state.candidate).toBeNull();
    expect(state.impact).toBeNull();
    expect(JSON.stringify(flow.scenario.records)).toBe(recordsSnapshot);
    expect(JSON.stringify(flow.scenario)).toBe(scenarioSnapshot);

    flow.controller.cancel();
    flow.dispatch({ type: "RESET_SCENARIO" });
    state = flow.getState();
    expect(state.phase).toBe("draft_editing");
    expect(state.mode).toBe("sample");
    expect(state.baseline.text).toBe(flow.scenario.initialDraftText);
    expect(state.releases).toEqual([]);
    expect(state.candidate).toBeNull();
    expect(state.impact).toBeNull();
  });

  it("fails unsupported Sample text safely and recovers through reset", async () => {
    const flow = workflow();
    flow.dispatch({
      type: "POLICY_EDITED",
      target: "baseline",
      text: `${flow.scenario.initialDraftText}x`,
    });

    await flow.controller.analyze("baseline");
    let state = flow.getState();
    expect(state.phase).toBe("draft_editing");
    expect(state.error).toEqual(
      expect.objectContaining({
        code: "SAMPLE_VARIANT_UNSUPPORTED",
        message: "This policy text is not available in Sample Mode.",
      }),
    );
    expect(state.baseline.analysis).toBeNull();

    flow.controller.cancel();
    flow.dispatch({ type: "RESET_SCENARIO" });
    state = flow.getState();
    expect(state.phase).toBe("draft_editing");
    expect(state.error).toBeNull();
    expect(state.baseline.text).toBe(flow.scenario.initialDraftText);

    await flow.controller.analyze("baseline");
    expect(flow.getState().phase).toBe("draft_blocked");
  });
});
