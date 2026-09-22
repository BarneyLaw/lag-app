# Architecture and established decisions

Klar uses native browser JavaScript modules, HTML and CSS. There is no build
step, application server, runtime dependency or remote grading service. NGINX
serves the production app; a service worker caches code, content and audio.

## Decisions recovered from the earlier app work

These constraints came from the September 12-15, 2026 development conversation
and are preserved by the current implementation:

- Focus on LAG1201 curriculum and assessment preparation.
- Support desktop and mobile browsers, offline use and a possible future app
  wrapper. Speech recognition and WASM embeddings remain future work.
- Keep quiz setup, active practice and results on separate routes.
- Make the question prominent and readable. Avoid decorative punctuation and
  em dashes in UI copy.
- Require exact German characters and noun capitalisation for full credit;
  give partial credit for minor mistakes.
- Include articles with German noun forms, including `die` in plurals.
- Vocabulary verbs test infinitives, not conjugation variants.
- Cover the full vocabulary list. Do not repeatedly show translation,
  retranslation, article and gender counterparts from the same family in a quiz.
- Favor unseen and older items across quizzes. Do not add a persistent
  "words to revisit" list that continually pushes the same words back.
- Preserve the existing Kubernetes/GitHub Actions/Argo CD deployment workflow.

## Module responsibilities

| Module | Responsibility |
| --- | --- |
| `src/app.js` | Forms, routes, quiz lifecycle, audio/context rendering, feedback and browser storage |
| `src/questions.js` | Vocabulary variants, family grouping, filtering and sampling |
| `src/grading.js` | Exact/partial text grading and structured semester answers |
| `src/routing.js` | Pure mapping between `/`, `/quiz`, `/results` and views |
| `src/updates.js` | Worker update registration and safe page refresh after takeover |
| `src/data/glossary.js` | Generated workbook entries |
| `src/data/grammar.js`, `foundations.js` | Authored grammar drills |
| `src/data/semester.js` | Semester sections and their source/stimulus metadata |
| `sw.js` | Offline shell, navigation fallback and MP3 byte-range responses |

## Question contract

After `buildQuestionPool(units, categories)`, every question has:

```js
{
  id,          // Stable question-variant ID; progress.byQuestion key
  entryId,     // Glossary entry or authored-question ID; progress.byEntry key
  familyId,    // At most one selected per quiz
  unit,        // Numeric chapter, including 0
  category,    // nouns | verbs | other | grammar | semester
  format,      // Vocabulary format, grammar, or semester section
  topic, prompt, cue,
  answers,     // Nonempty strings; first answer is displayed in feedback
  tip, source,
  // Optional semester fields:
  section,     // Listening | Articles | Conjugation | Questions | Negation | Syntax | Reading
  context,     // Plain text passage or verb bank, rendered with preserved newlines
  audio,       // Same-origin MP3 path
  answerKind   // text (default) | phone | name-set | list
}
```

Render passages with `textContent`, never inject their text as HTML. The UI does
not show answers or source tips before submission. Exam mode also hides the
running score, which could otherwise reveal whether the previous answer matched.

## Selection and repetition

`createQuiz` first filters by **both** selected units and categories. It groups
variants by entry, then entries by family, and caps quiz length to the available
families. Vocabulary counterparts such as Zusteller/Zustellerin, nominalized
Studierende forms, and Hobbykoch/Hobbyköchin share a family. Identical headwords
with contextual senses also share a family. Umlaut folding is used only to match
gender stems, not to merge unrelated vocabulary.

The sampler allocates slots proportionally by family count across categories.
Semester sections each get a sampling bucket, so a large enough quiz includes
all available sections before allocating repeats. A 20-card semester quiz with
all units covers all seven sections; a chapter filter or a very short quiz may
have fewer sections.

Within each bucket, families are prioritized as follows:

1. Completely unseen families.
2. Older families containing an unseen entry (for example the other gender).
3. Older, previously seen families.
4. Recently shown families, within the default 40-answer cooldown.

Ties use least-recent exposure, then attempt count, after a Fisher-Yates shuffle.
Within a chosen family, the least-used entry and least-used question variant are
selected. Final ordering discourages adjacent questions of the same category,
format or unit. Cooldown is a preference: small pools remain usable. Family
uniqueness within a quiz is an absolute constraint.

