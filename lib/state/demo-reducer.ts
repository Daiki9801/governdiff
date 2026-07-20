import type { PolicySpec, RuleId } from "../domain/types";
import { createAppError } from "../errors/app-error";
import type { DemoEvent } from "./demo-events";
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
  createInitialDemoState,
  hasCurrentImpact,
  selectBaselineRelease,
  selectCandidateRelease,
  type DemoState,
  type RevisionedPolicy,
} from "./demo-state";

const DRAFT_RULE_IDS: readonly RuleId[] = [
  "EXP-RCT-001",
  "EXP-REQ-001",
  "EXP-REQ-002",
  "EXP-REQ-003",
  "EXP-WKD-001",
];
const BASELINE_RULE_IDS: readonly RuleId[] = [
  "EXP-LDG-001",
  "EXP-RCT-001",
  "EXP-REQ-001",
  "EXP-REQ-002",
  "EXP-REQ-003",
  "EXP-WKD-001",
];
const CANDIDATE_RULE_IDS: readonly RuleId[] = [
  "EXP-LDG-001",
  "EXP-RCT-001",
  "EXP-REQ-001",
  "EXP-REQ-002",
  "EXP-REQ-003",
  "EXP-RID-001",
  "EXP-WKD-001",
];
const DRAFT_AMBIGUITY =
  "Unusually high lodging expenses require manager review.";

function invalid(state: DemoState, detail: string): DemoState {
  return {
    ...state,
    error: createAppError(
      "STATE_TRANSITION_INVALID",
      "That action is not available in the current state.",
      false,
      detail,
    ),
  };
}

function sameRuleIds(spec: PolicySpec, expected: readonly RuleId[]): boolean {
  return (
    spec.rules.length === expected.length &&
    spec.rules.every((rule, index) => rule.ruleId === expected[index])
  );
}

function validDraftSpec(spec: PolicySpec): boolean {
  return (
    Object.isFrozen(spec) &&
    spec.version === "draft-v1" &&
    sameRuleIds(spec, DRAFT_RULE_IDS) &&
    spec.ambiguities.length === 1 &&
    spec.ambiguities[0]?.blocking === true &&
    spec.ambiguities[0]?.sourceQuote === DRAFT_AMBIGUITY &&
    spec.unsupportedStatements.length === 0
  );
}

function validReadySpec(
  spec: PolicySpec,
  version: "1.0.0" | "1.1.0",
): boolean {
  return (
    Object.isFrozen(spec) &&
    spec.version === version &&
    sameRuleIds(spec, version === "1.0.0" ? BASELINE_RULE_IDS : CANDIDATE_RULE_IDS) &&
    spec.ambiguities.length === 0 &&
    spec.unsupportedStatements.length === 0
  );
}

function clearedPolicy(policy: RevisionedPolicy): RevisionedPolicy {
  return {
    ...policy,
    analysis: null,
    analysisRevision: null,
    analysisId: null,
    analysisMetadata: null,
    approvalRevision: null,
    approvedAnalysisId: null,
  };
}

function editedPolicy(policy: RevisionedPolicy, text: string): RevisionedPolicy {
  return {
    ...clearedPolicy(policy),
    text,
    revision: policy.revision + 1,
  };
}

function retainedBaselineFinding(state: DemoState): string | null {
  const selected = state.selectedFindingKey;
  if (selected === null) {
    return null;
  }
  return (
    selectBaselineRelease(state)?.findings.some(
      (finding) => finding.findingKey === selected,
    ) === true
  )
    ? selected
    : null;
}

function requestedPolicy(
  state: DemoState,
  target: "baseline" | "candidate",
): RevisionedPolicy | null {
  return target === "baseline" ? state.baseline : state.candidate;
}

function sameCanonicalValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sameFindingKeys(
  left: readonly { readonly findingKey: string }[],
  right: readonly { readonly findingKey: string }[],
): boolean {
  return (
    left.length === right.length &&
    left.every((finding, index) => finding.findingKey === right[index]?.findingKey)
  );
}

