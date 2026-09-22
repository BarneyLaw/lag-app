/**
 * Randomized Semester Test 1 practice, not a timed replica or official marking scheme.
 * II.A-E follow German1_ST1_SamplePaper and its solution key. Ambiguous tasks are
 * constrained in the prompt (article type, pronoun, given name, sentence opening).
 * Reading passages below are original, level-appropriate adaptations of III.
 * `unit` is the chapter required for the task, not the first occurrence of a word.
 * Shared audio/passage family IDs prevent one stimulus revealing another answer.
 */
const questions = [];
const paper = "German1_ST1_SamplePaper.pdf and German1_ST1_SamplePaper_LS.pdf";
function add(key, unit, section, prompt, cue, answers, tip, reference, extra = {}) {
  questions.push({ id: `st1-${key}`, unit, section, topic: `Semester test: ${section}`,
    prompt, cue, answers: Array.isArray(answers) ? answers : [answers], tip,
    source: `${paper}, ${reference}`, ...extra });
}

[
  ["name-1", "names", 1, "Maik"],
  ["name-2", "names", 2, "Jan Grabowski"],
  ["phone-1", "phones", 1, "285476"],
  ["phone-2", "phones", 2, "0170212378"]
].forEach(([id, kind, number, answer]) => add(id, 0, "Listening",
  kind === "names" ? "Listen and write the requested name. Use capital letters for names."
    : "Listen and write the requested telephone number. Keep any leading zero.",
  `${kind === "names" ? "Name" : "Telephone number"} ${number} in the recording`, answer,
  kind === "names" ? "Listen for the individual letters, then assemble the name."
    : "Write down each digit as you hear it. Spaces between groups are optional.",
  kind === "names" ? `I.A.${number}, p. 1` : `I.B.${number}, p. 1`,
  { audio: `/src/audio/st1-${kind}.mp3`, familyId: `st1-audio-${kind}`,
    answerKind: kind === "phones" ? "phone" : "text" }));

[
  ["opernhaus", "___ Opernhaus ist schon über 200 Jahre alt. (definite)", "Das", "Opernhaus is a neuter subject: das.", "1"],
  ["text", "Bitte lesen Sie ___ Text auf Seite 12. (definite)", "den", "Text is a masculine direct object: den Text.", "2"],
  ["postkarte", "Sie schreibt ___ Postkarte. (indefinite)", "eine", "Postkarte is feminine; the accusative indefinite article is eine.", "3"],
  ["woerterbuch", "Haben Sie ___ Wörterbuch? (indefinite)", "ein", "Wörterbuch is neuter; ein stays ein in the accusative.", "4"],
  ["chinesisch", "Sprechen Sie ___ Chinesisch?", "X", "Language names after sprechen normally have no article.", "5"],
  ["kuchen", "___ Kuchen von Frau Bauer sind immer so lecker! (definite)", "Die", "sind identifies a plural subject: die Kuchen.", "6"]
].forEach(([id, cue, answer, tip, number]) => add(`article-${id}`, 4, "Articles",
  "Fill in the article in nominative or accusative. Write X if no article is needed.", cue,
  answer === "X" ? ["X", "x"] : answer, tip, `II.A.${number}, pp. 1-2`));

const verbBank = "arbeiten, haben, lesen, möchten, mögen, sammeln, sein, studieren";
add("verb-bank", 4, "Conjugation",
  "Fill all six blanks in order. Separate answers with commas. Use each verb once; two verbs do not fit.",
  "Mein Cousin ___ gern Radiergummis.\n___ du jeden Tag? Nein, ich ___ viel, ich ___ wenig Zeit.\n___ ihr eine Vier-Käse-Pizza?\nWoher ___ die Studierenden?",
  "sammelt, Liest, arbeite, habe, Möchtet, sind",
  "The subjects require er sammelt, du liest, ich arbeite/habe, ihr möchtet, and plural sind. mögen and studieren are unused.",
  "II.B, p. 2", { context: `Verb bank: ${verbBank}`, answerKind: "list" });

