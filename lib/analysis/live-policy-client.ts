import { createAppError } from "../errors/app-error";
import type { AnalyzeExecutor } from "./policy-analysis-controller";
import {
  analyzePolicyResponseSchema,
  parseAndFreezeAnalyzePolicySuccess,
} from "./policy-analysis-schema";

export type LiveFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

function isAbortError(error: unknown, signal: AbortSignal): boolean {
  return (
    signal.aborted ||
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

export function createLivePolicyExecutor(
  fetchImplementation: LiveFetch = globalThis.fetch,
): AnalyzeExecutor {
  return async (request, signal) => {
    let response: Response;
    try {
      response = await fetchImplementation("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyText: request.policyText,
          targetVersion: request.targetVersion,
        }),
        cache: "no-store",
        signal,
      });
    } catch (error) {
      if (isAbortError(error, signal)) {
        throw error;
      }
      throw createAppError(
        "ANALYSIS_UPSTREAM_ERROR",
        "Live policy analysis is temporarily unavailable. Your policy was not changed.",
        true,
        "LIVE_FETCH_FAILED",
      );
    }

    let payload: unknown;
    try {
      payload = JSON.parse(await response.text());
    } catch {
      throw createAppError(
        "ANALYSIS_SCHEMA_INVALID",
        "Live policy analysis returned an invalid response. Your policy was not changed.",
        true,
        "LIVE_RESPONSE_INVALID",
      );
    }

    const parsed = analyzePolicyResponseSchema.safeParse(payload);
    if (!parsed.success || response.ok !== parsed.data.ok) {
      throw createAppError(
        "ANALYSIS_SCHEMA_INVALID",
        "Live policy analysis returned an invalid response. Your policy was not changed.",
        true,
        "LIVE_RESPONSE_INVALID",
      );
    }
    if (!parsed.data.ok) {
      throw createAppError(
        parsed.data.error.code,
        parsed.data.error.message,
        parsed.data.error.retryable,
      );
    }

    const owned = parseAndFreezeAnalyzePolicySuccess(parsed.data);
    return Object.freeze({
      spec: owned.analysis,
      metadata: owned.metadata,
    });
  };
}
