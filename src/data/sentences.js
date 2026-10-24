/** Full-sentence practice authored from the course sheets; see docs/curriculum.md. */
const questions = [];

const sources = {
  basics: "E1_Verbkonjugation123_Verbposition_updated_LS, sections II-IV",
  start: "Das Leben A1, Unit 0, Start; E0_Guten Tag_Wie heiß_2023",
  syntax: "E3_Deutsche Syntax1_TP_LS, parts I-II",
  inversion: "E4_Deutsche Syntax 2_Inversion_kurz_LS, exercises 1-2",
  nicht: "E3_Negation mit nicht_LS; E4_Negation_nicht_kein-_LS_v2",
  kein: "E3_Negation mit kein-_LS; E4_Negation_nicht_kein-_LS_v2",
  position: "Einheit 5, Wo_steht_nicht_2026_v2_LS, sections B-E",
  revision: "Einheit 5, Negation_Wiederholung_LS, exercises 8-9",
  separable: "Einheit 5, Neue_trennbare_Verben_LS; Das Leben A1, Unit 5, UB Eine Woche, viele Termine",
  time: "Einheit 5, am_um_von_bis_LS; Das Leben A1, Unit 5, UB Der Kalender von Silvia",
  tmp: "Einheit 6, E6_Syntax (TMP)_2024_LS, exercises 1-3",
  travel: "Das Leben A1, Unit 6, KB Fahrplaninformation / Können Sie mir helfen?; UB Wegbeschreibungen",
  possessive: "Einheit 6, Possessivartikel auf einen Blick; Das Leben A1, Unit 6, KB Seine Tasche - ihre Tasche; UB Unsere, eure, ...",
  past: "Einheit 6, E6_Syntax (TMP)_2024_LS, exercises 1.2 and 3.9; Das Leben A1, Unit 6, UB Sehenswürdigkeiten in Berlin",
  location: "Das Leben A1, Unit 7, KB Wo ist...? / Was ist wo im Büro?; UB Welches Büro ist das?",
  office: "Das Leben A1, Unit 7, UB Ordnungszahlen bis 20 / Aufgaben im Beruf / Gegenstände im Büro"
};

function add(unit, key, section, prompt, cue, answers, tip, source) {
  questions.push({ id: `u${unit}-sentence-${key}`, unit, section,
    topic: `Sentences: ${section.toLowerCase()}`, prompt, cue,
    answers: Array.isArray(answers) ? answers : [answers],
    answerKind: "sentence", tip, source: sources[source] });
}

// An explicit opening and intact phrase blocks constrain otherwise flexible word order.
function order(unit, key, cue, opening, answer, tip, source, extra = "") {
  add(unit, key, "Word order", `Build a statement. Begin with ${opening}. Use every block once, keep phrases together and conjugate the verb.${extra ? ` ${extra}` : ""}`,
    cue, answer, tip, source);
}
function question(unit, key, cue, opening, answer, tip, source) {
  add(unit, key, "Questions", `Build a question beginning with ${opening}. Use every block once, keep phrases together and conjugate the verb.`,
    cue, answer, tip, source);
}
function negate(unit, key, cue, answer, tip, source, extra = "") {
  add(unit, key, "Negation", `Rewrite as a negative statement using nicht or the correct form of kein-. Keep the opening and all other words.${extra ? ` ${extra}` : ""}`,
    cue, answer, tip, source);
}
function pattern(unit, key, prompt, cue, answer, tip, source) {
  add(unit, key, "Sentence patterns", `${prompt} Write the whole sentence.`, cue, answer, tip, source);
}

order(0, "name", "ich / heißen / Anna", "Ich", "Ich heiße Anna.", "Use heiße with ich. The conjugated verb follows the subject.", "start");
question(0, "name-question", "du / wie / heißen", "Wie", "Wie heißt du?", "Wie comes first, then the verb and the subject.", "start");
pattern(0, "greeting", "Complete the greeting with the form of sein for ich.", "Ich ___ Anna.", "Ich bin Anna.", "ich takes bin.", "start");

order(1, "origin", "wir / kommen / aus Singapur", "Wir", "Wir kommen aus Singapur.", "The wir form is kommen; aus introduces origin.", "basics");
order(1, "place-first", "in Berlin / wohnen / ich", "In Berlin", "In Berlin wohne ich.", "In Berlin is one sentence element. The verb stays second and the subject follows it.", "basics");
order(1, "language", "du / sprechen / Deutsch", "Du", "Du sprichst Deutsch.", "sprechen changes e to i with du: sprichst.", "basics");
question(1, "yes-no", "ihr / wohnen / in Leipzig", "Wohnt", "Wohnt ihr in Leipzig?", "A yes-no question starts with the conjugated verb.", "basics");
question(1, "where-from", "Anna / woher / kommen", "Woher", "Woher kommt Anna?", "Woher asks about origin; the verb follows the question word.", "basics");
question(1, "formal", "Sie / wie / heißen", "Wie", "Wie heißen Sie?", "Formal Sie uses heißen and retains its capital letter.", "basics");