[
  ["come", 1, "Woher ___ ihr? (kommen)", "kommt", "ihr takes -t."],
  ["read", 1, "Er ___ den Text. (lesen)", "liest", "lesen changes e to ie with du and er/sie/es."],
  ["work", 3, "Du ___ im Café. (arbeiten)", "arbeitest", "Add -est after the stem arbeit-."],
  ["have", 3, "Er ___ wenig Zeit. (haben)", "hat", "haben is irregular: du hast, er hat."],
  ["eat", 4, "Was ___ du gern? (essen)", "isst", "essen changes e to i in du isst."],
  ["like", 4, "___ ihr Oliven? (mögen)", "Mögt", "The plural keeps ö: ihr mögt."],
  ["take", 4, "Was ___ sie? (nehmen; she)", "nimmt", "nehmen has the irregular singular stem nimm-."],
  ["be", 1, "Woher ___ Sie, Frau Bach? (sein)", "sind", "Formal Sie takes sind."]
].forEach(([id, unit, cue, answer, tip]) => add(`verb-${id}`, unit, "Conjugation",
  "Fill in the conjugated verb.", cue, answer, tip,
  "II.B format, original practice; Das Leben A1, Units 1, 3-4"));

[
  ["origin", 1, "Ask Marisa and Antonio where they come from, using ihr. Start with Woher; omit their names.",
    "Wir kommen aus Chile.", "Woher kommt ihr?", "An origin question starts with Woher; ihr takes kommt.", "1"],
  ["korean", 1, "Write a yes/no question using du. Ask whether the person speaks Korean.",
    "Ja, ich spreche etwas Koreanisch.", ["Sprichst du Koreanisch?", "Sprichst du etwas Koreanisch?"], "Start with Sprichst, then du.", "2"],
  ["identity", 1, "Write a yes/no question asking whether that is Frau Müller. Start with Ist.",
    "Nein, das ist Frau Möller.", "Ist das Frau Müller?", "A yes/no question begins with the conjugated verb.", "3"],
  ["subject", 2, "Ask what Sarah studies. Use her name and start with Was.",
    "Sarah? Sie studiert Musik.", "Was studiert Sarah?", "The question word comes first, followed by the verb and the subject.", "4"]
].forEach(([id, unit, prompt, cue, answers, tip, number]) => add(`question-${id}`, unit, "Questions",
  `${prompt} Include the question mark.`, cue, answers, tip, `II.C.${number}, p. 2`));

[
  ["questions", 4, "Haben Sie Fragen? (answer as ich)", "Nein, ich habe keine Fragen.", "Plural questions take keine.", "1"],
  ["glasses", 3, "Ist das die Brille von Martin? (use das)", "Nein, das ist nicht die Brille von Martin.", "A noun phrase with a definite article is negated with nicht.", "2"],
  ["campus", 2, "Wohnt ihr auf dem Campus? (answer as wir)", "Nein, wir wohnen nicht auf dem Campus.", "Negate the location with nicht before auf dem Campus.", "3"],
  ["garden", 4, "Hat das Haus einen Garten? (use das Haus)", "Nein, das Haus hat keinen Garten.", "The masculine accusative einen becomes keinen.", "4"],
  ["swimming", 2, "Schwimmst du gern? (answer as ich)", "Nein, ich schwimme nicht gern.", "Put nicht before gern and conjugate for ich.", "5"]
].forEach(([id, unit, cue, answer, tip, number]) => add(`negation-${id}`, unit, "Negation",
  "Write the complete negative answer, beginning with Nein, and ending with a full stop.",
  cue, answer, tip, `II.D.${number}, p. 3`));

[
  ["shanghai", 3, "Seit", "in / leben / Shanghai / 2016 / Paul / Lena / und",
    ["Seit 2016 leben Paul und Lena in Shanghai.", "Seit 2016 leben Lena und Paul in Shanghai."], "The whole phrase Seit 2016 occupies position one; leben stays second.", "1"],
  ["pilot", 3, "Der", "nach / fliegen / Winter / London / Pilot / im",
    "Der Pilot fliegt im Winter nach London.", "Use fliegt for the singular pilot; put time before place.", "2"],
  ["dog", 2, "Wie", "heißen / Hund / Maria / von / der",
    "Wie heißt der Hund von Maria?", "The singular subject der Hund takes heißt.", "3"],
  ["basketball", 3, "Beate", "Wochenende / am / Basketball / spielen",
    "Beate spielt am Wochenende Basketball.", "Conjugate spielen for Beate and keep Basketball at the end.", "4"]
].forEach(([id, unit, opening, cue, answers, tip, number]) => add(`syntax-${id}`, unit, "Syntax",
  `Write the complete sentence beginning with ${opening}. Conjugate the verb and include punctuation.`,
  cue, answers, tip, `II.E.${number}, p. 3`));

