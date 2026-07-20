import OpenAI, {
  APIConnectionTimeoutError,
  APIError,
  APIUserAbortError,
  AuthenticationError,
  PermissionDeniedError,
  RateLimitError,
} from "openai";
import {
  ContentFilterFinishReasonError,
  LengthFinishReasonError,
} from "openai/core/error";
import { zodTextFormat } from "openai/helpers/zod";
import { ZodError } from "zod";

import { moneyToCents } from "../domain/money";
import {
  compilePolicyAnalysis,
  normalizePolicyText,
  validateCanonicalPolicySpec,
} from "../domain/policy-compiler";
import {
  matchRegistryEntry,
  registrySourceQuote,
} from "../domain/rule-registry";
import type {
  ModelPredicate,
  PolicyAnalysis,
  PredicateCondition,
} from "../domain/types";
import { createAppError, isAppError } from "../errors/app-error";
import type {
  AnalyzePolicyRequest,
  AnalyzePolicyResult,
  PolicyAnalyzer,
} from "./analyzer-contract";
import {
  buildPolicyAnalysisInput,
  POLICY_ANALYSIS_INSTRUCTIONS,
} from "./policy-analysis-prompt";
import {
  policyAnalysisOutputSchema,
  type ModelPolicyAnalysisOutput,
} from "./policy-analysis-schema";

const REQUIRED_FIELDS_QUOTE =
  "Every expense must include an expense date, business purpose, department code, and project code.";
const MONEY_PATTERN = /^(0|[1-9]\d*)\.\d{2}$/;
const EXPENSE_CATEGORIES = new Set([
  "lodging",
  "rideshare",
  "meal",
  "software",
  "other",
]);
const BOOLEAN_FIELDS = new Set([
  "receipt_attached",
  "is_weekend",
  "manager_preapproved",
]);
const NULLABLE_STRING_FIELDS = new Set([
  "business_purpose",
  "department_code",
  "project_code",
  "business_justification",
]);

class LiveSchemaError extends Error {}
class LiveSourceQuoteError extends Error {}

interface ResponsesEnvelope {
  readonly id?: unknown;
  readonly status?: unknown;
  readonly error?: unknown;
  readonly incomplete_details?: unknown;
  readonly output?: unknown;
  readonly output_parsed?: unknown;
  readonly _request_id?: unknown;
}

function createResponsesRequest(request: AnalyzePolicyRequest) {
  return {
    model: "gpt-5.6",
    reasoning: { effort: "low" },
    instructions: POLICY_ANALYSIS_INSTRUCTIONS,
    input: buildPolicyAnalysisInput(request),
    text: {
      format: zodTextFormat(
        policyAnalysisOutputSchema,
        "governdiff_policy_analysis",
      ),
    },
    max_output_tokens: 4_000,
    store: false,
  } as const;
}

export type LiveResponsesRequest = ReturnType<typeof createResponsesRequest>;
export type LiveResponsesParse = (
  request: LiveResponsesRequest,
  options: Readonly<{ signal: AbortSignal }>,
) => Promise<unknown>;

export interface OpenAIClientConfiguration {
  readonly apiKey: string;
  readonly maxRetries: 0;
  readonly timeout: 60_000;
  readonly logLevel: "off";
}

export interface LivePolicyAnalyzerDependencies {
  readonly createResponsesParse?: (
    configuration: OpenAIClientConfiguration,
  ) => LiveResponsesParse;
  readonly now?: () => Date;
  readonly timer?: () => number;
}

function defaultCreateResponsesParse(
  configuration: OpenAIClientConfiguration,
): LiveResponsesParse {
  const client = new OpenAI(configuration);
  return async (request, options) => client.responses.parse(request, options);
}

function asEnvelope(value: unknown): ResponsesEnvelope {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new LiveSchemaError("Responses envelope is invalid");
  }
  return value;
}

function hasRefusal(output: unknown): boolean {
  if (!Array.isArray(output)) {
    return false;
  }
  return output.some((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const content = Reflect.get(item, "content");
    return (
      Array.isArray(content) &&
      content.some(
        (part) =>
          typeof part === "object" &&
          part !== null &&
          Reflect.get(part, "type") === "refusal",
      )
    );
  });
}

function assertUniqueSourceQuote(policyText: string, sourceQuote: string): void {
  const quote = sourceQuote.normalize("NFC");
  const first = policyText.indexOf(quote);
  if (
    quote.length === 0 ||
    first < 0 ||
    policyText.indexOf(quote, first + 1) >= 0
  ) {
    throw new LiveSourceQuoteError("Source quote is not an exact unique match");
  }
}