negate(2, "understand", "Ich verstehe.", "Ich verstehe nicht.", "With no other complement, nicht follows the verb here.", "nicht");
negate(2, "adjective", "Das Handy ist teuer.", "Das Handy ist nicht teuer.", "nicht goes directly before the adjective teuer.", "nicht");
negate(2, "residence", "Anna wohnt in Berlin.", "Anna wohnt nicht in Berlin.", "Place nicht before the location phrase being negated.", "nicht");
question(2, "phone", "wie / deine Telefonnummer / sein", "Wie", "Wie ist deine Telefonnummer?", "The singular subject takes ist. The question word comes first.", "basics");

order(3, "time-place", "Maria / arbeiten / im Café / heute", "Maria", "Maria arbeitet heute im Café.", "Use the course's neutral order: time before place.", "syntax", "Put time before place.");
order(3, "sport-bracket", "wir / Sport machen / im Park / am Morgen", "Wir", "Wir machen am Morgen im Park Sport.", "machen and Sport form a bracket around time and place.", "syntax", "Put time before place and Sport at the end.");
order(3, "piano-bracket", "Lena / Klavier spielen / in der Bar / am Wochenende", "Lena", "Lena spielt am Wochenende in der Bar Klavier.", "Conjugate spielen; place Klavier at the end of this course pattern.", "syntax", "Put time before place and Klavier at the end.");
question(3, "cafe", "du / frühstücken / im Café / jeden Tag", "Frühstückst", "Frühstückst du jeden Tag im Café?", "Verb first for a yes-no question; time before place.", "syntax");
question(3, "work-location", "wo / Max / arbeiten", "Wo", "Wo arbeitet Max?", "Wo asks about location. arbeiten takes -et with Max.", "syntax");
negate(3, "indefinite-m", "Das ist ein Stift.", "Das ist kein Stift.", "Replace ein with kein for a masculine nominative noun.", "kein");
negate(3, "indefinite-f", "Das ist eine Tasche.", "Das ist keine Tasche.", "A feminine noun takes keine.", "kein");
negate(3, "indefinite-n", "Das ist ein Buch.", "Das ist kein Buch.", "A neuter nominative noun takes kein.", "kein");
negate(3, "plural", "Das sind Hefte.", "Das sind keine Hefte.", "A noun with no article in the plural takes keine.", "kein");

order(4, "time-inversion", "heute Abend / Frau Weber / essen / im Restaurant", "Heute Abend", "Heute Abend isst Frau Weber im Restaurant.", "A time phrase can come first; the verb stays second. essen becomes isst.", "inversion");
order(4, "object-inversion", "den Kaffee / ich / trinken", "Den Kaffee", "Den Kaffee trinke ich.", "The fronted object keeps accusative den. The verb precedes the subject.", "inversion");
question(4, "order-food", "du / möchten / einen Salat", "Möchtest", "Möchtest du einen Salat?", "The conjugated verb opens a yes-no question; Salat takes einen as the object.", "basics");
negate(4, "accusative-m", "Ich habe einen Hund.", "Ich habe keinen Hund.", "The masculine accusative object takes keinen, not keine or kein.", "kein");
negate(4, "mass-noun", "Ich trinke Tee.", "Ich trinke keinen Tee.", "Tee has no article here; use kein- with accusative masculine -en.", "kein");
negate(4, "food-plural", "Wir essen Pommes.", "Wir essen keine Pommes.", "Plural Pommes takes keine.", "kein");
negate(4, "food-neuter", "Ich möchte ein Eis.", "Ich möchte kein Eis.", "A neuter accusative object takes kein.", "kein");
negate(4, "preference", "Ich arbeite gern.", "Ich arbeite nicht gern.", "nicht precedes gern to negate the preference.", "nicht");
negate(4, "definite-identity", "Das sind die Fotos von Anna.", "Das sind nicht die Fotos von Anna.", "Use nicht before the definite noun phrase in this identity statement.", "nicht");

