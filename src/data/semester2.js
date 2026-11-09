/** Chapter-test adaptations and original worksheet-based recall cards.
 * No unseen pictures or recordings are required. IDs are stable for progress.
 * This is targeted preparation, not an official ST2 paper or marking scheme.
 */
const questions = [];
const key = "Lösungen_Tests_Einheit5-Einheit8.pdf, p. 117";
function add(unit, id, section, prompt, cue, answers, tip, source, extra = {}) {
  questions.push({ id: `st2-u${unit}-${id}`, unit, section,
    topic: `Semester Test 2: ${section}`, prompt, cue,
    answers: Array.isArray(answers) ? answers : [answers], tip, source, ...extra });
}
const paper = (unit, task) => `Adapted from Test zu Einheit ${unit}.pdf, task ${task}; ${key}`;
const fill = "Fill in the blank. Write only the missing word.";

[
  ["quarter-eleven", "10:45", "Viertel vor elf", "Viertel vor means fifteen minutes before the next hour."],
  ["five-eight", "07:55", "fünf vor acht", "vor counts backwards from the next hour."],
  ["half-eleven", "10:30", "halb elf", "halb elf is halfway to eleven, so 10:30."],
  ["five-twelve", "12:05", "fünf nach zwölf", "nach counts minutes after the hour."],
  ["twenty-three", "15:20", "zwanzig nach drei", "Informal time uses the twelve-hour clock."],
  ["half-nine", "08:30", "halb neun", "The hour after 8:30 is nine."]
].forEach(([id, cue, answer, tip]) => add(5, `time-${id}`, "Time", "Write the informal time using halb, Viertel, vor or nach. Omit Es ist.", cue, answer, tip, paper(5, "1–2")));

[
  ["wed", "Heute ist Dienstag. Morgen ist ___.", "Mittwoch"],
  ["sat", "Morgen ist Sonntag. Heute ist ___.", "Samstag"],
  ["thu", "Morgen ist Freitag. Heute ist ___.", "Donnerstag"],
  ["tue", "Heute ist Montag. Morgen ist ___.", "Dienstag"]
].forEach(([id, cue, answer]) => add(5, `day-${id}`, "Weekdays", fill, cue, answer, "Heute means today; morgen means tomorrow. Weekday names begin with a capital letter.", paper(5, 3)));

[
  ["day", "Der Termin ist ___ Mittwoch.", "am"],
  ["hour", "Die Sprechzeit beginnt ___ 11 Uhr.", "um"],
  ["start", "Wir arbeiten ___ 8 bis 12 Uhr.", "von"],
  ["end", "Der Kurs dauert von 10 ___ 13 Uhr.", "bis"],
  ["evening", "Ich gehe ___ Abend weg.", "am"],
  ["when", "___ hast du Deutschkurs? Am Dienstag.", "Wann"]
].forEach(([id, cue, answer]) => add(5, `appointment-${id}`, "Appointments", fill, cue, answer,
  "Use am for days and parts of the day, um for clock times, and von … bis for a time interval. Wann asks when.", "Original adaptation of Einheit 5/am_um_von_bis_LS.pdf, tasks 1–3"));

[
  ["breakfast", "sie / frühstücken / von 7:30 bis 8:00 Uhr", "Sie frühstückt von 7:30 bis 8:00 Uhr."],
  ["university", "sie / fahren / um 8:30 Uhr / zur Uni", "Sie fährt um 8:30 Uhr zur Uni."],
  ["call", "sie / anrufen / Tobias / um 11:00 Uhr", "Sie ruft Tobias um 11:00 Uhr an."],
  ["shop", "sie / einkaufen / um 17:00 Uhr", "Sie kauft um 17:00 Uhr ein."],
  ["tv", "sie / fernsehen / von 18:00 bis 19:30 Uhr", "Sie sieht von 18:00 bis 19:30 Uhr fern."],
  ["out", "sie / weggehen / um 20:00 Uhr", "Sie geht um 20:00 Uhr weg."]
].forEach(([id, cue, answer]) => add(5, `routine-${id}`, "Daily routines",
  "Build a sentence starting with Sie (she). Keep the given time notation and block order; conjugate the verb and move any prefix to the end.", cue, answer,
  "The conjugated verb is second; a separable prefix closes the sentence. fahren → fährt; fernsehen → sieht … fern.", paper(5, 4), { answerKind: "sentence" }));

