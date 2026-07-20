import { describe, expect, it } from "vitest";

import { PolicyAnalysisController } from "../../lib/analysis/policy-analysis-controller";
import { SamplePolicyAnalyzer } from "../../lib/analysis/sample-policy-analyzer";
import { computeImpact } from "../../lib/domain/impact-engine";
import { evaluatePolicy } from "../../lib/domain/policy-runtime";
import type { PolicyRule } from "../../lib/domain/types";
import {
  normalizedPolicySha256,
} from "../../lib/demo/fixture-contract";
import { verifyFixtureExpectations } from "../../lib/demo/fixture-expectation-guard";
import { loadDemoScenario } from "../../lib/demo/fixture-loader.server";
import {
  createCandidateV2,
  resolveLodgingThreshold,
} from "../../lib/demo/quick-actions";
import type { DemoEvent } from "../../lib/state/demo-events";
import { demoReducer } from "../../lib/state/demo-reducer";
import {
  canApproveCandidate,
  canComputeImpact,
  canPublishCandidate,
  canSelectFinding,
  canStartCandidate,
  createImpactComputation,
  createInitialDemoState,
  createReleaseSnapshot,
  hasCurrentImpact,
  selectBaselineRelease,
  selectCandidateRelease,
  selectVisibleFindings,
  type DemoState,
  type ImpactComputation,
  type ReleaseSnapshot,
} from "../../lib/state/demo-state";

const V2_SHA256 =
  "1d6e521b4b8715c74bdebfbf6518e61686e207cb450847f0541097f443fd6b63";
const REMOVED_KEYS = [
  "mfs-global-expense|EXP-RCT-001|MFS-EXP-004",
  "mfs-global-expense|EXP-RCT-001|MFS-EXP-005",
  "mfs-global-expense|EXP-RCT-001|MFS-EXP-006",
] as const;
const ADDED_KEY = "mfs-global-expense|EXP-RID-001|MFS-EXP-015";
const RULE_IDS = [
  "EXP-LDG-001",
  "EXP-RCT-001",
  "EXP-REQ-001",
  "EXP-REQ-002",
  "EXP-REQ-003",
  "EXP-RID-001",
  "EXP-WKD-001",
] as const;

function requireValue<T>(value: T | null | undefined, label: string): T {
  if (value === null || value === undefined) {
    throw new Error(`Missing ${label}`);
  }
  return value;
}

function predicateValues(rule: PolicyRule): readonly unknown[] {
  const predicates =
    rule.condition.kind === "predicate"
      ? [rule.condition]
      : rule.condition.conditions;
  return predicates.map((predicate) => [
    predicate.field,
    predicate.operator,
    predicate.value,
  ]);
}

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
  const dispatch = (event: DemoEvent): void => {
    state = demoReducer(state, event);
  };
  const controller = new PolicyAnalysisController({
    getState: () => state,
    dispatch,
    execute: (request) => analyzer.analyze(request),
  });

  async function publishBaseline(): Promise<ReleaseSnapshot> {
    await controller.analyze("baseline");
    const resolved = await resolveLodgingThreshold(state.baseline.text);
    if (!resolved.ok) {
      throw new Error("Baseline quick action failed");
    }
    dispatch({ type: "POLICY_EDITED", target: "baseline", text: resolved.text });
    await controller.analyze("baseline");
    const analysis = requireValue(state.baseline.analysis, "baseline analysis");
    const metadata = requireValue(
      state.baseline.analysisMetadata,
      "baseline analysis metadata",
    );
    const analysisId = requireValue(state.baseline.analysisId, "baseline analysis ID");
    const release = createReleaseSnapshot({
      releaseId: "mfs-v1",
      displayVersion: "v1",
      releaseVersion: "1.0.0",
      policyText: state.baseline.text,
      spec: analysis,
      findings: evaluatePolicy(analysis, scenario.records),
      analysisMetadata: metadata,
      status: "published",
      approvedRevision: state.baseline.revision,
      approvedAnalysisId: analysisId,
      publishedAt: "2026-07-19T00:01:00.000Z",
    });
    dispatch({ type: "BASELINE_RELEASE_CREATED", release });
    return release;
  }

  async function prepareCandidate(): Promise<void> {
    const baselineRelease = requireValue(
      selectBaselineRelease(state),
      "published baseline",
    );
    dispatch({ type: "START_CANDIDATE", text: baselineRelease.policyText });
    const transformed = await createCandidateV2(
      requireValue(state.candidate, "candidate").text,
    );
    if (!transformed.ok) {
      throw new Error("Candidate quick action failed");
    }
    dispatch({ type: "POLICY_EDITED", target: "candidate", text: transformed.text });
    await controller.analyze("candidate");
  }

  function computeCurrentImpact(): ImpactComputation {
    const baseline = requireValue(selectBaselineRelease(state), "baseline release");
    const candidate = requireValue(state.candidate, "candidate");
    const analysis = requireValue(candidate.analysis, "candidate analysis");
    const analysisId = requireValue(candidate.analysisId, "candidate analysis ID");
    verifyFixtureExpectations({
      baselineSpec: baseline.spec,
      candidateSpec: analysis,
      records: scenario.records,
      expectations: scenario.expectations,
    });
    const preview = computeImpact(baseline.spec, analysis, scenario.records);
    const candidateFindings = evaluatePolicy(analysis, scenario.records);
    const computation = createImpactComputation({
      preview,
      candidateFindings,
      baselineReleaseId: "mfs-v1",
      candidateRevision: candidate.revision,
      candidateAnalysisId: analysisId,
    });
    dispatch({ type: "IMPACT_COMPUTED", computation });
    return computation;
  }

  return {
    scenario,
    controller,
    dispatch,
    publishBaseline,
    prepareCandidate,
    computeCurrentImpact,
    getState: (): DemoState => state,
  };
}