order(5, "morning", "um sieben Uhr / ich / aufstehen", "Um sieben Uhr", "Um sieben Uhr stehe ich auf.", "The time phrase comes first, stehe second, and auf last.", "separable");
order(5, "invite", "Anna / einladen / ihre Freunde / am Freitag", "Anna", ["Anna lädt am Freitag ihre Freunde ein.", "Anna lädt ihre Freunde am Freitag ein."], "einladen becomes lädt ... ein. Both listed positions of the time phrase are possible.", "separable");
order(5, "television", "am Abend / du / fernsehen", "Am Abend", "Am Abend siehst du fern.", "sehen becomes siehst with du. The prefix fern stays at the end.", "separable");
order(5, "prepare", "ihr / das Essen / vorbereiten", "Ihr", "Ihr bereitet das Essen vor.", "The ihr form is bereitet; vor closes the sentence.", "separable");
question(5, "departure", "wann / der Bus / abfahren", "Wann", "Wann fährt der Bus ab?", "The W-word precedes fährt; ab goes last.", "separable");
question(5, "come-along", "du / mitkommen / am Samstag", "Kommst", "Kommst du am Samstag mit?", "In a yes-no question, kommst is first and mit is last.", "separable");
question(5, "duration", "wie lange / der Kurs / dauern", "Wie lange", "Wie lange dauert der Kurs?", "Wie lange asks for duration and forms one question phrase.", "time");
negate(5, "definite-object", "Ich lese das Buch.", "Ich lese das Buch nicht.", "For general negation, nicht follows the definite object here.", "position", "Negate the whole statement, without a contrast.");
negate(5, "call", "Ich rufe dich an.", "Ich rufe dich nicht an.", "nicht follows the object pronoun and precedes the separable prefix.", "position");
negate(5, "shopping", "Ich kaufe am Freitag ein.", "Ich kaufe am Freitag nicht ein.", "General negation comes after the time phrase and before ein.", "position", "Negate the activity, not the choice of day.");
negate(5, "switch-off", "Er schaltet das Handy aus.", "Er schaltet das Handy nicht aus.", "nicht follows the object and precedes aus.", "position");
negate(5, "time-available", "Wir haben morgen Zeit.", "Wir haben morgen keine Zeit.", "Zeit is a feminine noun without an article, so use keine.", "revision");
pattern(5, "contrast-day", "Insert nicht to correct the day, keeping every other word.", "Ich komme am Montag, sondern am Dienstag.", "Ich komme nicht am Montag, sondern am Dienstag.", "For a contrast, put nicht directly before the corrected phrase; sondern introduces the replacement.", "position");
pattern(5, "contrast-object", "Insert nicht to correct the object, keeping every other word.", "Ich schalte das Radio, sondern die Lampe aus.", "Ich schalte nicht das Radio, sondern die Lampe aus.", "The contrast is about das Radio, so nicht goes before that object, not before aus.", "position");
pattern(5, "appointment", "Replace both blanks with time prepositions.", "Der Termin ist ___ Montag ___ zehn Uhr.", "Der Termin ist am Montag um zehn Uhr.", "Use am for the weekday and um for the clock time.", "time");
pattern(5, "interval", "Replace both blanks with time prepositions.", "Ich arbeite ___ neun ___ fünf Uhr.", "Ich arbeite von neun bis fünf Uhr.", "A time interval uses von ... bis.", "time");

