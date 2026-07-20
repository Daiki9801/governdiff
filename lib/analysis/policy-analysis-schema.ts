import { z } from "zod";

import {
  modelFieldSchema,
  operatorSchema,
  outcomeSchema,
  policySpecSchema,
  ruleIdSchema,
} from "../domain/schemas";

export const policyTargetVersionSchema = z.enum([
  "draft-v1",
  "1.0.0",
  "1.1.0",
]);

export const analyzePolicyRequestSchema = z
  .object({
    policyText: z.string().min(1).max(20_000),
    targetVersion: policyTargetVersionSchema,
  })
  .strict();

const modelPredicateSchema = z
  .object({
    field: modelFieldSchema,
    operator: operatorSchema,
    value: z.string().nullable(),
  })
  .strict();

const modelPolicyRuleSchema = z
  .object({
    ruleId: ruleIdSchema,
    predicates: z.array(modelPredicateSchema).min(1).max(3),
    outcome: outcomeSchema,
    sourceQuote: z.string().min(1),
  })
  .strict();

const modelAmbiguitySchema = z
  .object({
    id: z.string().min(1),
    sourceQuote: z.string().min(1),
    question: z.string().min(1),
    blocking: z.boolean(),
  })
  .strict();

const modelUnsupportedStatementSchema = z
  .object({
    sourceQuote: z.string().min(1),
    reason: z.string().min(1),
    blocking: z.boolean(),
  })
  .strict();

export const policyAnalysisOutputSchema = z
  .object({
    policyId: z.literal("mfs-global-expense"),
    version: policyTargetVersionSchema,
    rules: z.array(modelPolicyRuleSchema),
    ambiguities: z.array(modelAmbiguitySchema),
    unsupportedStatements: z.array(modelUnsupportedStatementSchema),
  })
  .strict();

export const liveAnalysisMetadataSchema = z
  .object({
    mode: z.literal("live"),
    model: z.literal("gpt-5.6"),
    requestId: z.string().min(1).nullable(),
    analyzedAt: z.string().min(1),
    durationMs: z.number().finite().nonnegative(),
  })
  .strict();

export const analyzePolicySuccessSchema = z
  .object({
    ok: z.literal(true),
    analysis: policySpecSchema,
    metadata: liveAnalysisMetadataSchema,
  })
  .strict();

export const liveAnalysisErrorCodeSchema = z.enum([
  "LIVE_MODE_UNAVAILABLE",
  "ANALYSIS_REQUEST_INVALID",
  "ANALYSIS_TIMEOUT",
  "ANALYSIS_RATE_LIMITED",
  "ANALYSIS_UPSTREAM_ERROR",
  "ANALYSIS_REFUSED",
  "ANALYSIS_SCHEMA_INVALID",
  "SOURCE_QUOTE_INVALID",
  "UNKNOWN_ERROR",
]);

export const analyzePolicyErrorSchema = z
  .object({
    ok: z.literal(false),
    error: z
      .object({
        code: liveAnalysisErrorCodeSchema,
        message: z.string().min(1).refine((value) => !/[\r\n]/.test(value)),
        retryable: z.boolean(),
      })
      .strict(),
  })
  .strict();

export const analyzePolicyResponseSchema = z.discriminatedUnion("ok", [
  analyzePolicySuccessSchema,
  analyzePolicyErrorSchema,
]);

export type ModelPolicyAnalysisOutput = z.infer<
  typeof policyAnalysisOutputSchema
>;
export type AnalyzePolicySuccess = z.infer<typeof analyzePolicySuccessSchema>;
export type AnalyzePolicyResponse = z.infer<typeof analyzePolicyResponseSchema>;

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) {
      deepFreeze(nested);
    }
    Object.freeze(value);
  }
  return value;
}

export function parseAndFreezeAnalyzePolicySuccess(
  input: unknown,
): AnalyzePolicySuccess {
  return deepFreeze(analyzePolicySuccessSchema.parse(input));
}
