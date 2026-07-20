import { describe, expect, it, vi } from "vitest";

import {
  createAnalyzePostHandler,
  type AnalyzeRouteDependencies,
} from "../../app/api/analyze/route";
import { createAppError } from "../../lib/errors/app-error";
import { loadDemoScenario } from "../../lib/demo/fixture-loader.server";

const TEST_API_KEY = "test-only-route-placeholder";

function validResult() {
  const scenario = loadDemoScenario(process.cwd(), false);
  return {
    spec: scenario.sampleAnalyses["resolved-v1"].analysis,
    metadata: Object.freeze({
      mode: "live" as const,
      model: "gpt-5.6" as const,
      requestId: "req_route_test",
      analyzedAt: "2026-07-19T03:00:00.000Z",
      durationMs: 10,
    }),
  };
}

function validBody() {
  return JSON.stringify({
    policyText: "Synthetic policy text",
    targetVersion: "1.0.0",
  });
}

function request(
  body: string,
  contentType = "application/json",
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": contentType, ...headers },
    body,
  });
}

function harness(
  overrides: Partial<AnalyzeRouteDependencies> = {},
) {
  const analyze = vi.fn().mockResolvedValue(validResult());
  const createAnalyzer = vi.fn(() => ({ analyze }));
  const getApiKey = vi.fn(() => TEST_API_KEY);
  const post = createAnalyzePostHandler({
    getApiKey,
    createAnalyzer,
    ...overrides,
  });
  return { post, analyze, createAnalyzer, getApiKey };
}

async function expectSafeJson(response: Response, status: number) {
  expect(response.status).toBe(status);
  expect(response.headers.get("content-type")).toContain("application/json");
  expect(response.headers.get("cache-control")).toBe("no-store");
  return response.json();
}

