import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Exercise the worker's real fetch handler with an offline cache and native
// Request/Response objects. No browser globals or network are needed.
function worker(cached = true) {
  const handlers = {};
  const context = vm.createContext({
    self: { location: { origin: "https://klar.test" }, addEventListener: (name, handler) => { handlers[name] = handler; } },
    caches: { open: async () => ({ match: async () => cached ? new Response(new Uint8Array([0, 1, 2, 3, 4, 5])) : undefined }) },
    fetch: async () => new Response("network"), URL, Response
  });
  vm.runInContext(readFileSync(new URL("../sw.js", import.meta.url), "utf8"), context);
  return async (range) => {
    let response;
    handlers.fetch({ request: new Request("https://klar.test/src/audio/st1-names.mp3", { headers: { range } }),
      respondWith: (result) => { response = result; } });
    return response;
  };
}

test("offline audio serves bounded, open-ended and suffix ranges", async () => {
  const fetch = worker();
  for (const [range, expected] of [["bytes=1-3", [1, 2, 3]], ["bytes=4-", [4, 5]], ["bytes=-2", [4, 5]], ["bytes=4-99", [4, 5]]]) {
    const response = await fetch(range);
    assert.equal(response.status, 206);
    assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], expected);
    assert.equal(response.headers.get("Content-Type"), "audio/mpeg");
  }
});

test("invalid audio ranges return 416 and uncached audio falls back to network", async () => {
  for (const range of ["bytes=9-", "bytes=3-1", "bytes=-", "bytes=-0", "bytes=0-1,3-4"]) {
    assert.equal((await worker()(range)).status, 416, range);
  }
  assert.equal(await (await worker(false)("bytes=0-")).text(), "network");
});
