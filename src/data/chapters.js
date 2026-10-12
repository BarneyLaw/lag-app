/**
 * Original constrained drills based on the course glossary and solution keys.
 * KB/UB refer to Kursbuch/Übungsbuch headings, not PDF page numbers.
 * Stable IDs preserve local progress. No task needs an unseen picture or audio.
 */
const questions = [];
function add(unit, key, topic, prompt, cue, answers, tip, source) {
  questions.push({ id: `u${unit}-grammar-${key}`, unit, topic, prompt, cue,
    answers: Array.isArray(answers) ? answers : [answers], tip, source });
}
const timeSource = "E5 am_um_von_bis (solutions), exercises 1–3; Das Leben A1, Unit 5, UB Die Zeit / Entschuldigung, wie spät ist es?";
const separableSource = "E5 Neue_trennbare_Verben (solutions), exercises 2–3; Kommst du mit? (solutions), exercises 1–3";
const travelSource = "Das Leben A1, Unit 6, KB Fahrplaninformation / Können Sie mir helfen?; UB Der Fahrplan / Wegbeschreibungen, solutions";
const possessiveSource = "Das Leben A1, Unit 6, KB Ist das dein…? / Seine Tasche – ihre Tasche; UB Unsere, eure, …, solutions";
const officeSource = "Das Leben A1, Unit 7, KB In der ersten Etage; UB Ordnungszahlen bis 20 / Aufgaben im Beruf, solutions";
const locationSource = "Das Leben A1, Unit 7, KB Wo ist…? / Was ist wo im Büro?; UB Welches Büro ist das?, solutions";

[
  ["day", "Der Termin ist ___ Dienstag.", "am", "Use am with a weekday."],
  ["clock", "Der Bus fährt ___ 10 Uhr ab.", "um", "Use um with a clock time."],
  ["from", "Ich arbeite ___ 9 bis 17 Uhr.", "von", "A time interval uses von … bis."],
  ["until", "Der Kurs dauert von 14 ___ 16 Uhr.", "bis", "bis marks the end of the interval."],
  ["evening", "Ich sehe ___ Abend fern.", "am", "Use am with Morgen, Vormittag, Mittag, Nachmittag and Abend."],
  ["night", "Ich schlafe ___ der Nacht.", "in", "The fixed expression is in der Nacht."],
  ["weekend", "___ Wochenende schlafe ich aus.", "Am", "am Wochenende means at the weekend. Capitalise Am at the start."],
  ["when", "___ hast du Zeit? Am Freitag.", "Wann", "Wann asks when. Wie lange asks about duration."],
  ["duration", "Wie ___ dauert der Kurs? Zwei Stunden.", "lange", "Wie lange asks how long something lasts."]
].forEach(([id, cue, answer, tip]) => add(5, `time-${id}`, "Time and appointments", "Fill in the blank.", cue, answer, tip, timeSource));

[
  ["half-six", "05:30", "halb sechs", "halb names the coming hour: halb sechs is 5:30."],
  ["quarter-eight", "07:45", "Viertel vor acht", "vor counts back from the next hour."],
  ["quarter-two", "14:15", "Viertel nach zwei", "nach counts forward from the current hour."],
  ["ten-twelve", "11:50", "zehn vor zwölf", "Ten minutes before twelve is 11:50."],
  ["twenty-ten", "10:20", "zwanzig nach zehn", "Twenty minutes after ten is 10:20."]
].forEach(([id, cue, answer, tip]) => add(5, `clock-${id}`, "Informal time",
  "Write the informal time using halb, Viertel, vor or nach. Omit Es ist and punctuation.", cue, answer, tip, timeSource));

