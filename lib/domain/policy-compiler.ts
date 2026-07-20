import { moneyToCents } from "./money";
import {
  canonicalizePredicates,
  getRegistryEntry,
  matchRegistryEntry,
  registrySourceQuote,
  validateCanonicalPredicate,
} from "./rule-registry";
import { policyAnalysisSchema, policySpecSchema } from "./schemas";
import type {
  Condition,
  ModelPredicate,
  PolicyAnalysis,
  PolicyRule,
  PolicySpec,
  PredicateCondition,
  RuleId,
} from "./types";

const REQUIRED_FIELDS_QUOTE =
  "Every expense must include an expense date, business purpose, department code, and project code.";
const DRAFT_LODGING_AMBIGUITY_QUOTE =
  "Unusually high lodging expenses require manager review.";

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

const EXPECTED_RULE_IDS: Readonly<Record<PolicyAnalysis["version"], readonly RuleId[]>> = {
  "draft-v1": [
    "EXP-REQ-001",
    "EXP-REQ-002",
    "EXP-REQ-003",
    "EXP-RCT-001",
    "EXP-WKD-001",
  ],
  "1.0.0": [
    "EXP-REQ-001",
    "EXP-REQ-002",
    "EXP-REQ-003",
    "EXP-RCT-001",
    "EXP-LDG-001",
    "EXP-WKD-001",
  ],
  "1.1.0": [
    "EXP-REQ-001",
    "EXP-REQ-002",
    "EXP-REQ-003",
    "EXP-RCT-001",
    "EXP-LDG-001",
    "EXP-WKD-001",
    "EXP-RID-001",
  ],
};

export function normalizePolicyText(value: string): string {
  const normalizedLines = value
    .replace(/\r\n?/g, "\n")
    .normalize("NFC")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""));
  while (normalizedLines.at(-1) === "") {
    normalizedLines.pop();
  }
  return `${normalizedLines.join("\n")}\n`;
}

function assertUniqueSourceQuote(policyText: string, sourceQuote: string): void {
  const quote = sourceQuote.normalize("NFC");
  if (quote.length === 0) {
    throw new Error("sourceQuote must not be empty");
  }
  const first = policyText.indexOf(quote);
  if (first < 0 || policyText.indexOf(quote, first + 1) >= 0) {
    throw new Error(`sourceQuote must occur exactly once: ${quote}`);
  }
}

function toCanonicalPredicate(predicate: ModelPredicate): PredicateCondition {
  if (predicate.field === "expense_date") {
    throw new Error("expense_date is an input requirement, not a Finding predicate");
  }

  let value: PredicateCondition["value"] = predicate.value;
  if (predicate.field === "amount_usd") {
    if (typeof predicate.value !== "string") {
      throw new Error("amount_usd predicates require a decimal USD string");
    }
    value = moneyToCents(predicate.value);
  }

  const canonical: PredicateCondition = {
    kind: "predicate",
    field: predicate.field,
    operator: predicate.operator,
    value,
  };
  validateCanonicalPredicate(canonical);
  return canonical;
}

function assertExactRuleSet(version: PolicyAnalysis["version"], rules: readonly PolicyRule[]): void {
  const actual = rules.map((rule) => rule.ruleId).sort();
  const expected = [...EXPECTED_RULE_IDS[version]].sort();
  if (actual.length !== expected.length || actual.some((id, index) => id !== expected[index])) {
    throw new Error(`Unexpected rule set for policy version ${version}`);
  }
}

function predicatesForRule(rule: PolicyRule): readonly PredicateCondition[] {
  return rule.condition.kind === "predicate"
    ? [rule.condition]
    : rule.condition.conditions;
}

function predicateValuesEqual(
  left: PredicateCondition,
  right: PredicateCondition,
): boolean {
  return (
    left.kind === right.kind &&
    left.field === right.field &&
    left.operator === right.operator &&
    typeof left.value === typeof right.value &&
    left.value === right.value
  );
}