function wirePredicateToCompiler(
  predicate: ModelPolicyAnalysisOutput["rules"][number]["predicates"][number],
): ModelPredicate {
  if (predicate.field === "expense_date") {
    throw new LiveSchemaError("expense_date cannot be a rule predicate");
  }

  if (predicate.operator === "missing") {
    if (!NULLABLE_STRING_FIELDS.has(predicate.field) || predicate.value !== null) {
      throw new LiveSchemaError("Invalid missing predicate");
    }
    return { field: predicate.field, operator: predicate.operator, value: null };
  }

  if (predicate.value === null) {
    throw new LiveSchemaError("Only missing predicates may use null");
  }

  if (predicate.field === "amount_usd") {
    if (
      !MONEY_PATTERN.test(predicate.value) ||
      !["eq", "gt", "gte", "lt", "lte"].includes(predicate.operator)
    ) {
      throw new LiveSchemaError("Invalid money predicate");
    }
    moneyToCents(predicate.value);
    return { ...predicate };
  }

  if (BOOLEAN_FIELDS.has(predicate.field)) {
    if (
      predicate.operator !== "eq" ||
      (predicate.value !== "true" && predicate.value !== "false")
    ) {
      throw new LiveSchemaError("Invalid boolean predicate");
    }
    return { ...predicate, value: predicate.value === "true" };
  }

  if (predicate.field === "category") {
    if (
      predicate.operator !== "eq" ||
      !EXPENSE_CATEGORIES.has(predicate.value)
    ) {
      throw new LiveSchemaError("Invalid category predicate");
    }
    return { ...predicate };
  }

  if (predicate.operator !== "eq" || predicate.value.length === 0) {
    throw new LiveSchemaError("Invalid string predicate");
  }
  return { ...predicate };
}

function compilerPredicateToCanonical(
  predicate: ModelPredicate,
): PredicateCondition {
  if (predicate.field === "expense_date") {
    throw new LiveSchemaError("expense_date cannot be canonicalized");
  }
  if (predicate.field === "amount_usd") {
    if (typeof predicate.value !== "string") {
      throw new LiveSchemaError("Money predicate must be a string");
    }
    return {
      kind: "predicate",
      field: predicate.field,
      operator: predicate.operator,
      value: moneyToCents(predicate.value),
    };
  }
  return {
    kind: "predicate",
    field: predicate.field,
    operator: predicate.operator,
    value: predicate.value,
  };
}

function toCompilerInput(
  policyTextInput: string,
  output: ModelPolicyAnalysisOutput,
): PolicyAnalysis {
  const policyText = normalizePolicyText(policyTextInput);
  const usedRuleIds = new Set<string>();

  const rules = output.rules.map((rule) => {
    if (usedRuleIds.has(rule.ruleId)) {
      throw new LiveSchemaError("Rule IDs must be unique");
    }
    usedRuleIds.add(rule.ruleId);

    const fields = rule.predicates.map((predicate) => predicate.field);
    if (new Set(fields).size !== fields.length) {
      throw new LiveSchemaError("Predicate fields must be unique within a rule");
    }

    const predicates = rule.predicates.map(wirePredicateToCompiler);
    const canonicalPredicates = predicates.map(compilerPredicateToCanonical);
    const registryEntry = matchRegistryEntry(canonicalPredicates);
    if (registryEntry.ruleId !== rule.ruleId) {
      throw new LiveSchemaError("Proposed rule ID does not match the host registry");
    }
    if (registryEntry.outcome !== rule.outcome) {
      throw new LiveSchemaError("Rule outcome does not match the host registry");
    }
    if (registrySourceQuote(registryEntry, canonicalPredicates) !== rule.sourceQuote) {
      throw new LiveSourceQuoteError("Source quote does not match the rule template");
    }
    assertUniqueSourceQuote(policyText, rule.sourceQuote);
    return {
      outcome: rule.outcome,
      sourceQuote: rule.sourceQuote,
      predicates,
    };
  });

  for (const ambiguity of output.ambiguities) {
    assertUniqueSourceQuote(policyText, ambiguity.sourceQuote);
  }
  for (const statement of output.unsupportedStatements) {
    assertUniqueSourceQuote(policyText, statement.sourceQuote);
  }
  assertUniqueSourceQuote(policyText, REQUIRED_FIELDS_QUOTE);

  return {
    policyId: output.policyId,
    version: output.version,
    rules,
    ambiguities: output.ambiguities.map((ambiguity) => ({ ...ambiguity })),
    inputRequirements: [
      {
        field: "expense_date",
        required: true,
        sourceQuote: REQUIRED_FIELDS_QUOTE,
      },
    ],
    unsupportedStatements: output.unsupportedStatements.map((statement) => ({
      ...statement,
    })),
  };
}

