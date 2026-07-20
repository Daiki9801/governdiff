import { normalizePolicyText } from "../domain/policy-compiler";
import type {
  AnalysisMetadata,
  AnalysisMode,
  Condition,
  Finding,
  ImpactPreview,
  PolicyRule,
  PolicySpec,
  RuleDiffEntry,
} from "../domain/types";
import { copyAndFreezePolicySpec } from "../demo/fixture-contract";
import type { AppError } from "../errors/app-error";

export const DEMO_PHASES = Object.freeze([
  "draft_editing",
  "draft_analyzing",
  "draft_blocked",
  "baseline_editing",
  "baseline_analyzing",
  "baseline_ready",
  "baseline_published",
  "candidate_editing",
  "candidate_analyzing",
  "candidate_ready",
  "impact_ready",
  "candidate_approved",
  "published",
] as const);

export type DemoPhase = (typeof DEMO_PHASES)[number];

export interface RevisionedPolicy {
  readonly text: string;
  readonly revision: number;
  readonly analysis: PolicySpec | null;
  readonly analysisRevision: number | null;
  readonly analysisId: number | null;
  readonly analysisMetadata: AnalysisMetadata | null;
  readonly approvalRevision: number | null;
  readonly approvedAnalysisId: number | null;
}

export interface ReleaseSnapshot {
  readonly releaseId: "mfs-v1" | "mfs-v2";
  readonly displayVersion: "v1" | "v2";
  readonly releaseVersion: "1.0.0" | "1.1.0";
  readonly policyText: string;
  readonly spec: PolicySpec;
  readonly findings: readonly Finding[];
  readonly analysisMetadata: Readonly<AnalysisMetadata>;
  readonly status: "published";
  readonly approvedRevision: number;
  readonly approvedAnalysisId: number;
  readonly publishedAt: string;
}

export interface ImpactComputation {
  readonly preview: ImpactPreview;
  readonly candidateFindings: readonly Finding[];
  readonly baselineReleaseId: "mfs-v1";
  readonly candidateRevision: number;
  readonly candidateAnalysisId: number;
}

export interface DemoState {
  readonly phase: DemoPhase;
  readonly mode: AnalysisMode;
  readonly liveModeAvailable: boolean;
  readonly initialDraftText: string;
  readonly baseline: RevisionedPolicy;
  readonly candidate: RevisionedPolicy | null;
  readonly analysisSequence: number;
  readonly releases: readonly ReleaseSnapshot[];
  readonly impact: ImpactComputation | null;
  readonly selectedFindingKey: string | null;
  readonly error: AppError | null;
}

export interface CreateInitialDemoStateInput {
  readonly initialDraftText: string;
  readonly liveModeAvailable: boolean;
  readonly mode?: AnalysisMode;
}

function emptyPolicy(text: string): RevisionedPolicy {
  return {
    text,
    revision: 0,
    analysis: null,
    analysisRevision: null,
    analysisId: null,
    analysisMetadata: null,
    approvalRevision: null,
    approvedAnalysisId: null,
  };
}

export function createInitialDemoState({
  initialDraftText,
  liveModeAvailable,
  mode = "sample",
}: CreateInitialDemoStateInput): DemoState {
  if (mode === "live" && !liveModeAvailable) {
    throw new Error("Live mode is not available for this session");
  }
  const normalizedDraft = normalizePolicyText(initialDraftText);
  return {
    phase: "draft_editing",
    mode,
    liveModeAvailable,
    initialDraftText: normalizedDraft,
    baseline: emptyPolicy(normalizedDraft),
    candidate: null,
    analysisSequence: 0,
    releases: Object.freeze([]),
    impact: null,
    selectedFindingKey: null,
    error: null,
  };
}

function copyCondition(condition: Condition): Condition {
  if (condition.kind === "predicate") {
    return Object.freeze({ ...condition });
  }
  const conditions = condition.conditions.map((predicate) =>
    Object.freeze({ ...predicate }),
  );
  Object.freeze(conditions);
  return Object.freeze({ kind: "all", conditions });
}

function copyRule(rule: PolicyRule): PolicyRule {
  const evidenceFields = [...rule.evidenceFields];
  Object.freeze(evidenceFields);
  return Object.freeze({
    ...rule,
    condition: copyCondition(rule.condition),
    evidenceFields,
  });
}

function copyFinding(finding: Finding): Finding {
  return Object.freeze({
    ...finding,
    observed: Object.freeze({ ...finding.observed }),
  });
}

function copyFindings(findings: readonly Finding[]): readonly Finding[] {
  const copied = findings.map(copyFinding);
  return Object.freeze(copied);
}

function copyRuleDiff(entry: RuleDiffEntry): RuleDiffEntry {
  return Object.freeze({
    ruleId: entry.ruleId,
    kind: entry.kind,
    before: entry.before === null ? null : copyRule(entry.before),
    after: entry.after === null ? null : copyRule(entry.after),
  });
}

function copyImpactPreview(preview: ImpactPreview): ImpactPreview {
  const ruleDiff = preview.ruleDiff.map(copyRuleDiff);
  Object.freeze(ruleDiff);
  return Object.freeze({
    baselineCount: preview.baselineCount,
    candidateCount: preview.candidateCount,
    removed: copyFindings(preview.removed),
    added: copyFindings(preview.added),
    unchanged: copyFindings(preview.unchanged),
    ruleDiff,
  });
}