[
  ["fernsehen", "du ___ am Abend ___. (fernsehen)", "siehst, fern", "sehen changes e to ie with du; fern moves to the end."],
  ["einladen", "Anna ___ ihre Freunde ___. (einladen)", "lädt, ein", "Use lädt with a singular subject; ein closes the sentence."],
  ["ausfallen", "Die S-Bahn ___ heute ___. (ausfallen)", "fällt, aus", "fallen changes a to ä with er/sie/es."],
  ["abfahren", "Wann ___ du ___? (abfahren)", "fährst, ab", "fahren changes a to ä with du. Keep ab at the end."],
  ["aufstehen", "Ich ___ um sieben Uhr ___. (aufstehen)", "stehe, auf", "Conjugate stehen for ich and put auf at the end."],
  ["vorbereiten", "Ihr ___ das Essen ___. (vorbereiten)", "bereitet, vor", "bereiten uses an extra e before the ihr ending: bereitet."],
  ["mitbringen", "Wir ___ Wasser ___. (mitbringen)", "bringen, mit", "The wir form is bringen; mit goes at the end."],
  ["ausschlafen", "Er ___ am Sonntag ___. (ausschlafen)", "schläft, aus", "schlafen changes a to ä in the third-person singular."],
  ["anrufen", "Du ___ Anna ___. (anrufen)", "rufst, an", "rufen keeps its vowel in the present tense."],
  ["ausschalten", "Sie ___ den Computer ___. (ausschalten; she)", "schaltet, aus", "schalten takes -et with er/sie/es."],
  ["anfangen", "Der Kurs ___ um neun Uhr ___. (anfangen)", "fängt, an", "fangen changes a to ä in the third-person singular."]
].forEach(([id, cue, answer, tip]) => {
  add(5, `separable-${id}`, "Separable verbs", "Fill both blanks in order, separated by a comma.", cue, answer, tip, separableSource);
  questions.at(-1).answerKind = "list";
});

[
  ["call", "Mark / anrufen / morgen / seine Mutter", "Mark ruft morgen seine Mutter an.", "Mark"],
  ["shop", "am Samstag / ich / einkaufen", "Am Samstag kaufe ich ein.", "Am Samstag"],
  ["invite", "ihr / einladen / Anna", "Ladet ihr Anna ein?", "Ladet"],
  ["event", "das Konzert / stattfinden / am Freitag / um 20 Uhr", "Das Konzert findet am Freitag um 20 Uhr statt.", "Das Konzert"],
  ["collect", "Frau Schmidt / abholen / ihre Tochter / am Bahnhof", "Frau Schmidt holt ihre Tochter am Bahnhof ab.", "Frau Schmidt"],
  ["cancel", "ich / absagen / den Termin", "Ich sage den Termin ab.", "Ich"]
].forEach(([id, cue, answer, opening]) => add(5, `order-${id}`, "Separable verb word order",
  `Use every block once. Begin with ${opening}, conjugate the verb, and include punctuation.`, cue, answer,
  "Keep the conjugated verb in its sentence position and move the separable prefix to the end. Keep time before place.", separableSource));

[
  ["bus", "Ich fahre mit ___ Bus. (der Bus)", "dem"],
  ["bike", "Sie fährt mit ___ Fahrrad. (das Fahrrad)", "dem"],
  ["train", "Wir fahren mit ___ U-Bahn. (die U-Bahn)", "der"],
  ["course", "Ich fahre ___ Deutschkurs. (zu + dem)", "zum"],
  ["university", "Wir fahren ___ Universität. (zu + der)", "zur"]
].forEach(([id, cue, answer]) => add(6, `transport-${id}`, "Transport phrases",
  "Fill in the article or contracted preposition.", cue, answer,
  "mit and zu take the dative: dem for masculine/neuter, der for feminine. zu dem contracts to zum; zu der to zur.", travelSource));

[
  ["arrival", "Der Zug ___ um 16:25 ___. (ankommen)", "kommt, an"],
  ["transfer", "Wir ___ am Bahnhof ___. (umsteigen)", "steigen, um"],
  ["continue", "Du ___ mit der U4 ___. (weiterfahren)", "fährst, weiter"],
  ["check", "Ich ___ die Verbindung ___. (nachsehen)", "sehe, nach"],
  ["turn", "Sie ___ rechts ___. (abbiegen; formal Sie)", "biegen, ab"]
].forEach(([id, cue, answer]) => {
  add(6, `travel-${id}`, "Travel verbs", "Fill both blanks in order, separated by a comma.", cue, answer,
    "Conjugate the main verb for the subject. The separable prefix goes at the end.", travelSource);
  questions.at(-1).answerKind = "list";
});