export function demoReducer(state: DemoState, event: DemoEvent): DemoState {
  if (
    (event.type === "ANALYSIS_SUCCEEDED" || event.type === "ANALYSIS_FAILED") &&
    requestedPolicy(state, event.target)?.revision !== event.requestedRevision
  ) {
    return state;
  }

  switch (event.type) {
    case "MODE_CHANGED":
      if (!canChangeMode(state, event.mode)) {
        return invalid(state, "MODE_CHANGE_INVALID");
      }
      return createInitialDemoState({
        initialDraftText: state.initialDraftText,
        liveModeAvailable: state.liveModeAvailable,
        mode: event.mode,
      });

    case "RESET_SCENARIO":
      if (!canResetScenario(state)) {
        return invalid(state, "RESET_INVALID");
      }
      return createInitialDemoState({
        initialDraftText: state.initialDraftText,
        liveModeAvailable: state.liveModeAvailable,
        mode: state.mode,
      });

    case "POLICY_EDITED":
      if (event.target === "baseline") {
        if (
          selectBaselineRelease(state) !== null ||
          state.phase === "draft_analyzing" ||
          state.phase === "baseline_analyzing" ||
          state.phase === "candidate_analyzing"
        ) {
          return invalid(state, "BASELINE_EDIT_INVALID");
        }
        return {
          ...state,
          phase:
            state.phase === "draft_editing" ? "draft_editing" : "baseline_editing",
          baseline: editedPolicy(state.baseline, event.text),
          impact: null,
          selectedFindingKey: null,
          error: null,
        };
      }
      if (
        state.candidate === null ||
        selectCandidateRelease(state) !== null ||
        state.phase === "candidate_analyzing"
      ) {
        return invalid(state, "CANDIDATE_EDIT_INVALID");
      }
      return {
        ...state,
        phase: "candidate_editing",
        candidate: editedPolicy(state.candidate, event.text),
        impact: null,
        selectedFindingKey: retainedBaselineFinding(state),
        error: null,
      };

    case "ANALYSIS_STARTED":
      if (event.target === "baseline") {
        if (!canAnalyzeBaseline(state) || event.requestedRevision !== state.baseline.revision) {
          return invalid(state, "BASELINE_ANALYSIS_START_INVALID");
        }
        return {
          ...state,
          phase:
            state.phase === "draft_editing" ? "draft_analyzing" : "baseline_analyzing",
          baseline: clearedPolicy(state.baseline),
          impact: null,
          selectedFindingKey: retainedBaselineFinding(state),
          error: null,
        };
      }
      if (
        !canAnalyzeCandidate(state) ||
        state.candidate === null ||
        event.requestedRevision !== state.candidate.revision
      ) {
        return invalid(state, "CANDIDATE_ANALYSIS_START_INVALID");
      }
      return {
        ...state,
        phase: "candidate_analyzing",
        candidate: clearedPolicy(state.candidate),
        impact: null,
        selectedFindingKey: retainedBaselineFinding(state),
        error: null,
      };

    case "ANALYSIS_SUCCEEDED": {
      const analysisId = state.analysisSequence + 1;
      if (event.target === "baseline") {
        const isDraft = state.phase === "draft_analyzing";
        if (
          (!isDraft && state.phase !== "baseline_analyzing") ||
          !(isDraft ? validDraftSpec(event.spec) : validReadySpec(event.spec, "1.0.0"))
        ) {
          return invalid(state, "BASELINE_ANALYSIS_RESULT_INVALID");
        }
        return {
          ...state,
          phase: isDraft ? "draft_blocked" : "baseline_ready",
          baseline: {
            ...state.baseline,
            analysis: event.spec,
            analysisRevision: state.baseline.revision,
            analysisId,
            analysisMetadata: event.metadata,
            approvalRevision: null,
            approvedAnalysisId: null,
          },
          analysisSequence: analysisId,
          impact: null,
          selectedFindingKey: retainedBaselineFinding(state),
          error: null,
        };
      }
      if (
        state.phase !== "candidate_analyzing" ||
        state.candidate === null ||
        !validReadySpec(event.spec, "1.1.0")
      ) {
        return invalid(state, "CANDIDATE_ANALYSIS_RESULT_INVALID");
      }
      return {
        ...state,
        phase: "candidate_ready",
        candidate: {
          ...state.candidate,
          analysis: event.spec,
          analysisRevision: state.candidate.revision,
          analysisId,
          analysisMetadata: event.metadata,
          approvalRevision: null,
          approvedAnalysisId: null,
        },
        analysisSequence: analysisId,
        impact: null,
        selectedFindingKey: retainedBaselineFinding(state),
        error: null,
      };
    }

    case "ANALYSIS_FAILED":
      if (event.target === "baseline") {
        if (state.phase !== "draft_analyzing" && state.phase !== "baseline_analyzing") {
          return invalid(state, "BASELINE_ANALYSIS_FAILURE_INVALID");
        }
        return {
          ...state,
          phase: state.phase === "draft_analyzing" ? "draft_editing" : "baseline_editing",
          error: event.error,
        };
      }
      if (state.phase !== "candidate_analyzing" || state.candidate === null) {
        return invalid(state, "CANDIDATE_ANALYSIS_FAILURE_INVALID");
      }
      return { ...state, phase: "candidate_editing", error: event.error };

    case "BASELINE_RELEASE_CREATED": {
      const release = event.release;
      if (
        !canCreateBaselineRelease(state) ||
        !Object.isFrozen(release) ||
        !Object.isFrozen(release.spec) ||
        !Object.isFrozen(release.findings) ||
        !Object.isFrozen(release.analysisMetadata) ||
        release.releaseId !== "mfs-v1" ||
        release.displayVersion !== "v1" ||
        release.releaseVersion !== "1.0.0" ||
        release.policyText !== state.baseline.text ||
        release.spec.version !== "1.0.0" ||
        !sameCanonicalValue(release.spec, state.baseline.analysis) ||
        !sameCanonicalValue(
          release.analysisMetadata,
          state.baseline.analysisMetadata,
        ) ||
        release.findings.length !== 18 ||
        release.approvedRevision !== state.baseline.revision ||
        release.approvedAnalysisId !== state.baseline.analysisId
      ) {
        return invalid(state, "BASELINE_RELEASE_INVALID");
      }
      return {
        ...state,
        phase: "baseline_published",
        baseline: {
          ...state.baseline,
          approvalRevision: state.baseline.revision,
          approvedAnalysisId: state.baseline.analysisId,
        },
        releases: Object.freeze([...state.releases, release]),
        selectedFindingKey: null,
        error: null,
      };
    }

    case "START_CANDIDATE": {
      const baselineRelease = selectBaselineRelease(state);
      if (
        !canStartCandidate(state) ||
        baselineRelease === null ||
        event.text !== baselineRelease.policyText
      ) {
        return invalid(state, "CANDIDATE_START_INVALID");
      }
      return {
        ...state,
        phase: "candidate_editing",
        candidate: {
          text: event.text,
          revision: 0,
          analysis: null,
          analysisRevision: null,
          analysisId: null,
          analysisMetadata: null,
          approvalRevision: null,
          approvedAnalysisId: null,
        },
        impact: null,
        selectedFindingKey: null,
        error: null,
      };
    }

    case "IMPACT_COMPUTED": {
      const computation = event.computation;
      if (
        !canComputeImpact(state) ||
        state.candidate === null ||
        !Object.isFrozen(computation) ||
        !Object.isFrozen(computation.preview) ||
        !Object.isFrozen(computation.candidateFindings) ||
        computation.baselineReleaseId !== "mfs-v1" ||
        computation.candidateRevision !== state.candidate.revision ||
        computation.candidateAnalysisId !== state.candidate.analysisId ||
        computation.preview.baselineCount !== 18 ||
        computation.preview.candidateCount !== 16 ||
        computation.preview.removed.length !== 3 ||
        computation.preview.added.length !== 1 ||
        computation.preview.unchanged.length !== 15 ||
        computation.candidateFindings.length !== 16
      ) {
        return invalid(state, "IMPACT_RESULT_INVALID");
      }
      return {
        ...state,
        phase: "impact_ready",
        impact: computation,
        candidate: {
          ...state.candidate,
          approvalRevision: null,
          approvedAnalysisId: null,
        },
        selectedFindingKey: null,
        error: null,
      };
    }

    case "APPROVE_CANDIDATE":
      if (!canApproveCandidate(state) || state.candidate === null) {
        return invalid(state, "CANDIDATE_APPROVAL_INVALID");
      }
      return {
        ...state,
        phase: "candidate_approved",
        candidate: {
          ...state.candidate,
          approvalRevision: state.candidate.revision,
          approvedAnalysisId: state.candidate.analysisId,
        },
        error: null,
      };

    case "CANDIDATE_RELEASE_CREATED": {
      const release = event.release;
      if (
        !canPublishCandidate(state) ||
        state.candidate === null ||
        !hasCurrentImpact(state) ||
        !Object.isFrozen(release) ||
        !Object.isFrozen(release.spec) ||
        !Object.isFrozen(release.findings) ||
        !Object.isFrozen(release.analysisMetadata) ||
        release.releaseId !== "mfs-v2" ||
        release.displayVersion !== "v2" ||
        release.releaseVersion !== "1.1.0" ||
        release.policyText !== state.candidate.text ||
        release.spec.version !== "1.1.0" ||
        !sameCanonicalValue(release.spec, state.candidate.analysis) ||
        !sameCanonicalValue(
          release.analysisMetadata,
          state.candidate.analysisMetadata,
        ) ||
        release.findings.length !== 16 ||
        !sameFindingKeys(release.findings, state.impact!.candidateFindings) ||
        release.approvedRevision !== state.candidate.revision ||
        release.approvedAnalysisId !== state.candidate.analysisId
      ) {
        return invalid(state, "CANDIDATE_RELEASE_INVALID");
      }
      return {
        ...state,
        phase: "published",
        releases: Object.freeze([...state.releases, release]),
        error: null,
      };
    }

    case "FINDING_SELECTED":
      if (!canSelectFinding(state, event.key)) {
        return invalid(state, "FINDING_SELECTION_INVALID");
      }
      return { ...state, selectedFindingKey: event.key, error: null };
  }
}
