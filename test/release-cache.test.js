import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const origin = "https://klar.test";
const source = readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const release = /const CACHE_NAME = "klar-v(\d+)"/.exec(source)[1];
const urlOf = (request) => new URL(typeof request === "string" ? request : request.url, origin).href;
const disk = (url) => readFileSync(new URL(`..${new URL(url, origin).pathname === "/" ? "/index.html" : new URL(url, origin).pathname}`, import.meta.url));

/** Run the real worker against simulated HTTP and Cache Storage, with both stale. */
function installation({ failPath } = {}) {
  const events = new Map();
  const stores = new Map([
    ["klar-v3", new Map([[`${origin}/src/questions.js`, new Response("old engine")]])],
    ["another-app", new Map()]
  ]);
  const calls = { requests: [], skipped: 0, claimed: 0 };
  let offline = false;
  const fetch = async (input, options = {}) => {
    const url = urlOf(input);
    const cacheMode = options.cache || input.cache;
    calls.requests.push({ url, cacheMode });
    if (offline || new URL(url).pathname === failPath) throw new Error("network unavailable");
    // Simulate a browser retaining the old unversioned engine/glossary/HTML.
    if (cacheMode !== "reload") return new Response("stale HTTP cache");
    return new Response(disk(url));
  };
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
    open: async (name) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const entries = stores.get(name);
      return {
        match: async (request) => entries.get(urlOf(request))?.clone(),
        addAll: async (requests) => {
          const fetched = await Promise.all(requests.map(async (request) => [urlOf(request), await fetch(request)]));
          for (const [url, response] of fetched) entries.set(url, response);
        }
      };
    }
  };
  const self = {
    location: { origin },
    addEventListener: (name, callback) => events.set(name, callback),
    skipWaiting: async () => { calls.skipped++; },
    clients: { claim: async () => { calls.claimed++; } }
  };
  vm.runInNewContext(source, { self, caches, fetch, Request, Response, URL });
  return {
    calls, stores,
    goOffline: () => { offline = true; },
    lifecycle: (name) => {
      let completion;
      events.get(name)({ waitUntil: (promise) => { completion = promise; } });
      return completion;
    },
    request: (path, mode = "cors") => {
      let response;
      events.get("fetch")({ request: { url: new URL(path, origin).href, method: "GET", mode, headers: new Headers() },
        respondWith: (promise) => { response = promise; } });
      return response;
    }
  };
}

test("upgrading a stale installation refreshes the full shell before taking control", async () => {
  const app = installation();
  await app.lifecycle("install");
  assert.ok(app.calls.requests.length >= 15);
  assert.ok(app.calls.requests.every((request) => request.cacheMode === "reload"));
  assert.equal(app.calls.skipped, 1);
  await app.lifecycle("activate");
  assert.equal(app.calls.claimed, 1);
  assert.equal(app.stores.has("klar-v3"), false);
  assert.equal(app.stores.has("another-app"), true);
  assert.ok(app.stores.has(`klar-v${release}`));
});

test("failed installation leaves the previous release active", async () => {
  const app = installation({ failPath: "/src/data/glossary.js" });
  await assert.rejects(app.lifecycle("install"), /network unavailable/);
  assert.equal(app.calls.skipped, 0);
  assert.equal(app.calls.claimed, 0);
  assert.equal(app.stores.has("klar-v3"), true);
});

test("cached HTML and every module import use the same release, online and offline", async () => {
  const app = installation();
  await app.lifecycle("install");
  const html = await (await app.request("/quiz", "navigate")).text();
  assert.ok(html.includes(`/src/app.js?v=${release}`));
  assert.ok(html.includes(`/src/styles.css?v=${release}`));
  const cache = app.stores.get(`klar-v${release}`);
  for (const [url, response] of cache) {
    if (!new URL(url).pathname.endsWith(".js")) continue;
    assert.equal(new URL(url).search, `?v=${release}`, url);
    const code = await response.clone().text();
    for (const [, specifier] of code.matchAll(/from "([^"]+)"/g)) {
      const dependency = new URL(specifier, url);
      assert.equal(dependency.search, `?v=${release}`, dependency.href);
      assert.ok(cache.has(dependency.href), dependency.href);
    }
  }
  const fetchCount = app.calls.requests.length;
  app.goOffline();
  assert.equal(await (await app.request("/results", "navigate")).text(), html);
  assert.ok((await (await app.request(`/src/questions.js?v=${release}`)).text()).includes("semesterQuestions"));
  assert.equal(app.calls.requests.length, fetchCount);
});

test("quiz engine loaded from the upgraded offline cache generates all new selections", async () => {
  const app = installation();
  await app.lifecycle("install");
  await app.lifecycle("activate");
  app.goOffline();

  // Load actual served ES modules, recursively resolving imports from the worker
  // responses. Data URLs let Node execute that graph without a browser or bundler.
  const modules = new Map();
  async function moduleURL(url) {
    if (modules.has(url)) return modules.get(url);
    let code = await (await app.request(url)).text();
    for (const [, specifier] of [...code.matchAll(/from "([^"]+)"/g)]) {
      const dependency = await moduleURL(new URL(specifier, url).href);
      code = code.replace(`from "${specifier}"`, `from "${dependency}"`);
    }
    const encoded = `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
    modules.set(url, encoded);
    return encoded;
  }
  const engine = await import(await moduleURL(`${origin}/src/questions.js?v=${release}`));
  for (const unit of [0, 1, 4]) {
    for (const category of ["nouns", "verbs", "other", "grammar", "semester"]) {
      assert.ok(engine.buildQuestionPool([unit], [category]).length, `${unit}/${category}`);
      assert.ok(engine.createQuiz({ units: [unit], categories: [category], size: 20 }).length, `${unit}/${category}`);
    }
  }
  assert.equal(engine.createQuiz({ units: [0, 1, 2, 3, 4], categories: ["semester"], size: 20 }).length, 20);
});
