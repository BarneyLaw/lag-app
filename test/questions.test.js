import test from "node:test";
import assert from "node:assert/strict";

import { buildQuestionPool, createQuiz, glossary } from "../src/questions.js";

test("contains the complete Unit 2 and Unit 3 glossary", () => {
  assert.equal(glossary.length, 141);
  assert.equal(glossary.filter((entry) => entry.unit === 2).length, 67);
  assert.equal(glossary.filter((entry) => entry.unit === 3).length, 74);
});

test("filters questions by unit and category", () => {
  const questions = buildQuestionPool([2], ["verbs"]);
  assert.ok(questions.length > 0);
  assert.ok(questions.every((question) => question.unit === 2));
  assert.ok(questions.every((question) => question.category === "verbs"));
});

test("all generated questions have a usable answer and source", () => {
  const questions = buildQuestionPool([2, 3], ["nouns", "verbs", "other", "grammar"]);
  assert.ok(questions.length > 400);
  assert.ok(questions.every((question) => question.answers.length > 0));
  assert.ok(questions.every((question) => question.answers.every(Boolean)));
  assert.ok(questions.every((question) => question.source));
});

test("uses X when the glossary lists no noun plural", () => {
  const questions = buildQuestionPool([2], ["nouns"]);
  const stressPlural = questions.find((question) => question.id === "u2-r153-plural");
  assert.deepEqual(stressPlural.answers, ["X"]);
});

test("includes die in complete plural noun answers", () => {
  const questions = buildQuestionPool([2], ["nouns"]);
  const mailboxPlural = questions.find((question) => question.id === "u2-r168-plural");
  assert.deepEqual(mailboxPlural.answers, ["die Briefkästen"]);
});

test("uses the in English cues when the German noun answer includes an article", () => {
  const questions = buildQuestionPool([3], ["nouns"]);
  const juiceSingular = questions.find((question) => question.id === "u3-r207-singular");
  assert.equal(juiceSingular.cue, "the orange juice");
  assert.deepEqual(juiceSingular.answers, ["der Orangensaft"]);
});

test("does not present the plural-only die Leute as a singular/plural pair", () => {
  const questions = buildQuestionPool([3], ["nouns"]);
  assert.equal(questions.some((question) => question.id === "u3-r214-plural"), false);
});

test("creates a randomized quiz of the requested size without duplicate questions", () => {
  const quiz = createQuiz({ units: [2, 3], categories: ["nouns", "verbs"], size: 30 });
  assert.equal(quiz.length, 30);
  assert.equal(new Set(quiz.map((question) => question.id)).size, 30);
});
