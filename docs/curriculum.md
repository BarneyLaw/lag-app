# Curriculum and source map

Klar currently covers the July 2026 LAG1201 *Das Leben A1* Units 0-4.
The bank contains 368 glossary entries, 78 grammar drills and 174 semester-test
items. Sampling groups related items, so the number available in one quiz is
smaller than the number of question variants.

| Unit | Title | Glossary entries | Grammar drills | Semester items |
| --- | --- | ---: | ---: | ---: |
| 0 | Willkommen! | 90 | 14 | 6 |
| 1 | Sommerkurs in Leipzig | 43 | 24 | 21 |
| 2 | Möller oder Müller? | 67 | 4 | 23 |
| 3 | Arbeiten im Café | 74 | 10 | 48 |
| 4 | Lecker essen! | 94 | 26 | 76 |

## Locating the sources

The workspace shortcut `LAG1201 [2610] (94846) - Shortcut.lnk` points to the
synced Canvas course folder. Its relevant subfolders are:

- `Textbook and Accompanying Resources`: July 2026 glossary workbook, glossary
  guide, textbook Unit 0-1 scan and textbook answer keys.
- `Einheit 0`, `Einheit 1`, `Einheit 4`: teaching sheets and their `_LS` solutions.
- `Einheit 0 bis Einheit 4`: cumulative worksheets, unit tests and solutions.
- `Sample Tests`: `German1_VT_Sample.pdf`, `German1_ST1_SamplePaper.pdf`, their
  `_LS` answer keys, and the two ST1 MP3 recordings.
- `Custom ST1/Markdown`: five newly authored papers, `ST1_Practice_01.md` through
  `ST1_Practice_05.md`, and their separate `_Answers.md` keys. The pack README
  confirms these notes have the same content as the printable PDFs.

The parent workspace also contains
`0001100000220 Probeeinheiten Das Leben A1_online.pdf`, including the textbook's
Unit 4 pages. Page references in question feedback are **printed textbook page
numbers**. The source PDFs are reference material and are not copied into the app.

## Vocabulary

`src/data/glossary.js` is generated from the workbook's `Vocabulary` sheet.
Do not manually edit this generated file. Each entry keeps its source row, unit,
word class, German form, plural/conjugation, English gloss and example.
IDs such as `u4-r323` preserve the original workbook row, including when earlier
chapters are added. Existing Unit 2-3 entries and their IDs were preserved.

Rebuild with the actual workbook path:

```powershell
python scripts/build_glossary.py `
  "<course folder>/Textbook and Accompanying Resources/DasLeben_A1_Glossary_Unit0-Unit8_July2026.xlsx" `
  "src/data/glossary.js" --units 0 1 2 3 4
```

The importer defaults to Units 0-4. `scripts/inspect_xlsx.py` reads the workbook
using the Python standard library; no Excel installation is required.

The vocabulary formats follow the sample vocabulary test:

- Nouns: German/English recall, singular article, plural, or singular-and-plural pairs.
- Verbs: infinitive translation in either direction. Conjugation belongs to
  grammar and semester practice.
- Other words: translation in either direction.

German singular and plural forms include the article. English common-noun cues
include `the`; proper names such as Switzerland do not. `X` means the glossary
does not list a singular or plural, not a claim that the form never exists in
German. The source's articles and meanings remain the course reference, even
where usage outside the glossary differs (for example language names normally
appear without an article after `sprechen`).

Article-only plural cards with the automatic answer `die` are omitted. Complete
plural recall still requires the noun and its article. Grammar tasks testing
article omission, including the absent plural indefinite article, remain.

The question engine interprets source notation without changing the raw import:

- An empty singular with a listed plural, as with Pommes, is plural-only.
  `die Leute` is also plural-only although the workbook puts it in the singular
  column.
- `die Pizzas / die Pizzen` accepts either plural.
- `gern(e)` accepts `gern` or `gerne`; `die Pommes (Frites)` accepts either form.
- Context notes in verb headwords are not part of the typed infinitive.
- Comma-separated gender forms such as `welcher, welches, welche` explicitly
  ask for all three forms in that order.

## Grammar coverage

`src/data/grammar.js` retains the original Unit 2-3 drills and imports
`src/data/foundations.js` for the added chapters.

| Chapter | Topics | Main references |
| --- | --- | --- |
| 0 | Greetings, classroom requests, basic verb forms, noun gender | Start pp. 12-15; E0 greetings; Genus und Plural |
| 1 | Pronouns, present tense, origin/location, country phrases, questions and statements | pp. 18-21, 26-27; E1 Personalpronomen; verb-position sheets |
| 4 | Food orders, nominative/accusative, articles, nicht/kein-, restaurant verbs, inversion | pp. 55-56, 60; Im Restaurant exercises 3-5; E4 Negation solutions |

