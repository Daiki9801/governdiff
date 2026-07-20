import { describe, expect, it } from "vitest";

import { centsToUsd, moneyToCents } from "../lib/domain/money";

describe("strict USD normalization", () => {
  it.each([
    ["0.00", 0],
    ["99.99", 9999],
    ["100.00", 10000],
    ["149.99", 14999],
    ["150.00", 15000],
    ["150.01", 15001],
  ])("converts %s to integer cents", (value, expected) => {
    expect(moneyToCents(value)).toBe(expected);
  });

  it.each([
    "1.000",
    "1e2",
    "+1.00",
    "-1.00",
    " 1.00",
    "1.00 ",
    "1,000.00",
    "1",
    "1.0",
    ".00",
    "01.00",
    "value",
  ])("rejects invalid USD input %s", (value) => {
    expect(() => moneyToCents(value)).toThrow();
  });

  it("rejects amounts that exceed safe integer cents", () => {
    expect(() => moneyToCents("90071992547410.00")).toThrow(/safe integer/);
  });

  it("renders canonical fixture cents deterministically and round-trips", () => {
    for (const value of ["0.00", "105.00", "120.01", "149.99", "150.00", "275.01", "500.00"]) {
      expect(centsToUsd(moneyToCents(value))).toBe(value);
    }
  });

  it("rejects invalid cents for rendering", () => {
    expect(() => centsToUsd(-1)).toThrow();
    expect(() => centsToUsd(1.5)).toThrow();
    expect(() => centsToUsd(Number.MAX_SAFE_INTEGER + 1)).toThrow();
  });
});
