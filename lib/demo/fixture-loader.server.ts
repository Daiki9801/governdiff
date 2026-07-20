import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";

import { parse } from "csv-parse/sync";

import { deriveWeekend } from "../domain/dates";
import { moneyToCents } from "../domain/money";
import {
  normalizePolicyText,
  validateCanonicalPolicySpec,
} from "../domain/policy-compiler";
import {
  fixtureExpectationsSchema,
  rawExpenseRecordSchema,
  type FixtureExpectations,
} from "../domain/schemas";
import type {
  ExpenseCategory,
  ExpenseRecord,
  RawExpenseRecord,
} from "../domain/types";
import { createAppError, isAppError } from "../errors/app-error";
import {
  SAMPLE_VARIANT_DEFINITIONS,
  copyAndFreezeSampleAnalysisAssets,
  sampleAnalysisAssetSchema,
  type SampleAnalysisAsset,
  type SampleAnalysisAssets,
  type SampleVariant,
} from "./fixture-contract";
import { verifyFixtureExpectations } from "./fixture-expectation-guard";

const CSV_HEADERS = [
  "expense_id",
  "report_id",
  "employee_id",
  "expense_date",
  "department_code",
  "project_code",
  "category",
  "amount_usd",
  "receipt_attached",
  "business_purpose",
  "business_justification",
  "manager_preapproved",
  "employee_email",
] as const;

const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  "lodging",
  "rideshare",
  "meal",
  "software",
  "other",
];

const CANONICAL_DATASET_SHA256 =
  "452acc27170249d64d26722dfb48158f8231987dd48bac9331e00dbcd210da8a";
const SYNTHETIC_EMAIL_PATTERN = /^[^@\s]+@example\.invalid$/;

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) {
      deepFreeze(nested);
    }
    Object.freeze(value);
  }
  return value;
}

export interface DemoScenario {
  readonly policyDraftV1: string;
  readonly policyV1: string;
  readonly policyV2: string;
  readonly initialDraftText: string;
  readonly sampleAnalyses: SampleAnalysisAssets;
  readonly records: readonly ExpenseRecord[];
  readonly expectations: FixtureExpectations;
  readonly datasetSha256: string;
  readonly liveModeAvailable: boolean;
}

function normalizeRequired(value: string, field: string): string {
  const normalized = value.normalize("NFC").trim();
  if (normalized.length === 0) {
    throw new Error(`${field} must not be blank`);
  }
  return normalized;
}

function normalizeOptional(value: string): string | null {
  const normalized = value.normalize("NFC").trim();
  return normalized.length === 0 ? null : normalized;
}

function parseBoolean(value: string, field: string): boolean {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new Error(`${field} must be exactly true or false`);
}

function isExpenseCategory(value: string): value is ExpenseCategory {
  return EXPENSE_CATEGORIES.some((category) => category === value);
}

function normalizeRow(row: RawExpenseRecord, index: number): ExpenseRecord {
  const expenseId = normalizeRequired(row.expense_id, "expense_id");
  const reportId = normalizeRequired(row.report_id, "report_id");
  const employeeId = normalizeRequired(row.employee_id, "employee_id");
  const expenseDate = row.expense_date.normalize("NFC");
  const categoryValue = normalizeRequired(row.category, "category");
  const employeeEmail = normalizeRequired(row.employee_email, "employee_email");

  if (!isExpenseCategory(categoryValue)) {
    throw new Error(`Unsupported expense category: ${categoryValue}`);
  }
  if (!SYNTHETIC_EMAIL_PATTERN.test(employeeEmail)) {
    throw new Error(`Invalid synthetic employee email domain: ${employeeEmail}`);
  }

  return {
    expenseId,
    reportId,
    employeeId,
    expenseDate,
    departmentCode: normalizeOptional(row.department_code),
    projectCode: normalizeOptional(row.project_code),
    category: categoryValue,
    amountUsd: row.amount_usd,
    amountCents: moneyToCents(row.amount_usd),
    receiptAttached: parseBoolean(row.receipt_attached, "receipt_attached"),
    isWeekend: deriveWeekend(expenseDate),
    businessPurpose: normalizeOptional(row.business_purpose),
    businessJustification: normalizeOptional(row.business_justification),
    managerPreapproved: parseBoolean(row.manager_preapproved, "manager_preapproved"),
    employeeEmail,
    sourceRowNumber: index + 2,
    rawEvidence: {
      departmentCode: row.department_code,
      projectCode: row.project_code,
      businessPurpose: row.business_purpose,
      businessJustification: row.business_justification,
    },
  };
}

