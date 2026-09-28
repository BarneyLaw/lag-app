import { gradeQuestion } from "./grading.js?v=7";
import { buildQuestionPool, createQuiz } from "./questions.js?v=7";
import { pathForView, viewForPath } from "./routing.js?v=7";
import { registerAppUpdates } from "./updates.js?v=7";

const SETTINGS_KEY = "klar-settings-v1";
const PROGRESS_KEY = "klar-progress-v1";

const elements = {
  setupForm: document.querySelector("#setupForm"),
  setupError: document.querySelector("#setupError"),
  poolCount: document.querySelector("#poolCount"),
  homeView: document.querySelector("#homeView"),
  quizView: document.querySelector("#quizView"),
  summaryView: document.querySelector("#summaryView"),
  totalAttempts: document.querySelector("#totalAttempts"),
  overallAccuracy: document.querySelector("#overallAccuracy"),
  questionPosition: document.querySelector("#questionPosition"),
  runningScore: document.querySelector("#runningScore"),
  progressBar: document.querySelector("#progressBar"),
  questionUnit: document.querySelector("#questionUnit"),
  questionTopic: document.querySelector("#questionTopic"),
  questionPrompt: document.querySelector("#questionPrompt"),
  questionCue: document.querySelector("#questionCue"),
  questionContext: document.querySelector("#questionContext"),
  questionAudioBlock: document.querySelector("#questionAudioBlock"),
  questionAudio: document.querySelector("#questionAudio"),
  audioStatus: document.querySelector("#audioStatus"),
  semesterNote: document.querySelector("#semesterNote"),
  conjugationNote: document.querySelector("#conjugationNote"),
  textAnswerBlock: document.querySelector("#textAnswerBlock"),
  conjugationBlock: document.querySelector("#conjugationBlock"),
  conjugationRows: document.querySelector("#conjugationRows"),
  verbMeaning: document.querySelector("#verbMeaning"),
  tableInstruction: document.querySelector("#tableInstruction"),
  answerForm: document.querySelector("#answerForm"),
  answerInput: document.querySelector("#answerInput"),
  answerButton: document.querySelector("#answerButton"),
  answerMark: document.querySelector("#answerMark"),
  feedbackPanel: document.querySelector("#feedbackPanel"),
  feedbackTitle: document.querySelector("#feedbackTitle"),
  feedbackPoints: document.querySelector("#feedbackPoints"),
  feedbackReason: document.querySelector("#feedbackReason"),
  correctionBlock: document.querySelector("#correctionBlock"),
  correctAnswer: document.querySelector("#correctAnswer"),
  answerTip: document.querySelector("#answerTip"),
  questionSource: document.querySelector("#questionSource"),
  quitQuiz: document.querySelector("#quitQuiz"),
  finalPercent: document.querySelector("#finalPercent"),
  finalPoints: document.querySelector("#finalPoints"),
  scoreRing: document.querySelector("#scoreRing"),
  summaryMessage: document.querySelector("#summaryMessage"),
  reviewList: document.querySelector("#reviewList"),
  reviewCount: document.querySelector("#reviewCount"),
  retryMissed: document.querySelector("#retryMissed"),
  newQuiz: document.querySelector("#newQuiz"),
  connectionStatus: document.querySelector("#connectionStatus")
};

const defaultProgress = { attempts: 0, points: 0, byEntry: {}, byQuestion: {} };
let progress = readStorage(PROGRESS_KEY, defaultProgress);
let activeQuiz = [];
let activeIndex = 0;
let activeScore = 0;
let answered = false;
let results = [];
let mode = "study";
let activeAnswerInput = elements.answerInput;

function readStorage(key, fallback) {
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(key) || "{}") };
  } catch {
    return { ...fallback };
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The quiz remains usable when storage is blocked.
  }
}

function selectedValues(name) {
  return [...elements.setupForm.querySelectorAll(`input[name="${name}"]:checked`)].map(
    (input) => input.value
  );
}