`random` is injectable for deterministic tests. Sampling does not depend on
incorrect-answer scores; retries are explicitly chosen from the results page.

## Grading

`gradeAnswer(input, answers)` preserves the original policy:

| Match | Points |
| --- | ---: |
| Exact after Unicode NFC and whitespace normalization | 1 |
| Capitalisation only | 0.75 |
| ae/oe/ue/ss character substitution | 0.5 |
| One edit, or two for answers of at least 16 characters | 0.5 |
| Other mismatch | 0 |

`gradeQuestion(input, question)` adds format-specific handling:

- `phone`: grouping spaces ignored, leading zeros retained; any wrong digit is
  incorrect, not a spelling typo.
- `name-set`: comma-separated names may be in any order; duplicates or missing
  people are incorrect. A capitalisation-only error retains 0.75 credit.
- `list`: comma spacing is normalized, but item order and exact word forms
  still matter.
- Other answers use the original grader unchanged, including its partial-credit
  heuristics. This is not a semantic or official-exam marking engine.

## Persistence and offline behavior

`klar-settings-v1` stores selected units/categories, size and feedback mode.
Existing saved selections are preserved when new units become available.
`klar-progress-v1` stores aggregate points/attempts and per-entry/per-question
exposure. The schema and old content IDs remain unchanged. Storage is local to
the device/browser; blocked storage does not prevent a quiz.

Quiz contents and in-progress answers are kept in memory. Refreshing `/quiz` or
`/results` without a live session returns to setup. This behavior is unchanged.

The worker precaches all imports and the two recordings. Its audio branch serves
HTTP 206 byte ranges from complete cached MP3s, supporting offline playback and
seeking. Partial network responses are never stored as complete audio files.
The first visit must complete installation while online before the app is
available offline. Audio is paused when switching cards or leaving the quiz.

### Updating an installed app

Release 5 fixes a gap in the original update strategy: independently fetching
unversioned HTML, JavaScript and data could pair the new chapter/category controls
with the earlier Unit 2-3 question engine. That engine returns zero for Units 0,
1, 4 and the semester category. An activated service worker also cannot replace
modules that an already open document has imported.

Every application module import and the HTML script/style URLs now include the
same release query (`?v=5`). Installation fetches the complete shell using
`Request.cache: "reload"`, bypassing stale HTTP-cache responses, before calling
`skipWaiting`. The active worker serves both HTML and modules from its own
completed release cache; it does not consult another release's cache. Activation
removes only old `klar-` caches and waits for cleanup before claiming clients.

Worker takeover reloads the setup screen once. During a quiz or results review,
it displays a reload action instead of discarding in-memory answers. Setup
selections are saved on change and on preset selection, so an automatic reload
preserves them. Progress storage is never cleared. Unsupported or blocked
service workers do not prevent online use.

When releasing changed browser code or data, bump the worker cache version,
all `?v=` import specifiers and the HTML script/style URLs together. Include new
modules in `APP_SHELL`. The release-cache tests verify this agreement and load
the actual engine from an upgraded, offline cache to test the new selections.
See [MDN's worker update lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
for the distinction between worker activation and an existing page's lifetime.

## Verification

`npm test` runs Node's built-in test runner, including:

- Existing Unit 2-3 grading, routing and coverage regressions.
- Unit/category boundaries, unique IDs, usable answers and source references.
- New glossary notation, plural-only nouns and gender-family cases.
- Every declared answer grading correctly.
- Coverage of all 368 vocabulary entries over seeded practice sessions.
- Seven-section semester sampling and no repeated audio/reading stimuli.
- Structured grading and offline audio ranges through the worker fetch handler.
- Upgrade from stale HTTP/worker caches, failed installation, consistent module
  versions, offline quizzes after upgrade, and safe takeover during practice.

`npm run check` parses all browser/data modules and the service worker.
For browser QA, check a fresh setup and old saved settings, chapter-only quizzes,
both presets, Study/Exam flows, reading layout on a narrow screen, audio playback,
offline playback/seek, result sources and explicit retries. A passing Node suite
does not establish visual layout or audible playback in a real browser.
