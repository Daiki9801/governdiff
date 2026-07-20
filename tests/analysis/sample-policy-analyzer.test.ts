import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { SamplePolicyAnalyzer } from "../../lib/analysis/sample-policy-analyzer";
import type { SampleAnalysisAssets } from "../../lib/demo/fixture-contract";
import { loadDemoScenario } from "../../lib/demo/fixture-loader.server";
import { isAppError } from "../../lib/errors/app-error";

function createAnalyzer() {
  const scenario = loadDemoScenario(process.cwd(), false);
  const deserialized = JSON.parse(
    JSON.stringify(scenario.sampleAnalyses),
  ) as SampleAnalysisAssets;
  let timer = 100;
  const analyzer = new SamplePolicyAnalyzer(deserialized, {
    now: () => new Date("2026-07-19T00:00:00.000Z"),
    timer: () => {
      const current = timer;
      timer += 5;
      return current;
    },
  });
  return { analyzer, deserialized, scenario };
}

describe("SamplePolicyAnalyzer", () => {
  it("selects all three exact target/hash variants with honest metadata", async () => {
    const { analyzer, scenario } = createAnalyzer();
    const cases = [
      ["draft-v1", scenario.policyDraftV1, "draft-v1"],
      ["1.0.0", scenario.policyV1, "resolved-v1"],
      ["1.1.0", scenario.policyV2, "candidate-v2"],
    ] as const;

    for (const [targetVersion, policyText, variant] of cases) {
      const result = await analyzer.analyze({ policyText, targetVersion });
      expect(result.spec.version).toBe(targetVersion);
      expect(result.metadata).toEqual({
        mode: "sample",
        model: null,
        requestId: null,
        analyzedAt: "2026-07-19T00:00:00.000Z",
        durationMs: 5,
      });
      expect(analyzer.getCaptureProvenance(variant).capturedFrom).toBe("gpt-5.4");
    }
  });

  it("returns deterministic analyzer-owned frozen specs", async () => {
    const { analyzer, deserialized, scenario } = createAnalyzer();
    const first = await analyzer.analyze({
      policyText: scenario.policyV1,
      targetVersion: "1.0.0",
    });
    const second = await analyzer.analyze({
      policyText: scenario.policyV1,
      targetVersion: "1.0.0",
    });

    expect(second.spec).toBe(first.spec);
    expect(first.spec).not.toBe(deserialized["resolved-v1"].analysis);
    expect(first.spec.rules[0]).not.toBe(
      deserialized["resolved-v1"].analysis.rules[0],
    );
    expect(Object.isFrozen(first.spec)).toBe(true);
    expect(Object.isFrozen(first.spec.rules)).toBe(true);
    expect(first.spec.rules.every(Object.isFrozen)).toBe(true);

    const mutable = deserialized as unknown as {
      "resolved-v1": { analysis: { rules: { label: string }[] } };
    };
    mutable["resolved-v1"].analysis.rules[0]!.label = "tampered";
    expect(first.spec.rules[0]?.label).not.toBe("tampered");
  });

  it("fails closed for edited or mismatched Sample input", async () => {
    const { analyzer, scenario } = createAnalyzer();
    for (const request of [
      { policyText: `${scenario.policyV1}edited\n`, targetVersion: "1.0.0" as const },
      { policyText: scenario.policyV1, targetVersion: "1.1.0" as const },
    ]) {
      await expect(analyzer.analyze(request)).rejects.toSatisfy(
        (error: unknown) =>
          isAppError(error) && error.code === "SAMPLE_VARIANT_UNSUPPORTED",
      );
    }
  });

  it("has no server, framework, SDK, credential, or network dependency", () => {
    const source = readFileSync(
      join(process.cwd(), "lib", "analysis", "sample-policy-analyzer.ts"),
      "utf8",
    );
    expect(source).not.toMatch(
      /from\s+["'](?:node:|react(?:\/|["'])|next(?:\/|["'])|openai(?:\/|["']))/,
    );
    expect(source).not.toMatch(
      /\b(?:fetch\s*\(|XMLHttpRequest|WebSocket|process\.env|OPENAI_API_KEY)\b/,
    );
  });
});