[
  ["call", "Ich rufe dich an.", "Ich rufe dich nicht an."],
  ["shop", "Ich kaufe am Freitag ein.", "Ich kaufe am Freitag nicht ein."],
  ["book", "Ich lese das Buch.", "Ich lese das Buch nicht."],
  ["place", "Ich studiere in Deutschland.", "Ich studiere nicht in Deutschland."],
  ["adjective", "Der Film ist schön.", "Der Film ist nicht schön."],
  ["tidy", "Ich räume die Wohnung heute auf.", "Ich räume die Wohnung heute nicht auf."]
].forEach(([id, cue, answer]) => add(5, `negative-${id}`, "Negation",
  "Negate the whole statement with nicht. Preserve the subject and all other words; do not add a contrast.", cue, answer,
  "For general negation, nicht comes before a detached prefix, adjective or location phrase; otherwise it follows the definite object and time here.",
  "Adapted from Einheit 5/Wo_steht_nicht_2026_v2_LS.pdf, sections A, B and E", { answerKind: "sentence" }));

[
  ["sbahn", "urban rail / suburban train (S-Bahn)", "die S-Bahn"],
  ["bus", "bus", "der Bus"],
  ["bike", "bicycle", "das Fahrrad"],
  ["motorbike", "motorcycle", "das Motorrad"]
].forEach(([id, cue, answer]) => add(6, `transport-${id}`, "Transport vocabulary", "Write the German singular noun with its definite article.", cue, answer,
  "Recall the article together with the transport noun. German nouns are capitalised.", paper(6, 1)));

[
  ["change", "Ich ___ in Hannover ___. (umsteigen)", "steige, um"],
  ["arrive", "Um 14:47 ___ ich in Berlin ___. (ankommen)", "komme, an"],
  ["exit", "Am Hauptbahnhof ___ ich ___. (aussteigen)", "steige, aus"],
  ["continue", "Dann ___ ich mit der S-Bahn ___. (weiterfahren)", "fahre, weiter"],
  ["depart", "Der Zug ___ um 10:32 ___. (abfahren)", "fährt, ab"]
].forEach(([id, cue, answer]) => add(6, `travel-${id}`, "Travel verbs", "Fill both blanks in order, separated by a comma.", cue, answer,
  "Conjugate the verb for its subject and put the separable prefix at the end. A leading time phrase does not change the verb's second position.", paper(6, 3), { answerKind: "list" }));

[
  ["my", "Das Auto gehört mir. Das ist ___ Auto. (das Auto)", "mein"],
  ["your-plural", "Jitka und Tom, sind das ___ Taschen? (ihr; plural)", "eure"],
  ["our", "Ja, die Taschen gehören uns. Das sind ___ Taschen.", "unsere"],
  ["his", "Der USB-Stick gehört Carlo. Das ist ___ USB-Stick.", "sein"],
  ["her", "Die Tasche gehört Anna. Das ist ___ Tasche.", "ihre"],
  ["formal", "Herr Braun, ist das ___ Fahrrad? (formal Sie)", "Ihr"],
  ["your-neuter", "Ihr zwei, ist das ___ Büro? (das Büro)", "euer"],
  ["our-feminine", "Die Firma gehört uns. Das ist ___ Firma.", "unsere"]
].forEach(([id, cue, answer]) => add(6, `possessive-${id}`, "Possessives", fill, cue, answer,
  "The owner determines the stem. In the nominative, feminine and plural nouns take -e; euer becomes eure. Formal Ihr is capitalised.",
  `${paper(6, 5)}; supplementary patterns: Einheit 6/Possessivartikel_LS.pdf`));