Each question has a source and a short reasoning tip. Country phrases such as
`aus der Schweiz` are taught as the textbook's fixed expressions, rather than
introducing a general dative drill outside the chapter scope.

## Semester Test 1 practice

`src/data/semester.js` is a separate category. The preset selects only this
category while preserving the chosen units and feedback mode. Select all five
units for all seven sections.

| Section | Sample reference | Implementation |
| --- | --- | --- |
| Listening | I.A and I.B, p. 1 | Original name and telephone recordings; individual prompts |
| Articles | II.A, pp. 1-2 | Nominative/accusative and article omission |
| Conjugation | II.B, p. 2 | Original six-gap verb bank plus chapter-filtered drills |
| Questions | II.C, p. 2 | Question formation with explicit pronouns/names |
| Negation | II.D, p. 3 | Complete negative answers using nicht or kein- |
| Syntax | II.E, p. 3 | Sentence completion, conjugation and word order |
| Reading | III, p. 4 | Four original profile sets, three tasks each, matching names or Niemand |

The sample paper includes open questions with many possible answers. App prompts
specify the person, article type or sentence opening to make exact grading fair.
Reading passages are original adaptations of the sample's format, not
transcriptions of its image-based texts. Their tasks include multiple matching
people, negation and distinguishing origin from residence.

Semester `unit` records the chapter needed for the skill. A chapter 0 noun in an
accusative task is classified as Unit 4. Selecting Unit 0 alone therefore does
not introduce accusative questions.

Audio provenance:

- `src/audio/st1-names.mp3`: `German1_ST1_Sample_Audio1.mp3`.
- `src/audio/st1-phones.mp3`: `German1_ST1_Sample_Audio2.mp3`.

These recordings total about 3 MB and are cached with the app. Only one question
from a given recording or reading passage is sampled per quiz to avoid revealing
answers through repeated stimuli. Subsequent quizzes rotate to unused variants.

This is randomized preparation, not an official full-length or timed test.
Every card, including the six-gap verb bank, has a maximum of one app point.
The app's partial-credit rules are practice feedback, not the official marking
scheme. The 174 semester items form 138 distinct stimulus/item families, so
a 50-question semester request can now contain 50 distinct families.

### Five custom written papers

`src/data/custom-semester.js` adds 130 cards from all five papers: 30 article
tasks, five complete six-gap verb banks, 20 question-formation tasks, 25 negatives,
20 syntax tasks and 30 reading rows. The six verb gaps remain together to preserve
the shared eight-verb bank. Each paper's six reading rows share one family, so
only one row per passage appears in a quiz. There is no new listening material.

The importer reads both the tasks and their answer keys, preserves the reading
texts and reasoning, and assigns the chapter required by each task. Question
formation has explicit openings and subjects to avoid unbounded paraphrases;
negation and syntax accept reviewed alternatives, including the keys' pronoun
alternatives. This remains exact-answer practice, not semantic grading.

Four definite-plural article tasks (sample II.A.6 and custom 01/03/05 A.6) are
adapted to singular subjects to test gender. Their feedback explains the
adaptation. Zero-article tasks remain, including custom 02/04 A.5. The repeated
`Woher kommt ihr?` question shares the original sample's family across papers,
so it cannot repeat in one quiz or bypass the family cooldown.

Regenerate after editing the source notes; keep reviewed adaptations in the script:

```powershell
python scripts/build_custom_semester.py "<course folder>/Custom ST1/Markdown"
```

The generated module is cached offline with the rest of the curriculum. Stable
IDs include the paper, section and item number. Tests audit coverage of all five
papers, answer keys, duplicates, exceptions and shared reading stimuli.

## Adding content

1. Read the actual exercise and answer key. Check visual content when text
   extraction loses images, tables or task context.
2. Keep vocabulary in the workbook import and authored drills in their data
   modules. Assign the chapter required to solve the task.
3. Use a stable descriptive ID, a precise instruction, every allowed answer,
   a reasoning tip and the source exercise/page.
4. Use a shared `familyId` for variants of the same stimulus. Do not use a shared
   family merely because two independent tasks test the same grammar rule.
5. Add any new imported modules/media to `APP_SHELL`. Increment the worker cache
   version and every browser `?v=` import/script/style URL together so installed
   clients receive a consistent release. See the architecture update procedure.
6. Run `npm test` and `npm run check`. Include regression cases for new answer
   notation or question formats and verify the displayed quiz when a browser is
   available.
