import test from "node:test";
import assert from "node:assert/strict";
import { semester2Questions } from "../src/data/semester2.js";
import { buildQuestionPool, createQuiz } from "../src/questions.js";
import { gradeQuestion } from "../src/grading.js";

test("ST2 covers only chapters 5–7 with sourced, gradable cards", () => {
  assert.equal(semester2Questions.length, 88);
  assert.equal(new Set(semester2Questions.map(q => q.id)).size, 88);
  for (const unit of [5, 6, 7]) {
    const pool = buildQuestionPool([unit], ["semester2"]);
    assert.ok(pool.length >= 28);
    for (const q of pool) {
      assert.equal(q.unit, unit);
      assert.equal(q.category, "semester2");
      assert.ok(q.source && q.tip && q.prompt && q.cue);
      for (const answer of q.answers) assert.equal(gradeQuestion(answer, q).score, 1, q.id);
    }
  }
  assert.deepEqual(buildQuestionPool([0, 1, 2, 3, 4], ["semester2"]), []);
  assert.ok(buildQuestionPool([5, 6, 7], ["semester"]).length === 0);
});

test("ST2 sampling covers sections and never repeats a shared passage", () => {
  for (let seed = 1; seed <= 20; seed++) {
    let state = seed;
    const random = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    const quiz = createQuiz({ units: [5, 6, 7], categories: ["semester2"], size: 50, random });
    assert.equal(quiz.length, 50);
    assert.equal(new Set(quiz.map(q => q.familyId)).size, 50);
    assert.equal(new Set(quiz.map(q => q.section)).size, new Set(semester2Questions.map(q => q.section)).size);
  }
});

test("ST2 sentences reject wrong verb forms and timetable answers reject wrong digits", () => {
  const byId = id => semester2Questions.find(q => q.id === id);
  const routine = byId("st2-u5-routine-tv");
  assert.equal(gradeQuestion("Sie sieht von 18:00 bis 19:30 Uhr fern", routine).score, 1);
  assert.equal(gradeQuestion("Sie sehen von 18:00 bis 19:30 Uhr fern.", routine).score, 0);
  assert.equal(gradeQuestion("0911", byId("st2-u6-reading-departure")).score, 0);
  assert.equal(gradeQuestion("4", byId("st2-u6-reading-wait")).score, 0);
});