describe("Gate 2C deterministic candidate workflow", () => {
  it("publishes immutable v1 then runs the exact candidate and Impact contract", async () => {
    const flow = workflow();
    const scenarioSnapshot = JSON.stringify(flow.scenario);
    const baseline = await flow.publishBaseline();
    const baselineSnapshot = JSON.stringify(baseline);

    expect(flow.getState().phase).toBe("baseline_published");
    expect(baseline.findings).toHaveLength(18);
    expect(canStartCandidate(flow.getState())).toBe(true);

    flow.dispatch({ type: "START_CANDIDATE", text: baseline.policyText });
    let state = flow.getState();
    expect(state.phase).toBe("candidate_editing");
    expect(state.candidate?.text).toBe(baseline.policyText);
    expect(state.candidate?.revision).toBe(0);
    expect(state.releases[0]).toBe(baseline);

    const sourceText = requireValue(state.candidate, "candidate").text;
    const transformed = await createCandidateV2(sourceText);
    expect(transformed.ok).toBe(true);
    if (!transformed.ok) {
      throw new Error("Candidate quick action unexpectedly failed");
    }
    expect(await normalizedPolicySha256(transformed.text)).toBe(V2_SHA256);
    expect(transformed.text).toBe(flow.scenario.policyV2);
    expect(sourceText).toBe(baseline.policyText);

    flow.dispatch({
      type: "POLICY_EDITED",
      target: "candidate",
      text: transformed.text,
    });
    state = flow.getState();
    expect(state.candidate?.revision).toBe(1);
    expect(state.candidate?.analysis).toBeNull();

    await flow.controller.analyze("candidate");
    state = flow.getState();
    expect(state.phase).toBe("candidate_ready");
    expect(state.candidate?.analysis?.version).toBe("1.1.0");
    expect(state.candidate?.analysis?.rules.map((rule) => rule.ruleId)).toEqual(
      RULE_IDS,
    );
    expect(state.candidate?.analysis?.ambiguities).toHaveLength(0);
    expect(state.candidate?.analysis?.unsupportedStatements).toHaveLength(0);
    expect(canComputeImpact(state)).toBe(true);

    const receiptRule = requireValue(
      state.candidate?.analysis?.rules.find(
        (rule) => rule.ruleId === "EXP-RCT-001",
      ),
      "receipt rule",
    );
    const rideshareRule = requireValue(
      state.candidate?.analysis?.rules.find(
        (rule) => rule.ruleId === "EXP-RID-001",
      ),
      "rideshare rule",
    );
    expect(predicateValues(receiptRule)).toEqual([
      ["amount_usd", "gte", 15000],
      ["receipt_attached", "eq", false],
    ]);
    expect(predicateValues(rideshareRule)).toEqual([
      ["category", "eq", "rideshare"],
      ["amount_usd", "gt", 12000],
      ["manager_preapproved", "eq", false],
    ]);

    const computation = flow.computeCurrentImpact();
    state = flow.getState();
    expect(state.phase).toBe("impact_ready");
    expect(hasCurrentImpact(state)).toBe(true);
    expect(computation.preview.baselineCount).toBe(18);
    expect(computation.preview.candidateCount).toBe(16);
    expect(computation.preview.removed.map((finding) => finding.findingKey)).toEqual(
      REMOVED_KEYS,
    );
    expect(computation.preview.added.map((finding) => finding.findingKey)).toEqual([
      ADDED_KEY,
    ]);
    expect(computation.preview.unchanged).toHaveLength(15);
    expect(computation.preview.ruleDiff.map(({ ruleId, kind }) => ({ ruleId, kind }))).toEqual([
      { ruleId: "EXP-RCT-001", kind: "modified" },
      { ruleId: "EXP-RID-001", kind: "added" },
    ]);
    expect(computation.candidateFindings).toHaveLength(16);
    expect(Object.isFrozen(computation)).toBe(true);
    expect(Object.isFrozen(computation.preview)).toBe(true);
    expect(Object.isFrozen(computation.preview.removed[0]?.observed)).toBe(true);
    expect(Object.isFrozen(computation.candidateFindings)).toBe(true);
    expect(computation.candidateRevision).toBe(state.candidate?.revision);
    expect(computation.candidateAnalysisId).toBe(state.candidate?.analysisId);

    const visible = selectVisibleFindings(state);
    const visibleKeys = visible.map((finding) => finding.findingKey);
    expect(visible).toHaveLength(19);
    expect(visibleKeys).toEqual([...visibleKeys].sort());
    expect(new Set(visibleKeys).size).toBe(visible.length);
    expect(visibleKeys).toEqual(
      expect.arrayContaining([
        REMOVED_KEYS[0],
        ADDED_KEY,
        computation.preview.unchanged[0]!.findingKey,
      ]),
    );
    expect(Object.isFrozen(visible)).toBe(true);
    expect(canSelectFinding(state, REMOVED_KEYS[0])).toBe(true);
    expect(canSelectFinding(state, ADDED_KEY)).toBe(true);
    expect(canSelectFinding(state, "invalid-key")).toBe(false);

    expect(JSON.stringify(baseline)).toBe(baselineSnapshot);
    expect(flow.getState().releases[0]).toBe(baseline);
    expect(JSON.stringify(flow.scenario)).toBe(scenarioSnapshot);
  });

  it("requires current Impact before approval and publishes exact frozen v2 once", async () => {
    const flow = workflow();
    const baseline = await flow.publishBaseline();
    await flow.prepareCandidate();

    let state = flow.getState();
    const rejected = demoReducer(state, { type: "APPROVE_CANDIDATE" });
    expect(rejected.phase).toBe("candidate_ready");
    expect(rejected.candidate).toBe(state.candidate);
    expect(rejected.error?.code).toBe("STATE_TRANSITION_INVALID");
    expect(canApproveCandidate(state)).toBe(false);

    const computation = flow.computeCurrentImpact();
    state = flow.getState();
    expect(canApproveCandidate(state)).toBe(true);
    flow.dispatch({ type: "APPROVE_CANDIDATE" });
    state = flow.getState();
    expect(state.phase).toBe("candidate_approved");
    expect(state.candidate?.approvalRevision).toBe(state.candidate?.revision);
    expect(state.candidate?.approvedAnalysisId).toBe(state.candidate?.analysisId);
    expect(canPublishCandidate(state)).toBe(true);

    const candidate = requireValue(state.candidate, "approved candidate");
    const release = createReleaseSnapshot({
      releaseId: "mfs-v2",
      displayVersion: "v2",
      releaseVersion: "1.1.0",
      policyText: candidate.text,
      spec: requireValue(candidate.analysis, "candidate analysis"),
      findings: computation.candidateFindings,
      analysisMetadata: requireValue(
        candidate.analysisMetadata,
        "candidate analysis metadata",
      ),
      status: "published",
      approvedRevision: candidate.revision,
      approvedAnalysisId: requireValue(candidate.analysisId, "candidate analysis ID"),
      publishedAt: "2026-07-19T00:02:00.000Z",
    });
    flow.dispatch({ type: "CANDIDATE_RELEASE_CREATED", release });
    state = flow.getState();

    expect(state.phase).toBe("published");
    expect(state.releases).toHaveLength(2);
    expect(state.releases[0]).toBe(baseline);
    expect(selectCandidateRelease(state)).toBe(release);
    expect(release.releaseId).toBe("mfs-v2");
    expect(release.displayVersion).toBe("v2");
    expect(release.releaseVersion).toBe("1.1.0");
    expect(release.findings).toHaveLength(16);
    expect(release.findings.map((finding) => finding.findingKey)).toEqual(
      computation.candidateFindings.map((finding) => finding.findingKey),
    );
    expect(Object.isFrozen(release)).toBe(true);
    expect(Object.isFrozen(release.spec)).toBe(true);
    expect(Object.isFrozen(release.findings)).toBe(true);
    expect(Object.isFrozen(release.findings[0]?.observed)).toBe(true);

    flow.dispatch({ type: "CANDIDATE_RELEASE_CREATED", release });
    expect(flow.getState().releases).toHaveLength(2);
    expect(flow.getState().error?.code).toBe("STATE_TRANSITION_INVALID");

    flow.controller.cancel();
    flow.dispatch({ type: "RESET_SCENARIO" });
    state = flow.getState();
    expect(state.phase).toBe("draft_editing");
    expect(state.mode).toBe("sample");
    expect(state.baseline.text).toBe(flow.scenario.initialDraftText);
    expect(state.releases).toEqual([]);
    expect(state.candidate).toBeNull();
    expect(state.impact).toBeNull();
    expect(state.selectedFindingKey).toBeNull();
  });

  it("invalidates selected candidate evidence, Impact, and approval after an edit", async () => {
    const flow = workflow();
    await flow.publishBaseline();
    await flow.prepareCandidate();
    flow.computeCurrentImpact();
    flow.dispatch({ type: "FINDING_SELECTED", key: ADDED_KEY });
    flow.dispatch({ type: "APPROVE_CANDIDATE" });

    let state = flow.getState();
    expect(state.phase).toBe("candidate_approved");
    expect(state.selectedFindingKey).toBe(ADDED_KEY);
    const priorAnalysisId = state.candidate?.analysisId;
    const changedText = `${requireValue(state.candidate, "candidate").text}x`;
    flow.dispatch({ type: "POLICY_EDITED", target: "candidate", text: changedText });
    state = flow.getState();
    expect(state.phase).toBe("candidate_editing");
    expect(state.impact).toBeNull();
    expect(state.selectedFindingKey).toBeNull();
    expect(state.candidate?.analysis).toBeNull();
    expect(state.candidate?.approvalRevision).toBeNull();
    expect(state.candidate?.approvedAnalysisId).toBeNull();
    expect(state.candidate?.analysisId).not.toBe(priorAnalysisId);
    expect(canPublishCandidate(state)).toBe(false);

    await flow.controller.analyze("candidate");
    state = flow.getState();
    expect(state.phase).toBe("candidate_editing");
    expect(state.error).toEqual(
      expect.objectContaining({
        code: "SAMPLE_VARIANT_UNSUPPORTED",
        message: "This policy text is not available in Sample Mode.",
      }),
    );
    expect(state.candidate?.analysis).toBeNull();
    expect(state.impact).toBeNull();

    flow.controller.cancel();
    flow.dispatch({ type: "RESET_SCENARIO" });
    expect(flow.getState().phase).toBe("draft_editing");
    await flow.controller.analyze("baseline");
    expect(flow.getState().phase).toBe("draft_blocked");
  });

  it("copies Impact inputs instead of retaining mutable references", () => {
    const sourcePreview = {
      baselineCount: 18,
      candidateCount: 16,
      removed: [],
      added: [],
      unchanged: [],
      ruleDiff: [],
    };
    const sourceFindings: never[] = [];
    const computation = createImpactComputation({
      preview: sourcePreview,
      candidateFindings: sourceFindings,
      baselineReleaseId: "mfs-v1",
      candidateRevision: 1,
      candidateAnalysisId: 2,
    });
    sourcePreview.baselineCount = 999;
    sourceFindings.push();

    expect(computation.preview.baselineCount).toBe(18);
    expect(computation.preview).not.toBe(sourcePreview);
    expect(computation.candidateFindings).not.toBe(sourceFindings);
    expect(Object.isFrozen(computation.preview.ruleDiff)).toBe(true);
  });
});
