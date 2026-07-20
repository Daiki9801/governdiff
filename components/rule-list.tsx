import type { Condition, PolicyRule, PredicateCondition } from "../lib/domain/types";

interface RuleListProps {
  readonly rules: readonly PolicyRule[];
}

const OPERATOR_LABELS = {
  eq: "equals",
  gt: "is greater than",
  gte: "is at least",
  lt: "is less than",
  lte: "is at most",
  missing: "is missing",
} as const;

function fieldLabel(field: PredicateCondition["field"]): string {
  return field.replaceAll("_", " ");
}

function valueLabel(condition: PredicateCondition): string {
  if (condition.operator === "missing") {
    return "";
  }
  if (condition.field === "amount_usd" && typeof condition.value === "number") {
    return `USD ${(condition.value / 100).toFixed(2)}`;
  }
  if (typeof condition.value === "boolean") {
    return condition.value ? "yes" : "no";
  }
  return String(condition.value);
}

function predicateLabel(condition: PredicateCondition): string {
  return [
    fieldLabel(condition.field),
    OPERATOR_LABELS[condition.operator],
    valueLabel(condition),
  ]
    .filter(Boolean)
    .join(" ");
}

function conditionLabel(condition: Condition): string {
  return condition.kind === "predicate"
    ? predicateLabel(condition)
    : condition.conditions.map(predicateLabel).join(" AND ");
}

export function RuleList({ rules }: RuleListProps) {
  if (rules.length === 0) {
    return <p className="empty-state">No measurable rules were returned.</p>;
  }

  return (
    <ol className="rule-list">
      {rules.map((rule) => (
        <li key={rule.ruleId}>
          <div className="rule-title-row">
            <strong>{rule.label}</strong>
            <code>{rule.ruleId}</code>
          </div>
          <p>{rule.sourceQuote}</p>
          <dl className="rule-facts">
            <div>
              <dt>Condition</dt>
              <dd>{conditionLabel(rule.condition)}</dd>
            </div>
            <div>
              <dt>Outcome</dt>
              <dd>{rule.outcome.replaceAll("_", " ")}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
}
