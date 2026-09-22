/**
 * Chapter 0, 1 and 4 drills, authored from the textbook and course solutions.
 * Page references use printed textbook pages, not PDF page indices.
 * Keep IDs stable: browser progress is keyed by these IDs.
 */
const rows = [];
function add(unit, key, topic, prompt, cue, answers, tip, source) {
  rows.push({ id: `u${unit}-grammar-${key}`, unit, topic, prompt, cue,
    answers: Array.isArray(answers) ? answers : [answers], tip, source });
}

const start = "Das Leben A1, Start, pp. 12-15; Lösungen Start";
const introductions = "Das Leben A1, Unit 1, pp. 18-21, 26-27; Lösungen Einheit 1";
const restaurant = "Das Leben A1, Unit 4, p. 55, exercise 4; Im Restaurant, exercises 3-5 (solutions)";
const negation = "Das Leben A1, Unit 4, p. 56, exercise 2; E4 Negation nicht/kein-, solutions";

[
  ["morning", "Good morning!", "Guten Morgen!"],
  ["day", "Good afternoon!", "Guten Tag!"],
  ["evening", "Good evening!", "Guten Abend!"]
].forEach(([id, cue, answer]) => add(0, `greeting-${id}`, "Greetings",
  "Write the German greeting, including the exclamation mark.", cue, answer,
  "Guten stays the same in these three greetings. Capitalise the noun.", "E0 Guten Tag! Wie heiß...?, Begrüßung"));

[
  ["spelling", "Können Sie das bitte ___? (spell)", "buchstabieren", "After können, use the infinitive at the end."],
  ["repeat", "Kannst du das bitte ___? (repeat)", "wiederholen", "wiederholen means to repeat. The infinitive follows bitte here."],
  ["understand", "Ich ___ das nicht. (verstehen)", "verstehe", "Use the ich ending -e."],
  ["formal-name", "Wie ___ Sie? (heißen)", "heißen", "Formal Sie uses the same verb form as the infinitive."],
  ["name", "Ich ___ Anna. (heißen)", "heiße", "Keep ß in heiße; ich takes -e."],
  ["classroom-read", "___ Sie den Text. (lesen)", "Lesen", "A formal instruction starts with the verb, followed by Sie."],
  ["classroom-write", "___ Sie bitte langsam. (schreiben)", "Schreiben", "Begin the instruction with a capital letter."],
  ["language", "Wie heißt das ___ Deutsch?", "auf", "Learn auf Deutsch as a phrase: in German."]
].forEach(([id, cue, answer, tip]) => add(0, id, "Language in class", "Fill in the blank.", cue, answer, tip, start));

[
  ["book", "Buch", "das"], ["chair", "Stuhl", "der"], ["door", "Tür", "die"]
].forEach(([id, noun, answer]) => add(0, `gender-${id}`, "Gender and articles",
  "Complete the sentence with the definite article.", `Das ist ___ ${noun}.`, answer,
  "After sein, the noun is in the nominative. Learn its article together with the noun.",
  "Das Leben A1, Start, p. 14, Der Kursraum; Genus und Plural, solutions"));

[
  ["du", "Woher kommst ___, Anna? (informal, one person)", "du"],
  ["ihr", "Woher kommt ___, Anna und Ben? (informal)", "ihr"],
  ["wir", "Anna und ich: ___ kommen aus Singapur.", "Wir"],
  ["formal", "Woher kommen ___, Frau Bach? (formal)", "Sie"],
  ["er", "Das ist Marco. ___ kommt aus Italien.", "Er"],
  ["sie", "Das ist Maria. ___ wohnt in Leipzig.", "Sie"]
].forEach(([id, cue, answer]) => add(1, `pronoun-${id}`, "Personal pronouns",
  "Fill in the personal pronoun. Capitalise it at the start of a sentence.", cue, answer,
  "Match the pronoun to the speaker or person addressed. Formal Sie always has a capital S.",
  "E1 Personalpronomen, Gespräche A/B (solutions); Das Leben A1, p. 27"));

[
  ["kommen-du", "du ___ (kommen)", "kommst"],
  ["wohnen-er", "er ___ (wohnen)", "wohnt"],
  ["leben-wir", "wir ___ (leben)", "leben"],
  ["lernen-ihr", "ihr ___ (lernen)", "lernt"],
  ["heissen-du", "du ___ (heißen)", "heißt"],
  ["sprechen-du", "du ___ (sprechen)", "sprichst"],
  ["sprechen-er", "er ___ (sprechen)", "spricht"],
  ["sein-ich", "ich ___ (sein)", "bin"],
  ["sein-ihr", "ihr ___ (sein)", "seid"],
  ["sein-wir", "wir ___ (sein)", "sind"]
].forEach(([id, cue, answer]) => add(1, id, "Verb conjugation", "Write the conjugated verb.", cue, answer,
  id.startsWith("sprechen") ? "sprechen changes e to i with du and er/sie/es."
    : id.startsWith("sein") ? "sein is irregular: bin, bist, ist, sind, seid, sind."
      : id === "heissen-du" ? "After ß, the du form adds -t, not another s."
        : "Match the ending to the subject: -e, -st, -t, -en, -t, -en.", introductions));

