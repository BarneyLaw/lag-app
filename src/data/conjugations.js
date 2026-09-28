import { glossary } from "./glossary.js?v=7";

// Reviewed against the Unit 0–4 glossary, Verben_Einheit0-Einheit4,
// E1/E2–E3 conjugation solutions and the syntax/negation worksheets.
// Six forms are stored in the usual person order; sie and formal Sie get
// separate exercise rows, as in the E1 conjugation worksheet.
export const conjugationPersons = ["ich", "du", "er / sie / es", "wir", "ihr", "sie (they)", "Sie (formal)"];

const regularTip = "Use the present-tense endings -e, -st, -t, -en, -t, -en. Plural sie and formal Sie use the same verb form.";
const dentalTip = "Add e before -st and -t after this stem: du -est, er/sie/es -et, ihr -et.";
const sibilantTip = "After s, ß or z, du takes -t rather than another s. The du and er/sie/es forms match.";
const vowelTip = "The stem vowel changes with du and er/sie/es. The plural forms keep the infinitive stem.";
const listSource = "Verben_Einheit0-Einheit4, pp. 1–2";
const e1Source = "E1 Verben (solutions), p. 1";
const syntaxSource = "E3 Deutsche Syntax 1 (solutions)";

// Additional verbs explicitly present in the course list or worksheet tasks.
// List-only additions use Unit 4, the scope of the cumulative list; other
// additions use the worksheet's chapter. Glossary verbs keep glossary units.
const supplements = {
  "begrüßen": [1, "greet", e1Source],
  "spielen": [1, "play", "E1 Verbkonjugation mit Übung (solutions), I"],
  "stehen": [1, "stand", e1Source],
  "fahren": [1, "travel / drive", "Unregelmässige Verben (solutions), B–D"],
  "tanzen": [4, "dance", listSource],
  "kosten": [4, "cost", listSource],
  "treffen": [3, "meet", `${syntaxSource}, II.1.4; ${listSource}`],
  "helfen": [4, "help", `${listSource}, können example`],
  "joggen": [2, "jog", "Negation mit nicht (solutions), 6"],
  "backen": [3, "bake", `${syntaxSource}, I.3.4`],
  "sehen": [3, "see / watch", `${syntaxSource}, II.1.1`],
  "schmecken": [4, "taste", "E4 Im Restaurant (solutions), 4.8"],
  "beginnen": [4, "begin", "E4 Negation nicht/kein- (solutions), 15"],
  "liegen": [1, "lie / be situated", "Verrückte Verben (solutions), Rosa Garcia text"]
};