[
  ["how", "___ kommst du zum Deutschkurs? Ich gehe zu Fuß.", "Wie"],
  ["frequency", "Wie ___ fährst du mit dem Auto? Nie.", "oft"],
  ["where", "___ ist das Kino? In der Berliner Straße.", "Wo"],
  ["stop", "Wie ___ die Haltestelle? Alexanderplatz.", "heißt"]
].forEach(([id, cue, answer]) => add(6, `question-${id}`, "Travel questions", fill, cue, answer,
  "Choose a question that matches the answer: manner (Wie), frequency (Wie oft), place (Wo), or name (Wie heißt).", paper(6, 2)));

const timetable = "Original practice timetable: 09:10 Marktstraße → U2 → 09:17 Theaterplatz; walk 5 minutes to the bus stop; 09:25 Bus 4 → 09:35 Hauptbahnhof.";
[
  ["departure", "At what time does the U2 leave Marktstraße? Write four digits (HHMM), including the leading zero.", "0910"],
  ["arrival", "At what time do you arrive at Hauptbahnhof? Write four digits (HHMM), including the leading zero.", "0935"],
  ["minutes", "How many minutes is the U2 ride? Write digits only.", "7"],
  ["wait", "After the five-minute walk, how many minutes remain before the bus leaves? Write digits only.", "3"],
  ["destination", "Die Fahrt endet an der Universität. Write richtig or falsch.", "falsch"]
].forEach(([id, prompt, answer]) => add(6, `reading-${id}`, "Timetable reading", prompt, timetable, answer,
  "Read each leg separately: the U2 arrives at 09:17, the walk ends at 09:22, the bus departs at 09:25 and reaches Hauptbahnhof at 09:35.",
  "Original timetable modelled on Test zu Einheit 6.pdf, task 4 (times changed for internal consistency)",
  { familyId: "st2-timetable", answerKind: id === "destination" ? "text" : "phone" }));

[
  ["copy", "room for photocopying", "der Kopierraum"],
  ["library", "library", "die Bibliothek"],
  ["office", "office", "das Büro"],
  ["canteen", "canteen", "die Kantine"],
  ["conference", "conference room", "der Konferenzraum"]
].forEach(([id, cue, answer]) => add(7, `room-${id}`, "Workplace vocabulary", "Write the German singular noun with its definite article.", cue, answer,
  "Learn the room name with its article. In a compound noun, the last noun determines gender: der Raum → der Konferenzraum.", paper(7, 1)));

[
  ["write", "Ich ___ viele E-Mails. (schreiben)", "schreibe"],
  ["greet", "Ich ___ neue Mitarbeiter. (begrüßen)", "begrüße"],
  ["answer", "Ich ___ ihre Fragen. (beantworten)", "beantworte"],
  ["organise", "Ich ___ Konferenzen. (organisieren)", "organisiere"],
  ["copy", "Ich ___ Dokumente. (kopieren)", "kopiere"]
].forEach(([id, cue, answer]) => add(7, `job-${id}`, "Workplace verbs", fill, cue, answer,
  "For ich, use the verb stem plus -e. Verbs in -ieren keep -ier-: organisieren → organisiere.", paper(7, 3)));