describe("POST /api/analyze", () => {
  it.each([
    "application/json",
    "application/json; charset=utf-8",
    "Application/JSON ; charset=UTF-8",
  ])("accepts JSON media type %s", async (contentType) => {
    const h = harness();
    const incoming = request(validBody(), contentType);
    const response = await h.post(incoming);
    const body = await expectSafeJson(response, 200);

    expect(body).toMatchObject({
      ok: true,
      analysis: { policyId: "mfs-global-expense", version: "1.0.0" },
      metadata: { mode: "live", model: "gpt-5.6" },
    });
    expect(h.getApiKey).toHaveBeenCalledOnce();
    expect(h.createAnalyzer).toHaveBeenCalledWith(TEST_API_KEY);
    expect(h.analyze).toHaveBeenCalledWith(
      { policyText: "Synthetic policy text", targetVersion: "1.0.0" },
      incoming.signal,
    );
  });

  it.each([
    ["missing content type", validBody(), ""],
    ["wrong content type", validBody(), "text/plain"],
    ["malformed JSON", "{", "application/json"],
    ["empty JSON", "", "application/json"],
    ["array JSON", "[]", "application/json"],
    [
      "unknown property",
      JSON.stringify({
        policyText: "Synthetic policy text",
        targetVersion: "1.0.0",
        extra: true,
      }),
      "application/json",
    ],
    [
      "invalid target",
      JSON.stringify({ policyText: "Synthetic", targetVersion: "2.0.0" }),
      "application/json",
    ],
    [
      "empty policy",
      JSON.stringify({ policyText: "", targetVersion: "draft-v1" }),
      "application/json",
    ],
    [
      "policy over 20,000 characters",
      JSON.stringify({ policyText: "x".repeat(20_001), targetVersion: "draft-v1" }),
      "application/json",
    ],
  ])("rejects %s before key or analyzer access", async (_label, body, contentType) => {
    const h = harness();
    const incoming =
      contentType === ""
        ? new Request("http://localhost/api/analyze", {
            method: "POST",
            body,
          })
        : request(body, contentType);
    const response = await h.post(incoming);
    const payload = await expectSafeJson(response, 400);
    expect(payload).toEqual({
      ok: false,
      error: {
        code: "ANALYSIS_REQUEST_INVALID",
        message: "The Live policy analysis request is invalid.",
        retryable: false,
      },
    });
    expect(h.getApiKey).not.toHaveBeenCalled();
    expect(h.createAnalyzer).not.toHaveBeenCalled();
    expect(h.analyze).not.toHaveBeenCalled();
  });

  it("enforces actual UTF-8 bytes even when Content-Length is forged small", async () => {
    const h = harness();
    const oversized = JSON.stringify({
      policyText: "Synthetic policy",
      targetVersion: "draft-v1",
      padding: "界".repeat(22_000),
    });
    expect(new TextEncoder().encode(oversized).byteLength).toBeGreaterThan(65_536);
    const response = await h.post(
      request(oversized, "application/json", { "Content-Length": "1" }),
    );
    const body = await expectSafeJson(response, 400);
    expect(body.error.code).toBe("ANALYSIS_REQUEST_INVALID");
    expect(h.getApiKey).not.toHaveBeenCalled();
  });

  it("enforces actual UTF-8 bytes without Content-Length", async () => {
    const h = harness();
    const oversized = JSON.stringify({
      policyText: "Synthetic policy",
      targetVersion: "draft-v1",
      padding: "x".repeat(66_000),
    });
    const response = await h.post(request(oversized));
    expect(response.status).toBe(400);
    expect(h.getApiKey).not.toHaveBeenCalled();
  });

  it("honors an early excessive Content-Length guard", async () => {
    const h = harness();
    const response = await h.post(
      request(validBody(), "application/json", { "Content-Length": "65537" }),
    );
    expect(response.status).toBe(400);
    expect(h.getApiKey).not.toHaveBeenCalled();
  });

  it("returns 503 for a missing injected key without creating an analyzer", async () => {
    const h = harness({ getApiKey: () => undefined });
    const response = await h.post(request(validBody()));
    const body = await expectSafeJson(response, 503);
    expect(body).toEqual({
      ok: false,
      error: {
        code: "LIVE_MODE_UNAVAILABLE",
        message: "Live GPT-5.6 analysis is not available on this server.",
        retryable: false,
      },
    });
    expect(h.createAnalyzer).not.toHaveBeenCalled();
  });

  it.each([
    ["ANALYSIS_RATE_LIMITED", 429, true],
    ["ANALYSIS_TIMEOUT", 504, true],
    ["ANALYSIS_UPSTREAM_ERROR", 502, true],
    ["ANALYSIS_REFUSED", 422, false],
    ["ANALYSIS_SCHEMA_INVALID", 502, true],
    ["SOURCE_QUOTE_INVALID", 502, true],
  ] as const)("maps %s to HTTP %i", async (code, status, retryable) => {
    const rawPolicy = "RAW_POLICY_SENTINEL";
    const analyze = vi.fn().mockRejectedValue(
      createAppError(
        code,
        `raw error must not leak ${rawPolicy} ${TEST_API_KEY}`,
        retryable,
        "SAFE_TEST_DETAIL",
      ),
    );
    const post = createAnalyzePostHandler({
      getApiKey: () => TEST_API_KEY,
      createAnalyzer: () => ({ analyze }),
    });
    const response = await post(request(validBody()));
    const body = await expectSafeJson(response, status);

    expect(body).toMatchObject({
      ok: false,
      error: { code, retryable },
    });
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain(rawPolicy);
    expect(serialized).not.toContain(TEST_API_KEY);
    expect(serialized).not.toContain("SAFE_TEST_DETAIL");
    expect(serialized).not.toMatch(/stack|header|prompt/i);
  });

  it("maps unexpected failures to a safe no-store 500", async () => {
    const analyze = vi.fn().mockRejectedValue(new Error("raw stack and secret"));
    const post = createAnalyzePostHandler({
      getApiKey: () => TEST_API_KEY,
      createAnalyzer: () => ({ analyze }),
    });
    const response = await post(request(validBody()));
    const body = await expectSafeJson(response, 500);
    expect(body).toEqual({
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message:
          "Live policy analysis could not be completed. Your policy was not changed.",
        retryable: true,
      },
    });
    expect(JSON.stringify(body)).not.toContain("raw stack");
  });

  it("maps an invalid analyzer transport to a safe schema 502", async () => {
    const h = harness({
      createAnalyzer: vi.fn(() => ({
        analyze: vi.fn().mockResolvedValue({
          spec: { policyId: "not-canonical" },
          metadata: validResult().metadata,
        }),
      })),
    });

    const response = await h.post(request(validBody()));
    const body = await expectSafeJson(response, 502);
    expect(body).toEqual({
      ok: false,
      error: {
        code: "ANALYSIS_SCHEMA_INVALID",
        message:
          "Live policy analysis returned an invalid structure. Your policy was not changed.",
        retryable: true,
      },
    });
  });
});
