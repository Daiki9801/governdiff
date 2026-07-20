import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SAMPLE_VARIANT_DEFINITIONS,
  sampleAnalysisAssetSchema,
} from "../../lib/demo/fixture-contract";

describe("browser-safe fixture contract", () => {
  it("defines the exact three immutable Sample variants once", () => {
    expect(SAMPLE_VARIANT_DEFINITIONS).toEqual({
      "draft-v1": {
        assetKey: "draft-v1",
        targetVersion: "draft-v1",
        normalizedPolicySha256:
          "356315c45637a47d8a2c02cdb4f773fe0337649bb7a52f396e167cc2e551adff",
        assetFileName: "sample-analysis-draft-v1.json",
      },
      "resolved-v1": {
        assetKey: "resolved-v1",
        targetVersion: "1.0.0",
        normalizedPolicySha256:
          "21b948db95724c8484f317414f6d1d64ea22b92d208787fb8a00801d602d460d",
        assetFileName: "sample-analysis-v1.json",
      },
      "candidate-v2": {
        assetKey: "candidate-v2",
        targetVersion: "1.1.0",
        normalizedPolicySha256:
          "1d6e521b4b8715c74bdebfbf6518e61686e207cb450847f0541097f443fd6b63",
        assetFileName: "sample-analysis-v2.json",
      },
    });
    expect(Object.isFrozen(SAMPLE_VARIANT_DEFINITIONS)).toBe(true);
    expect(Object.values(SAMPLE_VARIANT_DEFINITIONS).every(Object.isFrozen)).toBe(true);
    expect(
      Object.entries(SAMPLE_VARIANT_DEFINITIONS).every(
        ([variant, definition]) => variant === definition.assetKey,
      ),
    ).toBe(true);
  });

  it("uses exact lowercase SHA-256 values", () => {
    const hashes = Object.values(SAMPLE_VARIANT_DEFINITIONS).map(
      (definition) => definition.normalizedPolicySha256,
    );

    expect(hashes).toHaveLength(3);
    expect(new Set(hashes).size).toBe(3);
    expect(hashes.every((hash) => /^[a-f0-9]{64}$/.test(hash))).toBe(true);
  });

  it("keeps the contract free of server, framework, SDK, and network imports", () => {
    const source = readFileSync(
      join(process.cwd(), "lib", "demo", "fixture-contract.ts"),
      "utf8",
    );

    expect(source).not.toMatch(/from\s+["'](?:node:|react(?:\/|["'])|next(?:\/|["'])|openai(?:\/|["']))/);
    expect(source).not.toMatch(/\b(?:process\.env|fetch\s*\(|XMLHttpRequest|WebSocket)\b/);
  });

  it.each(["gpt-5.4", "gpt-5.6"] as const)(
    "accepts truthful %s Sample capture provenance",
    (capturedFrom) => {
      const asset = {
        analysis: {
          policyId: "mfs-global-expense",
          version: "1.0.0",
          rules: [],
          ambiguities: [],
          inputRequirements: [],
          unsupportedStatements: [],
        },
        provenance: {
          capturedFrom,
          capturedAt: "2026-07-18T00:00:00.000Z",
          requestId: null,
        },
      };

      expect(sampleAnalysisAssetSchema.safeParse(asset).success).toBe(true);
    },
  );

  it("rejects capture provenance outside the exact contract", () => {
    expect(
      sampleAnalysisAssetSchema.safeParse({
        analysis: {
          policyId: "mfs-global-expense",
          version: "1.0.0",
          rules: [],
          ambiguities: [],
          inputRequirements: [],
          unsupportedStatements: [],
        },
        provenance: {
          capturedFrom: "gpt-5.4-mini",
          capturedAt: "2026-07-18T00:00:00.000Z",
          requestId: null,
        },
      }).success,
    ).toBe(false);
  });

  it("requires PolicySpec structure instead of raw model PolicyAnalysis", () => {
    const policySpecShape = {
      policyId: "mfs-global-expense",
      version: "1.0.0",
      rules: [],
      ambiguities: [],
      inputRequirements: [],
      unsupportedStatements: [],
    };
    const provenance = {
      capturedFrom: "gpt-5.4",
      capturedAt: "2026-07-18T00:00:00.000Z",
      requestId: null,
    };

    expect(
      sampleAnalysisAssetSchema.safeParse({ analysis: policySpecShape, provenance }).success,
    ).toBe(true);
    expect(
      sampleAnalysisAssetSchema.safeParse({
        analysis: {
          ...policySpecShape,
          rules: [
            {
              outcome: "clarification",
              sourceQuote: "Model output quote",
              predicates: [
                { field: "business_purpose", operator: "missing", value: null },
              ],
            },
          ],
        },
        provenance,
      }).success,
    ).toBe(false);
  });
});
