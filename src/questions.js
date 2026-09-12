import { glossary } from "./data/glossary.js";
import { grammarQuestions } from "./data/grammar.js";

function withoutArticle(value) {
  return value.replace(/^(der|die|das)\s+/i, "");
}

function articleOf(value) {
  return value.match(/^(der|die|das)\b/i)?.[1] ?? "";
}

function englishAnswers(value) {
  const noNotes = value.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  const parts = noNotes.split(/\s*[;,/]\s*/).filter(Boolean);
  return [...new Set([value, noNotes, ...parts].filter(Boolean))];
}

function baseQuestion(entry, suffix, details) {
  return {
    id: `${entry.id}-${suffix}`,
    entryId: entry.id,
    unit: entry.unit,
    source: `Das Leben A1 glossary, Unit ${entry.unit}, row ${entry.sourceRow}`,
    example: entry.example,
    ...details
  };
}

function nounQuestions(entry) {
  const article = articleOf(entry.german);
  const noun = withoutArticle(entry.german);
  const plural = entry.pluralOrConjugation
    ? withoutArticle(entry.pluralOrConjugation)
    : "X";
  return [
    baseQuestion(entry, "singular", {
      category: "nouns",
      topic: "Noun: German singular",
      prompt: "Write the complete German singular, including the article.",
      cue: entry.english,
      answers: [entry.german],
      tip: "Learn every noun as one unit with der, die or das. German nouns begin with a capital letter."
    }),
    baseQuestion(entry, "article", {
      category: "nouns",
      topic: "Noun: article",
      prompt: "Type the definite article.",
      cue: `${noun} — ${entry.english}`,
      answers: [article],
      tip: "Say the article aloud with the noun instead of memorising the noun by itself."
    }),
    baseQuestion(entry, "plural", {
      category: "nouns",
      topic: "Noun: plural",
      prompt: "Type the plural noun only. Write X if the glossary gives no plural.",
      cue: `${entry.german} — ${entry.english}`,
      answers: [plural],
      tip: plural === "X"
        ? "The sample test uses X when a noun has no listed plural."
        : "All German plural nouns take die; this field asks only for the noun form."
    }),
    baseQuestion(entry, "english", {
      category: "nouns",
      topic: "Noun: meaning",
      prompt: "Give the English meaning.",
      cue: entry.german,
      answers: englishAnswers(entry.english),
      tip: `Recall the course example: ${entry.example}`
    })
  ];
}

function verbQuestions(entry) {
  const [subject = "er", ...formParts] = entry.pluralOrConjugation.split(" ");
  const conjugatedForm = formParts.join(" ");
  const questions = [
    baseQuestion(entry, "infinitive", {
      category: "verbs",
      topic: "Verb: infinitive",
      prompt: "Write the German infinitive.",
      cue: entry.english,
      answers: [entry.german],
      tip: "Use the infinitive for glossary recall, exactly as it appears in the course list."
    }),
    baseQuestion(entry, "english", {
      category: "verbs",
      topic: "Verb: meaning",
      prompt: "Give the English meaning.",
      cue: entry.german,
      answers: englishAnswers(entry.english),
      tip: `Recall the course example: ${entry.example}`
    })
  ];

  if (conjugatedForm) {
    questions.push(
      baseQuestion(entry, "conjugation", {
        category: "verbs",
        topic: "Verb: conjugation",
        prompt: `Conjugate for ${subject}. Type only the verb form.`,
        cue: `${subject} ___ (${entry.german})`,
        answers: [conjugatedForm],
        tip: `The glossary model is “${entry.pluralOrConjugation}”. Watch for stem changes.`
      })
    );
  }
  return questions;
}

function otherQuestions(entry) {
  return [
    baseQuestion(entry, "german", {
      category: "other",
      topic: "Other vocabulary: German",
      prompt: "Write the German word or phrase.",
      cue: entry.english,
      answers: [entry.german],
      tip: `Put it back into context: ${entry.example}`
    }),
    baseQuestion(entry, "english", {
      category: "other",
      topic: "Other vocabulary: meaning",
      prompt: "Give the English meaning.",
      cue: entry.german,
      answers: englishAnswers(entry.english),
      tip: `Put it back into context: ${entry.example}`
    })
  ];
}

export function buildQuestionPool(units, categories) {
  const unitSet = new Set(units.map(Number));
  const categorySet = new Set(categories);
  const questions = glossary
    .filter((entry) => unitSet.has(entry.unit))
    .flatMap((entry) => {
      if (entry.wordClass === "noun" && categorySet.has("nouns")) return nounQuestions(entry);
      if (entry.wordClass === "verb" && categorySet.has("verbs")) return verbQuestions(entry);
      if (entry.wordClass === "others" && categorySet.has("other")) return otherQuestions(entry);
      return [];
    });

  if (categorySet.has("grammar")) {
    questions.push(
      ...grammarQuestions
        .filter((question) => unitSet.has(question.unit))
        .map((question) => ({
          ...question,
          entryId: question.id,
          category: "grammar",
          example: ""
        }))
    );
  }
  return questions;
}

export function shuffled(values, random = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function createQuiz({ units, categories, size, weakEntryIds = [] }) {
  const pool = buildQuestionPool(units, categories);
  const weakSet = new Set(weakEntryIds);
  const weak = shuffled(pool.filter((question) => weakSet.has(question.entryId)));
  const regular = shuffled(pool.filter((question) => !weakSet.has(question.entryId)));
  const prioritized = [...weak, ...regular];
  return prioritized.slice(0, Math.min(Number(size), prioritized.length));
}

export { glossary };
