import {
  APIConnectionTimeoutError,
  APIError,
  APIUserAbortError,
} from "openai";
import {
  ContentFilterFinishReasonError,
  LengthFinishReasonError,
} from "openai/core/error";
import { describe, expect, it, vi } from "vitest";

import {
  LivePolicyAnalyzer,
  type LiveResponsesParse,
  type OpenAIClientConfiguration,
} from "../../lib/analysis/live-policy-analyzer.server";
import {
  POLICY_ANALYSIS_INSTRUCTIONS,
  POLICY_FIELD_CATALOG,
  POLICY_RULE_CATALOG,
} from "../../lib/analysis/policy-analysis-prompt";
import { policyAnalysisOutputSchema } from "../../lib/analysis/policy-analysis-schema";
import { centsToUsd } from "../../lib/domain/money";
import type {
  PolicySpec,
  PredicateCondition,
} from "../../lib/domain/types";
import { loadDemoScenario } from "../../lib/demo/fixture-loader.server";

const TEST_API_KEY = "test-only-placeholder";

function predicatesForRule(rule: PolicySpec["rules"][number]) {
  return rule.condition.kind === "predicate"
    ? [rule.condition]
    : rule.condition.conditions;
}

function wireValue(predicate: PredicateCondition): string | null {
  if (predicate.value === null) {
    return null;
  }
  if (predicate.field === "amount_usd") {
    if (typeof predicate.value !== "number") {
      throw new Error("Expected integer cents");
    }
    return centsToUsd(predicate.value);
  }
  return String(predicate.value);
}

function modelOutputFor(spec: PolicySpec) {
  return {
    policyId: spec.policyId,
    version: spec.version,
    rules: spec.rules.map((rule) => ({
      ruleId: rule.ruleId,
      predicates: predicatesForRule(rule).map((predicate) => ({
        field: predicate.field,
        operator: predicate.operator,
        value: wireValue(predicate),
      })),
      outcome: rule.outcome,
      sourceQuote: rule.sourceQuote,
    })),
    ambiguities: spec.ambiguities.map((value) => ({ ...value })),
    unsupportedStatements: spec.unsupportedStatements.map((value) => ({
      ...value,
    })),
  };
}

function completedResponse(output: unknown, overrides: Record<string, unknown> = {}) {
  return {
    id: "resp_object_not_request_id",
    status: "completed",
    error: null,
    incomplete_details: null,
    output: [],
    output_parsed: output,
    _request_id: "req_test_123",
    ...overrides,
  };
}

function harness(response: unknown) {
  const parse = vi.fn<LiveResponsesParse>().mockResolvedValue(response);
  let configuration: OpenAIClientConfiguration | null = null;
  const times = [10, 25];
  const analyzer = new LivePolicyAnalyzer(TEST_API_KEY, {
    createResponsesParse: (value) => {
      configuration = value;
      return parse;
    },
    now: () => new Date("2026-07-19T01:02:03.000Z"),
    timer: () => times.shift() ?? 25,
  });
  return { analyzer, parse, getConfiguration: () => configuration };
}

function expectLiveError(error: unknown, code: string): void {
  expect(error).toEqual(
    expect.objectContaining({
      code,
      message: expect.any(String),
      retryable: expect.any(Boolean),
    }),
  );
  expect(JSON.stringify(error)).not.toMatch(
    /test-only-placeholder|resp_object_not_request_id|policy_document|stack|header/i,
  );
}

function assertStrictObjects(value: unknown): void {
  if (Array.isArray(value)) {
    for (const nested of value) {
      assertStrictObjects(nested);
    }
    return;
  }
  if (typeof value !== "object" || value === null) {
    return;
  }
  const record = value as Record<string, unknown>;
  if (record.type === "object") {
    expect(record.additionalProperties).toBe(false);
  }
  for (const nested of Object.values(record)) {
    assertStrictObjects(nested);
  }
}

