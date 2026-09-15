import { gradeAnswer } from "./grading.js";
import { buildQuestionPool, createQuiz } from "./questions.js";
import { pathForView, viewForPath } from "./routing.js";

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
  const count = settings.units.length && settings.categories.length
    ? new Set(
      buildQuestionPool(settings.units, settings.categories).map((question) => question.familyId)
    ).size
    : 0;
  elements.poolCount.textContent = count.toLocaleString();
  elements.setupError.textContent = "";
}

function showView(view) {
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
  elements.progressBar.style.width = `${(activeIndex / activeQuiz.length) * 100}%`;
  elements.questionUnit.textContent = `Unit ${question.unit}`;
  elements.questionTopic.textContent = question.topic;
  elements.questionPrompt.textContent = question.prompt;
  elements.questionCue.textContent = question.cue;
  elements.answerInput.value = "";
  elements.answerInput.disabled = false;
  elements.answerInput.className = "";
  elements.answerMark.textContent = "";
  elements.feedbackPanel.hidden = true;
  elements.feedbackPanel.className = "feedback-panel";
  elements.answerButton.textContent = "Check answer";
  elements.answerInput.focus({ preventScroll: true });
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
  const submitted = elements.answerInput.value;
  const grade = gradeAnswer(submitted, question.answers);
  if (!submitted.trim()) {
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
  elements.correctAnswer.textContent = question.answers[0];
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
    item.append(heading, cue, answers, tip);
    elements.reviewList.append(item);
  });
}

function formatPoints(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0$/, "");
}

elements.setupForm.addEventListener("change", updatePoolCount);
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
document.querySelectorAll("[data-character]").forEach((button) => {
  button.addEventListener("click", () => {
    const start = elements.answerInput.selectionStart ?? elements.answerInput.value.length;
    const end = elements.answerInput.selectionEnd ?? start;
    elements.answerInput.setRangeText(button.dataset.character, start, end, "end");
    elements.answerInput.focus();
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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));
}

restoreSettings();
updatePoolCount();
renderStats();
updateConnectionStatus();
syncViewFromLocation();
