import type { AnalysisMetadata, AnalysisMode, PolicySpec } from "../domain/types";
import type { AppError } from "../errors/app-error";
import type { ImpactComputation, ReleaseSnapshot } from "./demo-state";

export const DEMO_EVENT_TYPES = Object.freeze([
  "MODE_CHANGED",
  "POLICY_EDITED",
  "ANALYSIS_STARTED",
  "ANALYSIS_SUCCEEDED",
  "ANALYSIS_FAILED",
  "BASELINE_RELEASE_CREATED",
  "START_CANDIDATE",
  "IMPACT_COMPUTED",
  "APPROVE_CANDIDATE",
  "CANDIDATE_RELEASE_CREATED",
  "FINDING_SELECTED",
  "RESET_SCENARIO",
] as const);

export type DemoEvent =
  | { type: "MODE_CHANGED"; mode: AnalysisMode }
  | { type: "POLICY_EDITED"; target: "baseline" | "candidate"; text: string }
  | {
      type: "ANALYSIS_STARTED";
      target: "baseline" | "candidate";
      requestedRevision: number;
    }
  | {
      type: "ANALYSIS_SUCCEEDED";
      target: "baseline" | "candidate";
      requestedRevision: number;
      spec: PolicySpec;
      metadata: AnalysisMetadata;
    }
  | {
      type: "ANALYSIS_FAILED";
      target: "baseline" | "candidate";
      requestedRevision: number;
      error: AppError;
    }
  | { type: "BASELINE_RELEASE_CREATED"; release: ReleaseSnapshot }
  | { type: "START_CANDIDATE"; text: string }
  | { type: "IMPACT_COMPUTED"; computation: ImpactComputation }
  | { type: "APPROVE_CANDIDATE" }
  | { type: "CANDIDATE_RELEASE_CREATED"; release: ReleaseSnapshot }
  | { type: "FINDING_SELECTED"; key: string | null }
  | { type: "RESET_SCENARIO" };