export function normalizeExpenseRows(rawRows: readonly unknown[]): readonly ExpenseRecord[] {
  const parsedRows = rawExpenseRecordSchema.array().parse(rawRows);
  const records = parsedRows.map(normalizeRow);
  const expenseIds = new Set<string>();
  for (const record of records) {
    if (expenseIds.has(record.expenseId)) {
      throw new Error(`Duplicate expense_id: ${record.expenseId}`);
    }
    expenseIds.add(record.expenseId);
  }
  return records;
}

function assertExactSet(actual: ReadonlySet<string>, expected: readonly string[], label: string): void {
  if (actual.size !== expected.length || expected.some((value) => !actual.has(value))) {
    throw new Error(`Unexpected ${label} set`);
  }
}

function validateCanonicalDataset(records: readonly ExpenseRecord[]): void {
  if (records.length !== 48) {
    throw new Error(`Expected 48 expense rows, received ${records.length}`);
  }
  if (new Set(records.map((record) => record.reportId)).size !== 12) {
    throw new Error("Expected exactly 12 report IDs");
  }
  if (new Set(records.map((record) => record.employeeId)).size !== 8) {
    throw new Error("Expected exactly 8 employee IDs");
  }
  if (
    new Set(
      records
        .map((record) => record.departmentCode)
        .filter((department): department is string => department !== null),
    ).size !== 4
  ) {
    throw new Error("Expected exactly 4 non-empty department codes");
  }
  assertExactSet(
    new Set(records.map((record) => record.category)),
    EXPENSE_CATEGORIES,
    "expense category",
  );
}

function parseCsvRows(csvText: string): readonly unknown[] {
  const firstLine = csvText.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0];
  if (firstLine !== CSV_HEADERS.join(",")) {
    throw new Error("CSV header does not match the canonical contract");
  }

  const parsed: unknown = parse(csvText, {
    bom: true,
    columns: true,
    cast: false,
    skip_empty_lines: false,
    relax_column_count: false,
    trim: false,
  });
  if (!Array.isArray(parsed)) {
    throw new Error("CSV parser did not return an array");
  }
  return parsed;
}

function parseExpectations(value: string): FixtureExpectations {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Public fixture expectations are not valid JSON");
  }
  return fixtureExpectationsSchema.parse(parsed);
}

function normalizedFileHash(value: string): string {
  return createHash("sha256").update(normalizePolicyText(value), "utf8").digest("hex");
}

function parseSampleAsset(
  value: string,
  policyText: string,
  variant: SampleVariant,
): SampleAnalysisAsset {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(value);
  } catch {
    throw new Error("Sample asset is not valid JSON");
  }

  const parsed = sampleAnalysisAssetSchema.parse(parsedJson);
  const definition = SAMPLE_VARIANT_DEFINITIONS[variant];
  if (
    parsed.analysis.version !== definition.targetVersion ||
    parsed.provenance.capturedFrom !== "gpt-5.4"
  ) {
    throw new Error("Sample asset variant or provenance mismatch");
  }

  return Object.freeze({
    analysis: validateCanonicalPolicySpec(policyText, parsed.analysis),
    provenance: Object.freeze({ ...parsed.provenance }),
  });
}

