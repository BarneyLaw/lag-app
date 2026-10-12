import test from "node:test";
import assert from "node:assert/strict";
import { buildQuestionPool, createQuiz, glossary } from "../src/questions.js";
import { gradeQuestion } from "../src/grading.js";
import { conjugationQuestions } from "../src/data/conjugations.js";

const units = [5, 6, 7];
const categories = ["nouns", "verbs", "other", "grammar", "conjugation"];
const pool = buildQuestionPool(units, categories);
const find = id => pool.find(q => q.id === id);

test("chapters 5–7 cover every imported word and all practice categories", () => {
  assert.deepEqual(units.map(u => glossary.filter(e => e.unit === u).length), [100, 78, 78]);
  assert.equal(new Set(pool.map(q => q.id)).size, pool.length);
  for (const entry of glossary.filter(e => units.includes(e.unit))) {
    assert.ok(pool.some(q => q.entryId === entry.id), entry.id);
  }
  for (const unit of units) {
    for (const category of categories) {
      const quiz = createQuiz({ units: [unit], categories: [category], size: 1000 });
      assert.ok(quiz.length, unit + "/" + category);
      assert.ok(quiz.every(q => q.unit === unit && q.category === category));
      assert.equal(new Set(quiz.map(q => q.familyId)).size, quiz.length);
    }
  }
  for (const q of pool) {
    assert.ok(q.cue && q.prompt && q.tip && q.source && q.answers.length, q.id);
    for (const answer of q.answers) {
      assert.ok(answer.trim(), q.id);
      assert.equal(gradeQuestion(answer, q).score, 1, q.id + ": " + answer);
    }
  }
});

test("ST1 retains its original chapter scope", () => {
  assert.deepEqual(buildQuestionPool(units, ["semester"]), []);
  assert.equal(buildQuestionPool([0, 1, 2, 3, 4, 5, 6, 7], ["semester"]).length, 174);
});

test("new source notation produces usable vocabulary prompts", () => {
  assert.equal(find("u5-r387-singular"), undefined);
  assert.equal(find("u5-r387-article"), undefined);
  assert.equal(find("u5-r387-full").answers[0], "X, die Spaghetti");
  assert.deepEqual(find("u5-r395-german").answers, ["lang", "lange"]);
  assert.deepEqual(find("u6-r478-infinitive").answers, ["treffen"]);
  for (const [a, b] of [["u5-r370", "u5-r371"], ["u5-r392", "u5-r393"], ["u6-r470", "u6-r471"], ["u7-r603", "u7-r604"]]) {
    assert.equal(pool.find(q => q.entryId === a).familyId, pool.find(q => q.entryId === b).familyId);
  }
});

test("shared verb tables retain IDs and are available in every relevant chapter", () => {
  for (const [verb, memberships] of [["spielen", [1, 5]], ["abfahren", [5, 6]], ["vorbereiten", [5, 7]], ["geben", [2, 7]], ["stehen", [1, 7]]]) {
    const table = conjugationQuestions.find(q => q.verb === verb);
    assert.deepEqual(table.units, memberships);
    for (const unit of memberships) {
      assert.equal(buildQuestionPool([unit], ["conjugation"]).find(q => q.id === table.id)?.unit, unit);
    }
  }
  const quiz = createQuiz({ units: [0, 1, 2, 3, 4, 5, 6, 7], categories: ["conjugation"], size: 1000 });
  assert.equal(quiz.length, 109);
  assert.equal(new Set(quiz.map(q => q.verb)).size, 109);
  assert.equal(buildQuestionPool([0, 1, 2, 3, 4], ["conjugation"]).length, 66);
});

test("chapter grammar covers the source's distinctive rules", () => {
  for (const [id, answer] of [
    ["u5-grammar-clock-half-six", "halb sechs"],
    ["u5-grammar-separable-einladen", "lädt,ein"],
    ["u6-grammar-possessive-your-city", "eure"],
    ["u6-grammar-possessive-formal-keys", "Ihre"],
    ["u6-grammar-transport-train", "der"],
    ["u7-grammar-floor-20", "zwanzigsten"],
    ["u7-grammar-location-plural", "den"],
    ["u7-grammar-position-hang", "hängt"]
  ]) assert.equal(gradeQuestion(answer, find(id)).score, 1, id);
  assert.ok(gradeQuestion("halb fünf", find("u5-grammar-clock-half-six")).score < 1);
  assert.equal(gradeQuestion("ihre", find("u6-grammar-possessive-formal-keys")).score, 0.75);
  const invite = conjugationQuestions.find(q => q.verb === "einladen");
  assert.equal(invite.rows[1].answers[0], "lädst ein");
  assert.equal(invite.rows[4].answers[0], "ladet ein");
  const excuse = conjugationQuestions.find(q => q.verb === "sich entschuldigen");
  assert.equal(excuse.rows[3].answers[0], "entschuldigen uns");
});