function mapAnalyzerError(error: unknown) {
  if (isAppError(error)) {
    return error;
  }
  if (error instanceof LiveSourceQuoteError) {
    return createAppError(
      "SOURCE_QUOTE_INVALID",
      "Live policy analysis returned an invalid source quote. Your policy was not changed.",
      true,
      "LIVE_SOURCE_QUOTE_INVALID",
    );
  }
  if (
    error instanceof LiveSchemaError ||
    error instanceof ZodError ||
    error instanceof LengthFinishReasonError
  ) {
    return createAppError(
      "ANALYSIS_SCHEMA_INVALID",
      "Live policy analysis returned an invalid structure. Your policy was not changed.",
      true,
      "LIVE_SCHEMA_INVALID",
    );
  }
  if (error instanceof ContentFilterFinishReasonError) {
    return createAppError(
      "ANALYSIS_REFUSED",
      "Live policy analysis was refused. Your policy was not changed.",
      false,
      "LIVE_ANALYSIS_REFUSED",
    );
  }
  if (error instanceof APIConnectionTimeoutError) {
    return createAppError(
      "ANALYSIS_TIMEOUT",
      "Live policy analysis timed out. Your policy was not changed.",
      true,
      "OPENAI_TIMEOUT",
    );
  }
  if (error instanceof RateLimitError || (error instanceof APIError && error.status === 429)) {
    return createAppError(
      "ANALYSIS_RATE_LIMITED",
      "Live policy analysis is temporarily rate limited. Your policy was not changed.",
      true,
      "OPENAI_RATE_LIMITED",
    );
  }
  if (error instanceof AuthenticationError || error instanceof PermissionDeniedError) {
    return createAppError(
      "ANALYSIS_UPSTREAM_ERROR",
      "Live policy analysis is unavailable because the server configuration was rejected.",
      false,
      "OPENAI_CONFIGURATION_REJECTED",
    );
  }
  if (error instanceof APIError) {
    return createAppError(
      "ANALYSIS_UPSTREAM_ERROR",
      "Live policy analysis is temporarily unavailable. Your policy was not changed.",
      true,
      "OPENAI_UPSTREAM_ERROR",
    );
  }
  return createAppError(
    "UNKNOWN_ERROR",
    "Live policy analysis could not be completed. Your policy was not changed.",
    true,
    "LIVE_ANALYSIS_UNKNOWN",
  );
}

export class LivePolicyAnalyzer implements PolicyAnalyzer {
  readonly #apiKey: string;
  readonly #createResponsesParse: (
    configuration: OpenAIClientConfiguration,
  ) => LiveResponsesParse;
  readonly #now: () => Date;
  readonly #timer: () => number;
  #responsesParse: LiveResponsesParse | null = null;

  constructor(
    apiKey: string,
    dependencies: LivePolicyAnalyzerDependencies = {},
  ) {
    if (apiKey.trim().length === 0) {
      throw createAppError(
        "LIVE_MODE_UNAVAILABLE",
        "Live GPT-5.6 analysis is not available on this server.",
        false,
        "OPENAI_KEY_MISSING",
      );
    }
    this.#apiKey = apiKey;
    this.#createResponsesParse =
      dependencies.createResponsesParse ?? defaultCreateResponsesParse;
    this.#now = dependencies.now ?? (() => new Date());
    this.#timer = dependencies.timer ?? (() => performance.now());
  }

  async analyze(
    request: AnalyzePolicyRequest,
    signal: AbortSignal = new AbortController().signal,
  ): Promise<AnalyzePolicyResult> {
    const startedAt = this.#timer();
    try {
      const parse =
        this.#responsesParse ??
        (this.#responsesParse = this.#createResponsesParse({
          apiKey: this.#apiKey,
          maxRetries: 0,
          timeout: 60_000,
          logLevel: "off",
        }));
      const rawResponse = await parse(createResponsesRequest(request), { signal });
      const response = asEnvelope(rawResponse);

      if (hasRefusal(response.output)) {
        throw createAppError(
          "ANALYSIS_REFUSED",
          "Live policy analysis was refused. Your policy was not changed.",
          false,
          "LIVE_ANALYSIS_REFUSED",
        );
      }
      if (
        response.status !== "completed" ||
        response.error !== null ||
        response.incomplete_details !== null
      ) {
        throw new LiveSchemaError("Responses completion was not successful");
      }
      if (response.output_parsed === null || response.output_parsed === undefined) {
        throw new LiveSchemaError("Parsed output is missing");
      }

      const output = policyAnalysisOutputSchema.parse(response.output_parsed);
      if (output.version !== request.targetVersion) {
        throw new LiveSchemaError("Target version mismatch");
      }
      const compilerInput = toCompilerInput(request.policyText, output);
      const compiled = compilePolicyAnalysis(request.policyText, compilerInput);
      const spec = validateCanonicalPolicySpec(request.policyText, compiled);
      const requestId =
        typeof response._request_id === "string" && response._request_id.length > 0
          ? response._request_id
          : null;
      const endedAt = this.#timer();
      const durationMs = Math.max(
        0,
        Number.isFinite(endedAt - startedAt) ? endedAt - startedAt : 0,
      );

      return Object.freeze({
        spec,
        metadata: Object.freeze({
          mode: "live",
          model: "gpt-5.6",
          requestId,
          analyzedAt: this.#now().toISOString(),
          durationMs,
        }),
      });
    } catch (error) {
      if (signal.aborted || error instanceof APIUserAbortError) {
        throw error;
      }
      throw mapAnalyzerError(error);
    }
  }
}