export function createReleaseSnapshot(
  input: ReleaseSnapshot,
): ReleaseSnapshot {
  return Object.freeze({
    releaseId: input.releaseId,
    displayVersion: input.displayVersion,
    releaseVersion: input.releaseVersion,
    policyText: input.policyText,
    spec: copyAndFreezePolicySpec(input.spec),
    findings: copyFindings(input.findings),
    analysisMetadata: Object.freeze({ ...input.analysisMetadata }),
    status: "published",
    approvedRevision: input.approvedRevision,
    approvedAnalysisId: input.approvedAnalysisId,
    publishedAt: input.publishedAt,
  });
}

export function createImpactComputation(
  input: ImpactComputation,
): ImpactComputation {
  return Object.freeze({
    preview: copyImpactPreview(input.preview),
    candidateFindings: copyFindings(input.candidateFindings),
    baselineReleaseId: "mfs-v1",
    candidateRevision: input.candidateRevision,
    candidateAnalysisId: input.candidateAnalysisId,
  });
}

export function selectBaselineRelease(state: DemoState): ReleaseSnapshot | null {
  return state.releases.find((release) => release.releaseId === "mfs-v1") ?? null;
}

export function selectCandidateRelease(state: DemoState): ReleaseSnapshot | null {
  return state.releases.find((release) => release.releaseId === "mfs-v2") ?? null;
}

export function hasCurrentAnalysis(policy: RevisionedPolicy): boolean {
  return (
    policy.analysis !== null &&
    policy.analysisRevision === policy.revision &&
    policy.analysisId !== null
  );
}

export function hasCurrentApproval(policy: RevisionedPolicy): boolean {
  return (
    hasCurrentAnalysis(policy) &&
    policy.approvalRevision === policy.revision &&
    policy.approvedAnalysisId === policy.analysisId
  );
}

export function hasCurrentImpact(state: DemoState): boolean {
  const candidate = state.candidate;
  const impact = state.impact;
  return (
    candidate !== null &&
    hasCurrentAnalysis(candidate) &&
    impact !== null &&
    impact.candidateRevision === candidate.revision &&
    impact.candidateAnalysisId === candidate.analysisId &&
    selectBaselineRelease(state)?.releaseId === impact.baselineReleaseId
  );
}

export function selectVisibleFindings(state: DemoState): readonly Finding[] {
  if (hasCurrentImpact(state) && state.impact !== null) {
    const findingsByKey = new Map<string, Finding>();
    for (const finding of state.impact.preview.removed) {
      findingsByKey.set(finding.findingKey, finding);
    }
    for (const finding of state.impact.candidateFindings) {
      findingsByKey.set(finding.findingKey, finding);
    }
    return Object.freeze(
      [...findingsByKey.values()].sort((left, right) =>
        left.findingKey < right.findingKey
          ? -1
          : left.findingKey > right.findingKey
            ? 1
            : 0,
      ),
    );
  }
  return selectBaselineRelease(state)?.findings ?? Object.freeze([]);
}

export function canAnalyzeBaseline(state: DemoState): boolean {
  return state.phase === "draft_editing" || state.phase === "baseline_editing";
}

export function canCreateBaselineRelease(state: DemoState): boolean {
  return (
    state.phase === "baseline_ready" &&
    hasCurrentAnalysis(state.baseline) &&
    state.baseline.analysis?.version === "1.0.0" &&
    state.baseline.analysis.rules.length === 6 &&
    state.baseline.analysis.ambiguities.length === 0 &&
    state.baseline.analysis.unsupportedStatements.length === 0 &&
    selectBaselineRelease(state) === null
  );
}

export function canStartCandidate(state: DemoState): boolean {
  const baselineReleaseCount = state.releases.filter(
    (release) => release.releaseId === "mfs-v1",
  ).length;
  return (
    state.phase === "baseline_published" &&
    baselineReleaseCount === 1 &&
    selectCandidateRelease(state) === null &&
    state.candidate === null
  );
}

export function canAnalyzeCandidate(state: DemoState): boolean {
  return state.phase === "candidate_editing" && state.candidate !== null;
}

export function canComputeImpact(state: DemoState): boolean {
  return (
    state.phase === "candidate_ready" &&
    state.candidate !== null &&
    hasCurrentAnalysis(state.candidate) &&
    state.candidate.analysis?.version === "1.1.0" &&
    state.candidate.analysis.rules.length === 7 &&
    selectBaselineRelease(state) !== null
  );
}

export function canApproveCandidate(state: DemoState): boolean {
  return state.phase === "impact_ready" && hasCurrentImpact(state);
}

export function canPublishCandidate(state: DemoState): boolean {
  return (
    state.phase === "candidate_approved" &&
    state.candidate !== null &&
    hasCurrentApproval(state.candidate) &&
    hasCurrentImpact(state) &&
    selectCandidateRelease(state) === null
  );
}

export function canSelectFinding(state: DemoState, key: string | null): boolean {
  return (
    key === null ||
    selectVisibleFindings(state).some((finding) => finding.findingKey === key)
  );
}

export function canResetScenario(state: DemoState): boolean {
  return state.phase !== "draft_analyzing" && state.phase !== "baseline_analyzing" &&
    state.phase !== "candidate_analyzing";
}

export function canChangeMode(state: DemoState, mode: AnalysisMode): boolean {
  return canResetScenario(state) && (mode !== "live" || state.liveModeAvailable);
}