order(6, "tmp-travel", "ich / fahren / zur Arbeit / mit dem Bus / jeden Tag", "Ich", "Ich fahre jeden Tag mit dem Bus zur Arbeit.", "The course's neutral order is time, manner, place: jeden Tag, mit dem Bus, zur Arbeit.", "tmp", "Use time, manner, place order.");
order(6, "tmp-fronted", "am Samstag / wir / fahren / nach Berlin / mit dem Zug", "Am Samstag", "Am Samstag fahren wir mit dem Zug nach Berlin.", "The time phrase is first. Put the verb before the subject, then manner before destination.", "tmp", "Put manner before destination.");
order(6, "tmp-walk", "Lena / gehen / zum Bahnhof / zu Fuß / morgens", "Lena", "Lena geht morgens zu Fuß zum Bahnhof.", "morgens is time; zu Fuß is manner; zum Bahnhof is destination.", "tmp", "Use time, manner, place order.");
order(6, "tmp-shopping", "ich / einkaufen / im Supermarkt / mit Anna / heute", "Ich", "Ich kaufe heute mit Anna im Supermarkt ein.", "Put time, companion and place inside the separable verb bracket.", "tmp", "Use time, manner, place order.");
question(6, "tmp-question", "ihr / fahren / nach Hamburg / mit dem Zug / morgen", "Fahrt", "Fahrt ihr morgen mit dem Zug nach Hamburg?", "The verb is first; time, manner and destination follow the subject.", "tmp");
question(6, "transfer", "wo / wir / umsteigen", "Wo", "Wo steigen wir um?", "The question word is first; um remains at the end.", "travel");
question(6, "past-question", "du / sein / gestern / in Berlin", "Warst", "Warst du gestern in Berlin?", "Yesterday requires the past of sein here: du warst. Time precedes place.", "past");
negate(6, "transfer-negative", "Wir steigen um.", "Wir steigen nicht um.", "Put nicht before the detached prefix um.", "travel");
negate(6, "possessive-negative", "Das ist mein Fahrrad.", "Das ist nicht mein Fahrrad.", "A possessive article stays in place; negate the phrase with nicht, not kein-.", "possessive");
negate(6, "past-negative", "Lena war gestern im Café.", "Lena war gestern nicht im Café.", "Keep war in second position and place nicht before the location.", "past");
pattern(6, "his-bag", "Replace von Leon with a possessive article. Begin with Das.", "Das ist die Tasche von Leon.", "Das ist seine Tasche.", "Leon gives the stem sein-; feminine Tasche adds -e.", "possessive");
pattern(6, "her-phone", "Replace von Anna with a possessive article. Begin with Das.", "Das ist das Handy von Anna.", "Das ist ihr Handy.", "Anna gives ihr-; neuter Handy has no ending in the nominative.", "possessive");
pattern(6, "your-city", "Fill the blank for ihr (you, plural).", "Ist das ___ Stadt?", "Ist das eure Stadt?", "euer becomes eure before a feminine noun.", "possessive");
pattern(6, "formal-keys", "Fill the blank for formal Sie (your).", "Sind das ___ Schlüssel, Frau Weber?", "Sind das Ihre Schlüssel, Frau Weber?", "Formal Ihre is capitalised; plural Schlüssel requires -e.", "possessive");
pattern(6, "past-statement", "Change Heute to Gestern and use the past form of sein. Keep the word order.", "Heute sind wir in Berlin.", "Gestern waren wir in Berlin.", "wir sind becomes wir waren. The verb stays second after Gestern.", "past");
pattern(6, "direction", "Make a formal instruction. Start with Biegen, use every block and conjugate the verb.", "Sie / links / abbiegen", "Biegen Sie links ab.", "A formal instruction starts with the verb followed by Sie; ab closes it.", "travel");

order(7, "location-inversion", "neben dem Fenster / stehen / die Pflanze", "Neben dem Fenster", "Neben dem Fenster steht die Pflanze.", "The complete location is one element; steht is second and die Pflanze follows.", "location");
order(7, "plural-location", "im Regal / stehen / die Bücher", "Im Regal", "Im Regal stehen die Bücher.", "The plural subject Bücher takes stehen, even after the verb.", "location");
order(7, "office-bracket", "wir / eine Präsentation / vorbereiten", "Wir", "Wir bereiten eine Präsentation vor.", "Conjugate bereiten for wir and move vor to the end.", "office");
question(7, "where-lamp", "wo / die Lampe / stehen", "Wo", "Wo steht die Lampe?", "Wo asks for a fixed location; the singular subject takes steht.", "location");
question(7, "which-floor", "in welcher Etage / Ihr Büro / sein", "In welcher Etage", "In welcher Etage ist Ihr Büro?", "The whole question phrase comes before ist. Formal Ihr stays capitalised.", "office");
negate(7, "office-location", "Das Bild hängt an der Wand.", "Das Bild hängt nicht an der Wand.", "nicht precedes the location being negated; an der Wand keeps its dative form.", "location");
negate(7, "office-identity", "Das ist ein Computer.", "Das ist kein Computer.", "An indefinite masculine noun in this identity statement takes kein.", "office");
pattern(7, "third-floor", "Replace 3 with the ordinal word and its ending.", "Das Büro ist in der 3. Etage.", "Das Büro ist in der dritten Etage.", "Use dritten after in der; drei has the irregular ordinal stem dritt-.", "office");
pattern(7, "twentieth-floor", "Replace 20 with the ordinal word and its ending.", "Die Kantine ist in der 20. Etage.", "Die Kantine ist in der zwanzigsten Etage.", "Ordinals from 20 use -st-; in der requires -en here.", "office");
pattern(7, "dative-table", "Replace the blank with the definite article for der Schreibtisch.", "Die Tastatur liegt auf ___ Schreibtisch.", "Die Tastatur liegt auf dem Schreibtisch.", "A fixed location answers Wo? Use dative dem for masculine Schreibtisch.", "location");
pattern(7, "dative-wall", "Replace the blank with the definite article for die Wand.", "Die Uhr hängt an ___ Wand.", "Die Uhr hängt an der Wand.", "A fixed location with feminine Wand takes dative der.", "location");
pattern(7, "dative-plural", "Replace the blank with the definite article for die Bücher.", "Das Handy liegt vor ___ Büchern.", "Das Handy liegt vor den Büchern.", "Dative plural uses den and adds -n to Bücher: Büchern.", "location");

export const sentenceQuestions = questions;