[
  ["origin", "___ kommst du? Aus Singapur.", "Woher", "Woher asks about origin."],
  ["residence", "___ wohnst du? In Leipzig.", "Wo", "Wo asks about location."],
  ["name", "___ heißt du? Ich heiße Anna.", "Wie", "Wie heißt du? asks for a name."],
  ["switzerland", "Ich komme aus ___ Schweiz.", "der", "Learn the country phrase aus der Schweiz."],
  ["iran", "Ich komme aus ___ Iran.", "dem", "Learn the country phrase aus dem Iran."],
  ["usa", "Ich komme aus ___ USA.", "den", "Plural country names use aus den: aus den USA."]
].forEach(([id, cue, answer, tip]) => add(1, `intro-${id}`, "Introducing yourself", "Fill in the blank.", cue, answer, tip, introductions));

add(1, "question-order", "Word order", "Build a yes/no question. Include the question mark.",
  "du / wohnen / in Leipzig", "Wohnst du in Leipzig?",
  "In a yes/no question, the conjugated verb comes first.", introductions);
add(1, "statement-order", "Word order", "Build a statement beginning with Ich.",
  "ich / lernen / Deutsch", "Ich lerne Deutsch.",
  "The conjugated verb is the second element in a statement.", introductions);

[
  ["salat-def", "Ich nehme ___ Salat. (definite: der Salat)", "den"],
  ["salat-indef", "Ich nehme ___ Salat. (indefinite: der Salat)", "einen"],
  ["steak", "Ich bestelle ___ Steak. (indefinite: das Steak)", "ein"],
  ["suppe", "Ich nehme ___ Tomatensuppe. (indefinite: die Tomatensuppe)", "eine"],
  ["pommes", "Ich bestelle ___ Pommes. (indefinite plural; write X if no article)", "X"],
  ["kuchen", "Möchtest du ___ Kuchen? (definite: der Kuchen)", "den"],
  ["fisch", "Ich bestelle ___ Fisch. (definite: der Fisch)", "den"],
  ["gemuese", "Ich nehme ___ Gemüse. (definite: das Gemüse)", "das"]
].forEach(([id, cue, answer]) => add(4, `accusative-${id}`, "Accusative articles",
  "Fill in the requested article.", cue, answer,
  "The food is the direct object. Masculine der/ein becomes den/einen; feminine, neuter and plural forms stay the same. There is no plural indefinite article.", restaurant));

[
  ["masculine", "Ich esse ___ Fisch. (no fish)", "keinen", "Fisch is masculine and the object: keinen Fisch."],
  ["neuter", "Ich esse ___ Fleisch. (no meat)", "kein", "Fleisch is neuter: kein Fleisch."],
  ["feminine", "Ich möchte ___ Pizza. (no pizza)", "keine", "Pizza is feminine: keine Pizza."],
  ["plural", "Ich mag ___ Oliven. (no olives)", "keine", "Plural nouns take keine in both nominative and accusative."],
  ["adjective", "Das ist ___ vegetarisch. (not vegetarian)", "nicht", "Negate an adjective with nicht."],
  ["gern", "Ich esse ___ gern scharf. (not fond of spicy food)", "nicht", "Place nicht before the phrase gern scharf."],
  ["known", "Das Rezept kenne ich ___. (do not know)", "nicht", "With a definite object already in front, negate the verb using nicht at the end."],
  ["hunger", "Ich habe ___ Hunger. (no hunger)", "keinen", "Hunger is masculine. haben takes an accusative object."]
].forEach(([id, cue, answer, tip]) => add(4, `negative-${id}`, "nicht or kein-",
  "Fill in nicht or the correct form of kein-.", cue, answer, tip, negation));

[
  ["essen", "du ___ (essen)", "isst", "essen changes e to i: du isst, er isst."],
  ["nehmen", "du ___ (nehmen)", "nimmst", "nehmen changes its stem: du nimmst, er nimmt."],
  ["moegen", "ich ___ (mögen)", "mag", "mögen changes its stem in the singular: ich mag."],
  ["moechten", "ihr ___ (möchten)", "möchtet", "ihr takes -t: möchtet. Keep the umlaut."],
  ["wissen", "ich ___ (wissen)", "weiß", "wissen is irregular: ich weiß, du weißt, er weiß."],
  ["finden", "ihr ___ (finden)", "findet", "The stem ends in d, so add -et with ihr."]
].forEach(([id, cue, answer, tip]) => add(4, `verb-${id}`, "Restaurant verbs", "Conjugate the verb.", cue, answer, tip,
  "Das Leben A1, Unit 4, pp. 55-56; glossary Unit 4; Verben Einheit 0-4"));

add(4, "order-hamburger", "Ordering food", "Build a statement beginning with Ich.",
  "ich / bestellen / einen Hamburger / mit Pommes", "Ich bestelle einen Hamburger mit Pommes.",
  "Conjugate bestellen for ich. einen marks the masculine accusative object.", "Das Leben A1, p. 60, exercises 9-10");
add(4, "order-inversion", "Word order", "Build a statement beginning with Heute.",
  "heute / ich / essen / einen Salat", "Heute esse ich einen Salat.",
  "Heute occupies position one. The verb stays second and the subject follows it.", "Das Leben A1, Unit 4; Deutsche Syntax 2, Inversion");
add(4, "case-subject", "Nominative or accusative", "Name the case of the highlighted noun phrase.",
  "[Der Kuchen] schmeckt nicht.", "Nominativ", "The cake is the subject of schmeckt.", restaurant);
add(4, "case-object", "Nominative or accusative", "Name the case of the highlighted noun phrase.",
  "Ich bestelle [einen Hamburger].", "Akkusativ", "The hamburger is the direct object of bestelle.", restaurant);

export const foundationQuestions = rows;
