import type { AnalysisMetadata, PolicyVersion } from "../domain/types";
import {
  SAMPLE_VARIANT_DEFINITIONS,
  copyAndFreezeSampleAnalysisAssets,
  normalizedPolicySha256,
  type SampleAnalysisAsset,
  type SampleAnalysisAssets,
  type SampleVariant,
} from "../demo/fixture-contract";
import { createAppError } from "../errors/app-error";
import type {
  AnalyzePolicyRequest,
  AnalyzePolicyResult,
  PolicyAnalyzer,
} from "./analyzer-contract";

export interface SampleAnalyzerDependencies {
  readonly crypto?: Pick<Crypto, "subtle">;
  readonly now?: () => Date;
  readonly timer?: () => number;
}

const VARIANT_BY_VERSION: Readonly<Record<PolicyVersion, SampleVariant>> =
  Object.freeze({
    "draft-v1": "draft-v1",
    "1.0.0": "resolved-v1",
    "1.1.0": "candidate-v2",
  });

export class SamplePolicyAnalyzer implements PolicyAnalyzer {
  readonly #assets: SampleAnalysisAssets;
  readonly #crypto: Pick<Crypto, "subtle">;
  readonly #now: () => Date;
  readonly #timer: () => number;

  constructor(
    assets: Readonly<Record<SampleVariant, SampleAnalysisAsset>>,
    dependencies: SampleAnalyzerDependencies = {},
  ) {
    try {
      this.#assets = copyAndFreezeSampleAnalysisAssets(assets);
      for (const [variant, definition] of Object.entries(
        SAMPLE_VARIANT_DEFINITIONS,
      ) as [SampleVariant, (typeof SAMPLE_VARIANT_DEFINITIONS)[SampleVariant]][]) {
        const asset = this.#assets[variant];
        if (
          asset.analysis.version !== definition.targetVersion ||
          asset.provenance.capturedFrom !== "gpt-5.4"
        ) {
          throw new Error("Sample asset contract mismatch");
        }
      }
    } catch {
      throw createAppError(
        "SAMPLE_VARIANT_UNSUPPORTED",
        "The built-in Sample analysis is unavailable.",
        false,
        "SAMPLE_ASSET_INVALID",
      );
    }

    this.#crypto = dependencies.crypto ?? globalThis.crypto;
    this.#now = dependencies.now ?? (() => new Date());
    this.#timer = dependencies.timer ?? (() => performance.now());
  }

  getCaptureProvenance(
    variant: SampleVariant,
  ): SampleAnalysisAsset["provenance"] {
    return this.#assets[variant].provenance;
  }

  async analyze(request: AnalyzePolicyRequest): Promise<AnalyzePolicyResult> {
    const startedAt = this.#timer();
    const variant = VARIANT_BY_VERSION[request.targetVersion];
    const definition = SAMPLE_VARIANT_DEFINITIONS[variant];

    try {
      const hash = await normalizedPolicySha256(request.policyText, this.#crypto);
      if (hash !== definition.normalizedPolicySha256) {
        throw new Error("Sample variant mismatch");
      }

      const metadata: AnalysisMetadata = Object.freeze({
        mode: "sample",
        model: null,
        requestId: null,
        analyzedAt: this.#now().toISOString(),
        durationMs: Math.max(0, this.#timer() - startedAt),
      });
      return Object.freeze({
        spec: this.#assets[variant].analysis,
        metadata,
      });
    } catch {
      throw createAppError(
        "SAMPLE_VARIANT_UNSUPPORTED",
        "This policy text is not available in Sample Mode.",
        false,
        "SAMPLE_VARIANT_MISMATCH",
      );
    }
  }
}
