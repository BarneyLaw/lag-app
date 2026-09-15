import { glossary } from "./data/glossary.js";
import { grammarQuestions } from "./data/grammar.js";

function withoutArticle(value) {
  return value.replace(/^(der|die|das)\s+/i, "");
}

function articleOf(value) {
  return value.match(/^(der|die|das)\b/i)?.[1] ?? "";
}

function withEnglishDefiniteArticle(value) {
  return /^the\b/i.test(value) ? value : `the ${value}`;
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
  const pluralOnly = entry.german === "die Leute";
  const singular = pluralOnly ? "X" : entry.german;
  const plural = pluralOnly ? entry.german : entry.pluralOrConjugation || "X";
  const questions = [];

  if (!pluralOnly) {
    questions.push(baseQuestion(entry, "singular", {
      category: "nouns",
      format: "en-de",
      topic: "Noun: German form",
      prompt: "Write the complete German singular form, including the article.",
      cue: withEnglishDefiniteArticle(entry.english),
      answers: [singular],
      tip: "Learn every noun as one unit with der, die or das. German nouns begin with a capital letter."
    }));
    questions.push(baseQuestion(entry, "article", {
      category: "nouns",
      format: "article",
      topic: "Noun: article",
      prompt: "Type the definite article.",
      cue: `${withoutArticle(singular)}: ${entry.english}`,
      answers: [articleOf(singular)],
      tip: "Say the article aloud with the noun instead of memorising the noun by itself."
    }));
    questions.push(baseQuestion(entry, "english", {
      category: "nouns",
      format: "de-en",
      topic: "Noun: meaning",
      prompt: "Give the English meaning.",
      cue: singular,
      answers: englishAnswers(entry.english),
      tip: `Recall the course example: ${entry.example}`
    }));
  }

  questions.push(baseQuestion(entry, "plural", {
    category: "nouns",
    format: "en-de",
    topic: "Noun: German plural",
    prompt: "Write the complete German plural form, including die. Write X if there is no plural.",
    cue: withEnglishDefiniteArticle(entry.english),
    answers: [plural],
    tip: plural === "X"
      ? "The sample test uses X when a noun has no listed plural."
      : "German plural nouns use die. Learn the article and noun as one complete form."
  }));

  if (plural !== "X") {
    questions.push(baseQuestion(entry, "article-plural", {
      category: "nouns",
      format: "article",
      topic: "Noun: plural article",
      prompt: "Type the definite article for this plural noun.",
      cue: `${withoutArticle(plural)}: ${entry.english} (plural)`,
      answers: ["die"],
      tip: "Every German noun uses die in the plural."
    }));
    questions.push(baseQuestion(entry, "english-plural", {
      category: "nouns",
      format: "de-en",
      topic: "Noun: plural meaning",
      prompt: "Give the English meaning.",
      cue: plural,
      answers: englishAnswers(entry.english),
      tip: `Recall the course example: ${entry.example}`
    }));
  }

  questions.push(baseQuestion(entry, "full", {
    category: "nouns",
    format: "en-de-pair",
    topic: "Noun: singular and plural",
    prompt: "Write the singular and plural forms with their articles. Separate them with a comma.",
    cue: withEnglishDefiniteArticle(entry.english),
    answers: [
      `${singular}, ${plural}`,
      `${singular},${plural}`,
      `${singular}; ${plural}`,
      `${singular};${plural}`
    ],
    tip: "The sample test checks the article, singular noun, and plural noun together. Use X for a missing form."
  }));
  return questions;
}

function verbQuestions(entry) {
  return [
    baseQuestion(entry, "infinitive", {
      category: "verbs",
      format: "en-de",
      topic: "Verb: infinitive",
      prompt: "Write the German infinitive.",
      cue: entry.english,
      answers: [entry.german],
      tip: "Use the infinitive for glossary recall, exactly as it appears in the course list."
    }),
    baseQuestion(entry, "english", {
      category: "verbs",
      format: "de-en",
      topic: "Verb: meaning",
      prompt: "Give the English meaning.",
      cue: entry.german,
      answers: englishAnswers(entry.english),
      tip: `Recall the course example: ${entry.example}`
    })
  ];
}

