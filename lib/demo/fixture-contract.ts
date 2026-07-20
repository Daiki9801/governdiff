import { z } from "zod";

import { normalizePolicyText } from "../domain/policy-compiler";
import { policySpecSchema } from "../domain/schemas";
import type { Condition, PolicySpec, PolicyVersion } from "../domain/types";

export const SAMPLE_VARIANT_DEFINITIONS = Object.freeze({
  "draft-v1": Object.freeze({
    assetKey: "draft-v1",
    targetVersion: "draft-v1",
    normalizedPolicySha256:
      "356315c45637a47d8a2c02cdb4f773fe0337649bb7a52f396e167cc2e551adff",
    assetFileName: "sample-analysis-draft-v1.json",
  }),
  "resolved-v1": Object.freeze({
    assetKey: "resolved-v1",
    targetVersion: "1.0.0",
    normalizedPolicySha256:
      "21b948db95724c8484f317414f6d1d64ea22b92d208787fb8a00801d602d460d",
    assetFileName: "sample-analysis-v1.json",
  }),
  "candidate-v2": Object.freeze({
    assetKey: "candidate-v2",
    targetVersion: "1.1.0",
    normalizedPolicySha256:
      "1d6e521b4b8715c74bdebfbf6518e61686e207cb450847f0541097f443fd6b63",
    assetFileName: "sample-analysis-v2.json",
  }),
} as const);

export type SampleVariant = keyof typeof SAMPLE_VARIANT_DEFINITIONS;
export type SampleCaptureModel = "gpt-5.4" | "gpt-5.6";

export interface SampleVariantDefinition {
  readonly assetKey: SampleVariant;
  readonly targetVersion: PolicyVersion;
  readonly normalizedPolicySha256: string;
  readonly assetFileName:
    | "sample-analysis-draft-v1.json"
    | "sample-analysis-v1.json"
    | "sample-analysis-v2.json";
}

const variantDefinitionsTypeCheck: Readonly<
  Record<SampleVariant, SampleVariantDefinition>
> = SAMPLE_VARIANT_DEFINITIONS;
void variantDefinitionsTypeCheck;

export interface SampleAnalysisAsset {
  readonly analysis: PolicySpec;
  readonly provenance: {
    readonly capturedFrom: SampleCaptureModel;
    readonly capturedAt: string;
    readonly requestId: string | null;
  };
}

export type SampleAnalysisAssets = Readonly<
  Record<SampleVariant, SampleAnalysisAsset>
>;

export const sampleAnalysisAssetSchema: z.ZodType<SampleAnalysisAsset> = z
  .object({
    analysis: policySpecSchema,
    provenance: z
      .object({
        capturedFrom: z.enum(["gpt-5.4", "gpt-5.6"]),
        capturedAt: z.string().min(1),
        requestId: z.string().min(1).nullable(),
      })
      .strict(),
  })
  .strict();

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

export function copyAndFreezePolicySpec(input: unknown): PolicySpec {
  const parsed = policySpecSchema.parse(input);
  const rules = parsed.rules.map((rule) => {
    const evidenceFields = [...rule.evidenceFields];
    Object.freeze(evidenceFields);
    return Object.freeze({
      ...rule,
      condition: copyCondition(rule.condition),
      evidenceFields,
    });
  });
  const ambiguities = parsed.ambiguities.map((value) => Object.freeze({ ...value }));
  const inputRequirements = parsed.inputRequirements.map((value) =>
    Object.freeze({ ...value }),
  );
  const unsupportedStatements = parsed.unsupportedStatements.map((value) =>
    Object.freeze({ ...value }),
  );
  Object.freeze(rules);
  Object.freeze(ambiguities);
  Object.freeze(inputRequirements);
  Object.freeze(unsupportedStatements);

  return Object.freeze({
    policyId: parsed.policyId,
    version: parsed.version,
    rules,
    ambiguities,
    inputRequirements,
    unsupportedStatements,
  });
}

export function copyAndFreezeSampleAnalysisAsset(
  input: unknown,
): SampleAnalysisAsset {
  const parsed = sampleAnalysisAssetSchema.parse(input);
  return Object.freeze({
    analysis: copyAndFreezePolicySpec(parsed.analysis),
    provenance: Object.freeze({ ...parsed.provenance }),
  });
}

export function copyAndFreezeSampleAnalysisAssets(
  input: Readonly<Record<SampleVariant, SampleAnalysisAsset>>,
): SampleAnalysisAssets {
  return Object.freeze({
    "draft-v1": copyAndFreezeSampleAnalysisAsset(input["draft-v1"]),
    "resolved-v1": copyAndFreezeSampleAnalysisAsset(input["resolved-v1"]),
    "candidate-v2": copyAndFreezeSampleAnalysisAsset(input["candidate-v2"]),
  });
}

export async function normalizedPolicySha256(
  policyText: string,
  cryptoProvider: Pick<Crypto, "subtle"> = globalThis.crypto,
): Promise<string> {
  const bytes = new TextEncoder().encode(normalizePolicyText(policyText));
  const digest = await cryptoProvider.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
}