// Original passages keep reading practice inside the selected chapter's language.
const readings = [
  { key: "course", unit: 1, text: "Anna kommt aus Österreich und wohnt in Leipzig. Sie spricht Deutsch und Englisch.\nBen kommt aus Singapur und wohnt in Berlin. Er lernt Deutsch.\nClara kommt aus der Schweiz und wohnt in Leipzig. Sie spricht Französisch und Deutsch.",
    tasks: [
      ["origin", "Wer kommt aus Singapur?", ["Ben"], "Ben comes from Singapore; his residence is Berlin."],
      ["city", "Wer wohnt in Leipzig?", ["Anna", "Clara"], "Both Anna and Clara live in Leipzig. Check every profile."],
      ["absent", "Wer wohnt in Wien?", ["Niemand"], "Austria is Anna's origin, but she lives in Leipzig. Nobody lives in Vienna."]
    ] },
  { key: "post", unit: 2, text: "Lena wohnt in Berlin. Ihre Adresse ist Gartenstraße 12. Ihre Postleitzahl ist 10115.\nTom wohnt in Hamburg. Seine Adresse ist Hafenstraße 8. Seine Postleitzahl ist 20457.\nMia wohnt auch in Hamburg, aber in der Gartenstraße 3.",
    tasks: [
      ["city", "Wer wohnt in Hamburg?", ["Tom", "Mia"], "Tom and Mia both live in Hamburg, at different addresses."],
      ["postcode", "Wer hat die Postleitzahl 10115?", ["Lena"], "Match the postcode to Lena's profile."],
      ["street", "Wer wohnt in der Gartenstraße?", ["Lena", "Mia"], "The same street name occurs in two cities. Include both people."]
    ] },
  { key: "cafe", unit: 3, text: "Nora arbeitet im Café. Sie trinkt gern Tee, aber keinen Kaffee.\nTim studiert Musik. Er arbeitet nicht im Café und trinkt gern Orangensaft.\nAli arbeitet auch im Café. Er trinkt gern Kaffee.",
    tasks: [
      ["work", "Wer arbeitet im Café?", ["Nora", "Ali"], "Tim does not work in the café; Nora and Ali do."],
      ["drink", "Wer trinkt gern Orangensaft?", ["Tim"], "Tim's preferred drink is orange juice."],
      ["study", "Wer studiert Musik?", ["Tim"], "The text states that Tim studies music."]
    ] },
  { key: "restaurant", unit: 4, text: "Emma isst vegetarisch. Sie bestellt einen Salat mit Tomaten, aber ohne Käse.\nMax nimmt einen Hamburger mit Pommes. Er mag kein Gemüse.\nLina bestellt eine Tomatensuppe mit Baguette. Sie mag keinen Fisch.",
    tasks: [
      ["vegetarian", "Wer isst vegetarisch?", ["Emma"], "Only Emma is explicitly described as vegetarian. Do not infer it from one order."],
      ["soup", "Wer bestellt eine Suppe?", ["Lina"], "Lina orders tomato soup with baguette."],
      ["fish", "Wer bestellt Fisch?", ["Niemand"], "No order includes fish; Lina explicitly does not like it."]
    ] }
];
for (const passage of readings) {
  for (const [key, cue, answers, tip] of passage.tasks) {
    add(`reading-${passage.key}-${key}`, passage.unit, "Reading",
      "Read the profiles. Write all matching names separated by commas, or Niemand if nobody matches.",
      cue, [answers.join(", ")], tip,
      "III, p. 4 format; original passage using Units 0-4 vocabulary",
      { context: passage.text, familyId: `st1-reading-${passage.key}`, answerKind: "name-set" });
  }
}

export const semesterQuestions = questions;
