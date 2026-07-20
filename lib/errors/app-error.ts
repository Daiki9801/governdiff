export type AppErrorCode =
  | "DEMO_FIXTURE_INVALID"
  | "LIVE_MODE_UNAVAILABLE"
  | "ANALYSIS_REQUEST_INVALID"
  | "ANALYSIS_TIMEOUT"
  | "ANALYSIS_RATE_LIMITED"
  | "ANALYSIS_UPSTREAM_ERROR"
  | "ANALYSIS_REFUSED"
  | "ANALYSIS_SCHEMA_INVALID"
  | "SOURCE_QUOTE_INVALID"
  | "SAMPLE_VARIANT_UNSUPPORTED"
  | "QUICK_ACTION_SOURCE_MISMATCH"
  | "RUNTIME_SPEC_INVALID"
  | "RUNTIME_RECORD_INVALID"
  | "FIXTURE_EXPECTATION_FAILED"
  | "STATE_TRANSITION_INVALID"
  | "UNKNOWN_ERROR";

export interface AppError {
  readonly code: AppErrorCode;
  readonly message: string;
  readonly retryable: boolean;
  readonly detail?: string;
}

const APP_ERROR_CODES: ReadonlySet<AppErrorCode> = new Set<AppErrorCode>([
  "DEMO_FIXTURE_INVALID",
  "LIVE_MODE_UNAVAILABLE",
  "ANALYSIS_REQUEST_INVALID",
  "ANALYSIS_TIMEOUT",
  "ANALYSIS_RATE_LIMITED",
  "ANALYSIS_UPSTREAM_ERROR",
  "ANALYSIS_REFUSED",
  "ANALYSIS_SCHEMA_INVALID",
  "SOURCE_QUOTE_INVALID",
  "SAMPLE_VARIANT_UNSUPPORTED",
  "QUICK_ACTION_SOURCE_MISMATCH",
  "RUNTIME_SPEC_INVALID",
  "RUNTIME_RECORD_INVALID",
  "FIXTURE_EXPECTATION_FAILED",
  "STATE_TRANSITION_INVALID",
  "UNKNOWN_ERROR",
]);

const DIAGNOSTIC_DETAIL_PATTERN = /^[A-Z0-9][A-Z0-9_.:-]{0,79}$/;

export function createAppError(
  code: AppErrorCode,
  message: string,
  retryable: boolean,
  detail?: string,
): AppError {
  if (message.length === 0 || /[\r\n]/.test(message)) {
    throw new Error("AppError message must be a non-empty single line");
  }
  if (detail !== undefined && !DIAGNOSTIC_DETAIL_PATTERN.test(detail)) {
    throw new Error("AppError detail must be a short diagnostic code");
  }

  return Object.freeze(
    detail === undefined
      ? { code, message, retryable }
      : { code, message, retryable, detail },
  );
}

export function isAppError(value: unknown): value is AppError {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const keys = Object.keys(candidate);
  if (keys.some((key) => !["code", "message", "retryable", "detail"].includes(key))) {
    return false;
  }

  return (
    typeof candidate.code === "string" &&
    APP_ERROR_CODES.has(candidate.code as AppErrorCode) &&
    typeof candidate.message === "string" &&
    candidate.message.length > 0 &&
    !/[\r\n]/.test(candidate.message) &&
    typeof candidate.retryable === "boolean" &&
    (candidate.detail === undefined ||
      (typeof candidate.detail === "string" &&
        DIAGNOSTIC_DETAIL_PATTERN.test(candidate.detail)))
  );
}
