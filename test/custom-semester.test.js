import test from "node:test";
import assert from "node:assert/strict";
import { customSemesterQuestions } from "../src/data/custom-semester.js";
import { buildQuestionPool, createQuiz } from "../src/questions.js";
import { gradeQuestion } from "../src/grading.js";

const units = [0, 1, 2, 3, 4];
const pool = buildQuestionPool(units, ["nouns", "verbs", "other", "grammar", "semester"]);
const find = id => pool.find(q => q.id === id);
const normalize = text => text.toLocaleLowerCase("de-DE").replace(/[^\p{L}\p{N}]/gu, "");

test("all five custom papers include every written task and their separate keys", () => {
  assert.equal(customSemesterQuestions.length, 130);
  for (let paper = 1; paper <= 5; paper++) {
    const prefix = `custom-st1-${String(paper).padStart(2, "0")}`;
    const questions = customSemesterQuestions.filter(q => q.id.startsWith(prefix));
    const counts = {};
    for (const q of questions) {
      counts[q.section] = (counts[q.section] || 0) + 1;
      assert.match(q.source, /ST1_Practice_\d\d\.md and ST1_Practice_\d\d_Answers\.md/);
      assert.ok(units.includes(q.unit));
      assert.equal(q.audio, undefined);
    }
    assert.deepEqual(counts, { Articles: 6, Conjugation: 1, Questions: 4, Negation: 5, Syntax: 4, Reading: 6 });
    const bank = questions.find(q => q.section === "Conjugation");
    assert.equal(bank.cue.split("\n").length, 6);
    assert.equal(bank.answers[0].split(",").length, 6);
    assert.equal(bank.context.split(" - ").length, 8);
    const readings = questions.filter(q => q.section === "Reading");
    assert.equal(new Set(readings.map(q => q.context)).size, 1);
    assert.equal(new Set(readings.map(q => q.familyId)).size, 1);
    assert.ok(readings.some(q => q.answers.includes("Niemand")));
  }
});

test("plural die-only cards are removed while singular gender and missing forms remain", () => {
  assert.equal(pool.some(q => q.id.endsWith("-article-plural")), false);
  assert.deepEqual(find("u2-r168-article").answers, ["der"]);
  assert.deepEqual(find("u2-r153-plural").answers, ["X"]);
  assert.equal(find("u3-r214-full").answers[0], "X, die Leute");
  assert.deepEqual(find("custom-st1-02-a-5").answers, ["X", "x"]);
  assert.deepEqual(find("custom-st1-04-a-5").answers, ["X", "x"]);
  assert.deepEqual(find("custom-st1-01-a-5").answers, ["X", "x"]);
  for (const [id, answer] of [["custom-st1-01-a-6", "Das"], ["custom-st1-03-a-6", "Die"], ["custom-st1-05-a-6", "Das"], ["st1-article-kuchen", "Der"]]) {
    assert.deepEqual(find(id).answers, [answer]);
    assert.match(find(id).cue, /\bist\b/);
    assert.match(find(id).tip, /singular/);
  }
});

test("custom keys, sentence alternatives, zero articles and reading sets grade correctly", () => {
  for (const [id, answer] of [
    ["custom-st1-03-b-bank", "seid,hast,kommt,liest,fährst,buchstabiert"],
    ["custom-st1-02-d-4", "Nein, sie hat keine Brille."],
    ["custom-st1-05-d-3", "Nein, Ben trinkt Kaffee nicht gern."],
    ["custom-st1-01-e-1", "Jetzt lernen wir Deutsch in Leipzig."],
    ["custom-st1-04-reading-1", "Mai,Lea"],
    ["custom-st1-04-a-5", "x"]
  ]) assert.equal(gradeQuestion(answer, find(id)).score, 1, id);
  assert.equal(gradeQuestion("Paula, Yuki", find("custom-st1-02-reading-6")).score, 0);
  assert.equal(gradeQuestion("Lea", find("custom-st1-04-reading-1")).score, 0);
  assert.equal(gradeQuestion("Nein, Ben trinkt keinen Kaffee.", find("custom-st1-05-d-3")).score, 0);
});

test("identical authored tasks and sentence answers share a family across source papers", () => {
  const signatures = new Map();
  for (const q of pool.filter(q => ["grammar", "semester"].includes(q.category))) {
    // A repeated reading question with a different passage is a different task.
    const keys = [`task:${normalize(q.context || "")}:${normalize(q.cue)}:${q.answers.map(normalize).sort().join("|")}`];
    if (!q.context) {
      keys.push(...q.answers.filter(answer => /[.!?]$/.test(answer)).map(answer => `sentence:${normalize(answer)}`));
    }
    for (const key of keys) {
      if (signatures.has(key)) assert.equal(q.familyId, signatures.get(key).familyId, `${q.id} duplicates ${signatures.get(key).id}`);
      else signatures.set(key, q);
    }
  }
  assert.equal(find("st1-question-origin").familyId, find("custom-st1-01-c-1").familyId);
});

test("large mixed quizzes never repeat families or custom reading stimuli", () => {
  for (const categories of [["semester"], ["nouns", "verbs", "other", "grammar", "semester"]]) {
    for (let seed = 1; seed <= 12; seed++) {
      let state = seed;
      const random = () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296);
      const quiz = createQuiz({ units, categories, size: 10000, random });
      assert.equal(new Set(quiz.map(q => q.familyId)).size, quiz.length);
      assert.equal(quiz.filter(q => ["custom-st1-01-c-1", "st1-question-origin"].includes(q.id)).length, 1);
      for (let paper = 1; paper <= 5; paper++) {
        assert.equal(quiz.filter(q => q.familyId === `custom-st1-0${paper}-reading`).length, 1);
      }
    }
  }
});

test("an old-source duplicate on cooldown does not reappear through its custom variant", () => {
  const quiz = createQuiz({ units: [1], categories: ["semester"], size: 4, currentAttempt: 100,
    entryStats: { "st1-question-origin": { attempts: 1, lastSeenAt: 100 } }, random: () => 0.42 });
  assert.equal(quiz.some(q => q.familyId === "st1-question-origin"), false);
});
