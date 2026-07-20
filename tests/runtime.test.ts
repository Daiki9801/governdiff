import { describe, expect, it } from "vitest";

import { loadDemoScenario } from "../lib/demo/fixture-loader.server";
import { moneyToCents } from "../lib/domain/money";
import { compilePolicyAnalysis } from "../lib/domain/policy-compiler";
import { evaluatePolicy } from "../lib/domain/policy-runtime";
import type {
  AnalysisRule,
  ExpenseRecord,
  Finding,
  PolicyAnalysis,
  PolicyRule,
} from "../lib/domain/types";

const REQUIRED_QUOTE =
  "Every expense must include an expense date, business purpose, department code, and project code.";

function makeAnalysis(candidate: boolean): PolicyAnalysis {
  const version = candidate ? "1.1.0" : "1.0.0";
  const threshold = candidate ? "150.00" : "100.00";
  const required = (field: "business_purpose" | "department_code" | "project_code"): AnalysisRule => ({
    outcome: "clarification",
    sourceQuote: REQUIRED_QUOTE,
    predicates: [{ field, operator: "missing", value: null }],
  });
  const rules: AnalysisRule[] = [
    required("business_purpose"),
    required("department_code"),
    required("project_code"),
    {
      outcome: "clarification",
      sourceQuote: `Expenses of USD ${threshold} or more must include a receipt.`,
      predicates: [
        { field: "amount_usd", operator: "gte", value: threshold },
        { field: "receipt_attached", operator: "eq", value: false },
      ],
    },
    {
      outcome: "manager_review",
      sourceQuote: "Lodging expenses above USD 275.00 require manager review.",
      predicates: [
        { field: "category", operator: "eq", value: "lodging" },
        { field: "amount_usd", operator: "gt", value: "275.00" },
      ],
    },
    {
      outcome: "clarification",
      sourceQuote:
        "Expenses incurred on a Saturday or Sunday require a written business justification.",
      predicates: [
        { field: "is_weekend", operator: "eq", value: true },
        { field: "business_justification", operator: "missing", value: null },
      ],
    },
  ];
  if (candidate) {
    rules.push({
      outcome: "manager_review",
      sourceQuote:
        "Rideshare expenses above USD 120.00 require manager review unless a manager preapproved the expense.",
      predicates: [
        { field: "category", operator: "eq", value: "rideshare" },
        { field: "amount_usd", operator: "gt", value: "120.00" },
        { field: "manager_preapproved", operator: "eq", value: false },
      ],
    });
  }
  return {
    policyId: "mfs-global-expense",
    version,
    rules,
    ambiguities: [],
    inputRequirements: [
      { field: "expense_date", required: true, sourceQuote: REQUIRED_QUOTE },
    ],
    unsupportedStatements: [],
  };
}

function expectationProjection(finding: Finding) {
  return {
    finding_key: finding.findingKey,
    rule_id: finding.ruleId,
    record_ref: finding.expenseId,
    outcome: finding.outcome,
    observed: finding.observed,
  };
}

