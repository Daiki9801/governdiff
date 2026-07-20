import { LivePolicyAnalyzer } from "../../../lib/analysis/live-policy-analyzer.server";
import {
  analyzePolicyRequestSchema,
  analyzePolicySuccessSchema,
  type AnalyzePolicyResponse,
} from "../../../lib/analysis/policy-analysis-schema";
import { createAppError, isAppError, type AppError } from "../../../lib/errors/app-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 65_536;

interface RouteAnalyzer {
  analyze(
    request: Readonly<{ policyText: string; targetVersion: "draft-v1" | "1.0.0" | "1.1.0" }>,
    signal: AbortSignal,
  ): Promise<{
    readonly spec: unknown;
    readonly metadata: unknown;
  }>;
}

export interface AnalyzeRouteDependencies {
  readonly getApiKey: () => string | undefined;
  readonly createAnalyzer: (apiKey: string) => RouteAnalyzer;
}

const HTTP_STATUS_BY_CODE = {
  ANALYSIS_REQUEST_INVALID: 400,
  LIVE_MODE_UNAVAILABLE: 503,
  ANALYSIS_RATE_LIMITED: 429,
  ANALYSIS_TIMEOUT: 504,
  ANALYSIS_UPSTREAM_ERROR: 502,
  ANALYSIS_REFUSED: 422,
  ANALYSIS_SCHEMA_INVALID: 502,
  SOURCE_QUOTE_INVALID: 502,
  UNKNOWN_ERROR: 500,
} as const;

const SAFE_MESSAGE_BY_CODE: Readonly<
  Record<keyof typeof HTTP_STATUS_BY_CODE, string>
> = {
  ANALYSIS_REQUEST_INVALID: "The Live policy analysis request is invalid.",
  LIVE_MODE_UNAVAILABLE: "Live GPT-5.6 analysis is not available on this server.",
  ANALYSIS_RATE_LIMITED:
    "Live policy analysis is temporarily rate limited. Your policy was not changed.",
  ANALYSIS_TIMEOUT:
    "Live policy analysis timed out. Your policy was not changed.",
  ANALYSIS_UPSTREAM_ERROR:
    "Live policy analysis is temporarily unavailable. Your policy was not changed.",
  ANALYSIS_REFUSED:
    "Live policy analysis was refused. Your policy was not changed.",
  ANALYSIS_SCHEMA_INVALID:
    "Live policy analysis returned an invalid structure. Your policy was not changed.",
  SOURCE_QUOTE_INVALID:
    "Live policy analysis returned an invalid source quote. Your policy was not changed.",
  UNKNOWN_ERROR:
    "Live policy analysis could not be completed. Your policy was not changed.",
};

function jsonResponse(body: AnalyzePolicyResponse, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
  });
}

function errorResponse(error: AppError): Response {
  const code = Object.hasOwn(HTTP_STATUS_BY_CODE, error.code)
    ? (error.code as keyof typeof HTTP_STATUS_BY_CODE)
    : "UNKNOWN_ERROR";
  const safeError =
    code === error.code
      ? {
          code,
          message: SAFE_MESSAGE_BY_CODE[code],
          retryable: error.retryable,
        }
      : {
          code: "UNKNOWN_ERROR" as const,
          message: SAFE_MESSAGE_BY_CODE.UNKNOWN_ERROR,
          retryable: true,
        };
  return jsonResponse(
    {
      ok: false,
      error: safeError,
    },
    HTTP_STATUS_BY_CODE[code],
  );
}

function invalidRequest(): Response {
  return errorResponse(
    createAppError(
      "ANALYSIS_REQUEST_INVALID",
      "The Live policy analysis request is invalid.",
      false,
    ),
  );
}

function hasJsonMediaType(value: string | null): boolean {
  return value?.split(";", 1)[0]?.trim().toLowerCase() === "application/json";
}

export function createAnalyzePostHandler(
  dependencies: AnalyzeRouteDependencies,
): (request: Request) => Promise<Response> {
  return async (request) => {
    if (!hasJsonMediaType(request.headers.get("content-type"))) {
      return invalidRequest();
    }

    const contentLength = request.headers.get("content-length");
    if (
      contentLength !== null &&
      /^\d+$/.test(contentLength) &&
      Number(contentLength) > MAX_BODY_BYTES
    ) {
      return invalidRequest();
    }

    let text: string;
    try {
      text = await request.text();
    } catch {
      return invalidRequest();
    }
    if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
      return invalidRequest();
    }

    let unknownBody: unknown;
    try {
      unknownBody = JSON.parse(text);
    } catch {
      return invalidRequest();
    }
    const parsedRequest = analyzePolicyRequestSchema.safeParse(unknownBody);
    if (!parsedRequest.success) {
      return invalidRequest();
    }

    const apiKey = dependencies.getApiKey();
    if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
      return errorResponse(
        createAppError(
          "LIVE_MODE_UNAVAILABLE",
          "Live GPT-5.6 analysis is not available on this server.",
          false,
        ),
      );
    }

    try {
      const result = await dependencies
        .createAnalyzer(apiKey)
        .analyze(parsedRequest.data, request.signal);
      const success = analyzePolicySuccessSchema.safeParse({
        ok: true,
        analysis: result.spec,
        metadata: result.metadata,
      });
      if (!success.success) {
        throw createAppError(
          "ANALYSIS_SCHEMA_INVALID",
          "Live policy analysis returned an invalid structure. Your policy was not changed.",
          true,
          "LIVE_RESPONSE_TRANSPORT_INVALID",
        );
      }
      return jsonResponse(success.data, 200);
    } catch (error) {
      return errorResponse(
        isAppError(error)
          ? error
          : createAppError(
              "UNKNOWN_ERROR",
              "Live policy analysis could not be completed. Your policy was not changed.",
              true,
            ),
      );
    }
  };
}

export const POST = createAnalyzePostHandler({
  getApiKey: () => process.env.OPENAI_API_KEY,
  createAnalyzer: (apiKey) => new LivePolicyAnalyzer(apiKey),
});
