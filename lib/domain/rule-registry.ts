import { centsToUsd } from "./money";
import type {
  EvidenceField,
  EvidenceValue,
  ExpenseCategory,
  ExpenseRecord,
  Outcome,
  PolicyRule,
  PredicateCondition,
  PredicateField,
  PredicateValue,
  RuleId,
} from "./types";

type RuntimeFieldType =
  | "nullable_string"
  | "enum"
  | "money"
  | "boolean"
  | "derived_boolean";

type TemplateValue =
  | { readonly kind: "money" }
  | { readonly kind: "fixed"; readonly value: PredicateValue };

interface TemplatePredicate {
  readonly field: PredicateField;
  readonly operator: PredicateCondition["operator"];
  readonly value: TemplateValue;
}

export interface RuleRegistryEntry {
  readonly ruleId: RuleId;
  readonly label: string;
  readonly outcome: Outcome;
  readonly message: string;
  readonly evidenceFields: readonly EvidenceField[];
  readonly predicates: readonly TemplatePredicate[];
  readonly renderExpectedCondition: (
    predicates: readonly PredicateCondition[],
  ) => string;
}

const REQUIRED_FIELDS_QUOTE =
  "Every expense must include an expense date, business purpose, department code, and project code.";
const WEEKEND_QUOTE =
  "Expenses incurred on a Saturday or Sunday require a written business justification.";

const FIELD_TYPES: Readonly<Record<PredicateField, RuntimeFieldType>> = {
  business_purpose: "nullable_string",
  department_code: "nullable_string",
  project_code: "nullable_string",
  amount_usd: "money",
  receipt_attached: "boolean",
  category: "enum",
  is_weekend: "derived_boolean",
  business_justification: "nullable_string",
  manager_preapproved: "boolean",
};

const fixed = (value: PredicateValue): TemplateValue => ({ kind: "fixed", value });
const money = (): TemplateValue => ({ kind: "money" });

export const RULE_REGISTRY: readonly RuleRegistryEntry[] = [
  {
    ruleId: "EXP-REQ-001",
    label: "Business purpose required",
    outcome: "clarification",
    message: "Business purpose is required.",
    evidenceFields: ["business_purpose"],
    renderExpectedCondition: renderPredicates,
    predicates: [
      { field: "business_purpose", operator: "missing", value: fixed(null) },
    ],
  },
  {
    ruleId: "EXP-REQ-002",
    label: "Department code required",
    outcome: "clarification",
    message: "Department code is required.",
    evidenceFields: ["department_code"],
    renderExpectedCondition: renderPredicates,
    predicates: [
      { field: "department_code", operator: "missing", value: fixed(null) },
    ],
  },
  {
    ruleId: "EXP-REQ-003",
    label: "Project code required",
    outcome: "clarification",
    message: "Project code is required.",
    evidenceFields: ["project_code"],
    renderExpectedCondition: renderPredicates,
    predicates: [
      { field: "project_code", operator: "missing", value: fixed(null) },
    ],
  },
  {
    ruleId: "EXP-RCT-001",
    label: "Receipt required at threshold",
    outcome: "clarification",
    message: "A receipt is required at or above the policy threshold.",
    evidenceFields: ["amount_usd", "receipt_attached"],
    renderExpectedCondition: renderPredicates,
    predicates: [
      { field: "amount_usd", operator: "gte", value: money() },
      { field: "receipt_attached", operator: "eq", value: fixed(false) },
    ],
  },
  {
    ruleId: "EXP-LDG-001",
    label: "High-value lodging review",
    outcome: "manager_review",
    message: "Lodging amount requires manager review.",
    evidenceFields: ["category", "amount_usd"],
    renderExpectedCondition: renderPredicates,
    predicates: [
      { field: "category", operator: "eq", value: fixed("lodging") },
      { field: "amount_usd", operator: "gt", value: money() },
    ],
  },
  {
    ruleId: "EXP-WKD-001",
    label: "Weekend justification required",
    outcome: "clarification",
    message: "Weekend expense requires a business justification.",
    evidenceFields: ["expense_date", "is_weekend", "business_justification"],
    renderExpectedCondition: renderPredicates,
    predicates: [
      { field: "is_weekend", operator: "eq", value: fixed(true) },
      { field: "business_justification", operator: "missing", value: fixed(null) },
    ],
  },
  {
    ruleId: "EXP-RID-001",
    label: "High-value rideshare review",
    outcome: "manager_review",
    message: "Rideshare amount requires manager review unless preapproved.",
    evidenceFields: ["category", "amount_usd", "manager_preapproved"],
    renderExpectedCondition: renderPredicates,
    predicates: [
      { field: "category", operator: "eq", value: fixed("rideshare") },
      { field: "amount_usd", operator: "gt", value: money() },
      { field: "manager_preapproved", operator: "eq", value: fixed(false) },
    ],
  },
];

