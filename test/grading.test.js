import test from "node:test";
import assert from "node:assert/strict";

import { editDistance, gradeAnswer, normalizeSpacing } from "../src/grading.js";

test("normalizes harmless surrounding and repeated whitespace", () => {
  assert.equal(normalizeSpacing("  der   Brief  "), "der Brief");
});

test("awards full credit only for an exact answer", () => {
  assert.deepEqual(gradeAnswer("die Straße", ["die Straße"]), {
    status: "correct",
    score: 1,
    reason: "Exact spelling and capitalisation."
  });
});

test("penalizes noun capitalization", () => {
  const result = gradeAnswer("die straße", ["die Straße"]);
  assert.equal(result.status, "partial");
  assert.equal(result.score, 0.75);
});

test("gives partial credit for German character substitutions", () => {
  const result = gradeAnswer("Tschuess", ["Tschüss"]);
  assert.equal(result.status, "partial");
  assert.equal(result.score, 0.5);
  assert.match(result.reason, /exact German character/);
});

test("gives partial credit for a minor typo", () => {
  const result = gradeAnswer("bestelen", ["bestellen"]);
  assert.equal(result.status, "partial");
  assert.equal(result.score, 0.5);
});

test("rejects a materially different form", () => {
  assert.equal(gradeAnswer("der Brief", ["die Adresse"]).score, 0);
});

test("edit distance recognizes adjacent transpositions", () => {
  assert.equal(editDistance("Brief", "Breif"), 1);
});