function currentSettings() {
  return {
    units: selectedValues("unit").map(Number),
    categories: selectedValues("category"),
    size: Number(elements.setupForm.elements.size.value),
    mode: elements.setupForm.elements.mode.value
  };
}

function restoreSettings() {
  const saved = readStorage(SETTINGS_KEY, {});
  if (saved.units) {
    elements.setupForm.querySelectorAll('input[name="unit"]').forEach((input) => {
      input.checked = saved.units.includes(Number(input.value));
    });
  }
  if (saved.categories) {
    elements.setupForm.querySelectorAll('input[name="category"]').forEach((input) => {
      input.checked = saved.categories.includes(input.value);
    });
  }
  if (saved.size) elements.setupForm.elements.size.value = String(saved.size);
  if (saved.mode) elements.setupForm.elements.mode.value = saved.mode;
}

function renderStats() {
  elements.totalAttempts.textContent = String(progress.attempts || 0);
  elements.overallAccuracy.textContent = progress.attempts
    ? `${Math.round((progress.points / progress.attempts) * 100)}%`
    : "Not available";
}

function updatePoolCount() {
  const settings = currentSettings();
  elements.semesterNote.hidden = !settings.categories.includes("semester");
  elements.conjugationNote.hidden = !settings.categories.includes("conjugation");
  const count = settings.units.length && settings.categories.length
    ? new Set(
      buildQuestionPool(settings.units, settings.categories).map((question) => question.familyId)
    ).size
    : 0;
  elements.poolCount.textContent = count.toLocaleString();
  elements.setupError.textContent = "";
}

function showView(view) {
  if (view !== "quiz") elements.questionAudio.pause();
  elements.homeView.hidden = view !== "home";
  elements.quizView.hidden = view !== "quiz";
  elements.summaryView.hidden = view !== "summary";
  document.body.classList.toggle("session-active", view !== "home");
  document.title = view === "quiz"
    ? "Klar Quiz"
    : view === "summary"
      ? "Klar Results"
      : "Klar German practice for LAG1201";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function navigateTo(view, { replace = false } = {}) {
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({ view }, "", pathForView(view));
  showView(view);
}

function syncViewFromLocation() {
  const view = viewForPath(window.location.pathname);
  const unavailableQuiz = view === "quiz" && !activeQuiz.length;
  const unavailableSummary = view === "summary" && !results.length;

  if (unavailableQuiz || unavailableSummary) {
    navigateTo("home", { replace: true });
    return;
  }
  showView(view);
}

function startQuiz(settings, suppliedQuestions, { replaceRoute = false } = {}) {
  if (!settings.units.length) {
    elements.setupError.textContent = "Choose at least one unit.";
    return;
  }
  if (!settings.categories.length) {
    elements.setupError.textContent = "Choose at least one question type.";
    return;
  }

  activeQuiz = suppliedQuestions || createQuiz({
    ...settings,
    entryStats: progress.byEntry || {},
    questionStats: progress.byQuestion || {},
    currentAttempt: progress.attempts || 0
  });
  if (!activeQuiz.length) {
    elements.setupError.textContent = "This selection has no available questions.";
    return;
  }

  mode = settings.mode;
  activeIndex = 0;
  activeScore = 0;
  results = [];
  saveStorage(SETTINGS_KEY, settings);
  navigateTo("quiz", { replace: replaceRoute });
  renderQuestion();
}

function renderQuestion() {
  const question = activeQuiz[activeIndex];
  answered = false;
  elements.questionPosition.textContent = `${activeIndex + 1} / ${activeQuiz.length}`;
  elements.runningScore.textContent = `${formatPoints(activeScore)} pts`;
  elements.runningScore.hidden = mode === "exam";
  elements.progressBar.style.width = `${(activeIndex / activeQuiz.length) * 100}%`;
  elements.questionUnit.textContent = `Unit ${question.unit}`;
  elements.questionTopic.textContent = question.topic;
  elements.questionPrompt.textContent = question.prompt;
  elements.questionCue.textContent = question.cue;
  elements.questionCue.classList.toggle("question-cue--passage", question.cue.length > 100);
  elements.questionContext.hidden = !question.context;
  elements.questionContext.textContent = question.context || "";
  // Release the previous recording on every card, including transitions to text.
  elements.questionAudio.pause();
  elements.questionAudio.removeAttribute("src");
  elements.questionAudioBlock.hidden = !question.audio;
  elements.audioStatus.textContent = "Play the recording. You can pause and replay it.";
  if (question.audio) elements.questionAudio.src = question.audio;
  elements.questionAudio.load();
  elements.answerInput.value = "";
  const isTable = question.answerKind === "conjugation-table";
  elements.answerInput.disabled = isTable;
  elements.textAnswerBlock.hidden = isTable;
  elements.conjugationBlock.hidden = !isTable;
  elements.conjugationRows.replaceChildren();
  if (isTable) renderConjugationInputs(question);
  elements.answerInput.removeAttribute("aria-invalid");
  elements.answerInput.inputMode = question.answerKind === "phone" ? "tel" : "text";
  elements.answerInput.className = "";
  elements.answerMark.textContent = "";
  elements.feedbackPanel.hidden = true;
  elements.feedbackPanel.className = "feedback-panel";
  elements.answerButton.textContent = mode === "exam" ? "Submit answer" : "Check answer";
  activeAnswerInput = isTable ? elements.conjugationRows.querySelector("input") : elements.answerInput;
  activeAnswerInput.focus({ preventScroll: true });
}

function renderConjugationInputs(question) {
  elements.verbMeaning.textContent = question.meaning;
  elements.tableInstruction.textContent = question.instruction;
  question.rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.scope = "row";
    const label = document.createElement("label");
    label.htmlFor = `conjugation-${index}`;
    label.textContent = row.person;
    th.append(label);
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.id = label.htmlFor;
    input.name = `form-${index}`;
    input.type = "text";
    input.lang = "de";
    input.spellcheck = false;
    input.autocomplete = "off";
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("aria-describedby", "tableInstruction");
    const feedback = document.createElement("small");
    feedback.id = `form-feedback-${index}`;
    feedback.className = "form-feedback";
    feedback.hidden = true;
    td.append(input, feedback);
    tr.append(th, td);
    elements.conjugationRows.append(tr);
  });
}

