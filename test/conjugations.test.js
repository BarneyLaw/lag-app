import test from "node:test";
import assert from "node:assert/strict";
import { conjugationQuestions, conjugationPersons } from "../src/data/conjugations.js";
import { buildQuestionPool, createQuiz, glossary } from "../src/questions.js";
import { gradeQuestion } from "../src/grading.js";

const units = [0, 1, 2, 3, 4];
const table = (verb) => conjugationQuestions.find((q) => q.verb === verb);
const answers = (q) => q.rows.map((row) => row.answers[0]);

test("tables cover every glossary verb and every cumulative verb-list headword once", () => {
  assert.equal(conjugationQuestions.length, 66);
  assert.equal(new Set(conjugationQuestions.map(q => q.id)).size, 66);
  const covered = new Set(conjugationQuestions.flatMap(q => q.glossaryIds));
  for (const entry of glossary.filter(e => e.wordClass === "verb")) {
    assert.ok(covered.has(entry.id), `${entry.id} ${entry.german}`);
    const q = conjugationQuestions.find(q => q.glossaryIds.includes(entry.id));
    const thirdPerson = entry.pluralOrConjugation.replace(/^(er|es) /, "");
    assert.ok(q.rows[2].answers.includes(thirdPerson), `${entry.german}: ${thirdPerson}`);
    assert.equal(q.unit, entry.unit);
  }
  const cumulative = "begrüßen bestellen brauchen buchstabieren ergänzen fotografieren fragen gehen glauben hören kennen kommen leben lernen lieben machen markieren nerven ordnen posten probieren sagen sammeln schicken schreiben spielen stehen stimmen studieren telefonieren trinken verstehen wiederholen wohnen zahlen heißen tanzen antworten arbeiten finden kosten essen fahren geben haben können lesen möchten mögen nehmen sein sprechen treffen wissen".split(" ");
  for (const verb of cumulative) assert.ok(table(verb), verb);
  for (const verb of ["joggen", "backen", "sehen", "schmecken", "beginnen", "liegen", "helfen"]) assert.ok(table(verb), verb);
  assert.equal(conjugationQuestions.filter(q => q.verb === "finden").length, 1);
});

test("every table has seven ordered pronouns, full-credit forms and provenance", () => {
  for (const q of conjugationQuestions) {
    assert.ok(q.source && q.tip && q.meaning && q.instruction, q.id);
    assert.deepEqual(q.rows.map(row => row.person), conjugationPersons);
    assert.deepEqual(q.rows[5].answers, q.rows[6].answers);
    assert.equal(gradeQuestion(answers(q), q).score, 1, q.id);
    assert.equal(gradeQuestion(q.answers[0], q).score, 1, q.id);
    for (const [index, row] of q.rows.entries()) {
      for (const form of row.answers) {
        const submitted = answers(q);
        submitted[index] = form;
        assert.equal(gradeQuestion(submitted, q).score, 1, `${q.id} ${row.person} ${form}`);
      }
    }
  }
});

test("table quizzes respect chapter filters, unique verbs, limits and exposure cooldown", () => {
  for (const unit of units) {
    const quiz = createQuiz({ units: [unit], categories: ["conjugation"], size: 100 });
    assert.ok(quiz.length);
    assert.ok(quiz.every(q => q.unit === unit && q.category === "conjugation"));
    assert.equal(new Set(quiz.map(q => q.familyId)).size, quiz.length);
  }
  const settings = { units, categories: ["conjugation"], size: 10, random: () => 0.4 };
  const first = createQuiz(settings);
  const entryStats = Object.fromEntries(first.map((q, index) => [q.entryId, { attempts: 1, lastSeenAt: index + 1 }]));
  const second = createQuiz({ ...settings, entryStats, currentAttempt: 10 });
  assert.equal(second.length, 10);
  assert.ok(second.every(q => !entryStats[q.entryId]));
  assert.equal(buildQuestionPool([], ["conjugation"]).length, 0);
  assert.ok(buildQuestionPool(units, ["verbs"]).every(q => q.answerKind !== "conjugation-table"));
});

test("table grading averages rows and preserves blank positions for review", () => {
  const q = table("sein");
  const submitted = ["bin", "", "ist", "", "seid", "", "sind"];
  const grade = gradeQuestion(submitted, q);
  assert.equal(grade.score, 4 / 7);
  assert.equal(grade.status, "partial");
  assert.equal(grade.rows[1].submitted, "");
  assert.equal(grade.rows[1].answer, "bist");
  assert.equal(grade.rows[1].score, 0);
  for (const empty of [[], Array(7).fill(""), ""]) assert.equal(gradeQuestion(empty, q).score, 0);
});

test("a different person's valid form is incorrect, while spelling keeps partial credit", () => {
  const q = table("kommen");
  const submitted = answers(q);
  submitted[1] = "kommt";
  assert.equal(gradeQuestion(submitted, q).rows[1].score, 0);
  submitted[1] = "komsmt";
  assert.equal(gradeQuestion(submitted, q).rows[1].score, 0.5);
  submitted[1] = "Kommst";
  assert.equal(gradeQuestion(submitted, q).rows[1].score, 0.75);
  const fahren = table("fahren");
  const fahrenInput = answers(fahren);
  fahrenInput[1] = "faehrst";
  assert.equal(gradeQuestion(fahrenInput, fahren).rows[1].score, 0.5);
});

test("separable, reflexive and exceptional verbs retain their full required forms", () => {
  assert.deepEqual(answers(table("sich freuen")), ["freue mich", "freust dich", "freut sich", "freuen uns", "freut euch", "freuen sich", "freuen sich"]);
  assert.equal(table("aussehen").rows[1].answers[0], "siehst aus");
  assert.equal(table("zuordnen").rows[4].answers[0], "ordnet zu");
  assert.equal(table("kennen lernen").rows[3].answers[0], "lernen kennen");
  assert.equal(table("da sein").rows[4].answers[0], "seid da");
  assert.equal(table("möchten").rows[2].answers[0], "möchte");
  assert.deepEqual(table("backen").rows[1].answers, ["backst", "bäckst"]);
  assert.deepEqual(table("sammeln").rows[0].answers, ["sammle", "sammele"]);
  const q = table("sich freuen");
  const submitted = answers(q);
  submitted[0] = "freue";
  assert.equal(gradeQuestion(submitted, q).rows[0].score, 0);
});