const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  "lodging",
  "rideshare",
  "meal",
  "software",
  "other",
];

function isExpenseCategory(value: string): value is ExpenseCategory {
  return EXPENSE_CATEGORIES.some((category) => category === value);
}

function valuesEqual(left: PredicateValue, right: PredicateValue): boolean {
  return typeof left === typeof right && left === right;
}

function findPredicate(
  predicates: readonly PredicateCondition[],
  field: PredicateField,
): PredicateCondition {
  const predicate = predicates.find((candidate) => candidate.field === field);
  if (predicate === undefined) {
    throw new Error(`Missing predicate for registry field: ${field}`);
  }
  return predicate;
}

function matchesTemplate(
  entry: RuleRegistryEntry,
  predicates: readonly PredicateCondition[],
): boolean {
  if (entry.predicates.length !== predicates.length) {
    return false;
  }

  return entry.predicates.every((template) => {
    const predicate = predicates.find((candidate) => candidate.field === template.field);
    if (predicate === undefined || predicate.operator !== template.operator) {
      return false;
    }
    if (template.value.kind === "money") {
      return (
        typeof predicate.value === "number" &&
        Number.isSafeInteger(predicate.value) &&
        predicate.value >= 0
      );
    }
    return valuesEqual(predicate.value, template.value.value);
  });
}

export function getRegistryEntry(ruleId: RuleId): RuleRegistryEntry {
  const entry = RULE_REGISTRY.find((candidate) => candidate.ruleId === ruleId);
  if (entry === undefined) {
    throw new Error(`Unknown registry rule: ${ruleId}`);
  }
  return entry;
}

export function matchRegistryEntry(
  predicates: readonly PredicateCondition[],
): RuleRegistryEntry {
  const matches = RULE_REGISTRY.filter((entry) => matchesTemplate(entry, predicates));
  if (matches.length !== 1) {
    throw new Error("Predicates do not match exactly one supported structural intent");
  }
  const match = matches[0];
  if (match === undefined) {
    throw new Error("Registry match unexpectedly missing");
  }
  return match;
}

export function canonicalizePredicates(
  entry: RuleRegistryEntry,
  predicates: readonly PredicateCondition[],
): readonly PredicateCondition[] {
  return entry.predicates.map((template) => ({ ...findPredicate(predicates, template.field) }));
}

export function validateCanonicalPredicate(predicate: PredicateCondition): void {
  const fieldType = FIELD_TYPES[predicate.field];

  if (predicate.operator === "missing") {
    if (fieldType !== "nullable_string" || predicate.value !== null) {
      throw new Error(`Invalid missing predicate for ${predicate.field}`);
    }
    return;
  }

  if (["gt", "gte", "lt", "lte"].includes(predicate.operator)) {
    if (
      fieldType !== "money" ||
      typeof predicate.value !== "number" ||
      !Number.isSafeInteger(predicate.value) ||
      predicate.value < 0
    ) {
      throw new Error(`Invalid comparison predicate for ${predicate.field}`);
    }
    return;
  }

  if (predicate.operator !== "eq") {
    throw new Error(`Unsupported operator: ${predicate.operator}`);
  }

  if (fieldType === "money") {
    if (
      typeof predicate.value !== "number" ||
      !Number.isSafeInteger(predicate.value) ||
      predicate.value < 0
    ) {
      throw new Error("Money equality requires non-negative integer cents");
    }
    return;
  }

  if (fieldType === "boolean" || fieldType === "derived_boolean") {
    if (typeof predicate.value !== "boolean") {
      throw new Error(`Boolean equality requires a boolean for ${predicate.field}`);
    }
    return;
  }

  if (fieldType === "enum") {
    if (
      typeof predicate.value !== "string" ||
      !isExpenseCategory(predicate.value)
    ) {
      throw new Error(`Invalid category predicate value: ${String(predicate.value)}`);
    }
    return;
  }

  if (typeof predicate.value !== "string" || predicate.value.length === 0) {
    throw new Error(`String equality requires a non-empty string for ${predicate.field}`);
  }
}

