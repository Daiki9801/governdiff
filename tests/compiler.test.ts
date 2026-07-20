import { describe, expect, it } from "vitest";

import { loadDemoScenario } from "../lib/demo/fixture-loader.server";
import {
  compilePolicyAnalysis,
  validateCanonicalPolicySpec,
} from "../lib/domain/policy-compiler";
import { policyAnalysisSchema } from "../lib/domain/schemas";
import type {
  AnalysisRule,
  PolicyAnalysis,
  PolicyVersion,
} from "../lib/domain/types";

const REQUIRED_QUOTE =
  "Every expense must include an expense date, business purpose, department code, and project code.";
const LODGING_QUOTE = "Lodging expenses above USD 275.00 require manager review.";
const WEEKEND_QUOTE =
  "Expenses incurred on a Saturday or Sunday require a written business justification.";
const DRAFT_LODGING_QUOTE =
  "Unusually high lodging expenses require manager review.";
const scenario = loadDemoScenario(process.cwd());

function missingRule(field: "business_purpose" | "department_code" | "project_code"): AnalysisRule {
  return {
    outcome: "clarification",
    sourceQuote: REQUIRED_QUOTE,
    predicates: [{ field, operator: "missing", value: null }],
  };
}

function makeAnalysis(version: Extract<PolicyVersion, "1.0.0" | "1.1.0">): PolicyAnalysis {
  const receiptThreshold = version === "1.0.0" ? "100.00" : "150.00";
  const rules: AnalysisRule[] = [
    missingRule("business_purpose"),
    missingRule("department_code"),
    missingRule("project_code"),
    {
      outcome: "clarification",
      sourceQuote: `Expenses of USD ${receiptThreshold} or more must include a receipt.`,
      predicates: [
        { field: "amount_usd", operator: "gte", value: receiptThreshold },
        { field: "receipt_attached", operator: "eq", value: false },
      ],
    },
    {
      outcome: "manager_review",
      sourceQuote: LODGING_QUOTE,
      predicates: [
        { field: "category", operator: "eq", value: "lodging" },
        { field: "amount_usd", operator: "gt", value: "275.00" },
      ],
    },
    {
      outcome: "clarification",
      sourceQuote: WEEKEND_QUOTE,
      predicates: [
        { field: "is_weekend", operator: "eq", value: true },
        { field: "business_justification", operator: "missing", value: null },
      ],
    },
  ];

  if (version === "1.1.0") {
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

function makeDraftAnalysis(): PolicyAnalysis {
  const baseline = makeAnalysis("1.0.0");

  return {
    ...baseline,
    version: "draft-v1",
    rules: baseline.rules.filter((rule) => rule.sourceQuote !== LODGING_QUOTE),
    ambiguities: [
      {
        id: "AMB-LDG-001",
        sourceQuote: DRAFT_LODGING_QUOTE,
        question: "What numeric lodging threshold requires manager review?",
        blocking: true,
      },
    ],
  };
}

function makeDraftPolicy(): string {
  return scenario.policyV1.replace(LODGING_QUOTE, DRAFT_LODGING_QUOTE);
}

describe("policy compiler", () => {
  it("compiles the exact ambiguous draft while withholding the lodging rule", () => {
    const spec = compilePolicyAnalysis(makeDraftPolicy(), makeDraftAnalysis());

    expect(spec.version).toBe("draft-v1");
    expect(spec.rules.map((rule) => rule.ruleId)).toEqual([
      "EXP-RCT-001",
      "EXP-REQ-001",
      "EXP-REQ-002",
      "EXP-REQ-003",
      "EXP-WKD-001",
    ]);
    expect(spec.ambiguities).toEqual([
      {
        id: "AMB-LDG-001",
        sourceQuote: DRAFT_LODGING_QUOTE,
        question: "What numeric lodging threshold requires manager review?",
        blocking: true,
      },
    ]);
    expect(spec.unsupportedStatements).toEqual([]);
  });

  it("rejects a numeric lodging rule in the ambiguous draft", () => {
    const analysis = makeDraftAnalysis();
    const lodging = makeAnalysis("1.0.0").rules.find(
      (rule) => rule.sourceQuote === LODGING_QUOTE,
    );
    if (lodging === undefined) {
      throw new Error("Lodging analysis rule missing from test fixture");
    }

    expect(() =>
      compilePolicyAnalysis(`${makeDraftPolicy()}\n${LODGING_QUOTE}\n`, {
        ...analysis,
        rules: [...analysis.rules, lodging],
      }),
    ).toThrow(/rule set|draft-v1/);
  });

  it("rejects extra, missing, and structurally wrong draft rules", () => {
    const analysis = makeDraftAnalysis();
    const candidate = makeAnalysis("1.1.0");
    const rideshare = candidate.rules.find((rule) =>
      rule.sourceQuote.startsWith("Rideshare expenses"),
    );
    if (rideshare === undefined) {
      throw new Error("Rideshare analysis rule missing from test fixture");
    }

    expect(() =>
      compilePolicyAnalysis(makeDraftPolicy(), {
        ...analysis,
        rules: analysis.rules.slice(0, -1),
      }),
    ).toThrow(/rule set/);
    expect(() =>
      compilePolicyAnalysis(`${makeDraftPolicy()}\n${rideshare.sourceQuote}\n`, {
        ...analysis,
        rules: [...analysis.rules, rideshare],
      }),
    ).toThrow(/rule set/);

    const canonical = compilePolicyAnalysis(makeDraftPolicy(), analysis);
    const wrongRuleId = {
      ...structuredClone(canonical),
      rules: canonical.rules.map((rule, index) =>
        index === 0 ? { ...structuredClone(rule), ruleId: "EXP-LDG-001" as const } : structuredClone(rule),
      ),
    };
    expect(() => validateCanonicalPolicySpec(makeDraftPolicy(), wrongRuleId)).toThrow();
  });

  it("rejects unsupported statements in the ambiguous draft", () => {
    expect(() =>
      compilePolicyAnalysis(makeDraftPolicy(), {
        ...makeDraftAnalysis(),
        unsupportedStatements: [
          {
            sourceQuote: DRAFT_LODGING_QUOTE,
            reason: "Threshold is not numeric.",
            blocking: false,
          },
        ],
      }),
    ).toThrow(/Unsupported statements/);
  });

  it.each([
    ["missing", []],
    [
      "duplicated",
      [makeDraftAnalysis().ambiguities[0], makeDraftAnalysis().ambiguities[0]],
    ],
    [
      "wrong",
      [
        {
          ...makeDraftAnalysis().ambiguities[0],
          sourceQuote: "Lodging expenses require manager review.",
        },
      ],
    ],
    [
      "partial",
      [
        {
          ...makeDraftAnalysis().ambiguities[0],
          sourceQuote: "an unusually high amount",
        },
      ],
    ],
    [
      "paraphrased",
      [
        {
          ...makeDraftAnalysis().ambiguities[0],
          sourceQuote:
            "An unusually high lodging expense may require manager review.",
        },
      ],
    ],
  ] as const)("rejects a %s draft ambiguity contract", (_label, ambiguities) => {
    expect(() =>
      compilePolicyAnalysis(makeDraftPolicy(), {
        ...makeDraftAnalysis(),
        ambiguities: [...ambiguities],
      }),
    ).toThrow();
  });

  it.each([
    ["1.0.0", scenario.policyV1],
    ["1.1.0", scenario.policyV2],
  ] as const)("keeps %s ambiguity and unsupported statements out of readiness", (version, policyText) => {
    const analysis = makeAnalysis(version);

    expect(() =>
      compilePolicyAnalysis(policyText, {
        ...analysis,
        ambiguities: [
          {
            id: "AMB-LDG-001",
            sourceQuote: LODGING_QUOTE,
            question: "What threshold applies?",
            blocking: false,
          },
        ],
      }),
    ).toThrow(/Ambiguities/);
    expect(() =>
      compilePolicyAnalysis(policyText, {
        ...analysis,
        unsupportedStatements: [
          {
            sourceQuote: LODGING_QUOTE,
            reason: "Unsupported action",
            blocking: false,
          },
        ],
      }),
    ).toThrow(/Unsupported statements/);
  });

  it("accepts compiler output in the shared canonical validator and rejects raw analysis", () => {
    const compiled = compilePolicyAnalysis(scenario.policyV1, makeAnalysis("1.0.0"));
    const validated = validateCanonicalPolicySpec(scenario.policyV1, compiled);

    expect(validated).toEqual(compiled);
    expect(validated).not.toBe(compiled);
    expect(() =>
      validateCanonicalPolicySpec(scenario.policyV1, makeAnalysis("1.0.0")),
    ).toThrow();
  });

  it("strictly validates canonical metadata, ordering, and unknown keys", () => {
    const compiled = compilePolicyAnalysis(scenario.policyV1, makeAnalysis("1.0.0"));
    const first = compiled.rules[0];
    if (first === undefined) {
      throw new Error("Canonical compiled rule missing from test fixture");
    }

    expect(() =>
      validateCanonicalPolicySpec(scenario.policyV1, {
        ...structuredClone(compiled),
        unexpected: true,
      }),
    ).toThrow();
    expect(() =>
      validateCanonicalPolicySpec(scenario.policyV1, {
        ...structuredClone(compiled),
        rules: [...structuredClone(compiled.rules)].reverse(),
      }),
    ).toThrow(/sorted/);
    expect(() =>
      validateCanonicalPolicySpec(scenario.policyV1, {
        ...structuredClone(compiled),
        rules: compiled.rules.map((rule, index) =>
          index === 0 ? { ...structuredClone(rule), label: `${first.label}!` } : structuredClone(rule),
        ),
      }),
    ).toThrow(/metadata/);
  });

  it("copies and deeply freezes canonical input without mutating caller data", () => {
    const compiled = compilePolicyAnalysis(makeDraftPolicy(), makeDraftAnalysis());
    const mutableInput = structuredClone(compiled);
    const snapshot = structuredClone(mutableInput);
    const validated = validateCanonicalPolicySpec(makeDraftPolicy(), mutableInput);
    const firstRule = validated.rules[0];

    expect(validated).toEqual(snapshot);
    expect(validated).not.toBe(mutableInput);
    expect(validated.rules).not.toBe(mutableInput.rules);
    expect(validated.ambiguities).not.toBe(mutableInput.ambiguities);
    expect(Object.isFrozen(validated)).toBe(true);
    expect(Object.isFrozen(validated.rules)).toBe(true);
    expect(Object.isFrozen(firstRule)).toBe(true);
    expect(Object.isFrozen(firstRule?.condition)).toBe(true);
    expect(Object.isFrozen(validated.ambiguities[0])).toBe(true);
    expect(Object.isFrozen(mutableInput)).toBe(false);
    expect(mutableInput).toEqual(snapshot);
  });

  it("compiles the baseline and candidate to the exact stable rule sets", () => {
    const baseline = compilePolicyAnalysis(scenario.policyV1, makeAnalysis("1.0.0"));
    const candidate = compilePolicyAnalysis(scenario.policyV2, makeAnalysis("1.1.0"));

    expect(baseline.rules).toHaveLength(6);
    expect(candidate.rules).toHaveLength(7);
    expect(baseline.rules.map((rule) => rule.ruleId)).toEqual([
      "EXP-LDG-001",
      "EXP-RCT-001",
      "EXP-REQ-001",
      "EXP-REQ-002",
      "EXP-REQ-003",
      "EXP-WKD-001",
    ]);
    expect(candidate.rules.map((rule) => rule.ruleId)).toEqual([
      "EXP-LDG-001",
      "EXP-RCT-001",
      "EXP-REQ-001",
      "EXP-REQ-002",
      "EXP-REQ-003",
      "EXP-RID-001",
      "EXP-WKD-001",
    ]);
    expect(baseline.rules.find((rule) => rule.ruleId === "EXP-RCT-001")?.ruleId).toBe(
      candidate.rules.find((rule) => rule.ruleId === "EXP-RCT-001")?.ruleId,
    );
    expect(baseline.rules.some((rule) => rule.ruleId.includes("DATE"))).toBe(false);
  });

  it("canonicalizes predicate order without changing stable identity", () => {
    const analysis = makeAnalysis("1.0.0");
    const receipt = analysis.rules[3];
    if (receipt === undefined) {
      throw new Error("Receipt analysis rule missing from test fixture");
    }
    const reordered: PolicyAnalysis = {
      ...analysis,
      rules: analysis.rules.map((rule, index) =>
        index === 3 ? { ...receipt, predicates: [...receipt.predicates].reverse() } : rule,
      ),
    };
    const spec = compilePolicyAnalysis(scenario.policyV1, reordered);
    const compiledReceipt = spec.rules.find((rule) => rule.ruleId === "EXP-RCT-001");

    expect(compiledReceipt?.condition).toEqual({
      kind: "all",
      conditions: [
        { kind: "predicate", field: "amount_usd", operator: "gte", value: 10000 },
        { kind: "predicate", field: "receipt_attached", operator: "eq", value: false },
      ],
    });
  });

  it("deep-freezes the canonical policy spec without freezing model input", () => {
    const analysis = makeAnalysis("1.0.0");
    const spec = compilePolicyAnalysis(scenario.policyV1, analysis);
    const receipt = spec.rules.find((rule) => rule.ruleId === "EXP-RCT-001");

    expect(Object.isFrozen(spec)).toBe(true);
    expect(Object.isFrozen(spec.rules)).toBe(true);
    expect(Object.isFrozen(receipt)).toBe(true);
    expect(Object.isFrozen(receipt?.condition)).toBe(true);
    expect(
      receipt?.condition.kind === "all" && Object.isFrozen(receipt.condition.conditions),
    ).toBe(true);
    expect(Object.isFrozen(analysis)).toBe(false);
    expect(Object.isFrozen(analysis.rules)).toBe(false);
  });

  it("rejects a missing or duplicated source quote", () => {
    const analysis = makeAnalysis("1.0.0");
    const first = analysis.rules[0];
    if (first === undefined) {
      throw new Error("Required analysis rule missing from test fixture");
    }
    expect(() =>
      compilePolicyAnalysis(scenario.policyV1, {
        ...analysis,
        rules: [{ ...first, sourceQuote: "Not in the policy." }, ...analysis.rules.slice(1)],
      }),
    ).toThrow(/exactly once/);
    expect(() =>
      compilePolicyAnalysis(`${scenario.policyV1}\n${REQUIRED_QUOTE}\n`, analysis),
    ).toThrow(/exactly once/);
  });

  it("counts overlapping source quote occurrences as duplicates", () => {
    const analysis = makeAnalysis("1.0.0");
    const first = analysis.rules[0];
    if (first === undefined) {
      throw new Error("Required analysis rule missing from test fixture");
    }
    const overlappingPolicy = `${REQUIRED_QUOTE}\naaaa\n`;
    expect(() =>
      compilePolicyAnalysis(overlappingPolicy, {
        ...analysis,
        rules: [{ ...first, sourceQuote: "aaa" }, ...analysis.rules.slice(1)],
      }),
    ).toThrow(/exactly once/);
  });

  it("rejects blocking ambiguity and unsupported statements", () => {
    const analysis = makeAnalysis("1.0.0");
    expect(() =>
      compilePolicyAnalysis(scenario.policyV1, {
        ...analysis,
        ambiguities: [
          {
            id: "AMB-001",
            sourceQuote: LODGING_QUOTE,
            question: "What threshold applies?",
            blocking: true,
          },
        ],
      }),
    ).toThrow(/Blocking ambiguity/);
    expect(() =>
      compilePolicyAnalysis(scenario.policyV1, {
        ...analysis,
        unsupportedStatements: [
          {
            sourceQuote: LODGING_QUOTE,
            reason: "Unsupported action",
            blocking: true,
          },
        ],
      }),
    ).toThrow(/Blocking unsupported/);
  });

  it("requires the expense_date input contract without emitting a Finding rule", () => {
    const analysis = makeAnalysis("1.0.0");
    expect(() =>
      compilePolicyAnalysis(scenario.policyV1, { ...analysis, inputRequirements: [] }),
    ).toThrow(/expense_date/);
    const spec = compilePolicyAnalysis(scenario.policyV1, analysis);
    expect(spec.inputRequirements).toEqual(analysis.inputRequirements);
    expect(spec.rules).toHaveLength(6);
  });

  it("rejects threshold/source mismatch, duplicate fields, and outcome mismatch", () => {
    const analysis = makeAnalysis("1.0.0");
    const receipt = analysis.rules[3];
    const lodging = analysis.rules[4];
    if (receipt === undefined || lodging === undefined) {
      throw new Error("Canonical analysis rules missing from test fixture");
    }
    expect(() =>
      compilePolicyAnalysis(scenario.policyV1, {
        ...analysis,
        rules: analysis.rules.map((rule, index) =>
          index === 3
            ? {
                ...receipt,
                predicates: [
                  { field: "amount_usd", operator: "gte", value: "125.00" },
                  { field: "receipt_attached", operator: "eq", value: false },
                ],
              }
            : rule,
        ),
      }),
    ).toThrow(/registry sentence/);
    expect(() =>
      compilePolicyAnalysis(scenario.policyV1, {
        ...analysis,
        rules: analysis.rules.map((rule, index) =>
          index === 4
            ? {
                ...lodging,
                predicates: [
                  { field: "category", operator: "eq", value: "lodging" },
                  { field: "category", operator: "eq", value: "lodging" },
                ],
              }
            : rule,
        ),
      }),
    ).toThrow(/duplicate predicate fields/);
    expect(() =>
      compilePolicyAnalysis(scenario.policyV1, {
        ...analysis,
        rules: analysis.rules.map((rule, index) =>
          index === 4 ? { ...lodging, outcome: "clarification" } : rule,
        ),
      }),
    ).toThrow(/Outcome mismatch/);
  });

  it("keeps model-authored labels and messages outside the strict analysis contract", () => {
    const analysis = makeAnalysis("1.0.0");
    const first = analysis.rules[0];
    if (first === undefined) {
      throw new Error("Required analysis rule missing from test fixture");
    }
    const result = policyAnalysisSchema.safeParse({
      ...analysis,
      rules: [{ ...first, message: "Model-authored message" }, ...analysis.rules.slice(1)],
    });
    expect(result.success).toBe(false);

    const spec = compilePolicyAnalysis(scenario.policyV1, analysis);
    const businessPurposeRule = spec.rules.find((rule) => rule.ruleId === "EXP-REQ-001");
    expect(businessPurposeRule?.message).toBe("Business purpose is required.");
    expect(businessPurposeRule?.label).toBe("Business purpose required");
  });
});
