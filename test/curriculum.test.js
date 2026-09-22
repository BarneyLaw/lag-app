import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { buildQuestionPool, createQuiz, glossary } from "../src/questions.js";
import { gradeQuestion } from "../src/grading.js";

const units = [0, 1, 2, 3, 4];
const categories = ["nouns", "verbs", "other", "grammar", "semester"];
const pool = buildQuestionPool(units, categories);
const question = (id) => pool.find((item) => item.id === id);

test("every chapter/category is usable and every model answer earns full credit", () => {
  assert.equal(new Set(pool.map((q) => q.id)).size, pool.length);
  for (const unit of units) {
    for (const category of categories) {
      const filtered = buildQuestionPool([unit], [category]);
      assert.ok(filtered.length, `${unit}/${category}`);
      assert.ok(filtered.every((q) => q.unit === unit && q.category === category));
    }
  }
  for (const q of pool) {
    assert.ok(q.cue && q.prompt && q.tip && q.source && q.familyId, q.id);
    assert.ok(q.answers.length && q.answers.every((answer) => answer.trim()), q.id);
    for (const answer of q.answers) assert.equal(gradeQuestion(answer, q).score, 1, `${q.id}: ${answer}`);
  }
});

test("plural-only Pommes has no singular card and accepts the optional Frites", () => {
  assert.equal(question("u4-r323-singular"), undefined);
  const q = question("u4-r323-full");
  assert.equal(gradeQuestion("X, die Pommes", q).score, 1);
  assert.equal(gradeQuestion("X, die Pommes Frites", q).score, 1);
  assert.equal(question("u4-r323-article-plural").cue, "Pommes: chips (plural)");
});

test("glossary alternatives accept one form instead of requiring notation", () => {
  const q = question("u4-r343-full");
  for (const answer of ["die Pizza, die Pizzas", "die Pizza, die Pizzen"]) {
    assert.equal(gradeQuestion(answer, q).score, 1);
  }
  for (const answer of ["gern", "gerne"]) assert.equal(gradeQuestion(answer, question("u0-r50-german")).score, 1);
  for (const answer of ["slow", "slowly"]) assert.equal(gradeQuestion(answer, question("u0-r61-english")).score, 1);
  assert.deepEqual(question("u4-r302-infinitive").answers, ["finden"]);
  assert.equal(gradeQuestion("...", question("u4-r302-english")).score, 0);
});

test("new gender counterparts and repeated verb senses cannot repeat in one quiz", () => {
  for (const [a, b] of [["u1-r100", "u1-r101"], ["u4-r368", "u4-r369"], ["u4-r302", "u4-r356"]]) {
    assert.equal(pool.find((q) => q.entryId === a).familyId, pool.find((q) => q.entryId === b).familyId);
  }
  const quiz = createQuiz({ units, categories, size: 10000 });
  assert.equal(new Set(quiz.map((q) => q.familyId)).size, quiz.length);
});

test("20-item semester quizzes cover all seven sections without repeating a stimulus", () => {
  for (let seed = 1; seed <= 20; seed++) {
    let state = seed;
    const random = () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296);
    const quiz = createQuiz({ units, categories: ["semester"], size: 20, random });
    assert.equal(quiz.length, 20);
    assert.equal(new Set(quiz.map((q) => q.section)).size, 7);
    assert.equal(new Set(quiz.map((q) => q.familyId)).size, quiz.length);
  }
});

test("telephone answers ignore grouping spaces but preserve every digit", () => {
  const q = question("st1-phone-2");
  assert.equal(gradeQuestion("0170 21 23 78", q).score, 1);
  assert.equal(gradeQuestion("170212378", q).score, 0);
  assert.equal(gradeQuestion("0170212379", q).score, 0);
});

test("reading accepts any name order, rejects missing or duplicated names", () => {
  const q = question("st1-reading-course-city");
  assert.equal(gradeQuestion("Clara,Anna", q).score, 1);
  assert.equal(gradeQuestion("Anna", q).score, 0);
  assert.equal(gradeQuestion("Anna, Clara, Anna", q).score, 0);
  assert.equal(gradeQuestion("anna, clara", q).score, 0.75);
});

test("verb-bank lists accept comma spacing without dropping conjugation accuracy", () => {
  const q = question("st1-verb-bank");
  assert.equal(gradeQuestion("sammelt,Liest,arbeite,habe,Möchtet,sind", q).score, 1);
  assert.ok(gradeQuestion("sammeln,lesen,arbeiten,haben,möchten,sein", q).score < 1);
});

test("new modules and audio are present in the offline shell", () => {
  const worker = readFileSync(new URL("../sw.js", import.meta.url), "utf8");
  for (const path of ["data/foundations.js", "data/semester.js", "audio/st1-names.mp3", "audio/st1-phones.mp3"]) {
    assert.ok(existsSync(new URL(`../src/${path}`, import.meta.url)));
    assert.ok(worker.includes(`/src/${path}`));
  }
});

test("expanded vocabulary rotation eventually reaches every glossary entry", () => {
  let state = 123456;
  const random = () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296);
  const entryStats = {}, questionStats = {}, covered = new Set();
  let currentAttempt = 0;
  for (let session = 0; session < 30; session++) {
    const quiz = createQuiz({ units, categories: ["nouns", "verbs", "other"], size: 20,
      entryStats, questionStats, currentAttempt, random });
    for (const q of quiz) {
      covered.add(q.entryId);
      const stats = entryStats[q.entryId] ||= { attempts: 0 };
      stats.attempts++;
      stats.lastSeenAt = ++currentAttempt;
      const variant = questionStats[q.id] ||= { attempts: 0 };
      variant.attempts++;
    }
  }
  assert.equal(covered.size, glossary.length);
});
