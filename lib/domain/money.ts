const USD_PATTERN = /^(0|[1-9][0-9]*)\.[0-9]{2}$/;

export function moneyToCents(value: string): number {
  if (!USD_PATTERN.test(value)) {
    throw new Error(`Invalid USD amount: ${value}`);
  }

  const separator = value.indexOf(".");
  const whole = value.slice(0, separator);
  const fraction = value.slice(separator + 1);
  const cents = BigInt(whole) * 100n + BigInt(fraction);

  if (cents > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`USD amount exceeds the safe integer range: ${value}`);
  }

  return Number(cents);
}

export function centsToUsd(cents: number): string {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new Error(`Invalid integer cents: ${cents}`);
  }

  const whole = Math.floor(cents / 100);
  const fraction = cents % 100;
  return `${whole}.${fraction.toString().padStart(2, "0")}`;
}