function showConjugationFeedback(grade) {
  [...elements.conjugationRows.querySelectorAll("tr")].forEach((tr, index) => {
    const row = grade.rows[index];
    const input = tr.querySelector("input");
    const feedback = tr.querySelector("small");
    input.disabled = true;
    input.classList.add(`answer--${row.status}`);
    input.setAttribute("aria-describedby", feedback.id);
    feedback.hidden = false;
    feedback.textContent = row.status === "correct" ? "Correct"
      : `${row.status === "partial" ? "Partial" : "Incorrect"}: ${row.answer}. ${row.reason}`;
  });
}

function recordProgress(question, grade) {
  progress.attempts = (progress.attempts || 0) + 1;
  progress.points = (progress.points || 0) + grade.score;
  const item = progress.byEntry[question.entryId] || { attempts: 0, points: 0 };
  item.attempts += 1;
  item.points += grade.score;
  item.lastSeenAt = progress.attempts;
  progress.byEntry[question.entryId] = item;
  progress.byQuestion ||= {};
  const questionItem = progress.byQuestion[question.id] || { attempts: 0, points: 0 };
  questionItem.attempts += 1;
  questionItem.points += grade.score;
  questionItem.lastSeenAt = progress.attempts;
  progress.byQuestion[question.id] = questionItem;
  saveStorage(PROGRESS_KEY, progress);
}

