/**
 * Format canonical integer micro-USD without passing through a lossy Number.
 *
 * @param {string} microusd
 * @param {number} [digits]
 */
export function formatMicroUsd(microusd, digits = 4) {
  const places = Math.max(2, Math.min(6, Math.trunc(digits)));
  const amount = BigInt(microusd);
  const zero = BigInt(0);
  const absolute = amount < zero ? -amount : amount;
  const roundingUnit = BigInt(10) ** BigInt(6 - places);
  const rounded = (absolute + roundingUnit / BigInt(2)) / roundingUnit;
  const fractionBase = BigInt(10) ** BigInt(places);
  const dollars = rounded / fractionBase;
  let fraction = (rounded % fractionBase).toString().padStart(places, "0");
  while (fraction.length > 2 && fraction.endsWith("0")) fraction = fraction.slice(0, -1);
  const sign = amount < zero && rounded !== zero ? "-" : "";
  return `${sign}$${dollars.toLocaleString("en-US")}.${fraction}`;
}

/** @param {string} rawMilliseconds */
export function formatDurationMs(rawMilliseconds) {
  const milliseconds = BigInt(rawMilliseconds);
  if (milliseconds < BigInt(1_000)) return milliseconds.toString() + " ms";
  if (milliseconds < BigInt(60_000)) {
    const tenths = (milliseconds + BigInt(50)) / BigInt(100);
    return `${tenths / BigInt(10)}.${tenths % BigInt(10)} s`;
  }
  return `${milliseconds / BigInt(60_000)}m ${(milliseconds % BigInt(60_000)) / BigInt(1_000)}s`;
}

/**
 * @param {string} left
 * @param {string} right
 */
export function compareMicroUsdDescending(left, right) {
  const leftValue = BigInt(left);
  const rightValue = BigInt(right);
  return leftValue === rightValue ? 0 : leftValue > rightValue ? -1 : 1;
}
