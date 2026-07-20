import { z } from "zod";

import type { PolicyAnalysis, PolicySpec, RawExpenseRecord } from "./types";

export const modelFieldSchema = z.enum([
  "business_purpose",
  "department_code",
  "project_code",
  "amount_usd",
  "receipt_attached",
  "category",
  "expense_date",
  "is_weekend",
  "business_justification",
  "manager_preapproved",
]);

export const operatorSchema = z.enum(["eq", "gt", "gte", "lt", "lte", "missing"]);
export const outcomeSchema = z.enum(["clarification", "manager_review"]);

export const ruleIdSchema = z.enum([
  "EXP-REQ-001",
  "EXP-REQ-002",
  "EXP-REQ-003",
  "EXP-RCT-001",
  "EXP-LDG-001",
  "EXP-WKD-001",
  "EXP-RID-001",
]);

export const predicateFieldSchema = z.enum([
  "business_purpose",
  "department_code",
  "project_code",
  "amount_usd",
  "receipt_attached",
  "category",
  "is_weekend",
  "business_justification",
  "manager_preapproved",
]);

export const evidenceFieldSchema = modelFieldSchema;

const predicateConditionSchema = z
  .object({
    kind: z.literal("predicate"),
    field: predicateFieldSchema,
    operator: operatorSchema,
    value: z.union([z.string(), z.boolean(), z.number(), z.null()]),
  })
  .strict();

const conditionSchema = z.discriminatedUnion("kind", [
  predicateConditionSchema,
  z
    .object({
      kind: z.literal("all"),
      conditions: z.array(predicateConditionSchema).min(2).max(3),
    })
    .strict(),
]);

export const policySpecSchema: z.ZodType<PolicySpec> = z
  .object({
    policyId: z.literal("mfs-global-expense"),
    version: z.enum(["draft-v1", "1.0.0", "1.1.0"]),
    rules: z.array(
      z
        .object({
          ruleId: ruleIdSchema,
          label: z.string().min(1),
          condition: conditionSchema,
          outcome: outcomeSchema,
          sourceQuote: z.string().min(1),
          message: z.string().min(1),
          evidenceFields: z.array(evidenceFieldSchema),
        })
        .strict(),
    ),
    ambiguities: z.array(
      z
        .object({
          id: z.string().min(1),
          sourceQuote: z.string().min(1),
          question: z.string().min(1),
          blocking: z.boolean(),
        })
        .strict(),
    ),
    inputRequirements: z.array(
      z
        .object({
          field: z.literal("expense_date"),
          required: z.literal(true),
          sourceQuote: z.string().min(1),
        })
        .strict(),
    ),
    unsupportedStatements: z.array(
      z
        .object({
          sourceQuote: z.string().min(1),
          reason: z.string().min(1),
          blocking: z.boolean(),
        })
        .strict(),
    ),
  })
  .strict();

export const policyAnalysisSchema: z.ZodType<PolicyAnalysis> = z
  .object({
    policyId: z.literal("mfs-global-expense"),
    version: z.enum(["draft-v1", "1.0.0", "1.1.0"]),
    rules: z.array(
      z
        .object({
          outcome: outcomeSchema,
          sourceQuote: z.string().min(1),
          predicates: z
            .array(
              z
                .object({
                  field: modelFieldSchema,
                  operator: operatorSchema,
                  value: z.union([z.string(), z.boolean(), z.null()]),
                })
                .strict(),
            )
            .min(1)
            .max(3),
        })
        .strict(),
    ),
    ambiguities: z.array(
      z
        .object({
          id: z.string().min(1),
          sourceQuote: z.string().min(1),
          question: z.string().min(1),
          blocking: z.boolean(),
        })
        .strict(),
    ),
    inputRequirements: z.array(
      z
        .object({
          field: z.literal("expense_date"),
          required: z.literal(true),
          sourceQuote: z.string().min(1),
        })
        .strict(),
    ),
    unsupportedStatements: z.array(
      z
        .object({
          sourceQuote: z.string().min(1),
          reason: z.string().min(1),
          blocking: z.boolean(),
        })
        .strict(),
    ),
  })
  .strict();

export const rawExpenseRecordSchema: z.ZodType<RawExpenseRecord> = z
  .object({
    expense_id: z.string(),
    report_id: z.string(),
    employee_id: z.string(),
    expense_date: z.string(),
    department_code: z.string(),
    project_code: z.string(),
    category: z.string(),
    amount_usd: z.string(),
    receipt_attached: z.string(),
    business_purpose: z.string(),
    business_justification: z.string(),
    manager_preapproved: z.string(),
    employee_email: z.string(),
  })
  .strict();

const evidenceValueSchema = z.union([z.string(), z.boolean(), z.null()]);

const expectedFindingSchema = z
  .object({
    finding_key: z.string(),
    rule_id: z.enum([
      "EXP-REQ-001",
      "EXP-REQ-002",
      "EXP-REQ-003",
      "EXP-RCT-001",
      "EXP-LDG-001",
      "EXP-WKD-001",
      "EXP-RID-001",
    ]),
    record_ref: z.string(),
    outcome: outcomeSchema,
    observed: z.record(z.string(), evidenceValueSchema),
  })
  .strict();

const expectedReleaseSchema = z
  .object({
    display_version: z.string(),
    release_version: z.string(),
    finding_count: z.number().int().nonnegative(),
    findings: z.array(expectedFindingSchema),
  })
  .strict();

export const fixtureExpectationsSchema = z
  .object({
    schema_version: z.literal("1.0"),
    scenario_id: z.literal("MFS-FINOPS-2026-01"),
    policy_id: z.literal("mfs-global-expense"),
    dataset_file: z.literal("MAVRENNA_EXPENSES_PUBLIC_DEMO.csv"),
    dataset_sha256: z.string().regex(/^[a-f0-9]{64}$/),
    normalization_contract: z.string(),
    baseline_release: expectedReleaseSchema,
    candidate_release: expectedReleaseSchema,
    impact_preview: z
      .object({
        removed_count: z.number().int().nonnegative(),
        added_count: z.number().int().nonnegative(),
        unchanged_count: z.number().int().nonnegative(),
        changed_count: z.literal(0),
        removed_finding_keys: z.array(z.string()),
        added_finding_keys: z.array(z.string()),
        unchanged_finding_keys: z.array(z.string()),
        published_v1_approval: z.string(),
        candidate_v2_release_approval: z.string(),
      })
      .strict(),
    notes: z.array(z.string()),
  })
  .strict();

export type FixtureExpectations = z.infer<typeof fixtureExpectationsSchema>;