function submitAnswer() {
  const question = activeQuiz[activeIndex];
  const isTable = question.answerKind === "conjugation-table";
  const submitted = isTable
    ? [...elements.conjugationRows.querySelectorAll("input")].map((input) => input.value)
    : elements.answerInput.value;
  const grade = gradeQuestion(submitted, question);
  if (!isTable && !submitted.trim()) {
    elements.answerInput.focus();
    elements.answerInput.setAttribute("aria-invalid", "true");
    return;
  }

  elements.answerInput.removeAttribute("aria-invalid");
  activeScore += grade.score;
  results.push({ question, submitted, grade });
  recordProgress(question, grade);

  if (mode === "exam") {
    advanceQuiz();
    return;
  }

  answered = true;
  if (isTable) showConjugationFeedback(grade);
  elements.answerInput.disabled = true;
  elements.answerInput.classList.add(`answer--${grade.status}`);
  elements.answerMark.textContent = grade.status === "correct" ? "OK" : grade.status === "partial" ? "1/2" : "X";
  elements.feedbackPanel.hidden = false;
  elements.feedbackPanel.classList.add(`feedback-panel--${grade.status}`);
  elements.feedbackTitle.textContent = grade.status === "correct"
    ? "Genau richtig"
    : grade.status === "partial"
      ? "Almost. Partial credit"
      : "Not quite";
  elements.feedbackPoints.textContent = `+${formatPoints(grade.score)}`;
  elements.feedbackReason.textContent = grade.reason;
  elements.correctAnswer.textContent = isTable ? "See corrections in the table above." : question.answers[0];
  elements.answerTip.textContent = question.tip;
  elements.questionSource.textContent = `Source: ${question.source}`;
  elements.answerButton.textContent = activeIndex === activeQuiz.length - 1 ? "See results" : "Next question";
  elements.answerButton.focus({ preventScroll: true });
}

function advanceQuiz() {
  if (activeIndex < activeQuiz.length - 1) {
    activeIndex += 1;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  const percent = Math.round((activeScore / activeQuiz.length) * 100);
  elements.finalPercent.textContent = `${percent}%`;
  elements.finalPoints.textContent = `${formatPoints(activeScore)} / ${activeQuiz.length} points`;
  elements.scoreRing.style.setProperty("--score", `${percent * 3.6}deg`);
  elements.summaryMessage.textContent = percent >= 90
    ? "Strong recall. Review the small details once more before the test."
    : percent >= 70
      ? "A solid base. Retry the forms that lost points while the corrections are fresh."
      : "Focus on a smaller unit or question type, then repeat the missed forms.";
  renderReview();
  renderStats();
  navigateTo("summary", { replace: true });
}

function renderReview() {
  const missed = results.filter((result) => result.grade.score < 1);
  elements.reviewCount.textContent = `${missed.length} to review`;
  elements.retryMissed.hidden = missed.length === 0;
  elements.reviewList.replaceChildren();

  const displayResults = missed.length ? missed : results;
  displayResults.forEach(({ question, submitted, grade }) => {
    const item = document.createElement("article");
    item.className = `review-item review-item--${grade.status}`;
    const heading = document.createElement("div");
    heading.innerHTML = `<span>Unit ${question.unit}: ${question.topic}</span><strong>${grade.score === 1 ? "Correct" : grade.score ? "Partial" : "Incorrect"}</strong>`;
    const cue = document.createElement("p");
    cue.textContent = question.cue;
    const answers = document.createElement("dl");
    const yourTerm = document.createElement("dt");
    yourTerm.textContent = "Your answer";
    const yourAnswer = document.createElement("dd");
    yourAnswer.textContent = submitted;
    const correctTerm = document.createElement("dt");
    correctTerm.textContent = "Correct";
    const correct = document.createElement("dd");
    correct.textContent = question.answers[0];
    answers.append(yourTerm, yourAnswer, correctTerm, correct);
    const tip = document.createElement("small");
    tip.textContent = question.tip;
    const instruction = document.createElement("p");
    instruction.textContent = question.prompt;
    item.append(heading, instruction);
    if (question.context) {
      const context = document.createElement("p");
      context.className = "question-context";
      context.textContent = question.context;
      item.append(context);
    }
    const source = document.createElement("small");
    source.className = "review-source";
    source.textContent = `Source: ${question.source}`;
    item.append(cue);
    if (question.answerKind === "conjugation-table") item.append(conjugationReview(question, grade));
    else item.append(answers);
    item.append(tip, source);
    elements.reviewList.append(item);
  });
}

function conjugationReview(question, grade) {
  const table = document.createElement("table");
  table.className = "conjugation-table conjugation-review";
  table.lang = "de";
  const caption = document.createElement("caption");
  caption.textContent = `${question.verb}: your forms and corrections`;
  const head = document.createElement("thead");
  const header = document.createElement("tr");
  head.append(header);
  ["Person", "Your answer", "Correct form"].forEach((title) => {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = title;
    header.append(th);
  });
  const body = document.createElement("tbody");
  grade.rows.forEach((row) => {
    const tr = document.createElement("tr");
    const person = document.createElement("th");
    person.scope = "row";
    person.textContent = row.person;
    const submitted = document.createElement("td");
    submitted.textContent = row.submitted || "Not answered";
    const status = document.createElement("small");
    status.textContent = row.status === "correct" ? "Correct" : row.status === "partial" ? "Partial" : "Incorrect";
    status.className = "form-feedback";
    submitted.append(status);
    const correct = document.createElement("td");
    correct.textContent = row.answer;
    tr.className = `answer--${row.status}`;
    tr.append(person, submitted, correct);
    body.append(tr);
  });
  table.append(caption, head, body);
  return table;
}

function formatPoints(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0$/, "");
}

