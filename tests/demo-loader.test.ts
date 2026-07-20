import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { deriveWeekend, parseIsoDate } from "../lib/domain/dates";
import {
  loadDemoScenario,
  normalizeExpenseRows,
} from "../lib/demo/fixture-loader.server";
import type { RawExpenseRecord } from "../lib/domain/types";

const VALID_ROW: RawExpenseRecord = {
  expense_id: "TEST-EXP-001",
  report_id: "TEST-RPT-001",
  employee_id: "TEST-EMP-001",
  expense_date: "2026-07-18",
  department_code: "FIN",
  project_code: "PRJ-001",
  category: "meal",
  amount_usd: "25.00",
  receipt_attached: "true",
  business_purpose: "Team meal",
  business_justification: "Approved meeting",
  manager_preapproved: "false",
  employee_email: "tester@example.invalid",
};

describe("fixed demo scenario loader", () => {
  it("uses only the renamed server loader path", () => {
    expect(existsSync(join(process.cwd(), "lib", "demo", "load-demo-scenario.ts"))).toBe(false);
    expect(existsSync(join(process.cwd(), "lib", "demo", "fixture-loader.server.ts"))).toBe(true);
  });

  it("loads and verifies the canonical 48-row dataset", () => {
    const scenario = loadDemoScenario(process.cwd(), false);

    expect(scenario.datasetSha256).toBe(
      "452acc27170249d64d26722dfb48158f8231987dd48bac9331e00dbcd210da8a",
    );
    expect(scenario.records).toHaveLength(48);
    expect(new Set(scenario.records.map((record) => record.expenseId)).size).toBe(48);
    expect(scenario.records.every((record) => record.employeeEmail.endsWith("@example.invalid"))).toBe(
      true,
    );
    expect(scenario.expectations.baseline_release.finding_count).toBe(18);
    expect(scenario.expectations.candidate_release.finding_count).toBe(16);
    expect(scenario.initialDraftText).toBe(scenario.policyDraftV1);
    expect(scenario.liveModeAvailable).toBe(false);
    expect(Object.isFrozen(scenario)).toBe(true);
    expect(Object.isFrozen(scenario.records)).toBe(true);
    expect(Object.isFrozen(scenario.records[0]?.rawEvidence)).toBe(true);
    expect(Object.isFrozen(scenario.expectations)).toBe(true);
    expect(Object.isFrozen(scenario.expectations.impact_preview)).toBe(true);
    expect(Object.keys(scenario.sampleAnalyses)).toEqual([
      "draft-v1",
      "resolved-v1",
      "candidate-v2",
    ]);
    expect(
      Object.values(scenario.sampleAnalyses).every(
        (asset) =>
          asset.provenance.capturedFrom === "gpt-5.4" &&
          Object.isFrozen(asset) &&
          Object.isFrozen(asset.analysis),
      ),
    ).toBe(true);
  });

  it("uses only an explicitly supplied Live capability", () => {
    expect(loadDemoScenario(process.cwd(), false).liveModeAvailable).toBe(false);
    expect(loadDemoScenario(process.cwd(), true).liveModeAvailable).toBe(true);
  });

  it("copies and deeply freezes parsed Sample assets without exposing request IDs", () => {
    const scenario = loadDemoScenario(process.cwd(), false);
    for (const asset of Object.values(scenario.sampleAnalyses)) {
      expect(typeof asset.provenance.requestId).toBe("string");
      expect(Object.isFrozen(asset.provenance)).toBe(true);
      expect(Object.isFrozen(asset.analysis.rules)).toBe(true);
      expect(asset.analysis.rules.every(Object.isFrozen)).toBe(true);
      expect(
        asset.analysis.rules.every(
          (rule) =>
            Object.isFrozen(rule.condition) &&
            (rule.condition.kind === "predicate" ||
              (Object.isFrozen(rule.condition.conditions) &&
                rule.condition.conditions.every(Object.isFrozen))),
        ),
      ).toBe(true);
    }
  });

  it("derives weekends with strict UTC calendar semantics", () => {
    expect(deriveWeekend("2026-05-17")).toBe(true);
    expect(deriveWeekend("2026-05-18")).toBe(false);
    expect(() => parseIsoDate("2026-02-31")).toThrow(/calendar/);
    expect(() => parseIsoDate("05/17/2026")).toThrow(/ISO date/);
  });

  it("normalizes blank and whitespace-only business values while retaining raw evidence", () => {
    const scenario = loadDemoScenario(process.cwd());
    const blank = scenario.records.find(
      (record) => record.businessPurpose === null && record.rawEvidence.businessPurpose === "",
    );
    const whitespace = scenario.records.find(
      (record) =>
        record.businessPurpose === null && record.rawEvidence.businessPurpose.length > 0,
    );

    expect(blank).toBeDefined();
    expect(whitespace?.rawEvidence.businessPurpose).toBe("   ");
  });

  it.each([
    ["invalid boolean", { receipt_attached: "TRUE" }],
    ["invalid date", { expense_date: "2026-02-31" }],
    ["date with surrounding whitespace", { expense_date: " 2026-07-18" }],
    ["invalid category", { category: "airfare" }],
    ["invalid email domain", { employee_email: "tester@example.com" }],
    ["malformed synthetic email", { employee_email: "tester@@example.invalid" }],
  ])("rejects %s", (_label, replacement) => {
    expect(() => normalizeExpenseRows([{ ...VALID_ROW, ...replacement }])).toThrow();
  });

  it("rejects duplicate expense IDs", () => {
    expect(() =>
      normalizeExpenseRows([
        VALID_ROW,
        { ...VALID_ROW, report_id: "TEST-RPT-002" },
      ]),
    ).toThrow(/Duplicate expense_id/);
  });

  it("does not mutate raw input rows", () => {
    const original = { ...VALID_ROW, business_purpose: "   " };
    const snapshot = { ...original };
    normalizeExpenseRows([original]);
    expect(original).toEqual(snapshot);
  });
});