function otherQuestions(entry) {
  return [
    baseQuestion(entry, "german", {
      category: "other",
      format: "en-de",
      topic: "Other vocabulary: German",
      prompt: "Write the German word or phrase.",
      cue: entry.english,
      answers: [entry.german],
      tip: `Put it back into context: ${entry.example}`
    }),
    baseQuestion(entry, "english", {
      category: "other",
      format: "de-en",
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
          format: "grammar",
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

function groupQuestionsByEntry(questions) {
  const grouped = new Map();
  questions.forEach((question) => {
    if (!grouped.has(question.entryId)) {
      grouped.set(question.entryId, {
        entryId: question.entryId,
        unit: question.unit,
        category: question.category,
        questions: []
      });
    }
    grouped.get(question.entryId).questions.push(question);
  });
  return [...grouped.values()];
}

function allocateByCategory(groups, count, random) {
  const buckets = new Map();
  groups.forEach((group) => {
    if (!buckets.has(group.category)) buckets.set(group.category, []);
    buckets.get(group.category).push(group);
  });

  const categories = shuffled([...buckets.keys()], random);
  const allocations = new Map(categories.map((category) => [category, 0]));
  for (let slot = 0; slot < count; slot += 1) {
    const available = categories.filter(
      (category) => allocations.get(category) < buckets.get(category).length
    );
    const category = available.reduce((best, candidate) => {
      const bestFraction = allocations.get(best) / buckets.get(best).length;
      const candidateFraction = allocations.get(candidate) / buckets.get(candidate).length;
      return candidateFraction < bestFraction ? candidate : best;
    });
    allocations.set(category, allocations.get(category) + 1);
  }
  return { allocations, buckets };
}

function selectEntryCycle(groups, count, entryStats, weakEntryIds, random) {
  const weakSet = new Set(weakEntryIds);
  const { allocations, buckets } = allocateByCategory(groups, count, random);
  const selected = [];

  allocations.forEach((allocation, category) => {
    const candidates = shuffled(buckets.get(category), random);
    candidates.sort((left, right) => {
      const leftStats = entryStats[left.entryId] || {};
      const rightStats = entryStats[right.entryId] || {};
      const leftAttempts = leftStats.attempts || 0;
      const rightAttempts = rightStats.attempts || 0;
      const leftPriority = leftAttempts === 0 ? 0 : weakSet.has(left.entryId) ? 1 : 2;
      const rightPriority = rightAttempts === 0 ? 0 : weakSet.has(right.entryId) ? 1 : 2;
      return leftPriority - rightPriority || leftAttempts - rightAttempts;
    });
    selected.push(...candidates.slice(0, allocation));
  });
  return shuffled(selected, random);
}

function selectQuestionVariant(group, usedQuestionIds, questionStats, random) {
  const candidates = shuffled(
    group.questions.filter((question) => !usedQuestionIds.has(question.id)),
    random
  );
  candidates.sort((left, right) =>
    (questionStats[left.id]?.attempts || 0) - (questionStats[right.id]?.attempts || 0)
  );
  return candidates[0];
}

function interleaveQuestions(questions, random) {
  const remaining = shuffled(questions, random);
  const result = [];

  while (remaining.length) {
    const recentEntryIds = new Set(result.slice(-3).map((question) => question.entryId));
    const previous = result.at(-1);
    let bestIndex = 0;
    let bestPenalty = Number.POSITIVE_INFINITY;

    remaining.forEach((question, index) => {
      const penalty = (recentEntryIds.has(question.entryId) ? 100 : 0)
        + (previous?.category === question.category ? 4 : 0)
        + (previous?.format === question.format ? 2 : 0)
        + (previous?.unit === question.unit ? 1 : 0);
      if (penalty < bestPenalty) {
        bestIndex = index;
        bestPenalty = penalty;
      }
    });
    result.push(remaining.splice(bestIndex, 1)[0]);
  }
  return result;
}

export function createQuiz({
  units,
  categories,
  size,
  weakEntryIds = [],
  entryStats = {},
  questionStats = {},
  random = Math.random
}) {
  const pool = buildQuestionPool(units, categories);
  const groups = groupQuestionsByEntry(pool);
  const requestedSize = Math.min(Number(size), pool.length);
  const usedQuestionIds = new Set();
  const selected = [];

  while (selected.length < requestedSize) {
    const availableGroups = groups.filter((group) =>
      group.questions.some((question) => !usedQuestionIds.has(question.id))
    );
    if (!availableGroups.length) break;

    const cycleSize = Math.min(requestedSize - selected.length, availableGroups.length);
    const cycle = selectEntryCycle(
      availableGroups,
      cycleSize,
      entryStats,
      weakEntryIds,
      random
    );
    cycle.forEach((group) => {
      const question = selectQuestionVariant(group, usedQuestionIds, questionStats, random);
      usedQuestionIds.add(question.id);
      selected.push(question);
    });
  }

  return interleaveQuestions(selected, random);
}

export { glossary };