describe("LivePolicyAnalyzer", () => {
  it.each([
    ["draft-v1", "draft-v1", "policyDraftV1"],
    ["resolved-v1", "1.0.0", "policyV1"],
    ["candidate-v2", "1.1.0", "policyV2"],
  ] as const)(
    "canonicalizes and freezes the %s output",
    async (variant, targetVersion, policyKey) => {
      const scenario = loadDemoScenario(process.cwd(), false);
      const expected = scenario.sampleAnalyses[variant].analysis;
      const h = harness(completedResponse(modelOutputFor(expected)));
      const signal = new AbortController().signal;

      const result = await h.analyzer.analyze(
        { policyText: scenario[policyKey], targetVersion },
        signal,
      );

      expect(result.spec).toEqual(expected);
      expect(result.spec).not.toBe(expected);
      expect(result.spec.rules).toHaveLength(
        targetVersion === "draft-v1" ? 5 : targetVersion === "1.0.0" ? 6 : 7,
      );
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.spec)).toBe(true);
      expect(Object.isFrozen(result.spec.rules)).toBe(true);
      expect(Object.isFrozen(result.spec.rules[0]?.condition)).toBe(true);
      expect(result.metadata).toEqual({
        mode: "live",
        model: "gpt-5.6",
        requestId: "req_test_123",
        analyzedAt: "2026-07-19T01:02:03.000Z",
        durationMs: 15,
      });
      expect(Object.isFrozen(result.metadata)).toBe(true);
      expect(h.getConfiguration()).toEqual({
        apiKey: TEST_API_KEY,
        maxRetries: 0,
        timeout: 60_000,
        logLevel: "off",
      });
      expect(h.parse).toHaveBeenCalledOnce();
      const [request, options] = h.parse.mock.calls[0]!;
      expect(options.signal).toBe(signal);
      expect(request).toMatchObject({
        model: "gpt-5.6",
        reasoning: { effort: "low" },
        instructions: POLICY_ANALYSIS_INSTRUCTIONS,
        max_output_tokens: 4_000,
        store: false,
      });
      expect(request).not.toHaveProperty("tools");
      expect(request).not.toHaveProperty("tool_choice");
      expect(request).not.toHaveProperty("stream");
      expect(request).not.toHaveProperty("previous_response_id");
      expect(request).not.toHaveProperty("conversation");
      expect(request).not.toHaveProperty("background");
      expect(request).not.toHaveProperty("temperature");
      expect(request).not.toHaveProperty("top_p");
      expect(request.text.format).toMatchObject({
        type: "json_schema",
        name: "governdiff_policy_analysis",
        strict: true,
      });
      assertStrictObjects(request.text.format.schema);
      expect(request.input).toContain(POLICY_FIELD_CATALOG);
      expect(request.input).toContain(POLICY_RULE_CATALOG);
      expect(request.input).toContain(`<target_version>\n${targetVersion}\n`);
      expect(request.input).toContain(scenario[policyKey]);
      expect(JSON.stringify(request)).not.toMatch(
        /MFS-EXP-SENTINEL|employee@example\.invalid|findingKey|impact_preview|approvalRevision/,
      );
    },
  );

  it("keeps the model-facing schema strict and string-or-null", () => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const output = modelOutputFor(scenario.sampleAnalyses["resolved-v1"].analysis);
    expect(policyAnalysisOutputSchema.safeParse(output).success).toBe(true);
    expect(
      policyAnalysisOutputSchema.safeParse({ ...output, policyId: "other" })
        .success,
    ).toBe(false);
    expect(
      policyAnalysisOutputSchema.safeParse({ ...output, findingCount: 18 }).success,
    ).toBe(false);
    expect(
      policyAnalysisOutputSchema.safeParse({
        ...output,
        rules: output.rules.map((rule, index) =>
          index === 0
            ? {
                ...rule,
                predicates: rule.predicates.map((predicate, predicateIndex) =>
                  predicateIndex === 0
                    ? { ...predicate, value: false }
                    : predicate,
                ),
              }
            : rule,
        ),
      }).success,
    ).toBe(false);
  });

  it("rejects a model-proposed rule ID that disagrees with the host registry", async () => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const output = modelOutputFor(scenario.sampleAnalyses["resolved-v1"].analysis);
    output.rules[0] = { ...output.rules[0]!, ruleId: "EXP-RID-001" };
    const h = harness(completedResponse(output));

    try {
      await h.analyzer.analyze({
        policyText: scenario.policyV1,
        targetVersion: "1.0.0",
      });
      throw new Error("Expected analyzer rejection");
    } catch (error) {
      expectLiveError(error, "ANALYSIS_SCHEMA_INVALID");
    }
  });

  it("rejects source quotes that are not exact unique policy matches", async () => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const output = modelOutputFor(scenario.sampleAnalyses["resolved-v1"].analysis);
    output.rules[0] = { ...output.rules[0]!, sourceQuote: "Not in the policy." };
    const h = harness(completedResponse(output));

    await expect(
      h.analyzer.analyze({
        policyText: scenario.policyV1,
        targetVersion: "1.0.0",
      }),
    ).rejects.toMatchObject({ code: "SOURCE_QUOTE_INVALID" });
  });

  it.each([
    ["boolean", "receipt_attached", "eq", "TRUE"],
    ["money", "amount_usd", "gte", "100"],
    ["null", "receipt_attached", "eq", null],
    ["expense date", "expense_date", "missing", null],
  ] as const)("rejects invalid %s wire predicates", async (_label, field, operator, value) => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const output = modelOutputFor(scenario.sampleAnalyses["resolved-v1"].analysis);
    const invalidOutput = {
      ...output,
      rules: [
        {
          ...output.rules[0]!,
          predicates: [{ field, operator, value }],
        },
        ...output.rules.slice(1),
      ],
    };
    const h = harness(completedResponse(invalidOutput));
    await expect(
      h.analyzer.analyze({
        policyText: scenario.policyV1,
        targetVersion: "1.0.0",
      }),
    ).rejects.toMatchObject({ code: "ANALYSIS_SCHEMA_INVALID" });
  });

  it("requires the requested target version", async () => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const output = modelOutputFor(scenario.sampleAnalyses["resolved-v1"].analysis);
    const h = harness(completedResponse({ ...output, version: "1.1.0" }));
    await expect(
      h.analyzer.analyze({
        policyText: scenario.policyV1,
        targetVersion: "1.0.0",
      }),
    ).rejects.toMatchObject({ code: "ANALYSIS_SCHEMA_INVALID" });
  });

  it.each([
    [
      "refusal",
      completedResponse(null, {
        output: [{ type: "message", content: [{ type: "refusal" }] }],
      }),
      "ANALYSIS_REFUSED",
    ],
    [
      "incomplete",
      completedResponse(null, {
        status: "incomplete",
        incomplete_details: { reason: "max_output_tokens" },
      }),
      "ANALYSIS_SCHEMA_INVALID",
    ],
    ["null output", completedResponse(null), "ANALYSIS_SCHEMA_INVALID"],
    [
      "response error",
      completedResponse(null, { error: { code: "upstream" } }),
      "ANALYSIS_SCHEMA_INVALID",
    ],
  ])("maps %s without exposing raw output", async (_label, response, code) => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const h = harness(response);
    try {
      await h.analyzer.analyze({
        policyText: scenario.policyV1,
        targetVersion: "1.0.0",
      });
      throw new Error("Expected analyzer rejection");
    } catch (error) {
      expectLiveError(error, code);
    }
  });

  it.each([
    [
      "timeout",
      new APIConnectionTimeoutError({ message: "raw timeout detail" }),
      "ANALYSIS_TIMEOUT",
    ],
    [
      "rate limit",
      APIError.generate(429, { raw: "rate body" }, "raw rate detail", new Headers()),
      "ANALYSIS_RATE_LIMITED",
    ],
    [
      "authentication",
      APIError.generate(401, { raw: "auth body" }, "raw auth detail", new Headers()),
      "ANALYSIS_UPSTREAM_ERROR",
    ],
    ["length finish", new LengthFinishReasonError(), "ANALYSIS_SCHEMA_INVALID"],
    [
      "content filter finish",
      new ContentFilterFinishReasonError(),
      "ANALYSIS_REFUSED",
    ],
    ["unknown", new Error("raw unknown detail"), "UNKNOWN_ERROR"],
  ])("safely maps %s errors", async (_label, sdkError, code) => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const parse = vi.fn<LiveResponsesParse>().mockRejectedValue(sdkError);
    const analyzer = new LivePolicyAnalyzer(TEST_API_KEY, {
      createResponsesParse: () => parse,
    });
    try {
      await analyzer.analyze({
        policyText: scenario.policyV1,
        targetVersion: "1.0.0",
      });
      throw new Error("Expected analyzer rejection");
    } catch (error) {
      expectLiveError(error, code);
      expect(JSON.stringify(error)).not.toContain("raw");
    }
  });

  it("preserves SDK abort errors", async () => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const abortError = new APIUserAbortError();
    const parse = vi.fn<LiveResponsesParse>().mockRejectedValue(abortError);
    const analyzer = new LivePolicyAnalyzer(TEST_API_KEY, {
      createResponsesParse: () => parse,
    });
    const controller = new AbortController();
    controller.abort();

    await expect(
      analyzer.analyze(
        { policyText: scenario.policyV1, targetVersion: "1.0.0" },
        controller.signal,
      ),
    ).rejects.toBe(abortError);
  });

  it("uses null when the SDK HTTP request ID is absent and never substitutes response.id", async () => {
    const scenario = loadDemoScenario(process.cwd(), false);
    const output = modelOutputFor(scenario.sampleAnalyses["resolved-v1"].analysis);
    const h = harness(
      completedResponse(output, { _request_id: undefined, id: "resp_do_not_use" }),
    );
    const result = await h.analyzer.analyze({
      policyText: scenario.policyV1,
      targetVersion: "1.0.0",
    });
    expect(result.metadata.requestId).toBeNull();
  });
});
