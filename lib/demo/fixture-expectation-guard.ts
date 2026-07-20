import { computeImpact } from "../domain/impact-engine";
import { evaluatePolicy } from "../domain/policy-runtime";
import type { FixtureExpectations } from "../domain/schemas";
import type { ExpenseRecord, PolicySpec } from "../domain/types";
import { createAppError } from "../errors/app-error";

export interface FixtureExpectationResult {
  readonly baselineCount: number;
  readonly candidateCount: number;
  readonly removedCount: number;
  readonly addedCount: number;
  readonly unchangedCount: number;
}

export interface FixtureExpectationInput {
  readonly baselineSpec: PolicySpec;
  readonly candidateSpec: PolicySpec;
  readonly records: readonly ExpenseRecord[];
  readonly expectations: FixtureExpectations;
}

function sorted(values: readonly string[]): readonly string[] {
  return [...values].sort();
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  const a = sorted(left);
  const b = sorted(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function fail(detail: string): never {
  throw createAppError(
    "FIXTURE_EXPECTATION_FAILED",
    "Fixture verification failed.",
    false,
    detail,
  );
}

export function verifyFixtureExpectations({
  baselineSpec,
  candidateSpec,
  records,
  expectations,
}: FixtureExpectationInput): FixtureExpectationResult {
  let baselineFindings;
  let candidateFindings;
  let impact;
  try {
    baselineFindings = evaluatePolicy(baselineSpec, records);
    candidateFindings = evaluatePolicy(candidateSpec, records);
    impact = computeImpact(baselineSpec, candidateSpec, records);
  } catch {
    fail("FIXTURE_RUNTIME_FAILED");
  }

  const expected = expectations.impact_preview;
  if (
    baselineFindings.length !== expectations.baseline_release.finding_count ||
    candidateFindings.length !== expectations.candidate_release.finding_count ||
    impact.removed.length !== expected.removed_count ||
    impact.added.length !== expected.added_count ||
    impact.unchanged.length !== expected.unchanged_count
  ) {
    fail("FIXTURE_TOTALS_MISMATCH");
  }

  if (
    !sameStrings(
      baselineFindings.map((finding) => finding.findingKey),
      expectations.baseline_release.findings.map((finding) => finding.finding_key),
    ) ||
    !sameStrings(
      candidateFindings.map((finding) => finding.findingKey),
      expectations.candidate_release.findings.map((finding) => finding.finding_key),
    ) ||
    !sameStrings(
      impact.removed.map((finding) => finding.findingKey),
      expected.removed_finding_keys,
    ) ||
    !sameStrings(
      impact.added.map((finding) => finding.findingKey),
      expected.added_finding_keys,
    ) ||
    !sameStrings(
      impact.unchanged.map((finding) => finding.findingKey),
      expected.unchanged_finding_keys,
    )
  ) {
    fail("FIXTURE_KEYS_MISMATCH");
  }

  if (
    impact.ruleDiff.length !== 2 ||
    impact.ruleDiff[0]?.ruleId !== "EXP-RCT-001" ||
    impact.ruleDiff[0]?.kind !== "modified" ||
    impact.ruleDiff[1]?.ruleId !== "EXP-RID-001" ||
    impact.ruleDiff[1]?.kind !== "added"
  ) {
    fail("FIXTURE_RULE_DIFF_MISMATCH");
  }

  return Object.freeze({
    baselineCount: baselineFindings.length,
    candidateCount: candidateFindings.length,
    removedCount: impact.removed.length,
    addedCount: impact.added.length,
    unchangedCount: impact.unchanged.length,
  });
}