[
  ["in", "Die Schlüssel liegen ___ Regal. (inside; in + dem)", "im"],
  ["on", "Das Handy liegt ___ dem Tisch. (on top of)", "auf"],
  ["under", "Der Papierkorb steht ___ dem Tisch. (under)", "unter"],
  ["beside", "Die Pflanze steht ___ der Tür. (next to)", "neben"],
  ["wall", "Das Bild hängt an ___ Wand. (die Wand)", "der"],
  ["desk", "Die Lampe steht auf ___ Schreibtisch. (der Schreibtisch)", "dem"]
].forEach(([id, cue, answer]) => add(7, `location-${id}`, "Office locations", fill, cue, answer,
  "These are fixed locations answering Wo?, so use the dative. in dem contracts to im. The English cue identifies the spatial relation without a picture.",
  `${paper(7, 4)}; Einheit 7/Bestimmte_Artikel_Nom_Akk_Dat.pdf (dative extension)`));

[
  ["first", "Das Büro ist in der ___ Etage. (1.)", "ersten"],
  ["third", "Die Kantine ist in der ___ Etage. (3.)", "dritten"],
  ["ground", "Das Sekretariat ist im ___. (ground floor)", "Erdgeschoss"],
  ["duties", "Was sind Ihre ___? Ich telefoniere und organisiere viel. (duties)", "Aufgaben"]
].forEach(([id, cue, answer]) => add(7, `orientation-${id}`, "Workplace questions", fill, cue, answer,
  "Floor numbers after in der end in -en. The ground floor is das Erdgeschoss; duties are die Aufgaben.", paper(7, 2)));

[
  ["ich-sein", "Gestern ___ ich im Kino. (sein)", "war"],
  ["du-sein", "Wo ___ du gestern? (sein)", "warst"],
  ["wir-sein", "Wir ___ zusammen im Park. (sein)", "waren"],
  ["ihr-sein", "___ ihr lange wach? (sein)", "Wart"],
  ["ich-haben", "Ich ___ mein Handy nicht dabei. (haben)", "hatte"],
  ["du-haben", "___ du gestern ein Date? (haben)", "Hattest"],
  ["sie-haben", "Tom und Irene ___ eine kleine Wohnung. (haben)", "hatten"],
  ["ihr-haben", "___ ihr eine schöne Zeit? (haben)", "Hattet"]
].forEach(([id, cue, answer]) => add(7, `past-${id}`, "Past: sein and haben", "Fill in sein or haben in the Präteritum (simple past), as indicated.", cue, answer,
  "sein: war, warst, war, waren, wart, waren. haben: hatte, hattest, hatte, hatten, hattet, hatten. Capitalise the first word of a sentence.",
  "Adapted from Einheit 7/Vergangenes_LS.pdf, sections A–B"));

[
  ["time-place", "ich / arbeiten / seit drei Wochen / bei Siemens", "Ich arbeite seit drei Wochen bei Siemens.", "Ich"],
  ["yes-no", "du / frühstücken / jeden Tag / im Café", "Frühstückst du jeden Tag im Café?", "Frühstückst"],
  ["separable", "das Oktoberfest / anfangen / im Oktober", "Fängt das Oktoberfest im Oktober an?", "Fängt"],
  ["since", "seit wann / Herr Meier / arbeiten / bei Siemens", "Seit wann arbeitet Herr Meier bei Siemens?", "Seit wann"],
  ["tmp", "ich / einkaufen / am Samstagvormittag / mit meiner Mutter / in der Friedrichstraße", "Ich kaufe am Samstagvormittag mit meiner Mutter in der Friedrichstraße ein.", "Ich"],
  ["past", "Lorenzo / sein (past) / gestern / nicht / im Café", "Lorenzo war gestern nicht im Café.", "Lorenzo"]
].forEach(([id, cue, answer, opening]) => add(6, `syntax-${id}`, "Sentence order",
  `Build a sentence starting with ${opening}. Keep the order of the time, manner and place phrases given; conjugate the verb.`, cue, answer,
  "Statements place the conjugated verb second; yes/no questions place it first. Use time–manner–place and leave separable prefixes at the end.",
  "Adapted from Einheit 6/E6_Syntax (TMP)_2024_LS.pdf, exercises 1 and 3", { answerKind: "sentence" }));

export const semester2Questions = questions;
