import { foundationQuestions } from "./foundations.js";

export const grammarQuestions = [
  ...foundationQuestions,
  {
    id: "u2-grammar-compound-apfelsaft",
    unit: 2,
    topic: "Compound nouns",
    prompt: "Combine the nouns. Include the article.",
    cue: "der Apfel + der Saft",
    answers: ["der Apfelsaft"],
    tip: "The final noun controls the gender. Der Saft gives der Apfelsaft.",
    source: "Komposita, Übung 1"
  },
  {
    id: "u2-grammar-compound-rule",
    unit: 2,
    topic: "Compound nouns",
    prompt: "Which part determines the gender of a German compound noun?",
    cue: "das erste Wort / das letzte Wort",
    answers: ["das letzte Wort", "letzte Wort"],
    tip: "Read compounds from the right for their core meaning and gender.",
    source: "Komposita, Übung 3"
  },
  {
    id: "u2-grammar-nicht-japan",
    unit: 2,
    topic: "Negation with nicht",
    prompt: "Answer negatively with a complete sentence.",
    cue: "Kommst du aus Japan?",
    answers: ["Nein, ich komme nicht aus Japan."],
    tip: "Conjugate for ich, then place nicht before the phrase being negated.",
    source: "Negation mit nicht, Aufgabe 1"
  },
  {
    id: "u2-grammar-nicht-gern",
    unit: 2,
    topic: "Negation with nicht",
    prompt: "Answer negatively with a complete sentence.",
    cue: "Joggst du gern?",
    answers: ["Nein, ich jogge nicht gern."],
    tip: "To negate gern, put nicht directly before gern.",
    source: "Negation mit nicht, Aufgabe 6"
  },
  {
    id: "u3-grammar-article-limonade",
    unit: 3,
    topic: "Articles",
    prompt: "Fill in the indefinite article.",
    cue: "Ist das ___ Limonade?",
    answers: ["eine"],
    tip: "Limonade is feminine. Die Limonade takes eine Limonade.",
    source: "Bestimmter oder unbestimmter Artikel, 1b"
  },
  {
    id: "u3-grammar-article-orangensaft",
    unit: 3,
    topic: "Articles",
    prompt: "Fill in the definite article.",
    cue: "___ Orangensaft ist für Tisch fünf.",
    answers: ["Der"],
    tip: "Saft is masculine, so the compound Orangensaft is masculine too.",
    source: "Bestimmter oder unbestimmter Artikel, 1b"
  },
  {
    id: "u3-grammar-kein-plural",
    unit: 3,
    topic: "Negation with kein-",
    prompt: "Answer negatively with a complete sentence.",
    cue: "Sind das Tische? (They are chairs.)",
    answers: ["Nein, das sind keine Tische. Das sind Stühle."],
    tip: "Plural takes keine. The following plural noun still needs a capital letter.",
    source: "Negation mit kein-, Aufgabe 7"
  },
  {
    id: "u3-grammar-conjugation-nehmen",
    unit: 3,
    topic: "Verb conjugation",
    prompt: "Conjugate the verb for ihr.",
    cue: "ihr ___ (nehmen)",
    answers: ["nehmt"],
    tip: "For ihr, the regular ending is -t: nehm- + t.",
    source: "Verbkonjugation mit Übung, Teil I"
  },
  {
    id: "u3-grammar-conjugation-trinken",
    unit: 3,
    topic: "Verb conjugation",
    prompt: "Conjugate the verb for du.",
    cue: "du ___ (trinken)",
    answers: ["trinkst"],
    tip: "For du, use the ending -st: trink- + st.",
    source: "Verbkonjugation mit Übung, Teil I"
  },
  {
    id: "u3-grammar-conjugation-koennen",
    unit: 3,
    topic: "Verb conjugation",
    prompt: "Conjugate the modal verb for er/es/sie.",
    cue: "er ___ (können)",
    answers: ["kann"],
    tip: "können changes its stem vowel in the singular: er kann.",
    source: "Verbkonjugation mit Übung, Teil I"
  },
  {
    id: "u3-grammar-syntax-statement",
    unit: 3,
    topic: "Word order",
    prompt: "Build a statement. Keep time before place.",
    cue: "Felix / studieren / nächstes Jahr / in Heidelberg",
    answers: ["Felix studiert nächstes Jahr in Heidelberg."],
    tip: "The conjugated verb is second. After it, put time before place.",
    source: "Deutsche Syntax 1, Teil I, Übung 3"
  },
  {
    id: "u3-grammar-syntax-question",
    unit: 3,
    topic: "Word order",
    prompt: "Build a yes/no question.",
    cue: "Frieda / arbeiten / jetzt / im Café",
    answers: ["Arbeitet Frieda jetzt im Café?"],
    tip: "A yes/no question starts with the conjugated verb.",
    source: "Deutsche Syntax 1, Teil I, Übung 3"
  },
  {
    id: "u3-grammar-bracket",
    unit: 3,
    topic: "Bracket structure",
    prompt: "Build a statement from the parts.",
    cue: "ich / Filme sehen / morgen",
    answers: ["Ich sehe morgen Filme."],
    tip: "Conjugate sehen near the start; Filme closes the bracket at the end.",
    source: "Deutsche Syntax 1, Teil II, Übung 1"
  },
  {
    id: "u3-grammar-inversion",
    unit: 3,
    topic: "Inversion",
    prompt: "Start with \"Heute Abend\" and build the sentence.",
    cue: "Frau Schmidt / essen / im Restaurant",
    answers: ["Heute Abend isst Frau Schmidt im Restaurant."],
    tip: "When time comes first, the verb remains second and the subject moves after it.",
    source: "Deutsche Syntax 2, Übung 2"
  }
];
