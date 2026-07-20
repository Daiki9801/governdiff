import { describe, expect, it, vi } from "vitest";

import {
  createLivePolicyExecutor,
  type LiveFetch,
} from "../../lib/analysis/live-policy-client";
import { loadDemoScenario } from "../../lib/demo/fixture-loader.server";

function liveSuccess() {
  const scenario = loadDemoScenario(process.cwd(), false);
  return {
    ok: true,
    analysis: JSON.parse(
      JSON.stringify(scenario.sampleAnalyses["resolved-v1"].analysis),
    ),
    metadata: {
      mode: "live",
      model: "gpt-5.6",
      requestId: "req_client_test",
      analyzedAt: "2026-07-19T02:00:00.000Z",
      durationMs: 12,
    },
  } as const;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("createLivePolicyExecutor", () => {
  it("posts the exact request to the same-origin route and freezes fresh success data", async () => {
    const source = liveSuccess();
    const fetchMock = vi.fn<LiveFetch>().mockResolvedValue(jsonResponse(source));
    const execute = createLivePolicyExecutor(fetchMock);
    const signal = new AbortController().signal;

    const result = await execute(
      { policyText: "Synthetic policy\n", targetVersion: "1.0.0" },
      signal,
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        policyText: "Synthetic policy\n",
        targetVersion: "1.0.0",
      }),
      cache: "no-store",
      signal,
    });
    expect(result.spec).toEqual(source.analysis);
    expect(result.spec).not.toBe(source.analysis);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.spec)).toBe(true);
    expect(Object.isFrozen(result.spec.rules)).toBe(true);
    expect(Object.isFrozen(result.spec.rules[0]?.condition)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
  });

  it("throws a validated safe AppError from a non-success response", async () => {
    const fetchMock = vi.fn<LiveFetch>().mockResolvedValue(
      jsonResponse(
        {
          ok: false,
          error: {
            code: "ANALYSIS_RATE_LIMITED",
            message: "Live policy analysis is temporarily rate limited.",
            retryable: true,
          },
        },
        429,
      ),
    );
    const execute = createLivePolicyExecutor(fetchMock);

    await expect(
      execute(
        { policyText: "Synthetic policy", targetVersion: "draft-v1" },
        new AbortController().signal,
      ),
    ).rejects.toEqual({
      code: "ANALYSIS_RATE_LIMITED",
      message: "Live policy analysis is temporarily rate limited.",
      retryable: true,
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([
    ["malformed JSON", new Response("{", { status: 200 })],
    ["HTML", new Response("<html>upstream</html>", { status: 502 })],
    ["empty body", new Response("", { status: 200 })],
    [
      "unknown property",
      jsonResponse({ ...liveSuccess(), unexpected: true }),
    ],
    [
      "invalid metadata",
      jsonResponse({
        ...liveSuccess(),
        metadata: { ...liveSuccess().metadata, model: "gpt-5.6-sol" },
      }),
    ],
    [
      "invalid spec",
      jsonResponse({
        ...liveSuccess(),
        analysis: { ...liveSuccess().analysis, policyId: "other" },
      }),
    ],
    [
      "HTTP/body mismatch",
      jsonResponse(
        {
          ok: false,
          error: {
            code: "ANALYSIS_UPSTREAM_ERROR",
            message: "Safe failure.",
            retryable: true,
          },
        },
        200,
      ),
    ],
  ])("fails safely for %s", async (_label, response) => {
    const fetchMock = vi.fn<LiveFetch>().mockResolvedValue(response);
    const execute = createLivePolicyExecutor(fetchMock);
    await expect(
      execute(
        { policyText: "Synthetic policy", targetVersion: "draft-v1" },
        new AbortController().signal,
      ),
    ).rejects.toMatchObject({ code: "ANALYSIS_SCHEMA_INVALID" });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("preserves AbortError and performs no retry or fallback", async () => {
    const abortError = new DOMException("The operation was aborted.", "AbortError");
    const fetchMock = vi.fn<LiveFetch>().mockRejectedValue(abortError);
    const execute = createLivePolicyExecutor(fetchMock);
    const controller = new AbortController();
    controller.abort();

    await expect(
      execute(
        { policyText: "Synthetic policy", targetVersion: "draft-v1" },
        controller.signal,
      ),
    ).rejects.toBe(abortError);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("maps a network failure without leaking its raw detail", async () => {
    const fetchMock = vi
      .fn<LiveFetch>()
      .mockRejectedValue(new Error("raw network and key detail"));
    const execute = createLivePolicyExecutor(fetchMock);

    try {
      await execute(
        { policyText: "Synthetic policy", targetVersion: "draft-v1" },
        new AbortController().signal,
      );
      throw new Error("Expected client failure");
    } catch (error) {
      expect(error).toMatchObject({ code: "ANALYSIS_UPSTREAM_ERROR" });
      expect(JSON.stringify(error)).not.toContain("raw network");
    }
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