[
  ["my-phone", "Das ist ___ Handy. (ich; das Handy)", "mein"],
  ["your-books", "Sind das ___ Bücher? (du; plural)", "deine"],
  ["his-bag", "Die Tasche gehört Leon. Das ist ___ Tasche.", "seine"],
  ["her-phone", "Das Handy gehört Sina. Das ist ___ Handy.", "ihr"],
  ["her-keys", "Die Schlüssel gehören Sina. Das sind ___ Schlüssel.", "ihre"],
  ["our-day", "Das ist ___ Tag. (wir; der Tag)", "unser"],
  ["our-city", "Das ist ___ Stadt. (wir; die Stadt)", "unsere"],
  ["your-selfie", "Ist das ___ Selfie? (ihr; das Selfie)", "euer"],
  ["your-city", "Ist das ___ Stadt? (ihr; die Stadt)", "eure"],
  ["their-friends", "Das sind ___ Freunde. (sie, they; plural)", "ihre"],
  ["formal-phone", "Ist das ___ Handy, Frau Henne? (formal Sie)", "Ihr"],
  ["formal-keys", "Sind das ___ Schlüssel, Herr Schulte? (formal Sie; plural)", "Ihre"]
].forEach(([id, cue, answer]) => add(6, `possessive-${id}`, "Possessive articles",
  "Fill in the possessive article in the nominative.", cue, answer,
  "Choose the stem for the owner. Add -e for feminine and plural nouns. euer becomes eure before -e; formal Ihr is capitalised.", possessiveSource));

add(6, "direction-straight", "Directions", "Fill in the German direction.", "Gehen Sie ___. (straight ahead)", "geradeaus", "geradeaus means straight ahead.", travelSource);
add(6, "direction-order", "Directions", "Build a formal instruction starting with Biegen. Include a full stop.", "Sie / rechts / abbiegen", "Biegen Sie rechts ab.", "Start a formal instruction with the verb followed by Sie; ab closes the instruction.", travelSource);

[
  [1, "ersten"], [2, "zweiten"], [3, "dritten"], [4, "vierten"],
  [7, "siebten"], [8, "achten"], [20, "zwanzigsten"]
].forEach(([floor, answer]) => add(7, `floor-${floor}`, "Ordinal numbers",
  "Write the ordinal number as a word with the correct ending.", `Das Büro ist in der ___ Etage. (${floor}.)`, answer,
  "After in der, the ordinal ends in -en. Note ersten, dritten, siebten and achten; 20 uses zwanzigsten.", officeSource));

[
  ["organise", "Er ___ eine Konferenz. (organisieren)", "organisiert"],
  ["copy", "Ich ___ die Dokumente. (kopieren)", "kopiere"],
  ["answer", "Du ___ die Fragen. (beantworten)", "beantwortest"],
  ["explain", "Sie ___ das Projekt. (erklären; she)", "erklärt"],
  ["show", "___ Sie die Präsentation. (zeigen; formal instruction)", "Zeigen"]
].forEach(([id, cue, answer]) => add(7, `work-${id}`, "Workplace verbs",
  "Fill in the conjugated verb.", cue, answer,
  "Match the verb ending to the subject. A formal instruction starts with the capitalised verb followed by Sie.", officeSource));

[
  ["on", "Die Tastatur liegt auf ___ Schreibtisch. (der Schreibtisch)", "dem"],
  ["wall", "Das Bild hängt an ___ Wand. (die Wand)", "der"],
  ["under", "Die Tasche steht unter ___ Tisch. (der Tisch)", "dem"],
  ["next", "Die Maus liegt neben ___ Tastatur. (die Tastatur)", "der"],
  ["window", "Die Pflanze steht vor ___ Fenster. (das Fenster)", "dem"],
  ["shelf", "Die Bücher stehen ___ Regal. (in + dem)", "im"],
  ["plural", "Das Handy steht vor ___ Büchern. (die Bücher)", "den"],
  ["between", "Das Regal steht zwischen der Tür und ___ Schreibtisch. (der Schreibtisch)", "dem"]
].forEach(([id, cue, answer]) => add(7, `location-${id}`, "Location and dative",
  "Fill in the definite article or contraction for the location.", cue, answer,
  "A fixed location answers Wo? and takes the dative: dem, der, dem, den. in dem contracts to im.", locationSource));

[
  ["lie", "Die Tastatur ___ auf dem Schreibtisch. (liegen)", "liegt"],
  ["stand", "Die Bücher ___ im Regal. (stehen)", "stehen"],
  ["hang", "Das Bild ___ an der Wand. (hängen)", "hängt"]
].forEach(([id, cue, answer]) => add(7, `position-${id}`, "Position verbs",
  "Fill in the conjugated verb.", cue, answer,
  "Use liegen for a lying position, stehen for an upright position, and hängen for a hanging object. Match singular or plural.", locationSource));
add(7, "location-order", "Location word order", "Begin with Auf dem Tisch. Use every block and include a full stop.",
  "auf dem Tisch / stehen / eine Lampe", "Auf dem Tisch steht eine Lampe.",
  "The whole location phrase comes first. The conjugated verb stays second, followed by the subject.", locationSource);

export const chapterQuestions = questions;
