import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { normalizePolicyText } from "../../lib/domain/policy-compiler";
import {
  QUICK_ACTIONS,
  applyQuickAction,
  createCandidateV2,
  resolveLodgingThreshold,
} from "../../lib/demo/quick-actions";

function policy(name: string): string {
  return normalizePolicyText(
    readFileSync(join(process.cwd(), "demo", name), "utf8"),
  );
}

describe("atomic policy quick actions", () => {
  it("exports the exact two-action set", () => {
    expect(QUICK_ACTIONS).toEqual([
      "resolve-lodging-threshold",
      "create-candidate-v2",
    ]);
    expect(Object.isFrozen(QUICK_ACTIONS)).toBe(true);
  });

  it("resolves the unique lodging ambiguity to exact canonical v1", async () => {
    const draft = policy("policy-draft-v1.md");
    const result = await resolveLodgingThreshold(draft);
    expect(result).toEqual({ ok: true, text: policy("policy-v1.md") });
    expect(Object.isFrozen(result)).toBe(true);
    expect(draft).toContain("Unusually high lodging expenses");
  });

  it("creates exact candidate v2 only from canonical published v1", async () => {
    const publishedV1 = policy("policy-v1.md");
    const result = await applyQuickAction("create-candidate-v2", publishedV1);
    expect(result).toEqual({ ok: true, text: policy("policy-v2.md") });
  });

  it("rejects missing, duplicate, edited, or pre-existing anchors atomically", async () => {
    const draft = policy("policy-draft-v1.md");
    const publishedV1 = policy("policy-v1.md");
    const failures = await Promise.all([
      resolveLodgingThreshold(draft.replace("Unusually high", "High")),
      resolveLodgingThreshold(`${draft}Unusually high lodging expenses require manager review.\n`),
      createCandidateV2(publishedV1.replace("USD 100.00", "USD 101.00")),
      createCandidateV2(policy("policy-v2.md")),
    ]);

    expect(failures.every((result) => !result.ok)).toBe(true);
    expect(failures[0]?.text).toBe(draft.replace("Unusually high", "High"));
    expect(failures.every(Object.isFrozen)).toBe(true);
  });
});
