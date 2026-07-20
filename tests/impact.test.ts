import { describe, expect, it } from "vitest";

import { loadDemoScenario } from "../lib/demo/fixture-loader.server";
import { computeImpact, diffRules } from "../lib/domain/impact-engine";
import { compilePolicyAnalysis } from "../lib/domain/policy-compiler";
import type { AnalysisRule, PolicyAnalysis, PolicyRule } from "../lib/domain/types";

const REQUIRED_QUOTE =
  "Every expense must include an expense date, business purpose, department code, and project code.";

function makeAnalysis(candidate: boolean): PolicyAnalysis {
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
    version: candidate ? "1.1.0" : "1.0.0",
    rules,
    ambiguities: [],
    inputRequirements: [
      { field: "expense_date", required: true, sourceQuote: REQUIRED_QUOTE },
    ],
    unsupportedStatements: [],
  };
}

describe("deterministic impact engine", () => {
  const scenario = loadDemoScenario(process.cwd());
  const baseline = compilePolicyAnalysis(scenario.policyV1, makeAnalysis(false));
  const candidate = compilePolicyAnalysis(scenario.policyV2, makeAnalysis(true));

  it("proves the exact 18 / 16 / 3 / 1 / 15 public fixture contract", () => {
    const impact = computeImpact(baseline, candidate, scenario.records);

    expect(impact.baselineCount).toBe(18);
    expect(impact.candidateCount).toBe(16);
    expect(impact.removed).toHaveLength(3);
    expect(impact.added).toHaveLength(1);
    expect(impact.unchanged).toHaveLength(15);
    expect("changed" in impact).toBe(false);
  });

  it("matches every expected removed, added, and unchanged key", () => {
    const impact = computeImpact(baseline, candidate, scenario.records);

    expect(impact.removed.map((finding) => finding.findingKey)).toEqual(
      scenario.expectations.impact_preview.removed_finding_keys,
    );
    expect(impact.added.map((finding) => finding.findingKey)).toEqual(
      scenario.expectations.impact_preview.added_finding_keys,
    );
    expect(impact.unchanged.map((finding) => finding.findingKey)).toEqual(
      scenario.expectations.impact_preview.unchanged_finding_keys,
    );
  });

  it("returns the exact canonical rule diff and omits unchanged rules", () => {
    const impact = computeImpact(baseline, candidate, scenario.records);
    expect(impact.ruleDiff.map(({ ruleId, kind }) => ({ ruleId, kind }))).toEqual([
      { ruleId: "EXP-RCT-001", kind: "modified" },
      { ruleId: "EXP-RID-001", kind: "added" },
    ]);
  });

  it("ignores source quote and message-only changes in the canonical rule projection", () => {
    const rule = baseline.rules.find((candidateRule) => candidateRule.ruleId === "EXP-LDG-001");
    if (rule === undefined) {
      throw new Error("Baseline lodging rule missing from test fixture");
    }
    const textOnlyChange: PolicyRule = {
      ...rule,
      sourceQuote: "Display-only source quote change",
      message: "Display-only message change",
    };

    expect(diffRules([rule], [textOnlyChange])).toEqual([]);
  });

  it("classifies removed rules and canonical outcome changes", () => {
    const rule = baseline.rules.find((candidateRule) => candidateRule.ruleId === "EXP-LDG-001");
    if (rule === undefined) {
      throw new Error("Baseline lodging rule missing from test fixture");
    }
    const outcomeChange: PolicyRule = { ...rule, outcome: "clarification" };

    expect(
      diffRules([rule], []).map(({ ruleId, kind, after }) => ({ ruleId, kind, after })),
    ).toEqual([{ ruleId: "EXP-LDG-001", kind: "removed", after: null }]);
    expect(
      diffRules([rule], [outcomeChange]).map(({ ruleId, kind }) => ({ ruleId, kind })),
    ).toEqual([{ ruleId: "EXP-LDG-001", kind: "modified" }]);
  });

  it("is byte-for-byte deterministic and does not mutate inputs", () => {
    const recordsBefore = JSON.stringify(scenario.records);
    const baselineBefore = JSON.stringify(baseline);
    const candidateBefore = JSON.stringify(candidate);
    const first = computeImpact(baseline, candidate, scenario.records);
    const second = computeImpact(baseline, candidate, scenario.records);

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(JSON.stringify(scenario.records)).toBe(recordsBefore);
    expect(JSON.stringify(baseline)).toBe(baselineBefore);
    expect(JSON.stringify(candidate)).toBe(candidateBefore);
  });
});