function moneyValue(
  predicates: readonly PredicateCondition[],
  field: "amount_usd",
): number {
  const value = findPredicate(predicates, field).value;
  if (typeof value !== "number") {
    throw new Error("Registry money predicate is not integer cents");
  }
  return value;
}

export function registrySourceQuote(
  entry: RuleRegistryEntry,
  predicates: readonly PredicateCondition[],
): string {
  switch (entry.ruleId) {
    case "EXP-REQ-001":
    case "EXP-REQ-002":
    case "EXP-REQ-003":
      return REQUIRED_FIELDS_QUOTE;
    case "EXP-RCT-001":
      return `Expenses of USD ${centsToUsd(moneyValue(predicates, "amount_usd"))} or more must include a receipt.`;
    case "EXP-LDG-001":
      return `Lodging expenses above USD ${centsToUsd(moneyValue(predicates, "amount_usd"))} require manager review.`;
    case "EXP-WKD-001":
      return WEEKEND_QUOTE;
    case "EXP-RID-001":
      return `Rideshare expenses above USD ${centsToUsd(moneyValue(predicates, "amount_usd"))} require manager review unless a manager preapproved the expense.`;
  }
}

function renderPredicate(predicate: PredicateCondition): string {
  if (predicate.operator === "missing") {
    return `${predicate.field} is missing`;
  }
  const operatorText: Readonly<Record<Exclude<PredicateCondition["operator"], "missing">, string>> = {
    eq: "=",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
  };
  const value =
    predicate.field === "amount_usd" && typeof predicate.value === "number"
      ? `USD ${centsToUsd(predicate.value)}`
      : String(predicate.value);
  return `${predicate.field} ${operatorText[predicate.operator]} ${value}`;
}

function renderPredicates(predicates: readonly PredicateCondition[]): string {
  return predicates.map(renderPredicate).join(" AND ");
}

export function renderExpectedCondition(rule: PolicyRule): string {
  const predicates =
    rule.condition.kind === "predicate" ? [rule.condition] : rule.condition.conditions;
  return getRegistryEntry(rule.ruleId).renderExpectedCondition(predicates);
}

export function readRuntimeField(
  record: ExpenseRecord,
  field: PredicateField,
): string | boolean | number | null {
  switch (field) {
    case "business_purpose":
      return record.businessPurpose;
    case "department_code":
      return record.departmentCode;
    case "project_code":
      return record.projectCode;
    case "amount_usd":
      return record.amountCents;
    case "receipt_attached":
      return record.receiptAttached;
    case "category":
      return record.category;
    case "is_weekend":
      return record.isWeekend;
    case "business_justification":
      return record.businessJustification;
    case "manager_preapproved":
      return record.managerPreapproved;
  }
}

export function readObservedField(record: ExpenseRecord, field: EvidenceField): EvidenceValue {
  switch (field) {
    case "business_purpose":
      return record.rawEvidence.businessPurpose;
    case "department_code":
      return record.rawEvidence.departmentCode;
    case "project_code":
      return record.rawEvidence.projectCode;
    case "amount_usd":
      return record.amountUsd;
    case "receipt_attached":
      return record.receiptAttached;
    case "category":
      return record.category;
    case "expense_date":
      return record.expenseDate;
    case "is_weekend":
      return record.isWeekend;
    case "business_justification":
      return record.rawEvidence.businessJustification;
    case "manager_preapproved":
      return record.managerPreapproved;
  }
}
