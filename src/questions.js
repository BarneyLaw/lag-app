import { glossary } from "./data/glossary.js";
import { grammarQuestions } from "./data/grammar.js";

function withoutArticle(value) {
  return value.replace(/^(der|die|das)\s+/i, "");
}

function articleOf(value) {
  return value.match(/^(der|die|das)\b/i)?.[1] ?? "";
}

function buildVocabularyFamilyIds(entries) {
  const familyIds = new Map(entries.map((entry) => [entry.id, entry.id]));
  const nouns = entries.filter((entry) => entry.wordClass === "noun");

  nouns.forEach((feminine) => {
    const feminineNoun = withoutArticle(feminine.german);
    if (!feminineNoun.endsWith("in")) return;
    const feminineStem = feminineNoun.slice(0, -2).toLocaleLowerCase("de-DE");
    const masculine = nouns.find((candidate) => {
      if (candidate.unit !== feminine.unit || candidate.id === feminine.id) return false;
      const candidateNoun = withoutArticle(candidate.german).toLocaleLowerCase("de-DE");
      return candidateNoun === feminineStem || candidateNoun.replace(/e$/, "") === feminineStem;
    });
    if (!masculine) return;
    const familyId = `family:${masculine.id}`;
    familyIds.set(masculine.id, familyId);
    familyIds.set(feminine.id, familyId);
  });
  return familyIds;
}

const VOCABULARY_FAMILY_IDS = buildVocabularyFamilyIds(glossary);

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
    familyId: VOCABULARY_FAMILY_IDS.get(entry.id),
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
          familyId: question.id,
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
        familyId: question.familyId,
        unit: question.unit,
        category: question.category,
        questions: []
      });
    }
    grouped.get(question.entryId).questions.push(question);
  });
  return [...grouped.values()];
}

function groupEntriesByFamily(entries) {
  const grouped = new Map();
  entries.forEach((entry) => {
    if (!grouped.has(entry.familyId)) {
      grouped.set(entry.familyId, {
        familyId: entry.familyId,
        unit: entry.unit,
        category: entry.category,
        entries: []
      });
    }
    grouped.get(entry.familyId).entries.push(entry);
  });
  return [...grouped.values()];
}

function allocateByCategory(families, count, random) {
  const buckets = new Map();
  families.forEach((family) => {
    if (!buckets.has(family.category)) buckets.set(family.category, []);
    buckets.get(family.category).push(family);
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

function familySelectionMetrics(family, entryStats, currentAttempt, recentWindow) {
  const stats = family.entries.map((entry) => entryStats[entry.entryId] || {});
  const totalAttempts = stats.reduce((sum, item) => sum + (item.attempts || 0), 0);
  const hasUnseenMember = stats.some((item) => !(item.attempts || 0));
  const lastSeenAt = Math.max(0, ...stats.map((item) => item.lastSeenAt || 0));
  const recentlySeen = totalAttempts > 0 && currentAttempt - lastSeenAt < recentWindow;
  const priority = totalAttempts === 0
    ? 0
    : recentlySeen
      ? 3
      : hasUnseenMember
        ? 1
        : 2;
  return { priority, lastSeenAt, totalAttempts };
}

function selectFamilySet(
  families,
  count,
  entryStats,
  currentAttempt,
  recentWindow,
  random
) {
  const { allocations, buckets } = allocateByCategory(families, count, random);
  const selected = [];

  allocations.forEach((allocation, category) => {
    const candidates = shuffled(buckets.get(category), random);
    candidates.sort((left, right) => {
      const leftMetrics = familySelectionMetrics(
        left, entryStats, currentAttempt, recentWindow
      );
      const rightMetrics = familySelectionMetrics(
        right, entryStats, currentAttempt, recentWindow
      );
      return leftMetrics.priority - rightMetrics.priority
        || leftMetrics.lastSeenAt - rightMetrics.lastSeenAt
        || leftMetrics.totalAttempts - rightMetrics.totalAttempts;
    });
    selected.push(...candidates.slice(0, allocation));
  });
  return shuffled(selected, random);
}

function selectEntryFromFamily(family, entryStats, random) {
  const candidates = shuffled(family.entries, random);
  candidates.sort((left, right) => {
    const leftStats = entryStats[left.entryId] || {};
    const rightStats = entryStats[right.entryId] || {};
    return (leftStats.attempts || 0) - (rightStats.attempts || 0)
      || (leftStats.lastSeenAt || 0) - (rightStats.lastSeenAt || 0);
  });
  return candidates[0];
}

function selectQuestionVariant(group, questionStats, random) {
  const candidates = shuffled(group.questions, random);
  candidates.sort((left, right) =>
    (questionStats[left.id]?.attempts || 0) - (questionStats[right.id]?.attempts || 0)
      || (questionStats[left.id]?.lastSeenAt || 0) - (questionStats[right.id]?.lastSeenAt || 0)
  );
  return candidates[0];
}

function interleaveQuestions(questions, random) {
  const remaining = shuffled(questions, random);
  const result = [];

  while (remaining.length) {
    const recentFamilyIds = new Set(result.slice(-3).map((question) => question.familyId));
    const previous = result.at(-1);
    let bestIndex = 0;
    let bestPenalty = Number.POSITIVE_INFINITY;

    remaining.forEach((question, index) => {
      const penalty = (recentFamilyIds.has(question.familyId) ? 100 : 0)
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
  entryStats = {},
  questionStats = {},
  currentAttempt = 0,
  recentWindow = 40,
  random = Math.random
}) {
  const pool = buildQuestionPool(units, categories);
  const entries = groupQuestionsByEntry(pool);
  const families = groupEntriesByFamily(entries);
  const requestedSize = Math.min(Number(size), families.length);
  const selectedFamilies = selectFamilySet(
    families,
    requestedSize,
    entryStats,
    currentAttempt,
    recentWindow,
    random
  );
  const selected = selectedFamilies.map((family) => {
    const entry = selectEntryFromFamily(family, entryStats, random);
    return selectQuestionVariant(entry, questionStats, random);
  });

  return interleaveQuestions(selected, random);
}

export { glossary };