function loadDemoScenarioUnsafe(
  repoRoot: string,
  liveModeAvailable: boolean,
): DemoScenario {
  if (!isAbsolute(repoRoot)) {
    throw new Error("Repository root must be an absolute path");
  }

  const demoRoot = join(repoRoot, "demo");
  const csvBytes = readFileSync(join(demoRoot, "MAVRENNA_EXPENSES_PUBLIC_DEMO.csv"));
  const datasetSha256 = createHash("sha256").update(csvBytes).digest("hex");
  const expectations = deepFreeze(
    parseExpectations(
      readFileSync(join(demoRoot, "public-fixture-expectations.json"), "utf8"),
    ),
  );

  if (
    expectations.dataset_sha256 !== CANONICAL_DATASET_SHA256 ||
    datasetSha256 !== expectations.dataset_sha256
  ) {
    throw new Error("Demo dataset SHA-256 does not match the canonical expectation");
  }

  const records = deepFreeze(
    normalizeExpenseRows(parseCsvRows(csvBytes.toString("utf8"))),
  );
  validateCanonicalDataset(records);

  const rawPolicyTexts = {
    "draft-v1": readFileSync(join(demoRoot, "policy-draft-v1.md"), "utf8"),
    "resolved-v1": readFileSync(join(demoRoot, "policy-v1.md"), "utf8"),
    "candidate-v2": readFileSync(join(demoRoot, "policy-v2.md"), "utf8"),
  } as const;
  for (const variant of Object.keys(SAMPLE_VARIANT_DEFINITIONS) as SampleVariant[]) {
    if (
      normalizedFileHash(rawPolicyTexts[variant]) !==
      SAMPLE_VARIANT_DEFINITIONS[variant].normalizedPolicySha256
    ) {
      throw new Error("Built-in policy hash mismatch");
    }
  }

  const policyDraftV1 = normalizePolicyText(rawPolicyTexts["draft-v1"]);
  const policyV1 = normalizePolicyText(rawPolicyTexts["resolved-v1"]);
  const policyV2 = normalizePolicyText(rawPolicyTexts["candidate-v2"]);
  const sampleAnalyses = copyAndFreezeSampleAnalysisAssets({
    "draft-v1": parseSampleAsset(
      readFileSync(
        join(
          demoRoot,
          SAMPLE_VARIANT_DEFINITIONS["draft-v1"].assetFileName,
        ),
        "utf8",
      ),
      policyDraftV1,
      "draft-v1",
    ),
    "resolved-v1": parseSampleAsset(
      readFileSync(
        join(
          demoRoot,
          SAMPLE_VARIANT_DEFINITIONS["resolved-v1"].assetFileName,
        ),
        "utf8",
      ),
      policyV1,
      "resolved-v1",
    ),
    "candidate-v2": parseSampleAsset(
      readFileSync(
        join(
          demoRoot,
          SAMPLE_VARIANT_DEFINITIONS["candidate-v2"].assetFileName,
        ),
        "utf8",
      ),
      policyV2,
      "candidate-v2",
    ),
  });

  verifyFixtureExpectations({
    baselineSpec: sampleAnalyses["resolved-v1"].analysis,
    candidateSpec: sampleAnalyses["candidate-v2"].analysis,
    records,
    expectations,
  });

  return Object.freeze({
    policyDraftV1,
    policyV1,
    policyV2,
    initialDraftText: policyDraftV1,
    sampleAnalyses,
    records,
    expectations,
    datasetSha256,
    liveModeAvailable,
  });
}

export function loadDemoScenario(
  repoRoot: string,
  liveModeAvailable = false,
): DemoScenario {
  try {
    return loadDemoScenarioUnsafe(repoRoot, liveModeAvailable);
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }
    throw createAppError(
      "DEMO_FIXTURE_INVALID",
      "The built-in demo scenario could not be loaded.",
      false,
      "DEMO_SCENARIO_INVALID",
    );
  }
}
