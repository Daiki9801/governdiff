import { normalizePolicyText } from "../domain/policy-compiler";
import { createAppError, type AppError } from "../errors/app-error";
import {
  SAMPLE_VARIANT_DEFINITIONS,
  normalizedPolicySha256,
} from "./fixture-contract";

export const QUICK_ACTIONS = Object.freeze([
  "resolve-lodging-threshold",
  "create-candidate-v2",
] as const);

export type QuickAction = (typeof QUICK_ACTIONS)[number];
export type QuickActionResult =
  | Readonly<{ ok: true; text: string }>
  | Readonly<{ ok: false; text: string; error: AppError }>;

const DRAFT_LODGING = "Unusually high lodging expenses require manager review.";
const RESOLVED_LODGING =
  "Lodging expenses above USD 275.00 require manager review.";
const DISPLAY_V1 = "**Display version:** v1";
const DISPLAY_V2 = "**Display version:** v2 candidate";
const RELEASE_V1 = "**Release version:** 1.0.0";
const RELEASE_V2 = "**Release version:** 1.1.0";
const EFFECTIVE_V1 = "**Effective from:** 2026-07-01";
const EFFECTIVE_V2 = "**Proposed effective from:** 2026-08-01";
const RECEIPT_V1 = "Expenses of USD 100.00 or more must include a receipt.";
const RECEIPT_V2 = "Expenses of USD 150.00 or more must include a receipt.";
const WEEKEND =
  "Expenses incurred on a Saturday or Sunday require a written business justification.";
const RIDESHARE =
  "Rideshare expenses above USD 120.00 require manager review unless a manager preapproved the expense.";

function occurrences(text: string, value: string): number {
  return text.split(value).length - 1;
}

function failure(text: string, detail: string): QuickActionResult {
  return Object.freeze({
    ok: false,
    text,
    error: createAppError(
      "QUICK_ACTION_SOURCE_MISMATCH",
      "The built-in policy text no longer matches this quick action.",
      false,
      detail,
    ),
  });
}

async function hashMatches(
  text: string,
  expected: string,
  cryptoProvider?: Pick<Crypto, "subtle">,
): Promise<boolean> {
  return (await normalizedPolicySha256(text, cryptoProvider)) === expected;
}

export async function resolveLodgingThreshold(
  text: string,
  cryptoProvider?: Pick<Crypto, "subtle">,
): Promise<QuickActionResult> {
  try {
    if (occurrences(text, DRAFT_LODGING) !== 1) {
      return failure(text, "BASELINE_ANCHOR_MISMATCH");
    }
    const result = normalizePolicyText(text.replace(DRAFT_LODGING, RESOLVED_LODGING));
    if (
      !(await hashMatches(
        result,
        SAMPLE_VARIANT_DEFINITIONS["resolved-v1"].normalizedPolicySha256,
        cryptoProvider,
      ))
    ) {
      return failure(text, "BASELINE_HASH_MISMATCH");
    }
    return Object.freeze({ ok: true, text: result });
  } catch {
    return failure(text, "BASELINE_ACTION_FAILED");
  }
}

export async function createCandidateV2(
  publishedV1Text: string,
  cryptoProvider?: Pick<Crypto, "subtle">,
): Promise<QuickActionResult> {
  try {
    if (
      !(await hashMatches(
        publishedV1Text,
        SAMPLE_VARIANT_DEFINITIONS["resolved-v1"].normalizedPolicySha256,
        cryptoProvider,
      ))
    ) {
      return failure(publishedV1Text, "CANDIDATE_SOURCE_HASH_MISMATCH");
    }
    const anchors = [DISPLAY_V1, RELEASE_V1, EFFECTIVE_V1, RECEIPT_V1, WEEKEND];
    if (
      anchors.some((anchor) => occurrences(publishedV1Text, anchor) !== 1) ||
      occurrences(publishedV1Text, RIDESHARE) !== 0
    ) {
      return failure(publishedV1Text, "CANDIDATE_ANCHOR_MISMATCH");
    }

    const result = normalizePolicyText(
      publishedV1Text
        .replace(DISPLAY_V1, DISPLAY_V2)
        .replace(RELEASE_V1, RELEASE_V2)
        .replace(EFFECTIVE_V1, EFFECTIVE_V2)
        .replace(RECEIPT_V1, RECEIPT_V2)
        .replace(WEEKEND, `${WEEKEND}\n\n${RIDESHARE}`),
    );
    if (
      !(await hashMatches(
        result,
        SAMPLE_VARIANT_DEFINITIONS["candidate-v2"].normalizedPolicySha256,
        cryptoProvider,
      ))
    ) {
      return failure(publishedV1Text, "CANDIDATE_HASH_MISMATCH");
    }
    return Object.freeze({ ok: true, text: result });
  } catch {
    return failure(publishedV1Text, "CANDIDATE_ACTION_FAILED");
  }
}

export async function applyQuickAction(
  action: QuickAction,
  text: string,
  cryptoProvider?: Pick<Crypto, "subtle">,
): Promise<QuickActionResult> {
  return action === "resolve-lodging-threshold"
    ? resolveLodgingThreshold(text, cryptoProvider)
    : createCandidateV2(text, cryptoProvider);
}