function arraysEqual<T>(left: readonly T[], right: readonly T[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function assertCanonicalRule(policyText: string, rule: PolicyRule): void {
  const predicates = predicatesForRule(rule);
  for (const predicate of predicates) {
    validateCanonicalPredicate(predicate);
  }

  const registryEntry = getRegistryEntry(rule.ruleId);
  const structuralMatch = matchRegistryEntry(predicates);
  if (structuralMatch.ruleId !== rule.ruleId) {
    throw new Error(`Condition does not match registry rule ${rule.ruleId}`);
  }

  const canonicalPredicates = canonicalizePredicates(registryEntry, predicates);
  if (
    !arraysEqual(registryEntry.evidenceFields, rule.evidenceFields) ||
    rule.label !== registryEntry.label ||
    rule.outcome !== registryEntry.outcome ||
    rule.message !== registryEntry.message
  ) {
    throw new Error(`Rule metadata does not match registry rule ${rule.ruleId}`);
  }
  if (
    canonicalPredicates.length !== predicates.length ||
    canonicalPredicates.some(
      (predicate, index) =>
        predicates[index] === undefined ||
        !predicateValuesEqual(predicate, predicates[index]),
    )
  ) {
    throw new Error(`Predicates are not in canonical order for ${rule.ruleId}`);
  }

  assertUniqueSourceQuote(policyText, rule.sourceQuote);
  if (rule.sourceQuote !== registrySourceQuote(registryEntry, predicates)) {
    throw new Error(`sourceQuote does not match the registry sentence for ${rule.ruleId}`);
  }
}

function assertVariantContract(policyText: string, spec: PolicySpec): void {
  if (spec.inputRequirements.length !== 1) {
    throw new Error("Exactly one expense_date input requirement is required");
  }
  const inputRequirement = spec.inputRequirements[0];
  if (inputRequirement === undefined || inputRequirement.sourceQuote !== REQUIRED_FIELDS_QUOTE) {
    throw new Error("The expense_date input requirement must reference the full required-fields sentence");
  }
  assertUniqueSourceQuote(policyText, inputRequirement.sourceQuote);

  for (const ambiguity of spec.ambiguities) {
    assertUniqueSourceQuote(policyText, ambiguity.sourceQuote);
  }
  for (const statement of spec.unsupportedStatements) {
    assertUniqueSourceQuote(policyText, statement.sourceQuote);
  }
  if (spec.unsupportedStatements.length !== 0) {
    throw new Error(`Unsupported statements are not allowed for policy version ${spec.version}`);
  }

  if (spec.version === "draft-v1") {
    const ambiguity = spec.ambiguities[0];
    if (
      spec.ambiguities.length !== 1 ||
      ambiguity === undefined ||
      !ambiguity.blocking ||
      ambiguity.sourceQuote !== DRAFT_LODGING_AMBIGUITY_QUOTE
    ) {
      throw new Error("draft-v1 requires exactly one blocking canonical lodging ambiguity");
    }
    return;
  }

  if (spec.ambiguities.length !== 0) {
    throw new Error(`Ambiguities are not allowed for policy version ${spec.version}`);
  }
}

function copyCondition(condition: Condition): Condition {
  return condition.kind === "predicate"
    ? { ...condition }
    : {
        kind: "all",
        conditions: condition.conditions.map((predicate) => ({ ...predicate })),
      };
}

function copyPolicySpec(spec: PolicySpec): PolicySpec {
  return {
    policyId: spec.policyId,
    version: spec.version,
    rules: spec.rules.map((rule) => ({
      ruleId: rule.ruleId,
      label: rule.label,
      condition: copyCondition(rule.condition),
      outcome: rule.outcome,
      sourceQuote: rule.sourceQuote,
      message: rule.message,
      evidenceFields: [...rule.evidenceFields],
    })),
    ambiguities: spec.ambiguities.map((ambiguity) => ({ ...ambiguity })),
    inputRequirements: spec.inputRequirements.map((requirement) => ({ ...requirement })),
    unsupportedStatements: spec.unsupportedStatements.map((statement) => ({ ...statement })),
  };
}

function freezePolicySpec(spec: PolicySpec): PolicySpec {
  for (const rule of spec.rules) {
    if (rule.condition.kind === "all") {
      for (const predicate of rule.condition.conditions) {
        Object.freeze(predicate);
      }
      Object.freeze(rule.condition.conditions);
    }
    Object.freeze(rule.condition);
    Object.freeze(rule.evidenceFields);
    Object.freeze(rule);
  }
  for (const ambiguity of spec.ambiguities) {
    Object.freeze(ambiguity);
  }
  for (const requirement of spec.inputRequirements) {
    Object.freeze(requirement);
  }
  for (const statement of spec.unsupportedStatements) {
    Object.freeze(statement);
  }
  Object.freeze(spec.rules);
  Object.freeze(spec.ambiguities);
  Object.freeze(spec.inputRequirements);
  Object.freeze(spec.unsupportedStatements);
  return Object.freeze(spec);
}

export function validateCanonicalPolicySpec(
  policyTextInput: string,
  specInput: unknown,
): PolicySpec {
  const parsedSpec = policySpecSchema.parse(specInput);
  const policyText = normalizePolicyText(policyTextInput);

  for (let index = 0; index < parsedSpec.rules.length; index += 1) {
    const rule = parsedSpec.rules[index];
    if (rule === undefined) {
      throw new Error("Canonical rule unexpectedly missing");
    }
    const previousRule = parsedSpec.rules[index - 1];
    if (previousRule !== undefined && compareText(previousRule.ruleId, rule.ruleId) >= 0) {
      throw new Error("Policy rules must be unique and sorted by ruleId ascending");
    }
    assertCanonicalRule(policyText, rule);
  }

  assertExactRuleSet(parsedSpec.version, parsedSpec.rules);
  assertVariantContract(policyText, parsedSpec);
  return freezePolicySpec(copyPolicySpec(parsedSpec));
}

export function compilePolicyAnalysis(
  policyTextInput: string,
  analysisInput: unknown,
): PolicySpec {
  const analysis = policyAnalysisSchema.parse(analysisInput);
  const policyText = normalizePolicyText(policyTextInput);

  for (const ambiguity of analysis.ambiguities) {
    assertUniqueSourceQuote(policyText, ambiguity.sourceQuote);
    if (ambiguity.blocking && analysis.version !== "draft-v1") {
      throw new Error(`Blocking ambiguity: ${ambiguity.id}`);
    }
  }
  for (const statement of analysis.unsupportedStatements) {
    assertUniqueSourceQuote(policyText, statement.sourceQuote);
    if (statement.blocking) {
      throw new Error(`Blocking unsupported statement: ${statement.reason}`);
    }
  }

  if (analysis.inputRequirements.length !== 1) {
    throw new Error("Exactly one expense_date input requirement is required");
  }
  const inputRequirement = analysis.inputRequirements[0];
  if (inputRequirement === undefined || inputRequirement.sourceQuote !== REQUIRED_FIELDS_QUOTE) {
    throw new Error("The expense_date input requirement must reference the full required-fields sentence");
  }
  assertUniqueSourceQuote(policyText, inputRequirement.sourceQuote);

  const usedRuleIds = new Set<RuleId>();
  const compiledRules: PolicyRule[] = analysis.rules.map((analysisRule) => {
    assertUniqueSourceQuote(policyText, analysisRule.sourceQuote);
    const fields = analysisRule.predicates.map((predicate) => predicate.field);
    if (new Set(fields).size !== fields.length) {
      throw new Error("A rule cannot contain duplicate predicate fields");
    }

    const predicates = analysisRule.predicates.map(toCanonicalPredicate);
    const registryEntry = matchRegistryEntry(predicates);
    if (analysisRule.outcome !== registryEntry.outcome) {
      throw new Error(`Outcome mismatch for ${registryEntry.ruleId}`);
    }
    if (usedRuleIds.has(registryEntry.ruleId)) {
      throw new Error(`Duplicate structural rule: ${registryEntry.ruleId}`);
    }

    const canonicalPredicates = canonicalizePredicates(registryEntry, predicates);
    const expectedQuote = registrySourceQuote(registryEntry, canonicalPredicates);
    if (analysisRule.sourceQuote !== expectedQuote) {
      throw new Error(`sourceQuote does not match the registry sentence for ${registryEntry.ruleId}`);
    }

    usedRuleIds.add(registryEntry.ruleId);
    let condition: Condition;
    if (canonicalPredicates.length === 1) {
      const predicate = canonicalPredicates[0];
      if (predicate === undefined) {
        throw new Error("Canonical predicate is missing");
      }
      condition = predicate;
    } else {
      condition = { kind: "all", conditions: canonicalPredicates };
    }
    return {
      ruleId: registryEntry.ruleId,
      label: registryEntry.label,
      condition,
      outcome: registryEntry.outcome,
      sourceQuote: analysisRule.sourceQuote,
      message: registryEntry.message,
      evidenceFields: [...registryEntry.evidenceFields],
    };
  });

  compiledRules.sort((left, right) => compareText(left.ruleId, right.ruleId));

  return validateCanonicalPolicySpec(policyText, {
    policyId: analysis.policyId,
    version: analysis.version,
    rules: compiledRules,
    ambiguities: analysis.ambiguities.map((ambiguity) => ({ ...ambiguity })),
    inputRequirements: analysis.inputRequirements.map((requirement) => ({ ...requirement })),
    unsupportedStatements: analysis.unsupportedStatements.map((statement) => ({ ...statement })),
  });
}