// Explicit forms make irregularities and accepted alternatives reviewable.
// A slash separates accepted alternatives within ONE person, never persons.
const forms = [
  ["sein", "bin|bist|ist|sind|seid|sind", "sein is irregular. Learn all six forms: bin, bist, ist, sind, seid, sind."],
  ["da sein", "bin da|bist da|ist da|sind da|seid da|sind da", "Conjugate sein and keep da after it. Include both words in each row."],
  ["telefonieren", "telefoniere|telefonierst|telefoniert|telefonieren|telefoniert|telefonieren"],
  ["schreiben", "schreibe|schreibst|schreibt|schreiben|schreibt|schreiben"],
  ["heißen", "heiße|heißt|heißt|heißen|heißt|heißen", sibilantTip],
  ["können", "kann|kannst|kann|können|könnt|können", "können has kann- in the singular, without an ending for ich and er/sie/es. The plural keeps ö."],
  ["buchstabieren", "buchstabiere|buchstabierst|buchstabiert|buchstabieren|buchstabiert|buchstabieren"],
  ["wiederholen", "wiederhole|wiederholst|wiederholt|wiederholen|wiederholt|wiederholen", "wiederholen (repeat) stays together when conjugated; it does not split off wieder."],
  ["verstehen", "verstehe|verstehst|versteht|verstehen|versteht|verstehen"],
  ["haben", "habe|hast|hat|haben|habt|haben", "haben loses b with du and er/sie/es: hast, hat. Keep b in habe, haben and habt."],
  ["sprechen", "spreche|sprichst|spricht|sprechen|sprecht|sprechen", vowelTip],
  ["lesen", "lese|liest|liest|lesen|lest|lesen", "lesen changes e to ie with du and er/sie/es: liest. The ihr form is lest."],
  ["ordnen", "ordne|ordnest|ordnet|ordnen|ordnet|ordnen", "The stem ordn- needs an extra e: ordnest, ordnet. Keep ordnen for wir, sie and Sie."],
  ["hören", "höre|hörst|hört|hören|hört|hören"],
  ["machen", "mache|machst|macht|machen|macht|machen"],
  ["ergänzen", "ergänze|ergänzt|ergänzt|ergänzen|ergänzt|ergänzen", sibilantTip],
  ["zuordnen", "ordne zu|ordnest zu|ordnet zu|ordnen zu|ordnet zu|ordnen zu", "zuordnen is separable: conjugate ordnen and put zu after it. Include both words."],
  ["fragen", "frage|fragst|fragt|fragen|fragt|fragen"],
  ["antworten", "antworte|antwortest|antwortet|antworten|antwortet|antworten", dentalTip],
  ["markieren", "markiere|markierst|markiert|markieren|markiert|markieren"],
  ["sammeln", "sammle/sammele|sammelst|sammelt|sammeln|sammelt|sammeln", "ich sammle (also sammele) drops an e from the usual pattern. The plural is sammeln, not sammelen."],
  ["kommen", "komme|kommst|kommt|kommen|kommt|kommen"],
  ["lernen", "lerne|lernst|lernt|lernen|lernt|lernen"],
  ["wohnen", "wohne|wohnst|wohnt|wohnen|wohnt|wohnen"],
  ["leben", "lebe|lebst|lebt|leben|lebt|leben"],
  ["sagen", "sage|sagst|sagt|sagen|sagt|sagen"],
  ["mögen", "mag|magst|mag|mögen|mögt|mögen", "mögen has mag- in the singular, without an ending for ich and er/sie/es. The plural keeps ö."],
  ["geben", "gebe|gibst|gibt|geben|gebt|geben", "geben means to give. It changes e to i with du and er/sie/es. The course phrase es gibt (there is/are) always uses gibt."],
  ["arbeiten", "arbeite|arbeitest|arbeitet|arbeiten|arbeitet|arbeiten", dentalTip],
  ["studieren", "studiere|studierst|studiert|studieren|studiert|studieren"],
  ["kennen lernen", "lerne kennen|lernst kennen|lernt kennen|lernen kennen|lernt kennen|lernen kennen", "Conjugate lernen and put kennen after it in these main-clause forms. Include both words."],
  ["brauchen", "brauche|brauchst|braucht|brauchen|braucht|brauchen"],
  ["gehen", "gehe|gehst|geht|gehen|geht|gehen"],
  ["möchten", "möchte|möchtest|möchte|möchten|möchtet|möchten", "The polite would-like form comes from mögen (Konjunktiv II). ich and er/sie/es both use möchte; ihr uses möchtet."],
  ["trinken", "trinke|trinkst|trinkt|trinken|trinkt|trinken"],
  ["nehmen", "nehme|nimmst|nimmt|nehmen|nehmt|nehmen", "nehmen changes nehm- to nimm- with du and er/sie/es. The ihr form is nehmt."],
  ["bestellen", "bestelle|bestellst|bestellt|bestellen|bestellt|bestellen"],
  ["schicken", "schicke|schickst|schickt|schicken|schickt|schicken"],
  ["zahlen", "zahle|zahlst|zahlt|zahlen|zahlt|zahlen"],
  ["freuen", "freue mich|freust dich|freut sich|freuen uns|freut euch|freuen sich", "Include the reflexive pronoun: mich, dich, sich, uns, euch, sich. The glossary teaches sich freuen."],
  ["essen", "esse|isst|isst|essen|esst|essen", "essen changes e to i with du and er/sie/es: isst. The ihr form is esst."],
  ["aussehen", "sehe aus|siehst aus|sieht aus|sehen aus|seht aus|sehen aus", "Conjugate sehen (du siehst, er sieht) and put the separable prefix aus after it. Include both words."],
  ["fotografieren", "fotografiere|fotografierst|fotografiert|fotografieren|fotografiert|fotografieren"],
  ["posten", "poste|postest|postet|posten|postet|posten", dentalTip],
  ["nerven", "nerve|nervst|nervt|nerven|nervt|nerven"],
  ["finden", "finde|findest|findet|finden|findet|finden", dentalTip],
  ["glauben", "glaube|glaubst|glaubt|glauben|glaubt|glauben"],
  ["wissen", "weiß|weißt|weiß|wissen|wisst|wissen", "wissen uses weiß- in the singular: weiß, weißt, weiß. In the plural use wissen and wisst."],
  ["stimmen", "stimme|stimmst|stimmt|stimmen|stimmt|stimmen"],
  ["kennen", "kenne|kennst|kennt|kennen|kennt|kennen"],
  ["lieben", "liebe|liebst|liebt|lieben|liebt|lieben"],
  ["probieren", "probiere|probierst|probiert|probieren|probiert|probieren"],
  ["begrüßen", "begrüße|begrüßt|begrüßt|begrüßen|begrüßt|begrüßen", sibilantTip],
  ["spielen", "spiele|spielst|spielt|spielen|spielt|spielen"],
  ["stehen", "stehe|stehst|steht|stehen|steht|stehen"],
  ["fahren", "fahre|fährst|fährt|fahren|fahrt|fahren", vowelTip],
  ["tanzen", "tanze|tanzt|tanzt|tanzen|tanzt|tanzen", sibilantTip],
  ["kosten", "koste|kostest|kostet|kosten|kostet|kosten", dentalTip],
  ["treffen", "treffe|triffst|trifft|treffen|trefft|treffen", vowelTip],
  ["helfen", "helfe|hilfst|hilft|helfen|helft|helfen", vowelTip],
  ["joggen", "jogge|joggst|joggt|joggen|joggt|joggen"],
  ["backen", "backe|backst/bäckst|backt/bäckt|backen|backt|backen", "Both backst/bäckst and backt/bäckt are accepted in the singular. The worksheet uses er backt; ihr is always backt."],
  ["sehen", "sehe|siehst|sieht|sehen|seht|sehen", "sehen changes e to ie with du and er/sie/es: siehst, sieht. The ihr form is seht."],
  ["schmecken", "schmecke|schmeckst|schmeckt|schmecken|schmeckt|schmecken"],
  ["beginnen", "beginne|beginnst|beginnt|beginnen|beginnt|beginnen"],
  ["liegen", "liege|liegst|liegt|liegen|liegt|liegen"]
];

