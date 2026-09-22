import test from "node:test";
import assert from "node:assert/strict";

import { buildQuestionPool, createQuiz, glossary } from "../src/questions.js";

test("contains the complete Unit 0 to Unit 4 glossary", () => {
  assert.equal(glossary.length, 368);
  assert.equal(glossary.filter((entry) => entry.unit === 0).length, 90);
  assert.equal(glossary.filter((entry) => entry.unit === 1).length, 43);
  assert.equal(glossary.filter((entry) => entry.unit === 2).length, 67);
  assert.equal(glossary.filter((entry) => entry.unit === 3).length, 74);
  assert.equal(glossary.filter((entry) => entry.unit === 4).length, 94);
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
  assert.ok(questions.every((question) => question.familyId));
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

test("represents a plural-only noun with X in the singular position", () => {
  const questions = buildQuestionPool([3], ["nouns"]);
  const peoplePair = questions.find((question) => question.id === "u3-r214-full");
  assert.equal(peoplePair.answers[0], "X, die Leute");
  assert.equal(questions.some((question) => question.id === "u3-r214-singular"), false);
});

test("includes sample-test style singular and plural noun recall", () => {
  const questions = buildQuestionPool([2], ["nouns"]);
  const mailboxPair = questions.find((question) => question.id === "u2-r168-full");
  const stressPair = questions.find((question) => question.id === "u2-r153-full");
  assert.equal(mailboxPair.answers[0], "der Briefkasten, die Briefkästen");
  assert.equal(stressPair.answers[0], "der Stress, X");
});

test("vocabulary verbs use only German to English or English to German recall", () => {
  const questions = buildQuestionPool([2, 3], ["verbs"]);
  assert.deepEqual([...new Set(questions.map((question) => question.format))].sort(), ["de-en", "en-de"]);
  assert.equal(questions.some((question) => question.id.endsWith("-conjugation")), false);
});

test("noun cards stay within the three baseline formats plus combined-form recall", () => {
  const questions = buildQuestionPool([2, 3], ["nouns"]);
  assert.deepEqual([...new Set(questions.map((question) => question.format))].sort(), [
    "article",
    "de-en",
    "en-de",
    "en-de-pair"
  ]);
});

test("uses unique glossary entries before selecting another variant", () => {
  const quiz = createQuiz({
    units: [2, 3],
    categories: ["nouns", "verbs", "other", "grammar"],
    size: 120,
    random: () => 0.42
  });
  assert.equal(quiz.length, 120);
  assert.equal(new Set(quiz.map((question) => question.entryId)).size, 120);
});

test("keeps masculine and feminine versions in one vocabulary family", () => {
  const questions = buildQuestionPool([2], ["nouns"]);
  const masculine = questions.find((question) => question.entryId === "u2-r149");
  const feminine = questions.find((question) => question.entryId === "u2-r150");
  assert.equal(masculine.familyId, feminine.familyId);

  const quiz = createQuiz({
    units: [2],
    categories: ["nouns"],
    size: 100,
    random: () => 0.42
  });
  assert.equal(
    quiz.filter((question) => ["u2-r149", "u2-r150"].includes(question.entryId)).length,
    1
  );
});

test("never asks Chai more than once in one quiz", () => {
  const quiz = createQuiz({
    units: [3],
    categories: ["nouns"],
    size: 100,
    random: () => 0.42
  });
  assert.equal(quiz.filter((question) => question.entryId === "u3-r253").length, 1);
});

test("rests a recently shown family while older alternatives are available", () => {
  const entries = new Map(
    buildQuestionPool([3], ["nouns"]).map((question) => [question.entryId, question])
  );
  const entryStats = Object.fromEntries(
    [...entries.keys()].map((entryId) => [entryId, {
      attempts: 1,
      points: 1,
      lastSeenAt: entryId === "u3-r253" ? 100 : 1
    }])
  );
  const quiz = createQuiz({
    units: [3],
    categories: ["nouns"],
    size: 10,
    entryStats,
    currentAttempt: 100,
    random: () => 0.42
  });
  assert.equal(quiz.some((question) => question.entryId === "u3-r253"), false);
});

test("includes every selected category using proportional entry sampling", () => {
  const quiz = createQuiz({
    units: [2, 3],
    categories: ["nouns", "verbs", "other", "grammar"],
    size: 20,
    random: () => 0.42
  });
  assert.deepEqual([...new Set(quiz.map((question) => question.category))].sort(), [
    "grammar",
    "nouns",
    "other",
    "verbs"
  ]);
});

test("prioritizes unseen entries within every selected category", () => {
  const pool = buildQuestionPool([2, 3], ["nouns", "verbs", "other", "grammar"]);
  const entryCategory = new Map(pool.map((question) => [question.entryId, question.category]));
  const idsByCategory = new Map();
  entryCategory.forEach((category, id) => {
    if (!idsByCategory.has(category)) idsByCategory.set(category, []);
    idsByCategory.get(category).push(id);
  });
  const seenIds = new Set();
  idsByCategory.forEach((ids) => ids.slice(0, Math.floor(ids.length / 2)).forEach((id) => seenIds.add(id)));
  const entryStats = Object.fromEntries(
    [...seenIds].map((id) => [id, { attempts: 1, points: 1 }])
  );
  const quiz = createQuiz({
    units: [2, 3],
    categories: ["nouns", "verbs", "other", "grammar"],
    size: 30,
    entryStats,
    random: () => 0.42
  });
  assert.ok(quiz.every((question) => !seenIds.has(question.entryId)));
});

test("covers all 141 vocabulary entries within ten 20-question sessions", () => {
  let seed = 123456;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const entryStats = {};
  const questionStats = {};
  const covered = new Set();

  let currentAttempt = 0;
  for (let session = 0; session < 10; session += 1) {
    const quiz = createQuiz({
      units: [2, 3],
      categories: ["nouns", "verbs", "other"],
      size: 20,
      entryStats,
      questionStats,
      currentAttempt,
      random
    });
    assert.equal(new Set(quiz.map((question) => question.entryId)).size, quiz.length);
    quiz.forEach((question) => {
      currentAttempt += 1;
      covered.add(question.entryId);
      entryStats[question.entryId] ||= { attempts: 0, points: 0 };
      entryStats[question.entryId].attempts += 1;
      entryStats[question.entryId].points += 1;
      entryStats[question.entryId].lastSeenAt = currentAttempt;
      questionStats[question.id] ||= { attempts: 0, points: 0 };
      questionStats[question.id].attempts += 1;
      questionStats[question.id].points += 1;
      questionStats[question.id].lastSeenAt = currentAttempt;
    });
  }

  assert.equal(covered.size, 141);
});

test("rotates question formats by choosing the least-used variant", () => {
  const pool = buildQuestionPool([2], ["verbs"]);
  const entryId = pool[0].entryId;
  const variants = pool.filter((question) => question.entryId === entryId);
  const preferred = variants[1];
  const questionStats = Object.fromEntries(
    variants.map((question) => [question.id, { attempts: question.id === preferred.id ? 0 : 3 }])
  );
  const quiz = createQuiz({
    units: [2],
    categories: ["verbs"],
    size: 3,
    questionStats,
    random: () => 0.42
  });
  assert.equal(quiz.find((question) => question.entryId === entryId).id, preferred.id);
});
