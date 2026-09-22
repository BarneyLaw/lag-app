import test from "node:test";
import assert from "node:assert/strict";
import { registerAppUpdates } from "../src/updates.js";

function browser(practicing = false) {
  const events = new Map();
  const calls = { reload: 0, notice: 0, registration: null };
  const serviceWorker = {
    addEventListener: (type, callback) => events.set(type, callback),
    register: async (...args) => { calls.registration = args; }
  };
  registerAppUpdates({ serviceWorker, isPracticing: () => practicing,
    reload: () => calls.reload++, showUpdate: () => calls.notice++ });
  return { calls, takeControl: () => events.get("controllerchange")() };
}

test("worker takeover reloads setup once so old imported modules are replaced", () => {
  const b = browser();
  b.takeControl();
  b.takeControl();
  assert.equal(b.calls.reload, 1);
  assert.equal(b.calls.notice, 0);
  assert.deepEqual(b.calls.registration, ["/sw.js", { updateViaCache: "none" }]);
});

test("worker takeover preserves an active quiz or review and offers a reload", () => {
  const b = browser(true);
  b.takeControl();
  assert.equal(b.calls.reload, 0);
  assert.equal(b.calls.notice, 1);
});

test("app updates tolerate browsers without service worker support", () => {
  assert.doesNotThrow(() => registerAppUpdates({ serviceWorker: undefined }));
});