elements.setupForm.addEventListener("change", () => {
  updatePoolCount();
  saveStorage(SETTINGS_KEY, currentSettings());
});
document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    const categories = button.dataset.preset === "vocabulary" ? ["nouns", "verbs", "other"] : [button.dataset.preset];
    elements.setupForm.querySelectorAll('input[name="category"]').forEach((input) => {
      input.checked = categories.includes(input.value);
    });
    updatePoolCount();
    saveStorage(SETTINGS_KEY, currentSettings());
  });
});
elements.questionAudio.addEventListener("error", () => {
  if (!elements.questionAudioBlock.hidden) {
    elements.audioStatus.textContent = "The recording could not load. Reconnect and reload the app to cache the audio.";
  }
});
elements.setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  startQuiz(currentSettings());
});
elements.answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (answered) advanceQuiz();
  else submitAnswer();
});
elements.quitQuiz.addEventListener("click", () => navigateTo("home", { replace: true }));
elements.newQuiz.addEventListener("click", () => navigateTo("home", { replace: true }));
elements.retryMissed.addEventListener("click", () => {
  const missedQuestions = results
    .filter((result) => result.grade.score < 1)
    .map((result) => result.question);
  startQuiz(currentSettings(), missedQuestions, { replaceRoute: true });
});
elements.answerForm.addEventListener("focusin", (event) => {
  if (event.target.matches('input[type="text"]')) activeAnswerInput = event.target;
});
document.querySelectorAll("[data-character]").forEach((button) => {
  button.addEventListener("click", () => {
    if (activeAnswerInput.disabled) return;
    const start = activeAnswerInput.selectionStart ?? activeAnswerInput.value.length;
    const end = activeAnswerInput.selectionEnd ?? start;
    activeAnswerInput.setRangeText(button.dataset.character, start, end, "end");
    activeAnswerInput.focus();
  });
});

function updateConnectionStatus() {
  const label = elements.connectionStatus.querySelector("span:last-child");
  label.textContent = navigator.onLine ? "Ready offline" : "Offline mode";
  elements.connectionStatus.classList.toggle("connection--offline", !navigator.onLine);
}

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);
window.addEventListener("popstate", syncViewFromLocation);

// A worker update cannot replace JavaScript already imported by this document.
// Reload setup automatically; offer a reload during a quiz so answers aren't lost.
registerAppUpdates({
  serviceWorker: navigator.serviceWorker,
  isPracticing: () => viewForPath(window.location.pathname) !== "home",
  reload: () => window.location.reload(),
  showUpdate: () => { document.querySelector("#appUpdate").hidden = false; }
});
document.querySelector("#reloadApp").addEventListener("click", () => window.location.reload());

restoreSettings();
updatePoolCount();
renderStats();
updateConnectionStatus();
syncViewFromLocation();