describe("fixed policy runtime", () => {
  const scenario = loadDemoScenario(process.cwd());
  const baselineSpec = compilePolicyAnalysis(scenario.policyV1, makeAnalysis(false));
  const candidateSpec = compilePolicyAnalysis(scenario.policyV2, makeAnalysis(true));

  it("matches every canonical baseline and candidate Finding", () => {
    const baseline = evaluatePolicy(baselineSpec, scenario.records);
    const candidate = evaluatePolicy(candidateSpec, scenario.records);

    expect(baseline).toHaveLength(18);
    expect(candidate).toHaveLength(16);
    expect(baseline.map(expectationProjection)).toEqual(
      scenario.expectations.baseline_release.findings,
    );
    expect(candidate.map(expectationProjection)).toEqual(
      scenario.expectations.candidate_release.findings,
    );
  });

  it("uses exact finding identity, canonical outcomes, and registry-owned evidence text", () => {
    const findings = evaluatePolicy(candidateSpec, scenario.records);
    expect(
      findings.every(
        (finding) =>
          finding.findingKey ===
          `${finding.policyId}|${finding.ruleId}|${finding.expenseId}`,
      ),
    ).toBe(true);
    expect(new Set(findings.map((finding) => finding.findingKey)).size).toBe(findings.length);
    expect(findings.every((finding) => finding.message.length > 0)).toBe(true);
    expect(findings.every((finding) => finding.expectedCondition.length > 0)).toBe(true);
  });

  it("rejects a structurally valid rule whose predicates are not in canonical registry order", () => {
    const receiptRule = candidateSpec.rules.find((rule) => rule.ruleId === "EXP-RCT-001");
    if (receiptRule === undefined || receiptRule.condition.kind !== "all") {
      throw new Error("Candidate receipt rule missing from test fixture");
    }
    const reorderedRule: PolicyRule = {
      ...receiptRule,
      condition: {
        kind: "all",
        conditions: [...receiptRule.condition.conditions].reverse(),
      },
    };
    const reorderedSpec = {
      ...candidateSpec,
      rules: candidateSpec.rules.map((rule) =>
        rule.ruleId === reorderedRule.ruleId ? reorderedRule : rule,
      ),
    };

    expect(() => evaluatePolicy(reorderedSpec, scenario.records)).toThrow(/registry/);
  });

  it("enforces the candidate receipt boundary at 149.99 and 150.00", () => {
    const receiptKeys = evaluatePolicy(candidateSpec, scenario.records)
      .filter((finding) => finding.ruleId === "EXP-RCT-001")
      .map((finding) => finding.findingKey);

    expect(receiptKeys).not.toContain("mfs-global-expense|EXP-RCT-001|MFS-EXP-006");
    expect(receiptKeys).toContain("mfs-global-expense|EXP-RCT-001|MFS-EXP-007");
  });

  it("enforces rideshare 120.00/120.01 and manager preapproval boundaries", () => {
    const template = scenario.records[0];
    if (template === undefined) {
      throw new Error("Demo scenario has no template record");
    }
    const rideshare = (
      expenseId: string,
      amountUsd: string,
      managerPreapproved: boolean,
    ): ExpenseRecord => ({
      ...template,
      expenseId,
      category: "rideshare",
      amountUsd,
      amountCents: moneyToCents(amountUsd),
      managerPreapproved,
      receiptAttached: true,
      businessPurpose: "Boundary test",
      departmentCode: "FIN",
      projectCode: "PRJ-001",
      businessJustification: "Boundary test",
      isWeekend: false,
      rawEvidence: {
        departmentCode: "FIN",
        projectCode: "PRJ-001",
        businessPurpose: "Boundary test",
        businessJustification: "Boundary test",
      },
    });
    const records = [
      rideshare("RID-12000", "120.00", false),
      rideshare("RID-12001", "120.01", false),
      rideshare("RID-PREAPPROVED", "145.00", true),
    ];
    const rideshareFindings = evaluatePolicy(candidateSpec, records).filter(
      (finding) => finding.ruleId === "EXP-RID-001",
    );

    expect(rideshareFindings.map((finding) => finding.expenseId)).toEqual(["RID-12001"]);
  });

  it("is deterministic, stably sorted, and does not mutate records or specs", () => {
    const recordsBefore = JSON.stringify(scenario.records);
    const baselineBefore = JSON.stringify(baselineSpec);
    const first = evaluatePolicy(baselineSpec, scenario.records);
    const second = evaluatePolicy(baselineSpec, scenario.records);

    expect(second).toEqual(first);
    expect(JSON.stringify(scenario.records)).toBe(recordsBefore);
    expect(JSON.stringify(baselineSpec)).toBe(baselineBefore);
    expect(first.map((finding) => `${finding.ruleId}|${finding.expenseId}`)).toEqual(
      [...first]
        .sort((left, right) => {
          const leftKey = `${left.ruleId}|${left.expenseId}`;
          const rightKey = `${right.ruleId}|${right.expenseId}`;
          return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
        })
        .map((finding) => `${finding.ruleId}|${finding.expenseId}`),
    );
  });
});
