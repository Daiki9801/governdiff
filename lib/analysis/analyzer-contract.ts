import type { AnalysisMetadata, PolicySpec, PolicyVersion } from "../domain/types";

export interface AnalyzePolicyRequest {
  readonly policyText: string;
  readonly targetVersion: PolicyVersion;
}

export interface AnalyzePolicyResult {
  readonly spec: PolicySpec;
  readonly metadata: AnalysisMetadata;
}

export interface PolicyAnalyzer {
  analyze(request: AnalyzePolicyRequest): Promise<AnalyzePolicyResult>;
}
