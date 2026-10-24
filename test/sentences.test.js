import test from "node:test";
import assert from "node:assert/strict";
import { sentenceQuestions } from "../src/data/sentences.js";
import { buildQuestionPool, createQuiz } from "../src/questions.js";
import { gradeAnswer, gradeQuestion } from "../src/grading.js";

const units = [0, 1, 2, 3, 4, 5, 6, 7];
const pool = buildQuestionPool(units, ["sentences"]);
const get = (id) => {
  const question = pool.find((item) => item.id === id);
  assert.ok(question, id);
  return question;
};
const randomFor = (seed) => () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);

test("sentence practice has stable, sourced, full-sentence answers in every chapter", () => {
  assert.equal(pool.length, sentenceQuestions.length);
  assert.equal(new Set(pool.map(q => q.id)).size, pool.length);
  for (const q of pool) {
    assert.equal(q.answerKind, "sentence");
    assert.ok(q.source && q.tip && q.prompt && q.cue, q.id);
    assert.equal(q.entryId, q.id);
    assert.equal(q.familyId, q.id);
    for (const answer of q.answers) {
      assert.match(answer, /[.!?]$/);
      assert.equal(gradeQuestion(answer, q).score, 1, q.id);
      assert.equal(gradeQuestion(answer.slice(0, -1), q).score, 1, q.id);
    }
  }
  for (const unit of units) {
    const quiz = createQuiz({ units: [unit], categories: ["sentences"], size: 1000 });
    assert.ok(quiz.length, `Unit ${unit}`);
    assert.ok(quiz.every(q => q.unit === unit && q.category === "sentences"));
  }
  assert.deepEqual(buildQuestionPool([8], ["sentences"]), []);
  assert.deepEqual(buildQuestionPool([], ["sentences"]), []);
  assert.deepEqual(buildQuestionPool(units, []), []);
  assert.ok(buildQuestionPool(units, ["grammar", "semester"]).every(q => !q.id.includes("-sentence-")));
});

test("sentence quizzes balance skills, cap their size and rotate away from recent items", () => {
  const categories = ["sentences"];
  for (let seed = 1; seed <= 20; seed++) {
    const quiz = createQuiz({ units: [5, 6, 7], categories, size: 20, random: randomFor(seed) });
    assert.equal(quiz.length, 20);
    assert.equal(new Set(quiz.map(q => q.section)).size, 4);
    assert.equal(new Set(quiz.map(q => q.familyId)).size, quiz.length);
  }
  const first = createQuiz({ units, categories, size: 10, random: randomFor(1) });
  const entryStats = Object.fromEntries(first.map((q, i) => [q.id, { attempts: 1, lastSeenAt: i + 1 }]));
  const next = createQuiz({ units, categories, size: 10, entryStats, currentAttempt: 10, random: randomFor(1) });
  assert.ok(next.every(q => !entryStats[q.id]));
  const all = createQuiz({ units, categories, size: 1000 });
  assert.equal(all.length, pool.length);
});

test("word order, negation scope and grammatical endings cannot earn typo credit", () => {
  const wrong = [
    ["u1-sentence-place-first", "In Berlin ich wohne."],
    ["u4-sentence-accusative-m", "Ich habe keine Hund."],
    ["u4-sentence-mass-noun", "Ich trinke kein Tee."],
    ["u5-sentence-call", "Ich rufe nicht dich an."],
    ["u5-sentence-call", "Ich rufe dich an nicht."],
    ["u5-sentence-shopping", "Ich kaufe nicht am Freitag ein."],
    ["u5-sentence-contrast-object", "Ich schalte das Radio, sondern die Lampe nicht aus."],
    ["u6-sentence-possessive-negative", "Das ist kein mein Fahrrad."],
    ["u6-sentence-tmp-travel", "Ich fahre mit dem Bus jeden Tag zur Arbeit."],
    ["u6-sentence-past-statement", "Gestern wart wir in Berlin."],
    ["u7-sentence-dative-table", "Die Tastatur liegt auf den Schreibtisch."],
    ["u7-sentence-dative-plural", "Das Handy liegt vor dem Büchern."],
    ["u7-sentence-plural-location", "Im Regal steht die Bücher."],
    ["u7-sentence-third-floor", "Das Büro ist in der dritte Etage."]
  ];
  for (const [id, answer] of wrong) assert.equal(gradeQuestion(answer, get(id)).score, 0, answer);
  assert.equal(gradeQuestion("", get("u5-sentence-call")).score, 0);
  // Existing vocabulary typo policy is unchanged.
  assert.equal(gradeAnswer("Kaffe", ["Kaffee"]).score, 0.5);
});

test("sentence grading handles spacing, Unicode, punctuation and explicit alternatives", () => {
  const q = get("u5-sentence-invite");
  assert.equal(gradeQuestion("  Anna   lädt am Freitag ihre Freunde ein.  ", q).score, 1);
  assert.equal(gradeQuestion(q.answers[0].normalize("NFD"), q).score, 1);
  assert.equal(gradeQuestion(q.answers[1], q).score, 1);
  assert.equal(gradeQuestion("Anna lädt am Freitag ihre freunde ein.", q).score, 0.75);
  assert.equal(gradeQuestion("Anna laedt am Freitag ihre Freunde ein.", q).score, 0.5);
  assert.equal(gradeQuestion("Anna läd am Freitag ihre Freunde ein.", q).score, 0);
  assert.equal(gradeQuestion("Anna lädt am Freitag ihre Freunde ein?", q).score, 0);
  assert.equal(gradeQuestion("Sind das ihre Schlüssel, Frau Weber?", get("u6-sentence-formal-keys")).score, 0.75);
  assert.equal(gradeQuestion("Ich komme nicht am Montag sondern am Dienstag.", get("u5-sentence-contrast-day")).score, 0);
});
