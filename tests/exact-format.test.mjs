import assert from "node:assert/strict";
import test from "node:test";
import {
  compareMicroUsdDescending,
  formatDurationMs,
  formatMicroUsd,
} from "../app/dashboard/exact-format.js";

test("formats exact decimal-string money without Number coercion", () => {
  assert.equal(formatMicroUsd("0"), "$0.00");
  assert.equal(formatMicroUsd("120000"), "$0.12");
  assert.equal(formatMicroUsd("10733"), "$0.0107");
  assert.equal(formatMicroUsd("10733", 6), "$0.010733");
  assert.equal(formatMicroUsd("-10733", 6), "-$0.010733");
  assert.equal(formatMicroUsd("9007199254740993", 6), "$9,007,199,254.740993");
});

test("formats and sorts counters above Number.MAX_SAFE_INTEGER exactly", () => {
  assert.equal(formatDurationMs("999"), "999 ms");
  assert.equal(formatDurationMs("1050"), "1.1 s");
  assert.equal(formatDurationMs("61000"), "1m 1s");
  assert.equal(formatDurationMs("9007199254740993"), "150119987579m 0s");

  const values = ["9007199254740992", "8", "9007199254740993"];
  values.sort(compareMicroUsdDescending);
  assert.deepEqual(values, ["9007199254740993", "9007199254740992", "8"]);
});
