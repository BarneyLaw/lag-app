# Curriculum and source map

Klar currently covers the July 2026 LAG1201 *Das Leben A1* Units 0-4.
The bank contains 368 glossary entries, 78 grammar drills and 44 semester-test
items. Sampling groups related items, so the number available in one quiz is
smaller than the number of question variants.

| Unit | Title | Glossary entries | Grammar drills | Semester items |
| --- | --- | ---: | ---: | ---: |
| 0 | Willkommen! | 90 | 14 | 4 |
| 1 | Sommerkurs in Leipzig | 43 | 24 | 9 |
| 2 | Möller oder Müller? | 67 | 4 | 7 |
| 3 | Arbeiten im Café | 74 | 10 | 9 |
| 4 | Lecker essen! | 94 | 26 | 15 |

## Locating the sources

The workspace shortcut `LAG1201 [2610] (94846) - Shortcut.lnk` points to the
synced Canvas course folder. Its relevant subfolders are:

- `Textbook and Accompanying Resources`: July 2026 glossary workbook, glossary
  guide, textbook Unit 0-1 scan and textbook answer keys.
- `Einheit 0`, `Einheit 1`, `Einheit 4`: teaching sheets and their `_LS` solutions.
- `Einheit 0 bis Einheit 4`: cumulative worksheets, unit tests and solutions.
- `Sample Tests`: `German1_VT_Sample.pdf`, `German1_ST1_SamplePaper.pdf`, their
  `_LS` answer keys, and the two ST1 MP3 recordings.

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

- Nouns: German/English recall, article, plural, or singular-and-plural pairs.
- Verbs: infinitive translation in either direction. Conjugation belongs to
  grammar and semester practice.
- Other words: translation in either direction.

German singular and plural forms include the article. English common-noun cues
include `the`; proper names such as Switzerland do not. `X` means the glossary
does not list a singular or plural, not a claim that the form never exists in
German. The source's articles and meanings remain the course reference, even
where usage outside the glossary differs (for example language names normally
appear without an article after `sprechen`).

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
scheme. The 44 semester items form 34 distinct stimulus/item families, so a
50-question request is capped at 34 when only this category is selected.

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
