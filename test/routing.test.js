import test from "node:test";
import assert from "node:assert/strict";

import { pathForView, viewForPath } from "../src/routing.js";

test("maps application views to clean paths", () => {
  assert.equal(pathForView("home"), "/");
  assert.equal(pathForView("quiz"), "/quiz");
  assert.equal(pathForView("summary"), "/results");
});

test("resolves paths with optional trailing slashes", () => {
  assert.equal(viewForPath("/"), "home");
  assert.equal(viewForPath("/quiz/"), "quiz");
  assert.equal(viewForPath("/results/"), "summary");
});

test("falls back to home for unknown paths", () => {
  assert.equal(viewForPath("/not-a-page"), "home");
});
