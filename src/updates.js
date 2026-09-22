/**
 * Refresh an open setup page when a new worker takes control. Import graphs are
 * fixed for a document's lifetime, so activating the worker alone is not enough.
 * Keep active quizzes/results intact and offer an explicit reload instead.
 * Inject browser boundaries so upgrade behavior can be tested without a DOM.
 */
export function registerAppUpdates({ serviceWorker, isPracticing, reload, showUpdate }) {
  if (!serviceWorker) return;
  let handled = false;
  serviceWorker.addEventListener("controllerchange", () => {
    if (handled) return;
    handled = true;
    if (isPracticing()) showUpdate();
    else reload();
  });
  // Applies to the worker script; versioned imports and the install handler take
  // care of HTTP caches for application modules and curriculum data separately.
  serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => {
    // Content remains usable online if this browser blocks service workers.
  });
}