const lemma = (value) => value.replace(/\s*\([^)]*\)/g, "").trim();
const slug = (value) => value.replaceAll("ä", "ae").replaceAll("ö", "oe").replaceAll("ü", "ue")
  .replaceAll("ß", "ss").replaceAll(" ", "-");

export const conjugationQuestions = forms.map(([verb, encoded, tip = regularTip]) => {
  const entries = glossary.filter((entry) => entry.wordClass === "verb" && lemma(entry.german) === verb);
  const supplement = supplements[verb];
  const unit = entries.length ? Math.min(...entries.map((entry) => entry.unit)) : supplement[0];
  const english = verb === "geben" ? "give (course phrase: es gibt = there is / are)"
    : entries[0]?.english || supplement[1];
  const displayVerb = verb === "freuen" ? "sich freuen" : verb;
  const sixForms = encoded.split("|").map((value) => value.split("/"));
  const rows = [...sixForms, sixForms[5]].map((answers, index) => ({ person: conjugationPersons[index], answers }));
  return {
    id: `conjugation-${slug(verb)}`,
    unit, verb: displayVerb, glossaryIds: entries.map((entry) => entry.id), rows,
    topic: "Conjugation table",
    prompt: verb === "möchten" ? "Complete the table for möchten (would like)."
      : "Complete the present-tense conjugation table.",
    cue: displayVerb,
    meaning: english,
    instruction: ["da sein", "zuordnen", "kennen lernen", "aussehen", "freuen"].includes(verb)
      ? "Write the verb and its accompanying word in each row, without the subject pronoun."
      : "Write one verb form in each row, without the subject pronoun.",
    answerKind: "conjugation-table",
    answers: [rows.map((row) => row.answers[0]).join(", ")],
    tip,
    source: entries.length
      ? entries.map((entry) => `Das Leben A1 glossary, Unit ${entry.unit}, row ${entry.sourceRow}`).join("; ")
      : supplement[2]
  };
});
