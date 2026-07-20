import { describe, expect, it } from "vitest";

import type { FixtureExpectations } from "../../lib/domain/schemas";
import type { PolicySpec } from "../../lib/domain/types";
import { verifyFixtureExpectations } from "../../lib/demo/fixture-expectation-guard";
import { loadDemoScenario } from "../../lib/demo/fixture-loader.server";
import { isAppError } from "../../lib/errors/app-error";

describe("FixtureExpectationGuard", () => {
  it("recomputes the canonical fixture through the real runtime and Impact engine", () => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const result = verifyFixtureExpectations({
      baselineSpec: scenario.sampleAnalyses["resolved-v1"].analysis,
      candidateSpec: scenario.sampleAnalyses["candidate-v2"].analysis,
      records: scenario.records,
      expectations: scenario.expectations,
    });

    expect(result).toEqual({
      baselineCount: 18,
      candidateCount: 16,
      removedCount: 3,
      addedCount: 1,
      unchangedCount: 15,
    });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("fails closed when expectations are tampered", () => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const expectations: FixtureExpectations = {
      ...scenario.expectations,
      impact_preview: {
        ...scenario.expectations.impact_preview,
        removed_count: 4,
      },
    };

    let thrown: unknown;
    try {
      verifyFixtureExpectations({
        baselineSpec: scenario.sampleAnalyses["resolved-v1"].analysis,
        candidateSpec: scenario.sampleAnalyses["candidate-v2"].analysis,
        records: scenario.records,
        expectations,
      });
    } catch (error) {
      thrown = error;
    }
    expect(isAppError(thrown)).toBe(true);
    if (isAppError(thrown)) {
      expect(thrown.code).toBe("FIXTURE_EXPECTATION_FAILED");
      expect(thrown.message).toBe("Fixture verification failed.");
    }
  });

  it("maps invalid asset semantics to a safe error without provenance data", () => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const candidate = structuredClone(
      scenario.sampleAnalyses["candidate-v2"].analysis,
    ) as PolicySpec;
    const mutable = candidate as unknown as {
      rules: { condition: { conditions?: { value: unknown }[] } }[];
    };
    mutable.rules[0]!.condition.conditions![1]!.value = 1;

    try {
      verifyFixtureExpectations({
        baselineSpec: scenario.sampleAnalyses["resolved-v1"].analysis,
        candidateSpec: candidate,
        records: scenario.records,
        expectations: scenario.expectations,
      });
      throw new Error("Expected guard failure");
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      expect(JSON.stringify(error)).not.toMatch(/requestId|capturedAt|gpt-5\.4/);
    }
  });
});
