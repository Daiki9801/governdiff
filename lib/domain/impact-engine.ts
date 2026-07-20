import { evaluatePolicy } from "./policy-runtime";
import type {
  Condition,
  ExpenseRecord,
  Finding,
  ImpactPreview,
  PolicyRule,
  PolicySpec,
  PredicateCondition,
  RuleDiffEntry,
  RuleId,
} from "./types";

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function valueProjection(value: PredicateCondition["value"]): string {
  if (value === null) {
    return "null";
  }
  return `${typeof value}:${String(value)}`;
}

function conditionProjection(condition: Condition): string {
  const predicates = condition.kind === "predicate" ? [condition] : condition.conditions;
  const predicateProjection = predicates
    .map((predicate) =>
      [predicate.field, predicate.operator, valueProjection(predicate.value)].join(":"),
    )
    .join("|");
  return `${condition.kind}\n${predicateProjection}`;
}

function ruleProjection(rule: PolicyRule): string {
  return [rule.ruleId, rule.outcome, conditionProjection(rule.condition)].join("\n");
}

function ruleMap(rules: readonly PolicyRule[]): Map<RuleId, PolicyRule> {
  const result = new Map<RuleId, PolicyRule>();
  for (const rule of rules) {
    if (result.has(rule.ruleId)) {
      throw new Error(`Duplicate rule ID in diff input: ${rule.ruleId}`);
    }
    result.set(rule.ruleId, rule);
  }
  return result;
}

export function diffRules(
  baseline: readonly PolicyRule[],
  candidate: readonly PolicyRule[],
): readonly RuleDiffEntry[] {
  const baselineById = ruleMap(baseline);
  const candidateById = ruleMap(candidate);
  const ids = [...new Set([...baselineById.keys(), ...candidateById.keys()])].sort(compareText);
  const result: RuleDiffEntry[] = [];

  for (const ruleId of ids) {
    const before = baselineById.get(ruleId) ?? null;
    const after = candidateById.get(ruleId) ?? null;
    if (before === null) {
      result.push({ ruleId, kind: "added", before, after });
      continue;
    }
    if (after === null) {
      result.push({ ruleId, kind: "removed", before, after });
      continue;
    }
    if (ruleProjection(before) !== ruleProjection(after)) {
      result.push({ ruleId, kind: "modified", before, after });
    }
  }

  return result;
}

function findingMap(findings: readonly Finding[]): Map<string, Finding> {
  const result = new Map<string, Finding>();
  for (const finding of findings) {
    if (result.has(finding.findingKey)) {
      throw new Error(`Duplicate Finding key in impact input: ${finding.findingKey}`);
    }
    result.set(finding.findingKey, finding);
  }
  return result;
}

export function computeImpact(
  baselineSpec: PolicySpec,
  candidateSpec: PolicySpec,
  records: readonly ExpenseRecord[],
): ImpactPreview {
  const baselineFindings = evaluatePolicy(baselineSpec, records);
  const candidateFindings = evaluatePolicy(candidateSpec, records);
  const baselineByKey = findingMap(baselineFindings);
  const candidateByKey = findingMap(candidateFindings);
  const removed: Finding[] = [];
  const added: Finding[] = [];
  const unchanged: Finding[] = [];

  for (const [key, finding] of baselineByKey) {
    if (!candidateByKey.has(key)) {
      removed.push(finding);
    }
  }
  for (const [key, finding] of candidateByKey) {
    if (baselineByKey.has(key)) {
      unchanged.push(finding);
    } else {
      added.push(finding);
    }
  }

  const byFindingKey = (left: Finding, right: Finding): number =>
    compareText(left.findingKey, right.findingKey);
  removed.sort(byFindingKey);
  added.sort(byFindingKey);
  unchanged.sort(byFindingKey);

  if (
    baselineFindings.length !== removed.length + unchanged.length ||
    candidateFindings.length !== added.length + unchanged.length
  ) {
    throw new Error("Impact classification invariant failed");
  }

  return {
    baselineCount: baselineFindings.length,
    candidateCount: candidateFindings.length,
    removed,
    added,
    unchanged,
    ruleDiff: diffRules(baselineSpec.rules, candidateSpec.rules),
  };
}
