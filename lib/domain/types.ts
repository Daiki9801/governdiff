export const POLICY_ID = "mfs-global-expense" as const;

export type PolicyId = typeof POLICY_ID;
export type PolicyVersion = "draft-v1" | "1.0.0" | "1.1.0";
export type AnalysisMode = "live" | "sample";
export type Outcome = "clarification" | "manager_review";
export type Operator = "eq" | "gt" | "gte" | "lt" | "lte" | "missing";

export type ModelField =
  | "business_purpose"
  | "department_code"
  | "project_code"
  | "amount_usd"
  | "receipt_attached"
  | "category"
  | "expense_date"
  | "is_weekend"
  | "business_justification"
  | "manager_preapproved";

export type PredicateField = Exclude<ModelField, "expense_date">;
export type EvidenceField = ModelField;
export type ModelPredicateValue = string | boolean | null;
export type PredicateValue = string | boolean | number | null;
export type EvidenceValue = string | boolean | null;

export type ExpenseCategory =
  | "lodging"
  | "rideshare"
  | "meal"
  | "software"
  | "other";

export type RuleId =
  | "EXP-REQ-001"
  | "EXP-REQ-002"
  | "EXP-REQ-003"
  | "EXP-RCT-001"
  | "EXP-LDG-001"
  | "EXP-WKD-001"
  | "EXP-RID-001";

export interface RawExpenseRecord {
  readonly expense_id: string;
  readonly report_id: string;
  readonly employee_id: string;
  readonly expense_date: string;
  readonly department_code: string;
  readonly project_code: string;
  readonly category: string;
  readonly amount_usd: string;
  readonly receipt_attached: string;
  readonly business_purpose: string;
  readonly business_justification: string;
  readonly manager_preapproved: string;
  readonly employee_email: string;
}

export interface RawExpenseEvidence {
  readonly departmentCode: string;
  readonly projectCode: string;
  readonly businessPurpose: string;
  readonly businessJustification: string;
}

export interface ExpenseRecord {
  readonly expenseId: string;
  readonly reportId: string;
  readonly employeeId: string;
  readonly expenseDate: string;
  readonly departmentCode: string | null;
  readonly projectCode: string | null;
  readonly category: ExpenseCategory;
  readonly amountUsd: string;
  readonly amountCents: number;
  readonly receiptAttached: boolean;
  readonly isWeekend: boolean;
  readonly businessPurpose: string | null;
  readonly businessJustification: string | null;
  readonly managerPreapproved: boolean;
  readonly employeeEmail: string;
  readonly sourceRowNumber: number;
  readonly rawEvidence: RawExpenseEvidence;
}

export interface ModelPredicate {
  readonly field: ModelField;
  readonly operator: Operator;
  readonly value: ModelPredicateValue;
}

export interface AnalysisRule {
  readonly outcome: Outcome;
  readonly sourceQuote: string;
  readonly predicates: readonly ModelPredicate[];
}

export interface PolicyAmbiguity {
  readonly id: string;
  readonly sourceQuote: string;
  readonly question: string;
  readonly blocking: boolean;
}

export interface PolicyInputRequirement {
  readonly field: "expense_date";
  readonly required: true;
  readonly sourceQuote: string;
}

export interface UnsupportedStatement {
  readonly sourceQuote: string;
  readonly reason: string;
  readonly blocking: boolean;
}

export interface PolicyAnalysis {
  readonly policyId: PolicyId;
  readonly version: PolicyVersion;
  readonly rules: readonly AnalysisRule[];
  readonly ambiguities: readonly PolicyAmbiguity[];
  readonly inputRequirements: readonly PolicyInputRequirement[];
  readonly unsupportedStatements: readonly UnsupportedStatement[];
}

export interface PredicateCondition {
  readonly kind: "predicate";
  readonly field: PredicateField;
  readonly operator: Operator;
  readonly value: PredicateValue;
}

export interface AllCondition {
  readonly kind: "all";
  readonly conditions: readonly PredicateCondition[];
}

export type Condition = PredicateCondition | AllCondition;

export interface PolicyRule {
  readonly ruleId: RuleId;
  readonly label: string;
  readonly condition: Condition;
  readonly outcome: Outcome;
  readonly sourceQuote: string;
  readonly message: string;
  readonly evidenceFields: readonly EvidenceField[];
}

export interface PolicySpec {
  readonly policyId: PolicyId;
  readonly version: PolicyVersion;
  readonly rules: readonly PolicyRule[];
  readonly ambiguities: readonly PolicyAmbiguity[];
  readonly inputRequirements: readonly PolicyInputRequirement[];
  readonly unsupportedStatements: readonly UnsupportedStatement[];
}

export interface AnalysisMetadata {
  readonly mode: AnalysisMode;
  readonly model: "gpt-5.6" | null;
  readonly requestId: string | null;
  readonly analyzedAt: string;
  readonly durationMs: number;
}

export interface Finding {
  readonly findingKey: string;
  readonly policyId: PolicyId;
  readonly ruleId: RuleId;
  readonly expenseId: string;
  readonly outcome: Outcome;
  readonly message: string;
  readonly sourceQuote: string;
  readonly observed: Readonly<Partial<Record<EvidenceField, EvidenceValue>>>;
  readonly expectedCondition: string;
  readonly sourceRowNumber: number;
}

export type RuleDiffKind = "modified" | "added" | "removed";

export interface RuleDiffEntry {
  readonly ruleId: RuleId;
  readonly kind: RuleDiffKind;
  readonly before: PolicyRule | null;
  readonly after: PolicyRule | null;
}

export interface ImpactPreview {
  readonly baselineCount: number;
  readonly candidateCount: number;
  readonly removed: readonly Finding[];
  readonly added: readonly Finding[];
  readonly unchanged: readonly Finding[];
  readonly ruleDiff: readonly RuleDiffEntry[];
}
